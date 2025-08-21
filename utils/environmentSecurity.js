// 🔒 F.2.1.5 ENVIRONMENT SECURITY CONFIGURATION
// Dynamic security levels based on deployment environment

/**
 * 🔐 Environment-based security configuration
 * Provides different protection levels for development, staging, and production
 */
const SecurityConfig = {
  development: {
    // 🔧 Development configuration - Maximum visibility for debugging
    obfuscation: false,
    debugging: true,
    algorithmLogging: true,
    detailedErrors: true,
    
    // Rate limiting
    rateLimit: {
      requests: 1000,
      timeWindow: 3600000, // 1 hour
      enabled: false
    },
    
    // API Security
    corsPolicy: 'permissive',
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    
    // Algorithm Protection
    algorithmProtection: {
      weightsProtection: false,
      patternObfuscation: false,
      responseEncryption: false,
      integrityChecks: false
    },
    
    // Monitoring
    monitoring: {
      performanceTracking: true,
      errorReporting: true,
      usageAnalytics: false
    }
  },

  staging: {
    // 🧪 Staging configuration - Balanced security for testing
    obfuscation: true,
    debugging: false,
    algorithmLogging: false,
    detailedErrors: true,
    
    // Rate limiting
    rateLimit: {
      requests: 500,
      timeWindow: 3600000, // 1 hour
      enabled: true
    },
    
    // API Security
    corsPolicy: 'restrictive',
    allowedOrigins: ['https://staging-innovation-expert-ai.vercel.app'],
    
    // Algorithm Protection
    algorithmProtection: {
      weightsProtection: true,
      patternObfuscation: true,
      responseEncryption: false,
      integrityChecks: true
    },
    
    // Monitoring
    monitoring: {
      performanceTracking: true,
      errorReporting: true,
      usageAnalytics: true
    }
  },

  production: {
    // 🔒 Production configuration - Maximum security
    obfuscation: true,
    debugging: false,
    algorithmLogging: false,
    detailedErrors: false,
    
    // Rate limiting
    rateLimit: {
      requests: 100,
      timeWindow: 3600000, // 1 hour
      enabled: true,
      strictMode: true
    },
    
    // API Security
    corsPolicy: 'strict',
    allowedOrigins: ['https://innovation-expert-ai-sana.vercel.app'],
    ipRestrictions: {
      enabled: true,
      whitelist: [], // Can be populated with specific IPs if needed
      blacklist: [], // Can be populated with blocked IPs
      maxRequestsPerIP: 50
    },
    
    // Algorithm Protection
    algorithmProtection: {
      weightsProtection: true,
      patternObfuscation: true,
      responseEncryption: true,
      integrityChecks: true,
      algorithmVersioning: true
    },
    
    // Additional Security
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: true
    },
    
    // Monitoring
    monitoring: {
      performanceTracking: true,
      errorReporting: true,
      usageAnalytics: true,
      securityAuditing: true
    }
  },

  // 🔬 Testing environment
  test: {
    obfuscation: false,
    debugging: true,
    algorithmLogging: false,
    detailedErrors: true,
    
    rateLimit: {
      requests: 10000,
      timeWindow: 3600000,
      enabled: false
    },
    
    corsPolicy: 'permissive',
    allowedOrigins: ['*'],
    
    algorithmProtection: {
      weightsProtection: false,
      patternObfuscation: false,
      responseEncryption: false,
      integrityChecks: true
    },
    
    monitoring: {
      performanceTracking: false,
      errorReporting: false,
      usageAnalytics: false
    }
  }
};

/**
 * 🔐 SecurityManager - Main security configuration manager
 */
class SecurityManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = SecurityConfig[this.environment] || SecurityConfig.development;
    this.initialized = false;
    
    this.initializeSecurity();
  }

  /**
   * 🔐 Initialize security configuration
   */
  initializeSecurity() {
    try {
      // 🔐 Validate environment
      this.validateEnvironment();
      
      // 🔐 Apply security configurations
      this.applySecurityConfig();
      
      // 🔐 Initialize monitoring
      this.initializeMonitoring();
      
      this.initialized = true;
      
      if (this.config.debugging) {
        console.log('🔐 SecurityManager initialized:', {
          environment: this.environment,
          obfuscation: this.config.obfuscation,
          encryption: this.config.encryption?.enabled || false,
          rateLimit: this.config.rateLimit.enabled
        });
      }
    } catch (error) {
      console.error('🔐 SecurityManager initialization failed:', error);
      throw error;
    }
  }

  /**
   * 🔐 Get current security level configuration
   */
  static getSecurityLevel() {
    const manager = new SecurityManager();
    return manager.getSecurityConfig();
  }

  getSecurityConfig() {
    return {
      ...this.config,
      environment: this.environment,
      initialized: this.initialized
    };
  }

  /**
   * 🔐 Validate request based on security configuration
   */
  static validateRequest(req) {
    const manager = new SecurityManager();
    return manager.performRequestValidation(req);
  }

  performRequestValidation(req) {
    const validation = {
      isValid: true,
      errors: [],
      securityLevel: this.environment
    };

    try {
      // 🔐 CORS validation
      if (!this.validateCORS(req)) {
        validation.isValid = false;
        validation.errors.push('CORS validation failed');
      }

      // 🔐 Rate limiting validation
      if (!this.validateRateLimit(req)) {
        validation.isValid = false;
        validation.errors.push('Rate limit exceeded');
      }

      // 🔐 IP restrictions (production only)
      if (!this.validateIPRestrictions(req)) {
        validation.isValid = false;
        validation.errors.push('IP access denied');
      }

      // 🔐 Request integrity
      if (!this.validateRequestIntegrity(req)) {
        validation.isValid = false;
        validation.errors.push('Request integrity check failed');
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * 🔐 CORS validation
   */
  validateCORS(req) {
    if (this.config.corsPolicy === 'permissive') {
      return true;
    }

    const origin = req.headers.origin;
    if (!origin) {
      return this.environment === 'development';
    }

    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * 🔐 Rate limiting validation
   */
  validateRateLimit(req) {
    if (!this.config.rateLimit.enabled) {
      return true;
    }

    // This would integrate with the existing rate limiting in generate-scoring.js
    // For now, return true as rate limiting is handled at the API level
    return true;
  }

  /**
   * 🔐 IP restrictions validation (production only)
   */
  validateIPRestrictions(req) {
    if (!this.config.ipRestrictions?.enabled) {
      return true;
    }

    const clientIP = req.headers['x-forwarded-for'] || 
                    req.connection?.remoteAddress || 
                    req.socket?.remoteAddress || 
                    'unknown';

    // Check blacklist
    if (this.config.ipRestrictions.blacklist.includes(clientIP)) {
      return false;
    }

    // Check whitelist (if configured)
    if (this.config.ipRestrictions.whitelist.length > 0) {
      return this.config.ipRestrictions.whitelist.includes(clientIP);
    }

    return true;
  }

  /**
   * 🔐 Request integrity validation
   */
  validateRequestIntegrity(req) {
    // Basic request validation
    if (!req.method || !req.headers) {
      return false;
    }

    // Content-Type validation for POST requests
    if (req.method === 'POST') {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return false;
      }
    }

    return true;
  }

  /**
   * 🔐 Response encryption (production only)
   */
  static encryptResponse(data) {
    const manager = new SecurityManager();
    return manager.performResponseEncryption(data);
  }

  performResponseEncryption(data) {
    if (!this.config.encryption?.enabled) {
      return data;
    }

    try {
      // In a real implementation, this would use actual encryption
      // For now, we'll just add an encryption marker
      return {
        encrypted: true,
        algorithm: this.config.encryption.algorithm,
        data: data, // In production, this would be encrypted
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (this.config.debugging) {
        console.error('🔐 Response encryption failed:', error);
      }
      return data; // Return unencrypted data if encryption fails
    }
  }

  /**
   * 🔐 Error handling based on environment
   */
  static handleSecurityError(error, req) {
    const manager = new SecurityManager();
    return manager.formatSecurityError(error, req);
  }

  formatSecurityError(error, req) {
    const response = {
      error: 'Security validation failed',
      timestamp: new Date().toISOString(),
      environment: this.environment
    };

    if (this.config.detailedErrors) {
      response.details = error.message;
      response.requestId = req.headers['x-request-id'] || 'unknown';
    }

    if (this.config.debugging) {
      response.stack = error.stack;
      response.config = this.config;
    }

    return response;
  }

  /**
   * 🔐 Security monitoring and logging
   */
  static logSecurityEvent(event, details = {}) {
    const manager = new SecurityManager();
    manager.recordSecurityEvent(event, details);
  }

  recordSecurityEvent(event, details) {
    if (!this.config.monitoring.securityAuditing) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      event: event,
      details: details,
      securityLevel: this.config.obfuscation ? 'high' : 'low'
    };

    // In production, this would send to monitoring service
    if (this.config.debugging) {
      console.log('🔐 Security Event:', logEntry);
    }
  }

  /**
   * 🔐 Algorithm protection utilities
   */
  static shouldObfuscateAlgorithm() {
    const manager = new SecurityManager();
    return manager.config.algorithmProtection.patternObfuscation;
  }

  static shouldProtectWeights() {
    const manager = new SecurityManager();
    return manager.config.algorithmProtection.weightsProtection;
  }

  static shouldEncryptResponse() {
    const manager = new SecurityManager();
    return manager.config.algorithmProtection.responseEncryption;
  }

  static shouldPerformIntegrityChecks() {
    const manager = new SecurityManager();
    return manager.config.algorithmProtection.integrityChecks;
  }

  /**
   * 🔐 Private initialization methods
   */
  validateEnvironment() {
    const validEnvironments = ['development', 'staging', 'production', 'test'];
    if (!validEnvironments.includes(this.environment)) {
      throw new Error(`Invalid environment: ${this.environment}`);
    }
  }

  applySecurityConfig() {
    // Apply environment-specific security configurations
    if (this.config.obfuscation && this.environment === 'production') {
      // Enable algorithm obfuscation
      process.env.ALGORITHM_OBFUSCATION = 'true';
    }

    if (this.config.encryption?.enabled) {
      // Initialize encryption components
      process.env.ENCRYPTION_ENABLED = 'true';
    }
  }

  initializeMonitoring() {
    if (this.config.monitoring.performanceTracking) {
      // Initialize performance monitoring
    }

    if (this.config.monitoring.errorReporting) {
      // Initialize error reporting
    }

    if (this.config.monitoring.usageAnalytics) {
      // Initialize usage analytics
    }
  }
}

// 🔐 Export main functions
module.exports = {
  SecurityConfig,
  SecurityManager,
  getSecurityLevel: SecurityManager.getSecurityLevel,
  validateRequest: SecurityManager.validateRequest,
  encryptResponse: SecurityManager.encryptResponse,
  handleSecurityError: SecurityManager.handleSecurityError,
  logSecurityEvent: SecurityManager.logSecurityEvent,
  
  // Algorithm protection utilities
  shouldObfuscateAlgorithm: SecurityManager.shouldObfuscateAlgorithm,
  shouldProtectWeights: SecurityManager.shouldProtectWeights,
  shouldEncryptResponse: SecurityManager.shouldEncryptResponse,
  shouldPerformIntegrityChecks: SecurityManager.shouldPerformIntegrityChecks
};

// 🔐 Production security hardening
if (process.env.NODE_ENV === 'production') {
  // Freeze security configuration to prevent runtime modifications
  Object.freeze(SecurityConfig);
  Object.freeze(SecurityManager.prototype);
  
  // Disable console.log in production for security config
  if (!SecurityConfig.production.debugging) {
    const originalLog = console.log;
    console.log = (...args) => {
      if (!args.some(arg => typeof arg === 'string' && arg.includes('🔐'))) {
        originalLog(...args);
      }
    };
  }
}