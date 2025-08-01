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

    // NUOVO PROMPT STRUTTURATO CON METODOLOGIA 3-STEP
    const contextPrompt = `Sei un Innovation Expert con accesso a una metodologia proprietaria basata su 200+ case histories verificate.

=== ANALISI BASATA SU DATABASE NOTION (${notionData.totalScanned || 0} items analizzati) ===

QUERY UTENTE: "${query}"

=== STEP 1: VERTICALI STRATEGICHE IDENTIFICATE ===
${formatVerticals(methodology.step1_verticals)}

Framework Estratto dai Verticali:
- Jobs-to-be-Done: ${verticals.framework?.jtds?.slice(0, 3).join('; ') || 'In fase di identificazione'}
- Business Models: ${verticals.framework?.businessModels?.slice(0, 3).join('; ') || 'In fase di analisi'}
- Technology Patterns: ${verticals.framework?.technologies?.slice(0, 3).join('; ') || 'In fase di mappatura'}
- Market Strategies: ${verticals.framework?.strategies?.slice(0, 3).join('; ') || 'In fase di definizione'}

=== STEP 2: CASE HISTORIES PIÙ RILEVANTI ===
${formatCaseHistories(cases.top5)}

Pattern di Convergenza Identificati:
${generateConvergenceFramework(methodology)}

=== STEP 3: CONFIDENCE SCORE ===
Affidabilità Analisi: ${notionData.confidenceScore || 'N/A'}%
Tempo Processing: ${notionData.processingTime || 'N/A'}

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

4. 🚀 ROADMAP OPERATIVA DETTAGLIATA
   Struttura in 3 fasi temporali:
   - Fase 1 (0-6 mesi): Foundation & Pilot
   - Fase 2 (6-12 mesi): Validation & Scale
   - Fase 3 (12-24 mesi): Expansion & Optimization

5. 📊 SUCCESS METRICS & KPIs
   - Metriche core (4-5 KPI principali)
   - Target realistici basati su benchmark
   - Timeline per raggiungimento

PARTE 2: DOMANDE DI VALIDAZIONE
Genera ESATTAMENTE 6 domande (una per dimensione) per confermare gli insights:

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
        max_tokens: 2500,
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
      sources,
      notionResultsUsed: notionData.results.length,
      bestPracticesApplied: notionData.bestPractices.length
    });

  } catch (error) {
    console.error('Claude Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analysis',
      details: error.message 
    });
  }
}
