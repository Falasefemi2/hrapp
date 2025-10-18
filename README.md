# 🚀 HR Management System - Complete Setup Guide

## 📋 Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Resend account (for emails) - Sign up at https://resend.com

## 🛠️ Installation Steps

### 1. Create Project Structure
```bash
mkdir hr-management-system
cd hr-management-system
npm init -y
```

### 2. Install NestJS CLI
```bash
npm i -g @nestjs/cli
nest new backend --skip-git
cd backend
```

### 3. Install Dependencies
```bash
# Core dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client bcrypt class-validator class-transformer resend

# Dev dependencies
npm install -D prisma @types/bcrypt @types/passport-jwt typescript ts-node
```

### 4. Setup Prisma
```bash
npx prisma init
```

### 5. Update Schema
Copy the improved schema from the first artifact to `prisma/schema.prisma`

### 6. Create Environment Variables
Create `.env` file in root:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
RESEND_API_KEY="re_YOUR_RESEND_API_KEY_HERE"
APP_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

**Get Resend API Key:**
1. Go to https://resend.com
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy and paste into `.env`

### 7. Generate Prisma Client
```bash
npx prisma generate
```

### 8. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 9. Create Seed File
Create `prisma/seed.ts` and copy the seed script from the configuration artifact.

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

### 10. Seed Database
```bash
npx prisma db seed
```

### 11. Copy Module Files
Copy all the module files from the artifacts into your `src/` directory following the structure shown.

### 12. Start Development Server
```bash
npm run start:dev
```

Server will start at: `http://localhost:4000/api/v1`

---

## 🔐 Default Login Credentials
After seeding:
- **Email:** admin@company.com
- **Password:** Admin@123

---

## 📡 Testing the API

### Using cURL:

**1. Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin@123"
  }'
```

**2. Get Profile (use token from login):**
```bash
curl -X GET http://localhost:4000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**3. Create New User:**
```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "roleId": "EMPLOYEE_ROLE_ID",
    "departmentId": "IT_DEPT_ID"
  }'
```

---

## 📊 View Database
```bash
npx prisma studio
```
Opens at: http://localhost:5555

---

## 🏗️ Project Structure
```
hr-management-system/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db (created after migration)
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   └── guards/
│   ├── config/
│   ├── prisma/
│   ├── auth/
│   ├── user/
│   ├── role/
│   ├── department/
│   ├── designation/
│   ├── level/
│   ├── email/
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 🎯 Next Steps

Now that basic auth, user, role, department, designation, and level modules are complete, we need to build:

1. ✅ **Candidate & Offer Module** - For sending job offers
2. ✅ **Leave Management Module** - Apply, approve leaves
3. ✅ **HMO Management Module** - Apply for HMO
4. ✅ **E-Memo Module** - Create and approve memos
5. ✅ **E-Voucher Module** - Create and approve vouchers
6. ✅ **Exit/Retirement Module** - Apply for exit
7. ✅ **Document Management Module** - Upload/manage documents
8. ✅ **Reading List Module** - Mandatory readings
9. ✅ **Holiday Management Module** - Manage holidays
10. ✅ **Notification Module** - In-app notifications

---

## 🔄 Workflow Summary

### Role Permissions:
| Role | Can Do |
|------|--------|
| **HR** | Manage all users, departments, send offers, approve all |
| **HOD** | Approve leave, memos, exits from their department |
| **EXCO** | Approve major leaves, approve vouchers |
| **FINANCE** | Generate vouchers, financial reports |
| **EMPLOYEE** | Apply for leave, HMO, memos, vouchers, exit |

### Approval Flow:
- **Leave:** Employee → HOD → EXCO (for >5 days)
- **Memo:** Employee → HOD
- **Voucher:** Employee → EXCO → Finance (generates)
- **HMO:** Employee → HR
- **Exit:** Employee → HOD → HR

---

## 🚨 Common Issues

**Issue:** Prisma Client not found
```bash
npx prisma generate
```

**Issue:** Database locked
```bash
# Close Prisma Studio and restart
```

**Issue:** Email not sending
- Check RESEND_API_KEY in .env
- Verify email domain in Resend dashboard
- Check Resend logs

**Issue:** JWT errors
- Ensure JWT_SECRET is at least 32 characters
- Check token expiration

---

## 📧 Email Configuration

**For Development:**
- Use Resend free tier (3000 emails/month)
- Update `from` email in email.service.ts to your verified domain

**For Production:**
- Verify your domain in Resend
- Update all email templates
- Consider using your company domain

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong passwords for admin accounts
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up proper logging
- [ ] Regular security audits

---

## 📝 Database Backup

```bash
# Backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Restore
cp prisma/backup-YYYYMMDD.db prisma/dev.db
```

---

## 🎉 You're All Set!

Your HR Management System backend is now running. The next step is to build the remaining modules (Leave, HMO, Memo, Voucher, etc.).

Would you like me to continue with the next module?
