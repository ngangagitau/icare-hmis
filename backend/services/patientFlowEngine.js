/**
 * iCare HMIS - Patient Flow Intelligence Engine
 * 
 * Capabilities:
 * - Real-time queue monitoring with live wait times from actual timestamps
 * - Intelligent prioritization recommendations with human confirmation workflow
 * - Waiting-time metrics and department threshold tracking
 * - Long-wait alerts and congestion detection
 * - Staff workload imbalance analysis
 * - Patient journey duration tracking and flow analytics
 */

const { query } = require('../db/pg');

const DEFAULT_DEPARTMENT_THRESHOLDS = {
  opd: { target: 30, warning: 45, critical: 60, congestionThreshold: 15 },
  triage: { target: 15, warning: 25, critical: 35, congestionThreshold: 10 },
  doctor: { target: 25, warning: 40, critical: 55, congestionThreshold: 12 },
  lab: { target: 20, warning: 35, critical: 50, congestionThreshold: 10 },
  pharmacy: { target: 15, warning: 25, critical: 40, congestionThreshold: 15 },
  radiology: { target: 30, warning: 45, critical: 60, congestionThreshold: 8 },
};

/**
 * Fetch active department configurations or use defaults
 */
async function getDepartmentConfigs() {
  try {
    const res = await query(`SELECT * FROM department_flow_configs`);
    const map = { ...DEFAULT_DEPARTMENT_THRESHOLDS };
    for (const row of res.rows) {
      map[row.department.toLowerCase()] = {
        target: Number(row.target_wait_minutes || 30),
        warning: Number(row.warning_wait_minutes || 45),
        critical: Number(row.critical_wait_minutes || 60),
        congestionThreshold: Number(row.congestion_patient_threshold || 10),
      };
    }
    return map;
  } catch {
    return DEFAULT_DEPARTMENT_THRESHOLDS;
  }
}

/**
 * Calculate recommended priority for a queue entry based on clinical criteria
 */
function evaluateRecommendedPriority(entry, departmentThresholds) {
  const waitMinutes = entry.waitMinutes || 0;
  const riskScore = Number(entry.risk_score || 0);
  const currentPriority = entry.priority || 'Normal';
  const deptConfig = departmentThresholds[entry.department.toLowerCase()] || { warning: 45, critical: 60 };

  const reasons = [];
  let recommended = 'Normal';

  // 1. Critical risk score (>= 80)
  if (riskScore >= 80) {
    recommended = 'Emergency';
    reasons.push(`Critical risk score (${riskScore}/100) indicates acute clinical danger`);
  }
  // 2. High risk score (60-79)
  else if (riskScore >= 60) {
    recommended = 'Urgent';
    reasons.push(`High risk score (${riskScore}/100) warrants accelerated care`);
  }

  // 3. Waiting time exceeds critical threshold
  if (waitMinutes >= deptConfig.critical) {
    if (recommended !== 'Emergency') recommended = 'Urgent';
    reasons.push(`Wait time (${waitMinutes}m) exceeds department threshold (${deptConfig.critical}m)`);
  }

  // 4. Existing priority preservation
  if (currentPriority === 'Emergency') {
    recommended = 'Emergency';
  } else if (currentPriority === 'Urgent' && recommended === 'Normal') {
    recommended = 'Urgent';
  }

  const isAdjustmentRecommended = recommended !== currentPriority;

  return {
    recommendedPriority: recommended,
    currentPriority,
    isAdjustmentRecommended,
    reasons,
    reasonSummary: reasons.join('; ') || 'Standard queue priority applies',
  };
}

/**
 * Get real-time queue entries enriched with wait times, risk scores, and priority recommendations
 */
