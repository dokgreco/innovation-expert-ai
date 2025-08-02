export default async function handler(req, res) {
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

    // Prepara il prompt calibrato per lo scoring
    const scoringPrompt = `
Sei un Innovation Expert che deve generare uno scoring calibrato basato sull'analisi precedente e le risposte di validazione.

=== ANALISI PRECEDENTE ===
${JSON.stringify(analysisData.analysis || analysisData, null, 2).substring(0, 2000)}

=== RISPOSTE VALIDAZIONE ===
${Object.entries(validationAnswers).map(([dimension, answer]) => 
  `${dimension}: ${answer}`
).join('\n')}

=== GENERA SCORING CALIBRATO ===

Basandoti ESCLUSIVAMENTE sui dati sopra e sui benchmark delle case histories analizzate, genera uno scoring strutturato:

FORMAT RICHIESTO:

1. OVERALL SCORE
- Score: [X.X/10]
- Rating: [scegli tra: "Altamente Promettente", "Promettente", "Moderato", "Da Affinare"]

2. SCORING PER DIMENSIONE (1-10 ciascuna):

Jobs-to-be-Done Alignment:
- Score: [X/10]
- Rationale: [1-2 frasi basate su case histories simili]

Technology & Data Strategy:
- Score: [X/10]
- Rationale: [1-2 frasi basate su convergenza tecnologica]

Business Model Approach:
- Score: [X/10]
- Rationale: [1-2 frasi basate su modelli validati]

Market Entry Strategy:
- Score: [X/10]
- Rationale: [1-2 frasi basate su strategie di successo]

Competitive Positioning:
- Score: [X/10]
- Rationale: [1-2 frasi basate su fattori differenzianti]

Partnership Potential:
- Score: [X/10]
- Rationale: [1-2 frasi basate su sinergie identificate]

3. RISK ASSESSMENT

Rischio 1:
- Fattore: [nome del rischio principale]
- Livello: [Alto/Medio/Basso]
- Descrizione: [1-2 frasi]
- Mitigazione: [strategia suggerita]

Rischio 2:
- Fattore: [secondo rischio]
- Livello: [Alto/Medio/Basso]
- Descrizione: [1-2 frasi]
- Mitigazione: [strategia suggerita]

IMPORTANTE:
- Usa SOLO informazioni dall'analisi precedente
- Calibra gli score basandoti sui benchmark citati
- Se la risposta validation è negativa, riduci lo score di quella dimensione
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
    res.status(500).json({ 
      error: 'Failed to generate scoring',
      details: error.message 
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