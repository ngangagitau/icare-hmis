const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Pool } = require('pg');
const {
  assessPatientRiskById,
  savePatientRiskAssessment,
  evaluatePatientRisk
  ,resolvePatientId
} = require('../services/clinicalRiskEngine');
const aiService = require('../services/ai/aiService');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ALLOWED_ROLES = ['super-admin', 'Super Admin', 'superadmin', 'admin', 'Admin', 'doctor', 'Doctor', 'nurse', 'Nurse'];

// GET /api/clinical-intelligence/:patientId/risk
// Live risk evaluation (not saved)
router.get('/:patientId/risk', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await assessPatientRiskById(patientId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Risk assessment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clinical-intelligence/:patientId/risk/assess
// Calculate and persist a risk assessment
router.post('/:patientId/risk/assess', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { patientId } = req.params;
    const assessment = await savePatientRiskAssessment(patientId, req.user.id);
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    console.error('Save risk assessment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clinical-intelligence/:patientId/risk-history
// Historical assessments for a patient
router.get('/:patientId/risk-history', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      `SELECT id, score, risk_level, factors, calculation_source, created_at, created_at AS assessed_at
       FROM patient_risk_assessments
       WHERE patient_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [await resolvePatientId(patientId), limit]
    );
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (err) {
    console.error('Risk history error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clinical-intelligence/:patientId/clinical-alerts
// Active alerts for a specific patient
router.get('/:patientId/clinical-alerts', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.params.patientId);
    const result = await pool.query(
      `SELECT id, alert_type, severity, title, message, metadata, status, created_at
       FROM clinical_alerts
       WHERE patient_id = $1 AND status = 'Active'
       ORDER BY
         CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
         created_at DESC`,
      [patientId]
    );
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (err) {
    console.error('Patient alerts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clinical-intelligence/alerts
// Hospital-wide active clinical alerts
router.get('/alerts', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { severity, limit = 50 } = req.query;
    let query = `
      SELECT ca.id, ca.patient_id, ca.alert_type, ca.severity, ca.title, ca.message,
             ca.metadata, ca.status, ca.created_at,
             p.first_name, p.last_name, p.patient_id AS patient_number
      FROM clinical_alerts ca
      JOIN patients p ON p.id = ca.patient_id
      WHERE ca.status = 'Active'
    `;
    const params = [];
    if (severity) {
      params.push(severity);
      query += ` AND ca.severity = $${params.length}`;
    }
    params.push(parseInt(limit));
    query += ` ORDER BY CASE ca.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, ca.created_at DESC LIMIT $${params.length}`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (err) {
    console.error('Hospital alerts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/clinical-intelligence/alerts/:alertId/acknowledge
// Acknowledge an alert
router.patch('/alerts/:alertId/acknowledge', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const { alertId } = req.params;
    const result = await pool.query(
      `UPDATE clinical_alerts
       SET status = 'Acknowledged', acknowledged_by = $1, acknowledged_at = NOW()
       WHERE id = $2
       RETURNING id, status, acknowledged_at`,
      [req.user.id, alertId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Acknowledge alert error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clinical-intelligence/high-risk
// All patients with HIGH or CRITICAL risk
router.get('/high-risk', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (pra.patient_id)
         pra.id, pra.patient_id, pra.score, pra.risk_level, pra.factors, pra.created_at, pra.created_at AS assessed_at,
         p.first_name, p.last_name, p.patient_id AS patient_number, p.date_of_birth, p.gender
       FROM patient_risk_assessments pra
       JOIN patients p ON p.id = pra.patient_id
       WHERE pra.risk_level IN ('HIGH', 'CRITICAL')
       ORDER BY pra.patient_id, pra.created_at DESC`
    );
    // Sort final result by score desc
    const sorted = result.rows.sort((a, b) => b.score - a.score);
    res.json({ success: true, data: sorted, count: sorted.length });
  } catch (err) {
    console.error('High risk patients error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clinical-intelligence/:patientId/ai-assist
// AI clinical assistant
router.post('/:patientId/ai-assist', protect, authorize(...ALLOWED_ROLES), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.params.patientId);
    const { type, userQuery } = req.body;
    const validTypes = ['summary', 'explain_risk', 'review_history', 'abnormal_results', 'handover', 'query'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }
    const result = await aiService.getClinicalAssistance({
      patientId,
      userId: req.user.id,
      type,
      userQuery
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI assist error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
