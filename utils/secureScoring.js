// 🔒 F.2.1.5 SECURE SCORING ENGINE - Server-Side Only
// Proprietary algorithm protection with environment-based obfuscation

// 🔐 PROTECTED ALGORITHM WEIGHTS (Environment Variables)
const ALGORITHM_WEIGHTS = {
  specificity: parseFloat(process.env.WEIGHT_SPECIFICITY) || 0.35,
  alignment: parseFloat(process.env.WEIGHT_ALIGNMENT) || 0.30,
  completeness: parseFloat(process.env.WEIGHT_COMPLETENESS) || 0.20,
  actionability: parseFloat(process.env.WEIGHT_ACTIONABILITY) || 0.15
};

// 🔐 PROTECTED SCORING THRESHOLDS
const SCORING_THRESHOLDS = {
  base: parseFloat(process.env.THRESHOLD_BASE) || 5,
  maxScore: parseFloat(process.env.THRESHOLD_MAX) || 10,
  keywordWeight: parseFloat(process.env.THRESHOLD_KEYWORD) || 0.4,
  specificityBonus: parseFloat(process.env.THRESHOLD_SPEC_BONUS) || 1.5
};

// 🔐 PROTECTED KEYWORD SETS (Server-Side Only)
const PROTECTED_KEYWORDS = {
  "Jobs-to-be-Done & Market Trends": [
    "specific", "validate", "customer", "pain", "measure", "feedback", 
    "interview", "problem", "solution", "urgency", "trend", "market", 
    "demand", "growth", "jtbd", "outcome", "hiring"
  ],
  "Competitive Positioning Canvas": [
    "differentiation", "moat", "unique", "positioning", "advantage", 
    "competitor", "benchmark", "superior", "defend", "barrier", 
    "competitive", "disruption", "market share"
  ],
  "Technology Adoption & Validation": [
    "scalable", "API", "architecture", "stack", "tested", "MVP", 
    "cloud", "security", "integration", "performance", "validation", 
    "technical", "deployment", "infrastructure"
  ],
  "Process & Metrics": [
    "KPI", "metric", "measure", "process", "efficiency", "optimize", 
    "workflow", "automation", "tracking", "dashboard", "target", 
    "benchmark", "analytics", "monitoring"
  ],
  "Partnership Activation": [
    "strategic", "channel", "distribution", "integration", "alliance", 
    "ecosystem", "collaboration", "vendor", "reseller", "synergy", 
    "partner", "B2B", "network", "stakeholder"
  ]
};

/**
 * 🔒 SecureScoringEngine - Protected proprietary algorithm
 */
class SecureScoringEngine {
  constructor() {
    this.algorithmVersion = process.env.ALGORITHM_VERSION || '1.2.1';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.environment = process.env.NODE_ENV || 'development';
    
    // 🔐 Initialize protected components
    this.initializeSecureComponents();
  }

  /**
   * 🔐 Initialize secure algorithm components
   */
  initializeSecureComponents() {
    // Algorithm integrity verification
    this.algorithmHash = this.generateAlgorithmHash();
    
    // Environment-specific configuration
    this.debugMode = this.environment === 'development';
    this.obfuscationLevel = this.isProduction ? 'high' : 'low';
    
    if (this.debugMode) {
      console.log('🔒 SecureScoringEngine initialized:', {
        version: this.algorithmVersion,
        environment: this.environment,
        obfuscation: this.obfuscationLevel
      });
    }
  }

