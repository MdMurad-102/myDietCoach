# Quick Setup Checklist

## ✅ Status Check

- [x] PostgreSQL 15 is installed
- [x] PostgreSQL is running on port 5432
- [x] npm dependencies installed (pg package)
- [ ] Database `mydietcoach` created
- [ ] Schema loaded into database
- [ ] Connection tested and working

## 🎯 Next Steps

### STEP 1: Add PostgreSQL to your PATH

Add this line to your `~/.zshrc` file:
```bash
export PATH="/usr/local/Cellar/postgresql@15/15.14/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

### STEP 2: Create the Database

**Option A - Command Line:**
```bash
psql postgres -c "CREATE DATABASE mydietcoach;"
```

**Option B - Using psql shell:**
```bash
psql postgres
# Then in psql:
CREATE DATABASE mydietcoach;
\q
```

**Option C - Use a GUI Tool (Easiest!):**
- Download Postico (Mac) or pgAdmin
- Connect to localhost:5432
- Create database named `mydietcoach`

### STEP 3: Load the Schema

**Option A - From command line:**
```bash
psql mydietcoach < database/schema.sql
```

**Option B - In psql shell:**
```bash
psql mydietcoach
# Then copy/paste the contents of database/schema.sql
\q
```

**Option C - Using GUI:**
- Connect to mydietcoach database
- Open SQL editor
- Copy/paste contents from `database/schema.sql`
- Execute

### STEP 4: Test the Connection

```bash
node test-db.js
```

You should see:
- ✅ Connection successful
- 📋 Tables in database: 11
- All 11 expected tables listed

### STEP 5: Update .env.local

Make sure your connection string is correct:
```bash
EXPO_PUBLIC_DATABASE_URL=postgresql://localhost:5432/mydietcoach
```

Or with credentials:
```bash
EXPO_PUBLIC_DATABASE_URL=postgresql://username:password@localhost:5432/mydietcoach
```

### STEP 6: Start Your App

```bash
npm start
```

---

## 🆘 Having Issues?

### Issue: "password authentication failed"

You need to provide PostgreSQL credentials. Options:

1. **Find your PostgreSQL user and password**
2. **Reset PostgreSQL to not require password (for development)**:
   - Find pg_hba.conf: `find /usr/local -name pg_hba.conf`
   - Edit it and change `md5` to `trust` for local connections
   - Restart: `brew services restart postgresql@15`

3. **Use a GUI tool** - they handle authentication better

### Issue: Database already exists

That's fine! Just load the schema:
```bash
psql mydietcoach < database/schema.sql
```

### Issue: Permission denied

Try with sudo or check PostgreSQL permissions:
```bash
psql postgres -c "\du"  # List database users
```

---

## 📚 Reference Files

- **Setup Guide**: `POSTGRES_SETUP_GUIDE.md` - Detailed instructions
- **Database Schema**: `database/schema.sql` - All table definitions  
- **Test Script**: `test-db.js` - Verify connection
- **API Docs**: `database/README.md` - How to use the database

---

## 🎉 Once Database is Set Up

After the database is ready, we'll help you:
1. ✅ Update context providers
2. ✅ Migrate components from Convex to PostgreSQL
3. ✅ Test all functionality
4. ✅ Remove old Convex code

**Estimated time**: 2-4 hours

---

## Quick Commands Reference

```bash
# Add PostgreSQL to PATH
export PATH="/usr/local/Cellar/postgresql@15/15.14/bin:$PATH"

# Check if PostgreSQL is running
pg_isready

# Connect to PostgreSQL
psql postgres

# Create database
psql postgres -c "CREATE DATABASE mydietcoach;"

# Load schema
psql mydietcoach < database/schema.sql

# List databases
psql postgres -c "\l"

# List tables in mydietcoach
psql mydietcoach -c "\dt"

# Test connection
node test-db.js

# Start your app
npm start
```

---

**Need help?** Check `POSTGRES_SETUP_GUIDE.md` for detailed troubleshooting!
