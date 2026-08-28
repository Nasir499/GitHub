# 🐙 GitHub Clone — Full-Stack Web App & Custom Git CLI (`mygit`)

A full-stack GitHub clone built with **React**, **Node.js/Express**, **MongoDB**, and **AWS S3**, featuring a custom command-line interface (`mygit`) that allows users to initialize, commit, and push code directly to AWS S3 from any local project directory.

---

## ✨ Features

### 🌐 Web Application (Frontend)
- **User Authentication**: JWT-based login and signup.
- **Repository Management**: Create public/private repositories, toggle visibility, and delete repositories.
- **S3 File Explorer**: Browse repository files and directories stored in AWS S3 with breadcrumb navigation.
- **Live Code Viewer**: View source file contents directly in a modal overlay.
- **Issue Tracking**: Create, view, and track issue statuses (`open` / `closed`) per repository.
- **Real-Time Polling & Synchronization**: Automatic background polling and window focus triggers for immediate file updates after CLI pushes.

### 💻 Backend & Storage
- **RESTful API**: Node.js & Express server powering repository management, authentication, and file operations.
- **AWS S3 Cloud Storage**: Preserves commit histories and repository file structures in S3 buckets.
- **High-Performance Upload Engine**: Supports payloads up to **50MB** and **parallel chunked S3 uploads** (15 concurrent threads) for fast CLI pushes.
- **Database**: MongoDB storing users, repository metadata, and issue records.

### ⚡ Custom Git CLI (`mygit`)
- **One-Command Automated Installation**: Easily install system-wide on Windows via PowerShell.
- **Command Set**:
  - `mygit init <repoId>` — Initializes local repository tracking linked to a specific web repository.
  - `mygit add <file|.>` — Stages individual files or entire directory trees into `.mygit/staging/`.
  - `mygit commit "<message>"` — Creates a commit snapshot with metadata (`commit.json`).
  - `mygit push` — Uploads un-pushed commits and files directly to AWS S3 via API.
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
powershell -c "irm http://localhost:3000/install.ps1 | iex"
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
| **Backend** | Node.js, Express.js, Socket.io, Yargs |
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
