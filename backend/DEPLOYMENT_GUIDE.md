# Deployment Guide for iCare HMIS Backend

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v14 or higher recommended)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd icare-hmis/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` and set:
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/icare_hmis
   JWT_SECRET=your_development_secret_key
   CLIENT_URL=http://localhost:5173
   ```

5. **Ensure PostgreSQL is running**
   ```bash
   # On Windows
   psql --version
   
   # On macOS (if installed via Homebrew)
   brew services start postgresql
   
   # On Linux
   sudo systemctl start postgresql
   ```

6. **Seed initial data (optional)**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

---

## Production Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Select Ubuntu 20.04 LTS AMI
   - Instance type: t3.medium or larger
   - Security group: Allow ports 80, 443, 5000

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PostgreSQL**
   ```bash
   sudo apt-get update
   sudo apt-get install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

5. **Clone Repository**
   ```bash
   cd /home/ubuntu
   git clone <repository-url>
   cd icare-hmis/backend
   npm install
   ```

6. **Create Production .env**
   ```bash
   nano .env
   ```
   
   Set production values:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/icare_hmis_prod
   JWT_SECRET=your_long_secure_production_secret_key
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-domain.com
   ```

7. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

8. **Start Application with PM2**
   ```bash
   pm2 start server.js --name "icare-hmis-api"
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   ```
   
   Create `/etc/nginx/sites-available/icare-hmis`:
   ```nginx
   upstream icare_api {
     server 127.0.0.1:5000;
   }

   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://icare_api;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   Enable the config:
   ```bash
   sudo ln -s /etc/nginx/sites-available/icare-hmis /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## Docker Deployment

### Build Docker Image

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install --production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

2. **Create .dockerignore**
   ```
   node_modules
   npm-debug.log
   .env
   .git
   .gitignore
   ```

3. **Build Image**
   ```bash
   docker build -t icare-hmis-api:1.0.0 .
   ```

4. **Run Container**
   ```bash
   docker run -d \
     --name icare-hmis \
     -p 5000:5000 \
     -e NODE_ENV=production \
    -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/icare_hmis \
     -e JWT_SECRET=your_secret_key \
    --link postgres:postgres \
     icare-hmis-api:1.0.0
   ```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '5000:5000'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/icare_hmis
      JWT_SECRET: ${JWT_SECRET}
      CLIENT_URL: https://your-domain.com
    depends_on:
      - postgres
    networks:
      - icare-network
    restart: unless-stopped

  postgres:
    image: postgres:16
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: icare_hmis
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    networks:
      - icare-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - icare-network
    restart: unless-stopped

volumes:
  postgres-data:

networks:
  icare-network:
    driver: bridge
```

Start services:
```bash
docker-compose up -d
```

---

## Environment Configuration

### Development (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/icare_hmis
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

### Production (.env)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:password@prod-server:5432/icare_hmis
JWT_SECRET=your_very_long_secure_production_key_minimum_32_characters
JWT_EXPIRE=7d
CLIENT_URL=https://your-domain.com
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=15
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_EMAIL=noreply@your-domain.com
SMTP_PASSWORD=your_email_password
```

---

## Database Setup

### PostgreSQL Backup

```bash
# Backup database
pg_dump "$DATABASE_URL" > /backups/icare-hmis-backup.sql

# Restore database
psql "$DATABASE_URL" < /backups/icare-hmis-backup.sql
```

### Create Database Indexes

```javascript
-- Run in psql
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON billing(patient_id);
db.billings.createIndex({ paymentStatus: 1 });

// Medical records indexes
db.medicalrecords.createIndex({ patient: 1 });
db.medicalrecords.createIndex({ visitDate: 1 });
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Check logs
pm2 logs icare-hmis-api

# Monitor processes
pm2 monit

# Get process info
pm2 info icare-hmis-api
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL Monitoring
```bash
# Connect to PostgreSQL
psql "$DATABASE_URL"

# Check database stats
\l+

# Check table stats
\dt

# Monitor active operations
SELECT pid, usename, state, query FROM pg_stat_activity;
```

---

## Performance Optimization

### Enable Compression
Already enabled in server.js with `compression()` middleware

### Database Connection Pooling
```javascript
// Already configured in db/pg.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});
```

### Caching (Optional with Redis)
```bash
npm install redis
```

### Enable HTTP/2
Configure in Nginx:
```nginx
listen 443 ssl http2;
```

---

## Troubleshooting

### Port 5000 Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### PostgreSQL Connection Failed
```bash
# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Check connection string in .env
```

### JWT Token Expired
- Token expiry is set in .env (default: 30d for dev, 7d for prod)
- Users need to login again after expiry

### High Memory Usage
```bash
# Monitor Node process
pm2 monit

# Restart application
pm2 restart icare-hmis-api
```

### Database Performance Issues
```bash
# Check PostgreSQL indexes
\d patients

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM patients;
```

### CORS Issues
- Update `CLIENT_URL` in .env to match frontend domain
- Check CORS middleware configuration in server.js

---

## Scaling Considerations

1. **Load Balancing**: Use Nginx for distributing requests
2. **Database Replication**: Setup PostgreSQL replication or managed failover
3. **Caching**: Implement Redis for frequently accessed data
4. **CDN**: Use CDN for static assets
5. **Horizontal Scaling**: Run multiple instances with PM2 Cluster mode

### PM2 Cluster Mode
```bash
pm2 start server.js -i max --name "icare-hmis"
```

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong value
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Secure PostgreSQL credentials and network access
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Setup automated backups
- [ ] Monitor for suspicious activity
- [ ] Implement API versioning
- [ ] Use helmet for security headers

---

## Support

For deployment issues, check logs and contact the development team.
