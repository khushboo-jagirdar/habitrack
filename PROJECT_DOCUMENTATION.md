# HabiTrack — Project Documentation

> A full-stack real estate web application built in 2025 for buying, renting, and managing properties across India.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture & Flow](#4-architecture--flow)
5. [Features](#5-features)
6. [Database Models](#6-database-models)
7. [API Routes](#7-api-routes)
8. [User Roles](#8-user-roles)
9. [Page-by-Page Flow](#9-page-by-page-flow)
10. [Authentication Flow](#10-authentication-flow)
11. [Admin Panel Flow](#11-admin-panel-flow)
12. [Transaction Flow](#12-transaction-flow)
13. [How to Run](#13-how-to-run)

---

## 1. Project Overview

**HabiTrack** is a property discovery and transaction platform built for the Indian real estate market. It allows users to:

- Browse, search, and filter properties for sale or rent
- View properties on an interactive map
- Register as a buyer, property owner, or agent
- Verify identity via Aadhaar OTP
- Buy or rent properties with a simulated card payment
- Chat directly with property owners
- Save favourite properties to their profile
- Owners/agents can list their own properties
- Admins can manage all users, properties, and transactions from a dedicated dashboard

The project was founded and built in **2025** as a college project.

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI library |
| Vite | 5.1 | Build tool & dev server |
| React Router DOM | 7.9 | Client-side routing |
| React Leaflet + Leaflet | 4.2 / 1.9 | Interactive maps (OpenStreetMap) |
| SASS (SCSS) | 1.93 | Styling with mixins & variables |
| React Toastify | 11.0 | Toast notifications |
| Context API | built-in | Global auth state management |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| Express.js | 4.18 | REST API framework |
| MongoDB Atlas | Cloud | Database |
| Mongoose | 9.3 | ODM for MongoDB |
| bcryptjs | 2.4 | Password hashing |
| JSON Web Token (JWT) | 9.0 | Authentication tokens |
| Multer | 2.0 | Image/file uploads |
| dotenv | 17.3 | Environment variable management |
| CORS | 2.8 | Cross-origin request handling |

### External Services
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted database |
| Nominatim (OpenStreetMap) | Address geocoding (lat/lng auto-detection) |
| Aadhaar OTP API (Surepass / Digio) | Identity verification (dev mode available) |
| UI Avatars API | Auto-generated user avatars |

---

## 3. Project Structure

```
HABITRACK/
├── backend/                    # Node.js + Express API
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Property.js         # Property schema
│   │   ├── Transaction.js      # Transaction schema
│   │   ├── Chat.js             # Chat/messaging schema
│   │   └── Contact.js          # Contact form schema
│   ├── routes/
│   │   ├── auth.js             # Register, Login, Admin Login, Aadhaar OTP
│   │   ├── user.js             # Profile update, saved properties
│   │   ├── properties.js       # CRUD for properties
│   │   ├── transactions.js     # Buy/rent transactions
│   │   ├── chat.js             # Messaging threads
│   │   ├── contact.js          # Contact form submissions
│   │   ├── admin.js            # Admin-only routes
│   │   └── notifications.js    # Notifications
│   ├── uploads/                # Uploaded property images
│   ├── index.js                # Express app entry point
│   └── .env                    # Environment variables
│
└── UI/                         # React + Vite frontend
    └── src/
        ├── components/
        │   ├── navbar/         # Navigation bar
        │   ├── card/           # Property card component
        │   ├── list/           # Property list component
        │   ├── map/            # Leaflet map component
        │   ├── filter/         # Search filter component
        │   ├── searchBar/      # Homepage search bar
        │   ├── chat/           # Chat UI component
        │   ├── slider/         # Image slider
        │   └── pin/            # Map pin/marker
        ├── context/
        │   └── AuthContext.jsx # Global auth state (React Context)
        ├── lib/
        │   ├── api.js          # Auth API calls
        │   ├── userApi.js      # User API calls
        │   ├── propertyApi.js  # Property API calls
        │   ├── transactionApi.js # Transaction API calls
        │   ├── chatApi.js      # Chat API calls
        │   ├── contactApi.js   # Contact API calls
        │   └── agentsData.js   # Static agents data
        ├── routes/
        │   ├── homepage/       # Landing page
        │   ├── listPage/       # Property listings with filter + map
        │   ├── singlePage/     # Individual property detail
        │   ├── profilePage/    # User profile, saved & transacted properties
        │   ├── signIn/         # Login page
        │   ├── signUp/         # Registration page
        │   ├── forgotPassword/ # Password reset
        │   ├── aadhaarVerify/  # Aadhaar OTP verification
        │   ├── about/          # About HabiTrack
        │   ├── contact/        # Contact form
        │   ├── agents/         # Agents listing + profile
        │   ├── layout/         # Shared layout with Navbar
        │   └── admin/          # Admin login + dashboard
        └── styles/
            └── responsive.scss # Responsive breakpoint mixins
```

---

## 4. Architecture & Flow

```
Browser (React SPA)
       |
       | HTTP requests (fetch API)
       |
  Vite Dev Server (proxy /api → localhost:5000)
       |
  Express.js REST API (port 5000)
       |
  Mongoose ODM
       |
  MongoDB Atlas (Cloud Database)
```

- The frontend is a **Single Page Application (SPA)** — React Router handles all navigation without full page reloads.
- All API calls go through `/api/*` which Vite proxies to the backend during development.
- Authentication uses **JWT tokens** stored in `localStorage`. Every protected request sends the token in the `Authorization: Bearer <token>` header.
- Global auth state is managed via **React Context API** (`AuthContext`) — available to every component.

---

## 5. Features

### For All Users (Public)
- Browse all properties with search and filters (location, price range, type)
- View properties on an interactive OpenStreetMap
- View individual property details with image slider
- View agent profiles
- Contact HabiTrack via contact form
- Read About page

### For Registered Users (Buyer / Renter)
- Sign up and log in
- Aadhaar OTP identity verification
- Save / unsave properties
- Buy or rent a property (simulated card payment)
- View transaction history on profile
- Chat with property owners
- Update profile (name, avatar, user type)
- Reset password

### For Property Owners / Agents
- All buyer features
- Create new property listings with up to 5 images
- Auto-geocoding of address to map coordinates
- View and manage their own listings on profile

### For Admins
- Separate admin login portal (`/admin/login`)
- Dashboard with overview stats (users, properties, transactions, revenue)
- Manage all users (create, edit, delete, toggle admin/Aadhaar status)
- View and delete all properties
- View all transactions
- Filter users by Aadhaar verification status

---

## 6. Database Models

### User
| Field | Type | Description |
|---|---|---|
| fullName | String | User's full name |
| email | String | Unique email (lowercase) |
| password | String | bcrypt hashed password |
| userType | Enum | `buyer`, `owner`, `agent`, `admin` |
| isAdmin | Boolean | Admin flag |
| avatar | String | Profile image path |
| savedProperties | Array | List of saved property IDs |
| aadhaarNumber | String | Aadhaar number |
| aadhaarVerified | Boolean | Verification status |
| aadhaarOtp | String | Temporary OTP (dev mode) |
| aadhaarOtpExpiry | Date | OTP expiry (10 min) |

### Property
| Field | Type | Description |
|---|---|---|
| ownerId | Mixed | Reference to User |
| title | String | Property title |
| address | String | Full address |
| price | Number | Price in INR |
| type | Enum | `buy` or `rent` |
| propertyType | Enum | `house`, `apartment`, `condo`, `land`, `other` |
| bedroom | Number | Number of bedrooms |
| bathroom | Number | Number of bathrooms |
| images | [String] | Array of image paths |
| latitude / longitude | Number | Map coordinates |
| legalStatus | Enum | `legal` or `illegal` |
| verified | Boolean | Verification status |
| verificationLog | Array | Audit trail of verifications |

### Transaction
| Field | Type | Description |
|---|---|---|
| propertyId | Mixed | Reference to Property |
| buyerId | Mixed | Reference to User (buyer) |
| ownerId | Mixed | Reference to User (owner) |
| type | Enum | `buy` or `rent` |
| amount | Number | Transaction amount in INR |
| status | Enum | `pending`, `completed`, `cancelled` |
| paymentLast4 | String | Last 4 digits of card |

### Chat
| Field | Type | Description |
|---|---|---|
| users | Array | Two user IDs in the thread |
| messages | Array | Array of `{ senderId, text, createdAt }` |

### Contact
| Field | Type | Description |
|---|---|---|
| name | String | Sender's name |
| email | String | Sender's email |
| subject | String | Message subject |
| message | String | Message body |

---

## 7. API Routes

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | User login → returns JWT |
| POST | `/admin/login` | Admin login → returns JWT |
| POST | `/reset-password` | Reset user password |
| POST | `/aadhaar/send-otp` | Send Aadhaar OTP |
| POST | `/aadhaar/verify-otp` | Verify Aadhaar OTP |

### User — `/api/user`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/:id` | Get user public info |
| PUT | `/profile/:id` | Update profile (name, avatar, type) |
| GET | `/:id/saved-properties` | Get saved property IDs |
| POST | `/:id/saved-properties` | Save a property |
| DELETE | `/:id/saved-properties/:propertyId` | Remove saved property |

### Properties — `/api/properties`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all properties (with filters) |
| GET | `/:id` | Get single property |
| POST | `/` | Create property (multipart/form-data) |
| PUT | `/:id` | Update property |
| DELETE | `/:id` | Delete property |
| GET | `/owner/:ownerId` | Get properties by owner |
| PUT | `/:id/verify` | Mark property verified/legal status |

### Transactions — `/api/transactions`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create transaction (buy/rent) |
| GET | `/user/:userId` | Get transactions for a user |
| GET | `/` | Get all transactions |

### Chat — `/api/chat`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/thread` | Create or get existing chat thread |
| GET | `/threads/:userId` | Get all threads for a user |
| POST | `/message` | Send a message |

### Admin — `/api/admin` *(requires admin JWT)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard overview stats |
| GET | `/users` | All users |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/properties` | All properties |
| DELETE | `/properties/:id` | Delete property |
| GET | `/transactions` | All transactions |

---

## 8. User Roles

| Role | Can Do |
|---|---|
| **Buyer** | Browse, search, save, buy/rent properties, chat, verify Aadhaar |
| **Owner** | Everything a buyer can + create/manage property listings |
| **Agent** | Everything an owner can + listed under Agents page |
| **Admin** | Full access to admin dashboard — manage users, properties, transactions |

---

## 9. Page-by-Page Flow

### `/` — Homepage
- Hero section with search bar
- Features section (Verified Listings, Secure Transactions, Maps, etc.)
- How It Works (4 steps)
- Early user testimonials
- CTA to browse or sign up

### `/list` — Property Listings
- Filter panel: city, min/max price, type (buy/rent), bedrooms
- Property cards grid on the left
- Interactive Leaflet map on the right with clickable pins
- Clicking a pin shows a popup with property info

### `/:id` — Single Property Page
- Image slider
- Property details (title, address, price, type, bedrooms, bathrooms)
- Owner info card
- Legal/verification status badges
- Leaflet map showing property location
- Save / Unsave button
- Buy or Rent button → opens payment modal
- Send Message button → opens message modal
- Mark as Legal / Flag Illegal buttons

### `/profile` — User Profile
- View and edit profile (name, avatar, user type)
- Aadhaar verification status / link to verify
- My Listings (owners/agents only)
- Create New Property form (owners/agents only)
- Saved Properties list
- My Transactions list (properties bought/rented)
- Chat panel

### `/signin` & `/signup`
- Standard login / registration forms
- Auto-login after registration
- Redirect to home on success

### `/forgot-password`
- Enter email + new password to reset

### `/verify-aadhaar`
- Enter 12-digit Aadhaar number
- Receive OTP (real SMS via Surepass/Digio, or shown on screen in dev mode)
- Enter OTP to verify identity

### `/about`
- Team members
- Company story
- Core values
- Milestone timeline (2025)

### `/contact`
- Contact form → saved to database

### `/agents` & `/agents/:id`
- Grid of all agents with ratings, specialties, deals closed
- Individual agent profile page

### `/admin/login`
- Separate admin login (email: `admin@habittrack.com`, password: `Admin@1234`)

### `/admin/dashboard`
- Overview: total users, verified users, properties, transactions, revenue
- Users tab: full CRUD, toggle admin/Aadhaar status
- Properties tab: view and delete all listings
- Transactions tab: full transaction history
- Aadhaar tab: filter users by verification status

---

## 10. Authentication Flow

```
User fills Sign Up form
        ↓
POST /api/auth/register
        ↓
Password hashed with bcrypt (10 rounds)
        ↓
User saved to MongoDB
        ↓
JWT token generated (expires in 1 day)
        ↓
Token + user object returned to frontend
        ↓
Stored in localStorage
        ↓
AuthContext updates global state
        ↓
User is now logged in across all pages
```

**On every page load:**
- `AuthContext` reads `localStorage` to restore session
- Protected pages check `user` from context
- If not logged in → redirected to `/signin`

**JWT Payload contains:**
```json
{ "id": "...", "email": "...", "userType": "buyer", "isAdmin": false }
```

---

## 11. Admin Panel Flow

```
Navigate to /admin/login
        ↓
Enter admin credentials
        ↓
POST /api/auth/admin/login
        ↓
Credentials checked against .env ADMIN_EMAIL / ADMIN_PASSWORD
(or DB user with isAdmin: true)
        ↓
JWT with isAdmin: true returned
        ↓
Stored in localStorage via AuthContext
        ↓
Redirected to /admin/dashboard
        ↓
All admin API calls send JWT in Authorization header
        ↓
Backend requireAdmin() middleware verifies isAdmin flag
        ↓
On logout → cleared from localStorage → redirected to /admin/login
```

---

## 12. Transaction Flow

```
User clicks "Buy Property" or "Rent Property" on Single Page
        ↓
Payment modal opens (card details form)
        ↓
User enters: Cardholder Name, Card Number, Expiry (MM/YY), CVV
        ↓
Frontend validates format
        ↓
POST /api/transactions
  { userId, propertyId, type, amount, cardNumber, cardHolder, expiryDate, cvv }
        ↓
Backend validates card format (length, CVV, expiry pattern)
        ↓
Transaction saved to DB with status: "completed"
Only last 4 digits of card stored (paymentLast4)
        ↓
Success response returned
        ↓
User redirected to /profile
        ↓
Transaction appears in "My Transactions" section on profile
  (shows property image, title, type badge, amount, card last 4, date)
```

---

## 13. How to Run

### Prerequisites
- Node.js (LTS)
- MongoDB Atlas account (or use the existing URI in `.env`)

### Backend
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:5000
```

### Frontend
```bash
cd UI
npm install
npm run dev        # runs on http://localhost:5173
```

### Environment Variables (`backend/.env`)
```
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<your secret key>
PORT=5000
ADMIN_EMAIL=admin@habittrack.com
ADMIN_PASSWORD=Admin@1234
NODE_ENV=development
```

### Default Admin Credentials
```
Email:    admin@habittrack.com
Password: Admin@1234
URL:      http://localhost:5173/admin/login
```
### SCSS VS CSS
```
Feature 	CSS (Plain)	                                SCSS (Sassy CSS)
Type:-  	Standard Stylesheet Language	    |    Preprocessor (Superset of CSS)
Setup:-	Works instantly in any browser.	            |    Needs a "compiler" to turn it into CSS.
Syntax:-	Flat and repetitive.	            |    Nested (looks like HTML structure).
Variable:- Native var(--name) exists but is newer.  |	Simple $variable support (very powerful).
Reusability:-	Copy-pasting is common.	            |    Mixins let you reuse whole blocks of code.
Math:- 	Limited (mostly calc()).	            |    Built-in operators (+, -, *, /).

```

---

