# Pharmacy Prescription Inventory Management and Dispensing Audit System

A full-stack modern MERN web application (**“MediHeal”**) providing prescription OCR parsing, automated Doctor ID verification, FEFO inventory batch tracking, dispensing audit trails, and multi-role access control (User, Doctor, Pharmacist Admin, Admin).

---

## 🌟 Visual Design Reference
The frontend reproduces the **MediHeal** online pharmacy visual design reference:
- **Primary Color**: Deep Pharmacy Green (`#0B4D3C`)
- **Accent Color**: Bright Lime (`#CCFF00` / `#D4F037`)
- **Typography & Components**: Clean healthcare aesthetic with search filters, product category cards, promotional cashback banners, customer reviews, and floating pill badges.

---

## 🔑 Role-Based Demo Credentials

| Role | Access URL | Login Identifier | Password | Description |
| :--- | :--- | :--- | :--- | :--- |
| **User (Patient)** | `/login` | `user@mediheal.com` | `User@123` | Upload prescriptions, buy medicines, track orders |
| **Doctor 1** | `/doctor-login` | `doc101` | `doc101` | Cardiology practitioner dashboard & linked orders |
| **Doctor 2** | `/doctor-login` | `doc102` | `doc102` | Orthopedics practitioner dashboard |
| **Pharmacist Admin** | `/pharmacist-login` | `pharmacist@mediheal.com` | `Pharm@123` | FEFO batch inventory control & flagged prescription review |
| **System Admin** | `/admin-login` | `admin@mediheal.com` | `Admin@123` | Doctor registration approvals, user controls, searchable audit logs |

> [!NOTE]
> **Doctor First-Time Login**: Logging in with initial doctor credentials (`doc101` / `doc101`) prompts a mandatory password update modal to ensure security before accessing practitioner tools.

---

## 🚀 Key Features

### 1. Automated Prescription OCR & Doctor ID Verification
- Accepts printed prescription image uploads (PNG, JPG, JPEG) and PDF files.
- Uses **Tesseract.js** to extract raw text, Doctor ID (`doc101`), Doctor Name, Date, and Prescribed Items.
- Cross-references Doctor ID against MongoDB `Doctor` collection records.
- Flags unverified doctor IDs or mismatched doctor names for Pharmacist review (`Needs Review` / `Rejected`).
- Verified prescriptions enable the **"Proceed to Buy"** workflow for extracted items.

### 2. FEFO Inventory & Dispensing Audit Trail
- Manages separate **Medicine Batches** with arrival date, quantity, cost, selling price, and expiry date.
- Employs **FEFO (First-Expiry-First-Out)** deduction strategy during checkout to dispense items from closest-to-expiry active batches.
- Logs all inventory transactions (`RECEIPT`, `DISPENSE`, `ADJUSTMENT`) into `StockTransaction` collection.
- Logs all system events into searchable `AuditLog` collection.

### 3. Shopping Flow & Backend Price Validation
- Shopping Cart with drawer overlay, quantity controls, and prescription attachment badges.
- Backend calculates subtotals and delivery charges safely without trusting frontend prices.
- Live order status tracking (`Confirmed` -> `Processing` -> `Dispatched` -> `Delivered`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router DOM v6, Axios.
- **Backend**: Node.js, Express.js, Mongoose, JWT authentication, bcryptjs, Multer, Tesseract.js.
- **Database**: MongoDB (Supports MongoDB Atlas via `MONGODB_URI` in `.env` or automatic fallback to `mongodb-memory-server` out-of-the-box).

---

## ⚙️ How to Run locally

### 1. Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` and automatically populates database seed data on first run.*

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with automated proxy to backend API.*
