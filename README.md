# 🎓 ScholarshipConnect AI

An AI-powered scholarship discovery, verification, and student financial aid platform tailored for Indian students and administrators. Features automated scholarship matching, AI SOP drafting with Google Gemini, Aadhaar & DigiLocker document wallet, loan guidance, and administrative approval workflows.

---

## 🌟 Key Features

- **Scholarship Discovery & Filtering**: Search across 100+ state, central, and private scholarships with filters for education level, category (General/OBC/SC/ST/Minority), income limit, gender, and field of study.
- **ScholarBot AI Assistant**: Context-aware AI advisor powered by Google Gemini (with smart offline heuristic fallback) to match scholarships and draft Statements of Purpose (SOP).
- **DigiLocker Document Wallet**: Secure client-side document management for Aadhaar, Marksheets, Income Certificates, and Bonafides.
- **Application Tracker**: Real-time status pipeline (Draft, Under Review, Verified, Disbursed).
- **Admin Dashboard**: Manage students, verify documents, disburse funds, update notices, and manage scholarship listings.
- **MongoDB Atlas Persistence**: Full cloud database sync with auto-seeding on fresh deployments.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Setup & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd ScholarshipConnect-AI-main-FP

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/scholarshipconnect?appName=Cluster0
JWT_SECRET=scholarshipconnect_jwt_secret_2026_secure_key
VITE_API_URL=/api
VITE_GEMINI_API_KEY=your_optional_gemini_api_key
```

### 4. Run Development Server
```bash
# Start frontend with auto-started backend server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 How to Deploy (Step-by-Step)

### Option 1: All-in-One Deployment on Render (Recommended & 100% Free)
Deploy both the React frontend and Express backend on a single free Render Web Service without CORS configuration.

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: production ready deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ScholarshipConnect-AI.git
   git push -u origin main
   ```

2. **Create a Free MongoDB Database**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and log in.
   - Click **Create a Deployment** -> select the **M0 Free** tier.
   - Under **Database Access**, create a database user (e.g., `db_user` and a strong password).
   - Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)** -> Save.
   - Under **Clusters**, click **Connect** -> **Drivers** (Node.js) -> copy your connection string (`MONGO_URI`).

3. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - Configure the service settings:
     - **Name**: `scholarshipconnect-ai`
     - **Region**: Choose the closest region (e.g., Singapore or Oregon)
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`
   - Scroll down to **Environment Variables** and add:
     - `MONGO_URI`: *(Your MongoDB connection string from step 2)*
     - `JWT_SECRET`: *(A random secret string, e.g. `scholarship_secret_key_2026`)*
     - `NODE_ENV`: `production`
     - `VITE_GEMINI_API_KEY`: *(Optional: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey))*
   - Click **Create Web Service**.
   - Render will build the Vite frontend, start the backend on port 10000/5000, connect to MongoDB, seed sample data, and give you a live HTTPS URL!

---

### Option 2: Split Deployment (Frontend on Vercel + Backend on Render)

#### Part A: Deploy Backend on Render
1. In Render, create a **Web Service** with your repo:
   - **Build Command**: `npm install`
   - **Start Command**: `node src/backend/server.js`
   - Add environment variables `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production`.
2. Once deployed, copy your backend URL (e.g., `https://scholarship-backend.onrender.com`).

#### Part B: Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://scholarship-backend.onrender.com/api`
   - `VITE_GEMINI_API_KEY`: *(Optional)*
4. Click **Deploy**. Vercel will build the React SPA with automatic routing rewrites (`vercel.json`).

---

## 🔐 Default Demo Accounts

The database automatically seeds with default accounts on first run:

| Role | Email / ID | Password | Notes |
|---|---|---|---|
| **Administrator** | `admin@scholarshipconnect.org` | `admin` | Full admin privileges, approval workflows, user management |
| **Student** | `aarav.sharma@example.com` | `password123` | Student ID: `SC-2026-IND9021`, B.Tech Student |
| **Student** | `priya.patel@example.com` | `password123` | Student ID: `SC-2026-PP402`, B.Sc Student |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **AI Integration**: Google Gemini 1.5 Flash API + Heuristic Offline Rule Engine
