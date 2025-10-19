#!/bin/bash

# Manual PostgreSQL Setup Guide for Diet Coach App
# Run these commands one by one in your terminal

echo "=== PostgreSQL Setup for Diet Coach App ==="
echo ""

# Set PostgreSQL path
export PATH="/usr/local/Cellar/postgresql@15/15.14/bin:$PATH"

echo "Step 1: Connect to PostgreSQL"
echo "Run this command and enter your PostgreSQL password when prompted:"
echo "psql postgres"
echo ""
echo "If you don't have a password set, you may need to connect as the postgres superuser."
echo "Try: psql postgres -U postgres"
echo ""
echo "---"
echo ""

echo "Step 2: Once connected to psql, run these SQL commands:"
echo ""
echo "-- Create the database"
echo "CREATE DATABASE mydietcoach;"
echo ""
echo "-- Connect to the new database"
echo "\\c mydietcoach"
echo ""
echo "-- Exit psql (run this after Step 3)"
echo "\\q"
echo ""
echo "---"
echo ""

echo "Step 3: Load the schema"
echo "After exiting psql, run this command:"
echo "psql mydietcoach < database/schema.sql"
echo ""
echo "Or if you need to specify user:"
echo "psql mydietcoach -U your_username < database/schema.sql"
echo ""
echo "---"
echo ""

echo "Step 4: Verify the setup"
echo "psql mydietcoach -c '\\dt'"
echo ""
echo "You should see a list of 11 tables."
echo ""
echo "---"
echo ""

echo "Step 5: Update your .env.local file"
echo "Make sure EXPO_PUBLIC_DATABASE_URL is set to:"
echo "postgresql://localhost:5432/mydietcoach"
echo ""
echo "Or if you need username/password:"
echo "postgresql://username:password@localhost:5432/mydietcoach"
echo ""
echo "---"
echo ""

echo "Alternative: If you can't access PostgreSQL with password authentication,"
echo "you may need to modify your pg_hba.conf file to use 'trust' authentication"
echo "for local connections. Contact your system admin or check PostgreSQL docs."
