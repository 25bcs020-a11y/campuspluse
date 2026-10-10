@echo off
title CampusPulse Server - Know Before You Go
cd /d "%~dp0"
echo Starting CampusPulse on http://localhost:5173/ ...
"%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
pause
