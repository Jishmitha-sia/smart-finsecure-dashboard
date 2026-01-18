# 💰 Smart FinSecure Dashboard

A premium real-time financial fraud detection dashboard with ML-powered risk scoring, built with React, Express, and Flask.

---

## 🚀 Live Deployment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://smart-finsecure-dashboard-b0kwxyyc4-jishmitha-sias-projects.vercel.app | ✅ Live |
| **Backend API** | https://smart-finsecure-dashboard-1.onrender.com | ✅ Live |
| **Database** | Render PostgreSQL | ✅ Live |
| **ML Service** | (Deploying) | 🔄 Pending |

---

## 📋 Quick Start (Live App)

### Login Credentials
```
Email: demo@example.com
Password: Demo@1234
```

### Features Available
- ✅ **Dashboard**: Real-time spending charts (monthly, by category)
- ✅ **Transactions**: Full CRUD (Create, Read, Update, Delete) with pagination
- ✅ **Fraud Detection**: AI-flagged transactions with risk scores (0-100%)
- ✅ **Authentication**: JWT-based secure login/register
- ✅ **Responsive Design**: Dark theme, works on desktop & mobile

---

## 🏗️ Architecture

### Frontend (React + Vite + Tailwind)
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Auth entry point
│   │   ├── Register.jsx       # New account signup
│   │   ├── Dashboard.jsx      # Charts, stats, recent transactions
│   │   ├── Transactions.jsx   # Full CRUD table with modal
│   │   └── FraudDetection.jsx # Flagged transactions, risk analysis
│   ├── components/
│   │   └── Layout.jsx         # Navbar, routing, protected routes
│   ├── api/
│   │   └── client.js          # Axios instance with JWT interceptors
│   └── App.jsx                # React Router configuration
```

### Backend (Express + PostgreSQL + Sequelize)
```
backend/
├── src/
│   ├── models/
│   │   ├── User.js            # User table (id, email, password, balance)
│   │   └── Transaction.js     # Transaction table (amount, fraudScore, etc.)
│   ├── routes/
│   │   ├── auth.routes.js     # /register, /login, /me
│   │   ├── transaction.routes.js # CRUD + /stats, /flagged
│   │   ├── dashboard.routes.js  # /summary, /monthly-spending, /category-breakdown
│   │   └── seed.routes.js     # /seed (demo data)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── transaction.controller.js
│   │   ├── dashboard.controller.js
│   │   └── seed.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js # JWT verification
│   └── config/
│       └── db.js              # Sequelize connection
├── server.js                  # Express entry point
└── package.json
```

### ML Service (Flask + Scikit-learn)
```
ml/
├── api.py                # Flask server, /predict endpoint
├── train_model.py        # Isolation Forest model trainer
├── preprocess.py         # Feature engineering
├── requirements.txt      # Dependencies (Flask, scikit-learn, joblib)
└── model/
    └── isolation_forest.pkl # Trained model
```

---

## 🔄 Data Flow

```
1. User logs in (frontend)
   ↓
2. Frontend sends POST /api/auth/login (email, password)
   ↓
3. Backend verifies credentials, returns JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. User creates transaction (frontend)
   ↓
6. Frontend sends POST /api/transactions (amount, category, merchant, location)
   ↓
7. Backend computes features (time, amount, location patterns)
   ↓
8. Backend calls ML service POST /predict (features)
   ↓
9. ML returns fraudScore (0-100) and isFraudulent (binary)
   ↓
10. Backend saves transaction with fraudScore to DB
    ↓
11. Frontend displays transaction with risk % in dashboard
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 12+
- Git

### 1. Clone Repo
```bash
git clone https://github.com/Jishmitha-sia/smart-finsecure-dashboard.git
cd smart-finsecure-dashboard
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_NAME=smart_finsecure
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=development
ML_API_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
PORT=5000
EOF

# Start server
npm start
# Should see: ✅ Database connected successfully
```

### 3. ML Setup
```bash
cd ml

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python api.py
# Should see: Running on http://localhost:8000
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Should see: VITE v5.1.0 running at http://localhost:5173
```

### 5. Seed Demo Data
In Thunder Client or browser:
```
POST http://localhost:5000/api/seed
```

Then log in locally with:
- Email: `demo@example.com`
- Password: `Demo@1234`

---

## 📦 Deployment (Render + Vercel)

### Prerequisites
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- GitHub repo connected

### Step 1: Database (Render PostgreSQL)
1. Go to https://render.com → **New → PostgreSQL**
2. Copy the connection string (DATABASE_URL)
3. Keep it for backend env vars

### Step 2: Backend (Render Node)
1. Go to https://render.com → **New → Web Service**
2. Select GitHub repo, root directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-super-secret-key
   NODE_ENV=production
   ML_API_URL=https://your-ml.onrender.com
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
6. Deploy and copy the URL (e.g., `https://smart-finsecure-backend.onrender.com`)

### Step 3: ML Service (Render Python)
1. Go to https://render.com → **New → Web Service**
2. Select GitHub repo, root directory: `ml`
3. Runtime: Python 3
4. Build: `pip install -r requirements.txt`
5. Start: `gunicorn api:app --bind 0.0.0.0:$PORT`
6. Deploy and copy the URL
7. **Update backend** `ML_API_URL` to this URL, redeploy

### Step 4: Frontend (Vercel)
1. Go to https://vercel.com → **Add New Project**
2. Select GitHub repo, root directory: `frontend`
3. Framework: Vite
4. Environment Variables:
   ```
   VITE_API_URL=https://smart-finsecure-backend.onrender.com/api
   ```
