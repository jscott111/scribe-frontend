#!/bin/bash

echo "🚀 Starting Tongues Dual-Client System..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down clients..."
    kill $INPUT_PID $TRANSLATION_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🎤 Starting Input Client on port 5173..."
npm run dev:input &
INPUT_PID=$!

echo "🌍 Starting Translation Client on port 5174..."
npm run dev:translation &
TRANSLATION_PID=$!

echo ""
echo "✅ Both clients are starting up..."
echo "🎤 Input Client: http://localhost:5173"
echo "🌍 Translation Client: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop both clients"
echo ""

# Wait for both processes
wait $INPUT_PID $TRANSLATION_PID
