// ========== HELPER FUNCTIONS PER METODOLOGIA 3-STEP ==========

// Language-specific instructions function
function getLanguageInstructions(locale = 'it') {
  const instructions = {
    en: {
      expertRole: "You are an Innovation Expert with access to a proprietary methodology based on 200+ verified case histories.",
      analysisLabel: "ANALYSIS BASED ON NOTION DATABASE",
      userQuery: "USER QUERY",
      step1Label: "STEP 1: STRATEGIC VERTICALS IDENTIFIED",
      step2Label: "STEP 2: MOST RELEVANT CASE HISTORIES",
      step3Label: "STEP 3: CONFIDENCE SCORE",
      structuredOutputLabel: "INSTRUCTIONS FOR STRUCTURED OUTPUT",
      part1Label: "PART 1: STRATEGIC INSIGHTS",
      part2Label: "PART 2: OPERATIONAL INSIGHTS",
      part3Label: "PART 3: VALIDATION QUESTIONS",
      generateAnalysis: "Generate a professional structured analysis in 9 SECTIONS:",
      strategicVerticals: "🎯 STRATEGIC VERTICALS IDENTIFIED",
      strategicPatterns: "📊 STRATEGIC PATTERNS BY DIMENSION",
      caseStudies: "📚 REFERENCE CASE STUDIES",
      operationalInsights: "Generate actionable insights for THESE 5 operational dimensions:",
      jtbdTrends: "Jobs-to-be-Done & Market Trends",
      competitiveCanvas: "Competitive Positioning Canvas",
      techValidation: "Technology Adoption & Validation",
      processMetrics: "Process & Metrics",
      partnershipActivation: "Partnership Activation",
      validationQuestionsIntro: "IMPORTANT: Always generate 5 validation questions, one for each operational section (4-8).",
      criticalRules: "CRITICAL RULES:",
      useOnlyNotion: "✓ USE ONLY information from Notion databases",
      maintainAnonymity: "✓ MAINTAIN complete anonymity (Case #X, Vertical #Y)",
      alwaysOutput: "✓ Output ALWAYS in 9 sections + validation questions",
      actionablePoints: "✓ Each operational section must have 3-5 actionable points",
      noScoring: "✓ DO NOT generate numerical scoring at this stage",
      analyzing: "analyzing"
    },
    it: {
      expertRole: "Sei un Innovation Expert con accesso a una metodologia proprietaria basata su 200+ case histories verificate.",
      analysisLabel: "ANALISI BASATA SU DATABASE NOTION",
      userQuery: "QUERY UTENTE",
      step1Label: "STEP 1: VERTICALI STRATEGICHE IDENTIFICATE",
      step2Label: "STEP 2: CASE HISTORIES PIÙ RILEVANTI",
      step3Label: "STEP 3: CONFIDENCE SCORE",
      structuredOutputLabel: "ISTRUZIONI PER OUTPUT STRUTTURATO",
      part1Label: "PARTE 1: STRATEGIC INSIGHTS",
      part2Label: "PARTE 2: OPERATIONAL INSIGHTS",
      part3Label: "PARTE 3: DOMANDE DI VALIDAZIONE",
      generateAnalysis: "Genera un'analisi professionale strutturata in 9 SEZIONI:",
      strategicVerticals: "🎯 VERTICALI STRATEGICHE IDENTIFICATE",
      strategicPatterns: "📊 PATTERN STRATEGICI PER DIMENSIONE",
      caseStudies: "📚 CASE STUDIES DI RIFERIMENTO",
      operationalInsights: "Genera insights actionable per QUESTE 5 dimensioni operative:",
      jtbdTrends: "Jobs-to-be-Done & Market Trends",
      competitiveCanvas: "Competitive Positioning Canvas",
      techValidation: "Technology Adoption & Validation",
      processMetrics: "Process & Metrics",
      partnershipActivation: "Partnership Activation",
      validationQuestionsIntro: "IMPORTANTE: Genera SEMPRE 5 domande di validazione, una per ogni sezione operational (4-8).",
      criticalRules: "REGOLE CRITICHE:",
      useOnlyNotion: "✓ USA SOLO informazioni dai database Notion",
      maintainAnonymity: "✓ MANTIENI anonimato totale (Case #X, Vertical #Y)",
      alwaysOutput: "✓ Output SEMPRE in 9 sezioni + validation questions",
      actionablePoints: "✓ Ogni sezione operational deve avere 3-5 punti actionable",
      noScoring: "✓ NON generare scoring numerico in questa fase",
      analyzing: "analizzando"
    }
  };
  
  return instructions[locale] || instructions.it;
}

