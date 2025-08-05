export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { section, question, analysisContext } = req.body;

    // Log per debug
    console.log('🎯 Section Q&A Request:', {
      section,
      question: question.substring(0, 50) + '...',
      hasContext: !!analysisContext
    });

    // Validazione input
    if (!section || !question || !analysisContext) {
      return res.status(400).json({ 
        error: 'Missing required fields: section, question, or analysisContext' 
      });
    }

    // Prepara il prompt specifico per sezione
    const sectionPrompts = {
      strategic: `Sei un Innovation Expert che sta approfondendo la sezione Strategic Patterns.

CONTESTO ANALISI ORIGINALE:
- Verticale: ${analysisContext.vertical || 'Non specificato'}
- Pattern Identificati: ${analysisContext.patterns || 'Non disponibili'}

L'utente ha chiesto: "${question}"

Rispondi in modo specifico e contestualizzato, citando i pattern strategici identificati nell'analisi. Focus su:
- Jobs-to-be-Done specifici per questo verticale
- Technology Stack consigliato basato sui pattern
- Business Model implications
- Strategic opportunities

Mantieni la risposta concisa (max 150 parole) e altamente rilevante.`,

      competitive: `Sei un Innovation Expert che sta approfondendo la sezione Competitive Analysis.

CONTESTO ANALISI ORIGINALE:
- Verticale: ${analysisContext.vertical || 'Non specificato'}
- Pattern Competitivi: ${analysisContext.patterns || 'Non disponibili'}

L'utente ha chiesto: "${question}"

Rispondi focalizzandoti su:
- Fattori di differenziazione competitiva
- Posizionamento di mercato
- Competitive advantages identificati
- Strategie di differenziazione

Usa esempi dai case studies se pertinenti. Max 150 parole.`,

      roadmap: `Sei un Innovation Expert che sta approfondendo la sezione GTM Roadmap.

CONTESTO ANALISI ORIGINALE:
- Roadmap: ${analysisContext.roadmap || 'Non specificato'}
- Verticale: ${analysisContext.vertical || 'Non specificato'}

L'utente ha chiesto: "${question}"

Rispondi con focus su:
- Timeline e milestones specifiche
- Priorità di implementazione
- Risk factors per ogni fase
- Dependencies critiche

Struttura la risposta in modo pratico e actionable. Max 150 parole.`,

      kor: `Sei un Innovation Expert che sta approfondendo la sezione KOR Framework.

CONTESTO ANALISI ORIGINALE:
- Metriche: ${analysisContext.metrics || 'Non specificate'}
- Verticale: ${analysisContext.vertical || 'Non specificato'}

L'utente ha chiesto: "${question}"

Rispondi concentrandoti su:
- KPIs specifici e misurabili
- Target quantitativi basati su benchmark
- Metriche di successo per questo verticale
- Tracking e monitoring strategy

Fornisci numeri e percentuali quando possibile. Max 150 parole.`,

      partners: `Sei un Innovation Expert che sta approfondendo la sezione Partner Strategy.

CONTESTO ANALISI ORIGINALE:
- Verticale: ${analysisContext.vertical || 'Non specificato'}
- Ecosystem: ${analysisContext.patterns || 'Non disponibile'}

L'utente ha chiesto: "${question}"

Rispondi focalizzandoti su:
- Tipologie di partnership strategiche
- Partner tecnologici vs commerciali
- Criteri di selezione partner
- Struttura delle partnership

Sii specifico per il verticale identificato. Max 150 parole.`
    };

    // Seleziona il prompt appropriato
    const contextPrompt = sectionPrompts[section] || sectionPrompts.strategic;

    // Chiama Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          { role: "user", content: contextPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.content[0].text;

    // Log successo
    console.log('✅ Section Q&A Response generated for:', section);

    res.status(200).json({
      answer,
      confidence: 0.85, // Puoi calcolare questo basandoti sulla qualità del contesto
      section,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Section Q&A Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate contextual response',
      details: error.message 
    });
  }
}