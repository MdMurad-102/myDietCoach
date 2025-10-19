# PostgreSQL Setup Instructions for Diet Coach

## Your PostgreSQL is installed and running! ✅

**Location:** `/usr/local/Cellar/postgresql@15/15.14/bin/`
**Version:** PostgreSQL 15.14
**Status:** Running on port 5432

## Quick Setup (Choose ONE method)

### Method 1: Using psql Interactive Shell (Recommended)

1. **Add PostgreSQL to your PATH** (add this to your `~/.zshrc`):
   ```bash
   export PATH="/usr/local/Cellar/postgresql@15/15.14/bin:$PATH"
   ```
   Then run: `source ~/.zshrc`

2. **Open PostgreSQL shell**:
   ```bash
   psql postgres
   ```
   *Or if you have a postgres user:*
   ```bash
   psql -U postgres postgres
   ```
   *Enter your PostgreSQL password when prompted*

3. **Once in psql, run these commands**:
   ```sql
   -- Create the database
   CREATE DATABASE mydietcoach;
   
   -- Connect to it
   \c mydietcoach
   
   -- Copy and paste the entire contents of database/schema.sql here
   -- OR exit and use Method 2 below
   
   -- To exit
   \q
   ```

### Method 2: Load Schema from File

After creating the database (step 3 above), exit psql and run:

```bash
export PATH="/usr/local/Cellar/postgresql@15/15.14/bin:$PATH"
psql mydietcoach < database/schema.sql
```

*If you need to specify a user:*
```bash
psql -U your_username mydietcoach < database/schema.sql
```

### Method 3: Using a PostgreSQL GUI (Easiest!)

Download and install one of these free tools:
- **pgAdmin** (https://www.pgadmin.org/)
- **Postico** (https://eggerapps.at/postico/) - Mac only, very user-friendly
- **TablePlus** (https://tableplus.com/)

Then:
1. Connect to localhost:5432 with your credentials
2. Create database named `mydietcoach`
3. Open the SQL editor
4. Copy/paste contents from `database/schema.sql`
5. Execute the SQL

## Verify Setup

After loading the schema, verify it worked:

```bash
export PATH="/usr/local/Cellar/postgresql@15/15.14/bin:$PATH"
psql mydietcoach -c "\dt"
```

You should see 11 tables:
- users
- recipes
- meal_plans
- custom_recipes
- scheduled_meals
- water_tracking
- progress_tracking
- daily_nutrition
- weight_goals
- daily_meal_plans
- daily_tasks

## Update Your Connection String

Once the database is set up, update `.env.local`:

```bash
# If no username/password needed (trust authentication)
EXPO_PUBLIC_DATABASE_URL=postgresql://localhost:5432/mydietcoach

# With username only
EXPO_PUBLIC_DATABASE_URL=postgresql://your_username@localhost:5432/mydietcoach

# With username and password
EXPO_PUBLIC_DATABASE_URL=postgresql://your_username:your_password@localhost:5432/mydietcoach
```

## Install npm Dependencies

```bash
npm install
```

This will install the `pg` (PostgreSQL client) package and other dependencies.

## Test the Connection

Create a test file `test-db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.EXPO_PUBLIC_DATABASE_URL || 'postgresql://localhost:5432/mydietcoach'
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Database connected successfully!');
    console.log('Time:', result.rows[0].now);
    console.log('Version:', result.rows[0].version);
    
    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('\n📊 Tables found:', tables.rows.length);
    tables.rows.forEach(row => console.log('  -', row.tablename));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run it:
```bash
node test-db.js
```

## Troubleshooting

### "password authentication failed"
- Your PostgreSQL requires a password
- Find your credentials or reset the password
- Use a PostgreSQL GUI tool which can help manage credentials

### "database does not exist"
- Make sure you created the `mydietcoach` database
- Run: `psql postgres -c "CREATE DATABASE mydietcoach;"`

### "psql: command not found"
- Add PostgreSQL to PATH as shown above
- Or use the full path: `/usr/local/Cellar/postgresql@15/15.14/bin/psql`

### Can't remember PostgreSQL password
You can reset it by editing `pg_hba.conf`:
1. Find the file: `find /usr/local -name pg_hba.conf`
2. Change `md5` to `trust` for local connections
3. Restart PostgreSQL: `brew services restart postgresql@15`
4. Connect and reset password
5. Change back to `md5` for security

## Need More Help?

The database schema is in: `database/schema.sql`

You can also:
1. Use a GUI tool (recommended for beginners)
2. Check PostgreSQL logs: `tail -f /usr/local/var/log/postgres.log`
3. Restart PostgreSQL: `brew services restart postgresql@15`

Once the database is set up, come back and we'll help you migrate the context providers!
