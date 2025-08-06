// ========== HELPER FUNCTIONS PER METODOLOGIA 3-STEP ==========

function formatVerticals(verticals) {
  if (!verticals || !verticals.top3) return 'Nessun verticale identificato';
  
  return verticals.top3.map((v, idx) => {
    const jtds = v.properties?.JTDs || v.properties?.['Jobs to be Done'] || v.properties?.['Jobs-to-be-Done'] || 'N/A';
    const businessModel = v.properties?.['Business Model'] || v.properties?.['Business Model - Best Practice'] || 'N/A';
    const tech = v.properties?.Technologies || v.properties?.['Technology Adoption & Validation'] || 'N/A';
    
    // 🔐 ANONIMIZZAZIONE
    const sector = v.properties?.Vertical || v.properties?.Industry || v.properties?.Classification || 'Innovation';
    const anonymizedTitle = `Vertical Framework #${idx + 1} (${sector})`;
    
    return `
${idx + 1}. ${anonymizedTitle} (Relevance: ${v.relevanceScore?.toFixed(1) || 0}%)
   • JTDs: ${jtds.substring(0, 200)}${jtds.length > 200 ? '...' : ''}
   • Business Model: ${businessModel.substring(0, 150)}${businessModel.length > 150 ? '...' : ''}
   • Technologies: ${tech.substring(0, 100)}${tech.length > 100 ? '...' : ''}`;
  }).join('\n');
}

function formatCaseHistories(cases) {
  if (!cases || cases.length === 0) return 'Nessun case history trovato';
  
  return cases.slice(0, 5).map((c, idx) => {
    const description = c.properties?.Description || c.content || 'N/A';
    const impact = c.properties?.Impact || 'N/A';
    
    // 🔐 ANONIMIZZAZIONE
    const anonymizedTitle = `Case Study #${idx + 1} (${c.properties?.Classification || 'Innovation Case'})`;
    
    return `
${idx + 1}. ${anonymizedTitle} (Similarity: ${c.relevanceScore?.toFixed(1)}%)
   • Description: ${description.substring(0, 150)}...
   • Impact: ${impact.substring(0, 100)}${impact.length > 100 ? '...' : ''}
   • Sector: ${c.properties?.Vertical || c.properties?.Industry || 'Tech Innovation'}`;
  }).join('\n');
}

