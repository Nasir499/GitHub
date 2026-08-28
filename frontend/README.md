# 🌐 GitHub Clone — Frontend Web Client

The React SPA web interface for the GitHub Clone platform. Allows users to manage repositories, inspect code pushed from the `mygit` CLI, track issues, and view source code live in the browser.

---

## ✨ Features

- **Dashboard**: Personal activity overview, repository list, user search, and creation shortcuts.
- **Repository View (`RepoDetail.jsx`)**:
  - **S3 File Explorer**: Browse files and directories stored in AWS S3 with breadcrumb navigation.
  - **Path Normalization**: Automatically converts Windows backslashes (`\`) into web-standard forward slashes (`/`).
  - **Code Modal**: Click any source file to inspect its content live inside an inline modal editor.
  - **CLI Setup Instructions**: Dynamic setup banner displaying custom `mygit init <repoId>` commands per repository.
- **Issue Tracker**: Create, filter, and view issue details (`open` / `closed`).
- **User Profile**: Contribution heatmaps, user details, and repository collections.
- **Authentication**: JWT token storage, login/signup forms, and protected navigation routes.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios (configured with BaseURL and Auth interceptors)
- **Styling**: Custom CSS3 styling with dark theme support
- **Icons & Assets**: Custom SVG brand icons & emoji badges

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev

# Build for production
npm run build
```
