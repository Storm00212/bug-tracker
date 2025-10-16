
#  Bug Tracking System (Mini Jira)

A collaborative **web-based bug tracking and project management system** built using **Node.js**, **React**, and **Microsoft SQL Server** — following the **Agile Scrum** methodology.  
This project provides hands-on experience for **Quality Assurance (QA)** and **Quality Engineering (QE)** trainees to simulate real-world bug tracking, sprint management, and testing workflows, similar to **Jira**.

---

##  Overview

The **Bug Tracking System** allows teams to:
- Report, assign, and track software bugs  
- Manage multiple projects  
- Collaborate with threaded comments and attachments  
- Validate workflows through **manual and automated QA testing**  

Built with a **layered architecture** and modular **middleware system**, it’s designed for scalability, maintainability, and clarity.

---

##  Core Features

###  Authentication & Authorization
- **JWT-based authentication**
- **Role-based access control** (`Admin`, `Developer`, `Tester`)
- **Password encryption** using `bcryptjs`

###  Bug Management
- Report, assign, and update bug statuses (`Open → In Progress → Resolved → Closed`)
- Attach files or screenshots (optional)
- Add threaded comments and discussions

###  Project Management
- Create and manage multiple projects
- Filter bugs by **status**, **priority**, or **assigned developer**

### ⚙️ Admin Dashboard
- Manage users and roles
- View system analytics (total bugs, open vs resolved)
- Generate bug summary reports

###  Middleware System
| Middleware | Purpose |
|-------------|----------|
| **`authMiddleware`** | Validates JWTs and user sessions |
| **`roleMiddleware`** | Enforces route-level permissions |
| **`errorHandler`** | Centralized error capture and formatted response |
| **`loggerMiddleware`** | Logs every request (method, endpoint, status, and response time) |
| **`validateInput`** | Ensures incoming request data matches schema requirements |

All middleware is modular, located under `src/middleware/`, and reusable across routes.

---

##  System Architecture

| Layer | Description |
|--------|-------------|
| **Frontend** | React + TypeScript (UI, routing, and state management) |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | Microsoft SQL Server |
| **Architecture** | Layered modular: Controller → Service → Repository |
| **Middleware** | JWT Auth · Role Guards · Error Handler · Logger |
| **Testing** | Postman · Jest · k6 · Cypress |

---

##  Tech Stack

### **Frontend**
- React + TypeScript
- TailwindCSS / DaisyUI
- React Router DOM
- Axios
- Redux Toolkit / Context API

### **Backend**
- Node.js + Express + TypeScript + tsx
- `mssql`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `cors`
- Custom middleware system
- Jest for unit/integration tests

### **Database**
- Microsoft SQL Server
- Connection pooling for optimized performance

---

## Project Structure

```

bug-tracker/
│
├── backend/
│   ├── src/
│   │   ├── config/          # SQL connection, environment setup
│   │   ├── middleware/      # Authentication, logging, validation, and error handling
│   │   ├── controllers/     # Handles route logic
│   │   ├── services/        # Business rules and logic
│   │   ├── repositories/    # Database queries and data access
│   │   ├── routes/          # Express routers
│   │   └── app.ts           # Main application entry point
│   ├── tests/               # Jest & integration tests
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # UI pages (Dashboard, Bugs, Projects)
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Global app context
│   │   ├── api/             # Axios services for backend communication
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md

````

---

## 🧩 Backend Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/bug-tracker.git
cd bug-tracker/backend
````

### 2️ Install Dependencies

```bash
npm install
```

### 3️ Create `.env`

```bash
SQL_SERVER=PAUL-MUYALI\\SQLEXPRESS
SQL_DB=BugTracker
SQL_USER=sa
SQL_PWD=your_password
SQL_PORT=1433
PORT=3000
JWT_SECRET=supersecretkey
```

### 4️ Run the Development Server

```bash
npm run dev
```

Expected output:

```
✅ Connected to SQL Server
🚀 Server running on port 3000
```

---

##  Example Middleware Setup

 **`src/middleware/authMiddleware.ts`**

```ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};
```

 **`src/middleware/errorHandler.ts`**

```ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
```

---

##  Testing & QA Workflow

| Tool              | Purpose                      |
| ----------------- | ---------------------------- |
| **Postman**       | Manual API testing           |
| **Jest**          | Unit & integration tests     |
| **k6**            | Load and performance testing |
| **Cypress**       | UI end-to-end automation     |
| **Jira / Trello** | Sprint and QA issue tracking |

Example command:

```bash
npm run test
```

---

##  Agile Workflow

###  Team Roles

| Role            | Responsibility                        |
| --------------- | ------------------------------------- |
| Product Owner   | Backlog management & prioritization   |
| Scrum Master    | Sprint facilitation & blocker removal |
| Developers / QA | Implementation, testing & reporting   |

###  Sprint Plan

| Sprint | Focus                | Deliverables                        |
| ------ | -------------------- | ----------------------------------- |
| **1**  | SQL connection setup | Working database connection pool    |
| **2**  | DB Schema creation   | Users, Projects, Bugs, Comments     |
| **3**  | Auth & Middleware    | JWT authentication & access control |
| **4**  | Frontend integration | React UI + API connection           |
| **5**  | Testing & Deployment | Jest, Cypress, k6 + CI/CD           |

---

##  Definition of Done (DoD)

* Environment variables validated via `assert`
* SQL Server connected with retry + debug logs
* Authentication middleware implemented
* Centralized error handling middleware active
* All core APIs testable in Postman
* Unit and integration tests pass
* Code reviewed, documented, and pushed to GitHub

---

##  QA/QE Deliverables

| Artifact                | Description                             |
| ----------------------- | --------------------------------------- |
| **Postman Collection**  | Documented API endpoints                |
| **Test Summary Report** | QA testing results and status           |
| **Performance Report**  | k6 results (latency, throughput)        |
| **E2E Report**          | Cypress test outcomes                   |
| **Sprint Report**       | Jira sprint velocity and burndown chart |

---

##  Author

** Paul Muyali**
 Quality Assurance / Quality Engineering Trainee
 Dedan Kimathi University of Technology
 [GitHub Profile](https://github.com/Storm00212)

---

##  License

This project is released under the **MIT License**.
Feel free to use, modify, and expand it for learning and collaboration.

---

> “Quality is not an act, it is a habit.”
> — *Aristotle*

```
