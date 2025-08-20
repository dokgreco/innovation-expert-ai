# 🏗️ TECHNICAL ARCHITECTURE v1.2 - Innovation Expert AI
**Document Version:** v1.2.0  
**System Version:** v1.2.0  
**Last Updated:** 20 Agosto 2025  
**Architecture Type:** Next.js + Claude AI + Notion API

---

## 🌟 **SYSTEM OVERVIEW**

Innovation Expert AI è un sistema di consulenza digitale per la valutazione di startup e progetti innovativi, implementato con architettura serverless moderna e supporto multilingue completo.

### **Core Technologies**
- **Frontend**: Next.js 14.0.0 + React + Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **AI Engine**: Anthropic Claude Sonnet-4
- **Database**: Notion API (3 knowledge bases)
- **Deployment**: Vercel
- **Internationalization**: next-i18next

---

## 🔧 **ARCHITECTURAL COMPONENTS**

### **1. Frontend Layer**
```
pages/
├── index.js                 # Main application with 4-step flow
├── istruzioni.js           # Instructions and methodology page
└── _app.js                 # App configuration with i18n setup

components/
├── ValidationQuestions.js   # Form component with multilingual validation
└── StructuredAnalysisDisplay.js # Results display with markdown rendering

public/locales/
├── it/common.json          # Italian translations
└── en/common.json          # English translations
```

### **2. API Layer**
```
pages/api/
├── notion-query.js         # Database querying with semantic matching
├── claude-analysis.js      # AI analysis generation  
├── claude-section-qa.js    # Deep-dive Q&A functionality
└── generate-scoring.js     # Advanced scoring with multilingual prompts
```

### **3. Core Systems Integration**
```
External APIs:
├── Anthropic Claude API    # AI processing and generation
├── Notion API             # Knowledge base access (3 databases)
└── GitHub Integration     # Version control and auto-deploy

Internal Systems:
├── SecureCache            # In-memory caching with TTL
├── Rate Limiting          # Request throttling per IP
└── Multilingual Engine    # Dynamic content localization
```

---

## 🌍 **MULTILINGUAL SYSTEM ARCHITECTURE**

### **Language Detection & Routing**
```javascript
// Language detection via Next.js routing
router.locale → 'it' | 'en'

// API language parameter passing
fetch('/api/generate-scoring', {
  body: JSON.stringify({
    analysisData,
    validationAnswers,
    language: router.locale || 'it'  // Default fallback
  })
})
```

### **Dynamic Content Generation**
```javascript
// Multilingual prompt generation
function createScoringPrompt(analysisData, validationAnswers, textAnalysis, language) {
  const isEnglish = language === 'en';
  
  return `
    ${isEnglish 
      ? 'You are an Innovation Expert...' 
      : 'Sei un Innovation Expert...'
    }
    // Dynamic content based on language
  `;
}
```

### **Translation Architecture**
```
Static Translations (UI):
└── public/locales/{lang}/common.json

Dynamic Translations (AI Content):
├── API prompts → Language-specific generation
├── Scoring content → Multilingual fallbacks
└── Risk assessments → Localized responses
```

---

## 🚀 **ADVANCED SCORING SYSTEM**

### **4-Level Scoring Algorithm**
```javascript
// Weighted scoring calculation
const overallScore = (
  specificityScore * 0.35 +     // Metrics, timelines, concrete data
  alignmentScore * 0.30 +       // Best practices alignment
  completenessScore * 0.20 +    // Response completeness  
  actionabilityScore * 0.15     // Concrete next steps
);
```

### **Scoring Components**
```
1. Specificity Check (35% weight):
   ├── Numerical metrics detection
   ├── Timeline identification  
   ├── KPI references
   └── Quantified targets

2. Alignment Check (30% weight):
   ├── Industry keyword matching
   ├── Methodology references
   ├── Framework identification
   └── Vertical-specific terminology

3. Completeness Check (20% weight):
   ├── Word count optimization (50-150 words)
   ├── Multiple aspects coverage
   ├── Structured responses
   └── Strategic + tactical elements

4. Actionability Check (15% weight):
   ├── Concrete actions identification
   ├── Next steps clarity
   ├── Success criteria definition
   └── Priority establishment
```

---

## 🔄 **RE-SUBMISSION FLOW SYSTEM**

### **State Management**
```javascript
// Core re-submission states
const [scoringHistory, setScoringHistory] = useState([]);
const [submissionCount, setSubmissionCount] = useState(0);
const [isEditingAnswers, setIsEditingAnswers] = useState(false);
const [previousScore, setPreviousScore] = useState(null);

// ValidationQuestions state preservation
useEffect(() => {
  if (resetTrigger) {
    if (isEditingAnswers) {
      setErrors({}); // Only clear errors, preserve answers
    } else {
      // Fresh start - clear everything
      setAnswers({});
      setWordCounts({});
      setErrors({});
    }
  }
}, [resetTrigger, isEditingAnswers]);
```

### **Delta Calculation System**
```javascript
// Score delta calculation and display
const scoreDelta = currentScore - previousScore;
const deltaColor = scoreDelta > 0 ? 'text-green-600' : 
                   scoreDelta < 0 ? 'text-red-600' : 'text-yellow-600';
const deltaIcon = scoreDelta > 0 ? '↗️' : 
                  scoreDelta < 0 ? '↘️' : '➡️';
```

