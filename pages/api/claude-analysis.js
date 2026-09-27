// ========== HELPER FUNCTIONS PER METODOLOGIA 3-STEP ==========
const { SecureLogger } = require('../../utils/secureLogger');
const { CLAUDE_MODEL } = require('../../utils/claudeConfig');

// Language-specific instructions function
function getLanguageInstructions(locale = 'it') {
  const instructions = {
    en: {
      expertRole: "You are an Innovation Expert applying a proprietary evaluation methodology built on a database of case histories and market verticals. For this query the database returned only the relevant items listed in STEPS 1-2.",
      analysisLabel: "ANALYSIS BASED ON PROPRIETARY METHODOLOGY",
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
      useOnlyNotion: "✓ USE methodology with consolidated evaluation frameworks",
      maintainAnonymity: "✓ MAINTAIN complete anonymity (Case #X, Vertical #Y)",
      alwaysOutput: "✓ Output ALWAYS in 9 sections + validation questions",
      actionablePoints: "✓ Each operational section must have 3-5 actionable points",
      noScoring: "✓ DO NOT generate numerical scoring at this stage",
      generalKnowledgeTag: "[general knowledge]"
    },
    it: {
      expertRole: "Sei un Innovation Expert che applica una metodologia proprietaria di valutazione basata su un database di case history e verticali di mercato. Per questa query il database ha restituito solo gli elementi pertinenti riportati negli STEP 1-2.",
      analysisLabel: "ANALISI BASATA SU METODOLOGIA PROPRIETARIA",
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
      useOnlyNotion: "✓ USA metodologia con framework di valutazione consolidati",
      maintainAnonymity: "✓ MANTIENI anonimato totale (Case #X, Vertical #Y)",
      alwaysOutput: "✓ Output SEMPRE in 9 sezioni + validation questions",
      actionablePoints: "✓ Ogni sezione operational deve avere 3-5 punti actionable",
      noScoring: "✓ NON generare scoring numerico in questa fase",
      generalKnowledgeTag: "[conoscenza generale]"
    }
  };
  
  return instructions[locale] || instructions.it;
}

// Function to build prompt sections to avoid complex template literals
function buildContextPrompt(languageInstructions, optimizedData, methodology, query, notionData, locale) {
  const isEnglish = locale === 'en';
  
  // Build sections separately
  const header = `${languageInstructions.expertRole}\n\n=== ${languageInstructions.analysisLabel} ===\n\n${languageInstructions.userQuery}: "${query}"`;

  const step1 = `=== ${languageInstructions.step1Label} ===\n${formatVerticals(optimizedData.verticals, locale)}`;

  const convergence = generateConvergenceFramework(methodology, locale);
  const step2 = `=== ${languageInstructions.step2Label} ===\n${formatCaseHistories(optimizedData.cases, locale)}${convergence ? `\n\n${isEnglish ? 'Identified Convergence Patterns' : 'Pattern di Convergenza Identificati'}:\n${convergence}` : ''}`;

  const step3 = `=== ${languageInstructions.step3Label} ===\n${isEnglish ? 'Items scanned in the database' : 'Elementi esaminati nel database'}: ${optimizedData.totalScanned}\n${isEnglish ? 'Matching reliability' : 'Affidabilità del matching'}: ${optimizedData.confidenceScore}%\n${isEnglish ? 'Processing Time' : 'Tempo Processing'}: ${optimizedData.processingTime}`;

  const coverage = buildCoverageRules(optimizedData, languageInstructions, locale);

  const instructions = buildInstructionsSection(languageInstructions, locale);

  const footer = `${languageInstructions.criticalRules}\n${languageInstructions.useOnlyNotion}\n${languageInstructions.maintainAnonymity}\n${languageInstructions.alwaysOutput}\n${languageInstructions.actionablePoints}\n${languageInstructions.noScoring}\n\n${isEnglish ? 'Remember: you are analyzing' : 'Ricorda: stai analizzando'} "${query}" ${isEnglish ? 'using proprietary methodology with consolidated evaluation frameworks.' : 'utilizzando metodologia proprietaria con framework di valutazione consolidati.'}`;

  return [header, step1, step2, step3, coverage, instructions, footer].join('\n\n');
}

