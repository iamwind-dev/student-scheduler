#!/bin/bash

# Script to run both API and Frontend simultaneously
# Usage: ./start-all.sh or bash start-all.sh

echo "🚀 Starting Student Scheduler Application..."
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill any existing processes on ports 7071 and 5173
echo "🧹 Cleaning up existing processes..."
lsof -ti:7071 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Start API Server in background
echo ""
echo -e "${BLUE}📡 Starting API Server...${NC}"
cd /home/phanhoailang/LangPhan/Azure/final_project/student-scheduler-api
node server.js > api.log 2>&1 &
API_PID=$!
echo "API Server PID: $API_PID"

# Wait a bit for API to start
sleep 3

# Start Frontend in background
echo ""
echo -e "${BLUE}🎨 Starting Frontend...${NC}"
cd /home/phanhoailang/LangPhan/Azure/fe/student-scheduler/frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait a bit for frontend to start
sleep 3

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ Both services are starting!${NC}"
echo ""
echo -e "📡 API Server: ${BLUE}http://localhost:7071${NC}"
echo -e "   - Health: http://localhost:7071/api/health"
echo -e "   - API Docs: http://localhost:7071/api-docs"
echo -e "   - Logs: /home/phanhoailang/LangPhan/Azure/final_project/student-scheduler-api/api.log"
echo ""
echo -e "🎨 Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "   - Logs: /home/phanhoailang/LangPhan/Azure/fe/student-scheduler/frontend/frontend.log"
echo ""
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "Process IDs:"
echo "  - API: $API_PID"
echo "  - Frontend: $FRONTEND_PID"
echo ""
echo "To stop both services, run:"
echo "  kill $API_PID $FRONTEND_PID"
echo ""
echo "Or use: pkill -f 'node server.js' && pkill -f 'vite'"
echo ""
echo "Press Ctrl+C to view logs or wait for services to start..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo "📋 Tailing logs (Ctrl+C to stop)..."
echo "============================================="
sleep 2

# Tail both log files
tail -f \
    /home/phanhoailang/LangPhan/Azure/final_project/student-scheduler-api/api.log \
    /home/phanhoailang/LangPhan/Azure/fe/student-scheduler/frontend/frontend.log
