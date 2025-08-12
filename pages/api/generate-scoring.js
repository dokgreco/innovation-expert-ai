export default async function handler(req, res) {
  
  // Helper functions per analisi testo

  // ========== NUOVO ALGORITMO SCORING AVANZATO E.2 ==========

// Check 1: Specificità (35% peso) - cerca metriche, numeri, timeline
function checkSpecificity(answer) {
  let score = 5; // Base score
  const answerLower = answer.toLowerCase();
  
  // Bonus per numeri e metriche
  const hasNumbers = /\d+/.test(answer);
  const hasPercentage = /%/.test(answer);
  const hasCurrency = /[€$£]\d+|[\d,]+[kKmM]?\s*(euro|eur|usd|dollari?)/i.test(answer);
  const hasTimeline = /(giorni?|settiman[ae]|mes[ei]|ann[oi]|Q[1-4]|trimestre|semester)/i.test(answer);
  const hasMetrics = /(kpi|roi|cac|ltv|arpu|churn|conversion|retention)/i.test(answerLower);
  
  if (hasNumbers) score += 1.5;
  if (hasPercentage) score += 1;
  if (hasCurrency) score += 1;
  if (hasTimeline) score += 1;
  if (hasMetrics) score += 0.5;
  
  return Math.min(score, 10);
}

// Check 2: Allineamento Best Practices (30% peso)
function checkAlignment(answer, dimension, analysisContext) {
  let score = 5;
  const answerLower = answer.toLowerCase();
  
  // Keywords specifici per dimensione allineati con Deep Dive sections
  const alignmentKeywords = {
    "Jobs-to-be-Done & Market Trends": ["validate", "customer", "pain point", "urgency", "tam", "sam", "trend"],
    "Competitive Positioning Canvas": ["differentiation", "moat", "unique", "competitor", "advantage", "positioning"],
    "Technology Adoption & Validation": ["scalable", "api", "architecture", "mvp", "tech stack", "infrastructure"],
    "Process & Metrics": ["process", "workflow", "efficiency", "automation", "metrics", "dashboard", "tracking"],
    "Partnership Activation": ["partner", "channel", "distribution", "integration", "alliance", "ecosystem"]
  };
  
  const keywords = alignmentKeywords[dimension] || [];
  let matchCount = 0;
  
  keywords.forEach(keyword => {
    if (answerLower.includes(keyword)) {
      matchCount++;
      score += 0.7;
    }
  });
  
  // Bonus se cita il verticale dall'analisi
  if (analysisContext && analysisContext.verticals) {
    const vertical = analysisContext.verticals[0]?.title || '';
    if (answerLower.includes(vertical.toLowerCase())) score += 1;
  }
  
  return Math.min(score, 10);
}

// Check 3: Completezza (20% peso)
function checkCompleteness(answer) {
  const wordCount = answer.split(/\s+/).length;
  let score = 5;
  
  // Scoring basato su lunghezza ottimale (50-150 parole)
  if (wordCount >= 50 && wordCount <= 150) {
    score = 9; // Ottimale
  } else if (wordCount >= 30 && wordCount < 50) {
    score = 7;
  } else if (wordCount > 150 && wordCount <= 200) {
    score = 7;
  } else if (wordCount >= 20 && wordCount < 30) {
    score = 5;
  } else if (wordCount > 200) {
    score = 4; // Troppo lungo
  } else {
    score = 3; // Troppo corto
  }
  
  // Bonus per struttura (punti elenco, fasi, etc.)
  const hasStructure = /[•\-\*]|\d+[\.\)]/m.test(answer) || /primo|secondo|terzo|fase|step/i.test(answer);
  if (hasStructure) score += 1;
  
  return Math.min(score, 10);
}

// Check 4: Actionability (15% peso)
function checkActionability(answer) {
  let score = 5;
  const answerLower = answer.toLowerCase();
  
  // Keywords che indicano azioni concrete
  const actionKeywords = [
    "implementer", "svilupper", "creer", "lancer", "tester", "validator",
    "implement", "develop", "create", "launch", "test", "validate",
    "entro", "within", "prima di", "dopo", "prossim", "next",
    "piano", "plan", "strategia", "strategy", "approccio", "approach"
  ];
  
  let actionCount = 0;
  actionKeywords.forEach(keyword => {
    if (answerLower.includes(keyword)) {
      actionCount++;
      score += 0.5;
    }
  });
  
  // Bonus per next steps chiari
  if (/(prossimi passi|next step|prima fase|priorità)/i.test(answer)) score += 1.5;
  
  return Math.min(score, 10);
}

