# iCare HMIS API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Doctor",
  "permissions": [
    {
      "module": "patients",
      "actions": ["read", "update"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49c1a2b4a5f1234567",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Doctor",
    "permissions": [...]
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49c1a2b4a5f1234567",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Doctor",
    "permissions": [...]
  }
}
```

### Get Current User
```
GET /auth/me
```

### Update User Details
```
PUT /auth/updatedetails
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.new@example.com"
}
```

### Update Password
```
PUT /auth/updatepassword
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Logout
```
GET /auth/logout
```

---

## Patient Management Endpoints

### Get All Patients
```
GET /patients?page=1&limit=25
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 25)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalPatients": 100,
    "hasNext": true,
    "hasPrev": false
  },
  "data": [...]
}
```

### Get Single Patient
```
GET /patients/:id
```

### Create Patient
```
POST /patients
```

**Request Body:**
```json
{
  "patientId": "P001",
  "firstName": "Alice",
  "lastName": "Johnson",
  "dateOfBirth": "1985-03-15",
  "gender": "Female",
  "phone": "+1234567890",
  "email": "alice@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "bloodType": "O+"
}
```

### Update Patient
```
PUT /patients/:id
```

### Delete Patient
```
DELETE /patients/:id
```

### Search Patients
```
GET /patients/search/:query
```

---

## Appointment Management Endpoints

### Get All Appointments
```
GET /appointments?page=1&limit=25&status=Scheduled&department=Cardiology
```

**Query Parameters:**
- `page`, `limit` (pagination)
- `status`: Scheduled, Confirmed, In Progress, Completed, Cancelled, No Show
- `department`: Medical department
- `doctor`: Doctor ID
- `patient`: Patient ID
- `startDate`, `endDate`: Date range

### Get Appointment by Date
```
GET /appointments/date/:date
```

### Get Doctor's Appointments
```
GET /appointments/doctor/:doctorId
```

### Get Patient's Appointments
```
GET /appointments/patient/:patientId
```

### Create Appointment
```
POST /appointments
```

**Request Body:**
```json
{
  "appointmentId": "APT001",
  "patient": "60d5ec49c1a2b4a5f1234567",
  "doctor": "60d5ec49c1a2b4a5f1234568",
  "department": "Cardiology",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:30",
  "duration": 30,
  "type": "Consultation",
  "reason": "Regular checkup",
  "symptoms": ["chest pain", "shortness of breath"]
}
```

### Update Appointment
```
PUT /appointments/:id
```

### Delete Appointment
```
DELETE /appointments/:id
```

---

## Medical Records Endpoints

### Get All Medical Records
```
GET /medical-records?page=1&limit=25&patient=<patientId>&status=Final
```

### Get Single Medical Record
```
GET /medical-records/:id
```

### Create Medical Record
```
POST /medical-records
```

**Request Body:**
```json
{
  "recordId": "MR001",
  "patient": "60d5ec49c1a2b4a5f1234567",
  "doctor": "60d5ec49c1a2b4a5f1234568",
  "visitDate": "2024-01-15",
  "chiefComplaint": "Chest pain",
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 72,
    "temperature": 37,
    "respiratoryRate": 16,
    "oxygenSaturation": 98,
    "weight": 70,
    "height": 175
  },
  "assessment": {
    "primaryDiagnosis": "Stable Angina",
    "secondaryDiagnoses": []
  }
}
```

### Update Medical Record
```
PUT /medical-records/:id
```

### Add Progress Note
```
POST /medical-records/:id/progress-note
```

**Request Body:**
```json
{
  "note": "Patient is responding well to treatment"
}
```

### Get Patient's Medical Records
```
GET /medical-records/patient/:patientId
```

---

## Inventory Management Endpoints

### Get All Inventory
```
GET /inventory?page=1&limit=25&category=Medications&status=Active
```

**Query Parameters:**
- `category`: Medications, Medical Supplies, Equipment, etc.
- `status`: Active, Inactive, Discontinued, Out of Stock
- `stockStatus`: Out of Stock, Low Stock, In Stock, Overstocked
- `search`: Search by name or item ID

