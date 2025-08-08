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

Genera un'analisi professionale strutturata in 9 SEZIONI:

PARTE 1: STRATEGIC INSIGHTS

1. 🎯 VERTICALI STRATEGICHE IDENTIFICATE
   - TOP 3 verticali con % match
   - Descrizione 50-80 parole per verticale
   - Formato: "Vertical Framework #X (Sector)"

2. 📊 PATTERN STRATEGICI PER DIMENSIONE
   Per OGNI delle 6 dimensioni, estrai 3 insights (1 per verticale TOP 3):
   • Jobs-to-be-Done Alignment
   • Technology Adoption & Validation
   • Business Model Viability
   • Market Type Strategy Execution
   • Competing Factors Strength
   • Target Synergies Potential

3. 📚 CASE STUDIES DI RIFERIMENTO
   - TOP 3 cases ANONIMI con similarity %
   - Formato: "Case Study #X (Sector: Y)"
   - Key learning per ogni caso

PARTE 2: OPERATIONAL INSIGHTS (Sezioni 4-8)
Genera insights actionable per QUESTE 5 dimensioni operative:

4. Jobs-to-be-Done & Market Trends
   - 3-5 bullet points su jobs specifici identificati e trend di mercato rilevanti
   - Focus su metriche di validazione e urgenza del problema

5. Competitive Positioning Canvas
   - 3-5 bullet points su posizionamento competitivo e differenziazione
   - Analisi dei competitor diretti e indiretti dal verticale

6. Technology Adoption & Validation
   - 3-5 bullet points su stack tecnologico e approccio di validazione
   - Best practices tecniche dal verticale identificato

7. Process & Metrics
   - 3-5 bullet points su processi operativi e KPI chiave
   - Metriche di successo basate su benchmark del settore

8. Partnership Activation
   - 3-5 bullet points su strategie di partnership e canali
   - Tipologie di partner strategici per il verticale

IMPORTANTE: Ogni sezione deve contenere insights SPECIFICI estratti dalle case histories e verticali identificati, NON consigli generici.

PARTE 3: DOMANDE DI VALIDAZIONE
IMPORTANTE: Genera SEMPRE 6 domande di validazione, una per dimensione.

Formato domande:
"[DIMENSIONE]: [Domanda specifica basata sull'analisi]?"
Fornisci sempre 2 opzioni di risposta chiare.

REGOLE CRITICHE:
✓ USA SOLO informazioni dai database Notion
✓ MANTIENI anonimato totale (Case #X, Vertical #Y)
✓ Output SEMPRE in 9 sezioni + validation questions
✓ Ogni sezione operational deve avere 3-5 punti actionable
✓ NON generare scoring numerico in questa fase

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

    // FUNZIONE extractQuestions SPOSTATA QUI DENTRO
    function extractQuestions(text) {
      console.log('📋 EXTRACT QUESTIONS DEBUG:');
      console.log('- Lunghezza testo:', text.length);
      console.log('- Contiene PARTE 3?', text.includes('PARTE 3'));
      
      const questions = [];
      const dimensions = [
        'Jobs-to-be-Done Alignment',
        'Technology & Data Strategy',
        'Business Model Approach',
        'Market Entry Strategy',
        'Competitive Positioning',
        'Partnership Potential'
      ];
      
      // Cerca PARTE 3 (non più PARTE 2)
      let parteIndex = text.indexOf('PARTE 3');
      if (parteIndex === -1) parteIndex = text.indexOf('DOMANDE DI VALIDAZIONE');
      if (parteIndex === -1) parteIndex = text.indexOf('VALIDATION QUESTIONS');
      if (parteIndex === -1) {
        console.warn('⚠️ PARTE 3 non trovata, cerco le dimensioni in tutto il testo...');
        parteIndex = 0;
      }
      
      const parteText = text.substring(parteIndex);
      
      dimensions.forEach((dimension, index) => {
        // Pattern più flessibili per trovare le domande
        const patterns = [
          new RegExp(`${dimension}[:\\s]+([^?]+\\?)`, 'i'),
          new RegExp(`\\*\\*${dimension}\\*\\*[:\\s]+([^?]+\\?)`, 'i'),
          new RegExp(`${index + 1}\\.\\s*${dimension}[:\\s]+([^?]+\\?)`, 'i')
        ];
        
        let match = null;
        for (const pattern of patterns) {
          match = parteText.match(pattern);
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

    // PARSING DELLE 9 SEZIONI
    const extractSection = (text, marker) => {
      const regex = new RegExp(`${marker}[\\s\\S]*?(?=\\n\\n[0-9]\\.|\\n\\n[A-Z]|PARTE|$)`, 'i');
      const match = text.match(regex);
      return match ? match[0].replace(marker, '').trim() : '';
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