const { query, pool } = require('./pg');

const createTables = async () => {
  try {
    console.log('🚀 Starting database initialization...\n');

    // 1. Users table (core - referenced by all models)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(255),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ users table created');

    // 2. Patients table
    await query(`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(255),
        blood_type VARCHAR(10),
        address JSONB,
        emergency_contact JSONB,
        medical_history JSONB,
        allergies JSONB,
        current_medications JSONB,
        insurance JSONB,
        height NUMERIC,
        weight NUMERIC,
        status VARCHAR(50) DEFAULT 'Active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ patients table created');

    // 3. Appointments table
    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        doctor_id UUID REFERENCES users(id),
        appointment_date TIMESTAMP NOT NULL,
        appointment_time TIME,
        status VARCHAR(50) DEFAULT 'Scheduled',
        reason_for_visit TEXT,
        notes TEXT,
        duration_minutes INTEGER,
        end_time TIMESTAMP,
        prescription JSONB,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ appointments table created');

    // 3b. Queue Entries table (patient flow queues)
    await query(`
      CREATE TABLE IF NOT EXISTS queue_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_number VARCHAR(30) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id) NOT NULL,
        patient_display_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        department VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'Normal',
        status VARCHAR(20) DEFAULT 'Waiting',
        complaint TEXT,
        service_name VARCHAR(255),
        queued_at TIMESTAMPTZ DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        served_at TIMESTAMPTZ,
        created_by UUID REFERENCES users(id),
        notes TEXT
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_queue_entries_department_status_queued_at ON queue_entries (department, status, queued_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_queue_entries_patient_department_active ON queue_entries (patient_id, department, status);`);
    console.log('✓ queue_entries table created');

    // 3d. Prescriptions table
    await query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prescription_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id) NOT NULL,
        queue_entry_id UUID REFERENCES queue_entries(id),
        doctor_id UUID REFERENCES users(id) NOT NULL,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        prepared_at TIMESTAMPTZ,
        dispensed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_status_created_at ON prescriptions (status, created_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_created_at ON prescriptions (patient_id, created_at);`);
    console.log('✓ prescriptions table created');

    // 3e. OTC sales and stock control tables
    await query(`
      CREATE TABLE IF NOT EXISTS otc_sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_number VARCHAR(50) UNIQUE NOT NULL,
        sale_date TIMESTAMPTZ DEFAULT NOW(),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(30),
        payment_method VARCHAR(50) NOT NULL,
        subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
        discount NUMERIC(12,2) NOT NULL DEFAULT 0,
        tax NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS otc_sale_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_id UUID REFERENCES otc_sales(id) ON DELETE CASCADE,
        inventory_id UUID REFERENCES inventory(id),
        item_code VARCHAR(100),
        item_name VARCHAR(255) NOT NULL,
        quantity NUMERIC(12,2) NOT NULL,
        unit_price NUMERIC(12,2) NOT NULL,
        line_total NUMERIC(12,2) NOT NULL
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_id UUID REFERENCES inventory(id) NOT NULL,
        movement_type VARCHAR(30) NOT NULL,
        quantity NUMERIC(12,2) NOT NULL,
        unit_cost NUMERIC(12,2),
        reason TEXT,
        reference_type VARCHAR(50),
        reference_id UUID,
        balance_before NUMERIC(12,2) NOT NULL DEFAULT 0,
        balance_after NUMERIC(12,2) NOT NULL DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_otc_sales_sale_date ON otc_sales (sale_date DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_date ON stock_movements (inventory_id, created_at DESC);`);
    console.log('✓ otc_sales, otc_sale_items, stock_movements tables created');

    // 3c. Generic module items table (for module-based masters)
    await query(`
      CREATE TABLE IF NOT EXISTS module_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_slug VARCHAR(100) NOT NULL,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        payload JSONB DEFAULT '{}'::jsonb,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (module_slug, code)
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_module_items_slug_status ON module_items (module_slug, status);`);
    console.log('✓ module_items table created');

    // 4. Medical Records table
    await query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        visit_date DATE NOT NULL,
        vital_signs JSONB,
        physical_examination JSONB,
        assessment TEXT,
        diagnosis JSONB,
        treatment_plan TEXT,
        progress_notes JSONB,
        lab_results JSONB,
        imaging_results JSONB,
        attachments JSONB,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ medical_records table created');

    // 5. Billing table
    await query(`
      CREATE TABLE IF NOT EXISTS billing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        invoice_date DATE,
        amount_due NUMERIC(12, 2),
        items JSONB,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'Pending',
        payment_history JSONB,
        insurance_claim JSONB,
        balance NUMERIC(12, 2),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ billing table created');

    // 6. Inventory table
    await query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_name VARCHAR(255) NOT NULL,
        item_code VARCHAR(50) UNIQUE NOT NULL,
        item_type VARCHAR(100),
        category VARCHAR(100),
        supplier JSONB,
        location JSONB,
        quantity_in_stock INTEGER DEFAULT 0,
        reorder_level INTEGER,
        reorder_quantity INTEGER,
        unit_price NUMERIC(12, 2),
        total_value NUMERIC(12, 2),
        expiry_date DATE,
        batch_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ inventory table created');

    // 7. Tickets/Support table
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        priority VARCHAR(50) DEFAULT 'Medium',
        category VARCHAR(100),
        assigned_to UUID REFERENCES users(id),
        comments JSONB,
        attachments JSONB,
        resolution_notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ tickets table created');

    // 8. Pharmacy table
    await query(`
      CREATE TABLE IF NOT EXISTS pharmacy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        drug_name VARCHAR(255) NOT NULL,
        drug_code VARCHAR(50) UNIQUE NOT NULL,
        manufacturer VARCHAR(255),
        dosage VARCHAR(100),
        unit_type VARCHAR(50),
        quantity_available INTEGER,
        unit_price NUMERIC(12, 2),
        batch_number VARCHAR(100),
        expiry_date DATE,
        storage_location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ pharmacy table created');

    // 9. Laboratory Orders table
    await query(`
      CREATE TABLE IF NOT EXISTS laboratory_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        test_name VARCHAR(255) NOT NULL,
        test_code VARCHAR(50),
        order_date DATE,
        requested_by UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'Pending',
        results JSONB,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ laboratory_orders table created');

    // 10. Radiology Orders table
    await query(`
      CREATE TABLE IF NOT EXISTS radiology_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        imaging_type VARCHAR(100),
        modality VARCHAR(100),
        order_date DATE,
        requested_by UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'Pending',
        results JSONB,
        radiologist_notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ radiology_orders table created');

    // 11. Theatre/Surgery Bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS theatre_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        surgeon_id UUID REFERENCES users(id),
        anesthetist_id UUID REFERENCES users(id),
        procedure_name VARCHAR(255) NOT NULL,
        scheduled_date TIMESTAMP NOT NULL,
        duration_minutes INTEGER,
        theatre_number VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Scheduled',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ theatre_bookings table created');

    // 12. In-Patient Admissions table
    await query(`
      CREATE TABLE IF NOT EXISTS inpatient_admissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admission_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        admission_date TIMESTAMP NOT NULL,
        ward VARCHAR(100),
        bed_number VARCHAR(50),
        attending_doctor UUID REFERENCES users(id),
        admission_diagnosis TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        discharge_date TIMESTAMP,
        discharge_notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ inpatient_admissions table created');

    // 13. Emergency Cases table
    await query(`
      CREATE TABLE IF NOT EXISTS emergency_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        arrival_time TIMESTAMP NOT NULL,
        chief_complaint TEXT,
        severity_level VARCHAR(50),
        assigned_doctor UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'Active',
        disposition TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ emergency_cases table created');

    // 14. Triage/Nursing table
    await query(`
      CREATE TABLE IF NOT EXISTS triage_nursing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        triage_date DATE NOT NULL,
        triage_time TIME,
        vital_signs JSONB,
        chief_complaint TEXT,
        triage_level VARCHAR(50),
        assigned_nurse UUID REFERENCES users(id),
        nursing_notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ triage_nursing table created');

    // 15. Blood Bank table
    await query(`
      CREATE TABLE IF NOT EXISTS blood_bank (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blood_unit_id VARCHAR(50) UNIQUE NOT NULL,
        blood_type VARCHAR(10) NOT NULL,
        rh_factor VARCHAR(10),
        quantity_units INTEGER,
        collection_date DATE,
        expiry_date DATE,
        donor_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Available',
        storage_location VARCHAR(255),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ blood_bank table created');

    // 16. Mortuary table
    await query(`
      CREATE TABLE IF NOT EXISTS mortuary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        date_of_death TIMESTAMP NOT NULL,
        cause_of_death TEXT,
        body_location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Stored',
        release_date TIMESTAMP,
        released_to VARCHAR(255),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ mortuary table created');

    // 17. Nutrition/Dietetics table
    await query(`
      CREATE TABLE IF NOT EXISTS nutrition (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        assessment_date DATE NOT NULL,
        dietary_assessment TEXT,
        nutrition_plan TEXT,
        meal_schedule JSONB,
        allergens JSONB,
        modified_diet VARCHAR(255),
        recommended_by UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'Active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ nutrition table created');

    // 18. Procurement table
    await query(`
      CREATE TABLE IF NOT EXISTS procurement (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        items JSONB,
        total_amount NUMERIC(12, 2),
        po_date DATE,
        expected_delivery_date DATE,
        actual_delivery_date DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ procurement table created');

    // 19. Accounts Receivable table
    await query(`
      CREATE TABLE IF NOT EXISTS accounts_receivable (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        billing_id UUID REFERENCES billing(id),
        patient_id UUID REFERENCES patients(id),
        invoice_amount NUMERIC(12, 2),
        paid_amount NUMERIC(12, 2) DEFAULT 0,
        outstanding_amount NUMERIC(12, 2),
        invoice_date DATE,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'Outstanding',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ accounts_receivable table created');

    // 20. General Ledger table
    await query(`
      CREATE TABLE IF NOT EXISTS general_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_code VARCHAR(50),
        account_name VARCHAR(255),
        debit NUMERIC(12, 2) DEFAULT 0,
        credit NUMERIC(12, 2) DEFAULT 0,
        balance NUMERIC(12, 2),
        transaction_date DATE,
        description TEXT,
        reference_number VARCHAR(100),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ general_ledger table created');

    // 21. Messaging/Communication table
    await query(`
      CREATE TABLE IF NOT EXISTS messaging (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id),
        recipient_id UUID REFERENCES users(id),
        subject VARCHAR(255),
        message TEXT,
        message_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Sent',
        is_read BOOLEAN DEFAULT false,
        attachment_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ messaging table created');

    // 22. Fixed Assets table
    await query(`
      CREATE TABLE IF NOT EXISTS fixed_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_code VARCHAR(50) UNIQUE NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        purchase_date DATE,
        purchase_price NUMERIC(12, 2),
        current_value NUMERIC(12, 2),
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        depreciation_method VARCHAR(100),
        useful_life_years INTEGER,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ fixed_assets table created');

    // 23. Insurance table
    await query(`
      CREATE TABLE IF NOT EXISTS insurance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        policy_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        insurer_name VARCHAR(255),
        policy_holder_name VARCHAR(255),
        group_number VARCHAR(100),
        coverage_amount NUMERIC(12, 2),
        deductible NUMERIC(12, 2),
        effective_date DATE,
        expiry_date DATE,
        status VARCHAR(50) DEFAULT 'Active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ insurance table created');

    // 24. Dashboard/Reports table (for cached data)
    await query(`
      CREATE TABLE IF NOT EXISTS dashboard_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(255) NOT NULL,
        metric_value NUMERIC(12, 2),
        metric_date DATE,
        department VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ dashboard_metrics table created');

    // 25. CSSD (Central Sterile Supply Department) table
    await query(`
      CREATE TABLE IF NOT EXISTS cssd (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_code VARCHAR(50) UNIQUE NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        quantity INTEGER,
        sterilization_method VARCHAR(100),
        last_sterilized_date TIMESTAMP,
        expiry_date DATE,
        storage_location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Available',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ cssd table created');

    // 26. Telemedicine Sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS telemedicine_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(50) UNIQUE NOT NULL,
        patient_id UUID REFERENCES patients(id),
        doctor_id UUID REFERENCES users(id),
        session_date TIMESTAMP,
        duration_minutes INTEGER,
        platform VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Scheduled',
        session_notes TEXT,
        recording_url TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ telemedicine_sessions table created');

    // Create indexes for better query performance
    await query(`CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON billing(patient_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_inpatient_patient_id ON inpatient_admissions(patient_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);

    console.log('\n✅ All tables created successfully!');
    console.log('📊 Total tables created: 26 core tables + system tables\n');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
};

const main = async () => {
  try {
    await createTables();
    await pool.end();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { createTables };
