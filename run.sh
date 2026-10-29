#!/usr/bin/env bash

# Lumière - Full Stack Dev Server Runner
# Starts both the Python FastAPI backend and Next.js frontend concurrently.

set -e

# Resolve project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "  ✨ Starting Lumière (Next.js Frontend + Python Backend)   "
echo "=========================================================="

# 1. Clean up lingering processes on ports 8000 and 3000
for port in 8000 3000; do
  pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "⚙️  Releasing port $port (killing PID $pid)..."
    kill -9 $pid 2>/dev/null || true
  fi
done

# 2. Verify Python Virtual Environment
if [ ! -d "backend/.venv" ]; then
  echo "📦 Creating Python virtual environment in backend/.venv..."
  python3 -m venv backend/.venv
  backend/.venv/bin/pip install --upgrade pip
  backend/.venv/bin/pip install -r backend/requirements.txt
fi

# 3. Verify Frontend Dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

# 4. Define cleanup handler on exit (Ctrl+C)
cleanup() {
  echo ""
  echo "🛑 Stopping Lumière servers..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  echo "✅ Servers stopped cleanly."
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 5. Launch Python FastAPI Backend
echo "🚀 Starting Python FastAPI backend on http://127.0.0.1:8000..."
(
  cd "$ROOT_DIR/backend"
  exec .venv/bin/uvicorn main:app --port 8000 --host 127.0.0.1 --reload
) &
BACKEND_PID=$!

# Wait briefly for FastAPI to initialize
sleep 2

# 6. Launch Next.js Frontend
echo "🎨 Starting Next.js frontend on http://localhost:3000..."
(
  cd "$ROOT_DIR"
  exec npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  🎉 Lumière is live!"
echo "  👉 Frontend:     http://localhost:3000"
echo "  👉 Backend API:  http://127.0.0.1:8000"
echo "  👉 Swagger Docs: http://127.0.0.1:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers anytime."
echo ""

# Keep running
wait
