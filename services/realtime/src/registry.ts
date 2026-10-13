import { type ConnectionRecord } from './types.js';

export class ConnectionRegistry {
  private readonly connections = new Map<string, ConnectionRecord>();

  add(record: ConnectionRecord): void {
    this.connections.set(record.connectionId, record);
  }

  delete(connectionId: string): void {
    const record = this.connections.get(connectionId);
    if (record?.helloTimer !== undefined) {
      clearTimeout(record.helloTimer);
    }
    this.connections.delete(connectionId);
  }

  count(): number {
    return this.connections.size;
  }

  heartbeat(): void {
    for (const record of this.connections.values()) {
      if (record.socket.readyState !== record.socket.OPEN) {
        continue;
      }
      if (!record.alive) {
        record.socket.terminate();
        continue;
      }
      record.alive = false;
      record.socket.ping();
    }
  }

  closeAll(code: number, reason: string): void {
    for (const record of this.connections.values()) {
      if (record.helloTimer !== undefined) {
        clearTimeout(record.helloTimer);
      }
      if (record.socket.readyState === record.socket.OPEN) {
        record.socket.close(code, reason);
      } else {
        record.socket.terminate();
      }
    }
    this.connections.clear();
  }
}