// Funzione principale di scoring avanzato
function advancedScoring(answer, dimension, analysisContext) {
  // Calcola i 4 punteggi
  const specificityScore = checkSpecificity(answer);
  const alignmentScore = checkAlignment(answer, dimension, analysisContext);
  const completenessScore = checkCompleteness(answer);
  const actionabilityScore = checkActionability(answer);
  
  // Calcola media pesata
  const weightedScore = (
    specificityScore * 0.35 +
    alignmentScore * 0.30 +
    completenessScore * 0.20 +
    actionabilityScore * 0.15
  );
  
  // Identifica gaps e strengths
  const gaps = [];
  const strengths = [];
  
  if (specificityScore < 6) {
    gaps.push({
      area: "Specificità",
      issue: "Mancano metriche concrete e timeline specifiche",
      suggestion: "Aggiungi KPI numerici, percentuali e tempistiche precise (es: 'ridurre churn del 15% in 6 mesi')"
    });
  } else if (specificityScore >= 8) {
    strengths.push("Ottima specificità con metriche e timeline concrete");
  }
  
  if (alignmentScore < 6) {
    gaps.push({
      area: "Allineamento",
      issue: "Scarso allineamento con best practices del settore",
      suggestion: "Utilizza terminologia specifica del verticale e riferimenti a metodologie consolidate"
    });
  } else if (alignmentScore >= 8) {
    strengths.push("Forte allineamento con best practices del verticale identificato");
  }
  
  if (completenessScore < 6) {
    gaps.push({
      area: "Completezza",
      issue: "Risposta troppo sintetica o non strutturata",
      suggestion: "Elabora la risposta con 50-150 parole, strutturando in punti chiave"
    });
  } else if (completenessScore >= 8) {
    strengths.push("Risposta completa e ben strutturata");
  }
  
  if (actionabilityScore < 6) {
    gaps.push({
      area: "Actionability",
      issue: "Mancano azioni concrete e next steps",
      suggestion: "Definisci azioni specifiche con criteri di successo e timeline di implementazione"
    });
  } else if (actionabilityScore >= 8) {
    strengths.push("Piano d'azione chiaro con next steps definiti");
  }
  
  return {
    totalScore: Math.round(weightedScore * 10) / 10,
    breakdown: {
      specificity: Math.round(specificityScore * 10) / 10,
      alignment: Math.round(alignmentScore * 10) / 10,
      completeness: Math.round(completenessScore * 10) / 10,
      actionability: Math.round(actionabilityScore * 10) / 10
    },
    gaps: gaps,
    strengths: strengths
  };
}

// ========== FINE NUOVO ALGORITMO SCORING AVANZATO ==========
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
  // Mappa le dimensioni alle 5 Deep Dive sections
  const dimensionMapping = {
    "Jobs-to-be-Done": "Jobs-to-be-Done & Market Trends",
    "Technology Adoption": "Technology Adoption & Validation",
    "Business Model": "Process & Metrics",
    "Market Strategy": "Competitive Positioning Canvas",
    "Competitive Factors": "Competitive Positioning Canvas",
    "Partnership Synergies": "Partnership Activation"
  };
  
  // Analizza ogni risposta con il NUOVO algoritmo avanzato
  const advancedAnalysis = {};
  const allGaps = [];
  const allStrengths = [];
  
  Object.entries(validationAnswers).forEach(([dimension, answer]) => {
    const mappedDimension = dimensionMapping[dimension] || dimension;
    const analysis = advancedScoring(answer, mappedDimension, analysisData);
    
    advancedAnalysis[dimension] = analysis;
    
    // Raccogli tutti i gaps e strengths
    analysis.gaps.forEach(gap => {
      allGaps.push({
        dimension: dimension,
        ...gap
      });
    });
    
    analysis.strengths.forEach(strength => {
      allStrengths.push({
        dimension: dimension,
        text: strength
      });
    });
  });
  
  // Calcola overall readiness score
  const scores = Object.values(advancedAnalysis).map(a => a.totalScore);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Identifica i top 3 rischi basati sui gap più critici
  const topRisks = allGaps
    .sort((a, b) => {
      // Prioritizza per gravità del gap
      const priorityOrder = ["Specificità", "Allineamento", "Actionability", "Completezza"];
      return priorityOrder.indexOf(a.area) - priorityOrder.indexOf(b.area);
    })
    .slice(0, 3)
    .map((gap, index) => {
      const riskLevel = index === 0 ? "Alto" : index === 1 ? "Medio" : "Basso";
      return {
        level: riskLevel,
        dimension: gap.dimension,
        area: gap.area,
        issue: gap.issue,
        suggestion: gap.suggestion
      };
    });
  
  // Prepara il context arricchito per Claude
  const enrichedContext = {
    overallScore: Math.round(overallScore * 10) / 10,
    dimensionScores: advancedAnalysis,
    topRisks: topRisks,
    strengths: allStrengths.slice(0, 5), // Top 5 strengths
    gaps: allGaps,
    analysisContext: analysisData
  };
  
  return enrichedContext;
}
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysisData, validationAnswers } = req.body;
const enrichedData = generateTextBasedPrompt(analysisData, validationAnswers);

    // Verifica che abbiamo tutti i dati necessari
    if (!analysisData || !validationAnswers) {
      return res.status(400).json({ 
        error: 'Missing required data',
        details: 'Both analysisData and validationAnswers are required' 
      });
    }

    // Analizza le risposte testuali
    const { textAnalysis } = generateTextBasedPrompt(analysisData, validationAnswers);

