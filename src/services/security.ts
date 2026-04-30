import CryptoJS from 'crypto-js';

const SECRET_KEY = 'BQ_FC_2026_v8xK9mP2nQ5rT7uW4yZ';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

export class SecurityService {
  private static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  static hashPassword(password: string, salt?: string): string {
    const usedSalt = salt || this.generateSalt();
    const hash = CryptoJS.SHA256(password + usedSalt + SECRET_KEY).toString();
    return `${hash}:${usedSalt}`;
  }

  static verifyPassword(password: string, storedHash: string): boolean {
    const [hash, salt] = storedHash.split(':');
    if (!hash || !salt) return false;
    const computed = CryptoJS.SHA256(password + salt + SECRET_KEY).toString();
    return computed === hash;
  }

  static encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  static decryptData(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static generateToken(): string {
    return CryptoJS.SHA256(Date.now().toString() + SECRET_KEY).toString();
  }

  static createSession(usuarioId: string, perfil: string): string {
    const token = this.generateToken();
    const expiracao = Date.now() + SESSION_DURATION;
    const sessao = { usuarioId, perfil, token, expiracao, lastActivity: Date.now() };
    localStorage.setItem('bq_session', this.encryptData(JSON.stringify(sessao)));
    return token;
  }

  static getSession() {
    try {
      const encrypted = localStorage.getItem('bq_session');
      if (!encrypted) return null;
      const decrypted = this.decryptData(encrypted);
      const sessao = JSON.parse(decrypted);
      
      if (Date.now() > sessao.expiracao) {
        this.clearSession();
        return null;
      }

      // Check inactivity
      if (Date.now() - sessao.lastActivity > INACTIVITY_TIMEOUT) {
        this.clearSession();
        return null;
      }

      // Update last activity
      sessao.lastActivity = Date.now();
      localStorage.setItem('bq_session', this.encryptData(JSON.stringify(sessao)));

      return sessao;
    } catch {
      return null;
    }
  }

  static clearSession() {
    localStorage.removeItem('bq_session');
    localStorage.removeItem('bq_login_attempts');
  }

  static checkLoginAttempts(): { allowed: boolean; remaining: number; waitTime?: number } {
    const attempts = JSON.parse(localStorage.getItem('bq_login_attempts') || '{"count":0,"lastAttempt":0}');
    const now = Date.now();
    
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      attempts.count = 0;
    }

    if (attempts.count >= 5) {
      const waitTime = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 1000);
      return { allowed: false, remaining: 0, waitTime };
    }

    return { allowed: true, remaining: 5 - attempts.count };
  }

  static recordLoginAttempt() {
    const attempts = JSON.parse(localStorage.getItem('bq_login_attempts') || '{"count":0,"lastAttempt":0}');
    attempts.count++;
    attempts.lastAttempt = Date.now();
    localStorage.setItem('bq_login_attempts', JSON.stringify(attempts));
  }

  static resetLoginAttempts() {
    localStorage.removeItem('bq_login_attempts');
  }

  static validateSession(): boolean {
    return this.getSession() !== null;
  }
}