// Regole di fondatezza: Claude deve citare solo i dati ricevuti e segnalare
// quando integra con conoscenza generale (la UI mostra già la copertura dati).
function buildCoverageRules(optimizedData, languageInstructions, locale) {
  const isEnglish = locale === 'en';
  const tag = languageInstructions.generalKnowledgeTag;
  const nVerticals = optimizedData.verticals.length;
  const nCases = optimizedData.cases.length;

  return isEnglish ? `=== DATA COVERAGE AND GROUNDING RULES ===
For this query the database returned ${nVerticals} relevant verticals (STEP 1) and ${nCases} relevant case histories (STEP 2).
✓ Cite as "Vertical Framework #N" and "Case Study #N" ONLY the items listed in STEPS 1 and 2: do not invent others, and do not attribute to the database any percentages, case counts or data that do not appear above.
✓ When the database data is not enough for a point, complement it with your general industry knowledge and mark that point with ${tag}.
✓ If a STEP is empty, open the corresponding section with a single line saying so (e.g. "No relevant case history in the database for this query") and continue with general knowledge marked ${tag}.
✓ The interface already shows the user the data coverage: DO NOT add preambles, methodological notes or disclaimers at the start; begin directly with section 1.` : `=== COPERTURA DATI E REGOLE DI FONDATEZZA ===
Per questa query il database ha restituito ${nVerticals} verticali pertinenti (STEP 1) e ${nCases} case history pertinenti (STEP 2).
✓ Cita come "Vertical Framework #N" e "Case Study #N" SOLO gli elementi elencati negli STEP 1 e 2: non inventarne altri, e non attribuire al database percentuali, numeri di casi o dati che non compaiono sopra.
✓ Quando i dati del database non bastano per un punto, integra con la tua conoscenza generale di settore e segnala quel punto con ${tag}.
✓ Se uno STEP è vuoto, apri la sezione corrispondente con una sola riga che lo dichiara (es. "Nessuna case history pertinente nel database per questa query") e prosegui con conoscenza generale segnalata con ${tag}.
✓ L'interfaccia mostra già all'utente la copertura dei dati: NON aggiungere premesse, note metodologiche o disclaimer iniziali; inizia direttamente con la sezione 1.`;
}

// Separate function for instructions section
function buildInstructionsSection(languageInstructions, locale) {
  const isEnglish = locale === 'en';
  
  const part1 = `${languageInstructions.part1Label}\n\n1. ${languageInstructions.strategicVerticals}\n   - ${isEnglish ? 'Up to 3 verticals, ONLY those in STEP 1, with their Relevance as % match' : 'Fino a 3 verticali, SOLO quelli dello STEP 1, con il loro Relevance come % match'}\n   - ${isEnglish ? '50-80 words description per vertical' : 'Descrizione 50-80 parole per verticale'}\n   - ${isEnglish ? 'Format: "Vertical Framework #X (Sector)"' : 'Formato: "Vertical Framework #X (Sector)"'}\n\n2. ${languageInstructions.strategicPatterns}\n   ${isEnglish ? `For EACH of the 6 dimensions, extract 3 insights (1 per vertical in STEP 1; if there are fewer than 3 verticals, complete with general knowledge marked ${languageInstructions.generalKnowledgeTag}):` : `Per OGNI delle 6 dimensioni, estrai 3 insights (1 per ciascun verticale dello STEP 1; se i verticali sono meno di 3, completa con conoscenza generale segnalata con ${languageInstructions.generalKnowledgeTag}):`}\n   • Jobs-to-be-Done Alignment\n   • Technology Adoption & Validation\n   • Business Model Viability\n   • Market Type Strategy Execution\n   • Competing Factors Strength\n   • Target Synergies Potential\n\n3. ${languageInstructions.caseStudies}\n   - ${isEnglish ? 'Up to 3 ANONYMOUS cases, ONLY those in STEP 2' : 'Fino a 3 cases ANONIMI, SOLO quelli dello STEP 2'}\n   - ${isEnglish ? 'Format: "Case Study #X (Sector: Y)"' : 'Formato: "Case Study #X (Sector: Y)"'}\n   - ${isEnglish ? 'Key learning per each case' : 'Key learning per ogni caso'}`;
  
  const part2 = `${languageInstructions.part2Label} (${isEnglish ? 'Sections 4-8' : 'Sezioni 4-8'})\n${languageInstructions.operationalInsights}\n\n4. ${languageInstructions.jtbdTrends}\n   - ${isEnglish ? '3-5 bullet points on specific jobs identified and relevant market trends' : '3-5 bullet points su jobs specifici identificati e trend di mercato rilevanti'}\n   - ${isEnglish ? 'Focus on validation metrics and problem urgency' : 'Focus su metriche di validazione e urgenza del problema'}\n\n5. ${languageInstructions.competitiveCanvas}\n   - ${isEnglish ? '3-5 bullet points on competitive positioning and differentiation' : '3-5 bullet points su posizionamento competitivo e differenziazione'}\n   - ${isEnglish ? 'Analysis of direct and indirect competitors from the vertical' : 'Analisi dei competitor diretti e indiretti dal verticale'}\n\n6. ${languageInstructions.techValidation}\n   - ${isEnglish ? '3-5 bullet points on technology stack and validation approach' : '3-5 bullet points su stack tecnologico e approccio di validazione'}\n   - ${isEnglish ? 'Technical best practices from the identified vertical' : 'Best practices tecniche dal verticale identificato'}\n\n7. ${languageInstructions.processMetrics}\n   - ${isEnglish ? '3-5 bullet points on operational processes and key KPIs' : '3-5 bullet points su processi operativi e KPI chiave'}\n   - ${isEnglish ? 'Success metrics based on industry benchmarks' : 'Metriche di successo basate su benchmark del settore'}\n\n8. ${languageInstructions.partnershipActivation}\n   - ${isEnglish ? '3-5 bullet points on partnership strategies and channels' : '3-5 bullet points su strategie di partnership e canali'}\n   - ${isEnglish ? 'Types of strategic partners for the vertical' : 'Tipologie di partner strategici per il verticale'}`;
  
  const part3 = `${isEnglish ? 'IMPORTANT: Each section must contain SPECIFIC insights, extracted from the case histories and identified verticals whenever available, NOT generic advice.' : 'IMPORTANTE: Ogni sezione deve contenere insights SPECIFICI, estratti dalle case histories e dai verticali identificati quando disponibili, NON consigli generici.'}\n\n${languageInstructions.part3Label}\n${languageInstructions.validationQuestionsIntro}\n${isEnglish ? 'The 5 questions must correspond EXACTLY to:' : 'Le 5 domande devono corrispondere ESATTAMENTE a:'}\n1. Jobs-to-be-Done & Market Trends\n2. Competitive Positioning Canvas\n3. Technology Adoption & Validation\n4. Process & Metrics\n5. Partnership Activation\n\n${isEnglish ? 'Question format:' : 'Formato domande:'}\n"[${isEnglish ? 'SECTION NAME' : 'NOME SEZIONE'}]: [${isEnglish ? 'Specific question based on analysis' : 'Domanda specifica basata sull\'analisi'}]?"\n\n${isEnglish ? 'Always provide 2 clear response options.' : 'Fornisci sempre 2 opzioni di risposta chiare.'}`;
  
  return `=== ${languageInstructions.structuredOutputLabel} ===\n\n${languageInstructions.generateAnalysis}\n\n${part1}\n\n${part2}\n\n${part3}`;
}