// Function to build prompt sections to avoid complex template literals
function buildContextPrompt(languageInstructions, optimizedData, methodology, query, notionData, locale) {
  const isEnglish = locale === 'en';
  
  // Build sections separately
  const header = `${languageInstructions.expertRole}\n\n=== ${languageInstructions.analysisLabel} (${optimizedData.totalScanned || 0} items ${languageInstructions.analyzing}) ===\n\n${languageInstructions.userQuery}: "${query}"`;
  
  const step1 = `=== ${languageInstructions.step1Label} ===\n${formatVerticals(optimizedData.verticals, locale)}\n\n${isEnglish ? 'Framework Extracted from Verticals' : 'Framework Estratto dai Verticali'}:\n- Jobs-to-be-Done: ${optimizedData.verticals.framework?.jtds?.slice(0, 3).join('; ') || (isEnglish ? 'Being identified' : 'In fase di identificazione')}\n- Business Models: ${optimizedData.verticals.framework?.businessModels?.slice(0, 3).join('; ') || (isEnglish ? 'Being analyzed' : 'In fase di analisi')}\n- Technology Patterns: ${optimizedData.verticals.framework?.technologies?.slice(0, 3).join('; ') || (isEnglish ? 'Being mapped' : 'In fase di mappatura')}\n- Market Strategies: ${optimizedData.verticals.framework?.strategies?.slice(0, 3).join('; ') || (isEnglish ? 'Being defined' : 'In fase di definizione')}`;
  
  const step2 = `=== ${languageInstructions.step2Label} ===\n${formatCaseHistories(optimizedData.cases.top5, locale)}\n\n${isEnglish ? 'Identified Convergence Patterns' : 'Pattern di Convergenza Identificati'}:\n${generateConvergenceFramework(methodology, locale)}`;
  
  const step3 = `=== ${languageInstructions.step3Label} ===\n${isEnglish ? 'Analysis Reliability' : 'Affidabilità Analisi'}: ${optimizedData.confidenceScore || 'N/A'}%\n${isEnglish ? 'Processing Time' : 'Tempo Processing'}: ${optimizedData.processingTime || 'N/A'}`;
  
  const instructions = buildInstructionsSection(languageInstructions, locale);
  
  const footer = `${languageInstructions.criticalRules}\n${languageInstructions.useOnlyNotion}\n${languageInstructions.maintainAnonymity}\n${languageInstructions.alwaysOutput}\n${languageInstructions.actionablePoints}\n${languageInstructions.noScoring}\n\n${isEnglish ? 'Remember: you are analyzing' : 'Ricorda: stai analizzando'} "${query}" ${isEnglish ? 'based on real data from' : 'basandoti su dati reali da'} ${notionData.totalScanned || 0} ${isEnglish ? 'database elements' : 'elementi dei database'}.`;
  
  return [header, step1, step2, step3, instructions, footer].join('\n\n');
}

