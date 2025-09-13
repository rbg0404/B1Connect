import { type SapSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  storeSession(session: SapSession): Promise<void>;
  getSession(sessionId: string): Promise<SapSession | undefined>;
  removeSession(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, SapSession>;

  constructor() {
    this.sessions = new Map();
    
    // Cleanup expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  async storeSession(session: SapSession): Promise<void> {
    this.sessions.set(session.sessionId, session);
  }

  async getSession(sessionId: string): Promise<SapSession | undefined> {
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(sessionId);
    }
    return undefined;
  }

  async removeSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of entries) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const storage = new MemStorage();