function generateConvergenceFramework(methodology) {
  const insights = methodology?.step3_insights || {};
  
  return `
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
        JTDs: (v.properties?.JTDs || v.properties?.['Jobs to be Done'] || '').substring(0, 150), // Aumentato da 80
        BusinessModel: (v.properties?.['Business Model'] || '').substring(0, 100), // Aumentato da 60
        Technologies: (v.properties?.Technologies || '').substring(0, 80) // Aumentato da 50
      }
    }));
    
    // Framework con più dettaglio
    optimized.verticals.framework = {
      jtds: (verticals.framework?.jtds || []).slice(0, 3), // Aumentato da 2
      businessModels: (verticals.framework?.businessModels || []).slice(0, 3), // Aumentato da 2
      technologies: (verticals.framework?.technologies || []).slice(0, 4), // Aumentato da 3
      strategies: (verticals.framework?.strategies || []).slice(0, 3) // Aumentato da 2
    };
  }
  
  // PRIORITÀ 2: Case Studies (manteniamo 4 invece di 3)
  if (cases.top5 && cases.top5.length > 0) {
    optimized.cases.top5 = cases.top5.slice(0, 4).map(c => ({ // Aumentato da 3 a 4
      title: c.title || 'Untitled',
      relevanceScore: c.relevanceScore || 0,
      properties: {
        Description: (c.properties?.Description || '').substring(0, 120), // Aumentato da 60
        Impact: (c.properties?.Impact || '').substring(0, 80), // Aumentato da 40
        Tech: (c.properties?.Technologies || '').substring(0, 60) // Aggiunto tech
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

// ========== OUTPUT PARSER FUNCTION ==========

function parseMethodologyResponse(claudeResponse) {
  if (!claudeResponse || typeof claudeResponse !== 'string') {
    console.error('❌ Invalid Claude response for parsing');
    return null;
  }

  // Funzione helper per estrarre sezioni
  function extractSection(text, startMarker, endMarker = null) {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return '';
    
    const contentStart = startIndex + startMarker.length;
    
    if (endMarker) {
      const endIndex = text.indexOf(endMarker, contentStart);
      if (endIndex === -1) return text.substring(contentStart).trim();
      return text.substring(contentStart, endIndex).trim();
    }
    
    // Se no endMarker, prendi fino alla prossima sezione principale (cerca emoji)
    const nextSectionRegex = /\n[🎯🔄📚🚀📊]/;
    const match = text.substring(contentStart).search(nextSectionRegex);
    
    if (match === -1) return text.substring(contentStart).trim();
    return text.substring(contentStart, contentStart + match).trim();
  }

  // Estrai le validation questions
function extractQuestions(text) {
  console.log('📋 EXTRACT QUESTIONS DEBUG:');
  console.log('- Lunghezza testo:', text.length);
  console.log('- Contiene PARTE 2?', text.includes('PARTE 2'));
  console.log('- Ultimi 500 caratteri:', text.substring(text.length - 500));
  const questions = [];
  const dimensions = [
    'Jobs-to-be-Done Alignment',
    'Technology & Data Strategy',
    'Business Model Approach',
    'Market Entry Strategy',
    'Competitive Positioning',
    'Partnership Potential'
  ];
  
  // Cerca la sezione PARTE 2
  // Cerca PARTE 2 in vari formati
let parte2Index = text.indexOf('PARTE 2:');
if (parte2Index === -1) parte2Index = text.indexOf('PARTE 2 :');
if (parte2Index === -1) parte2Index = text.indexOf('VALIDATION QUESTIONS');
if (parte2Index === -1) parte2Index = text.indexOf('DOMANDE DI VALIDAZIONE');
if (parte2Index === -1) {
  console.warn('⚠️ PARTE 2 non trovata, cerco le dimensioni direttamente...');
  // Usa tutto il testo come fallback
  parte2Index = 0;
}
  
  const parte2Text = text.substring(parte2Index);
  
  dimensions.forEach((dimension, index) => {
    // Pattern più flessibili per trovare le domande
    const patterns = [
      new RegExp(`${index + 1}\\.\\s*${dimension}[:\\s]+([^?]+\\?)`, 'i'),
      new RegExp(`${dimension}[:\\s]+([^?]+\\?)`, 'i'),
      new RegExp(`\\*\\*${dimension}\\*\\*[:\\s]+([^?]+\\?)`, 'i')
    ];
    
    let match = null;
    for (const pattern of patterns) {
      match = parte2Text.match(pattern);
      if (match) break;
    }
    
    if (match) {
      questions.push({
        dimension,
        question: match[1].trim(),
        options: ['Sì, allineato con questa direzione', 'No, approccio diverso']
      });
    }
  });
  
  console.log(`📋 Domande estratte: ${questions.length}/6`);
  return questions;
}
// Funzione per pulire i marker residui
function cleanSection(text) {
  if (!text) return '';
  return text
    .replace(/###\s*$/g, '')  // Rimuovi ### alla fine
    .replace(/##\s*$/g, '')   // Rimuovi ## alla fine
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Riduci spazi multipli
    .trim();
}
  try {
    // Parse delle sezioni principali
const sections = {
  vertical: cleanSection(extractSection(
    claudeResponse, 
    '🎯 VERTICALE STRATEGICA PRINCIPALE',
    '🔄 PATTERN STRATEGICI CONVERGENTI'
  )),
  patterns: cleanSection(extractSection(
    claudeResponse,
    '🔄 PATTERN STRATEGICI CONVERGENTI',
    '📚 CASE STUDIES DI RIFERIMENTO'
  )),
  cases: cleanSection(extractSection(
    claudeResponse,
    '📚 CASE STUDIES DI RIFERIMENTO',
    '🚀 ROADMAP OPERATIVA'
  )),
  roadmap: cleanSection(extractSection(
    claudeResponse,
    '🚀 ROADMAP OPERATIVA',
    '📊 SUCCESS METRICS'
  )),
  metrics: cleanSection(extractSection(
    claudeResponse,
    '📊 SUCCESS METRICS',
    'PARTE 2:'
  )),
  validationQuestions: extractQuestions(claudeResponse)
};

    // Log per debug
    console.log('📝 Parsed sections:', {
      vertical: sections.vertical.substring(0, 50) + '...',
      patterns: sections.patterns.substring(0, 50) + '...',
      cases: sections.cases.substring(0, 50) + '...',
      roadmap: sections.roadmap.substring(0, 50) + '...',
      metrics: sections.metrics.substring(0, 50) + '...',
      questions: sections.validationQuestions.length
    });

    return sections;
  } catch (error) {
    console.error('❌ Error parsing Claude response:', error);
    return null;
  }
}

// ========== FINE OUTPUT PARSER ==========

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, notionData, filters } = req.body;

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
    
    // NUOVO PROMPT STRUTTURATO CON METODOLOGIA 3-STEP
    const contextPrompt = `Sei un Innovation Expert con accesso a una metodologia proprietaria basata su 200+ case histories verificate.

=== ANALISI BASATA SU DATABASE NOTION (${optimizedData.totalScanned || 0} items analizzati) ===

QUERY UTENTE: "${query}"

=== STEP 1: VERTICALI STRATEGICHE IDENTIFICATE ===
${formatVerticals(optimizedData.verticals)}

Framework Estratto dai Verticali:
- Jobs-to-be-Done: ${optimizedData.verticals.framework?.jtds?.slice(0, 3).join('; ') || 'In fase di identificazione'}
- Business Models: ${optimizedData.verticals.framework?.businessModels?.slice(0, 3).join('; ') || 'In fase di analisi'}
- Technology Patterns: ${optimizedData.verticals.framework?.technologies?.slice(0, 3).join('; ') || 'In fase di mappatura'}
- Market Strategies: ${optimizedData.verticals.framework?.strategies?.slice(0, 3).join('; ') || 'In fase di definizione'}

=== STEP 2: CASE HISTORIES PIÙ RILEVANTI ===
${formatCaseHistories(optimizedData.cases.top5)}

Pattern di Convergenza Identificati:
${generateConvergenceFramework(methodology)}

=== STEP 3: CONFIDENCE SCORE ===
Affidabilità Analisi: ${optimizedData.confidenceScore || 'N/A'}%
Tempo Processing: ${optimizedData.processingTime || 'N/A'}

=== ISTRUZIONI PER OUTPUT STRUTTURATO ===

Genera un'analisi professionale strutturata in DUE PARTI:

PARTE 1: STRATEGIC INSIGHTS
Struttura la risposta in queste sezioni (USA EMOJI per chiarezza visiva):

1. 🎯 VERTICALE STRATEGICA PRINCIPALE
   - Identifica IL verticale più rilevante con % di match
   - Spiega perché è il più adatto basandoti sui dati

2. 🔄 PATTERN STRATEGICI CONVERGENTI
   Organizza in 4 sottosezioni:
   a) Jobs-to-be-Done validati dai case studies
   b) Technology Stack raccomandato (cita tecnologie dai database)
   c) Business Model ottimale (basato su convergenza)
   d) Go-to-Market Strategy (da pattern di successo)