// Separate function for instructions section
function buildInstructionsSection(languageInstructions, locale) {
  const isEnglish = locale === 'en';
  
  const part1 = `${languageInstructions.part1Label}\n\n1. ${languageInstructions.strategicVerticals}\n   - ${isEnglish ? 'TOP 3 verticals with % match' : 'TOP 3 verticali con % match'}\n   - ${isEnglish ? '50-80 words description per vertical' : 'Descrizione 50-80 parole per verticale'}\n   - ${isEnglish ? 'Format: "Vertical Framework #X (Sector)"' : 'Formato: "Vertical Framework #X (Sector)"'}\n\n2. ${languageInstructions.strategicPatterns}\n   ${isEnglish ? 'For EACH of the 6 dimensions, extract 3 insights (1 per TOP 3 vertical):' : 'Per OGNI delle 6 dimensioni, estrai 3 insights (1 per verticale TOP 3):'}\n   • Jobs-to-be-Done Alignment\n   • Technology Adoption & Validation\n   • Business Model Viability\n   • Market Type Strategy Execution\n   • Competing Factors Strength\n   • Target Synergies Potential\n\n3. ${languageInstructions.caseStudies}\n   - ${isEnglish ? 'TOP 3 ANONYMOUS cases with similarity %' : 'TOP 3 cases ANONIMI con similarity %'}\n   - ${isEnglish ? 'Format: "Case Study #X (Sector: Y)"' : 'Formato: "Case Study #X (Sector: Y)"'}\n   - ${isEnglish ? 'Key learning per each case' : 'Key learning per ogni caso'}`;
  
  const part2 = `${languageInstructions.part2Label} (${isEnglish ? 'Sections 4-8' : 'Sezioni 4-8'})\n${languageInstructions.operationalInsights}\n\n4. ${languageInstructions.jtbdTrends}\n   - ${isEnglish ? '3-5 bullet points on specific jobs identified and relevant market trends' : '3-5 bullet points su jobs specifici identificati e trend di mercato rilevanti'}\n   - ${isEnglish ? 'Focus on validation metrics and problem urgency' : 'Focus su metriche di validazione e urgenza del problema'}\n\n5. ${languageInstructions.competitiveCanvas}\n   - ${isEnglish ? '3-5 bullet points on competitive positioning and differentiation' : '3-5 bullet points su posizionamento competitivo e differenziazione'}\n   - ${isEnglish ? 'Analysis of direct and indirect competitors from the vertical' : 'Analisi dei competitor diretti e indiretti dal verticale'}\n\n6. ${languageInstructions.techValidation}\n   - ${isEnglish ? '3-5 bullet points on technology stack and validation approach' : '3-5 bullet points su stack tecnologico e approccio di validazione'}\n   - ${isEnglish ? 'Technical best practices from the identified vertical' : 'Best practices tecniche dal verticale identificato'}\n\n7. ${languageInstructions.processMetrics}\n   - ${isEnglish ? '3-5 bullet points on operational processes and key KPIs' : '3-5 bullet points su processi operativi e KPI chiave'}\n   - ${isEnglish ? 'Success metrics based on industry benchmarks' : 'Metriche di successo basate su benchmark del settore'}\n\n8. ${languageInstructions.partnershipActivation}\n   - ${isEnglish ? '3-5 bullet points on partnership strategies and channels' : '3-5 bullet points su strategie di partnership e canali'}\n   - ${isEnglish ? 'Types of strategic partners for the vertical' : 'Tipologie di partner strategici per il verticale'}`;
  
  const part3 = `${isEnglish ? 'IMPORTANT: Each section must contain SPECIFIC insights extracted from case histories and identified verticals, NOT generic advice.' : 'IMPORTANTE: Ogni sezione deve contenere insights SPECIFICI estratti dalle case histories e verticali identificati, NON consigli generici.'}\n\n${languageInstructions.part3Label}\n${languageInstructions.validationQuestionsIntro}\n${isEnglish ? 'The 5 questions must correspond EXACTLY to:' : 'Le 5 domande devono corrispondere ESATTAMENTE a:'}\n1. Jobs-to-be-Done & Market Trends\n2. Competitive Positioning Canvas\n3. Technology Adoption & Validation\n4. Process & Metrics\n5. Partnership Activation\n\n${isEnglish ? 'Question format:' : 'Formato domande:'}\n"[${isEnglish ? 'SECTION NAME' : 'NOME SEZIONE'}]: [${isEnglish ? 'Specific question based on analysis' : 'Domanda specifica basata sull\'analisi'}]?"\n\n${isEnglish ? 'Always provide 2 clear response options.' : 'Fornisci sempre 2 opzioni di risposta chiare.'}`;
  
  return `=== ${languageInstructions.structuredOutputLabel} ===\n\n${languageInstructions.generateAnalysis}\n\n${part1}\n\n${part2}\n\n${part3}`;
}

