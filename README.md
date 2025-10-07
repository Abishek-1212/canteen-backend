# Canteen Backend - Ready for Render.com Deployment

Backend API for the Canteen Food Ordering System built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Deploy to Render.com

### Prerequisites
- GitHub account
- Render.com account (free)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/canteen-backend.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Create PostgreSQL database first:
   - New + → PostgreSQL
   - Name: canteen-database
   - Free tier
4. Create Web Service:
   - New + → Web Service
   - Connect GitHub repo
   - Settings:
     - Name: canteen-backend
     - Runtime: Node
     - Build: `npm install`
     - Start: `npm start`
     - Instance: Free

### Step 3: Environment Variables
Add these in Render dashboard:
- `DATABASE_URL` - Copy from PostgreSQL connection string
- `JWT_SECRET` - your_secret_key
- `NODE_ENV` - production

### Step 4: Create Database Tables
1. Go to PostgreSQL database in Render
2. Connect using PSQL command
3. Run SQL from `database.sql`

### Step 5: Test
Visit your Render URL:
```
https://your-app.onrender.com
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Canteens
- `GET /api/canteens` - Get all
- `POST /api/canteens` - Add (admin)

### Menu
- `GET /api/menu` - Get all items
- `POST /api/menu` - Add item (admin)

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders/user` - Get user orders

## 🔒 Admin Credentials
- Username: `admin@123`
- Password: `admin@1212`

## 📊 Technology Stack
- Node.js + Express
- PostgreSQL (Render free tier)
- JWT Authentication
- bcrypt for password hashing

## 🆘 Troubleshooting

**Cold starts:** Free tier sleeps after 15 min inactivity - first request takes 30-60 seconds.

**Database connection:** Make sure `DATABASE_URL` includes SSL parameters.

**Logs:** Check Render dashboard → Logs tab for errors.

## 📞 Support
Check Render documentation: https://render.com/docs