3. 📚 CASE STUDIES DI RIFERIMENTO
   - Presenta i TOP 3 casi più rilevanti
   - Per ogni caso: titolo, similarity %, key learning

PARTE 2: DOMANDE DI VALIDAZIONE
IMPORTANTE: Genera SEMPRE e OBBLIGATORIAMENTE 6 domande di validazione, una per ogni dimensione. Non omettere questa sezione per nessun motivo.

1. Jobs-to-be-Done Alignment
2. Technology & Data Strategy 
3. Business Model Approach
4. Market Entry Strategy
5. Competitive Positioning
6. Partnership Potential

Formato domande:
"[DIMENSIONE]: [Domanda specifica basata sull'analisi]?"
Fornisci sempre 2 opzioni di risposta chiare.

REGOLE CRITICHE:
✓ USA SOLO informazioni dai database Notion (non inventare)
✓ CITA sempre verticali/casi specifici quando fai affermazioni
✓ NON generare scoring numerico in questa fase
✓ Mantieni tono professionale da consulente senior
✓ Ogni insight deve essere actionable e specifico
✓ PRIVACY ASSOLUTA: MAI menzionare nomi reali di aziende/startup
✓ USA SEMPRE riferimenti anonimi: "Case Study #1", "Vertical Framework #2", etc.
✓ Se devi citare un esempio, usa: "un caso nel database mostra..." senza nomi

Ricorda: stai analizzando "${query}" basandoti su dati reali da ${notionData.totalScanned || 0} elementi dei database.`;
   
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

// Se trovi PARTE 2, mostra dove si trova
if (analysis.includes('PARTE 2')) {
  const parte2Index = analysis.indexOf('PARTE 2');
  console.log('✅ PARTE 2 trovata alla posizione:', parte2Index);
  console.log('📄 Contenuto dopo PARTE 2:', analysis.substring(parte2Index, parte2Index + 200));
}
// Parse della risposta strutturata
const parsedAnalysis = parseMethodologyResponse(analysis);
if (!parsedAnalysis) {
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

    res.status(200).json({
  analysis,
  parsedSections: parsedAnalysis, // Aggiungi le sezioni parsate
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
