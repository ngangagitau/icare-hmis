const express = require('express');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const [patients, appointments, appointmentsToday, pendingAppointments, billingStats, totalRecords, recentPatients, pendingBills] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM patients`),
      query(`SELECT COUNT(*)::int AS count FROM appointments`),
      query(`SELECT COUNT(*)::int AS count FROM appointments WHERE DATE(appointment_date) = CURRENT_DATE`),
      query(`SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'Scheduled'`),
      query(`SELECT COALESCE(SUM(amount_due),0)::numeric AS total_revenue, COALESCE(SUM(amount_due - balance),0)::numeric AS total_collected, COALESCE(SUM(balance),0)::numeric AS total_pending FROM billing`),
      query(`SELECT COUNT(*)::int AS count FROM medical_records`),
      query(`SELECT first_name, last_name, patient_id, created_at FROM patients ORDER BY created_at DESC LIMIT 5`),
      query(`SELECT COUNT(*)::int AS count FROM billing WHERE payment_status IN ('Pending','Partial','Overdue')`),
    ]);

    res.json({
      success: true,
      data: {
        patients: { total: patients.rows[0]?.count || 0 },
        appointments: {
          total: appointments.rows[0]?.count || 0,
          today: appointmentsToday.rows[0]?.count || 0,
          pending: pendingAppointments.rows[0]?.count || 0,
        },
        medical_records: { total: totalRecords.rows[0]?.count || 0 },
        billing: {
          totalRevenue: Number(billingStats.rows[0]?.total_revenue || 0),
          totalCollected: Number(billingStats.rows[0]?.total_collected || 0),
          totalPending: Number(billingStats.rows[0]?.total_pending || 0),
          pendingBills: pendingBills.rows[0]?.count || 0,
        },
        recentPatients: recentPatients.rows.map((p) => ({
          firstName: p.first_name,
          lastName: p.last_name,
          patientId: p.patient_id,
          createdAt: p.created_at,
        })),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/patients', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const [total, byGender, byBloodType, newThisMonth] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM patients`),
      query(`SELECT gender AS _id, COUNT(*)::int AS count FROM patients GROUP BY gender`),
      query(`SELECT blood_type AS _id, COUNT(*)::int AS count FROM patients GROUP BY blood_type ORDER BY count DESC`),
      query(`SELECT COUNT(*)::int AS count FROM patients WHERE date_trunc('month', created_at) = date_trunc('month', NOW())`),
    ]);
    res.json({
      success: true,
      data: {
        totalPatients: total.rows[0]?.count || 0,
        patientsByGender: byGender.rows,
        patientsByBloodType: byBloodType.rows,
        newPatientsThisMonth: newThisMonth.rows[0]?.count || 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/appointments', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const [total, byStatus, byDepartment, thisMonth] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM appointments`),
      query(`SELECT status AS _id, COUNT(*)::int AS count FROM appointments GROUP BY status`),
      query(`SELECT department AS _id, COUNT(*)::int AS count FROM appointments GROUP BY department ORDER BY count DESC`),
      query(`SELECT COUNT(*)::int AS count FROM appointments WHERE date_trunc('month', appointment_date) = date_trunc('month', NOW())`),
    ]);
    res.json({
      success: true,
      data: {
        totalAppointments: total.rows[0]?.count || 0,
        appointmentsByStatus: byStatus.rows,
        appointmentsByDepartment: byDepartment.rows,
        appointmentsThisMonth: thisMonth.rows[0]?.count || 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/billing', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const [totals, byStatus, thisMonth] = await Promise.all([
      query(`SELECT COALESCE(SUM(amount_due),0)::numeric AS total_billed, COALESCE(SUM(amount_due - balance),0)::numeric AS total_paid, COALESCE(SUM(balance),0)::numeric AS total_outstanding FROM billing`),
      query(`SELECT payment_status AS _id, COUNT(*)::int AS count FROM billing GROUP BY payment_status`),
      query(`SELECT COALESCE(SUM(amount_due),0)::numeric AS billed_this_month FROM billing WHERE date_trunc('month', invoice_date) = date_trunc('month', NOW())`),
    ]);
    res.json({
      success: true,
      data: {
        totalBilled: Number(totals.rows[0]?.total_billed || 0),
        totalPaid: Number(totals.rows[0]?.total_paid || 0),
        totalOutstanding: Number(totals.rows[0]?.total_outstanding || 0),
        billsByStatus: byStatus.rows,
        billedThisMonth: Number(thisMonth.rows[0]?.billed_this_month || 0),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
