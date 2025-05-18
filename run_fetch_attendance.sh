#!/bin/bash
cd /Users/lucianboaca/Documents/Code/romania-election-views
node scripts/fetch_attendance.js
git add .
git commit -m "Update attendance"
git push