function formatVerticals(verticals, locale = 'it') {
  if (!verticals || !verticals.top3) return locale === 'en' ? 'No vertical identified' : 'Nessun verticale identificato';
  
  return verticals.top3.map((v, idx) => {
    const jtds = v.properties?.JTDs || v.properties?.['Jobs to be Done'] || v.properties?.['Jobs-to-be-Done'] || 'N/A';
    const businessModel = v.properties?.['Business Model'] || v.properties?.['Business Model - Best Practice'] || 'N/A';
    const tech = v.properties?.Technologies || v.properties?.['Technology Adoption & Validation'] || 'N/A';
    
    // 🔐 ANONIMIZZAZIONE
    const sector = v.properties?.Vertical || v.properties?.Industry || v.properties?.Classification || 'Innovation';
    const anonymizedTitle = `Vertical Framework #${idx + 1} (${sector})`;
    
    return `
${idx + 1}. ${anonymizedTitle} (${locale === 'en' ? 'Relevance' : 'Relevance'}: ${v.relevanceScore?.toFixed(1) || 0}%)
   • ${locale === 'en' ? 'JTDs' : 'JTDs'}: ${jtds.substring(0, 200)}${jtds.length > 200 ? '...' : ''}
   • ${locale === 'en' ? 'Business Model' : 'Business Model'}: ${businessModel.substring(0, 150)}${businessModel.length > 150 ? '...' : ''}
   • ${locale === 'en' ? 'Technologies' : 'Technologies'}: ${tech.substring(0, 100)}${tech.length > 100 ? '...' : ''}`;
  }).join('\n');
}

function formatCaseHistories(cases, locale = 'it') {
  if (!cases || cases.length === 0) return locale === 'en' ? 'No case history found' : 'Nessun case history trovato';
  
  return cases.slice(0, 5).map((c, idx) => {
    const description = c.properties?.Description || c.content || 'N/A';
    const impact = c.properties?.Impact || 'N/A';
    
    // 🔐 ANONIMIZZAZIONE
    const anonymizedTitle = `Case Study #${idx + 1} (${c.properties?.Classification || 'Innovation Case'})`;
    
    return `
${idx + 1}. ${anonymizedTitle} (${locale === 'en' ? 'Similarity' : 'Similarity'}: ${c.relevanceScore?.toFixed(1)}%)
   • ${locale === 'en' ? 'Description' : 'Description'}: ${description.substring(0, 150)}...
   • ${locale === 'en' ? 'Impact' : 'Impact'}: ${impact.substring(0, 100)}${impact.length > 100 ? '...' : ''}
   • ${locale === 'en' ? 'Sector' : 'Sector'}: ${c.properties?.Vertical || c.properties?.Industry || 'Tech Innovation'}`;
  }).join('\n');
}

function generateConvergenceFramework(methodology, locale = 'it') {
  const insights = methodology?.step3_insights || {};
  
  return locale === 'en' ? `
- Converging Technologies: ${insights.technologies?.join(', ') || 'To be identified based on patterns'}
- Recurring Business Models: ${insights.businessModels?.join(', ') || 'To be identified from cases'}
- Common Strategies: ${insights.strategies?.join(', ') || 'To be extracted from analysis'}` : `
- Tecnologie Convergenti: ${insights.technologies?.join(', ') || 'Da identificare basandosi sui pattern'}
- Business Models Ricorrenti: ${insights.businessModels?.join(', ') || 'Da identificare dai casi'}
- Strategie Comuni: ${insights.strategies?.join(', ') || 'Da estrarre dall\'analisi'}`;
}

