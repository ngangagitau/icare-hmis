const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

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
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', protect, checkPermission('medical-records', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (req.query.patient) { params.push(req.query.patient); where.push(`patient_id = $${params.length}`); }
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

router.get('/:id', protect, checkPermission('medical-records', 'read'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM medical_records WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Medical record not found' });
    res.json({ success: true, data: mapRecord(result.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  [protect, checkPermission('medical-records', 'create'), [body('patient').not().isEmpty(), body('visitDate').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const inserted = await query(
        `INSERT INTO medical_records (
          patient_id, visit_date, vital_signs, physical_examination, assessment, diagnosis,
          treatment_plan, progress_notes, lab_results, imaging_results, attachments, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          req.body.patient,
          req.body.visitDate,
          req.body.vitalSigns || {},
          req.body.physicalExamination || {},
          req.body.assessment || null,
          req.body.diagnosis || [],
          req.body.treatmentPlan || null,
          req.body.progressNotes || [],
          req.body.labResults || {},
          req.body.imagingResults || {},
          req.body.attachments || [],
          req.user.id,
        ]
      );
      res.status(201).json({ success: true, data: mapRecord(inserted.rows[0]) });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

router.put('/:id', protect, checkPermission('medical-records', 'update'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let i = 1;
    const fields = { patient: 'patient_id', visitDate: 'visit_date', vitalSigns: 'vital_signs', physicalExamination: 'physical_examination', assessment: 'assessment', diagnosis: 'diagnosis', treatmentPlan: 'treatment_plan', progressNotes: 'progress_notes', labResults: 'lab_results', imagingResults: 'imaging_results', attachments: 'attachments' };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) { updates.push(`${col} = $${i++}`); values.push(req.body[k]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(`UPDATE medical_records SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, values);
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Medical record not found' });
    res.json({ success: true, data: mapRecord(updated.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

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
