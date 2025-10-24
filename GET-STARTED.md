# 🚀 MyDietCoach - Cloud Database Setup

## What You Asked For

You said: **"i want my database that all user data save in server not local phone storage"**

✅ **Done!** I've created a complete backend server with cloud database support.

---

## 📦 What I Created For You

```
backend/
├── server.js              ← Complete REST API server (415 lines)
├── package.json           ← Backend dependencies
├── .env.example           ← Configuration template
├── migrations/
│   └── run-migrations.js  ← Database setup script
├── README.md              ← Full documentation
├── QUICKSTART.md          ← Step-by-step guide
├── ARCHITECTURE.md        ← Visual diagrams
└── SUMMARY.md             ← Complete overview

service/
└── api.cloud.ts           ← Cloud-ready mobile API (500+ lines)

Root/
├── start-here.sh          ← Automated setup script (RUN THIS!)
└── GET-STARTED.md         ← This file
```

---

## ⚡ Quick Start (5 Steps)

### Step 1: Install PostgreSQL
```bash
# Mac
brew install postgresql
brew services start postgresql

# Create database
createdb mydietcoach
```

### Step 2: Run Automated Setup
```bash
./start-here.sh
```

This will:
- ✅ Install backend dependencies
- ✅ Setup database and run migrations
- ✅ Show your IP address for mobile app
- ✅ Start the server

### Step 3: Update Mobile App

1. **Find your computer IP** (shown by start-here.sh)
   
2. **Open:** `service/api.cloud.ts`
   
3. **Change line 11:**
   ```typescript
   const API_URL = 'http://YOUR_IP_HERE:3000/api';
   ```
   Replace `YOUR_IP_HERE` with your actual IP (like `192.168.1.100`)

4. **Switch to cloud API:**
   ```bash
   mv service/api.ts service/api.local.ts
   mv service/api.cloud.ts service/api.ts
   ```

### Step 4: Restart Mobile App
```bash
npx expo start --clear
# Press 'i' for iOS or 'a' for Android
```

### Step 5: Test It!
```bash
# In a new terminal, test the server
curl http://localhost:3000/health

# Sign up a new user in your app
# Then check if it's saved to database
psql mydietcoach
SELECT * FROM users;
```

---

## 🎯 What Changed?

### BEFORE (Current - Local Storage)
```
📱 Mobile App → AsyncStorage → 📂 Phone Storage
```
- Data saved only on your phone
- No sync between devices
- Lost if you delete app

### AFTER (Cloud Database)
```
📱 Mobile App → HTTP API → 🖥️ Server → 💾 PostgreSQL Cloud Database
```
- Data saved on server
- Access from multiple devices
- Never lost, always backed up

---

## 🌐 API Endpoints Created

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/register` | Create new user |
| POST | `/api/users/login` | Authenticate user |
| GET | `/api/users/:email` | Get user by email |
| PUT | `/api/users/:userId` | Update user profile |
| POST | `/api/water/track` | Track water intake |
| GET | `/api/water/today/:userId` | Get today's water |
| POST | `/api/water/reset` | Reset daily water |
| POST | `/api/recipes/custom` | Save custom recipe |
| GET | `/api/recipes/custom/:userId` | Get user recipes |
| DELETE | `/api/recipes/:recipeId` | Delete recipe |
| POST | `/api/progress` | Add progress entry |
| GET | `/api/progress/:userId` | Get progress data |

---

## 🧪 Testing

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"healthy","timestamp":"..."}`

### Test 2: Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test User","password":"test123"}'
```
Expected: `{"user":{...},"message":"User registered successfully"}`

### Test 3: Check Database
```bash
psql mydietcoach
SELECT * FROM users;
```
Expected: You should see the test user in the database

---

## 🚀 Deploy to Production (Optional)

When you're ready to host for real users:

### Option 1: Railway (Easiest - Recommended)
```bash
1. Go to railway.app
2. Create account
3. "New Project" → "Deploy from GitHub repo"
4. Add PostgreSQL database
5. Set NODE_ENV=production
6. Deploy!
```

### Option 2: Render
```bash
1. Go to render.com
2. Create account
3. "New Web Service" → Connect GitHub
4. Add PostgreSQL database
5. Deploy!
```

### Option 3: Heroku
```bash
heroku create mydietcoach-api
heroku addons:create heroku-postgresql:mini
git push heroku main
```

After deployment, update mobile app:
```typescript
// service/api.cloud.ts line 11
const API_URL = 'https://mydietcoach-api.railway.app/api';
```

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `backend/README.md` | Complete documentation with all details |
| `backend/QUICKSTART.md` | Step-by-step commands |
| `backend/ARCHITECTURE.md` | Visual diagrams and architecture |
| `backend/SUMMARY.md` | Complete implementation summary |
| `start-here.sh` | Automated setup script (run this!) |
| `GET-STARTED.md` | This file - quick overview |

---

## ⚠️ Security TODO (Before Public Launch)

Current implementation is **functional but not production-secure**. Add these before releasing:

- [ ] Password hashing (bcrypt/argon2)
- [ ] JWT authentication tokens
- [ ] Input validation (joi/yup)
- [ ] Rate limiting
- [ ] HTTPS/SSL certificates
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Security headers

---

## 🆘 Troubleshooting

### Problem: "createdb: command not found"
```bash
# Install PostgreSQL
brew install postgresql
brew services start postgresql
```

### Problem: "Cannot connect to database"
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Check your .env file has correct credentials
cat backend/.env
```

### Problem: "Mobile app can't connect to server"
```bash
# Check server is running
curl http://localhost:3000/health

# Check IP address in api.cloud.ts matches your computer
ifconfig | grep "inet " | grep -v 127.0.0.1

# Make sure phone and computer are on same Wi-Fi network
```

### Problem: "npm run migrate fails"
```bash
# Check database exists
psql -l | grep mydietcoach

# Check DATABASE_URL in .env
cat backend/.env

# Try creating database manually
createdb mydietcoach
npm run migrate
```

---

## 🎓 Learning Resources

- **API Documentation**: See `backend/README.md`
- **Architecture Diagrams**: See `backend/ARCHITECTURE.md`
- **Step-by-Step Guide**: See `backend/QUICKSTART.md`
- **Complete Summary**: See `backend/SUMMARY.md`

---

## 💡 Pro Tips

1. **Development**: Use `npm run dev` - auto-restarts on file changes
2. **Production**: Use `npm start` - stable production mode
3. **Debugging**: Check server logs in terminal where backend runs
4. **Testing**: Use Postman or curl to test API endpoints
5. **Database**: Use `psql mydietcoach` to inspect data directly

---

## 🎉 You're Ready!

Your cloud database backend is **completely ready**. Just run:

```bash
./start-here.sh
```

And follow the prompts! The script will guide you through everything.

---

## 📞 Next Steps

1. ✅ Run `./start-here.sh` to setup backend
2. ✅ Update mobile app with your IP address
3. ✅ Switch to cloud API
4. ✅ Test signup/login in mobile app
5. ✅ Verify data is saved in PostgreSQL database
6. ✅ Deploy to Railway/Render/Heroku
7. ✅ Add security features before public launch

---

**Your request:** "i want my database that all user data save in server not local phone storage"

**Status:** ✅ **COMPLETE!** Everything is ready to use. Just run the setup script!

