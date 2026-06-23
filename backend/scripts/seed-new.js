const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { query } = require('../db/pg');
const { createTables } = require('../db/seedDatabase');

// Load environment variables
dotenv.config();

const seedUsers = [
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'superadmin@icare.com',
    password: 'SuperAdmin@123',
    role: 'super-admin',
    department: 'Administration',
    phone: '+254700000000',
    permissions: [
      { module: 'all', actions: ['create', 'read', 'update', 'delete', 'admin'] },
    ],
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'doctor@icare.com',
    password: 'Doctor@123',
    role: 'doctor',
    department: 'Medical',
    phone: '+254700000001',
    permissions: [
      { module: 'patients', actions: ['read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update'] },
      { module: 'medical-records', actions: ['create', 'read', 'update'] },
    ],
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'nurse@icare.com',
    password: 'Nurse@123',
    role: 'nurse',
    department: 'Nursing',
    phone: '+254700000002',
    permissions: [
      { module: 'patients', actions: ['read', 'update'] },
      { module: 'appointments', actions: ['read', 'update'] },
      { module: 'medical-records', actions: ['read', 'update'] },
    ],
  },
];

const seedPatients = [
  {
    patientId: 'P001',
    firstName: 'Alice',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    phone: '+1234567890',
    email: 'alice.johnson@email.com',
    bloodType: 'O+',
    status: 'Active',
  },
  {
    patientId: 'P002',
    firstName: 'Michael',
    lastName: 'Brown',
    dateOfBirth: '1990-07-22',
    gender: 'Male',
    phone: '+1234567892',
    email: 'michael.brown@email.com',
    bloodType: 'A+',
    status: 'Active',
  },
];

const importData = async () => {
  try {
    console.log('🚀 Starting database seeding...\n');

    // First, create all tables
    await createTables();
    console.log('\n✓ Database tables initialized\n');

    console.log('📝 Seeding users...');

    // Hash passwords and insert users
    for (const user of seedUsers) {
      // Check if user already exists
      const existing = await query(
        'SELECT * FROM users WHERE email = $1',
        [user.email]
      );

      if (existing.rows.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        await query(
          `INSERT INTO users (username, email, password, first_name, last_name, role, department, phone, is_active, permissions)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            user.email,
            user.email,
            hashedPassword,
            user.firstName,
            user.lastName,
            user.role,
            user.department,
            user.phone,
            true,
            JSON.stringify(user.permissions || [])
          ]
        );
        console.log(`  ✓ Created ${user.firstName} ${user.lastName} (${user.role})`);
      } else {
        console.log(`  ⚠️  ${user.email} already exists, skipping`);
      }
    }

    console.log('\n📝 Seeding patients...');

    // Get admin user ID for createdBy
    const adminResult = await query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['super-admin']
    );
    const adminUserId = adminResult.rows[0]?.id;

    // Insert patients
    for (const patient of seedPatients) {
      const existing = await query(
        'SELECT * FROM patients WHERE patient_id = $1',
        [patient.patientId]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, blood_type, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            patient.patientId,
            patient.firstName,
            patient.lastName,
            patient.dateOfBirth,
            patient.gender,
            patient.phone,
            patient.email,
            patient.bloodType,
            patient.status || 'Active',
            adminUserId
          ]
        );
        console.log(`  ✓ Created patient ${patient.firstName} ${patient.lastName} (${patient.patientId})`);
      } else {
        console.log(`  ⚠️  ${patient.patientId} already exists, skipping`);
      }
    }

    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    console.error(err);
    process.exit(1);
  }
};

importData();