### Get Single Item
```
GET /inventory/:id
```

### Create Inventory Item
```
POST /inventory
```

**Request Body:**
```json
{
  "itemId": "MED001",
  "name": "Paracetamol 500mg",
  "category": "Medications",
  "unitOfMeasure": "Tablet",
  "currentStock": 1000,
  "minimumStock": 100,
  "maximumStock": 2000,
  "reorderPoint": 200,
  "unitCost": 0.10,
  "sellingPrice": 0.25,
  "supplier": {
    "name": "PharmaCorp Inc.",
    "contact": "contact@pharmacorp.com"
  }
}
```

### Update Inventory Item
```
PUT /inventory/:id
```

### Update Stock
```
PUT /inventory/:id/stock
```

**Request Body:**
```json
{
  "quantity": 100,
  "operation": "add",
  "reason": "New stock received"
}
```

### Get Low Stock Alerts
```
GET /inventory/alerts/low-stock
```

### Get Expired Items
```
GET /inventory/alerts/expired
```

### Get Expiring Soon Items
```
GET /inventory/alerts/expiring-soon
```

---

## Billing Endpoints

### Get All Bills
```
GET /billing?page=1&limit=25&paymentStatus=Pending&patient=<patientId>
```

### Get Single Bill
```
GET /billing/:id
```

### Create Bill
```
POST /billing
```

**Request Body:**
```json
{
  "billId": "BILL001",
  "patient": "60d5ec49c1a2b4a5f1234567",
  "items": [
    {
      "description": "Doctor Consultation",
      "quantity": 1,
      "unitPrice": 50,
      "total": 50
    },
    {
      "description": "Blood Test",
      "quantity": 1,
      "unitPrice": 30,
      "total": 30
    }
  ],
  "subtotal": 80,
  "discount": 5,
  "tax": 10,
  "total": 85
}
```

### Record Payment
```
POST /billing/:id/payment
```

**Request Body:**
```json
{
  "amount": 50,
  "method": "Cash",
  "reference": "PAY123",
  "notes": "First payment"
}
```

### Get Patient's Bills
```
GET /billing/patient/:patientId
```

### Get Billing Summary
```
GET /billing/reports/summary
```

---

## Users Management Endpoints (Admin Only)

### Get All Users
```
GET /users?page=1&limit=25&role=Doctor&status=Active
```

### Get Single User
```
GET /users/:id
```

### Create User
```
POST /users
```

### Update User
```
PUT /users/:id
```

### Delete User
```
DELETE /users/:id
```

### Get Users by Role
```
GET /users/role/:role
```

### Update User Permissions
```
PUT /users/:id/permissions
```

**Request Body:**
```json
{
  "permissions": [
    {
      "module": "patients",
      "actions": ["read", "update"]
    }
  ]
}
```

### Update User Status
```
PUT /users/:id/status
```

**Request Body:**
```json
{
  "status": "Active"
}
```

---

## Reports & Analytics Endpoints

### Dashboard Summary
```
GET /reports/dashboard
```

### Patient Statistics
```
GET /reports/patients
```

### Appointment Statistics
```
GET /reports/appointments
```

### Billing Statistics
```
GET /reports/billing
```

### Patient Visit History
```
GET /reports/patient-visits/:patientId
```

### Top Doctors Report
```
GET /reports/top-doctors
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## Available User Roles

- **Super Admin**: Full system access
- **Admin**: Administrative functions
- **Doctor**: Medical staff access
- **Nurse**: Nursing staff
- **Pharmacist**: Pharmacy access
- **Lab Technician**: Laboratory access
- **Receptionist**: Front desk access

---

## Permission Modules

Each module can have these actions:
- `create`: Create new records
- `read`: View records
- `update`: Modify records
- `delete`: Remove records

**Available Modules:**
- patients
- appointments
- medical-records
- inventory
- billing
- reports
- users
- administration

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Reset**: Automatically resets after window expires

---

## Pagination

All list endpoints support pagination with:
- `page`: Current page (default: 1)
- `limit`: Records per page (default: 25)

Response includes:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalRecords": 250,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Support & Documentation

For additional support, refer to the main README.md or contact the development team.