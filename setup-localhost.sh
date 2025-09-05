#!/bin/bash

echo "🔧 Setting up localhost subdomains for Scribe development..."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    HOSTS_FILE="/etc/hosts"
    echo "📱 Detected macOS system"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    HOSTS_FILE="/etc/hosts"
    echo "🐧 Detected Linux system"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    echo "Please manually add these entries to your hosts file:"
    echo "127.0.0.1 speaker.localhost"
    echo "127.0.0.1 listener.localhost"
    exit 1
fi

# Check if entries already exist
if grep -q "speaker.localhost" "$HOSTS_FILE" && grep -q "listener.localhost" "$HOSTS_FILE" && grep -q "api.localhost" "$HOSTS_FILE"; then
    echo "✅ Subdomain entries already exist in $HOSTS_FILE"
    echo ""
    echo "🎉 You're all set! You can now run:"
    echo "   npm run dev"
    echo ""
    echo "Then visit:"
    echo "   🎤 Speaker: http://speaker.localhost:5173"
    echo "   👂 Listener: http://listener.localhost:5173"
    echo "   🔌 API: http://api.localhost:3001"
    exit 0
fi

echo "📝 Adding subdomain entries to $HOSTS_FILE..."
echo ""

# Create backup
echo "💾 Creating backup of hosts file..."
sudo cp "$HOSTS_FILE" "$HOSTS_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Add entries
echo "➕ Adding subdomain entries..."
echo "" | sudo tee -a "$HOSTS_FILE"
echo "# Scribe development subdomains" | sudo tee -a "$HOSTS_FILE"
echo "127.0.0.1 speaker.localhost" | sudo tee -a "$HOSTS_FILE"
echo "127.0.0.1 listener.localhost" | sudo tee -a "$HOSTS_FILE"
echo "127.0.0.1 api.localhost" | sudo tee -a "$HOSTS_FILE"

echo ""
echo "✅ Successfully added subdomain entries!"
echo ""
    echo "🎉 You can now run:"
    echo "   npm run dev"
    echo ""
    echo "Then visit:"
    echo "   🎤 Speaker: http://speaker.localhost:5173"
    echo "   👂 Listener: http://listener.localhost:5173"
    echo "   🔌 API: http://api.localhost:3001"
echo ""
echo "💡 To remove these entries later, run:"
echo "   sudo nano $HOSTS_FILE"
echo "   (and remove the lines starting with 127.0.0.1 speaker.localhost, 127.0.0.1 listener.localhost, and 127.0.0.1 api.localhost)"