async function getRealTimeQueueFlow(departmentFilter = null) {
  const configs = await getDepartmentConfigs();

  const where = ["qe.status IN ('Waiting', 'In Progress')"];
  const params = [];

  if (departmentFilter && departmentFilter !== 'all') {
    params.push(departmentFilter.toLowerCase());
    where.push(`qe.department = $${params.length}`);
  }

  const result = await query(
    `
    SELECT
      qe.*,
      u.first_name AS provider_first_name,
      u.last_name AS provider_last_name,
      p.date_of_birth,
      p.gender,
      p.phone,
      p.blood_type,
      pra.score AS latest_risk_score,
      pra.risk_level AS latest_risk_level
    FROM queue_entries qe
    LEFT JOIN users u ON u.id = qe.assigned_to
    LEFT JOIN patients p ON p.id = qe.patient_id
    LEFT JOIN LATERAL (
      SELECT score, risk_level 
      FROM patient_risk_assessments 
      WHERE patient_id = qe.patient_id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) pra ON true
    WHERE ${where.join(' AND ')}
    ORDER BY
      CASE qe.priority 
        WHEN 'Emergency' THEN 0 
        WHEN 'Urgent' THEN 1 
        ELSE 2 
      END,
      qe.queued_at ASC
    `,
    params
  );

  const now = Date.now();
  const queueByDept = {};

  const enrichedEntries = result.rows.map((row) => {
    const queuedAt = new Date(row.queued_at);
    const waitMinutes = Math.max(0, Math.floor((now - queuedAt.getTime()) / 60000));
    
    // Track dept position
    const dept = row.department.toLowerCase();
    queueByDept[dept] = (queueByDept[dept] || 0) + 1;
    const position = queueByDept[dept];

    // Priority recommendation
    const riskScore = row.risk_score || row.latest_risk_score || 0;
    const riskLevel = row.risk_level || row.latest_risk_level || (riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 40 ? 'MODERATE' : 'LOW');

    const entryForEval = {
      ...row,
      waitMinutes,
      risk_score: riskScore,
      risk_level: riskLevel,
    };

    const prioEval = evaluateRecommendedPriority(entryForEval, configs);
    const deptConfig = configs[dept] || { target: 30, warning: 45, critical: 60 };
    const isLongWait = waitMinutes >= deptConfig.critical;
    const isWarningWait = waitMinutes >= deptConfig.warning && !isLongWait;

    return {
      _id: row.id,
      id: row.id,
      ticketNumber: row.ticket_number,
      ticket_number: row.ticket_number,
      patientId: row.patient_id,
      patient_id: row.patient_id,
      patientDisplayId: row.patient_display_id,
      patientName: row.patient_name,
      patient_name: row.patient_name,
      gender: row.gender,
      dateOfBirth: row.date_of_birth,
      department: row.department,
      priority: row.priority,
      status: row.status,
      serviceName: row.service_name || 'General Consultation',
      complaint: row.complaint,
      queuedAt: row.queued_at,
      startedAt: row.started_at,
      servedAt: row.served_at,
      waitMinutes,
      waitTime: `${waitMinutes} min`,
      queuePosition: position,
      assignedProvider: row.assigned_to
        ? { id: row.assigned_to, name: `Dr. ${row.provider_first_name || ''} ${row.provider_last_name || ''}`.trim() }
        : null,
      riskScore,
      risk_score: riskScore,
      riskLevel,
      risk_level: riskLevel,
      isHighRisk: riskScore >= 60,
      isCriticalRisk: riskScore >= 80,
      priorityRecommendation: prioEval,
      recommendedPriority: prioEval.recommendedPriority,
      priorityReasons: prioEval.reasons,
      isLongWait,
      isWarningWait,
    };
  });

  const byDepartment = {};
  for (const entry of enrichedEntries) {
    const department = entry.department.toLowerCase();
    if (!byDepartment[department]) {
      const config = configs[department] || { target: 30, warning: 45, critical: 60, congestionThreshold: 10 };
      byDepartment[department] = {
        department,
        entries: [],
        activeCount: 0,
        avgWaitMinutes: 0,
        longWaitCount: 0,
        isCongested: false,
        config: {
          targetWaitMinutes: config.target,
          warningWaitMinutes: config.warning,
          criticalWaitMinutes: config.critical,
          congestionPatientThreshold: config.congestionThreshold,
        },
      };
    }
    byDepartment[department].entries.push(entry);
    byDepartment[department].activeCount += 1;
    byDepartment[department].avgWaitMinutes += entry.waitMinutes;
    if (entry.isLongWait) byDepartment[department].longWaitCount += 1;
  }
  for (const department of Object.values(byDepartment)) {
    department.avgWaitMinutes = department.activeCount
      ? Math.round(department.avgWaitMinutes / department.activeCount)
      : 0;
    department.isCongested = department.activeCount >= department.config.congestionPatientThreshold ||
      department.avgWaitMinutes >= department.config.warningWaitMinutes;
  }

  return {
    count: enrichedEntries.length,
    totalActive: enrichedEntries.length,
    totalLongWait: enrichedEntries.filter((entry) => entry.isLongWait).length,
    entries: enrichedEntries,
    byDepartment,
    departmentConfigs: configs,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Detect department congestion and provider workload imbalances
 */
async function getDepartmentCongestionMetrics() {
  const configs = await getDepartmentConfigs();

  const now = Date.now();
  const queueRes = await query(
    `
    SELECT
      qe.id,
      qe.department,
      qe.status,
      qe.priority,
      qe.queued_at,
      qe.assigned_to,
      u.first_name AS provider_first_name,
      u.last_name AS provider_last_name
    FROM queue_entries qe
    LEFT JOIN users u ON u.id = qe.assigned_to
    WHERE qe.status IN ('Waiting', 'In Progress')
    `
  );

  const departments = ['opd', 'triage', 'doctor', 'lab', 'pharmacy', 'radiology'];
  const departmentStats = {};

  for (const dept of departments) {
    const config = configs[dept] || { target: 30, warning: 45, critical: 60, congestionThreshold: 10 };
    departmentStats[dept] = {
      department: dept,
      waitingCount: 0,
      inProgressCount: 0,
      totalActive: 0,
      totalWaitMinutes: 0,
      avgWaitMinutes: 0,
      maxWaitMinutes: 0,
      longWaitCount: 0,
      isCongested: false,
      thresholds: config,
      providerLoads: {},
    };
  }

  for (const row of queueRes.rows) {
    const dept = String(row.department || 'opd').toLowerCase();
    if (!departmentStats[dept]) {
      departmentStats[dept] = {
        department: dept,
        waitingCount: 0,
        inProgressCount: 0,
        totalActive: 0,
        totalWaitMinutes: 0,
        avgWaitMinutes: 0,
        maxWaitMinutes: 0,
        longWaitCount: 0,
        isCongested: false,
        thresholds: configs[dept] || { target: 30, warning: 45, critical: 60, congestionThreshold: 10 },
        providerLoads: {},
      };
    }

    const waitMins = Math.max(0, Math.floor((now - new Date(row.queued_at).getTime()) / 60000));
    departmentStats[dept].totalActive++;
    departmentStats[dept].totalWaitMinutes += waitMins;

    if (waitMins > departmentStats[dept].maxWaitMinutes) {
      departmentStats[dept].maxWaitMinutes = waitMins;
    }

    if (row.status === 'Waiting') {
      departmentStats[dept].waitingCount++;
    } else if (row.status === 'In Progress') {
      departmentStats[dept].inProgressCount++;
    }

    if (waitMins >= departmentStats[dept].thresholds.critical) {
      departmentStats[dept].longWaitCount++;
    }

    // Provider load
    if (row.assigned_to) {
      const pId = row.assigned_to;
      const pName = `Dr. ${row.provider_first_name || ''} ${row.provider_last_name || ''}`.trim();
      if (!departmentStats[dept].providerLoads[pId]) {
        departmentStats[dept].providerLoads[pId] = { providerId: pId, name: pName, patientCount: 0 };
      }
      departmentStats[dept].providerLoads[pId].patientCount++;
    }
  }

  // Calculate averages and congestion flags
  const congestionAlerts = [];
  const workloadImbalances = [];

  for (const dept of Object.keys(departmentStats)) {
    const stat = departmentStats[dept];
    if (stat.totalActive > 0) {
      stat.avgWaitMinutes = Math.round(stat.totalWaitMinutes / stat.totalActive);
    }

    // Congestion condition: waiting count exceeds threshold OR avg wait exceeds warning
    if (stat.waitingCount >= stat.thresholds.congestionThreshold || stat.avgWaitMinutes >= stat.thresholds.warning) {
      stat.isCongested = true;
      congestionAlerts.push({
        department: dept,
        severity: stat.avgWaitMinutes >= stat.thresholds.critical ? 'CRITICAL' : 'HIGH',
        title: `${dept.toUpperCase()} Congestion Alert`,
        message: `${stat.waitingCount} patients currently waiting. Average wait time: ${stat.avgWaitMinutes} min (Target: ${stat.thresholds.target} min).`,
        activeCount: stat.waitingCount,
        avgWaitMinutes: stat.avgWaitMinutes,
      });
    }

    // Workload imbalance detection (if 2+ providers have active patients)
    const providers = Object.values(stat.providerLoads);
    if (providers.length >= 2) {
      providers.sort((a, b) => b.patientCount - a.patientCount);
      const maxLoad = providers[0].patientCount;
      const minLoad = providers[providers.length - 1].patientCount;

      if (maxLoad >= 4 && maxLoad - minLoad >= 4) {
        workloadImbalances.push({
          department: dept,
          highestProvider: providers[0],
          lowestProvider: providers[providers.length - 1],
          providers,
          difference: maxLoad - minLoad,
          recommendation: `Consider balancing queue assignment between ${providers[0].name} (${maxLoad} patients) and ${providers[providers.length - 1].name} (${minLoad} patients). Requires human staff confirmation.`,
        });
      }
    }
  }

  return {
    departmentStats,
    congestionAlerts,
    workloadImbalances,
  };
}

/**
 * Calculate patient flow analytics across date ranges
 */
async function getPatientFlowAnalytics({ period = 'today', startDate = null, endDate = null } = {}) {
  let dateCondition = "qe.queued_at >= CURRENT_DATE";

  if (period === 'week') {
    dateCondition = "qe.queued_at >= NOW() - INTERVAL '7 days'";
  } else if (period === 'month') {
    dateCondition = "qe.queued_at >= NOW() - INTERVAL '30 days'";
  } else if (startDate && endDate) {
    dateCondition = `qe.queued_at >= '${new Date(startDate).toISOString()}' AND qe.queued_at <= '${new Date(endDate).toISOString()}'`;
  }

  const [volumeRes, waitRes, statusRes, peakRes, longWaitRes] = await Promise.all([
    // Volume by department
    query(`
      SELECT 
        department, 
        COUNT(*)::int AS total_patients,
        COUNT(CASE WHEN status = 'Served' THEN 1 END)::int AS served_patients,
        COUNT(CASE WHEN status IN ('Waiting','In Progress') THEN 1 END)::int AS active_patients
      FROM queue_entries qe
      WHERE ${dateCondition}
      GROUP BY department
      ORDER BY total_patients DESC
    `),

    // Average wait time and journey duration by department
    query(`
      SELECT
        department,
        COALESCE(ROUND(AVG(
          EXTRACT(EPOCH FROM (COALESCE(started_at, served_at, NOW()) - queued_at)) / 60
        )), 0)::int AS avg_wait_minutes,
        COALESCE(MAX(
          EXTRACT(EPOCH FROM (COALESCE(started_at, served_at, NOW()) - queued_at)) / 60
        ), 0)::int AS max_wait_minutes,
        COALESCE(ROUND(AVG(
          CASE WHEN served_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (served_at - queued_at)) / 60
          END
        )), 0)::int AS avg_journey_duration_minutes
      FROM queue_entries qe
      WHERE ${dateCondition}
      GROUP BY department
    `),

    // Queue distribution by status & priority
    query(`
      SELECT
        priority,
        status,
        COUNT(*)::int AS count
      FROM queue_entries qe
      WHERE ${dateCondition}
      GROUP BY priority, status
    `),

    // Hourly arrival distribution (peak hours)
    query(`
      SELECT
        EXTRACT(HOUR FROM queued_at)::int AS hour_of_day,
        COUNT(*)::int AS patient_count
      FROM queue_entries qe
      WHERE ${dateCondition}
      GROUP BY hour_of_day
      ORDER BY hour_of_day ASC
    `),

    // Long-wait patient cases
    query(`
      SELECT
        qe.id,
        qe.ticket_number,
        qe.patient_name,
        qe.department,
        qe.status,
        qe.queued_at,
        ROUND(EXTRACT(EPOCH FROM (COALESCE(started_at, served_at, NOW()) - queued_at)) / 60)::int AS wait_minutes
      FROM queue_entries qe
      WHERE ${dateCondition}
        AND EXTRACT(EPOCH FROM (COALESCE(started_at, served_at, NOW()) - queued_at)) / 60 >= 45
      ORDER BY wait_minutes DESC
      LIMIT 10
    `),
  ]);

  // Overall summary
  const totalVolume = volumeRes.rows.reduce((sum, r) => sum + r.total_patients, 0);
  const totalServed = volumeRes.rows.reduce((sum, r) => sum + r.served_patients, 0);
  const activeNow = volumeRes.rows.reduce((sum, r) => sum + r.active_patients, 0);

  const allAvgWaits = waitRes.rows.map(r => r.avg_wait_minutes);
  const hospitalAvgWait = allAvgWaits.length ? Math.round(allAvgWaits.reduce((a, b) => a + b, 0) / allAvgWaits.length) : 0;

  return {
    period,
    summary: {
      totalPatients: totalVolume,
      servedPatients: totalServed,
      activeWaiting: activeNow,
      hospitalAvgWaitMinutes: hospitalAvgWait,
      longWaitIncidents: longWaitRes.rows.length,
    },
    volumeByDepartment: volumeRes.rows,
    waitingTimesByDepartment: waitRes.rows,
    statusBreakdown: statusRes.rows,
    peakHours: peakRes.rows,
    longWaitCases: longWaitRes.rows,
  };
}

/**
 * Get single patient journey timeline across departments
 */
async function getPatientJourneyTimeline(patientId) {
  // Query all queue entries and events for this patient
  const queues = await query(
    `
    SELECT * FROM queue_entries
    WHERE patient_id = $1
    ORDER BY queued_at ASC
    `,
    [patientId]
  );

  const events = await query(
    `
    SELECT * FROM queue_events
    WHERE patient_id = $1
    ORDER BY created_at ASC
    `,
    [patientId]
  );

  const medicalRecords = await query(
    `
    SELECT id, visit_date, assessment, vital_signs, created_at
    FROM medical_records
    WHERE patient_id = $1
    ORDER BY visit_date ASC
    `,
    [patientId]
  );

  return {
    patientId,
    queueEntries: queues.rows,
    events: events.rows,
    clinicalEncounters: medicalRecords.rows,
  };
}

module.exports = {
  getDepartmentConfigs,
  evaluateRecommendedPriority,
  getRealTimeQueueFlow,
  getDepartmentCongestionMetrics,
  getPatientFlowAnalytics,
  getPatientJourneyTimeline,
};
