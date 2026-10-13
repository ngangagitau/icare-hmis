const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');
const { analyseVitals, parseVitalsFromRecord } = require('../lib/triageAiEngine');

const router = express.Router();

/* ─── Ensure triage_alert column exists ─────────────────────────────────── */
(async () => {
  try {
    await query(`
      ALTER TABLE medical_records
      ADD COLUMN IF NOT EXISTS triage_alert JSONB;
    `);
    await query(`
      ALTER TABLE queue_entries
      ADD COLUMN IF NOT EXISTS triage_alert JSONB;
    `);
  } catch (e) {
    // Columns likely already exist – safe to ignore
    if (!e.message.includes('already exists')) console.error('[schema] triage_alert migration warning:', e.message);
  }
})();

const mapRecord = (row) => ({
  _id: row.id,
  recordId: row.id,
  patient: row.patient_id,
  doctor: row.created_by,
  visitDate: row.visit_date,
  vitalSigns: row.vital_signs || {},
  physicalExamination: row.physical_examination || {},
  assessment: row.assessment,
  diagnosis: row.diagnosis || [],
  treatmentPlan: row.treatment_plan,
  progressNotes: row.progress_notes || [],
  labResults: row.lab_results || {},
  imagingResults: row.imaging_results || {},
  attachments: row.attachments || [],
  triageAlert: row.triage_alert || null,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/* ─── Run AI analysis and update queue priority ──────────────────────────── */
async function runTriageAi(patientId, vitalSigns, recordId) {
  try {
    const parsed = parseVitalsFromRecord(vitalSigns);
    const assessment = analyseVitals(parsed);

    // Persist alert on the medical record
    if (recordId) {
      await query(
        `UPDATE medical_records SET triage_alert = $1 WHERE id = $2`,
        [JSON.stringify(assessment), recordId]
      );
    }

    // Only escalate queue if not NORMAL
    if (assessment.severity !== 'NORMAL') {
      // Find the active doctor queue entry for this patient
      const queueResult = await query(
        `SELECT id, priority FROM queue_entries
         WHERE patient_id = $1
           AND department = 'doctor'
           AND status IN ('Waiting', 'In Progress')
         ORDER BY queued_at ASC
         LIMIT 1`,
        [patientId]
      );

      if (queueResult.rows.length > 0) {
        const qe = queueResult.rows[0];
        const newPriority = assessment.queuePriority;
        // Only escalate, never downgrade
        const priorityRank = { Emergency: 0, Urgent: 1, Normal: 2 };
        const current = priorityRank[qe.priority] ?? 2;
        const incoming = priorityRank[newPriority] ?? 2;

        if (incoming < current) {
          await query(
            `UPDATE queue_entries
             SET priority = $1,
                 triage_alert = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [newPriority, JSON.stringify(assessment), qe.id]
          );
          console.log(`[triageAi] Queue ${qe.id} escalated → ${newPriority} (was ${qe.priority})`);
        } else {
          // Update alert payload even if priority didn't change
          await query(
            `UPDATE queue_entries
             SET triage_alert = $1, updated_at = NOW()
             WHERE id = $2`,
            [JSON.stringify(assessment), qe.id]
          );
        }
      }
    }

    return assessment;
  } catch (e) {
    console.error('[triageAi] Analysis failed:', e.message);
    return null;
  }
}

/* ─── GET /api/medical-records ───────────────────────────────────────────── */
router.get('/', protect, checkPermission('medical-records', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (req.query.patient) {
      const pRef = String(req.query.patient).trim();
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(pRef);
      if (isUuid) {
        params.push(pRef);
        where.push(`patient_id = $${params.length}`);
      } else {
        const pRes = await query(`SELECT id FROM patients WHERE patient_id = $1`, [pRef]);
        if (pRes.rows[0]) {
          params.push(pRes.rows[0].id);
          where.push(`patient_id = $${params.length}`);
        } else {
          params.push(pRef);
          where.push(`patient_id = $${params.length}`);
        }
      }
    }
    if (req.query.startDate) { params.push(req.query.startDate); where.push(`visit_date >= $${params.length}`); }
    if (req.query.endDate) { params.push(req.query.endDate); where.push(`visit_date <= $${params.length}`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*)::int AS total FROM medical_records ${whereClause}`, params);
    const rows = await query(
      `SELECT * FROM medical_records ${whereClause} ORDER BY visit_date DESC, created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );
    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapRecord),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ─── GET /api/medical-records/:id ──────────────────────────────────────── */
router.get('/:id', protect, checkPermission('medical-records', 'read'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM medical_records WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Medical record not found' });
    res.json({ success: true, data: mapRecord(result.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ─── Helper to resolve patient reference to UUID ───────────────────────── */
async function resolvePatientId(patientRef) {
  if (!patientRef) return null;
  const ref = String(patientRef).trim();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(ref);
  if (isUuid) {
    const res = await query(`SELECT id FROM patients WHERE id = $1`, [ref]);
    return res.rows[0]?.id || null;
  } else {
    const res = await query(`SELECT id FROM patients WHERE patient_id = $1`, [ref]);
    return res.rows[0]?.id || null;
  }
}

/* ─── POST /api/medical-records ─────────────────────────────────────────── */
router.post(
  '/',
  [protect, checkPermission('medical-records', 'create'), [body('patient').not().isEmpty(), body('visitDate').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      // Resolve patient identifier to primary UUID
      const patientUuid = await resolvePatientId(req.body.patient);
      if (!patientUuid) {
        return res.status(404).json({ success: false, error: 'Patient not found in database' });
      }

      // Format visit_date to YYYY-MM-DD or standard ISO date for PostgreSQL DATE field
      let visitDate = req.body.visitDate;
      if (visitDate && visitDate.includes('T')) {
        visitDate = visitDate.split('T')[0];
      }

      const inserted = await query(
        `INSERT INTO medical_records (
          patient_id, visit_date, vital_signs, physical_examination, assessment, diagnosis,
          treatment_plan, progress_notes, lab_results, imaging_results, attachments, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          patientUuid,
          visitDate,
          req.body.vitalSigns ? JSON.stringify(req.body.vitalSigns) : '{}',
          req.body.physicalExamination ? JSON.stringify(req.body.physicalExamination) : '{}',
          req.body.assessment || null,
          req.body.diagnosis ? JSON.stringify(req.body.diagnosis) : '[]',
          req.body.treatmentPlan || null,
          req.body.progressNotes ? JSON.stringify(req.body.progressNotes) : '[]',
          req.body.labResults ? JSON.stringify(req.body.labResults) : '{}',
          req.body.imagingResults ? JSON.stringify(req.body.imagingResults) : '{}',
          req.body.attachments ? JSON.stringify(req.body.attachments) : '[]',
          req.user?.id || null,
        ]
      );
      const record = inserted.rows[0];

      // ── Run AI triage analysis asynchronously ───────────────────────────
      let assessment = null;
      try {
        assessment = await runTriageAi(patientUuid, req.body.vitalSigns, record.id);
      } catch (aiErr) {
        console.error('[medicalRecords] AI assessment error:', aiErr.message);
      }

      // Re-fetch with updated triage_alert
      const fresh = await query(`SELECT * FROM medical_records WHERE id = $1`, [record.id]);
      const responseData = mapRecord(fresh.rows[0] || record);

      res.status(201).json({
        success: true,
        data: responseData,
        triageAssessment: assessment,
      });
    } catch (err) {
      console.error('[medicalRecords] POST error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }
);

/* ─── PUT /api/medical-records/:id ──────────────────────────────────────── */
router.put('/:id', protect, checkPermission('medical-records', 'update'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let i = 1;
    const fields = {
      patient: 'patient_id', visitDate: 'visit_date', vitalSigns: 'vital_signs',
      physicalExamination: 'physical_examination', assessment: 'assessment', diagnosis: 'diagnosis',
      treatmentPlan: 'treatment_plan', progressNotes: 'progress_notes', labResults: 'lab_results',
      imagingResults: 'imaging_results', attachments: 'attachments',
    };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) { updates.push(`${col} = $${i++}`); values.push(req.body[k]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(
      `UPDATE medical_records SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Medical record not found' });

    // Re-run AI if vitals were part of the update
    if (req.body.vitalSigns) {
      const record = updated.rows[0];
      await runTriageAi(record.patient_id, req.body.vitalSigns, record.id);
    }

    const fresh = await query(`SELECT * FROM medical_records WHERE id = $1`, [req.params.id]);
    res.json({ success: true, data: mapRecord(fresh.rows[0] || updated.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ─── DELETE /api/medical-records/:id ───────────────────────────────────── */
router.delete('/:id', protect, checkPermission('medical-records', 'delete'), async (req, res) => {
  try {
    const deleted = await query(`DELETE FROM medical_records WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Medical record not found' });
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
