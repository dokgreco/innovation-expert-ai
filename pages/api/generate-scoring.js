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
  
  // Helper functions per analisi testo
  function analyzeTextAnswer(answer, dimension) {
    // Keywords specifici per ogni dimensione
    const keywordSets = {
  "Jobs-to-be-Done & Market Trends": ["specific", "validate", "customer", "pain", "measure", "feedback", "interview", "problem", "solution", "urgency", "trend", "market", "demand", "growth"],
  "Competitive Positioning Canvas": ["differentiation", "moat", "unique", "positioning", "advantage", "competitor", "benchmark", "superior", "defend", "barrier"],
  "Technology Adoption & Validation": ["scalable", "API", "architecture", "stack", "tested", "MVP", "cloud", "security", "integration", "performance", "validation", "technical"],
  "Process & Metrics": ["KPI", "metric", "measure", "process", "efficiency", "optimize", "workflow", "automation", "tracking", "dashboard", "target", "benchmark"],
  "Partnership Activation": ["strategic", "channel", "distribution", "integration", "alliance", "ecosystem", "collaboration", "vendor", "reseller", "synergy", "partner", "B2B"]
};
    
    const keywords = keywordSets[dimension] || [];
    const answerLower = answer.toLowerCase();
    const wordCount = answer.split(/\s+/).length;
    
    // Calcola score base
    let score = 5; // Base score
    
    // Bonus per lunghezza (più dettagliato = meglio)
    if (wordCount >= 50) score += 1.5;
    else if (wordCount >= 30) score += 1;
    else if (wordCount >= 20) score += 0.5;
    
    // Bonus per keywords trovate
    let keywordsFound = 0;
    keywords.forEach(keyword => {
      if (answerLower.includes(keyword)) {
        keywordsFound++;
        score += 0.3;
      }
    });
    
    // Bonus per specificità (numeri, percentuali, timeline)
    const hasNumbers = /\d+/.test(answer);
    const hasPercentage = /%/.test(answer);
    const hasTimeline = /(month|week|day|year|Q[1-4])/i.test(answer);
    
    if (hasNumbers) score += 0.5;
    if (hasPercentage) score += 0.3;
    if (hasTimeline) score += 0.4;
    
    // Cap a 10
    return {
      score: Math.min(Math.round(score * 10) / 10, 10),
      keywordsFound,
      wordCount,
      hasSpecifics: hasNumbers || hasPercentage || hasTimeline
    };
  }

  function generateTextBasedPrompt(analysisData, validationAnswers) {
    // Analizza ogni risposta
    const textAnalysis = {};
    Object.entries(validationAnswers).forEach(([dimension, answer]) => {
      textAnalysis[dimension] = analyzeTextAnswer(answer, dimension);
    });
    
    return { textAnalysis };
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysisData, validationAnswers } = req.body;

    // Verifica che abbiamo tutti i dati necessari
    if (!analysisData || !validationAnswers) {
      return res.status(400).json({ 
        error: 'Missing required data',
        details: 'Both analysisData and validationAnswers are required' 
      });
    }

    // Analizza le risposte testuali
    const { textAnalysis } = generateTextBasedPrompt(analysisData, validationAnswers);

    // Prepara il prompt calibrato per lo scoring
    const scoringPrompt = `
Sei un Innovation Expert che deve generare uno scoring calibrato basato sull'analisi precedente e le risposte di validazione TESTUALI.

=== ANALISI PRECEDENTE ===
${JSON.stringify(analysisData.analysis || analysisData, null, 2).substring(0, 2000)}

=== RISPOSTE TESTUALI VALIDAZIONE ===
${Object.entries(validationAnswers).map(([dimension, answer]) => 
  `${dimension}: "${answer.substring(0, 200)}..."`
).join('\n\n')}

=== ANALISI AUTOMATICA RISPOSTE ===
${Object.entries(textAnalysis).map(([dimension, analysis]) => 
  `${dimension}: Keywords trovate: ${analysis.keywordsFound}, Parole: ${analysis.wordCount}, Specificità: ${analysis.hasSpecifics ? 'SI' : 'NO'}, Pre-score: ${analysis.score}/10`
).join('\n')}

=== GENERA SCORING CALIBRATO ===

Basandoti su:
1. Qualità e specificità delle risposte testuali
2. Presenza di metriche concrete e timeline
3. Allineamento con best practices del verticale
4. Pre-score dall'analisi automatica (usa come base ma puoi aggiustare ±2 punti)

FORMAT RICHIESTO:

1. OVERALL SCORE
- Score: [X.X/10]
- Rating: [scegli tra: "Altamente Promettente", "Promettente", "Moderato", "Da Affinare"]

2. SCORING PER DIMENSIONE (1-10 ciascuna):

Jobs-to-be-Done Alignment:
- Score: [X/10]
- Rationale: [1-2 frasi basate sulla qualità della risposta testuale]

Technology & Data Strategy:
- Score: [X/10]
- Rationale: [1-2 frasi basate sulla risposta]

Business Model Approach:
- Score: [X/10]
- Rationale: [1-2 frasi basate sulla risposta]

Market Entry Strategy:
- Score: [X/10]
- Rationale: [1-2 frasi basate sulla risposta]

Competitive Positioning:
- Score: [X/10]
- Rationale: [1-2 frasi basate sulla risposta]

Partnership Potential:
- Score: [X/10]
- Rationale: [1-2 frasi basate sulla risposta]

3. RISK ASSESSMENT

Rischio 1:
- Fattore: [identifica dalla qualità delle risposte]
- Livello: [Alto/Medio/Basso]
- Descrizione: [1-2 frasi]
- Mitigazione: [strategia suggerita]

Rischio 2:
- Fattore: [secondo rischio]
- Livello: [Alto/Medio/Basso]
- Descrizione: [1-2 frasi]
- Mitigazione: [strategia suggerita]

IMPORTANTE:
- Valuta la QUALITÀ e SPECIFICITÀ delle risposte testuali
- Risposte vaghe o generiche = score più basso
- Risposte con metriche e dettagli = score più alto
- Overall score = media ponderata delle 6 dimensioni
`;

    // Chiama Claude API per generare lo scoring
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          { role: "user", content: scoringPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const scoringText = data.content[0].text;

    // Parse della risposta di Claude
    const parsedScoring = parseScoringResponse(scoringText);

    // Ritorna i dati strutturati
    res.status(200).json({
      scoring: parsedScoring,
      rawResponse: scoringText, // Per debug se necessario
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scoring Generation Error:', error);
    
    // User-friendly error messages
    let userMessage = 'Errore nella generazione del punteggio di innovazione.';
    let statusCode = 500;
    
    if (error.message && error.message.includes('413')) {
      userMessage = 'Troppe informazioni da elaborare. Il sistema sta generando un\'analisi semplificata.';
      statusCode = 413;
    } else if (error.message && error.message.includes('timeout')) {
      userMessage = 'La valutazione sta richiedendo più tempo del previsto. Attendi ancora qualche secondo.';
      statusCode = 504;
    } else if (error.message && error.message.includes('validation')) {
      userMessage = 'Per generare il punteggio devi prima rispondere a tutte le domande di validazione.';
      statusCode = 400;
    } else if (error.message && error.message.includes('429')) {
      userMessage = 'Hai richiesto troppe valutazioni. Attendi 30 secondi prima di generare un nuovo scoring.';
      statusCode = 429;
    } else if (error.message && error.message.includes('Claude')) {
      userMessage = 'Il motore di scoring è temporaneamente offline. Riprova tra 2 minuti.';
      statusCode = 503;
    } else if (error.message && error.message.includes('parsing')) {
      userMessage = 'Errore nel calcolo del punteggio. Verifica di aver completato tutti i passaggi precedenti.';
      statusCode = 422;
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      technicalDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Funzione helper per parsare la risposta di Claude
function parseScoringResponse(text) {
  try {
    // Estrai overall score
    const overallMatch = text.match(/Score:\s*([\d.]+)\/10/);
    const ratingMatch = text.match(/Rating:\s*"([^"]+)"/);
    
    const overall = {
      score: overallMatch ? parseFloat(overallMatch[1]) : 0,
      rating: ratingMatch ? ratingMatch[1] : "Da Valutare"
    };

    // Estrai scoring per dimensione
    const dimensions = [
      { name: "Jobs-to-be-Done Alignment", key: "jtbd" },
      { name: "Technology & Data Strategy", key: "tech" },
      { name: "Business Model Approach", key: "business" },
      { name: "Market Entry Strategy", key: "market" },
      { name: "Competitive Positioning", key: "competitive" },
      { name: "Partnership Potential", key: "partnership" }
    ];

    const dimensionScores = dimensions.map(dim => {
      // Cerca il pattern per ogni dimensione
      const regex = new RegExp(`${dim.name}:[\\s\\S]*?Score:\\s*(\\d+)\\/10[\\s\\S]*?Rationale:\\s*([^\\n]+)`, 'i');
      const match = text.match(regex);
      
      return {
        name: dim.name,
        score: match ? parseInt(match[1]) : 5,
        rationale: match ? match[2].trim() : "Valutazione basata sui pattern identificati"
      };
    });

    // Estrai risk assessment
    const risks = [];
    const riskRegex = /Rischio\s*\d+:[^]*?Fattore:\s*([^\\n]+)[^]*?Livello:\s*(\w+)[^]*?Descrizione:\s*([^\\n]+)[^]*?Mitigazione:\s*([^\\n]+)/gi;
    let riskMatch;
    
    while ((riskMatch = riskRegex.exec(text)) !== null && risks.length < 3) {
      risks.push({
        factor: riskMatch[1].trim(),
        level: riskMatch[2].trim(),
        description: riskMatch[3].trim(),
        mitigation: riskMatch[4].trim()
      });
    }

    // Se non troviamo rischi, aggiungi default
    if (risks.length === 0) {
      risks.push({
        factor: "Adozione Tecnologica",
        level: "Medio",
        description: "Possibili sfide nell'implementazione della tecnologia proposta",
        mitigation: "Sviluppo incrementale con validazione continua"
      });
    }

    return {
      overall,
      dimensions: dimensionScores,
      risks
    };

  } catch (error) {
    console.error('Error parsing scoring response:', error);
    
    // Return default structure in caso di errore
    return {
      overall: { score: 7.0, rating: "Promettente" },
      dimensions: [
        { name: "Jobs-to-be-Done Alignment", score: 7, rationale: "Allineamento identificato con i pattern del settore" },
        { name: "Technology & Data Strategy", score: 7, rationale: "Stack tecnologico coerente con best practices" },
        { name: "Business Model Approach", score: 7, rationale: "Modello validato da case studies simili" },
        { name: "Market Entry Strategy", score: 7, rationale: "Strategia allineata con successi del verticale" },
        { name: "Competitive Positioning", score: 7, rationale: "Fattori differenzianti identificati" },
        { name: "Partnership Potential", score: 7, rationale: "Opportunità di partnership strategiche" }
      ],
      risks: [
        {
          factor: "Validazione Mercato",
          level: "Medio",
          description: "Necessaria validazione con early adopters",
          mitigation: "Pilot program con partner selezionati"
        }
      ]
    };
  }
}