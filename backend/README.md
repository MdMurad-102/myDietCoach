# MyDietCoach Backend API

Backend server for MyDietCoach mobile application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running on your system.

Create a new database:
```bash
createdb mydietcoach
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` and update the DATABASE_URL:
```
DATABASE_URL=postgresql://username:password@localhost:5432/mydietcoach
PORT=3000
NODE_ENV=development
```

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables in your database.

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

### 6. Test the API

```bash
curl http://localhost:3000/health
```

You should see: `{"status":"ok","message":"MyDietCoach API is running"}`

## 📱 Update Mobile App

### Option 1: Switch to Cloud API (Recommended)

Rename `service/api.ts` to `service/api.local.ts` (backup)
Rename `service/api.cloud.ts` to `service/api.ts`

### Option 2: Update API URL for Development

If testing on iOS Simulator:
1. Find your computer's local IP address:
   ```bash
   # On Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Update the API_URL in `service/api.cloud.ts`:
   ```typescript
   const API_URL = 'http://YOUR_IP_ADDRESS:3000/api';
   // Example: 'http://192.168.1.100:3000/api'
   ```

3. Restart your mobile app

## 📡 API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:email` - Get user by email
- `PUT /api/users/:userId` - Update user profile

### Water Tracking
- `POST /api/water/track` - Track water intake
- `GET /api/water/today/:userId` - Get today's water tracking
- `POST /api/water/reset` - Reset water tracking

### Custom Recipes
- `POST /api/recipes/custom` - Save custom recipe
- `GET /api/recipes/custom/:userId` - Get user's recipes
- `DELETE /api/recipes/:recipeId` - Delete recipe

### Progress Tracking
- `POST /api/progress` - Add progress entry
- `GET /api/progress/:userId` - Get progress entries

## 🌐 Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create mydietcoach-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Option 2: Railway

1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Set environment variables
6. Run migrations

### Option 3: Render

1. Go to https://render.com
2. Create new Web Service
3. Add PostgreSQL database
4. Deploy from GitHub
5. Set environment variables
6. Run migrations

## 🔒 Security Notes

**IMPORTANT:** This is a basic implementation. For production, you MUST:

1. **Hash passwords** - Use bcrypt or argon2
2. **Add JWT authentication** - Implement token-based auth
3. **Add input validation** - Use libraries like joi or yup
4. **Add rate limiting** - Prevent API abuse
5. **Use HTTPS** - Enable SSL/TLS
6. **Add API keys** - Protect your endpoints
7. **Sanitize inputs** - Prevent SQL injection
8. **Add logging** - Track API usage and errors

## 📊 Database Schema

The database includes:
- **users** - User accounts and profiles
- **recipes** - AI-generated recipes
- **custom_recipes** - User-created recipes
- **meal_plans** - Daily/weekly meal plans
- **scheduled_meals** - Scheduled meals by date
- **water_tracking** - Daily water intake
- **progress_tracking** - Weight and body metrics
- **daily_tasks** - Daily goals and tasks

## 🐛 Troubleshooting

### Can't connect to database
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -l`

### Mobile app can't connect
- Make sure backend server is running
- Check firewall settings
- Use correct IP address (not localhost on physical devices)
- Check CORS settings in `server.js`

### Migration fails
- Drop and recreate database if needed
- Check SQL syntax in `database/schema.sql`
- Verify database user has permissions

## 📝 Development Workflow

1. Make changes to `backend/server.js`
2. Server auto-reloads (if using `npm run dev`)
3. Test with curl or Postman
4. Update mobile app to use new endpoints
5. Test on iOS simulator/device

## 📚 Next Steps

- [ ] Add JWT authentication
- [ ] Implement password hashing
- [ ] Add email verification
- [ ] Implement forgot password
- [ ] Add file upload for images
- [ ] Add push notifications
- [ ] Implement real-time sync
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Add monitoring and analytics

## 📞 Support

For issues or questions, contact: murad@mydietcoach.com
