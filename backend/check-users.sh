#!/bin/bash

# Quick script to check users in database

echo "======================================"
echo "MyDietCoach Database - User List"
echo "======================================"
echo ""

export PGPASSWORD=postgres123

echo "📊 Total Users:"
psql -U postgres -d mydietcoach -t -c "SELECT COUNT(*) FROM users;"

echo ""
echo "👥 User Details:"
psql -U postgres -d mydietcoach -c "
  SELECT 
    id, 
    name, 
    email, 
    weight, 
    height, 
    gender, 
    goal, 
    age,
    country,
    city
  FROM users 
  ORDER BY id;
"

echo ""
echo "📈 User Statistics:"
psql -U postgres -d mydietcoach -c "
  SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT gender) as genders,
    COUNT(DISTINCT goal) as different_goals
  FROM users;
"
