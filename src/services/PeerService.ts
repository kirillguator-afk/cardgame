
import { Peer, DataConnection } from 'peerjs';
import { NetworkPackage } from '../types/game';

class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  public myId: string = '';

  onDataReceived: ((pkg: NetworkPackage) => void) | null = null;
  onConnectionOpened: ((conn: DataConnection) => void) | null = null;

  async init(userId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const finalId = userId ? `metro-${userId}` : `metro-anon-${Math.random().toString(36).substr(2, 9)}`;
        
        // В новых версиях PeerJS используется именованный конструктор или new Peer
        this.peer = new Peer(finalId, {
          debug: 1,
          config: {
            'iceServers': [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ]
          }
        });

        const timeout = setTimeout(() => {
          if (!this.myId) reject(new Error("PeerJS initialization timeout"));
        }, 10000);

        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          this.myId = id;
          console.log('[Peer] Connected with ID:', id);
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.handleConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.error('[Peer] Error:', err);
          // Не реджектам сразу, так как некоторые ошибки (типа peer-unavailable) не фатальны
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.onConnectionOpened?.(conn);
    });

    conn.on('data', (data) => {
      if (this.onDataReceived) this.onDataReceived(data as NetworkPackage);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  connectTo(peerId: string) {
    if (!this.peer) return;
    const conn = this.peer.connect(peerId);
    this.handleConnection(conn);
  }

  send(peerId: string, pkg: NetworkPackage) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send(pkg);
    }
  }

  broadcast(pkg: NetworkPackage) {
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(pkg);
    });
  }
}

export const peerService = new PeerService();