5. Deploy and copy the URL

### Step 5: Seed Demo Data
```
POST https://smart-finsecure-backend.onrender.com/api/seed
```

---

## 🧪 Testing the Live App

### 1. Login Flow
```bash
# In browser: https://your-frontend.vercel.app
Login with: demo@example.com / Demo@1234
```

### 2. View Dashboard
- See monthly spending chart
- See category breakdown pie chart
- See stats cards (fraud alerts, total spent)
- See recent transactions

### 3. Create Transaction
- Go to Transactions page
- Click "Add Transaction"
- Fill: Amount, Category, Merchant, Location
- Submit → should appear in list + Fraud Detection page

### 4. Fraud Detection
- Go to Fraud Detection page
- See flagged transactions with risk scores
- Risk score = fraudScore from ML (0-100%)
- Test by creating transactions with high amounts

### 5. Verify E2E
- Backend logs should show: `[ML] Calling fraud detection API...`
- Frontend should display fraudScore as percentage
- Render backend/ML logs should show requests

---

## 🔐 Security Notes

- ✅ **JWT Auth**: Tokens expire in 24 hours
- ✅ **Password Hashing**: bcryptjs (10 salt rounds)
- ✅ **CORS**: Configured for frontend origin only (in production, set `CORS_ORIGIN=*` for now)
- ✅ **Environment Variables**: Never commit `.env` (use `.env.example`)
- ⚠️ **TODO**: Rate limiting, input validation, HTTPS enforcement

---

## 🚨 Troubleshooting

### Frontend → Backend Connection Failed
**Error**: `CORS header 'Access-Control-Allow-Origin' does not match`

**Solution**:
1. Check Render backend: **Environment → CORS_ORIGIN** = your Vercel URL
2. Redeploy backend
3. Hard refresh frontend: **Ctrl+Shift+R**

### Login Returns 401
**Error**: `Invalid email or password`

**Solution**:
1. Verify demo user exists: POST `/api/seed`
2. Check database on Render PostgreSQL
3. Ensure JWT_SECRET is same across all instances

### ML Service Returns 500
**Error**: ML endpoint not responding

**Solution**:
1. Check Render ML logs: **Logs** tab
2. Verify `ML_API_URL` in backend is correct
3. Ensure gunicorn start command: `gunicorn api:app --bind 0.0.0.0:$PORT`

### Transaction Not Getting Fraud Score
**Error**: `fraudScore` is null

**Solution**:
1. Check ML service is running
2. Verify backend can reach ML API (check logs)
3. Look for errors in Render ML logs
4. Manually test ML endpoint: `POST /predict` with mock features

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Get JWT token |
| GET | `/api/auth/me` | ✅ | Get profile |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/transactions` | ✅ | List user transactions |
| POST | `/api/transactions` | ✅ | Create transaction |
| PUT | `/api/transactions/:id` | ✅ | Update transaction |
| DELETE | `/api/transactions/:id` | ✅ | Delete transaction |
| GET | `/api/transactions/:id` | ✅ | Get single transaction |
| GET | `/api/transactions/stats` | ✅ | Get spending stats |
| GET | `/api/transactions/flagged` | ✅ | Get flagged transactions |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/summary` | ✅ | Balance, recent, fraud count |
| GET | `/api/dashboard/monthly-spending` | ✅ | Monthly chart data |
| GET | `/api/dashboard/category-breakdown` | ✅ | Spending by category |

### Seed (Demo)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/seed` | ❌ | Create demo user + 25 transactions |

---

## 🎨 UI/UX Features

- 🌙 **Dark Theme**: Neon glassmorphism design
- 📱 **Responsive**: Mobile-first, works on all devices
- 📊 **Charts**: Recharts library (line, pie charts)
- 🔔 **Alerts**: Real-time fraud alerts with color coding
- ♿ **Accessibility**: ARIA labels, keyboard navigation
- ⚡ **Performance**: Lazy-loaded routes, optimized queries

---

## 📈 Future Enhancements

- [ ] **Deploy ML service** (currently pending on Render)
- [ ] **Admin panel**: Override fraud flags, user management
- [ ] **Dispute system**: Users can contest fraud flags
- [ ] **Model retraining**: Automated weekly model updates
- [ ] **Monitoring**: Sentry, LogRocket integration
- [ ] **A/B testing**: Multiple fraud models
- [ ] **Mobile app**: React Native version
- [ ] **Database backups**: Automated nightly backups
- [ ] **Rate limiting**: API throttling per user
- [ ] **Payment integration**: Stripe/PayPal

---

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=min-32-character-secret-key
NODE_ENV=production
ML_API_URL=https://your-ml-service.onrender.com
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### ML (.env)
```
FLASK_ENV=production
PORT=8000
```

---

## 🛠️ Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | React + Vite + Tailwind | 18.3.1 + 5.1.0 + 3.4.1 |
| State | React Router | 6.22.0 |
| Charts | Recharts | 2.12.0 |
| HTTP | Axios | 1.6.7 |
| Backend | Express | 4.19.2 |
| Database | PostgreSQL + Sequelize | - + 6.37.3 |
| Auth | JWT + bcryptjs | - + 2.4.3 |
| ML | Flask + Scikit-learn | 3.0.0 + 1.6.1 |
| Deployment | Vercel + Render | - + - |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 👤 Author

**Jishmitha K**  
GitHub: [@Jishmitha-sia](https://github.com/Jishmitha-sia)

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review Render/Vercel logs
3. Open a GitHub issue

---

**Last Updated**: January 18, 2026
