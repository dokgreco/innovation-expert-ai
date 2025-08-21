// 🔒 SECURE LOGGER - Production-Safe Logging System
// Eliminazione completa console.log in production per sicurezza

/**
 * 🔐 SecureLogger - Sistema di logging sicuro per production
 * - Development: Logging completo e dettagliato
 * - Production: Solo errori critici, nessun log di debug
 */
class SecureLogger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    if (this.isProduction) {
      this.disableConsoleInProduction();
    }
  }

  /**
   * 🚫 Disabilita completamente console.log/info/debug in production
   */
  disableConsoleInProduction() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Disabilita tutti i console.log/info/debug in production
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    // Mantieni solo console.error per errori critici (senza dettagli sensibili)
    console.error = (...args) => {
      if (this.containsSensitiveInfo(args)) {
        originalError('🚨 Error occurred (details hidden for security)');
      } else {
        originalError(...args);
      }
    };
    
    console.warn = (...args) => {
      if (this.containsSensitiveInfo(args)) {
        originalWarn('⚠️ Warning occurred (details hidden for security)');
      } else {
        originalWarn(...args);
      }
    };
  }

  /**
   * 🔍 Controlla se i log contengono informazioni sensibili
   */
  containsSensitiveInfo(args) {
    const sensitiveKeywords = [
      'algorithm', 'weight', 'pattern', 'scoring', 'obfuscation',
      'claude', 'api', 'notion', 'secret', 'token', 'key',
      '🔒', '🔐', '🧠', '📊', '🎯' // Emoji che usiamo per log sensitivi
    ];
    
    const argsString = args.join(' ').toLowerCase();
    return sensitiveKeywords.some(keyword => argsString.includes(keyword));
  }

  /**
   * 🔧 Development-only logging method
   */
  static dev(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV]', ...args);
    }
  }

  /**
   * 📊 Safe metrics logging (no sensitive data)
   */
  static metrics(event, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[METRICS] ${event}:`, data);
    }
    // In production, questi dati andrebbero inviati a servizio analytics esterno
    // ma per ora non logghiamo nulla
  }

  /**
   * 🚨 Critical error logging (production-safe)
   */
  static error(message, sanitizedContext = {}) {
    console.error(`[ERROR] ${message}`, sanitizedContext);
  }

  /**
   * ⚠️ Warning logging (production-safe)
   */
  static warn(message, sanitizedContext = {}) {
    console.warn(`[WARN] ${message}`, sanitizedContext);
  }
}

// Inizializza il secure logger automaticamente
const secureLogger = new SecureLogger();

module.exports = { SecureLogger };