# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js v16+
- PostgreSQL running locally or reachable via `DATABASE_URL`

### Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   # Or create .env with content from .env file in this directory
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Verify server is running**
   Open browser and visit: `http://localhost:5000/api/health`
   
   You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "message": "iCare HMIS API is running"
   }
   ```

---

## Common Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Run tests
npm test
```

---

## First Steps After Setup

### 1. Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@hospital.com",
    "password": "admin123",
    "role": "Super Admin",
    "permissions": [
      {"module": "patients", "actions": ["create", "read", "update", "delete"]},
      {"module": "appointments", "actions": ["create", "read", "update", "delete"]},
      {"module": "medical-records", "actions": ["create", "read", "update", "delete"]},
      {"module": "inventory", "actions": ["create", "read", "update", "delete"]},
      {"module": "billing", "actions": ["create", "read", "update", "delete"]},
      {"module": "reports", "actions": ["read"]},
      {"module": "users", "actions": ["create", "read", "update", "delete"]}
    ]
  }'
```

### 2. Login to Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }'
```

### 3. Copy the returned token and use in headers for other requests
```bash
Authorization: Bearer <your_token_here>
```

---

## Test API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Users (requires token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users
```

### Create Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "phone": "+1234567890",
    "email": "john@example.com"
  }'
```

---

## File Structure

```
backend/
├── middleware/        # Authentication & authorization
├── models/           # Database schemas
├── routes/           # API endpoint handlers
├── scripts/          # Database seeding
├── server.js         # Main application file
├── package.json      # Dependencies
├── .env             # Environment variables
└── README.md        # Documentation
```

---

## Troubleshooting

### PostgreSQL Connection Error
```
✗ Database initialization error: connect ECONNREFUSED
```
**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct
```bash
psql --version
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using port 5000 or use different port
```bash
# Linux/Mac
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

### Missing Dependencies
```
Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
npm install
```

---

## System Features & Modules

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Permission management per module

### Core Modules
✅ **Patients** - Patient registration & management  
✅ **Appointments** - Appointment scheduling & tracking  
✅ **Medical Records** - Electronic health records  
✅ **Inventory** - Medical supply management  
✅ **Billing** - Invoice & payment tracking  
✅ **Users** - User management & permissions  
✅ **Reports** - Analytics & dashboards  

### Available Roles
- Super Admin (Full access)
- Admin (Administrative)
- Doctor (Medical staff)
- Nurse (Nursing staff)
- Pharmacist (Pharmacy)
- Lab Technician (Laboratory)
- Receptionist (Front desk)

---

## API Documentation

For comprehensive API documentation, see: **API_DOCUMENTATION.md**

---

## Deployment

For production deployment guide, see: **DEPLOYMENT_GUIDE.md**

---

## Support & Next Steps

1. **Frontend Integration**: Connect your React frontend using the token from `/auth/login`
2. **Database Seeding**: Run `npm run seed` to populate sample data
3. **Environment Configuration**: Update `.env` for your specific setup
4. **API Testing**: Use Postman or similar tool to test endpoints
5. **Production Deployment**: Follow DEPLOYMENT_GUIDE.md

---

## Need Help?

- Check logs: `npm run dev` shows real-time server output
- Review API_DOCUMENTATION.md for endpoint details
- Check DEPLOYMENT_GUIDE.md for setup issues
- Verify PostgreSQL tools are installed: `psql --version`

Happy coding! 🚀