// ========== FINE HELPER FUNCTIONS ==========

// ========== CONTEXT OPTIMIZATION FUNCTION ==========

function optimizeContextForClaude(notionData) {
  // Obiettivo: mantenere sotto 10,000 caratteri (circa 2,500 tokens)
  const maxChars = 10000;
  
  // Estrai i dati essenziali dalla metodologia
  const methodology = notionData.methodology || {};
  const verticals = methodology.step1_verticals || {};
  const cases = methodology.step2_cases || {};
  
  // Prepara oggetto ottimizzato con priorità
  let optimized = {
    totalScanned: notionData.totalScanned || 0,
    processingTime: notionData.processingTime || 'N/A',
    confidenceScore: notionData.confidenceScore || 0,
    verticals: {
      top3: [],
      framework: {}
    },
    cases: {
      top5: []
    },
    convergence: methodology.step3_insights || {}
  };
  
  // PRIORITÀ 1: Verticali (manteniamo 3 ma con meno dettaglio)
  if (verticals.top3 && verticals.top3.length > 0) {
    optimized.verticals.top3 = verticals.top3.slice(0, 3).map(v => ({
      title: v.title || 'Untitled',
      relevanceScore: v.relevanceScore || 0,
      properties: {
        JTDs: (v.properties?.JTDs || v.properties?.['Jobs to be Done'] || '').substring(0, 150),
        BusinessModel: (v.properties?.['Business Model'] || '').substring(0, 100),
        Technologies: (v.properties?.Technologies || '').substring(0, 80)
      }
    }));
    
    // Framework con più dettaglio
    optimized.verticals.framework = {
      jtds: (verticals.framework?.jtds || []).slice(0, 3),
      businessModels: (verticals.framework?.businessModels || []).slice(0, 3),
      technologies: (verticals.framework?.technologies || []).slice(0, 4),
      strategies: (verticals.framework?.strategies || []).slice(0, 3)
    };
  }
  
  // PRIORITÀ 2: Case Studies (manteniamo 4 invece di 3)
  if (cases.top5 && cases.top5.length > 0) {
    optimized.cases.top5 = cases.top5.slice(0, 4).map(c => ({
      title: c.title || 'Untitled',
      relevanceScore: c.relevanceScore || 0,
      properties: {
        Description: (c.properties?.Description || '').substring(0, 120),
        Impact: (c.properties?.Impact || '').substring(0, 80),
        Tech: (c.properties?.Technologies || '').substring(0, 60)
      }
    }));
  }
  
  // Calcola dimensione approssimativa
  const currentSize = JSON.stringify(optimized).length;
  console.log(`📊 Context size: ${currentSize} chars (target: <${maxChars})`);
  
  // Se ancora troppo grande, riduci progressivamente
  if (currentSize > maxChars) {
    console.log('⚠️ Context ancora grande, applico riduzione moderata...');
    
    // Prima riduzione: cases a 3
    optimized.cases.top5 = optimized.cases.top5.slice(0, 3);
    
    // Seconda riduzione: abbrevia descriptions
    if (JSON.stringify(optimized).length > maxChars) {
      optimized.cases.top5 = optimized.cases.top5.map(c => ({
        ...c,
        properties: {
          Description: c.properties.Description.substring(0, 80),
          Impact: c.properties.Impact.substring(0, 50)
        }
      }));
    }
    
    const finalSize = JSON.stringify(optimized).length;
    console.log(`✅ Context finale: ${finalSize} chars`);
  }
  
  return optimized;
}

// ========== FINE CONTEXT OPTIMIZATION ==========

// 🔒 F.2.1 Security: Rate Limiting Storage
const rateLimitMap = new Map();

