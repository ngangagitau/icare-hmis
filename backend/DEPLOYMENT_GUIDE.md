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
- MongoDB (v4.4 or higher)
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
   MONGO_URI=mongodb://localhost:27017/icare-hmis
   JWT_SECRET=your_development_secret_key
   CLIENT_URL=http://localhost:5173
   ```

5. **Ensure MongoDB is running**
   ```bash
   # On Windows
   mongod
   
   # On macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
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

4. **Install MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
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
   MONGO_URI=mongodb://localhost:27017/icare-hmis-prod
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
     -e MONGO_URI=mongodb://mongo:27017/icare-hmis \
     -e JWT_SECRET=your_secret_key \
     --link mongo:mongo \
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
      MONGO_URI: mongodb://mongo:27017/icare-hmis
      JWT_SECRET: ${JWT_SECRET}
      CLIENT_URL: https://your-domain.com
    depends_on:
      - mongo
    networks:
      - icare-network
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: icare-hmis
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
  mongo-data:

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
MONGO_URI=mongodb://localhost:27017/icare-hmis
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
MONGO_URI=mongodb://prod-server:27017/icare-hmis
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

### MongoDB Backup

```bash
# Backup database
mongodump --db icare-hmis --out=/backups/icare-hmis-backup

# Restore database
mongorestore --db icare-hmis /backups/icare-hmis-backup/icare-hmis
```

### Create Database Indexes

```javascript
// Run in MongoDB shell
use icare-hmis;

// Patient indexes
db.patients.createIndex({ patientId: 1 });
db.patients.createIndex({ firstName: 1, lastName: 1 });
db.patients.createIndex({ phone: 1 });

// Appointment indexes
db.appointments.createIndex({ appointmentDate: 1 });
db.appointments.createIndex({ doctor: 1 });
db.appointments.createIndex({ patient: 1 });

// Billing indexes
db.billings.createIndex({ billDate: 1 });
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

### MongoDB Monitoring
```bash
# Connect to MongoDB shell
mongo

# Check database stats
db.stats()

# Check collection stats
db.patients.stats()

# Monitor active operations
db.currentOp()
```

---

## Performance Optimization

### Enable Compression
Already enabled in server.js with `compression()` middleware

### Database Connection Pooling
```javascript
// Already configured in database.js
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
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

### MongoDB Connection Failed
```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod

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
# Check MongoDB indexes
db.patients.getIndexes()

# Analyze query performance
db.patients.find(...).explain("executionStats")
```

### CORS Issues
- Update `CLIENT_URL` in .env to match frontend domain
- Check CORS middleware configuration in server.js

---

## Scaling Considerations

1. **Load Balancing**: Use Nginx for distributing requests
2. **Database Replication**: Setup MongoDB replica sets
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
- [ ] Setup MongoDB authentication
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Setup automated backups
- [ ] Monitor for suspicious activity
- [ ] Implement API versioning
- [ ] Use helmet for security headers

---

## Support

For deployment issues, check logs and contact the development team.