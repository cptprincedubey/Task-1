# Complete Authentication System Overview

## ✅ System Components

### 1. **User Model** (`Backend/src/models/user.model.js`)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  isVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationTokenExpiry: Date
}
```

### 2. **Authentication Flow**

#### **Registration Flow**
```
User → Register Page (Frontend)
  ↓
User fills: name, email, password
  ↓
POST /api/auth/register
  ↓
Backend:
  • Hash password
  • Generate verification token (expires in 24 hours)
  • Save user with isVerified = false
  • Send verification email
  ↓
Frontend: Show "Check Your Email" message
  ↓
User clicks email verification link
  ↓
GET /api/auth/verify-email/:token
  ↓
Backend: Verify token, set isVerified = true
  ↓
Frontend: Show success, redirect to login
```

#### **Login Flow**
```
User → Login Page (Frontend)
  ↓
User fills: email, password
  ↓
POST /api/auth/login
  ↓
Backend:
  • Find user by email
  • Check if email is verified (isVerified = true)
  • Verify password
  • Generate JWT token
  ↓
Response: { token: "jwt_token" }
  ↓
Frontend:
  • Store token in localStorage
  • Set Authorization header: "Bearer {token}"
  • Redirect to /profile
```

#### **Profile Access (Protected Route)**
```
User visits /profile
  ↓
ProtectedRoute checks localStorage for token
  ↓
If token exists:
  • Render page
  • axios interceptor adds "Authorization: Bearer {token}" to all requests
  ↓
If token missing:
  • Redirect to /login
```

#### **Fetch Protected Data**
```
GET /api/auth/profile
  ↓
Authorization header: Bearer {token}
  ↓
Backend authMiddleware:
  • Extract token from header
  • Verify JWT signature
  • Decode token to get user ID
  • Fetch user from database
  • Attach user to req.user
  ↓
Controller returns { name, email }
  ↓
TanStack Query caches & displays data
```

### 3. **Key Endpoints**

| Method | Endpoint | Body | Response | Status |
|--------|----------|------|----------|--------|
| POST | `/auth/register` | `{name, email, password}` | `{message, email}` | 201 |
| GET | `/auth/verify-email/:token` | - | `{message}` | 200 |
| POST | `/auth/login` | `{email, password}` | `{token}` | 200 |
| GET | `/auth/profile` | - | `{name, email}` | 200 |
| POST | `/auth/logout` | - | `{message}` | 200 |

### 4. **Error Handling**

| Error | Status | Message |
|-------|--------|---------|
| Missing required fields | 400 | "Name, email, and password are required" |
| Email already registered | 422 | "Email already registered" |
| User not found | 404 | "User not found" |
| Email not verified | 403 | "Please verify your email first..." |
| Invalid password | 400 | "Invalid credentials" |
| Invalid token | 401 | "Invalid or expired token" |
| Missing token | 401 | "Token not found" |

## 🎯 Frontend Pages

### **Register Page** (`/register`)
- Input fields: Name, Email, Password
- On success: Show email verification notice
- On error: Display backend error message with yellow/red styling

### **Email Verification Page** (`/verify-email/:token`)
- Auto-verifies email on page load
- Shows success screen with link to login
- Shows error screen if token invalid/expired
- Option to re-register

### **Login Page** (`/login`)
- Input fields: Email, Password
- On success: Store token, redirect to `/profile`
- On error: Display backend error message
- Special styling for email verification errors (yellow alert)

### **Profile Page** (`/profile`) - Protected
- Shows: Name, Email
- Uses TanStack Query to fetch `/api/profile`
- Auto-attaches JWT token via axios interceptor
- Show logout button

## 🔧 Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite (bundler)
- Tailwind CSS (styling)
- TanStack Query (data fetching & caching)
- Axios (HTTP client)
- React Router (routing)

**Backend:**
- Node.js with Express
- MongoDB (database)
- Mongoose (ODM)
- JWT (authentication)
- bcrypt (password hashing)
- Nodemailer (email)

## 🚀 How to Test

1. **Start Backend:**
   ```bash
   cd Backend
   npm start
   ```
   Expected: Server running on http://localhost:3000

2. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```
   Expected: Dev server on http://localhost:5176

3. **Test Registration:**
   - Visit http://localhost:5176/register
   - Fill in: Name, Email, Password
   - Backend sends verification email
   - Check email for verification link (or check backend logs for email service)
   - Click link or go to verification page

4. **Test Email Verification:**
   - After registration, verification email is sent
   - Copy token from URL or email link
   - Navigate to `/verify-email/{token}`
   - Should see success message

5. **Test Login:**
   - Visit http://localhost:5176/login
   - Use verified email and password
   - Should redirect to `/profile`
   - Profile page shows name and email

6. **Test Protected Route:**
   - Open DevTools, go to Storage/LocalStorage
   - Delete the token
   - Refresh `/profile` page
   - Should redirect to login

7. **Test Logout:**
   - Click "Sign Out" button on profile
   - Token removed from localStorage
   - Redirect to login page

## 📧 Email Verification

Verification emails are sent using Nodemailer (Gmail SMTP).

**Email template includes:**
- Welcome message with user's name
- Verification link with 24-hour expiry token
- Instructions if button doesn't work
- Copy-paste backup link

## 🔐 Security Features

✅ Passwords hashed with bcrypt (10 salt rounds)
✅ JWT tokens with 1-hour expiry
✅ Email verification required before login
✅ Authorization header required for protected routes
✅ Token stored in localStorage (not cookies)
✅ 401 Unauthorized on invalid/missing tokens
✅ CORS enabled for frontend requests

## 📝 Notes

- Backend stored at `http://localhost:3000/api`
- Frontend stored at `http://localhost:5176`
- JWT_SECRET stored in `.env` file
- MongoDB connection string in `.env` file
- Email service credentials in `.env` file

---

**System Status:** ✅ COMPLETE & FUNCTIONAL
