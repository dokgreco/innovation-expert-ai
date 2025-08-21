// 📊 ALPHA TESTING ANALYTICS TRACKER
// Tracks specific user behaviors for alpha testing insights

import { track } from '@vercel/analytics'

/**
 * 🎯 AlphaTracker - Custom analytics for alpha testing phase
 */
class AlphaTracker {
  
  /**
   * 🚀 Track alpha tester journey events
   */
  static trackAlphaEvent(eventName, properties = {}) {
    // Only track in production for real alpha testers
    if (process.env.NODE_ENV === 'production') {
      track(`alpha_${eventName}`, {
        timestamp: new Date().toISOString(),
        session: Date.now().toString(36),
        ...properties
      });
    }
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ALPHA TRACKING] ${eventName}:`, properties);
    }
  }

  // === USER JOURNEY TRACKING ===
  
  /**
   * 📝 Track query submission
   */
  static trackQuerySubmission(query, filters = []) {
    this.trackAlphaEvent('query_submitted', {
      query_length: query.length,
      has_filters: filters.length > 0,
      filter_count: filters.length
    });
  }

  /**
   * ✅ Track successful analysis completion
   */
  static trackAnalysisCompleted(duration, hasValidation = false) {
    this.trackAlphaEvent('analysis_completed', {
      duration_seconds: Math.round(duration / 1000),
      has_validation_questions: hasValidation
    });
  }

  /**
   * 🔧 Track validation attempts
   */
  static trackValidationAttempt(questionsCount, totalWords) {
    this.trackAlphaEvent('validation_attempted', {
      questions_count: questionsCount,
      total_words: totalWords,
      avg_words_per_question: Math.round(totalWords / questionsCount)
    });
  }

  /**
   * 🎯 Track scoring generation
   */
  static trackScoringGenerated(score, iteration = 1) {
    this.trackAlphaEvent('scoring_generated', {
      overall_score: score,
      iteration: iteration,
      is_rescore: iteration > 1
    });
  }

  /**
   * 🔄 Track re-scoring usage
   */
  static trackRescoringUsed(previousScore, newScore, iteration) {
    const scoreDelta = newScore - previousScore;
    this.trackAlphaEvent('rescoring_used', {
      previous_score: previousScore,
      new_score: newScore,
      score_delta: scoreDelta,
      iteration: iteration,
      improved: scoreDelta > 0
    });
  }

  // === ISSUE TRACKING ===

  /**
   * ⚠️ Track known issues encountered
   */
  static trackKnownIssue(issueType, context = {}) {
    this.trackAlphaEvent('known_issue_encountered', {
      issue_type: issueType,
      ...context
    });
  }

  /**
   * 🔄 Track page refreshes (potential UX issues)
   */
  static trackPageRefresh(reason = 'unknown') {
    this.trackAlphaEvent('page_refreshed', {
      reason: reason,
      url: typeof window !== 'undefined' ? window.location.pathname : ''
    });
  }

  /**
   * ❌ Track API errors
   */
  static trackAPIError(apiEndpoint, errorCode, errorMessage) {
    this.trackAlphaEvent('api_error', {
      endpoint: apiEndpoint,
      error_code: errorCode,
      error_type: errorMessage.includes('529') ? 'claude_overload' : 
                  errorMessage.includes('503') ? 'service_unavailable' : 'other'
    });
  }

  // === ENGAGEMENT TRACKING ===

  /**
   * 🔍 Track Deep Dive usage
   */
  static trackDeepDiveUsed(section, question = '') {
    this.trackAlphaEvent('deep_dive_used', {
      section: section,
      has_custom_question: question.length > 0,
      question_length: question.length
    });
  }

  /**
   * 🌐 Track language switches
   */
  static trackLanguageSwitch(fromLang, toLang) {
    this.trackAlphaEvent('language_switched', {
      from_language: fromLang,
      to_language: toLang
    });
  }

  /**
   * 📱 Track device type
   */
  static trackDeviceInfo() {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent;
      const browser = userAgent.includes('Chrome') ? 'chrome' : 
                     userAgent.includes('Firefox') ? 'firefox' : 
                     userAgent.includes('Safari') ? 'safari' : 'other';
      
      this.trackAlphaEvent('session_started', {
        device_type: isMobile ? 'mobile' : 'desktop',
        browser: browser,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight
      });
    }
  }
}

export { AlphaTracker };