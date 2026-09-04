# 🐙 GitHub Clone — Full-Stack Web App & Custom Git CLI (`mygit`)

A full-stack GitHub clone built with **React**, **Node.js/Express**, **MongoDB**, and **AWS S3**, featuring a custom command-line interface (`mygit`) that allows users to initialize, commit, and push code directly to AWS S3 from any local project directory.

---

## ✨ Features

### 🌐 Web Application (Frontend)
- **User Authentication**: JWT-based login and signup with protected routes.
- **Repository Management**: Create public/private repositories, toggle visibility, and delete repositories with cascade cleanup.
- **S3 File Explorer**: Interactive file tree with breadcrumb navigation and **automatic Windows path normalization** (`\` ➔ `/`).
- **Live Code Viewer**: View file contents directly in an inline code modal fetched directly from S3.
- **Issue Tracking System**: Create, inspect, and manage repository issues (`open` / `closed`).
- **Optimized UI Data Fetching**: Clean single-fetch component lifecycle with manual refresh capability.

### 💻 Backend & Storage
- **RESTful API Engine**: Express server powering repository management, authorization middleware, and file sync.
- **AWS S3 Cloud Storage**: Preserves commit histories and repository file structures under `repos/<repoId>/commits/<commitId>/`.
- **High-Performance Upload Pipeline**: Supports body payloads up to **50MB** and **parallel chunked S3 uploads** (15 concurrent threads), reducing upload times for 80+ files from ~35s down to ~1.5s.
- **Cross-Platform Path Sanitization**: Ensures Windows backslashes (`\`) are converted to standard POSIX slashes (`/`) before writing S3 keys and DB entries.
- **Database Architecture**: MongoDB storing users, repository metadata, and issue collections.

### ⚡ Custom Git CLI (`mygit`)
- **One-Command Automated Installer**: Installs globally on Windows via PowerShell (`powershell -c "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm http://localhost:3000/install.ps1 | iex"`).
- **Command Set**:
  - `mygit init <repoId>` — Initializes local repository tracking linked to a specific web repository.
  - `mygit add <file|.>` — Stages individual files or entire directory trees recursively into `.mygit/staging/`.
  - `mygit commit "<message>"` — Creates a commit snapshot with metadata (`commit.json`).
  - `mygit push` — Uploads un-pushed commits and staged files directly to AWS S3 via Express API.
  - `mygit pull` — Fetches remote commit snapshots from S3 to local storage.
  - `mygit revert <commitId>` — Reverts working directory to a specific commit snapshot.

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables in backend/.env
# Example .env:
# MONGODB_URI=mongodb://localhost:27017/Github
# PORT=3000
# JWT_SECRET_KEY=your_secret_key
# S3_BUCKET=your_s3_bucket_name
# AWS_REGION=ap-south-1
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key

# Start the Express server (Runs on http://localhost:3000)
npm start
```

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

---

## 💻 Installing & Using `mygit` CLI

### Step 1: One-Click CLI Installation (Windows PowerShell)

Run the following command in PowerShell:

```powershell
powershell -c "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm http://localhost:3000/install.ps1 | iex"
```

### Step 2: Initialize & Push Code from Any Local Project

Open a terminal in your local project directory (e.g., `D:\MyProject`) and run:

```powershell
# 1. Initialize local repository with Repository ID from web app URL
mygit init <repoId>

# 2. Stage files
mygit add .

# 3. Commit staged files
mygit commit "Initial upload of project source code"

# 4. Push files to AWS S3
mygit push
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, React Router DOM, Axios, CSS3 |
| **Backend** | Node.js, Express.js, Socket.io, Yargs, Morgan |
| **Database** | MongoDB, Mongoose |
| **Cloud Storage** | AWS S3 (`@aws-sdk/client-s3`) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/          # AWS S3 configuration
│   ├── controllers/     # Route controllers & CLI commands (init, add, commit, push, pull, revert)
│   ├── middlewares/     # JWT authentication & authorization middlewares
│   ├── models/          # MongoDB schemas (User, Repository, Issue)
│   ├── routes/          # Express API routes & installer endpoints
│   ├── index.js         # Express server & CLI entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (Dashboard, RepoDetail, CreateRepository, Navbar, Auth)
│   │   ├── Authcontext.jsx # Auth state provider
│   │   ├── api.js       # Axios API client
│   │   └── App.jsx
│   └── package.json
│
└── GIT_CLI_GUIDE.md     # Detailed CLI documentation
```
