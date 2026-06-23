const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { query } = require('../db/pg');

// Load environment variables
dotenv.config();

console.log('🔗 Connecting to PostgreSQL...');

// Test connection and create super admin
const createSuperAdmin = async () => {
  try {
    // Test connection
    await query('SELECT NOW()');
    console.log('✓ Connected to PostgreSQL\n');

    console.log('📝 Creating Super Admin user...\n');

    // Check if super admin already exists
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      ['superadmin@icare.com']
    );

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', salt);

    if (result.rows.length > 0) {
      // Update existing
      console.log('⚠️  Super Admin already exists. Updating credentials...');
      await query(
        `UPDATE users SET password = $1, role = $2, is_active = $3, updated_at = NOW() 
         WHERE email = $4`,
        [hashedPassword, 'super-admin', true, 'superadmin@icare.com']
      );
      console.log('✓ Super Admin updated successfully');
    } else {
      // Create new
      await query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, department, phone, is_active, permissions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'superadmin@icare.com',
          'superadmin@icare.com',
          hashedPassword,
          'System',
          'Administrator',
          'super-admin',
          'Administration',
          '+254700000000',
          true,
          JSON.stringify([{ module: 'all', actions: ['create', 'read', 'update', 'delete', 'admin'] }])
        ]
      );
      console.log('✓ Super Admin created successfully');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUPER ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    superadmin@icare.com');
    console.log('Password: SuperAdmin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Super Admin setup complete!');
    console.log('📍 Login at: http://localhost:5173/login\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating super admin:', err.message);
    process.exit(1);
  }
};

createSuperAdmin();
