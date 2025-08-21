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
  
  // 🚀 ADVANCED SCORING ALGORITHM - Phase E.2 Implementation
  function analyzeTextAnswer(answer, dimension, analysisContext) {
    // Keywords specifici per ogni dimensione (manteniamo esistenti)
    const keywordSets = {
      "Jobs-to-be-Done & Market Trends": ["specific", "validate", "customer", "pain", "measure", "feedback", "interview", "problem", "solution", "urgency", "trend", "market", "demand", "growth"],
      "Competitive Positioning Canvas": ["differentiation", "moat", "unique", "positioning", "advantage", "competitor", "benchmark", "superior", "defend", "barrier"],
      "Technology Adoption & Validation": ["scalable", "API", "architecture", "stack", "tested", "MVP", "cloud", "security", "integration", "performance", "validation", "technical"],
      "Process & Metrics": ["KPI", "metric", "measure", "process", "efficiency", "optimize", "workflow", "automation", "tracking", "dashboard", "target", "benchmark"],
      "Partnership Activation": ["strategic", "channel", "distribution", "integration", "alliance", "ecosystem", "collaboration", "vendor", "reseller", "synergy", "partner", "B2B"]
    };
    
    return advancedScoring(answer, dimension, analysisContext, keywordSets[dimension] || []);
  }

  function advancedScoring(answer, dimension, analysisContext, keywords) {
    if (!answer || answer.length < 10) {
      return { 
        score: 2, 
        specificityScore: 0, alignmentScore: 0, completenessScore: 0, actionabilityScore: 0,
        gaps: ['Risposta troppo breve o mancante'], 
        strengths: [],
        keywordsFound: 0, wordCount: 0, hasSpecifics: false 
      };
    }
    
    const wordCount = answer.split(/\s+/).length;
    
    // LIVELLO 1: Specificità (35% peso) - Metriche numeriche, timeline, target quantificati
    const specificityScore = checkSpecificity(answer);
    
    // LIVELLO 2: Allineamento Best Practices (30% peso) - Match con verticale, terminologia settore  
    const alignmentScore = checkAlignment(answer, analysisContext, keywords);
    
    // LIVELLO 3: Completezza (20% peso) - Tutti aspetti coperti, 50-150 parole ottimale
    const completenessScore = checkCompleteness(answer, wordCount);
    
    // LIVELLO 4: Actionability (15% peso) - Azioni concrete, next steps, criteri successo
    const actionabilityScore = checkActionability(answer);
    
    // Weighted Average
    const totalScore = Math.min(Math.round((
      specificityScore * 0.35 +
      alignmentScore * 0.30 +
      completenessScore * 0.20 +
      actionabilityScore * 0.15
    ) * 10) / 10, 10);
    
    // Gap Analysis
    const gaps = identifyGaps(answer, specificityScore, alignmentScore, completenessScore, actionabilityScore);
    const strengths = identifyStrengths(answer, specificityScore, alignmentScore, completenessScore, actionabilityScore);
    
    console.log(`📊 Advanced scoring for ${dimension}:`, {
      totalScore,
      breakdown: { specificityScore, alignmentScore, completenessScore, actionabilityScore },
      gaps: gaps.length,
      strengths: strengths.length
    });
    
    return {
      score: totalScore, // Mantiene compatibilità con codice esistente
      specificityScore,
      alignmentScore, 
      completenessScore,
      actionabilityScore,
      gaps,
      strengths,
      keywordsFound: countKeywords(answer, keywords),
      wordCount,
      hasSpecifics: specificityScore > 6
    };
  }

  // SPECIFICITÀ CHECK (35% peso)
  function checkSpecificity(answer) {
    let score = 5; // Base
    
    // Metriche numeriche (€, $, KPI, numeri concreti)
    const hasNumbers = /\d+/.test(answer);
    const hasCurrency = /[€$£¥]\d+|euro|dollar/i.test(answer);
    const hasPercentage = /%|\spercent/i.test(answer);
    const hasKPIs = /(kpi|roi|conversion|retention|churn|cac|ltv)/i.test(answer);
    
    if (hasNumbers) score += 1;
    if (hasCurrency) score += 1.5;
    if (hasPercentage) score += 1;
    if (hasKPIs) score += 1.5;
    
    // Timeline concrete (giorni/mesi/Q1-Q4)
    const hasTimeline = /(month|week|day|year|Q[1-4]|gennaio|febbraio|marzo)/i.test(answer);
    const hasDeadlines = /(entro|deadline|scadenza|timeline)/i.test(answer);
    
    if (hasTimeline) score += 1;
    if (hasDeadlines) score += 0.5;
    
    // Target quantificati
    const hasTargets = /(target|obiettivo|goal).*\d+/i.test(answer);
    const hasMetrics = /(\d+%|\d+x|\d+ volte)/i.test(answer);
    
    if (hasTargets) score += 1;
    if (hasMetrics) score += 0.5;
    
    return Math.min(score, 10);
  }

  // ALLINEAMENTO CHECK (30% peso)
  function checkAlignment(answer, analysisContext, keywords) {
    let score = 5; // Base
    
    // Keywords di settore trovate
    let keywordsFound = 0;
    if (keywords) {
      keywords.forEach(keyword => {
        if (answer.toLowerCase().includes(keyword.toLowerCase())) {
          keywordsFound++;
          score += 0.4;
        }
      });
    }
    
    // Terminologia verticale specifica
    const fintech = /(fintech|payment|banking|digital wallet|blockchain|crypto)/i.test(answer);
    const healthtech = /(healthcare|medical|patient|clinical|fda|regulatory)/i.test(answer);
    const saas = /(saas|subscription|recurring|churn|mrr|arr)/i.test(answer);
    const ecommerce = /(ecommerce|marketplace|seller|inventory|fulfillment)/i.test(answer);
    
    if (fintech || healthtech || saas || ecommerce) score += 1.5;
    
    // Metodologie consolidate
    const hasMethodology = /(agile|scrum|lean|mvp|poc|pilot|a\/b test)/i.test(answer);
    const hasFrameworks = /(okr|kpi|north star|funnel|customer journey)/i.test(answer);
    
    if (hasMethodology) score += 1;
    if (hasFrameworks) score += 1;
    
    return Math.min(score, 10);
  }

  // COMPLETEZZA CHECK (20% peso)
  function checkCompleteness(answer, wordCount) {
    let score = 5; // Base
    
    // Lunghezza ottimale (50-150 parole)
    if (wordCount >= 50 && wordCount <= 150) score += 2;
    else if (wordCount >= 30 && wordCount <= 200) score += 1;
    else if (wordCount >= 20) score += 0.5;
    
    // Struttura logica (aspetti multipli)
    const hasMultipleAspects = answer.split(/[.!?]/).length > 2;
    const hasList = /(\n-|\n\d+\.|\n•|,\s*\w+,\s*\w+)/i.test(answer);
    
    if (hasMultipleAspects) score += 1;
    if (hasList) score += 1;
    
    // Copertura dimensionale
    const coversStrategy = /(strategia|strategy|approccio|approach)/i.test(answer);
    const coversTactics = /(tattica|execution|implementazione|rollout)/i.test(answer);
    const coversMetrics = /(misura|measure|track|monitor|metric)/i.test(answer);
    
    if (coversStrategy) score += 0.5;
    if (coversTactics) score += 0.5;
    if (coversMetrics) score += 0.5;
    
    return Math.min(score, 10);
  }

  // ACTIONABILITY CHECK (15% peso) 
  function checkActionability(answer) {
    let score = 5; // Base
    
    // Azioni concrete identificate
    const hasActions = /(will|sarò|farò|implement|deploy|launch|create|build)/i.test(answer);
    const hasSteps = /(step|fase|primo|secondo|then|poi|dopo)/i.test(answer);
    
    if (hasActions) score += 2;
    if (hasSteps) score += 1.5;
    
    // Next steps chiari
    const hasNextSteps = /(next step|prossimo passo|successivamente|quindi)/i.test(answer);
    const hasPriorities = /(priorità|priority|first|prima|inizialmente)/i.test(answer);
    
    if (hasNextSteps) score += 1;
    if (hasPriorities) score += 1;
    
    // Criteri di successo definiti
    const hasSuccess = /(success|successo|achievement|risultato|outcome)/i.test(answer);
    const hasCriteria = /(criteri|criteria|soglia|threshold|when|quando)/i.test(answer);
    
    if (hasSuccess) score += 0.5;
    if (hasCriteria) score += 0.5;
    
    return Math.min(score, 10);
  }

  // GAP IDENTIFICATION
  function identifyGaps(answer, specificity, alignment, completeness, actionability) {
    const gaps = [];
    
    if (specificity < 6) gaps.push("Mancano metriche concrete, percentuali o timeline specifiche");
    if (alignment < 6) gaps.push("Scarso allineamento con best practices del settore");  
    if (completeness < 6) gaps.push("Risposta incompleta - mancano aspetti strategici o tattici");
    if (actionability < 6) gaps.push("Azioni poco concrete - servono next steps più chiari");
    
    return gaps;
  }

  // STRENGTHS IDENTIFICATION
  function identifyStrengths(answer, specificity, alignment, completeness, actionability) {
    const strengths = [];
    
    if (specificity >= 8) strengths.push("Ottima specificità con metriche e timeline concrete");
    if (alignment >= 8) strengths.push("Forte allineamento con best practices del verticale");
    if (completeness >= 8) strengths.push("Risposta completa e ben strutturata");
    if (actionability >= 8) strengths.push("Azioni chiare e criteri di successo definiti");
    
    return strengths;
  }

  // UTILITY
  function countKeywords(answer, keywords) {
    if (!keywords) return 0;
    return keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length;
  }

  function generateTextBasedPrompt(analysisData, validationAnswers) {
    // Analizza ogni risposta con advanced scoring
    const textAnalysis = {};
    Object.entries(validationAnswers).forEach(([dimension, answer]) => {
      textAnalysis[dimension] = analyzeTextAnswer(answer, dimension, analysisData);
    });
    
    return { textAnalysis };
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysisData, validationAnswers, language = 'it' } = req.body;

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
    const scoringPrompt = createScoringPrompt(analysisData, validationAnswers, textAnalysis, language);


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
        max_tokens: 4000,
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
    const parsedScoring = parseScoringResponse(scoringText, language);

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
function parseScoringResponse(text, language = 'it') {
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

    // Estrai risk assessment con logging più dettagliato
    const risks = [];
    console.log('🔍 PARSING RISKS FROM TEXT:');
    console.log('Text length:', text.length);
    console.log('Risk section preview:', text.substring(text.indexOf('RISK ASSESSMENT'), text.indexOf('RISK ASSESSMENT') + 500));
    
    // Prima prova con regex specifica
    const riskRegex = /Rischio\s*\d+:[^]*?Fattore:\s*([^\\n]+)[^]*?Livello:\s*(\w+)[^]*?Descrizione:\s*([^\\n]+)[^]*?Mitigazione:\s*([^\\n]+)/gi;
    let riskMatch;
    
    while ((riskMatch = riskRegex.exec(text)) !== null && risks.length < 3) {
      console.log('📝 Risk match found:', riskMatch);
      risks.push({
        factor: riskMatch[1].trim(),
        level: riskMatch[2].trim(),
        description: riskMatch[3].trim(),
        mitigation: riskMatch[4].trim()
      });
    }
    
    // Se non funziona, prova approccio alternativo per sezioni
    if (risks.length === 0) {
      console.log('🔄 Trying alternative risk parsing...');
      const riskSection = text.match(/RISK ASSESSMENT.*?(?=\n\n|\n###|\n\d\.|$)/s);
      if (riskSection) {
        console.log('📄 Risk section found:', riskSection[0].substring(0, 300));
        
        // Parsing alternativo con pattern più flessibili
        const simpleRiskRegex = /-?\s*([^:]+?):\s*(Alto|Medio|Basso|High|Medium|Low)/gi;
        let simpleMatch;
        let riskIndex = 1;
        
        while ((simpleMatch = simpleRiskRegex.exec(riskSection[0])) !== null && risks.length < 3) {
          risks.push({
            factor: simpleMatch[1].trim(),
            level: simpleMatch[2].trim(),
            description: `Risk ${riskIndex} identified in analysis`,
            mitigation: "Monitor and mitigate through continuous evaluation"
          });
          riskIndex++;
        }
      }
    }
    
    console.log('📊 Total risks parsed:', risks.length);

    // Se non troviamo rischi, aggiungi default
    if (risks.length === 0) {
      const isEnglish = language === 'en';
      risks.push({
        factor: isEnglish ? "Technology Adoption" : "Adozione Tecnologica",
        level: isEnglish ? "Medium" : "Medio",
        description: isEnglish ? "Possible challenges in implementing the proposed technology" : "Possibili sfide nell'implementazione della tecnologia proposta",
        mitigation: isEnglish ? "Incremental development with continuous validation" : "Sviluppo incrementale con validazione continua"
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
      overall: { score: 7.0, rating: language === 'en' ? "Promising" : "Promettente" },
      dimensions: [
        { name: "Jobs-to-be-Done Alignment", score: 7, rationale: language === 'en' ? "Alignment identified with sector patterns" : "Allineamento identificato con i pattern del settore" },
        { name: "Technology & Data Strategy", score: 7, rationale: language === 'en' ? "Technology stack consistent with best practices" : "Stack tecnologico coerente con best practices" },
        { name: "Business Model Approach", score: 7, rationale: language === 'en' ? "Model validated by similar case studies" : "Modello validato da case studies simili" },
        { name: "Market Entry Strategy", score: 7, rationale: language === 'en' ? "Strategy aligned with vertical successes" : "Strategia allineata con successi del verticale" },
        { name: "Competitive Positioning", score: 7, rationale: language === 'en' ? "Differentiating factors identified" : "Fattori differenzianti identificati" },
        { name: "Partnership Potential", score: 7, rationale: language === 'en' ? "Strategic partnership opportunities" : "Opportunità di partnership strategiche" }
      ],
      risks: [
        {
          factor: language === 'en' ? "Market Validation" : "Validazione Mercato",
          level: language === 'en' ? "Medium" : "Medio",
          description: language === 'en' ? "Validation needed with early adopters" : "Necessaria validazione con early adopters",
          mitigation: language === 'en' ? "Pilot program with selected partners" : "Pilot program con partner selezionati"
        }
      ]
    };
  }
}

// 🌍 MULTILINGUAL SCORING PROMPT GENERATOR
function createScoringPrompt(analysisData, validationAnswers, textAnalysis, language) {
  const isEnglish = language === 'en';
  
  return `
${isEnglish 
  ? 'You are an Innovation Expert who must generate calibrated scoring based on the previous analysis and TEXTUAL validation responses.'
  : 'Sei un Innovation Expert che deve generare uno scoring calibrato basato sull\'analisi precedente e le risposte di validazione TESTUALI.'
}

=== ${isEnglish ? 'PREVIOUS ANALYSIS' : 'ANALISI PRECEDENTE'} ===
${JSON.stringify(analysisData.analysis || analysisData, null, 2).substring(0, 2000)}

=== ${isEnglish ? 'TEXTUAL VALIDATION RESPONSES' : 'RISPOSTE TESTUALI VALIDAZIONE'} ===
${Object.entries(validationAnswers).map(([dimension, answer]) => 
  `${dimension}: "${answer.substring(0, 200)}..."`
).join('\n\n')}

=== ${isEnglish ? 'AUTOMATIC RESPONSE ANALYSIS' : 'ANALISI AUTOMATICA RISPOSTE'} ===
${Object.entries(textAnalysis).map(([dimension, analysis]) => 
  `${dimension}: ${isEnglish ? 'Keywords found' : 'Keywords trovate'}: ${analysis.keywordsFound}, ${isEnglish ? 'Words' : 'Parole'}: ${analysis.wordCount}, ${isEnglish ? 'Specificity' : 'Specificità'}: ${analysis.hasSpecifics ? (isEnglish ? 'YES' : 'SI') : 'NO'}, Pre-score: ${analysis.score}/10`
).join('\n')}

=== ${isEnglish ? 'GENERATE CALIBRATED SCORING' : 'GENERA SCORING CALIBRATO'} ===

${isEnglish ? 'Based on:' : 'Basandoti su:'}
${isEnglish ? '1. Quality and specificity of textual responses' : '1. Qualità e specificità delle risposte testuali'}
${isEnglish ? '2. Presence of concrete metrics and timelines' : '2. Presenza di metriche concrete e timeline'}
${isEnglish ? '3. Alignment with vertical best practices' : '3. Allineamento con best practices del verticale'}
${isEnglish ? '4. Pre-score from automatic analysis (use as base but can adjust ±2 points)' : '4. Pre-score dall\'analisi automatica (usa come base ma puoi aggiustare ±2 punti)'}

${isEnglish ? 'REQUIRED FORMAT:' : 'FORMAT RICHIESTO:'}

${isEnglish ? '1. OVERALL SCORE' : '1. OVERALL SCORE'}
- Score: [X.X/10]
- Rating: [${isEnglish ? 'choose between: "Highly Promising", "Promising", "Moderate", "Needs Refinement"' : 'scegli tra: "Altamente Promettente", "Promettente", "Moderato", "Da Affinare"'}]

${isEnglish ? '2. SCORING BY DIMENSION (1-10 each):' : '2. SCORING PER DIMENSIONE (1-10 ciascuna):'}

Jobs-to-be-Done Alignment:
- Score: [X/10]
- Rationale: [${isEnglish ? '1-2 sentences based on textual response quality' : '1-2 frasi basate sulla qualità della risposta testuale'}]

Technology & Data Strategy:
- Score: [X/10]
- Rationale: [${isEnglish ? '1-2 sentences based on response' : '1-2 frasi basate sulla risposta'}]

Business Model Approach:
- Score: [X/10]
- Rationale: [${isEnglish ? '1-2 sentences based on response' : '1-2 frasi basate sulla risposta'}]

Market Entry Strategy:
- Score: [X/10]
- Rationale: [${isEnglish ? '1-2 sentences based on response' : '1-2 frasi basate sulla risposta'}]

Competitive Positioning:
- Score: [X/10]
- Rationale: [${isEnglish ? '1-2 sentences based on response' : '1-2 frasi basate sulla risposta'}]

Partnership Potential:
- Score: [X/10]
- Rationale: [${isEnglish ? '1-2 sentences based on response' : '1-2 frasi basate sulla risposta'}]

3. RISK ASSESSMENT

${isEnglish ? 'Risk 1:' : 'Rischio 1:'}
- ${isEnglish ? 'Factor' : 'Fattore'}: [${isEnglish ? 'identify from response quality' : 'identifica dalla qualità delle risposte'}]
- ${isEnglish ? 'Level' : 'Livello'}: [${isEnglish ? 'High/Medium/Low' : 'Alto/Medio/Basso'}]
- ${isEnglish ? 'Description' : 'Descrizione'}: [${isEnglish ? '1-2 sentences' : '1-2 frasi'}]
- ${isEnglish ? 'Mitigation' : 'Mitigazione'}: [${isEnglish ? 'suggested strategy' : 'strategia suggerita'}]

${isEnglish ? 'Risk 2:' : 'Rischio 2:'}
- ${isEnglish ? 'Factor' : 'Fattore'}: [${isEnglish ? 'second risk' : 'secondo rischio'}]
- ${isEnglish ? 'Level' : 'Livello'}: [${isEnglish ? 'High/Medium/Low' : 'Alto/Medio/Basso'}]
- ${isEnglish ? 'Description' : 'Descrizione'}: [${isEnglish ? '1-2 sentences' : '1-2 frasi'}]
- ${isEnglish ? 'Mitigation' : 'Mitigazione'}: [${isEnglish ? 'suggested strategy' : 'strategia suggerita'}]

${isEnglish ? 'IMPORTANT:' : 'IMPORTANTE:'}
- ${isEnglish ? 'Evaluate QUALITY and SPECIFICITY of textual responses' : 'Valuta la QUALITÀ e SPECIFICITÀ delle risposte testuali'}
- ${isEnglish ? 'Vague or generic responses = lower score' : 'Risposte vaghe o generiche = score più basso'}
- ${isEnglish ? 'Responses with metrics and details = higher score' : 'Risposte con metriche e dettagli = score più alto'}
- ${isEnglish ? 'Overall score = weighted average of 6 dimensions' : 'Overall score = media ponderata delle 6 dimensioni'}
`;
}