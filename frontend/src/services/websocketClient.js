import { Client } from '@stomp/stompjs';

/**
 * WebSocket STOMP Client para monitoreo en tiempo real
 * 
 * Conecta a ws://localhost:8080/ws con protocolo STOMP
 * Permite suscribirse a /topic/monitoring/{patientId}
 */
class WebSocketClient {
  constructor(token) {
    this.token = token || localStorage.getItem('jwt_token');
    this.client = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.isConnecting = false;
  }

  /**
   * Conectar al broker WebSocket
   * 
   * @returns {Promise} Resuelve cuando está conectado
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/api/v1/ws';
      const connectHeaders = {
        login: 'guest',
        passcode: 'guest'
      };

      if (this.token) {
        connectHeaders.Authorization = `Bearer ${this.token}`;
      }

      this.client = new Client({
        brokerURL: WS_URL,
        connectHeaders,
        debug: (str) => {
          console.log('[WebSocket]', str);
        },
        reconnectDelay: this.reconnectInterval,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          console.log('[WebSocket] ✅ Connected to broker');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        },

        onStompError: (frame) => {
          console.error('[WebSocket] STOMP Error:', frame.body);
          this.isConnecting = false;
          reject(new Error(frame.body || 'STOMP error'));
        },

        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          this.isConnecting = false;
          this.handleDisconnect();
        },

        onWebSocketError: (event) => {
          console.error('[WebSocket] WebSocket error:', event);
          this.isConnecting = false;
        }
      });

      try {
        this.client.activate();
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Manejar desconexión con reintentos automáticos
   */
  handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] ⏳ Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch((err) => {
          console.error('[WebSocket] Reconnect failed:', err);
        });
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
    }
  }

  /**
   * Suscribirse a un topic
   * 
   * @param {string} destination - Path del topic (ej: /topic/monitoring/patient-uuid)
   * @param {function} callback - Función llamada cuando hay mensaje
   * @returns {object} Objeto subscription (con método unsubscribe)
   */
  subscribe(destination, callback) {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Client not connected. Queueing subscription to', destination);
      // Intentar conectar si no está ya conectado
      this.connect().catch(err => console.error('[WebSocket] Connection failed:', err));
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('[WebSocket] Error parsing message from', destination, ':', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`[WebSocket] ✅ Subscribed to ${destination}`);

    return subscription;
  }

  /**
   * Desuscribirse de un topic
   * 
   * @param {string} destination - Path del topic
   */
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`[WebSocket] Unsubscribed from ${destination}`);
    }
  }

  /**
   * Desuscribirse de todos los topics
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    console.log('[WebSocket] Unsubscribed from all topics');
  }

  /**
   * Desconectar del broker
   */
  disconnect() {
    if (this.client?.connected) {
      this.unsubscribeAll();
      this.client.deactivate();
      console.log('[WebSocket] Disconnected');
    }
  }

  /**
   * Verificar si está conectado
   * 
   * @returns {boolean}
   */
  isConnected() {
    return this.client?.connected || false;
  }

  /**
   * Obtener lista de topics suscritos
   * 
   * @returns {array} Array de destinations
   */
  getSubscribedTopics() {
    return Array.from(this.subscriptions.keys());
  }
}

export default WebSocketClient;
