# iCare HMIS Backend API

A comprehensive Hospital Management Information System (HMIS) backend built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based permissions
- **Patient Management**: Complete patient registration and management system
- **Appointment Scheduling**: Doctor-patient appointment management with conflict detection
- **Medical Records**: Comprehensive electronic health records with progress notes
- **Inventory Management**: Hospital inventory tracking with stock alerts and expiration monitoring
- **RESTful API**: Well-structured REST API endpoints
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Scalable Architecture**: Modular design with separate routes and middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd icare-hmis/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update the configuration values
   - Ensure MongoDB is running on your system

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `GET /api/auth/logout` - Logout

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/search/:query` - Search patients

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/date/:date` - Get appointments by date
- `GET /api/appointments/doctor/:doctorId` - Get doctor's appointments
- `GET /api/appointments/patient/:patientId` - Get patient's appointments

### Medical Records
- `GET /api/medical-records` - Get all medical records
- `GET /api/medical-records/:id` - Get single medical record
- `POST /api/medical-records` - Create new medical record
- `PUT /api/medical-records/:id` - Update medical record
- `DELETE /api/medical-records/:id` - Delete medical record
- `GET /api/medical-records/patient/:patientId` - Get patient's records
- `POST /api/medical-records/:id/progress-note` - Add progress note

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get single inventory item
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PUT /api/inventory/:id/stock` - Update stock quantity
- `GET /api/inventory/alerts/low-stock` - Get low stock alerts
- `GET /api/inventory/alerts/expired` - Get expired items
- `GET /api/inventory/alerts/expiring-soon` - Get items expiring soon

## User Roles & Permissions

### Available Roles:
- **Super Admin**: Full system access
- **Admin**: Administrative functions
- **Doctor**: Medical staff access
- **Nurse**: Nursing staff access
- **Pharmacist**: Pharmacy access
- **Lab Technician**: Laboratory access
- **Receptionist**: Front desk access

### Permission Modules:
- patients, appointments, medical-records, inventory, billing, reports, administration

## Data Models

### User
- Authentication and authorization
- Role-based permissions
- Profile management

### Patient
- Personal information
- Medical history
- Emergency contacts
- Insurance details

### Appointment
- Scheduling and management
- Doctor-patient assignments
- Status tracking

### Medical Record
- Electronic health records
- Vital signs and examinations
- Diagnoses and treatments
- Progress notes

### Inventory
- Item management
- Stock tracking
- Supplier information
- Expiration monitoring

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive input sanitization
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers

## Development

### Project Structure
```
backend/
├── middleware/          # Authentication & authorization middleware
├── models/             # Mongoose data models
├── routes/             # API route handlers
├── config/             # Configuration files
├── scripts/            # Database seeding and utilities
├── uploads/            # File upload directory
├── server.js           # Main application entry point
├── package.json        # Dependencies and scripts
└── .env               # Environment variables
```

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
npm run seed
```

## Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update MongoDB connection string for production
3. Configure proper JWT secret
4. Set up reverse proxy (nginx recommended)
5. Enable SSL/TLS certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.