# Strobe - Download Manager

<p>
  <img src="https://raw.githubusercontent.com/repyh/download-manager/refs/heads/main/assets/strobe_logo.png" alt="Download Manager Logo" width="100">
</p>

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Preview-yellow?style=flat-square)](https://github.com/repyh/download-manager)

A modern, cross-platform download manager built with Electron and React.

> ⚠️ **PREVIEW VERSION**: This application is currently in development state and not ready for production use. You're welcome to build and try it out, but expect bugs and incomplete features. Feedback and contributions are appreciated!

![Strobe Preview Screenshot](https://github.com/repyh/download-manager/blob/main/main_screenshot.png)

## ✨ Features

- 📥 Download files from the web with ease
- 🚀 Accelerated downloads with multi-connection downloading
- 📊 Monitor download
- 🔔 Notification when downloads complete

## 🔨 In-development

- Pause and resumes.
- Concurrent downloads.
- Stability improvements and bug fixes.
- Performance optimizations.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Setup

```bash
# Clone the repository
git clone https://github.com/repyh/strobe.git

# Navigate to the project directory
cd strobe

# Install dependencies
npm install
# or
yarn install
```

## 💻 Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

## 🏗️ Building

```bash
# Build for production
npm run build
# or
yarn build

# Package the application
npm run package
# or
yarn package
```

## 📁 Project Structure

```
download-manager/
├── src/                  # Source code
│   ├── main/             # Electron main process
│   ├── renderer/         # React renderer process
│   └── shared/           # Shared utilities
├── public/               # Static assets
├── build/                # Build configuration
└── dist/                 # Compiled output
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made as a hobby project
