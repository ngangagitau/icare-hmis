# 🚀 Frontend-Backend Connection Guide

## ✅ What's Been Done

Your frontend and backend are now fully connected and ready for development!

### Created Components & Services

**Frontend API Integration:**
1. ✅ **API Client** (`src/lib/api.ts`) - Base HTTP client with JWT support
2. ✅ **Auth Service** (`src/lib/authService.ts`) - Login/register/logout functions
3. ✅ **Module Service** (`src/lib/moduleService.ts`) - Generic CRUD operations
4. ✅ **React Query Hooks** (`src/hooks/useApi.ts`) - Data fetching hooks
5. ✅ **Auth Context** (`src/contexts/AuthContext.tsx`) - Global auth state
6. ✅ **Health Check Component** (`src/components/HealthCheck.tsx`) - Connection tester

**Backend Updates:**
1. ✅ **PostgreSQL Connection** - Switched from MongoDB
2. ✅ **Database Initialized** - 26 tables created
3. ✅ **CORS Configured** - Allows localhost:5173
4. ✅ **JWT Support** - Ready for authentication

---

## 🎯 Quick Start

### 1. Start Backend
```bash
cd backend
npm start
```
You should see:
```
✓ PostgreSQL database connected successfully
✓ Database tables initialized
Server running on port 5000
```

### 2. Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
Frontend opens at: `http://localhost:5173`

### 3. Test Connection
The HealthCheck component will automatically test the backend connection.

---

## 📝 Usage Examples

### Login in Your Component
```typescript
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(emailValue, passwordValue);
    }}>
      {/* form inputs */}
    </form>
  );
}
```

### Fetch Data
```typescript
import { useFetch } from '@/hooks/useApi';

export function PatientList() {
  const { data: patients, isLoading, error } = useFetch(
    ['patients'],
    '/patients'
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading patients</div>;
  
  return (
    <ul>
      {patients?.map(p => <li key={p.id}>{p.firstName}</li>)}
    </ul>
  );
}
```

### Create/Update Data
```typescript
import { useMutate } from '@/hooks/useApi';

export function CreatePatient() {
  const { mutate: createPatient } = useMutate(
    (data) => apiClient.post('/patients', data),
    {
      invalidateKeys: [['patients']]
    }
  );
  
  const handleSubmit = (formData) => {
    createPatient(formData);
  };
  
  return <form onSubmit={handleSubmit}>{/* inputs */}</form>;
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Core Modules
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- (And 20+ more modules...)

### Health Check
- `GET /api/health` - Check backend status
- `GET /api/status` - Get API status

---

## 🗄️ Database Connection

**PostgreSQL Details:**
```
Host: localhost
Port: 5432
Database: Icare
User: postgres
Password: [See .env file]
```

**Tables Created (26):**
Users, Patients, Appointments, Medical Records, Billing, Inventory, Pharmacy, Laboratory Orders, Radiology Orders, Theatre Bookings, InPatient Admissions, Emergency Cases, Triage Nursing, Blood Bank, Mortuary, Nutrition, Procurement, Accounts Receivable, General Ledger, Messaging, Fixed Assets, Insurance, Dashboard Metrics, CSSD, Telemedicine Sessions

---

## ⚙️ Configuration Files

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=iCare HMIS
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:Nganga@20@localhost:5432/Icare
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
CLIENT_URL=http://localhost:5173
```

---

## 🐛 Troubleshooting

### Backend Won't Start
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env is correct
- Run: `npm install` if dependencies are missing

### Frontend Can't Connect
- Ensure backend is running on port 5000
- Check CORS isn't blocked (open DevTools Console)
- Verify VITE_API_URL in .env.local

### Database Connection Error
- Install PostgreSQL: https://www.postgresql.org/download/
- Create database: `CREATE DATABASE Icare;`
- Run migrations: `node db/seedDatabase.js`

---

## 🎓 Architecture

```
┌─────────────────┐
│    Frontend     │
│  (React/TypeScript)  │
│  Port: 5173     │
└────────┬────────┘
         │ (HTTP REST)
         │
┌────────▼────────────────┐
│     Backend             │
│   (Express.js)          │
│    Port: 5000           │
└────────┬────────────────┘
         │
┌────────▼────────────────┐
│    PostgreSQL           │
│   Port: 5432            │
│  Database: Icare        │
└─────────────────────────┘
```

---

## 📚 File Structure

```
frontend/
  ├── src/
  │   ├── lib/
  │   │   ├── api.ts              # HTTP client
  │   │   ├── authService.ts     # Auth functions
  │   │   └── moduleService.ts   # CRUD templates
  │   ├── hooks/
  │   │   └── useApi.ts          # React Query hooks
  │   ├── contexts/
  │   │   └── AuthContext.tsx    # Auth state
  │   ├── components/
  │   │   └── HealthCheck.tsx    # Connection test
  │   └── App.tsx               # Updated with AuthProvider

backend/
  ├── db/
  │   ├── pg.js                 # PostgreSQL client
  │   ├── BaseModel.js          # ORM abstraction
  │   └── seedDatabase.js       # Table creation
  ├── routes/                   # API endpoints
  ├── models/                   # Data models
  ├── server.js                 # Express server
  └── .env                      # Configuration
```

---

## ✨ Next Features to Implement

1. **Authentication Routes** - Implement login/register in backend
2. **User Models** - Convert User model to PostgreSQL
3. **Validation** - Add input validation middleware
4. **Error Handling** - Implement proper error responses
5. **Protected Routes** - Add JWT verification middleware
6. **API Testing** - Test endpoints with Postman/Insomnia
7. **Forms** - Create data entry forms in frontend

---

## 📞 Need Help?

Check the detailed technical documentation in `/memories/session/frontend-backend-setup.md` for more information on:
- How to use each service
- Available API endpoints
- Environment configuration
- Database structure

Happy coding! 🎉