export default async function handler(req, res) {
  // 🔒 F.2.1 Security: CORS Headers + Domain Restriction
  const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001']
    : ['https://innovation-expert-ai-sana.vercel.app'];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🔒 F.2.1 Security: Rate Limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const rateLimitKey = `rate_limit_${clientIP}`;
  const maxRequests = process.env.NODE_ENV === 'development' ? 200 : 100;
  const timeWindow = 60 * 60 * 1000;
  
  const now = Date.now();
  const clientRequests = rateLimitMap.get(rateLimitKey) || [];
  const recentRequests = clientRequests.filter(time => now - time < timeWindow);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((recentRequests[0] + timeWindow - now) / 1000)
    });
  }
  
  recentRequests.push(now);
  rateLimitMap.set(rateLimitKey, recentRequests);

  try {
    const { query, locale, notionData, filters } = req.body;

    // Prepara i dati dalla metodologia 3-step
    const methodology = notionData.methodology || {};
    const verticals = methodology.step1_verticals || {};
    const cases = methodology.step2_cases || {};
    const insights = methodology.step3_insights || {};

    // 🔧 OTTIMIZZAZIONE CONTEXT PER CLAUDE
    const optimizedData = optimizeContextForClaude(notionData);
    console.log('🎯 Dati ottimizzati per Claude:', {
      verticals: optimizedData.verticals.top3.length,
      cases: optimizedData.cases.top5.length,
      size: JSON.stringify(optimizedData).length + ' chars'
    });
    
    // Extract language instructions to avoid complex template literals
    const languageInstructions = getLanguageInstructions(locale);

    // Use new function to build context prompt - avoids complex template literal issues
    const contextPrompt = buildContextPrompt(languageInstructions, optimizedData, methodology, query, notionData, locale);

    // Call Claude API with correct headers
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          { role: "user", content: contextPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.content[0].text;
    
    // 🔍 DEBUG: Verifica output Claude
    console.log('📊 CLAUDE RAW RESPONSE LENGTH:', analysis.length);
    console.log('🔍 CERCA PARTE 2:', analysis.includes('PARTE 2'));
    console.log('📝 ULTIMI 500 CARATTERI:', analysis.substring(analysis.length - 500));

    // FUNZIONE extractQuestions SPOSTATA QUI DENTRO
    function extractQuestions(text) {
  const questions = [];
  
  // Prima prova a trovare la sezione PARTE 3
  const parte3Match = text.match(/PARTE 3[:\s]*DOMANDE DI VALIDAZIONE([\s\S]*?)$/i);
  let searchText = parte3Match ? parte3Match[1] : text;
  
  // Pulisci il testo da contenuti extra
  searchText = searchText.replace(/---+/g, '').trim();
  
  // Array di marker per le domande
  const questionMarkers = [
    'JOBS-TO-BE-DONE & MARKET TRENDS',
    'COMPETITIVE POSITIONING CANVAS',
    'TECHNOLOGY ADOPTION & VALIDATION',
    'PROCESS & METRICS',
    'PARTNERSHIP ACTIVATION'
  ];
  
  // Cerca ogni domanda con pattern più specifico
  questionMarkers.forEach((marker, index) => {
    // Pattern più rigido: cerca il marker seguito da : e poi la domanda fino a ? o al prossimo marker
    const pattern = new RegExp(
      `\\*\\*${marker}[\\s\\S]{0,20}?:\\*\\*\\s*([^*]+(?:\\?|$))`,
      'i'
    );
    
    const match = searchText.match(pattern);
    
    if (match && match[1]) {
      // Pulisci la domanda
      let questionText = match[1]
        .replace(/\*\*/g, '')
        .replace(/###/g, '')
        .replace(/\n{2,}/g, ' ')
        .trim();
      
      // Assicurati che termini con ?
      if (!questionText.endsWith('?')) {
        const questionEndIndex = questionText.indexOf('?');
        if (questionEndIndex > 0) {
          questionText = questionText.substring(0, questionEndIndex + 1);
        }
      }
      
      // Limita la lunghezza a max 300 caratteri per sicurezza
      if (questionText.length > 300) {
        questionText = questionText.substring(0, 297) + '...?';
      }
      
      questions.push({
        dimension: marker.split(' ').map(w => 
          w.charAt(0) + w.slice(1).toLowerCase()
        ).join(' '),
        question: questionText,
        options: [] // Non più usato con textarea
      });
    }
  });
  
  // Se non abbiamo trovato abbastanza domande, aggiungi delle default
  const defaultQuestions = [
    { dimension: "Jobs-to-be-Done & Market Trends", question: "Quali sono i 3 principali problemi specifici che stai risolvendo e quali trend di mercato stai cavalcando?" },
    { dimension: "Competitive Positioning Canvas", question: "Quali sono i tuoi 2-3 differenziatori core rispetto ai competitor diretti e indiretti?" },
    { dimension: "Technology Adoption & Validation", question: "Come stai strutturando la tua architettura tecnologica e quale validazione tecnica hai completato?" },
    { dimension: "Process & Metrics", question: "Quali sono i tuoi KPI principali e come misuri l'efficienza dei processi operativi?" },
    { dimension: "Partnership Activation", question: "Descrivi la tua strategia di partnership e quali alleanze strategiche stai sviluppando?" }
  ];
  
  // Aggiungi domande mancanti dalle default
  defaultQuestions.forEach((defaultQ, index) => {
    if (!questions[index]) {
      questions[index] = defaultQ;
    }
  });
  
  return questions.slice(0, 5); // Cambiato da 6 a 5
}

    // PARSING DELLE 9 SEZIONI
    const extractSection = (text, marker) => {
  // Pattern più preciso per fermarsi alla prossima sezione numerata (4-8) o alla PARTE 3
  const regex = new RegExp(
    `${marker}[\\s\\S]*?(?=\\n\\n?(?:4|5|6|7|8)\\.|\\n\\n?###\\s*(?:4|5|6|7|8)\\.|PARTE 3|$)`, 
    'i'
  );
  const match = text.match(regex);
  if (!match) return '';
  
  // Rimuovi il marker e pulisci il contenuto
  let content = match[0].replace(marker, '').trim();
  
  // Rimuovi eventuali numeri di sezione alla fine
  content = content.replace(/\n\n?(?:5|6|7|8)\.\s*.*$/s, '');
  
  return content;
};

    // CHIAMA extractQuestions PRIMA di usarla in parsedSections
    const extractedQuestions = extractQuestions(analysis);

    // Estrai le 8 sezioni strutturate V2
const parsedSections = {
  // PARTE 1: Strategic Insights (3 sezioni)
  verticals: extractSection(analysis, 'VERTICALI STRATEGICHE IDENTIFICATE') || 
             extractSection(analysis, '1. 🎯 VERTICALI STRATEGICHE') || '',
  
  patterns: extractSection(analysis, 'PATTERN STRATEGICI PER DIMENSIONE') || 
            extractSection(analysis, '2. 📊 PATTERN STRATEGICI') || '',
  
  cases: extractSection(analysis, 'CASE STUDIES DI RIFERIMENTO') || 
         extractSection(analysis, '3. 📚 CASE STUDIES') || '',
  
  // PARTE 2: Operational Insights (5 sezioni) - NOMI ESATTI COME NELL'OUTPUT
  jtbdTrends: extractSection(analysis, '4. Jobs-to-be-Done & Market Trends') || 
              extractSection(analysis, 'Jobs-to-be-Done & Market Trends') || '',
  
  competitiveCanvas: extractSection(analysis, '5. Competitive Positioning Canvas') || 
                     extractSection(analysis, 'Competitive Positioning Canvas') || '',
  
  techValidation: extractSection(analysis, '6. Technology Adoption & Validation') || 
                  extractSection(analysis, 'Technology Adoption & Validation') || '',
  
  processMetrics: extractSection(analysis, '7. Process & Metrics') || 
                  extractSection(analysis, 'Process & Metrics') || '',
  
  partnership: extractSection(analysis, '8. Partnership Activation') || 
               extractSection(analysis, 'Partnership Activation') || '',
  
  // PARTE 3: Validation Questions
  validationQuestions: extractedQuestions || []
};

    // DEBUG: Verifica parsing V2 (8 sezioni)
    console.log('✅ Sezioni parsate V2:', {
      // PARTE 1: Strategic (3 sezioni)
      verticals: parsedSections.verticals ? '✓' : '✗',
      patterns: parsedSections.patterns ? '✓' : '✗',
      caseStudies: parsedSections.caseStudies ? '✓' : '✗',
      // PARTE 2: Operational (5 sezioni)
      jtbdTrends: parsedSections.jtbdTrends ? '✓' : '✗',
      competitiveCanvas: parsedSections.competitiveCanvas ? '✓' : '✗',
      techValidation: parsedSections.techValidation ? '✓' : '✗',
      processMetrics: parsedSections.processMetrics ? '✓' : '✗',
      partnership: parsedSections.partnership ? '✓' : '✗',
      // PARTE 3: Validation
      validationQuestions: `${parsedSections.validationQuestions.length}/6`
    });

    // Usa il nuovo parsing a 9 sezioni
    const parsedAnalysis = parsedSections;
    if (!parsedAnalysis || Object.keys(parsedAnalysis).length === 0) {
      console.warn('⚠️ Could not parse structured response, returning raw analysis');
    }
    
    // Prepare sources information
    const sources = [
      { 
        title: `Database 1 - ${Math.floor(notionData.totalResults * 0.4)} entries`, 
        id: process.env.NOTION_DATABASE_1 
      },
      { 
        title: `Database 2 - ${Math.floor(notionData.totalResults * 0.35)} entries`, 
        id: process.env.NOTION_DATABASE_2 
      },
      { 
        title: `Database 3 - ${Math.floor(notionData.totalResults * 0.25)} entries`, 
        id: process.env.NOTION_DATABASE_3 
      }
    ];
// Cache headers per Vercel
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({
      analysis,
      parsedSections: parsedAnalysis,
      sources,
      notionResultsUsed: notionData.results?.length || 0,
      bestPracticesApplied: notionData.bestPractices?.length || 0,
      metadata: {
        structured: parsedAnalysis !== null,
        sectionsFound: parsedAnalysis ? Object.keys(parsedAnalysis).filter(k => parsedAnalysis[k]).length : 0
      }
    });

  } catch (error) {
    console.error('Claude Analysis Error:', error);
    
    // User-friendly error messages
    let userMessage = 'Errore durante la generazione dell\'analisi strategica.';
    let statusCode = 500;
    
    if (error.message && error.message.includes('413')) {
      userMessage = 'Il testo da analizzare è troppo lungo. Riduci la descrizione a massimo 500 caratteri e riprova.';
      statusCode = 413;
    } else if (error.message && error.message.includes('timeout')) {
      userMessage = 'L\'intelligenza artificiale sta elaborando... L\'analisi potrebbe richiedere fino a 30 secondi. Riprova.';
      statusCode = 504;
    } else if (error.message && error.message.includes('401')) {
      userMessage = 'Errore di configurazione AI. Il sistema è temporaneamente non disponibile.';
      statusCode = 401;
    } else if (error.message && error.message.includes('429')) {
      userMessage = 'Sistema temporaneamente sovraccarico. Attendi 1 minuto prima di riprovare.';
      statusCode = 429;
    } else if (error.message && error.message.includes('Claude')) {
      userMessage = 'Il servizio di analisi AI è momentaneamente non disponibile. Riprova tra qualche minuto.';
      statusCode = 503;
    } else if (error.message && error.message.includes('parsing')) {
      userMessage = 'Errore nell\'elaborazione della risposta. Prova a riformulare la tua richiesta.';
      statusCode = 422;
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      technicalDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}