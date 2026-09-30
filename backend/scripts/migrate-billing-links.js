const { query } = require('../db/pg');

async function migrateBillingLinks() {
  try {
    console.log('🔄 Running migrations for clinical billing links...');

    // 1. Add payment_status to prescriptions
    await query(`ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending';`);
    await query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_payment_status ON prescriptions(payment_status);`);
    console.log('✓ prescriptions table updated with payment_status');

    // 2. Add payment_status to radiology_orders
    await query(`ALTER TABLE radiology_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending';`);
    await query(`CREATE INDEX IF NOT EXISTS idx_radiology_orders_payment_status ON radiology_orders(payment_status);`);
    console.log('✓ radiology_orders table updated with payment_status');

    // 3. Add linked_orders and insurance_approval to billing
    await query(`ALTER TABLE billing ADD COLUMN IF NOT EXISTS linked_orders JSONB DEFAULT '[]'::jsonb;`);
    await query(`ALTER TABLE billing ADD COLUMN IF NOT EXISTS insurance_approval JSONB;`);
    console.log('✓ billing table updated with linked_orders and insurance_approval');

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateBillingLinks();
