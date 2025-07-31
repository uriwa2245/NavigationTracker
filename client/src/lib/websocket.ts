// WebSocket utility for handling HMR connections
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          resolve(this.ws!);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.handleReconnect(url);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private handleReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(url).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();

// WebSocket configuration for production deployment
export const getWebSocketUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use WebSocket over HTTPS for production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }
  // Server-side: use environment variable or default
  return process.env.VERCEL_URL ? `wss://${process.env.VERCEL_URL}/ws` : 'ws://localhost:5000/ws';
};

export const createWebSocket = () => {
  try {
    const wsUrl = getWebSocketUrl();
    return new WebSocket(wsUrl);
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    return null;
  }
};

// Utility function to safely create WebSocket URL
export function createWebSocketURL(protocol: string, host: string, port?: string | number): string {
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = host || window.location.hostname;
  const wsPort = port || window.location.port;
  
  if (wsPort) {
    return `${wsProtocol}//${wsHost}:${wsPort}`;
  } else {
    return `${wsProtocol}//${wsHost}`;
  }
}

// Fallback function for when WebSocket is not available
export function setupWebSocketFallback() {
  console.log('WebSocket not available, using polling fallback');
  // Implement polling fallback if needed
  return setInterval(() => {
    // Poll for updates every 5 seconds
    window.location.reload();
  }, 5000);
} 