function formatVerticals(verticals, locale = 'it') {
  if (!verticals || verticals.length === 0) {
    return locale === 'en' ? 'No relevant vertical found in the database for this query.' : 'Nessun verticale pertinente trovato nel database per questa query.';
  }

  // 🔐 ANONIMIZZAZIONE: titolo generico + settore (dalle Keywords), mai il nome reale
  return verticals.map((v, idx) => `
${idx + 1}. Vertical Framework #${idx + 1} (${v.sector}) (Relevance: ${v.relevanceScore.toFixed(1)}%)
${formatFields(v.fields)}`).join('\n');
}

function formatCaseHistories(cases, locale = 'it') {
  if (!cases || cases.length === 0) {
    return locale === 'en' ? 'No relevant case history found in the database for this query.' : 'Nessuna case history pertinente trovata nel database per questa query.';
  }

  // 🔐 ANONIMIZZAZIONE: il titolo reale della startup non viene mai passato a Claude
  return cases.map((c, idx) => `
${idx + 1}. Case Study #${idx + 1} (Sector: ${c.sector}) (Relevance: ${c.relevanceScore.toFixed(1)}%)
${formatFields(c.fields)}`).join('\n');
}

function formatFields(fields) {
  return fields.map(f => `   • ${f.label}: ${f.value}`).join('\n');
}

// Restituisce '' se notion-query non ha trovato pattern di convergenza
function generateConvergenceFramework(methodology, locale = 'it') {
  const insights = methodology?.step3_insights || {};
  const lines = locale === 'en'
    ? [['Converging Technologies', insights.technologies], ['Recurring Business Models', insights.businessModels], ['Common Strategies', insights.strategies]]
    : [['Tecnologie Convergenti', insights.technologies], ['Business Models Ricorrenti', insights.businessModels], ['Strategie Comuni', insights.strategies]];

  return lines
    .filter(([, values]) => values && values.length > 0)
    .map(([label, values]) => `- ${label}: ${values.join(', ')}`)
    .join('\n');
}

