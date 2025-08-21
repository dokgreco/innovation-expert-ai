// 🔒 SECURE LOGGER CLIENT - Browser-Safe Version
// Frontend-safe logging that works in both browser and server

/**
 * 🔐 SecureLoggerClient - Browser-compatible logging
 * Handles both client-side and server-side environments safely
 */
class SecureLoggerClient {
  constructor() {
    // Safe environment detection for browser/server
    this.isServer = typeof window === 'undefined';
    this.isBrowser = typeof window !== 'undefined';
    this.isProduction = this.isServer ? 
      (process.env.NODE_ENV === 'production') : 
      (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'));
    
    // Only disable console in production AND server-side
    if (this.isProduction && this.isServer) {
      this.disableConsoleInProduction();
    }
  }

  /**
   * 🚫 Disable console logging (server-side only)
   */
  disableConsoleInProduction() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    console.error = (...args) => {
      if (this.containsSensitiveInfo(args)) {
        originalError('🚨 Error occurred (details hidden for security)');
      } else {
        originalError(...args);
      }
    };
  }

  /**
   * 🔍 Check for sensitive information
   */
  containsSensitiveInfo(args) {
    const sensitiveKeywords = [
      'algorithm', 'weight', 'pattern', 'scoring', 'obfuscation',
      'claude', 'api', 'notion', 'secret', 'token', 'key',
      '🔒', '🔐', '🧠', '📊', '🎯'
    ];
    
    const argsString = args.join(' ').toLowerCase();
    return sensitiveKeywords.some(keyword => argsString.includes(keyword));
  }

  /**
   * 🔧 Development-only logging (safe for browser)
   */
  static dev(...args) {
    const logger = new SecureLoggerClient();
    
    // In browser: only log in development (localhost)
    if (logger.isBrowser) {
      if (!logger.isProduction) {
        console.log('[DEV]', ...args);
      }
      return;
    }
    
    // In server: use normal logic
    if (logger.isServer && !logger.isProduction) {
      console.log('[DEV]', ...args);
    }
  }

  /**
   * 📊 Safe metrics logging
   */
  static metrics(event, data = {}) {
    const logger = new SecureLoggerClient();
    
    if (!logger.isProduction) {
      console.log(`[METRICS] ${event}:`, data);
    }
  }

  /**
   * 🚨 Critical error logging (always safe)
   */
  static error(message, sanitizedContext = {}) {
    console.error(`[ERROR] ${message}`, sanitizedContext);
  }

  /**
   * ⚠️ Warning logging (always safe)
   */
  static warn(message, sanitizedContext = {}) {
    console.warn(`[WARN] ${message}`, sanitizedContext);
  }
}

// Safe export for both browser and server
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/Server environment
  module.exports = { SecureLogger: SecureLoggerClient };
} else if (typeof window !== 'undefined') {
  // Browser environment - attach to window
  window.SecureLogger = SecureLoggerClient;
}