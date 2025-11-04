# PostgreSQL Commands Reference

Complete guide to PostgreSQL commands for MyDietCoach database management.

---

## 📋 Table of Contents
1. [Connection Commands](#connection-commands)
2. [Database Commands](#database-commands)
3. [Table Operations](#table-operations)
4. [Data Queries](#data-queries)
5. [User Management](#user-management)
6. [Backup & Restore](#backup--restore)
7. [Troubleshooting](#troubleshooting)

---

## 🔌 Connection Commands

### Connect to PostgreSQL
```bash
# Connect to default database
psql

# Connect to specific database
psql -d mydietcoach

# Connect as specific user
psql -U postgres -d mydietcoach

# Connect with host and port
psql -h localhost -p 5432 -U postgres -d mydietcoach

# Connect via DATABASE_URL
psql postgresql://username:password@localhost:5432/mydietcoach
```

### Exit PostgreSQL
```sql
\q
-- or
exit
```

---

## 💾 Database Commands

### List All Databases
```sql
\l
-- or
\list
```

### Create Database
```sql
CREATE DATABASE mydietcoach;
```

### Drop Database
```sql
DROP DATABASE mydietcoach;
```

### Switch Database
```sql
\c mydietcoach
-- or
\connect mydietcoach
```

### Show Current Database
```sql
SELECT current_database();
```

### Database Size
```sql
SELECT pg_size_pretty(pg_database_size('mydietcoach'));
```

---

## 📊 Table Operations

### List All Tables
```sql
\dt

-- List tables with schema
\dt+

-- List tables in all schemas
\dt *.*
```

### Show Table Structure
```sql
\d users
\d weight_logs
\d scheduled_meals
\d water_tracking
\d daily_tasks
```

### Create Table Example
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Drop Table
```sql
DROP TABLE table_name;

-- Drop with cascade (removes dependencies)
DROP TABLE table_name CASCADE;
```

### Rename Table
```sql
ALTER TABLE old_name RENAME TO new_name;
```

### Add Column
```sql
ALTER TABLE users ADD COLUMN age INTEGER;
```

### Drop Column
```sql
ALTER TABLE users DROP COLUMN age;
```

### Modify Column Type
```sql
ALTER TABLE users ALTER COLUMN weight TYPE DECIMAL(6,2);
```

---

## 🔍 Data Queries

### View All Records
```sql
-- View all users
SELECT * FROM users;

-- If stuck in multi-line mode, type semicolon and press Enter
-- Or press Ctrl+C to cancel the current query

-- View all weight logs
SELECT * FROM weight_logs ORDER BY log_date DESC;

-- View all scheduled meals
SELECT * FROM scheduled_meals ORDER BY scheduled_date DESC;

-- View water tracking
SELECT * FROM water_tracking ORDER BY date DESC;

-- View daily tasks
SELECT * FROM daily_tasks ORDER BY date DESC;
```

### Limit Results
```sql
-- Get first 10 users
SELECT * FROM users LIMIT 10;

-- Get latest 5 weight logs
SELECT * FROM weight_logs ORDER BY log_date DESC LIMIT 5;
```

### Filter Data
```sql
-- Find user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Find weight logs for specific user
SELECT * FROM weight_logs WHERE user_id = 1;

-- Find meals within date range
SELECT * FROM scheduled_meals 
WHERE scheduled_date BETWEEN '2025-11-01' AND '2025-11-30';
```

### Count Records
```sql
-- Count all users
SELECT COUNT(*) FROM users;

-- Count weight logs per user
SELECT user_id, COUNT(*) as log_count 
FROM weight_logs 
GROUP BY user_id;
```

### Join Tables
```sql
-- Get user with their weight logs
SELECT u.name, u.email, wl.weight, wl.log_date
FROM users u
LEFT JOIN weight_logs wl ON u.id = wl.user_id
ORDER BY wl.log_date DESC;

-- Get user with meal plans
SELECT u.name, sm.scheduled_date, sm.total_calories, sm.total_protein
FROM users u
LEFT JOIN scheduled_meals sm ON u.id = sm.user_id
ORDER BY sm.scheduled_date DESC;
```

### Insert Data
```sql
-- Insert new user
INSERT INTO users (email, name, password, weight, height)
VALUES ('test@example.com', 'Test User', 'password123', 70.5, 175);

-- Insert weight log
INSERT INTO weight_logs (user_id, weight, log_date)
VALUES (1, 68.5, '2025-11-04');
```

### Update Data
```sql
-- Update user weight
UPDATE users 
SET weight = 68.0 
WHERE id = 1;

-- Update multiple columns
UPDATE users 
SET weight = 68.0, updated_at = NOW() 
WHERE id = 1;
```

### Delete Data
```sql
-- Delete specific weight log
DELETE FROM weight_logs WHERE id = 1;

-- Delete all logs for a user
DELETE FROM weight_logs WHERE user_id = 1;

-- Delete old records
DELETE FROM water_tracking 
WHERE date < '2025-01-01';
```

---

## 👥 User Management

### List All PostgreSQL Users
```sql
\du
-- or
SELECT usename FROM pg_user;
```

### Create User
```sql
CREATE USER mydietcoach_user WITH PASSWORD 'your_password';
```

### Grant Privileges
```sql
-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE mydietcoach TO mydietcoach_user;

-- Grant privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mydietcoach_user;

-- Grant privileges on sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mydietcoach_user;
```

### Revoke Privileges
```sql
REVOKE ALL PRIVILEGES ON DATABASE mydietcoach FROM mydietcoach_user;
```

### Change User Password
```sql
ALTER USER mydietcoach_user WITH PASSWORD 'new_password';
```

### Drop User
```sql
DROP USER mydietcoach_user;
```

---

## 💿 Backup & Restore

### Backup Database
```bash
# Backup entire database
pg_dump -U postgres mydietcoach > backup.sql

# Backup with custom format (compressed)
pg_dump -U postgres -Fc mydietcoach > backup.dump

# Backup only schema (no data)
pg_dump -U postgres --schema-only mydietcoach > schema.sql

# Backup only data
pg_dump -U postgres --data-only mydietcoach > data.sql

# Backup specific table
pg_dump -U postgres -t users mydietcoach > users_backup.sql
```

### Restore Database
```bash
# Restore from SQL file
psql -U postgres mydietcoach < backup.sql

# Restore from custom format
pg_restore -U postgres -d mydietcoach backup.dump

# Restore with clean (drop existing objects)
pg_restore -U postgres -d mydietcoach -c backup.dump
```

### Export Data to CSV
```bash
# Export table to CSV
psql -U postgres mydietcoach -c "COPY users TO '/path/to/users.csv' CSV HEADER;"

# Export query result to CSV
psql -U postgres mydietcoach -c "COPY (SELECT * FROM weight_logs WHERE user_id = 1) TO '/path/to/weight_logs.csv' CSV HEADER;"
```

### Import Data from CSV
```bash
# Import CSV to table
psql -U postgres mydietcoach -c "COPY users FROM '/path/to/users.csv' CSV HEADER;"
```

---

## 🔧 Troubleshooting

### Check PostgreSQL Status
```bash
# Check if PostgreSQL is running (macOS)
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@14

# Stop PostgreSQL
brew services stop postgresql@14

# Restart PostgreSQL
brew services restart postgresql@14
```

### Fix Authentication Issues
```bash
# Edit pg_hba.conf to allow connections
# Location: /opt/homebrew/var/postgresql@14/pg_hba.conf (macOS)
# Change 'md5' to 'trust' for local connections (development only)

# Reload configuration
psql -U postgres -c "SELECT pg_reload_conf();"
```

### Reset User Password
```bash
# Connect as superuser without password
psql postgres

# Then reset password
ALTER USER rere-admin1 WITH PASSWORD 'new_password';
```

### Check Active Connections
```sql
SELECT * FROM pg_stat_activity;

-- Kill specific connection
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'mydietcoach' AND pid <> pg_backend_pid();
```

### Vacuum Database (Optimize)
```sql
-- Vacuum specific table
VACUUM users;

-- Vacuum entire database
VACUUM;

-- Full vacuum (reclaim space)
VACUUM FULL;

-- Analyze tables (update statistics)
ANALYZE;
```

### Check Table Sizes
```sql
-- Size of all tables
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 MyDietCoach Specific Queries

### View User Dashboard Data
```sql
-- Get user with all their data
SELECT 
    u.id,
    u.name,
    u.email,
    u.weight,
    u.height,
    COUNT(DISTINCT wl.id) as weight_logs_count,
    COUNT(DISTINCT sm.id) as meal_plans_count,
    COUNT(DISTINCT dt.id) as tasks_count
FROM users u
LEFT JOIN weight_logs wl ON u.id = wl.user_id
LEFT JOIN scheduled_meals sm ON u.id = sm.user_id
LEFT JOIN daily_tasks dt ON u.id = dt.user_id
WHERE u.id = 1
GROUP BY u.id;
```

### View Weight Progress
```sql
-- Get weight journey for user
SELECT 
    log_date,
    weight,
    bmi,
    notes
FROM weight_logs
WHERE user_id = 1
ORDER BY log_date ASC;
```

### View Today's Meals
```sql
-- Get today's meal plan for user
SELECT 
    scheduled_date,
    meal_plan_data,
    total_calories,
    total_protein
FROM scheduled_meals
WHERE user_id = 1 
AND scheduled_date = CURRENT_DATE
AND meal_type = 'daily_plan';
```

### View Weekly Water Intake
```sql
-- Get water consumption for last 7 days
SELECT 
    date,
    water_consumed,
    last_updated
FROM water_tracking
WHERE user_id = 1
AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Clean Old Data
```sql
-- Delete water tracking older than 90 days
DELETE FROM water_tracking 
WHERE date < CURRENT_DATE - INTERVAL '90 days';

-- Delete old scheduled meals (older than 180 days)
DELETE FROM scheduled_meals 
WHERE scheduled_date < CURRENT_DATE - INTERVAL '180 days';
```

---

## 📝 Quick Reference Card

### One-Line Commands
```bash
# List all tables
psql -d mydietcoach -c "\dt"

# View users
psql -d mydietcoach -c "SELECT * FROM users;"

# View latest weight logs
psql -d mydietcoach -c "SELECT * FROM weight_logs ORDER BY log_date DESC LIMIT 10;"

# Count all records
psql -d mydietcoach -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'weight_logs', COUNT(*) FROM weight_logs UNION ALL SELECT 'scheduled_meals', COUNT(*) FROM scheduled_meals;"

# Backup database
pg_dump mydietcoach > backup_$(date +%Y%m%d).sql

# Check database size
psql -d mydietcoach -c "SELECT pg_size_pretty(pg_database_size('mydietcoach'));"
```

---

## 🆘 Emergency Commands

### Database Won't Start
```bash
# Check logs
tail -f /opt/homebrew/var/log/postgresql@14.log

# Remove PID file if stale
rm /opt/homebrew/var/postgresql@14/postmaster.pid

# Start manually
pg_ctl -D /opt/homebrew/var/postgresql@14 start
```

### Can't Connect
```bash
# Check if PostgreSQL is listening
netstat -an | grep 5432

# Check connection string in .env file
cat backend/.env | grep DATABASE_URL

# Test connection
psql "postgresql://localhost:5432/mydietcoach"
```

### Recover Data
```bash
# If you have a backup
psql mydietcoach < backup.sql

# If no backup, export what you can
pg_dump mydietcoach > emergency_backup.sql
```

---

## 📚 Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Cheat Sheet](https://www.postgresqltutorial.com/postgresql-cheat-sheet/)
- [pgAdmin - GUI Tool](https://www.pgadmin.org/)

---

**Note**: Replace `mydietcoach` with your actual database name if different. Always test commands on a development database before running on production!
