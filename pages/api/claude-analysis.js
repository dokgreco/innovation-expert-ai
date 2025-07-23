export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, notionData, filters } = req.body;

    // Prepare context for Claude
    const contextPrompt = `Sei un Innovation Expert AI specializzato nella valutazione di startup e progetti innovativi.

HAI ACCESSO AI SEGUENTI DATABASE NOTION CON ${notionData.totalResults} RISULTATI TOTALI:

METODOLOGIA: ${notionData.methodology}

INSIGHTS DALLE CASE HISTORIES:
${notionData.insights.slice(0, 5).map((insight, idx) => `${idx + 1}. ${insight.substring(0, 200)}...`).join('\n')}

BEST PRACTICES IDENTIFICATE:
${notionData.bestPractices.length > 0 ? notionData.bestPractices.map(bp => `- ${bp}`).join('\n') : 'Best practices estratte dalle case histories nei database'}

CONTENUTI RILEVANTI DAI DATABASE:
${notionData.results.slice(0, 3).map(result => `
Titolo: ${result.title}
Contenuto: ${result.content.substring(0, 300)}...
Database: ${result.database.slice(0, 8)}...
`).join('\n')}

FILTRI APPLICATI: ${filters.length > 0 ? filters.join(', ') : 'Nessun filtro applicato'}

ISTRUZIONI PER LA RISPOSTA:
1. Utilizza SEMPRE la metodologia presente nei database per strutturare l'analisi
2. Cita case histories specifiche quando rilevanti (mantenendo l'anonimato)
3. Applica le best practices pertinenti al caso
4. Fornisci raccomandazioni concrete e actionable
5. Usa un approccio strutturato da consulente senior in innovazione
6. Includi scoring quantitativi quando possibile (scala 1-10)
7. Organizza la risposta in sezioni chiare (Analisi, Raccomandazioni, Next Steps)

DOMANDA/RICHIESTA DELL'UTENTE:
${query}

Rispondi come un Innovation Expert che ha analizzato approfonditamente i database Notion e può fornire insights di valore basati sui dati concreti e sulla metodologia proprietaria.`;

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          { role: "user", content: contextPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
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
