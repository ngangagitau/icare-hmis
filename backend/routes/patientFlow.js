const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Pool } = require('pg');
const {
  getRealTimeQueueFlow,
  getDepartmentCongestionMetrics,
  getPatientFlowAnalytics,
  getPatientJourneyTimeline
} = require('../services/patientFlowEngine');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ALLOWED_ROLES = ['super-admin', 'Super Admin', 'superadmin', 'admin', 'Admin', 'doctor', 'Doctor', 'nurse', 'Nurse'];

// GET /api/patient-flow/live
// Real-time queue flow across all departments
router.get('/live', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { department } = req.query;
    const data = await getRealTimeQueueFlow(department || null);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Live flow error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient-flow/analytics
// Historical flow analytics
router.get('/analytics', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { period = 'today', startDate, endDate } = req.query;
    const data = await getPatientFlowAnalytics({ period, startDate, endDate });
    res.json({ success: true, data });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient-flow/congestion
// Department congestion metrics
router.get('/congestion', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const data = await getDepartmentCongestionMetrics();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Congestion error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient-flow/alerts
// Long-wait and flow alerts from live queue
router.get('/alerts', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const flow = await getRealTimeQueueFlow(null);
    const alerts = [];
    for (const dept of Object.values(flow.byDepartment || {})) {
      for (const entry of (dept.entries || [])) {
        if (entry.isLongWait) {
          alerts.push({
            type: 'LONG_WAIT',
            severity: entry.waitMinutes > (dept.config?.criticalWaitMinutes || 60) ? 'CRITICAL' : 'HIGH',
            patientId: entry.patient_id,
            patientName: entry.patient_name,
            department: entry.department,
            waitMinutes: entry.waitMinutes,
            ticketNumber: entry.ticket_number,
            queueEntryId: entry.id
          });
        }
      }
      if (dept.isCongested) {
        alerts.push({
          type: 'CONGESTION',
          severity: 'HIGH',
          department: dept.department,
          activeCount: dept.activeCount,
          congestionLimit: dept.config?.congestionLimit
        });
      }
    }
    alerts.sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.severity] || 3) - (order[b.severity] || 3);
    });
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (err) {
    console.error('Flow alerts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/patient-flow/prioritize/:queueEntryId
// Manually update a patient's priority (staff must confirm — never auto-applied)
router.post('/prioritize/:queueEntryId', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { queueEntryId } = req.params;
    const { priority, reason } = req.body;
    const validPriorities = ['Emergency', 'Urgent', 'Normal', 'Low'];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updateResult = await client.query(
        `UPDATE queue_entries
         SET priority = $1, updated_at = NOW()
         WHERE id = $2 AND status = 'Waiting'
         RETURNING id, ticket_number, priority, patient_id`,
        [priority, queueEntryId]
      );
      if (updateResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Queue entry not found or not in Waiting status' });
      }
      // Log the event
      await client.query(
        `INSERT INTO queue_events (queue_entry_id, patient_id, department, event_type, priority, performed_by, notes)
         SELECT id, patient_id, department, 'PRIORITIZED', priority, $2, $3
         FROM queue_entries WHERE id = $1`,
        [
          queueEntryId,
          req.user.id,
          reason || 'Staff decision',
        ]
      );
      await client.query('COMMIT');
      res.json({ success: true, data: updateResult.rows[0], message: `Priority updated to ${priority}` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Prioritize error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient-flow/patient/:patientId/journey
// Full patient journey timeline
router.get('/patient/:patientId/journey', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = await getPatientJourneyTimeline(patientId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Journey error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient-flow/configs
// Department flow configurations
router.get('/configs', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM department_flow_configs ORDER BY department`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Configs error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/patient-flow/configs/:department
// Update department thresholds (admin only)
router.put('/configs/:department', protect, authorize('super-admin', 'admin'), async (req, res) => {
  try {
    const { department } = req.params;
    const { warning_wait_minutes, critical_wait_minutes, congestion_patient_threshold } = req.body;
    const result = await pool.query(
      `UPDATE department_flow_configs
       SET warning_wait_minutes = COALESCE($1, warning_wait_minutes),
           critical_wait_minutes = COALESCE($2, critical_wait_minutes),
         congestion_patient_threshold = COALESCE($3, congestion_patient_threshold),
           updated_at = NOW()
       WHERE department = $4
       RETURNING *`,
      [warning_wait_minutes, critical_wait_minutes, congestion_patient_threshold, department]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Department config not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Config update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