---

## 📊 **DATABASE ARCHITECTURE**

### **Notion Knowledge Bases**
```
Database 1: Primary Case Studies
├── 244+ records with 200+ properties
├── Startup patterns and methodologies
├── Success/failure case analysis
└── Industry vertical categorization

Database 2: Best Practices Library  
├── Strategic frameworks
├── Implementation guidelines
├── Metrics and KPIs
└── Partnership strategies

Database 3: Technology Adoption Patterns
├── Technical validation approaches
├── Scalability patterns
├── Security considerations
└── Integration strategies
```

### **Semantic Matching Algorithm**
```javascript
// Relevance scoring system
const relevanceScore = (
  crossDomainMatch * 0.4 +      // Keywords intersection
  semanticSimilarity * 0.3 +    // Contextual relevance
  popularityBoost * 0.2 +       // Usage patterns
  recencyBoost * 0.1            // Temporal relevance
);
```

---

## 🛡️ **SECURITY & PERFORMANCE**

### **Security Measures**
```javascript
// Rate limiting implementation
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per minute
const WINDOW_MS = 60 * 1000;

// CORS configuration
const allowedOrigins = [
  'https://innovation-expert-ai-sana.vercel.app',
  'http://localhost:3000'
];

// API key security
process.env.ANTHROPIC_API_KEY // Server-side only
process.env.NOTION_TOKEN      // Encrypted environment variables
```

### **Caching Strategy**
```javascript
// In-memory secure cache
class SecureCache {
  constructor(defaultTTL = 600000) { // 10 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }
  
  set(key, value, ttl) {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}
```

---

## 📈 **PERFORMANCE METRICS**

### **Response Times**
```
First Query (Cold Start):    ~19s
Cached Queries:              ~2s  
Scoring Generation:          ~3s
Deep Dive Q&A:              ~4s
Language Switching:         <100ms
```

### **Resource Usage**
```
Memory Usage:                ~50MB (base) + ~10MB per active session
CPU Usage:                   Minimal (serverless auto-scaling)
Database Queries:            Cached for 10 minutes
API Token Usage:             ~4000 tokens per scoring request
```

---

## 🔧 **DEVELOPMENT WORKFLOW**

### **Local Development**
```bash
# Environment setup
npm install
cp .env.local.example .env.local
# Configure ANTHROPIC_API_KEY and NOTION_TOKEN

# Development server
npm run dev          # Starts on http://localhost:3000

# Building and testing
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code quality check
```

### **Deployment Pipeline**
```
1. Development Branch: feature/*
2. Code Review & Testing
3. Merge to main branch  
4. Automatic Vercel deployment
5. Production URL update
6. Monitoring & validation
```

---

## 🔮 **EXTENSIBILITY POINTS**

### **Adding New Languages**
```javascript
// 1. Add translation files
public/locales/{lang}/common.json

// 2. Update Next.js config
module.exports = {
  i18n: {
    locales: ['it', 'en', 'es', 'fr'], // Add new language
    defaultLocale: 'it'
  }
}

// 3. Extend API prompt generation
function createScoringPrompt(data, answers, analysis, language) {
  const prompts = {
    'it': 'Sei un Innovation Expert...',
    'en': 'You are an Innovation Expert...',
    'es': 'Eres un Experto en Innovación...',
    'fr': 'Vous êtes un Expert en Innovation...'
  };
  return prompts[language] || prompts['it'];
}
```

### **Adding New Scoring Dimensions**
```javascript
// 1. Extend scoring algorithm
const dimensionWeights = {
  specificity: 0.35,
  alignment: 0.30,
  completeness: 0.20,
  actionability: 0.15,
  newDimension: 0.10  // Rebalance weights
};

// 2. Add validation questions
const validationQuestions = [
  // existing questions...
  {
    dimension: "New Dimension",
    question: "How do you plan to address this new aspect?"
  }
];
```

---

## 📚 **API DOCUMENTATION**

### **Core Endpoints**
```
POST /api/notion-query
├── Purpose: Query knowledge bases
├── Input: { query: string, filters: array }
├── Output: { results: array, totalResults: number }
└── Cache: 10 minutes

POST /api/claude-analysis  
├── Purpose: Generate AI analysis
├── Input: { query: string, notionData: object }
├── Output: { analysis: string, sections: object }
└── Cache: None (dynamic content)

POST /api/generate-scoring
├── Purpose: Generate multilingual scoring
├── Input: { analysisData: object, validationAnswers: object, language: string }
├── Output: { scoring: object, risks: array }
└── Cache: None (user-specific)

POST /api/claude-section-qa
├── Purpose: Deep-dive Q&A
├── Input: { question: string, section: string, context: object }
├── Output: { answer: string, relatedTopics: array }
└── Cache: 5 minutes
```

---

## 🎯 **MONITORING & ANALYTICS**

### **Key Metrics to Track**
```javascript
// Performance metrics
- API response times
- Cache hit rates  
- Error rates
- User session duration

// Business metrics
- Language usage distribution
- Feature adoption rates
- Scoring completion rates
- Re-submission frequency

// Technical metrics
- Memory usage patterns
- Database query efficiency
- Token consumption
- Deployment success rates
```

---

**🏆 Innovation Expert AI v1.2 - Complete Technical Architecture**  
**Status: Production Ready with Full Multilingual Support**