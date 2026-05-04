# HopeHRS - Human Resource Management System

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success)](https://hrssystem.vercel.app)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-blue)](https://supabase.com)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com)

## 📋 Overview

HopeHRS is a comprehensive web-based Human Resource Management System designed to manage employee records, job history, job positions, and departments with granular access control. The system supports three user roles (SUPERADMIN, ADMIN, USER) with specific rights and permissions.

### Key Features

- **Employee Management** - View, add, edit, and soft-delete employee records
- **Job History Tracking** - Track employee career progression with job, department, salary, and effective dates
- **Job Management** - Maintain job code catalogue (PRES, VP, MGR, SA1, etc.)
- **Department Management** - Manage department code catalogue (ACT, BR1, IT, HRD, etc.)
- **Rights Management** - Granular permissions per module (17 rights across 5 modules)
- **Soft Delete & Recovery** - Deleted records hidden from USER, recoverable by ADMIN/SUPERADMIN
- **Deleted Items Panel** - View and recover deactivated records across all modules
- **Admin User Management** - Activate/deactivate user accounts (SUPERADMIN only)
- **HR Reports** - Headcount by department, salary summary by job, employee full history
- **Authentication** - Email/Password and Google OAuth login

## 🚀 Live Demo

- **Production URL:** [https://hrssystem.vercel.app](https://hrssystem.vercel.app)

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **SUPERADMIN** | Full system control | All 17 rights = 1 |
| **ADMIN** | HR Manager | VIEW + ADD + EDIT for all modules, ADM_USER = 0, DEL = 0 |
| **USER** | HR Staff | VIEW only for Emp_Mod, JH_Mod, Job_Mod, Dept_Mod |

## 🛠️ Technology Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email/Password + Google OAuth) |
| **Deployment** | Vercel |
| **Version Control** | Git, GitHub |

## 📁 Project Structure

HopeHRS/
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── AddEmployeeModal.jsx
│ │ ├── EditEmployeeModal.jsx
│ │ ├── JobHistoryPanel.jsx
│ │ ├── Layout.jsx
│ │ ├── Navbar.jsx
│ │ ├── Sidebar.jsx
│ │ ├── ProtectedRoute.jsx
│ │ └── SoftDeleteConfirmDialog.jsx
│ ├── pages/ # Main pages
│ │ ├── EmployeeListPage.jsx
│ │ ├── EmployeeDetailPage.jsx
│ │ ├── JobListPage.jsx
│ │ ├── DeptListPage.jsx
│ │ ├── DeletedItems.jsx
│ │ ├── AdminPage.jsx
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ └── AuthCallback.jsx
│ ├── context/ # React Context providers
│ │ ├── AuthContext.jsx
│ │ └── UserRightsContext.jsx
│ ├── hooks/ # Custom React hooks
│ │ ├── useAuth.js
│ │ ├── useRights.js
│ │ ├── useAdmin.js
│ │ └── useReports.js
│ ├── services/ # API service functions
│ │ ├── employeeService.js
│ │ ├── jobHistoryService.js
│ │ ├── jobService.js
│ │ ├── departmentService.js
│ │ ├── adminService.js
│ │ └── reportService.js
│ ├── lib/ # Configuration
│ │ └── supabase.js
│ └── utils/ # Utility functions
│ └── stamp.js
├── public/ # Static assets
├── vercel.json # Vercel deployment config
├── vite.config.js # Vite configuration
├── tailwind.config.js # Tailwind CSS config
└── package.json # Dependencies and scripts
