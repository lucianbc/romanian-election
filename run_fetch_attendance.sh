#!/bin/bash
while true  
do  
  echo "Running update $(date)"
  # git pull --rebase
# node scripts/fetch_attendance.js
  git add data
  git add public
  git commit -m "Update attendance"
  git push
  sleep 300  
done