# 🚀 Quick Start Guide: Local Development to Cloud Database

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 2: Start PostgreSQL

### On Mac (using Homebrew):
```bash
# If not installed
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb mydietcoach
```

### On Linux:
```bash
sudo service postgresql start
createdb mydietcoach
```

## Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env - change YOUR values:
# DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/mydietcoach
```

## Step 4: Run Database Migrations

```bash
npm run migrate
```

You should see:
```
✅ Database schema created successfully!
📊 Tables created: users, recipes, water_tracking, etc.
```

## Step 5: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 MyDietCoach API Server running on port 3000
📡 Health check: http://localhost:3000/health
✅ Connected to PostgreSQL database
```

## Step 6: Test Backend API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:3000/health

# Register a test user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"test123"}'

# You should see:
# {"success":true,"user":{"id":1,"email":"test@example.com","name":"Test User",...}}
```

## Step 7: Update Mobile App

### Find Your Computer's IP Address

```bash
# On Mac
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'

# On Linux
hostname -I | awk '{print $1}'
```

You'll get something like: `192.168.1.100`

### Update API URL in Mobile App

1. Open `service/api.cloud.ts`
2. Change line 11:
   ```typescript
   const API_URL = 'http://YOUR_IP_ADDRESS:3000/api';
   // Example: 'http://192.168.1.100:3000/api'
   ```

3. Switch to cloud API:
   ```bash
   # Backup current AsyncStorage version
   mv service/api.ts service/api.local.ts
   
   # Use cloud version
   mv service/api.cloud.ts service/api.ts
   ```

## Step 8: Test Mobile App

1. **Stop** Metro bundler (Ctrl+C in terminal where npm start is running)

2. **Clear cache** and restart:
   ```bash
   npx expo start --clear
   ```

3. **Press `i`** to open iOS simulator

4. **Try signing up** with a new account

5. **Check backend logs** - you should see:
   ```
   POST /api/users/register
   ✅ User created successfully
   ```

6. **Check database** - you should see the user:
   ```bash
   psql mydietcoach
   SELECT * FROM users;
   ```

## 🎉 Success!

Your app is now using a **cloud database** instead of local storage!

### What Changed:

**Before:**
```
Mobile App → AsyncStorage (local phone storage)
```

**After:**
```
Mobile App → HTTP API → Backend Server → PostgreSQL Database
```

### Test Features:

- ✅ Sign up new user → Check database
- ✅ Login with credentials → Gets user from server
- ✅ Track water → Saved to database
- ✅ Add custom recipe → Stored on server
- ✅ Update profile → Syncs to database

---

## 🌐 Deploy to Production

### Option 1: Railway (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select your myDietCoach repo
5. Railway will detect Node.js and deploy automatically
6. Click "New" → "Database" → "Add PostgreSQL"
7. Railway will set DATABASE_URL automatically
8. Go to Settings → Add Environment Variables:
   - `NODE_ENV=production`
9. Click "Deploy"
10. Get your deployment URL (e.g., `https://mydietcoach-production.up.railway.app`)

**Update mobile app:**
```typescript
const API_URL = __DEV__ 
  ? 'http://192.168.1.100:3000/api'  // Local
  : 'https://mydietcoach-production.up.railway.app/api'; // Production
```

### Option 2: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create mydietcoach-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Push code
git push heroku main

# Run migrations
heroku run npm run migrate

# Open
heroku open
```

### Option 3: Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repo
4. Fill in:
   - **Name:** mydietcoach-api
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
5. Add PostgreSQL database
6. Deploy

---

## 🔧 Troubleshooting

### "Connection refused" on mobile app

**Problem:** iOS simulator can't connect to localhost

**Solution:** Use your computer's IP address, not `localhost`

```bash
# Find IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update API_URL to use this IP
```

### "Database connection failed"

**Check:**
1. PostgreSQL is running: `pg_isready`
2. Database exists: `psql -l | grep mydietcoach`
3. DATABASE_URL in `.env` is correct
4. Your user has permissions

**Fix:**
```bash
# Restart PostgreSQL
brew services restart postgresql

# Recreate database
dropdb mydietcoach  # Be careful!
createdb mydietcoach
npm run migrate
```

### "Module not found: pg"

**Problem:** Dependencies not installed

**Fix:**
```bash
cd backend
npm install
```

### Mobile app still uses AsyncStorage

**Check:**
1. Did you rename `api.cloud.ts` to `api.ts`?
2. Did you update API_URL?
3. Did you clear Metro cache? `npx expo start --clear`
4. Did you restart the app?

---

## 📊 Monitor Your Database

### View users
```sql
psql mydietcoach
SELECT id, email, name, created_at FROM users;
```

### View water tracking
```sql
SELECT u.name, w.date, w.water_consumed 
FROM water_tracking w 
JOIN users u ON w.user_id = u.id;
```

### View custom recipes
```sql
SELECT u.name, r.recipe_name, r.created_at 
FROM recipes r 
JOIN users u ON r.user_id = u.id 
WHERE r.is_custom = true;
```

---

## 🎯 Next Steps

- [ ] Add JWT authentication
- [ ] Hash passwords with bcrypt
- [ ] Add offline sync (hybrid approach)
- [ ] Deploy to production
- [ ] Add push notifications
- [ ] Implement meal plan sharing
- [ ] Add social features
- [ ] Enable recipe photos
- [ ] Add analytics dashboard

---

## 💡 Tips

1. **Keep local backup:** Don't delete `api.local.ts` - useful for testing offline
2. **Test locally first:** Always test on localhost before deploying
3. **Check logs:** `tail -f backend.log` to see API requests
4. **Use Postman:** Great for testing API endpoints
5. **Monitor database:** Use pgAdmin or Postico for visual database management

---

## 📞 Need Help?

- Check backend logs: Server shows all requests
- Check mobile logs: Metro bundler shows errors
- Test API directly: Use curl or Postman
- Check database: Use `psql` to verify data

**Common issues:**
- Firewall blocking port 3000
- Wrong IP address in mobile app
- Database not running
- Environment variables not set
- CORS issues (already handled in server.js)
