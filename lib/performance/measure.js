 // lib/performance/measure.js
export const measurePerformance = {
  notionQuery: {
    start: null,
    end: null,
    duration: null
  },
  claudeAnalysis: {
    start: null,
    end: null,
    duration: null
  },
  totalFlow: {
    start: null,
    end: null,
    duration: null
  },
  
  startMeasure(key) {
    this[key].start = Date.now();
    console.log(`⏱️ [PERF] Starting ${key}`);
  },
  
  endMeasure(key) {
    this[key].end = Date.now();
    this[key].duration = this[key].end - this[key].start;
    console.log(`✅ [PERF] ${key} completed in ${this[key].duration}ms`);
    return this[key].duration;
  },
  
  getReport() {
    return {
      notionQuery: this.notionQuery.duration,
      claudeAnalysis: this.claudeAnalysis.duration,
      totalFlow: this.totalFlow.duration,
      timestamp: new Date().toISOString()
    };
  }
};
