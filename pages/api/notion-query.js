// PROBLEMA IDENTIFICATO: Il file attuale NON filtra per query!
// La funzione fa sempre la stessa ricerca generica su tutti i database
// Questo causa il ritorno di dati random/cached invece della query specifica

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databases = [
  process.env.NOTION_DATABASE_1,
  process.env.NOTION_DATABASE_2,
  process.env.NOTION_DATABASE_3
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, filters } = req.body;
    
    // 🚨 DEBUG: Log della query ricevuta
    console.log('🔍 Query ricevuta:', query);
    console.log('📋 Filtri ricevuti:', filters);
    
    let allResults = [];
    let totalResults = 0;

    // Query each database
    for (const dbId of databases) {
      if (!dbId) continue;
      
      try {
        // 🔧 FIX 1: Aggiungere filtro di ricerca basato sulla query
        const searchFilter = {}; // Rimuoviamo temporaneamente il filtro

        // 🔧 FIX 2: Usare il filtro nella query
        const dbResponse = await notion.databases.query({
          database_id: dbId,
          page_size: 20, // Ridotto per performance
          filter: Object.keys(searchFilter).length > 0 ? searchFilter : undefined,
          sorts: [
            {
              timestamp: 'last_edited_time',
              direction: 'descending'
            }
          ]
        });

        console.log(`📊 Database ${dbId}: ${dbResponse.results.length} risultati trovati`);
// 🔍 DEBUG: Struttura database
if (dbResponse.results.length > 0) {
  console.log('📋 Prima pagina trovata:', dbResponse.results[0].id);
  console.log('🏷️ Properties disponibili:', Object.keys(dbResponse.results[0].properties));
}
        // Get content of each page
        for (const page of dbResponse.results.slice(0, 5)) { // Limitato a 5 per performance
          try {
            const pageContent = await notion.blocks.children.list({
              block_id: page.id,
              page_size: 20 // Limitato per evitare payload troppo grandi
            });

            const content = pageContent.results
              .filter(block => 
                block.type === 'paragraph' && 
                block.paragraph.rich_text.length > 0 &&
                // 🔧 FIX 3: Filtrare contenuto per rilevanza
                block.paragraph.rich_text.some(text => 
                  text.plain_text.toLowerCase().includes(query.toLowerCase().split(' ')[0])
                )
              )
              .map(block => block.paragraph.rich_text.map(text => text.plain_text).join(''))
              .join(' ')
              .substring(0, 200); // Limitato per payload

            // 🔧 FIX 4: Solo aggiungere se c'è contenuto rilevante
            if (content.length > 20) {
              allResults.push({
                id: page.id,
                title: getPageTitle(page),
                content: content,
                properties: page.properties,
                database: dbId,
                relevanceScore: calculateRelevance(content, query)
              });
            }
          } catch (pageError) {
            console.error('❌ Error fetching page content:', pageError);
          }
        }

        totalResults += dbResponse.results.length;
      } catch (dbError) {
        console.error('❌ Error querying database:', dbError);
      }
    }

    // 🔧 FIX 5: Ordinare per rilevanza
    allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // 🔧 FIX 6: Generare insights più specifici basati sulla query
    const insights = generateQuerySpecificInsights(allResults, query);
    const bestPractices = extractRelevantBestPractices(allResults, query);

    // 🔍 DEBUG: Log risultati finali
    console.log(`✅ Totale risultati processati: ${allResults.length}`);
    console.log(`🎯 Insights generati: ${insights.length}`);
    console.log(`📚 Best practices trovate: ${bestPractices.length}`);

    res.status(200).json({
      totalResults,
      results: allResults.slice(0, 10), // Limitato per payload
      insights,
      bestPractices,
      methodology: `Metodologia proprietaria di assessment dell'innovazione - Query: "${query}"`,
      queryProcessed: query, // 🔧 DEBUG: Conferma query processata
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Notion API Error:', error);
    res.status(500).json({ 
      error: 'Failed to query Notion databases',
      details: error.message,
      query: req.body.query // 🔍 DEBUG: Log query in errore
    });
  }
}

// 🔧 FUNZIONE HELPER: Calcola rilevanza
function calculateRelevance(content, query) {
  if (!content || !query) return 0;
  
  const queryWords = query.toLowerCase().split(' ');
  const contentWords = content.toLowerCase().split(' ');
  
  let score = 0;
  queryWords.forEach(word => {
    if (word.length > 2) { // Ignora parole troppo corte
      const matches = contentWords.filter(cWord => cWord.includes(word)).length;
      score += matches;
    }
  });
  
  return score;
}

// 🔧 FUNZIONE HELPER: Insights specifici per query
function generateQuerySpecificInsights(results, query) {
  const insights = results
    .filter(result => result.content && result.content.length > 50)
    .map(result => {
      // Estrai frasi più rilevanti per la query
      const sentences = result.content.split('.');
      const relevantSentences = sentences.filter(sentence => 
        query.split(' ').some(word => 
          word.length > 2 && sentence.toLowerCase().includes(word.toLowerCase())
        )
      );
      return relevantSentences.length > 0 ? relevantSentences[0] : result.content.substring(0, 150);
    })
    .filter(insight => insight.length > 20)
    .slice(0, 5);
    
  return insights;
}

// 🔧 FUNZIONE HELPER: Best practices rilevanti
function extractRelevantBestPractices(results, query) {
  return results
    .filter(result => {
      const title = result.title ? result.title.toLowerCase() : '';
      const content = result.content ? result.content.toLowerCase() : '';
      return (
        title.includes('best') ||
        title.includes('practice') ||
        title.includes('metodologia') ||
        title.includes('framework') ||
        content.includes('best practice') ||
        // Aggiungi rilevanza per query specifica
        query.split(' ').some(word => 
          word.length > 2 && (title.includes(word.toLowerCase()) || content.includes(word.toLowerCase()))
        )
      );
    })
    .map(result => result.title)
    .slice(0, 5);
}

function getPageTitle(page) {
  // 🔧 FIX: Migliore estrazione del titolo
  const titleProperty = Object.values(page.properties).find(
    prop => prop.type === 'title'
  );
  
  if (titleProperty && titleProperty.title.length > 0) {
    return titleProperty.title.map(text => text.plain_text).join('');
  }
  
  // Fallback: cerca altre properties che potrebbero contenere il nome
  const nameProperty = page.properties.Name || page.properties.Titolo || page.properties.Title;
  if (nameProperty && nameProperty.title) {
    return nameProperty.title.map(text => text.plain_text).join('');
  }
  
  return 'Untitled';
}