# CarePoint Hospital Management Frontend

A responsive React + Vite hospital management app connected to the Express/MySQL backend in the sibling `../backend and database/` folder.

## Requirements

- Node.js 20+ (Node.js 20 LTS or 22 LTS recommended)
- npm

## Install and run

```bash
npm install
npm run dev
```

Before starting, configure MySQL and `../backend and database/.env` as described in [the backend README](../backend%20and%20database/README.md). `npm run dev` starts the API and Vite frontend together; open `http://localhost:5173`. Vite forwards `/api` requests to the backend on port 5000.

For a local demo, copy the backend [`.env.example`](../backend%20and%20database/.env.example) to `../backend and database/.env`, enter the MySQL administrator password, then run `npm run db:setup`, `npm run seed:admin`, and `npm run seed:demo` from the frontend project root.

Production build and preview:

```bash
npm run build
npm start
```

In production, Express serves the built frontend and API from the same origin at `http://localhost:5000`.

## Included modules

Dashboard, Patients, Doctors, Departments, Appointments (list and calendar views), Rooms, Admissions, Medical Records, Prescriptions, Laboratory, Billing, Payments, Staff, Reports, Users, Settings, and Audit Logs.

Module screens use reusable forms and tables with API-backed CRUD, search, filters, sorting, pagination, CSV export, confirmation prompts, and toast feedback. Dashboard figures and audit activity come from the API.

## Project structure

```text
src/
  components/   Shared navigation, modal, table, pagination, and toast components
  data/         Module definitions and navigation
  pages/        Dashboard and reusable module screen
  services/     Axios client and authenticated API helpers
  App.jsx
  App.css
  main.jsx
```

Backend installation, MySQL setup, and known limitations are documented in [the backend README](../backend%20and%20database/README.md).