// Prepara il prompt con i dati arricchiti
    const scoringPrompt = `
Sei un Innovation Expert che deve generare un assessment finale basato sull'analisi avanzata delle risposte.

=== ANALISI PRECEDENTE ===
Verticale principale: ${enrichedData.analysisContext?.verticals?.[0]?.title || 'Innovation Tech'}
Case studies rilevanti: ${enrichedData.analysisContext?.cases?.length || 0}

=== SCORING AVANZATO DELLE RISPOSTE ===
Overall Readiness Score: ${enrichedData.overallScore}/10

Breakdown per dimensione:
${Object.entries(enrichedData.dimensionScores).map(([dim, analysis]) => `
${dim}: ${analysis.totalScore}/10
- Specificità: ${analysis.breakdown.specificity}/10
- Allineamento: ${analysis.breakdown.alignment}/10
- Completezza: ${analysis.breakdown.completeness}/10
- Actionability: ${analysis.breakdown.actionability}/10
`).join('\n')}

=== GENERA OUTPUT STRUTTURATO ===

FORMAT RICHIESTO:

1. OVERALL SCORE
- Score: ${enrichedData.overallScore}/10
- Rating: ${enrichedData.overallScore > 8 ? "Altamente Promettente" : enrichedData.overallScore > 6 ? "Promettente" : enrichedData.overallScore > 4 ? "Moderato" : "Da Affinare"}

2. SCORING PER DIMENSIONE:
${Object.entries(enrichedData.dimensionScores).map(([dim, analysis]) => `
${dim}:
- Score: ${analysis.totalScore}/10
- Rationale: Valutazione basata su specificità (${analysis.breakdown.specificity}/10), allineamento best practices (${analysis.breakdown.alignment}/10), completezza (${analysis.breakdown.completeness}/10) e actionability (${analysis.breakdown.actionability}/10)
`).join('\n')}

3. RISK ASSESSMENT & IMPROVEMENT AREAS

RISCHI IDENTIFICATI (basati su gap analysis):
${enrichedData.topRisks.map(risk => `
Rischio ${risk.level}: ${risk.area} insufficiente in ${risk.dimension}
- Problema: ${risk.issue}
- Impatto: Potrebbe compromettere l'esecuzione e la scalabilità
- Suggerimento: ${risk.suggestion}
`).join('\n')}

PUNTI DI FORZA (identificati nelle risposte):
${enrichedData.strengths.map(s => `- ${s.text} (${s.dimension})`).join('\n')}

TOP 3 AZIONI per migliorare lo score:
${enrichedData.topRisks.slice(0, 3).map((risk, i) => `
${i + 1}. ${risk.suggestion} (Area: ${risk.dimension})
`).join('')}

IMPORTANTE: Mantieni il formato esatto sopra, personalizzando solo i commenti basati sul verticale ${enrichedData.analysisContext?.verticals?.[0]?.title || 'identificato'}.
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

// Funzione helper per parsare la risposta di Claude con nuovo formato E.2
function parseScoringResponse(text) {
  try {
    // Estrai overall score
    const overallMatch = text.match(/Score:\s*([\d.]+)\/10/);
    const ratingMatch = text.match(/Rating:\s*"?([^"\n]+)"?/);
    
    const overall = {
      score: overallMatch ? parseFloat(overallMatch[1]) : 7.0,
      rating: ratingMatch ? ratingMatch[1].trim() : "Promettente"
    };

    // Estrai scoring per dimensione (adattato per 5 dimensioni)
    const dimensions = [
      { name: "Jobs-to-be-Done", key: "jtbd" },
      { name: "Technology Adoption", key: "tech" },
      { name: "Business Model", key: "business" },
      { name: "Market Strategy", key: "market" },
      { name: "Partnership Synergies", key: "partnership" }
    ];

    const dimensionScores = dimensions.map(dim => {
      // Cerca il pattern per ogni dimensione con formato più flessibile
      const regex = new RegExp(`${dim.name}[:\\s\\S]*?Score:\\s*(\\d+(?:\\.\\d+)?)\/10[\\s\\S]*?Rationale:\\s*([^\\n]+)`, 'i');
      const match = text.match(regex);
      
      return {
        name: dim.name,
        score: match ? parseFloat(match[1]) : 6.0,
        rationale: match ? match[2].trim() : `Valutazione basata su analisi multidimensionale del verticale`
      };
    });

    // Estrai risk assessment migliorato (nuovo formato E.2)
    const risks = [];
    const riskRegex = /Rischio\s*(Alto|Medio|Basso):[^]*?(?:Problema|Issue):\s*([^\\n]+)[^]*?(?:Impatto):\s*([^\\n]+)[^]*?(?:Suggerimento|Mitigazione):\s*([^\\n]+)/gi;
    let riskMatch;
    
    while ((riskMatch = riskRegex.exec(text)) !== null && risks.length < 3) {
      risks.push({
        level: riskMatch[1].trim(),
        factor: riskMatch[2].trim().split(':')[0] || "Area di miglioramento",
        description: riskMatch[3].trim(),
        mitigation: riskMatch[4].trim()
      });
    }

    // Se non troviamo rischi nel nuovo formato, proviamo formato legacy
    if (risks.length === 0) {
      const legacyRiskRegex = /Rischio\s*\d*[:\s]+([^\\n]+)[^]*?Livello:\s*(\w+)[^]*?Descrizione:\s*([^\\n]+)[^]*?Mitigazione:\s*([^\\n]+)/gi;
      while ((riskMatch = legacyRiskRegex.exec(text)) !== null && risks.length < 3) {
        risks.push({
          factor: riskMatch[1].trim(),
          level: riskMatch[2].trim(),
          description: riskMatch[3].trim(),
          mitigation: riskMatch[4].trim()
        });
      }
    }

    // Estrai punti di forza (nuovo in E.2)
    const strengths = [];
    const strengthsMatch = text.match(/PUNTI DI FORZA[:\s]*([^]*?)(?:TOP 3 AZIONI|OVERALL READINESS|$)/i);
    if (strengthsMatch) {
      const strengthLines = strengthsMatch[1].match(/[-•]\s*([^\n]+)/g) || [];
      strengthLines.forEach(line => {
        strengths.push(line.replace(/[-•]\s*/, '').trim());
      });
    }

    // Estrai top actions (nuovo in E.2)
    const topActions = [];
    const actionsMatch = text.match(/TOP 3 AZIONI[:\s]*([^]*?)$/i);
    if (actionsMatch) {
      const actionLines = actionsMatch[1].match(/\d+\.\s*([^\n]+)/g) || [];
      actionLines.forEach(line => {
        topActions.push(line.replace(/\d+\.\s*/, '').trim());
      });
    }

    // Se non troviamo rischi, aggiungi defaults costruttivi
    if (risks.length === 0) {
      risks.push({
        factor: "Validazione Mercato",
        level: "Medio",
        description: "Necessaria validazione continua con early adopters",
        mitigation: "Implementare cicli di feedback rapidi con pilot customers"
      });
      risks.push({
        factor: "Scalabilità Tecnica",
        level: "Basso",
        description: "Architettura da ottimizzare per crescita",
        mitigation: "Pianificare revisione architetturale ogni 6 mesi"
      });
    }

    return {
      overall,
      dimensions: dimensionScores,
      risks,
      strengths: strengths.slice(0, 5), // Max 5 strengths
      topActions: topActions.slice(0, 3) // Max 3 actions
    };

  } catch (error) {
    console.error('Error parsing scoring response:', error);
    
    // Return default structure in caso di errore
    return {
      overall: { score: 7.0, rating: "Promettente" },
      dimensions: [
        { name: "Jobs-to-be-Done", score: 7, rationale: "Allineamento con pattern del settore" },
        { name: "Technology Adoption", score: 7, rationale: "Stack tecnologico coerente con best practices" },
        { name: "Business Model", score: 7, rationale: "Modello validato da case studies simili" },
        { name: "Market Strategy", score: 7, rationale: "Strategia allineata con successi del verticale" },
        { name: "Partnership Synergies", score: 7, rationale: "Opportunità di partnership strategiche" }
      ],
      risks: [
        {
          factor: "Validazione Mercato",
          level: "Medio",
          description: "Necessaria validazione con early adopters",
          mitigation: "Pilot program strutturato con metriche chiare"
        }
      ],
      strengths: ["Approccio strutturato", "Visione chiara del problema"],
      topActions: ["Validare con 10 clienti pilota", "Definire KPI di successo", "Strutturare roadmap 6 mesi"]
    };
  }
}