#!/bin/bash
while true  
do  
  echo "Running update $(date)"
  node scripts/fetch_attendance.js
  git add .
  git commit -m "Update attendance"
  git push
  sleep 180  
done