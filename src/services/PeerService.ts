
import Peer, { DataConnection } from 'peerjs';
import { NetworkPackage } from '../types/game';

class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  public myId: string = '';

  // Колбэки для уведомления UI/Store
  onDataReceived: ((pkg: NetworkPackage) => void) | null = null;
  onConnectionOpened: ((conn: DataConnection) => void) | null = null;

  async init(userId: string): Promise<string> {
    return new Promise((resolve) => {
      // Генерируем ID на основе TG ID для стабильности
      this.peer = new Peer(`metro-cash-${userId}`, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myId = id;
        console.log('[Peer] My ID:', id);
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });
    });
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.onConnectionOpened?.(conn);
    });

    conn.on('data', (data) => {
      this.onDataReceived?.(data as NetworkPackage);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  connectTo(peerId: string) {
    const conn = this.peer!.connect(peerId);
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
      if (conn.open) {
        conn.send(pkg);
      }
    });
  }

  get isHost() {
    // В нашей модели Хост тот, к кому подключаются
    return this.connections.size > 0;
  }
}

export const peerService = new PeerService();
