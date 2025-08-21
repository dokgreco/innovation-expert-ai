// 🔒 F.2.1.5 DYNAMIC ALGORITHM LOADER - Version Control & Security
// Secure loading and management of algorithm versions

/**
 * 🔐 AlgorithmLoader - Dynamic algorithm version management
 * Provides secure, versioned access to algorithm components
 */
class AlgorithmLoader {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isProduction = this.environment === 'production';
    this.currentVersion = process.env.ALGORITHM_VERSION || '1.2.1';
    
    // 🔐 Algorithm registry
    this.algorithmRegistry = new Map();
    this.loadedVersions = new Map();
    
    // 🔐 Initialize loader
    this.initializeLoader();
  }

  /**
   * 🔐 Initialize algorithm loader with security checks
   */
  initializeLoader() {
    // 🔐 Register available algorithm versions
    this.registerAlgorithmVersions();
    
    // 🔐 Verify algorithm integrity
    this.verifyAlgorithmIntegrity();
    
    if (!this.isProduction) {
      console.log('🔐 AlgorithmLoader initialized:', {
        environment: this.environment,
        currentVersion: this.currentVersion,
        availableVersions: this.getAvailableVersions(),
        registeredComponents: this.algorithmRegistry.size
      });
    }
  }

  /**
   * 🔐 Register available algorithm versions
   */
  registerAlgorithmVersions() {
    // 🔐 Current production version
    this.algorithmRegistry.set('1.2.1', {
      scoringEngine: () => require('./secureScoring').SecureScoringEngine,
      algorithmCore: () => require('./algorithmCore').AlgorithmCore,
      features: ['secure-scoring', 'pattern-analysis', 'benchmark-calculation'],
      securityLevel: 'high',
      deprecated: false
    });

    // 🔐 Legacy version support (if needed)
    this.algorithmRegistry.set('1.2.0', {
      scoringEngine: () => this.getLegacyScoring(),
      algorithmCore: () => this.getLegacyCore(),
      features: ['basic-scoring', 'pattern-analysis'],
      securityLevel: 'medium',
      deprecated: true
    });

    // 🔐 Experimental/Future version (for testing)
    if (!this.isProduction) {
      this.algorithmRegistry.set('1.3.0-beta', {
        scoringEngine: () => require('./secureScoring').SecureScoringEngine,
        algorithmCore: () => require('./algorithmCore').AlgorithmCore,
        features: ['enhanced-security', 'ai-optimization', 'real-time-learning'],
        securityLevel: 'maximum',
        deprecated: false,
        experimental: true
      });
    }
  }

  /**
   * 🔒 MAIN ALGORITHM LOADING METHOD
   * @param {string} version - Algorithm version to load
   * @param {string} component - Specific component to load
   * @returns {Object} - Loaded algorithm component
   */
  static async loadAlgorithm(version = 'latest', component = 'full') {
    const loader = new AlgorithmLoader();
    return loader.loadAlgorithmVersion(version, component);
  }

  /**
   * 🔐 Load specific algorithm version
   */
  async loadAlgorithmVersion(version = 'latest', component = 'full') {
    try {
      // 🔐 Resolve version
      const resolvedVersion = this.resolveVersion(version);
      
      // 🔐 Security validation
      if (!this.validateVersionAccess(resolvedVersion)) {
        throw new Error(`Access denied to algorithm version: ${resolvedVersion}`);
      }

      // 🔐 Check if already loaded
      const cacheKey = `${resolvedVersion}-${component}`;
      if (this.loadedVersions.has(cacheKey)) {
        return this.loadedVersions.get(cacheKey);
      }

      // 🔐 Load algorithm components
      const algorithmConfig = this.algorithmRegistry.get(resolvedVersion);
      if (!algorithmConfig) {
        throw new Error(`Algorithm version not found: ${resolvedVersion}`);
      }

      // 🔐 Load requested components
      const loadedAlgorithm = await this.loadComponents(algorithmConfig, component);
      
      // 🔐 Cache loaded algorithm
      this.loadedVersions.set(cacheKey, loadedAlgorithm);

      // 🔐 Return with metadata
      return {
        ...loadedAlgorithm,
        metadata: {
          version: resolvedVersion,
          component: component,
          loadedAt: new Date().toISOString(),
          securityLevel: algorithmConfig.securityLevel,
          features: algorithmConfig.features
        }
      };

    } catch (error) {
      if (!this.isProduction) {
        console.error('🔐 Algorithm loading error:', error);
      }
      throw new Error(`Failed to load algorithm: ${error.message}`);
    }
  }

  /**
   * 🔐 Load algorithm components based on request
   */
  async loadComponents(algorithmConfig, component) {
    const components = {};

    switch (component) {
      case 'full':
        components.scoringEngine = new (algorithmConfig.scoringEngine())();
        components.algorithmCore = new (algorithmConfig.algorithmCore())();
        break;
        
      case 'scoring':
        components.scoringEngine = new (algorithmConfig.scoringEngine())();
        break;
        
      case 'analysis':
        components.algorithmCore = new (algorithmConfig.algorithmCore())();
        break;
        
      default:
        throw new Error(`Unknown component: ${component}`);
    }

    return components;
  }

  /**
   * 🔐 Version resolution and validation
   */
  resolveVersion(requestedVersion) {
    if (requestedVersion === 'latest') {
      return this.getLatestVersion();
    }
    
    if (requestedVersion === 'current') {
      return this.currentVersion;
    }
    
    // Validate specific version
    if (this.algorithmRegistry.has(requestedVersion)) {
      return requestedVersion;
    }
    
    throw new Error(`Invalid algorithm version: ${requestedVersion}`);
  }

  /**
   * 🔐 Get latest stable version
   */
  getLatestVersion() {
    const versions = Array.from(this.algorithmRegistry.keys())
      .filter(version => !this.algorithmRegistry.get(version).deprecated)
      .filter(version => !this.algorithmRegistry.get(version).experimental)
      .sort((a, b) => this.compareVersions(b, a)); // Descending order
    
    return versions[0] || this.currentVersion;
  }

  /**
   * 🔐 Version comparison utility
   */
  compareVersions(a, b) {
    const parseVersion = (v) => v.split(/[.-]/).map(x => parseInt(x) || 0);
    const versionA = parseVersion(a);
    const versionB = parseVersion(b);
    
    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
      const numA = versionA[i] || 0;
      const numB = versionB[i] || 0;
      
      if (numA !== numB) {
        return numA - numB;
      }
    }
    return 0;
  }

  /**
   * 🔐 Validate version access permissions
   */
  validateVersionAccess(version) {
    const algorithmConfig = this.algorithmRegistry.get(version);
    
    if (!algorithmConfig) {
      return false;
    }

    // 🔐 Production restrictions
    if (this.isProduction) {
      // Block experimental versions in production
      if (algorithmConfig.experimental) {
        return false;
      }
      
      // Block deprecated versions in production
      if (algorithmConfig.deprecated) {
        return false;
      }
      
      // Require high security level in production
      if (algorithmConfig.securityLevel !== 'high' && algorithmConfig.securityLevel !== 'maximum') {
        return false;
      }
    }

    return true;
  }

  /**
   * 🔐 Algorithm integrity verification
   */
  verifyAlgorithmIntegrity() {
    // 🔐 Verify each registered algorithm
    this.algorithmRegistry.forEach((config, version) => {
      try {
        // Basic validation
        if (!config.scoringEngine || !config.algorithmCore) {
          throw new Error(`Invalid algorithm configuration for version ${version}`);
        }
        
        // Security level validation
        const validSecurityLevels = ['low', 'medium', 'high', 'maximum'];
        if (!validSecurityLevels.includes(config.securityLevel)) {
          throw new Error(`Invalid security level for version ${version}`);
        }
        
      } catch (error) {
        console.error(`🔐 Algorithm integrity check failed for version ${version}:`, error);
        // Remove invalid algorithm from registry
        this.algorithmRegistry.delete(version);
      }
    });
  }

  /**
   * 🔐 PUBLIC API METHODS
   */
  
  /**
   * Get available algorithm versions
   */
  static getAvailableVersions() {
    const loader = new AlgorithmLoader();
    return loader.getAvailableVersions();
  }

  getAvailableVersions() {
    return Array.from(this.algorithmRegistry.keys())
      .filter(version => this.validateVersionAccess(version))
      .map(version => ({
        version,
        ...this.algorithmRegistry.get(version),
        // Remove sensitive implementation details
        scoringEngine: undefined,
        algorithmCore: undefined
      }));
  }

  /**
   * Get algorithm features for version
   */
  static getAlgorithmFeatures(version) {
    const loader = new AlgorithmLoader();
    const algorithmConfig = loader.algorithmRegistry.get(version);
    return algorithmConfig ? algorithmConfig.features : [];
  }

  /**
   * Check algorithm compatibility
   */
  static isVersionCompatible(version, requiredFeatures = []) {
    const loader = new AlgorithmLoader();
    const algorithmConfig = loader.algorithmRegistry.get(version);
    
    if (!algorithmConfig) return false;
    
    return requiredFeatures.every(feature => 
      algorithmConfig.features.includes(feature)
    );
  }

  /**
   * 🔐 LEGACY SUPPORT METHODS
   */
  getLegacyScoring() {
    // Minimal legacy scoring implementation
    return class LegacyScoringEngine {
      calculateSecureScore(validationAnswers) {
        return {
          overall: { score: 7.0, rating: 'Legacy Mode' },
          dimensions: [],
          metadata: { legacy: true }
        };
      }
    };
  }

  getLegacyCore() {
    // Minimal legacy core implementation
    return class LegacyAlgorithmCore {
      analyzePatterns(input) {
        return {
          patternAnalysis: {},
          confidence: 0.5,
          metadata: { legacy: true }
        };
      }
    };
  }

  /**
   * 🔐 CLEANUP AND CACHE MANAGEMENT
   */
  
  /**
   * Clear algorithm cache
   */
  static clearCache() {
    const loader = new AlgorithmLoader();
    loader.loadedVersions.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const loader = new AlgorithmLoader();
    return {
      cachedVersions: loader.loadedVersions.size,
      registeredVersions: loader.algorithmRegistry.size,
      currentVersion: loader.currentVersion
    };
  }
}

// 🔒 Export for server-side use only
module.exports = { AlgorithmLoader };

// 🔐 Production security measures
if (process.env.NODE_ENV === 'production') {
  // Additional security hardening
  Object.freeze(AlgorithmLoader.prototype);
}