# 🏥 MedLens — Clinical Information Intelligence System

> **AI-powered medical report processing platform** with deterministic OCR extraction, provenance tracking, lab result analysis, and clinical decision support.

![MedLens](https://img.shields.io/badge/MedLens-Clinical%20AI-teal?style=for-the-badge&logo=activity)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)

---

## 📋 Overview

**MedLens** is a full-stack clinical information intelligence platform designed to help attending physicians and clinical teams:

- **Upload** medical lab reports (PDF, TXT, CSV, DOC, images)
- **Extract** structured lab parameters with deterministic OCR provenance
- **Verify** extracted values with physician attestation workflows
- **Detect** cross-report conflicts and clinical discrepancies
- **Export** processed reports as PDF, CSV, JSON, or plain text
- **Track** all changes with a complete HIPAA-compliant audit trail

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📄 **Multi-format Upload** | Accepts `.pdf`, `.txt`, `.csv`, `.doc`, `.docx`, `.png`, `.jpg` |
| 🔬 **Lab Extraction** | Deterministic OCR parsing of lab values, reference ranges, and units |
| 📊 **Reference Range Evaluation** | Automatic HIGH / LOW / NORMAL / NOT_DETERMINED status |
| ⚕️ **Physician Attestation** | Verify or reject extracted fields with audit justification |
| ⚠️ **Conflict Detection** | Identifies contradictions between medications and diagnoses |
| 📈 **Longitudinal Comparison** | Compare baseline vs follow-up lab reports side-by-side |
| 📤 **Export Engine** | Print PDF, export CSV spreadsheet, JSON payload, or TXT summary |
| 🔒 **Audit Trail** | Full HIPAA-compliant event log of every action |
| 🕐 **Clinical Timeline** | Reconstructed chronological EHR event history |
| 🧠 **Case Synthesis** | Factual clinical case summary bounded by source documents |

---

## 🗂️ Project Structure

```
medlens/
├── apps/
│   ├── frontend/          # React + TypeScript + TailwindCSS UI
│   │   └── src/
│   │       ├── components/   # Reusable UI components
│   │       ├── pages/        # Route-level pages
│   │       ├── services/     # API service client
│   │       ├── types/        # TypeScript type definitions
│   │       └── utils/        # Export utilities
│   ├── backend/           # Node.js + Express REST API
│   │   └── src/
│   │       ├── routes/       # API route handlers
│   │       ├── services/     # AI extraction, conflict engine, audit service
│   │       └── types/        # Shared TypeScript types
│   └── ai-service/        # Python FastAPI AI extraction microservice
├── docker-compose.yml     # Docker orchestration
└── package.json           # Root workspace configuration
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Git**

### 1. Clone the repository
```bash
git clone https://github.com/lahari-cse/medlens.git
cd medlens
```

### 2. Install dependencies
```bash
npm install --prefix apps/frontend
npm install --prefix apps/backend
```

### 3. Start the backend
```bash
npm --prefix apps/backend run build
npm --prefix apps/backend start
```
> API runs at: `http://localhost:5000`

### 4. Start the frontend
```bash
npm --prefix apps/frontend run dev
```
> App runs at: **[http://localhost:3000](http://localhost:3000)**

---

## 📑 Sample Report

A sample clinical lab report is included for testing document uploads:

```
TEST NAME               RESULT    UNITS    REFERENCE RANGE    STATUS
Fasting Plasma Glucose  142 H     mg/dL    70 - 99            HIGH
Hemoglobin A1c          7.4 H     %        < 5.7              HIGH
Serum Sodium            139       mmol/L   135 - 145          NORMAL
Total Cholesterol       218 H     mg/dL    < 200              HIGH
```

Upload any `.txt`, `.pdf`, or `.csv` lab report via the **Upload Report** page.

---

## 📤 Export Formats

After viewing a processed report, click **Export Report** to download:

| Format | Contents |
|---|---|
| 🖨️ **Print / PDF** | Clean print-layout report (hides all UI chrome) |
| 📊 **CSV Spreadsheet** | All extracted lab parameters in tabular form |
| ⚙️ **JSON Record** | Full FHIR-ready structured data payload |
| 📝 **Text Summary** | Plain-text formatted diagnostic report document |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| AI Service | Python, FastAPI |
| Styling | TailwindCSS, Custom CSS, Google Fonts (Inter, Outfit) |
| Icons | Lucide React |
| Containerization | Docker, Docker Compose |

---

