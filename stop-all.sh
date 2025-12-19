#!/bin/bash

# Script to stop both API and Frontend services
# Usage: ./stop-all.sh or bash stop-all.sh

echo "🛑 Stopping Student Scheduler Application..."
echo "============================================="

# Kill processes on specific ports
echo "Stopping API Server (port 7071)..."
lsof -ti:7071 | xargs kill -9 2>/dev/null

echo "Stopping Frontend (port 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Also kill by process name
pkill -f 'node server.js' 2>/dev/null
pkill -f 'vite' 2>/dev/null

echo ""
echo "✅ All services stopped!"
echo "============================================="
