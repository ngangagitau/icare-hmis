const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

const isUuid = (value) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    String(value || '')
  );

const mapPatient = (row) => {
  if (!row) return row;
  return {
    _id: row.id,
    patientId: row.patient_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    bloodType: row.blood_type,
    address: row.address,
    emergencyContact: row.emergency_contact,
    medicalHistory: row.medical_history,
    allergies: row.allergies,
    currentMedications: row.current_medications,
    insurance: row.insurance,
    height: row.height,
    weight: row.weight,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
router.get('/', protect, checkPermission('patients', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    const totalResult = await query(`SELECT COUNT(*)::int AS total FROM patients`);
    const total = totalResult.rows[0]?.total || 0;

    const patientsResult = await query(
      `
      SELECT
        p.*
      FROM patients p
      ORDER BY p.created_at DESC
      OFFSET $1
      LIMIT $2
      `,
      [startIndex, limit]
    );

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPatients: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    res.json({
      success: true,
      count: patientsResult.rows.length,
      pagination,
      data: patientsResult.rows.map(mapPatient),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @desc    Search patients
// @route   GET /api/patients/search/:query
// @access  Private
router.get('/search/:query', protect, checkPermission('patients', 'read'), async (req, res) => {
  try {
    const q = String(req.params.query || '').trim();
    const like = `%${q}%`;

    const result = await query(
      `
      SELECT *
      FROM patients
      WHERE patient_id ILIKE $1
         OR first_name ILIKE $1
         OR last_name ILIKE $1
         OR phone ILIKE $1
         OR email ILIKE $1
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [like]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapPatient),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
router.get('/:id', protect, checkPermission('patients', 'read'), async (req, res) => {
  try {
    const id = req.params.id;
    const result = isUuid(id)
      ? await query(`SELECT * FROM patients WHERE id = $1`, [id])
      : await query(`SELECT * FROM patients WHERE patient_id = $1`, [id]);
    const patient = result.rows[0];

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
      });
    }

    res.json({
      success: true,
      data: mapPatient(patient),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
router.post(
  '/',
  [
    protect,
    checkPermission('patients', 'create'),
    [
      body('patientId', 'Patient ID is required').not().isEmpty(),
      body('firstName', 'First name is required').not().isEmpty(),
      body('lastName', 'Last name is required').not().isEmpty(),
      body('dateOfBirth', 'Date of birth is required').isISO8601(),
      body('gender', 'Gender is required').isIn(['Male', 'Female', 'Other']),
      body('phone', 'Phone number is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      // Check if patient ID already exists
      const existing = await query(`SELECT id FROM patients WHERE patient_id = $1`, [req.body.patientId]);
      if (existing.rows[0]) {
        return res.status(400).json({
          success: false,
          error: 'Patient ID already exists',
        });
      }

      const inserted = await query(
        `
        INSERT INTO patients (
          patient_id, first_name, last_name, date_of_birth, gender, phone, email,
          address, emergency_contact, medical_history, allergies, current_medications,
          insurance, blood_type, height, weight, status, created_by
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,
          $8,$9,$10,$11,$12,
          $13,$14,$15,$16,$17,$18
        )
        RETURNING *
        `,
        [
          req.body.patientId,
          req.body.firstName,
          req.body.lastName,
          req.body.dateOfBirth,
          req.body.gender,
          req.body.phone,
          req.body.email || null,
          req.body.address ? JSON.stringify(req.body.address) : null,
          req.body.emergencyContact ? JSON.stringify(req.body.emergencyContact) : null,
          req.body.medicalHistory ? JSON.stringify(req.body.medicalHistory) : null,
          req.body.allergies ? JSON.stringify(req.body.allergies) : null,
          req.body.currentMedications ? JSON.stringify(req.body.currentMedications) : null,
          req.body.insurance ? JSON.stringify(req.body.insurance) : null,
          req.body.bloodType || null,
          req.body.height ?? null,
          req.body.weight ?? null,
          req.body.status || 'Active',
          req.user.id,
        ]
      );

      res.status(201).json({
        success: true,
        data: mapPatient(inserted.rows[0]),
      });
    } catch (err) {
      console.error(err.message);
      if (err.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Patient ID already exists',
        });
      }
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
router.put(
  '/:id',
  [
    protect,
    checkPermission('patients', 'update'),
    [
      body('firstName', 'First name is required').optional().not().isEmpty(),
      body('lastName', 'Last name is required').optional().not().isEmpty(),
      body('dateOfBirth', 'Date of birth must be valid').optional().isISO8601(),
      body('gender', 'Gender must be valid').optional().isIn(['Male', 'Female', 'Other']),
      body('phone', 'Phone number is required').optional().not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const id = req.params.id;
      if (!isUuid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid patient id' });
      }

      const existing = await query(`SELECT * FROM patients WHERE id = $1`, [id]);
      if (!existing.rows[0]) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found',
        });
      }

      const updates = [];
      const values = [];
      let i = 1;

      const map = {
        firstName: 'first_name',
        lastName: 'last_name',
        dateOfBirth: 'date_of_birth',
        gender: 'gender',
        phone: 'phone',
        email: 'email',
        bloodType: 'blood_type',
        height: 'height',
        weight: 'weight',
        status: 'status',
        address: 'address',
        emergencyContact: 'emergency_contact',
        medicalHistory: 'medical_history',
        allergies: 'allergies',
        currentMedications: 'current_medications',
        insurance: 'insurance',
      };

      for (const [key, col] of Object.entries(map)) {
        if (req.body[key] !== undefined) {
          const val =
            ['address', 'emergencyContact', 'medicalHistory', 'allergies', 'currentMedications', 'insurance'].includes(key)
              ? JSON.stringify(req.body[key])
              : req.body[key];
          updates.push(`${col} = $${i++}`);
          values.push(val);
        }
      }

      if (updates.length === 0) {
        return res.json({ success: true, data: existing.rows[0] });
      }

      values.push(id);
      const updated = await query(
        `UPDATE patients SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
        values
      );

      res.json({
        success: true,
        data: mapPatient(updated.rows[0]),
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  }
);

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
router.delete('/:id', protect, checkPermission('patients', 'delete'), async (req, res) => {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid patient id' });
    }

    const existing = await query(`SELECT id FROM patients WHERE id = $1`, [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
      });
    }

    await query(`DELETE FROM patients WHERE id = $1`, [id]);

    res.json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      });
  }
});

module.exports = router;