# SignalOps

SignalOps is an AI-powered Developer Production Intelligence Platform for engineering teams that need to understand production failures quickly.

Traditional monitoring tools tell teams that something failed. SignalOps is designed to answer the next questions:

- Why did it fail?
- Which service caused it?
- How severe is it?
- Has this happened before?
- What is the likely fix?
- Did a recent deployment cause it?

SignalOps is built as a production-grade internal engineering platform with log ingestion, incident grouping, AI-assisted root cause analysis, fix recommendations, real-time dashboards, deployment correlation, alerting, and observability workflows.

## Platform Goals

- Collect frontend, backend, API, authentication, and database failures.
- Group repeated failures into actionable incidents.
- Generate AI root cause analysis and recommended fixes.
- Stream production health changes in real time using Socket.IO.
- Visualize error trends, service health, traces, MTTR, severity, and deployment impact.
- Support secure multi-role access for admins, developers, and viewers.
- Provide Docker, Prometheus, Grafana, and CI/CD foundations for deployment.

## Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Context API
- Axios
- Socket.IO Client
- Recharts
- CSS Modules

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- Bcrypt
- Pino Logger

### AI

- OpenAI API or Gemini API
- Log preprocessing pipeline
- Root cause analysis engine
- Fix recommendation engine
- Incident summary generator

### DevOps and Observability

- Docker
- Docker Compose
- GitHub Actions
- Prometheus
- Grafana
- Nginx

## Architecture

```text
backend/
├── config/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middlewares/
├── validators/
├── sockets/
├── jobs/
├── utils/
├── models/
├── monitoring/
├── ai/
├── tests/
└── server.js

frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── layouts/
│   ├── routes/
│   ├── utils/
│   └── api/
```

## Core Modules

### 1. Log Collection Engine

Captures production signals from:

- Frontend runtime errors
- Backend exceptions
- API failures
- Authentication failures
- Database failures

Example log payload:

```json
{
  "service": "User Service",
  "message": "Database timeout",
  "severity": "HIGH",
  "timestamp": "2026-06-01T10:30:00.000Z"
}
```

Logs are stored in MongoDB with indexes for service, severity, timestamp, fingerprint, environment, and trace ID.

### 2. Incident Detection Engine

Groups identical or highly similar failures into incidents.

Fingerprint inputs:

- Error message
- Stack trace
- Service name
- Error type
- Endpoint

Example:

```text
500 identical database timeout errors
```

becomes:

```text
Incident: Database Timeout
Occurrences: 500
Status: Open
Severity: High
```

### 3. AI Root Cause Analyzer

Analyzes:

- Error messages
- Stack traces
- Historical incidents
- Service metadata
- Deployment context

Generated output:

```json
{
  "rootCause": "Connection pool exhausted under increased request load.",
  "confidence": 92,
  "evidence": [
    "Repeated database timeout errors",
    "Spike started after deployment v2.4",
    "Affected service: User Service"
  ]
}
```

AI analysis is stored with the incident and can be regenerated.

### 4. Fix Recommendation Engine

Generates remediation guidance such as:

- Increase database connection pool size.
- Add retry and backoff strategy.
- Validate connection lifecycle handling.
- Add circuit breaker protection.
- Roll back risky deployment.

Recommendation output:

```json
{
  "recommendation": "Increase database pool size and add exponential retry for transient timeouts.",
  "confidence": 88,
  "priority": "HIGH"
}
```

### 5. Real-Time Monitoring Engine

Socket.IO streams live operational events without polling:

- New error received
- New incident created
- Incident severity changed
- Incident status changed
- New deployment detected
- Alert triggered
- Service health changed

### 6. Analytics Engine

Dashboards show:

- Error trends
- Error frequency
- Incident growth
- Mean Time To Resolution
- Error rate
- Severity distribution
- Most affected services
- Most frequent failures

Charts are built with Recharts.

### 7. Observability Engine

Tracks platform and service health:

- Request count
- API latency
- Error rate
- Throughput
- Success rate

Service health states:

- Green: healthy
- Yellow: degraded
- Red: failing

### 8. Distributed Trace View

Visualizes request flow across services:

```text
API Gateway
↓
Auth Service
↓
User Service
↓
Database
```

The trace explorer highlights failing nodes, latency bottlenecks, and service-level error boundaries.

### 9. Deployment Intelligence

Tracks deployments:

- Version
- Commit SHA
- Environment
- Deployment time
- Deployed by

SignalOps detects error spikes after deployment.

Example:

```text
v2.4 deployed
↓
Errors increased 400%
↓
Incident correlated with deployment
```

### 10. Incident Summary Generator

Generates AI-powered summaries for technical and executive audiences.

Example:

```text
Issue:
Database timeout

Impact:
143 users affected

Root Cause:
Connection pool exhausted

Recommended Fix:
Increase pool size and add retry logic
```

### 11. Alerting Engine

Sends alerts through:

- Email
- Slack
- Webhooks

Alert triggers:

- Critical incident
- Error spike
- Service outage
- Deployment regression
- High latency threshold

## Authentication and Authorization

Implemented flows:

- Register
- Login
- Logout
- Refresh token
- Forgot password
- Reset password

Roles:

