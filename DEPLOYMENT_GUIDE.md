# Crown Bingo - Production Deployment Guide

## Overview

This guide covers deploying the Crown Bingo system to production environments across multiple deployment scenarios.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Development Environment Setup](#development-environment-setup)
3. [Production Architecture](#production-architecture)
4. [Deployment Options](#deployment-options)
5. [Database Deployment](#database-deployment)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Rollback Procedures](#rollback-procedures)
10. [Performance Tuning](#performance-tuning)

---

## Pre-Deployment Checklist

### Security Checks
- [ ] Firebase security rules reviewed and tested
- [ ] API keys and secrets moved to environment variables
- [ ] SSL/TLS certificates obtained
- [ ] Service account keys stored securely
- [ ] Admin claims configured for admins only
- [ ] Database access restricted by role
- [ ] CORS policies configured correctly

### Functionality Tests
- [ ] All three applications tested (Admin, BackOffice, User)
- [ ] Login flow verified for all user types
- [ ] User creation workflow tested
- [ ] Wallet recharge functionality tested
- [ ] Game creation and completion tested
- [ ] Transaction history generation tested
- [ ] Real-time listeners working

### Performance Tests
- [ ] Load testing completed (min 1000 concurrent users)
- [ ] Database query optimization verified
- [ ] API response times acceptable (<200ms)
- [ ] Firestore indexes created
- [ ] CDN configured for static assets

### Documentation
- [ ] API documentation complete
- [ ] User/Admin manuals prepared
- [ ] Troubleshooting guides written
- [ ] Architecture diagrams created
- [ ] Runbooks created for operations team

### Backup & Recovery
- [ ] Backup procedures tested
- [ ] Recovery procedures tested
- [ ] Disaster recovery plan documented
- [ ] Data retention policy defined

---

## Development Environment Setup

### Prerequisites

**Local Development:**
```bash
# Node.js
node --version  # v16 or higher
npm --version   # v8 or higher

# Python (for HTTP server)
python --version  # v3.8 or higher

# Git
git --version  # Latest version

# Code Editor
# VS Code recommended
```

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd "Crown Bingo"

# Install Admin Panel dependencies
cd admin-panel
npm install

# Install API layer dependencies (if using Node backend)
cd ../api
npm install

# Return to root
cd ..
```

### Environment Variables (.env files)

**admin-panel/.env**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37-5661f.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bingo-27d37-5661f
REACT_APP_FIREBASE_STORAGE_BUCKET=bingo-27d37-5661f.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=330815222659
REACT_APP_FIREBASE_APP_ID=1:330815222659:web:4890bf5cddc728bf29bcb6
REACT_APP_FIREBASE_MEASUREMENT_ID=G-CD4DWDC8SW
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

**api/.env**
```
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=bingo-27d37
FIREBASE_PROJECT_ID_ADMIN=bingo-27d37-5661f
DATABASE_URL=localhost:27017
REDIS_URL=localhost:6379
JWT_SECRET=your-secret-key-here
LOG_LEVEL=info
```

---

## Production Architecture

### Recommended Production Setup

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────────┬──────────────┬──────────────┐      │
│  │  Admin Panel     │  Back Office │  User App    │      │
│  │  (React Build)   │  (React B.)  │  (React B.)  │      │
│  └────────┬─────────┴──────┬───────┴──────┬───────┘      │
└───────────┼────────────────┼──────────────┼───────────────┘
            │                │              │
            │                │              │
┌───────────┼────────────────┼──────────────┼───────────────┐
│                   CDN / Static Content                    │
│              (CloudFlare / AWS CloudFront)                │
└───────────┼────────────────┼──────────────┼───────────────┘
            │                │              │
            └────────────┬───┴──────────────┘
                         │
┌────────────────────────┼──────────────────────────────────┐
│                   API Gateway                             │
│              (nginx / AWS ALB)                            │
│  - Rate Limiting                                          │
│  - DDoS Protection                                        │
│  - SSL/TLS Termination                                    │
└────────────────┬───────────────────────────────────────────┘
                 │
    ┌────────────┴──────────────┐
    │                           │
┌───┴──────────┐        ┌──────┴──────┐
│  API Layer   │        │  Cache      │
│ (Node.js)    │        │  (Redis)    │
│              │        │             │
│ - Auth       │        │ - Sessions  │
│ - Business   │        │ - Settings  │
│ - Data Sync  │        │             │
└───┬──────────┘        └─────────────┘
    │
    │        ┌────────────────────┐
    └────────┤  Firebase          │
             │  Projects          │
             │                    │
             │ - bingo-27d37      │
             │ - bingo-27d37-5661f│
             │                    │
             │ - Firestore        │
             │ - Auth             │
             │ - Storage          │
             └────────────────────┘

┌─────────────────────────────────────────────────────────┐
│             Monitoring & Logging                         │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ Cloud        │ Application  │  Error       │         │
│  │ Logging      │  Monitoring  │  Tracking    │         │
│  └──────────────┴──────────────┴──────────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Options

### Option 1: Cloud Platform (AWS - Recommended)

#### 1.1 AWS Elastic Beanstalk (Node.js API)

```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init -p node.js-14 crown-bingo-api

# Create environment
eb create crown-bingo-prod

# Deploy
eb deploy

# Configure environment variables
eb setenv \
  FIREBASE_PROJECT_ID=bingo-27d37 \
  NODE_ENV=production

# View logs
eb logs

# SSH into instance
eb ssh
```

#### 1.2 AWS S3 + CloudFront (Static Files)

```bash
# Create S3 bucket
aws s3 mb s3://crown-bingo-static --region us-east-1

# Build React applications
cd admin-panel && npm run build
cd ../superagentcrownbingo && npm run build
cd ../crownbingo && npm run build

# Upload to S3
aws s3 sync admin-panel/build s3://crown-bingo-static/admin/
aws s3 sync superagentcrownbingo/build s3://crown-bingo-static/backoffice/
aws s3 sync crownbingo/build s3://crown-bingo-static/user/

# Create CloudFront distribution
# Console: CloudFront → Create Distribution
# Origin: S3 bucket
# Cache behavior: index.html always fresh
```

#### 1.3 AWS RDS (PostgreSQL for transactional data)

```bash
# Create RDS instance (optional, if moving away from Firebase)
aws rds create-db-instance \
  --db-instance-identifier crown-bingo-db \
  --engine postgres \
  --db-instance-class db.t3.micro \
  --allocated-storage 20

# Get connection string
aws rds describe-db-instances --query 'DBInstances[0].[Endpoint.Address,Endpoint.Port]'

# Update environment variable
eb setenv DATABASE_URL=postgresql://user:pass@host:5432/crownbingo
```

#### 1.4 AWS ElastiCache (Redis)

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id crown-bingo-cache \
  --engine redis \
  --cache-node-type cache.t3.micro

# Get endpoint
aws elasticache describe-cache-clusters --query 'CacheClusters[0].CacheNodes[0].Endpoint'

# Update environment
eb setenv REDIS_URL=redis://endpoint:6379
```

---

### Option 2: Docker + Kubernetes

#### 2.1 Create Docker Images

**Dockerfile (API)**
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]
```

**Dockerfile (Static Apps)**
```dockerfile
FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2.2 Build and Push Images

```bash
# Build API image
docker build -f api/Dockerfile -t crown-bingo-api:1.0 ./api
docker tag crown-bingo-api:1.0 your-registry/crown-bingo-api:1.0
docker push your-registry/crown-bingo-api:1.0

# Build static apps image
docker build -f Dockerfile -t crown-bingo-web:1.0 .
docker tag crown-bingo-web:1.0 your-registry/crown-bingo-web:1.0
docker push your-registry/crown-bingo-web:1.0
```

#### 2.3 Kubernetes Deployment

**k8s/api-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crown-bingo-api
  namespace: crown-bingo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crown-bingo-api
  template:
    metadata:
      labels:
        app: crown-bingo-api
    spec:
      containers:
      - name: api
        image: your-registry/crown-bingo-api:1.0
        ports:
        - containerPort: 5000
        env:
        - name: PORT
          value: "5000"
        - name: NODE_ENV
          value: "production"
        - name: FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: firebase-config
              key: project-id
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**k8s/service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: crown-bingo-api-service
  namespace: crown-bingo
spec:
  selector:
    app: crown-bingo-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

**Deploy to Kubernetes**
```bash
# Create namespace
kubectl create namespace crown-bingo

# Create secrets
kubectl create secret generic firebase-config \
  --from-literal=project-id=bingo-27d37 \
  -n crown-bingo

# Apply deployments
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get deployments -n crown-bingo
kubectl get services -n crown-bingo
```

---

### Option 3: Google Cloud (Firebase Hosting + Cloud Functions)

#### 3.1 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Build applications
cd admin-panel && npm run build && cd ..
cd superagentcrownbingo && npm run build && cd ..
cd crownbingo && npm run build && cd ..

# Deploy to Firebase Hosting
firebase deploy --only hosting

# View deployed app
firebase open hosting:site
```

#### 3.2 Deploy API as Cloud Function

**functions/index.js**
```javascript
const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

admin.initializeApp();

const app = express();

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, phone, initialBalance } = req.body;
    // User creation logic
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export as Cloud Function
exports.api = functions.https.onRequest(app);
```

**Deploy**
```bash
firebase deploy --only functions
```

---

## Database Deployment

### Firebase Firestore Setup

#### 1. Create Firestore Database

```bash
# Via gcloud CLI
gcloud firestore databases create \
  --project bingo-27d37 \
  --region us-east1

# Or via Firebase Console:
# Project Settings → Firestore → Create Database
```

#### 2. Create Collections and Indexes

```bash
# Run this script to initialize collections
firebase firestore:start
```

**init-db.js**
```javascript
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function initializeDatabase() {
  // Create collections (will be created on first write)
  const collections = ['users', 'agents', 'transactions', 'games', 'bets', 'settings'];
  
  for (const collection of collections) {
    console.log(`Initializing ${collection} collection...`);
    // Write dummy document and delete it
    const docRef = db.collection(collection).doc('_init');
    await docRef.set({ initialized: true });
    await docRef.delete();
  }
  
  console.log('Database initialized successfully');
}

initializeDatabase().catch(console.error);
```

#### 3. Create Composite Indexes

```bash
# Firestore indexes for performance
# Via Firebase Console: Firestore → Indexes

# Recommended indexes:
# 1. users: isActive, createdAt (ascending)
# 2. users: isDisabled, createdAt (ascending)
# 3. transactions: userId, timestamp (descending)
# 4. agents: isActive, totalEarnings (descending)
# 5. games: userId, timestamp (descending)
```

#### 4. Set Security Rules

**firestore.rules**
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.admin == true);
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
      allow create: if request.auth != null &&
        (request.auth.token.admin == true || 
         request.auth.token.agent == true);
    }
    
    // Agents collection
    match /agents/{agentId} {
      allow read: if request.auth != null &&
        (request.auth.token.admin == true ||
         request.auth.uid == agentId);
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         request.auth.token.admin == true);
      allow create: if request.auth != null &&
        (request.auth.token.admin == true || 
         request.auth.token.agent == true);
    }
    
    // Games collection
    match /games/{gameId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         request.auth.token.admin == true);
      allow write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

**Deploy rules**
```bash
firebase deploy --only firestore:rules
```

---

## Security Configuration

### SSL/TLS Certificates

#### Using AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name crownbingo.com \
  --subject-alternative-names www.crownbingo.com \
  --validation-method DNS

# Verify domain ownership (in Route53)
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://dns-verification.json
```

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d crownbingo.com -d www.crownbingo.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Environment Variables Security

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name crown-bingo/firebase \
  --secret-string file://firebase-secrets.json

# Retrieve in application
const secretsManager = new AWS.SecretsManager();
const secret = await secretsManager.getSecretValue({
  SecretId: 'crown-bingo/firebase'
}).promise();
```

### API Key Rotation

```javascript
// Rotate API keys every 90 days
const schedule = require('node-schedule');

schedule.scheduleJob('0 0 1 */3 *', async () => {
  console.log('Rotating API keys...');
  
  // Generate new keys
  const newKey = generateNewAPIKey();
  
  // Store in Secrets Manager
  await storeAPIKey(newKey);
  
  // Notify administrators
  await sendNotification('API keys rotated');
});
```

---

## Monitoring & Logging

### Google Cloud Logging

```bash
# View logs
gcloud logging read "severity>=ERROR" --limit 50

# Create sink to BigQuery
gcloud logging sinks create crown-bingo-sink \
  bigquery.googleapis.com/projects/YOUR_PROJECT/datasets/crown_bingo_logs
```

### Application Logging

**middleware/logger.js**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

### Application Performance Monitoring (APM)

```bash
# Install New Relic
npm install newrelic

# Add to server.js first line
require('newrelic');

# Configure newrelic.js
module.exports = {
  app_name: ['Crown Bingo API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
};
```

### Alerts

**CloudWatch Alarms**
```bash
# High error rate alert
aws cloudwatch put-metric-alarm \
  --alarm-name crown-bingo-high-errors \
  --alarm-description "Alert on high error rate" \
  --metric-name ErrorCount \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT:email
```

---

## Backup & Recovery

### Automated Backups

```bash
# Firestore backups (daily)
gcloud firestore export gs://crown-bingo-backups/$(date +%Y%m%d) \
  --async

# Or schedule via Cloud Scheduler
gcloud scheduler jobs create app-engine firestore-backup \
  --schedule="0 2 * * *" \
  --http-method=POST \
  --uri="https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/backup"
```

**backup-function.js** (Cloud Function)
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp();

exports.backupFirestore = functions.https.onRequest(async (req, res) => {
  try {
    const projectId = process.env.GCLOUD_PROJECT;
    const bucketName = `${projectId}-backups`;
    const timestamp = new Date().toISOString();
    const exportPath = `backup-${timestamp}`;
    
    const client = new admin.firestore.v1.FirestoreAdminClient();
    const database = client.databasePath(projectId, '(default)');
    
    const responses = await client.exportDocuments({
      name: database,
      outputUriPrefix: `gs://${bucketName}/${exportPath}`,
      collectionIds: ['users', 'agents', 'transactions', 'games']
    });
    
    res.json({ success: true, message: 'Backup started', path: exportPath });
  } catch (error) {
    console.error('Backup failed:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Restore from Backup

```bash
# Restore Firestore data
gcloud firestore import gs://crown-bingo-backups/backup-2026-05-30/
```

### Database Snapshots

```bash
# Continuous backup to different region
# Via Firebase Console: Firestore → Backups
# - Retention: 7 days (free) or 90 days (paid)
# - Automatic daily backup
# - Point-in-time recovery
```

---

## Rollback Procedures

### Application Rollback

```bash
# AWS Elastic Beanstalk
eb deploy --version v1.0.0-stable

# Firebase Hosting
firebase deploy --only hosting --version v1.0.0-stable

# Kubernetes
kubectl set image deployment/crown-bingo-api \
  crown-bingo-api=your-registry/crown-bingo-api:v1.0.0-stable \
  -n crown-bingo

# Verify deployment
kubectl rollout status deployment/crown-bingo-api -n crown-bingo
```

### Database Rollback

```bash
# Firestore: Restore from backup
gcloud firestore import gs://crown-bingo-backups/backup-2026-05-29T02-00-00Z/

# Or via Firebase Console:
# Firestore → Backups → Select backup → Restore
```

### Version Control

```bash
# Tag releases
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0

# Create release branches
git checkout -b release/v1.0.0

# Merge to production
git checkout main
git merge release/v1.0.0
```

---

## Performance Tuning

### Database Optimization

```javascript
// Batch reads for better performance
async function getUsers(userIds) {
  const batches = [];
  
  for (let i = 0; i < userIds.length; i += 100) {
    const batch = userIds.slice(i, i + 100);
    batches.push(
      Promise.all(
        batch.map(uid => 
          db.collection('users').doc(uid).get()
        )
      )
    );
  }
  
  return Promise.all(batches).then(results => 
    results.flat().map(doc => doc.data())
  );
}

// Use pagination for lists
async function listUsers(pageSize = 20, startAfter = null) {
  let query = db.collection('users')
    .orderBy('createdAt', 'desc')
    .limit(pageSize);
  
  if (startAfter) {
    query = query.startAfter(startAfter);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data());
}
```

### Caching Strategy

```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache user data (1 hour TTL)
async function getUser(uid) {
  // Try cache first
  const cached = await client.get(`user:${uid}`);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();
  
  // Store in cache
  await client.setex(`user:${uid}`, 3600, JSON.stringify(userData));
  
  return userData;
}

// Invalidate cache on update
app.put('/api/users/:uid', async (req, res) => {
  // Update database
  const userRef = db.collection('users').doc(req.params.uid);
  await userRef.update(req.body);
  
  // Invalidate cache
  await client.del(`user:${req.params.uid}`);
  
  res.json({ success: true });
});
```

### Query Optimization

```javascript
// Create indexes for frequently queried fields
// Users by status and date
db.collection('users').where('isActive', '==', true)
  .orderBy('createdAt', 'desc')
  .get();

// Transactions by user
db.collection('transactions').where('userId', '==', uid)
  .orderBy('timestamp', 'desc')
  .get();

// Agents by earnings
db.collection('agents').where('isActive', '==', true)
  .orderBy('totalEarnings', 'desc')
  .get();
```

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Run load test
ab -n 10000 -c 100 https://api.crownbingo.com/api/health

# Run distributed load test with Artillery
npm install -g artillery

# Create load test config
artillery run load-test.yml
```

**load-test.yml**
```yaml
config:
  target: https://api.crownbingo.com
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: User workflow
    flow:
      - post:
          url: /api/users
          json:
            username: user_{{ $randomNumber(1, 10000) }}
            email: user_{{ $randomNumber(1, 10000) }}@example.com
      - think: 5
      - get:
          url: /api/users/{{ userId }}
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations prepared
- [ ] Backup taken
- [ ] Monitoring configured
- [ ] Team notified

### Deployment
- [ ] Deploy to staging first
- [ ] Smoke tests on staging
- [ ] Team sign-off
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify all features working

### Post-Deployment
- [ ] Performance metrics checked
- [ ] No unusual errors
- [ ] Team communication sent
- [ ] Documentation updated
- [ ] Deployment logged

---

## Production Support

### Status Page
```bash
# Set up status page at status.crownbingo.com
# Using Statuspage.io or similar service
```

### On-call Rotation
```
- Weekly on-call engineer
- Escalation procedure defined
- Runbooks prepared
- Contact list maintained
```

### SLA Targets
```
- API Uptime: 99.9%
- Response Time: <200ms (95th percentile)
- Error Rate: <0.1%
- Incident Response: <15 minutes
```

---

**Deployment Guide Version**: 1.0  
**Last Updated**: May 30, 2026  
**Status**: Production Ready