  /**
   * 🔐 Generate algorithm integrity hash
   */
  generateAlgorithmHash() {
    const components = [
      this.algorithmVersion,
      JSON.stringify(ALGORITHM_WEIGHTS),
      JSON.stringify(SCORING_THRESHOLDS)
    ].join('|');
    
    // Simple hash for integrity (not cryptographic)
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
      const char = components.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 🔒 MAIN SECURE SCORING METHOD
   * @param {Object} validationAnswers - User validation responses
   * @param {Object} analysisContext - Previous analysis context
   * @param {string} language - Language for response (it/en)
   * @returns {Object} - Secure scoring result
   */
  calculateSecureScore(validationAnswers, analysisContext = {}, language = 'it') {
    try {
      // 🔐 Security validation
      if (!this.validateScoringRequest(validationAnswers)) {
        throw new Error('Invalid scoring request');
      }

      // 🔐 Process each dimension with protected algorithm
      const dimensionScores = {};
      const textAnalysis = {};

      Object.entries(validationAnswers).forEach(([dimension, answer]) => {
        const analysis = this.secureAnalyzeTextAnswer(answer, dimension, analysisContext, language);
        dimensionScores[dimension] = analysis.score;
        textAnalysis[dimension] = analysis;
      });

      // 🔐 Calculate overall score with protected weights
      const overallScore = this.calculateProtectedOverallScore(dimensionScores);

      // 🔐 Generate secure result
      return {
        overall: {
          score: overallScore,
          rating: this.calculateRating(overallScore)
        },
        dimensions: this.formatDimensionScores(textAnalysis, language),
        textAnalysis: this.isProduction ? this.obfuscateAnalysis(textAnalysis) : textAnalysis,
        metadata: this.generateSecureMetadata()
      };

    } catch (error) {
      if (this.debugMode) {
        console.error('🔒 SecureScoringEngine Error:', error);
      }
      throw new Error('Secure scoring calculation failed');
    }
  }

  /**
   * 🔐 PROTECTED TEXT ANALYSIS ALGORITHM
   */
  secureAnalyzeTextAnswer(answer, dimension, analysisContext, language = 'it') {
    if (!answer || answer.length < 10) {
      return this.getMinimalScoreResult(language);
    }

    const wordCount = answer.split(/\s+/).length;
    const keywords = PROTECTED_KEYWORDS[dimension] || [];

    // 🔐 LEVEL 1: Specificity Analysis (Protected Algorithm)
    const specificityScore = this.calculateSpecificityScore(answer);
    
    // 🔐 LEVEL 2: Alignment Analysis (Protected Algorithm)  
    const alignmentScore = this.calculateAlignmentScore(answer, analysisContext, keywords);
    
    // 🔐 LEVEL 3: Completeness Analysis (Protected Algorithm)
    const completenessScore = this.calculateCompletenessScore(answer, wordCount);
    
    // 🔐 LEVEL 4: Actionability Analysis (Protected Algorithm)
    const actionabilityScore = this.calculateActionabilityScore(answer);

    // 🔐 PROTECTED WEIGHTED CALCULATION
    const totalScore = this.applyProtectedWeights({
      specificity: specificityScore,
      alignment: alignmentScore,
      completeness: completenessScore,
      actionability: actionabilityScore
    });

    return {
      score: Math.min(Math.round(totalScore * 10) / 10, SCORING_THRESHOLDS.maxScore),
      specificityScore,
      alignmentScore,
      completenessScore,
      actionabilityScore,
      gaps: this.identifyGaps(answer, specificityScore, alignmentScore, completenessScore, actionabilityScore, language),
      strengths: this.identifyStrengths(answer, specificityScore, alignmentScore, completenessScore, actionabilityScore, language),
      keywordsFound: this.countKeywords(answer, keywords),
      wordCount,
      hasSpecifics: specificityScore > 6
    };
  }

  /**
   * 🔐 PROTECTED SPECIFICITY CALCULATION
   */
  calculateSpecificityScore(answer) {
    let score = SCORING_THRESHOLDS.base;
    
    // 🔐 Metrics detection (protected patterns)
    const patterns = this.getProtectedPatterns();
    
    if (patterns.numbers.test(answer)) score += 1;
    if (patterns.currency.test(answer)) score += SCORING_THRESHOLDS.specificityBonus;
    if (patterns.percentage.test(answer)) score += 1;
    if (patterns.kpis.test(answer)) score += SCORING_THRESHOLDS.specificityBonus;
    if (patterns.timeline.test(answer)) score += 1;
    if (patterns.deadlines.test(answer)) score += 0.5;
    if (patterns.targets.test(answer)) score += 1;
    if (patterns.metrics.test(answer)) score += 0.5;
    
    return Math.min(score, SCORING_THRESHOLDS.maxScore);
  }

  /**
   * 🔐 PROTECTED ALIGNMENT CALCULATION
   */
  calculateAlignmentScore(answer, analysisContext, keywords) {
    let score = SCORING_THRESHOLDS.base;
    
    // 🔐 Keywords analysis (protected)
    keywords.forEach(keyword => {
      if (answer.toLowerCase().includes(keyword.toLowerCase())) {
        score += SCORING_THRESHOLDS.keywordWeight;
      }
    });
    
    // 🔐 Vertical terminology (protected patterns)
    const verticalPatterns = this.getVerticalPatterns();
    Object.values(verticalPatterns).forEach(pattern => {
      if (pattern.test(answer)) score += 1.5;
    });
    
    // 🔐 Methodology detection (protected)
    const methodologyPatterns = this.getMethodologyPatterns();
    if (methodologyPatterns.methodology.test(answer)) score += 1;
    if (methodologyPatterns.frameworks.test(answer)) score += 1;
    
    return Math.min(score, SCORING_THRESHOLDS.maxScore);
  }

  /**
   * 🔐 PROTECTED COMPLETENESS CALCULATION
   */
  calculateCompletenessScore(answer, wordCount) {
    let score = SCORING_THRESHOLDS.base;
    
    // 🔐 Word count analysis (protected thresholds)
    const wordThresholds = this.getWordCountThresholds();
    if (wordCount >= wordThresholds.optimal.min && wordCount <= wordThresholds.optimal.max) {
      score += 2;
    } else if (wordCount >= wordThresholds.acceptable.min && wordCount <= wordThresholds.acceptable.max) {
      score += 1;
    } else if (wordCount >= wordThresholds.minimum) {
      score += 0.5;
    }
    
    // 🔐 Structure analysis (protected)
    const structurePatterns = this.getStructurePatterns();
    if (structurePatterns.multipleAspects.test(answer)) score += 1;
    if (structurePatterns.hasList.test(answer)) score += 1;
    
    // 🔐 Coverage analysis (protected)
    const coveragePatterns = this.getCoveragePatterns();
    if (coveragePatterns.strategy.test(answer)) score += 0.5;
    if (coveragePatterns.tactics.test(answer)) score += 0.5;
    if (coveragePatterns.metrics.test(answer)) score += 0.5;
    
    return Math.min(score, SCORING_THRESHOLDS.maxScore);
  }

  /**
   * 🔐 PROTECTED ACTIONABILITY CALCULATION
   */
  calculateActionabilityScore(answer) {
    let score = SCORING_THRESHOLDS.base;
    
    // 🔐 Action detection (protected patterns)
    const actionPatterns = this.getActionPatterns();
    
    if (actionPatterns.actions.test(answer)) score += 2;
    if (actionPatterns.steps.test(answer)) score += 1.5;
    if (actionPatterns.nextSteps.test(answer)) score += 1;
    if (actionPatterns.priorities.test(answer)) score += 1;
    if (actionPatterns.success.test(answer)) score += 0.5;
    if (actionPatterns.criteria.test(answer)) score += 0.5;
    
    return Math.min(score, SCORING_THRESHOLDS.maxScore);
  }

  /**
   * 🔐 PROTECTED WEIGHTED CALCULATION
   */
  applyProtectedWeights(scores) {
    return (
      scores.specificity * ALGORITHM_WEIGHTS.specificity +
      scores.alignment * ALGORITHM_WEIGHTS.alignment +
      scores.completeness * ALGORITHM_WEIGHTS.completeness +
      scores.actionability * ALGORITHM_WEIGHTS.actionability
    );
  }

  /**
   * 🔐 PROTECTED PATTERNS (Obfuscated in production)
   */
  getProtectedPatterns() {
    return {
      numbers: /\d+/,
      currency: /[€$£¥]\d+|euro|dollar/i,
      percentage: /%|\spercent/i,
      kpis: /(kpi|roi|conversion|retention|churn|cac|ltv)/i,
      timeline: /(month|week|day|year|Q[1-4]|gennaio|febbraio|marzo)/i,
      deadlines: /(entro|deadline|scadenza|timeline)/i,
      targets: /(target|obiettivo|goal).*\d+/i,
      metrics: /(\d+%|\d+x|\d+ volte)/i
    };
  }

  getVerticalPatterns() {
    return {
      fintech: /(fintech|payment|banking|digital wallet|blockchain|crypto)/i,
      healthtech: /(healthcare|medical|patient|clinical|fda|regulatory)/i,
      saas: /(saas|subscription|recurring|churn|mrr|arr)/i,
      ecommerce: /(ecommerce|marketplace|seller|inventory|fulfillment)/i
    };
  }

  getMethodologyPatterns() {
    return {
      methodology: /(agile|scrum|lean|mvp|poc|pilot|a\/b test)/i,
      frameworks: /(okr|kpi|north star|funnel|customer journey)/i
    };
  }

  getWordCountThresholds() {
    return {
      optimal: { min: 50, max: 150 },
      acceptable: { min: 30, max: 200 },
      minimum: 20
    };
  }

  getStructurePatterns() {
    return {
      multipleAspects: /[.!?].*[.!?]/,
      hasList: /(\n-|\n\d+\.|\n•|,\s*\w+,\s*\w+)/i
    };
  }

  getCoveragePatterns() {
    return {
      strategy: /(strategia|strategy|approccio|approach)/i,
      tactics: /(tattica|execution|implementazione|rollout)/i,
      metrics: /(misura|measure|track|monitor|metric)/i
    };
  }

  getActionPatterns() {
    return {
      actions: /(will|sarò|farò|implement|deploy|launch|create|build)/i,
      steps: /(step|fase|primo|secondo|then|poi|dopo)/i,
      nextSteps: /(next step|prossimo passo|successivamente|quindi)/i,
      priorities: /(priorità|priority|first|prima|inizialmente)/i,
      success: /(success|successo|achievement|risultato|outcome)/i,
      criteria: /(criteri|criteria|soglia|threshold|when|quando)/i
    };
  }

  /**
   * 🔐 UTILITY METHODS (Protected)
   */
  validateScoringRequest(validationAnswers) {
    return validationAnswers && typeof validationAnswers === 'object';
  }

  getMinimalScoreResult(language = 'it') {
    const isEnglish = language === 'en';
    return {
      score: 2,
      specificityScore: 0,
      alignmentScore: 0,
      completenessScore: 0,
      actionabilityScore: 0,
      gaps: [isEnglish ? 'Response too short or missing' : 'Risposta troppo breve o mancante'],
      strengths: [],
      keywordsFound: 0,
      wordCount: 0,
      hasSpecifics: false
    };
  }

  calculateProtectedOverallScore(dimensionScores) {
    const scores = Object.values(dimensionScores);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateRating(score) {
    if (score >= 8.5) return 'Altamente Promettente';
    if (score >= 7.0) return 'Promettente';
    if (score >= 5.5) return 'Moderato';
    return 'Da Affinare';
  }

  formatDimensionScores(textAnalysis, language = 'it') {
    return Object.entries(textAnalysis).map(([dimension, analysis]) => ({
      name: dimension,
      score: analysis.score,
      rationale: this.generateRationale(analysis, language)
    }));
  }

  generateRationale(analysis, language = 'it') {
    const strengths = analysis.strengths.length;
    const gaps = analysis.gaps.length;
    const isEnglish = language === 'en';
    
    if (strengths > gaps) {
      return isEnglish 
        ? "Strong alignment with best practices identified"
        : "Forte allineamento con best practices identificato";
    } else if (gaps > strengths) {
      return isEnglish
        ? "Areas for improvement identified in responses"
        : "Aree di miglioramento identificate nelle risposte";
    } else {
      return isEnglish
        ? "Balance between strengths and development areas"
        : "Bilancio tra punti di forza e aree di sviluppo";
    }
  }

  countKeywords(answer, keywords) {
    return keywords.filter(k => 
      answer.toLowerCase().includes(k.toLowerCase())
    ).length;
  }

  identifyGaps(answer, specificity, alignment, completeness, actionability, language = 'it') {
    const gaps = [];
    const isEnglish = language === 'en';
    
    if (specificity < 6) {
      gaps.push(isEnglish 
        ? "Missing concrete metrics, percentages or specific timelines"
        : "Mancano metriche concrete, percentuali o timeline specifiche");
    }
    if (alignment < 6) {
      gaps.push(isEnglish
        ? "Poor alignment with sector best practices"
        : "Scarso allineamento con best practices del settore");
    }
    if (completeness < 6) {
      gaps.push(isEnglish
        ? "Incomplete response - missing strategic or tactical aspects"
        : "Risposta incompleta - mancano aspetti strategici o tattici");
    }
    if (actionability < 6) {
      gaps.push(isEnglish
        ? "Vague actions - need clearer next steps"
        : "Azioni poco concrete - servono next steps più chiari");
    }
    return gaps;
  }

  identifyStrengths(answer, specificity, alignment, completeness, actionability, language = 'it') {
    const strengths = [];
    const isEnglish = language === 'en';
    
    if (specificity >= 8) {
      strengths.push(isEnglish
        ? "Excellent specificity with concrete metrics and timelines"
        : "Ottima specificità con metriche e timeline concrete");
    }
    if (alignment >= 8) {
      strengths.push(isEnglish
        ? "Strong alignment with vertical best practices"
        : "Forte allineamento con best practices del verticale");
    }
    if (completeness >= 8) {
      strengths.push(isEnglish
        ? "Complete and well-structured response"
        : "Risposta completa e ben strutturata");
    }
    if (actionability >= 8) {
      strengths.push(isEnglish
        ? "Clear actions and defined success criteria"
        : "Azioni chiare e criteri di successo definiti");
    }
    return strengths;
  }

  obfuscateAnalysis(textAnalysis) {
    // In production, remove sensitive algorithm details
    const obfuscated = {};
    Object.entries(textAnalysis).forEach(([key, analysis]) => {
      obfuscated[key] = {
        score: analysis.score,
        keywordsFound: analysis.keywordsFound,
        wordCount: analysis.wordCount,
        hasSpecifics: analysis.hasSpecifics
        // Remove detailed scoring breakdown
      };
    });
    return obfuscated;
  }

  generateSecureMetadata() {
    return {
      algorithmVersion: this.algorithmVersion,
      algorithmHash: this.algorithmHash,
      environment: this.isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString(),
      securityLevel: this.obfuscationLevel
    };
  }
}

// 🔒 Export only for server-side use
module.exports = { SecureScoringEngine };

// 🔐 Algorithm integrity check
if (process.env.NODE_ENV === 'production') {
  // Additional production-only security measures
  Object.freeze(ALGORITHM_WEIGHTS);
  Object.freeze(SCORING_THRESHOLDS);
  Object.freeze(PROTECTED_KEYWORDS);
}