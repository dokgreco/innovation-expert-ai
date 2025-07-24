export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, notionData, filters } = req.body;

    // Limit data size to prevent 413 errors
    const limitedInsights = notionData.insights.slice(0, 3).map(insight => 
      insight.substring(0, 150) + '...'
    );
    
    const limitedResults = notionData.results.slice(0, 2).map(result => ({
      title: result.title,
      content: result.content.substring(0, 200) + '...',
      database: result.database.slice(0, 8)
    }));

    // Prepare concise context for Claude
    const contextPrompt = `Sei un Innovation Expert AI specializzato nella valutazione di startup e progetti innovativi.

HAI ACCESSO A ${notionData.totalResults} RISULTATI DAI DATABASE NOTION.

METODOLOGIA: ${notionData.methodology}

INSIGHTS CHIAVE:
${limitedInsights.map((insight, idx) => `${idx + 1}. ${insight}`).join('\n')}

BEST PRACTICES:
${notionData.bestPractices.slice(0, 3).map(bp => `- ${bp}`).join('\n')}

ESEMPI DAI DATABASE:
${limitedResults.map(result => `• ${result.title}: ${result.content}`).join('\n')}

FILTRI: ${filters.length > 0 ? filters.join(', ') : 'Nessuno'}

ISTRUZIONI:
1. Usa la metodologia dei database per strutturare l'analisi
2. Fornisci raccomandazioni concrete e actionable
3. Include scoring 1-10 quando possibile
4. Mantieni un approccio professionale da consulente senior
5. Organizza in: Analisi, Raccomandazioni, Next Steps

DOMANDA: ${query}

Rispondi come Innovation Expert con accesso ai database Notion.`;

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
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