- Admin
- Developer
- Viewer

RBAC controls protect API routes, incident actions, deployment records, alert configuration, and admin-only settings.

## Security

Security baseline:

- Helmet
- Rate limiting
- Input validation
- JWT access tokens
- Refresh token rotation
- Secure cookies
- Password hashing with Bcrypt
- Request sanitization
- Centralized error handling
- Structured audit logs

## MongoDB Schema Overview

### User

- name
- email
- passwordHash
- role
- refreshTokens
- passwordResetToken
- passwordResetExpiresAt
- createdAt
- updatedAt

Indexes:

- email unique
- role

### Log

- service
- environment
- message
- stackTrace
- severity
- fingerprint
- traceId
- requestId
- endpoint
- method
- statusCode
- metadata
- timestamp

Indexes:

- service, timestamp
- severity, timestamp
- fingerprint
- traceId

### Incident

- title
- fingerprint
- service
- severity
- status
- occurrences
- firstSeenAt
- lastSeenAt
- rootCauseAnalysis
- fixRecommendation
- relatedLogs
- relatedDeployment
- assignedTo

Indexes:

- fingerprint unique
- service, status
- severity, status
- lastSeenAt

### Deployment

- version
- commitSha
- environment
- service
- deployedBy
- deployedAt
- metadata
- correlatedIncidents

Indexes:

- service, deployedAt
- version
- commitSha

### Alert

- type
- channel
- threshold
- destination
- enabled
- service
- severity
- createdBy

Indexes:

- enabled
- service
- severity

### Trace

- traceId
- serviceFlow
- failingNode
- durationMs
- status
- relatedIncident
- startedAt
- endedAt

Indexes:

- traceId unique
- status
- startedAt

### Notification

- userId
- title
- message
- type
- read
- relatedIncident
- createdAt

Indexes:

- userId, read
- createdAt

## API Design

### Auth

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Logs

```text
POST   /api/logs
GET    /api/logs
GET    /api/logs/:id
GET    /api/logs/service/:serviceName
```

### Incidents

```text
GET    /api/incidents
GET    /api/incidents/:id
PATCH  /api/incidents/:id/status
PATCH  /api/incidents/:id/assignee
POST   /api/incidents/:id/analyze
POST   /api/incidents/:id/recommend-fix
POST   /api/incidents/:id/summary
```

### Analytics

```text
GET    /api/analytics/error-trends
GET    /api/analytics/severity-distribution
GET    /api/analytics/service-health
GET    /api/analytics/mttr
GET    /api/analytics/frequent-failures
```

### Traces

```text
POST   /api/traces
GET    /api/traces
GET    /api/traces/:traceId
```

### Deployments

```text
POST   /api/deployments
GET    /api/deployments
GET    /api/deployments/:id
GET    /api/deployments/:id/correlation
```

### Alerts

```text
POST   /api/alerts
GET    /api/alerts
PATCH  /api/alerts/:id
DELETE /api/alerts/:id
POST   /api/alerts/test
```

### Monitoring

```text
GET    /health
GET    /ready
GET    /metrics
```

## Realtime Events

### Server to Client

```text
log:new
incident:new
incident:updated
incident:severityChanged
incident:statusChanged
deployment:new
deployment:regressionDetected
alert:triggered
notification:new
service:healthChanged
trace:new
```

### Client to Server

```text
incident:subscribe
incident:unsubscribe
service:subscribe
service:unsubscribe
dashboard:join
dashboard:leave
```

## Frontend Pages

- Login
- Register
- Dashboard
- Live Logs
- Incidents
- Incident Detail
- AI Analysis
- Fix Recommendations
- Analytics
- Service Health
- Trace Explorer
- Deployments
- Alerts
- Notifications
- Admin Settings

## Docker Setup

Expected services:

- frontend
- backend
- mongodb
- prometheus
- grafana
- nginx

Example command:

```bash
docker compose up --build
```

## Prometheus Integration

The backend exposes Prometheus metrics at:

```text
GET /metrics
```

Tracked metrics:

- HTTP request count
- HTTP request duration
- Error count
- Active incidents
- Log ingestion count
- AI analysis duration
- Alert dispatch count

## Grafana Dashboard Setup

Grafana dashboards should include:

- API latency by route
- Error rate by service
- Incident count by severity
- Log ingestion volume
- AI analysis latency
- Deployment regression timeline
- Service health overview

## CI/CD

GitHub Actions pipeline runs on push:

1. Install dependencies
2. Run linting
3. Run tests
4. Build frontend
5. Build backend
6. Build Docker images
7. Deploy

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Backend:

```env
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/signalops
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=
GEMINI_API_KEY=
SLACK_WEBHOOK_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Frontend:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

## Production Readiness Checklist

- Structured logging with Pino
- Centralized error handling
- MongoDB indexes and aggregation pipelines
- Secure authentication with refresh tokens
- RBAC middleware
- Rate limiting and request validation
- Socket.IO authorization
- AI provider abstraction
- Background jobs for analysis and alerting
- Prometheus metrics
- Grafana dashboards
- Docker Compose environment
- CI/CD pipeline
- Deployment regression detection

## License

This project is intended as a production-grade SaaS architecture and implementation foundation for SignalOps.
