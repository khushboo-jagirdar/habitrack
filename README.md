# HabiTrack

A full-stack real estate web application built in 2025 with Aadhaar identity verification, MongoDB Atlas, JWT authentication, and a responsive React UI.

---

## Folder Structure

```
HABITRACK/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Chat.js
│   │   ├── Contact.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── properties.js
│   │   ├── chat.js
│   │   ├── contact.js
│   │   ├── transactions.js
│   │   ├── admin.js
│   │   └── notifications.js
│   ├── uploads/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── UI/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── navbar/
│       │   ├── card/
│       │   ├── chat/
│       │   ├── filter/
│       │   ├── list/
│       │   ├── map/
│       │   ├── pin/
│       │   ├── searchBar/
│       │   └── slider/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── lib/
│       │   ├── api.js
│       │   ├── userApi.js
│       │   ├── propertyApi.js
│       │   ├── chatApi.js
│       │   ├── contactApi.js
│       │   ├── transactionApi.js
│       │   ├── agentsData.js
│       │   └── locationFormatter.js
│       ├── routes/
│       │   ├── aadhaarVerify/
│       │   ├── about/
│       │   ├── admin/
│       │   ├── agents/
│       │   ├── contact/
│       │   ├── forgotPassword/
│       │   ├── homepage/
│       │   ├── layout/
│       │   ├── listPage/
│       │   ├── profilePage/
│       │   ├── signIn/
│       │   ├── signUp/
│       │   └── singlePage/
│       ├── styles/
│       │   └── responsive.scss
│       ├── App.jsx
│       ├── main.jsx
│       └── index.scss
│
├── PROJECT_DOCUMENTATION.md
└── README.md
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev       # http://localhost:5000
```

### 2. Frontend

```bash
cd UI
npm install
npm run dev       # http://localhost:5173
```

---

## Environment Variables (`backend/.env`)

```env
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<your secret>
PORT=5000
ADMIN_EMAIL=admin@habittrack.com
ADMIN_PASSWORD=Admin@1234
NODE_ENV=development
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router v7, SCSS |
| Maps | Leaflet, React-Leaflet |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| File Uploads | Multer |

For full feature details and API documentation see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).
