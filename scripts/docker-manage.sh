#!/bin/bash

# MCP Servers Docker Management Script
set -e

PROJECT_NAME="mcp-servers"
COMPOSE_FILE="docker-compose.minimal.yml"

case "$1" in
  "build")
    echo "🔨 Building MCP servers container..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo "✅ Build complete!"
    ;;
    
  "start")
    echo "🚀 Starting MCP servers..."
    docker-compose -f $COMPOSE_FILE up -d
    echo "✅ All servers started!"
    docker-compose -f $COMPOSE_FILE ps
    ;;
    
  "stop")
    echo "⏹️  Stopping MCP servers..."
    docker-compose -f $COMPOSE_FILE down
    echo "✅ All servers stopped!"
    ;;
    
  "restart")
    echo "🔄 Restarting MCP servers..."
    docker-compose -f $COMPOSE_FILE restart
    echo "✅ All servers restarted!"
    ;;
    
  "logs")
    echo "📋 Showing logs (press Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
    
  "status")
    echo "📊 MCP Servers Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "🔍 Individual server status:"
    docker exec mcp-all-servers pm2 list
    ;;
    
  "update")
    echo "📥 Updating MCP servers..."
    git pull origin main
    npm run build
    docker-compose -f $COMPOSE_FILE up -d --build
    echo "✅ Servers updated and restarted!"
    ;;
    
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker-compose -f $COMPOSE_FILE down --rmi all --volumes --remove-orphans
    docker system prune -f
    echo "✅ Cleanup complete!"
    ;;
    
  "shell")
    echo "🐚 Opening shell in MCP container..."
    docker exec -it mcp-all-servers /bin/sh
    ;;
    
  "stats")
    echo "📈 Container resource usage:"
    docker stats mcp-all-servers --no-stream
    ;;
    
  *)
    echo "🔧 MCP Servers Docker Management"
    echo ""
    echo "Usage: $0 {build|start|stop|restart|logs|status|update|clean|shell|stats}"
    echo ""
    echo "Commands:"
    echo "  build   - Build the container image"
    echo "  start   - Start all MCP servers"
    echo "  stop    - Stop all MCP servers" 
    echo "  restart - Restart all MCP servers"
    echo "  logs    - Show server logs"
    echo "  status  - Show server status"
    echo "  update  - Pull latest code and rebuild"
    echo "  clean   - Remove all containers and images"
    echo "  shell   - Open shell in container"
    echo "  stats   - Show resource usage"
    exit 1
    ;;
esac