// ========== FINE HELPER FUNCTIONS ==========

// ========== CONTEXT OPTIMIZATION FUNCTION ==========

// Colonne reali dei database Notion (vedi notion-query.js):
// - verticali (DB1/DB3): JTDs, Business Model - Best Practice, Technology Adoption & Validation, ...
// - case history (DB2): Description, Value Proposition, Business Model, Impact, Target Market (+ varianti "(ENG)")
// I casi possono arrivare anche da DB3, che ha lo schema dei verticali: per questo CASE_FIELDS copre entrambi.
const VERTICAL_FIELDS = [
  { label: 'Jobs-to-be-Done', keys: ['JTDs', 'Recommended JTDs', 'Jobs to be Done', 'Jobs-to-be-Done'], max: 300 },
  { label: 'Business Model', keys: ['Business Model - Best Practice', 'Business Model'], max: 250 },
  { label: 'Technology Adoption & Validation', keys: ['Technology Adoption & Validation', 'Technologies'], max: 250 },
  { label: 'Market Type Strategy', keys: ['Market Type Strategy'], max: 200 },
  { label: 'Competing Factors', keys: ['Competing Factors', 'Value Proposition - Competing Formula'], max: 200 },
  { label: 'KOR', keys: ['KOR'], max: 150 },
  { label: 'Wanted Partner Profile', keys: ['Wanted Partner Profile'], max: 150 }
];

const CASE_FIELDS = [
  { label: 'Description', keys: ['Description'], enKeys: ['Description (ENG)'], max: 250 },
  { label: 'Value Proposition', keys: ['Value Proposition', 'Value Proposition - Competing Formula'], enKeys: ['Value Proposition (ENG)'], max: 200 },
  { label: 'Business Model', keys: ['Business Model', 'Business Model - Best Practice'], enKeys: ['Business Model (ENG)'], max: 150 },
  { label: 'Impact', keys: ['Impact'], enKeys: ['Impact (ENG)'], max: 150 },
  { label: 'Jobs-to-be-Done', keys: ['JTDs', 'Recommended JTDs'], max: 200 },
  { label: 'Market Type Strategy', keys: ['Market Type Strategy'], max: 150 },
  { label: 'Competing Factors', keys: ['Competing Factors'], max: 150 }
];

const MAX_CASE_FIELDS = 5;

function clip(text, max) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.substring(0, max).trimEnd() + '…' : clean;
}

// Estrae i campi presenti nel record, nell'ordine di `fieldDefs`; in inglese preferisce le colonne "(ENG)"
function extractFields(properties, fieldDefs, locale, scale) {
  const fields = [];
  for (const def of fieldDefs) {
    const keys = locale === 'en' ? [...(def.enKeys || []), ...def.keys] : def.keys;
    const key = keys.find(k => properties?.[k] && String(properties[k]).trim());
    if (key) {
      fields.push({ label: def.label, value: clip(properties[key], Math.round(def.max * scale)) });
    }
  }
  return fields;
}

function sectorLabel(properties, fallback) {
  const raw = properties?.Keywords || properties?.['Target Market'] || '';
  return clip(raw, 80) || fallback;
}

function optimizeContextForClaude(notionData, locale = 'it') {
  // Obiettivo: contesto dati sotto ~14.000 caratteri (circa 4.000 token)
  const maxChars = 14000;

  const methodology = notionData.methodology || {};
  const metadata = notionData.metadata || {};
  const verticals = methodology.step1_verticals?.top3 || [];
  const cases = methodology.step2_cases?.top5 || [];

  const build = (scale, maxCases) => ({
    totalScanned: metadata.totalScanned || notionData.totalScanned || 0,
    processingTime: metadata.processingTime || notionData.processingTime || 'N/A',
    confidenceScore: metadata.confidenceScore || notionData.confidenceScore || 0,
    verticals: verticals.slice(0, 3).map(v => ({
      sector: sectorLabel(v.properties, 'Innovation'),
      relevanceScore: Number(v.relevanceScore) || 0,
      fields: extractFields(v.properties, VERTICAL_FIELDS, locale, scale)
    })),
    cases: cases.slice(0, maxCases).map(c => ({
      sector: sectorLabel(c.properties, 'Innovation Case'),
      relevanceScore: Number(c.relevanceScore) || 0,
      fields: extractFields(c.properties, CASE_FIELDS, locale, scale).slice(0, MAX_CASE_FIELDS)
    }))
  });

  let optimized = build(1, 4);
  const currentSize = JSON.stringify(optimized).length;
  console.log(`📊 Context size: ${currentSize} chars (target: <${maxChars})`);

  // Se troppo grande: 3 casi e testi più corti
  if (currentSize > maxChars) {
    optimized = build(0.6, 3);
    console.log(`✅ Context ridotto: ${JSON.stringify(optimized).length} chars`);
  }

  return optimized;
}

// Copertura dati mostrata all'utente nella UI (none / low / good)
function getDataCoverage(optimizedData) {
  const verticals = optimizedData.verticals.length;
  const cases = optimizedData.cases.length;
  // good: almeno 2 verticali e 2 casi; altrimenti l'analisi integra molto con conoscenza generale
  let level = 'good';
  if (verticals + cases === 0) {
    level = 'none';
  } else if (verticals < 2 || cases < 2) {
    level = 'low';
  }
  return {
    level,
    verticals,
    cases,
    totalScanned: optimizedData.totalScanned,
    confidenceScore: optimizedData.confidenceScore
  };
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
    const optimizedData = optimizeContextForClaude(notionData, locale);
    const dataCoverage = getDataCoverage(optimizedData);
    SecureLogger.dev('🎯 Data optimized for Claude:', {
      verticals: dataCoverage.verticals,
      cases: dataCoverage.cases,
      coverage: dataCoverage.level,
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
        // Modello da utils/claudeConfig.js (env CLAUDE_MODEL, default claude-sonnet-5).
        // Thinking disattivato per mantenere il comportamento di Sonnet 4; max_tokens +50%
        // perché il nuovo tokenizer conta ~30% di token in più per lo stesso testo.
        model: CLAUDE_MODEL,
        max_tokens: 6000,
        thinking: { type: "disabled" },
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
    let analysis = data.content.find(block => block.type === 'text')?.text || '';
    
    // 🧹 CLEANUP: Remove structural duplications from Claude output
    // Find VALIDATION QUESTIONS section and remove everything after it (including duplicated sections)
    const validationIndex = analysis.lastIndexOf('VALIDATION QUESTIONS');
    if (validationIndex !== -1) {
      // Find the end of the validation questions by looking for the next numbered section
      const afterValidation = analysis.substring(validationIndex);
      const duplicateMatch = afterValidation.match(/VALIDATION QUESTIONS[\s\S]*?(\n\n?[4-8]\.\s)/);
      if (duplicateMatch) {
        // Cut off everything from the duplicate section
        const cutPoint = validationIndex + duplicateMatch.index + duplicateMatch[0].length - duplicateMatch[1].length;
        analysis = analysis.substring(0, cutPoint).trim();
        SecureLogger.dev('🧹 Removed duplicated sections after VALIDATION QUESTIONS');
      }
    }
    
    // 🔍 DEBUG: Verifica output Claude
    SecureLogger.dev('📊 Claude response length:', analysis.length);
    SecureLogger.dev('🔍 Contains PARTE 2:', analysis.includes('PARTE 2'));
    SecureLogger.dev('📝 Response preview available');

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
  // Find first occurrence only
  const firstIndex = text.indexOf(marker);
  if (firstIndex === -1) return '';
  
  // Extract content from first occurrence
  const textFromFirst = text.substring(firstIndex);
  
  // Enhanced regex to stop at duplications or next major section
  let stopPattern;
  
  // For operational sections (4-8), stop at next section OR duplication pattern
  if (marker.includes('Jobs-to-be-Done') || marker.includes('Competitive') || 
      marker.includes('Technology') || marker.includes('Process') || marker.includes('Partnership')) {
    stopPattern = `(?=\\n\\n?(?:[5-9]\\.|###\\s*[5-9]\\.|PARTE 3|## PART|4\\. Jobs-to-be-Done|5\\. Competitive|6\\. Technology|7\\. Process|8\\. Partnership)|$)`;
  } else {
    // For other sections, use original pattern
    stopPattern = `(?=\\n\\n?(?:4|5|6|7|8)\\.|\\n\\n?###\\s*(?:4|5|6|7|8)\\.|PARTE 3|$)`;
  }
  
  const regex = new RegExp(`${marker}[\\s\\S]*?${stopPattern}`, 'i');
  const match = textFromFirst.match(regex);
  if (!match) return '';
  
  // Clean content
  let content = match[0].replace(marker, '').trim();
  
  // Remove trailing section numbers
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
        title: "Proprietary Innovation Framework - Strategic Verticals", 
        id: "framework-verticals" 
      },
      { 
        title: "Proprietary Case Studies Database - Best Practices", 
        id: "framework-cases" 
      },
      { 
        title: "Consolidated Evaluation Methodology - Pattern Analysis", 
        id: "framework-patterns" 
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
      dataCoverage,
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