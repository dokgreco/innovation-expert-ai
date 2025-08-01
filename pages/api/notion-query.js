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
    const startTime = Date.now(); // Per calcolare il processing time
    
    // 🚨 DEBUG: Log della query ricevuta
    console.log('🔍 Query ricevuta:', query);
    console.log('📋 Filtri ricevuti:', filters);
    
    let allResults = [];
    let totalResults = 0;

    // Query each database
    for (const dbId of databases) {
      if (!dbId) continue;
      
      try {
        // 🔍 DEBUG DB2
    if (dbId === databases[1]) {
      console.log('🔍 DEBUG DB2 - Database ID:', dbId);
    }
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

        // 🔍 DEBUG: Log risultati per database
    console.log(`📊 Database ${databases.indexOf(dbId) + 1}: ${dbResponse.results.length} pages trovate`);
    
    // Se è DB2, mostra i primi 3 titoli
    if (dbId === databases[1] && dbResponse.results.length > 0) {
      console.log('🔍 DB2 Sample titles:');
      dbResponse.results.slice(0, 3).forEach((page, idx) => {
        const title = getPageTitle(page);
        console.log(`  ${idx + 1}. ${title}`);
      });
    }

        console.log(`📊 Database ${dbId}: ${dbResponse.results.length} risultati trovati`);
// 🔍 DEBUG: Struttura database
if (dbResponse.results.length > 0) {
  console.log('📋 Prima pagina trovata:', dbResponse.results[0].id);
  console.log('🏷️ Properties disponibili:', Object.keys(dbResponse.results[0].properties));
}
        // Get content of each page
for (const page of dbResponse.results.slice(0, 5)) { // Limitato a 5 per performance
  // 🔍 DEBUG DB2 Content
  if (dbId === databases[1]) {
    const title = getPageTitle(page);
    console.log(`🔍 DB2 Processing: "${title}"`);
  }
  
  try {
    const pageContent = await notion.blocks.children.list({
      block_id: page.id,
      page_size: 20 // Limitato per evitare payload troppo grandi
    });
            const content = pageContent.results
              .filter(block => 
  block.type === 'paragraph' && 
  block.paragraph.rich_text.length > 0
)
              .map(block => block.paragraph.rich_text.map(text => text.plain_text).join(''))
              .join(' ')
              .substring(0, 200); // Limitato per payload

            // 🔧 FIX 4: Solo aggiungere se c'è contenuto rilevante
const allProperties = extractAllProperties(page);
const relevanceScore = calculateRelevance(content, query, allProperties);

// 🔍 DEBUG: Log per capire perché DB2 non passa
if (dbId === databases[1]) {
  console.log(`🔍 DB2 Check - Title: "${getPageTitle(page)}", Content length: ${content.length}, Score: ${relevanceScore.toFixed(2)}`);
}

// MODIFICATO: Accetta anche se ha properties ricche, non solo content
if (content.length > 10 || relevanceScore > 5 || Object.keys(allProperties).length > 10) {
  allResults.push({
    id: page.id,
    title: getPageTitle(page),
    content: content,
    properties: allProperties,
    database: dbId,
    relevanceScore: relevanceScore
  });

  // 🔍 DEBUG: Log properties estratte
  if (allResults.length === 1) { // Solo per il primo risultato
    console.log('🏗️ ESEMPIO Properties estratte:', allResults[0].properties);
    console.log('📊 Numero properties:', Object.keys(allResults[0].properties).length);
  }
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

    // 📊 MONITORING: Verifica quale database sta fornendo più risultati
    console.log('📊 DATABASE USAGE ANALYSIS:');
    console.log(`DB1 (Verticals): ${allResults.filter(r => r.database === databases[0]).length} results`);
    console.log(`DB2 (Case Histories): ${allResults.filter(r => r.database === databases[1]).length} results`);
    console.log(`DB3 (Mixed): ${allResults.filter(r => r.database === databases[2]).length} results`);
    console.log('Top 5 by relevance:', allResults.slice(0, 5).map(r => ({
      db: databases.indexOf(r.database) + 1,
      score: r.relevanceScore?.toFixed(1),
      title: r.title.substring(0, 50) + '...' // Troncato per leggibilità
    })));

    // 🔧 FIX 6: Generare insights più specifici basati sulla query
    const insights = generateQuerySpecificInsights(allResults, query);
    const bestPractices = extractRelevantBestPractices(allResults, query);

    // 🔍 DEBUG: Log risultati finali
    console.log(`✅ Totale risultati processati: ${allResults.length}`);
    console.log(`🎯 Insights generati: ${insights.length}`);
    console.log(`📚 Best practices trovate: ${bestPractices.length}`);

    // 🆕 TASK 1.3: Implementazione metodologia 3-step
    
    // STEP 1: Identifica verticali (DB1)
    const verticalResults = allResults
      .filter(result => result.database === databases[0]) // Solo DB1
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // TOP 3 verticali
    
    // STEP 2: Identifica case histories (DB2 + DB3)
    const caseResults = allResults
      .filter(result => result.database === databases[1] || result.database === databases[2])
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // TOP 5 cases
    
    // STEP 3: Pattern convergence analysis
    const convergencePatterns = analyzeConvergencePatterns(caseResults);
    
    // Structured response secondo metodologia proprietaria
    res.status(200).json({
      methodology: {
        step1_verticals: {
          top3: verticalResults,
          framework: extractFramework(verticalResults)
        },
        step2_cases: {
          top5: caseResults,
          convergence: convergencePatterns
        },
        step3_insights: {
          technologies: convergencePatterns.technologies,
          businessModels: convergencePatterns.businessModels,
          strategies: convergencePatterns.strategies
        }
      },
      metadata: {
        totalScanned: totalResults,
        processingTime: `${Date.now() - startTime}ms`, // Aggiungeremo startTime dopo
        confidenceScore: calculateConfidenceScore(verticalResults, caseResults),
        queryProcessed: query,
        timestamp: new Date().toISOString()
      }
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
// 🔧 FUNZIONE MIGLIORATA: Calcola rilevanza con scoring avanzato
function calculateRelevance(content, query, properties = {}) {
  if (!query) return 0;
// Rimosso il check su content perché gestiremo i casi vuoti più avanti
  
  // Normalizza query e content
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  let score = 0;
  
  // 1. EXACT MATCH BONUS (peso 3x)
  if (contentLower.includes(queryLower)) {
    score += queryWords.length * 3;
  }
  
  // 2. WORD MATCH (peso 1x per ogni match)
  queryWords.forEach(word => {
    const regex = new RegExp(`\\b${word}`, 'gi');
    const matches = (contentLower.match(regex) || []).length;
    score += matches;
  });
  
  // 3. PROPERTY MATCH BONUS (peso 2x)
  if (properties) {
    const propertyText = Object.values(properties)
      .filter(val => typeof val === 'string')
      .join(' ')
      .toLowerCase();
    
    queryWords.forEach(word => {
      if (propertyText.includes(word)) {
        score += 2;
      }
    });
    
    // 4. PRIORITY FIELDS BONUS
    const priorityFields = ['JTDs', 'Business Model', 'Value Proposition', 'Technologies'];
    priorityFields.forEach(field => {
      if (properties[field] && typeof properties[field] === 'string') {
        const fieldValue = properties[field].toLowerCase();
        queryWords.forEach(word => {
          if (fieldValue.includes(word)) {
            score += 3; // Bonus extra per campi prioritari
          }
        });
      }
    });
  }
  
  // 🆕 SPECIAL CASE: Se non c'è content, usa properties per matching
  if (!content || content.length < 10) {
        
    // Cerca in TUTTE le properties che potrebbero contenere descrizioni
    const descriptionFields = [
      'Description', 'Description (ENG)', 'Descrizione',
      'Value Proposition', 'Value Proposition (ENG)',
      'JTDs', 'Impact', 'Impact (ENG)',
      'Technologies', 'Technologies (ENG)'
    ];
     
    let combinedText = '';
    descriptionFields.forEach(field => {
      if (properties[field]) {
        combinedText += ' ' + properties[field];
      }
    });
    
    combinedText = combinedText.toLowerCase();
    
    // Aumenta significativamente lo score per match senza content
    queryWords.forEach(word => {
      if (combinedText.includes(word)) {
        score += 10; // Peso MOLTO maggiore per compensare mancanza content
      }
    });
    
    // DEBUG generico (funziona per tutti)
    if (score > 0) {
      console.log(`📊 No-content match: "${query.substring(0, 30)}..." → Score: ${score}`);
    }
  }
  
  // 5. KEYWORD DENSITY FACTOR
  const totalWords = contentLower.split(/\s+/).length;
  const densityFactor = totalWords > 0 ? (score / totalWords) * 100 : 0;
  
  // Calcolo finale: score base + density factor
  const finalScore = score + (densityFactor * 0.5);
  
  // Log per debug (solo per i primi risultati)
  if (score > 5) {
    console.log(`📊 Relevance Score: ${finalScore.toFixed(2)} for content starting with: "${content.substring(0, 50)}..."`);
  }
  
  return finalScore;
}

// 🔧 NUOVA FUNZIONE: Semantic matching per verticali (DB1)
function calculateVerticalSimilarity(query, properties) {
  if (!query || !properties) return 0;
  
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  let score = 0;
  
  // 1. Keywords matching (peso 2x)
  if (properties.Keywords) {
    const keywords = properties.Keywords.toLowerCase();
    queryWords.forEach(word => {
      if (keywords.includes(word)) {
        score += 2;
      }
    });
  }
  
  // 2. Title/Vertical matching (peso 1x)
  const titleFields = ['Project Vertical', 'Vertical', 'Innovation Verticals'];
  titleFields.forEach(field => {
    if (properties[field]) {
      const value = properties[field].toLowerCase();
      queryWords.forEach(word => {
        if (value.includes(word)) {
          score += 1;
        }
      });
    }
  });
  
  // 3. Technology alignment (peso 1x)
  const techFields = ['Technology Adoption & Validation', 'Technologies', 'Tech Stack'];
  techFields.forEach(field => {
    if (properties[field]) {
      const value = properties[field].toLowerCase();
      queryWords.forEach(word => {
        if (value.includes(word)) {
          score += 1;
        }
      });
    }
  });
  
  // Normalizza score 0-100
  const maxPossibleScore = queryWords.length * 4; // max 4 punti per parola
  const normalizedScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
  
  return Math.min(normalizedScore, 100);
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


// 🔧 NUOVA FUNZIONE: Estrae TUTTE le properties in modo leggibile
function extractAllProperties(page) {
  const properties = {};
  
  // Lista delle properties prioritarie da cercare
  const priorityFields = [
    'JTDs', 'Jobs to be Done', 'Jobs-to-be-Done',
    'Business Model', 'Business Model - Best Practice',
    'Technology Adoption & Validation', 'Technology Adoption',
    'KOR', 'Key Results', 'OKR',
    'Market Type Strategy', 'Market Strategy',
    'Competing Factors', 'Competition',
    'Description', 'Descrizione',
    'Impact', 'Impatto',
    'Technologies', 'Tecnologie', 'Tech Stack',
    'Value Proposition', 'Value Prop',
    'Classification', 'Classificazione', 'Category'
  ];
  
  // Estrai ogni property
  Object.entries(page.properties).forEach(([key, value]) => {
    try {
      switch(value.type) {
        case 'title':
          if (value.title && value.title.length > 0) {
            properties[key] = value.title.map(t => t.plain_text).join('');
          }
          break;
          
        case 'rich_text':
          if (value.rich_text && value.rich_text.length > 0) {
            properties[key] = value.rich_text.map(t => t.plain_text).join('');
          }
          break;
          
        case 'select':
          if (value.select) {
            properties[key] = value.select.name;
          }
          break;
          
        case 'multi_select':
          if (value.multi_select && value.multi_select.length > 0) {
            properties[key] = value.multi_select.map(s => s.name).join(', ');
          }
          break;
          
        case 'number':
          if (value.number !== null) {
            properties[key] = value.number;
          }
          break;
          
        case 'checkbox':
          properties[key] = value.checkbox || false;
          break;
          
        case 'url':
          if (value.url) {
            properties[key] = value.url;
          }
          break;
          
        case 'date':
          if (value.date) {
            properties[key] = value.date.start;
          }
          break;
          
        case 'formula':
          if (value.formula) {
            properties[key] = value.formula.string || value.formula.number;
          }
          break;
          
        default:
          // Log per vedere se ci sono altri tipi
          console.log(`📝 Tipo property non gestito: ${value.type}`);
      }
    } catch (err) {
      console.error(`❌ Errore estrazione property ${key}:`, err);
    }
  });
  
  // Log per debug
  const foundPriorityFields = priorityFields.filter(field => 
    Object.keys(properties).some(key => key.toLowerCase().includes(field.toLowerCase()))
  );
  
  console.log(`✅ Properties estratte: ${Object.keys(properties).length}`);
  console.log(`🎯 Priority fields trovati: ${foundPriorityFields.join(', ')}`);
  
  return properties;
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

// 🆕 FUNZIONI HELPER PER METODOLOGIA 3-STEP

function extractFramework(verticalResults) {
  const framework = {
    jtds: [],
    businessModels: [],
    technologies: [],
    strategies: []
  };
  
  verticalResults.forEach(vertical => {
    if (vertical.properties) {
      // Estrai JTDs
      const jtdFields = ['JTDs', 'Jobs to be Done', 'Jobs-to-be-Done'];
      jtdFields.forEach(field => {
        if (vertical.properties[field]) {
          framework.jtds.push(vertical.properties[field]);
        }
      });
      
      // Estrai Business Models
      const bmFields = ['Business Model', 'Business Model - Best Practice'];
      bmFields.forEach(field => {
        if (vertical.properties[field]) {
          framework.businessModels.push(vertical.properties[field]);
        }
      });
      
      // Estrai Technologies
      const techFields = ['Technology Adoption & Validation', 'Technologies', 'Tech Stack'];
      techFields.forEach(field => {
        if (vertical.properties[field]) {
          framework.technologies.push(vertical.properties[field]);
        }
      });
      
      // Estrai Strategies
      const stratFields = ['Market Type Strategy', 'Market Strategy'];
      stratFields.forEach(field => {
        if (vertical.properties[field]) {
          framework.strategies.push(vertical.properties[field]);
        }
      });
    }
  });
  
  return framework;
}

function analyzeConvergencePatterns(caseResults) {
  const patterns = {
    technologies: [],
    businessModels: [],
    strategies: [],
    lessonsLearned: []
  };
  
  // Conta frequenza di pattern comuni
  const techFrequency = {};
  const bmFrequency = {};
  const stratFrequency = {};
  
  caseResults.forEach(caseResult => {
    if (caseResult.properties) {
      // Analizza tecnologie
      const techValue = caseResult.properties.Technologies || caseResult.properties.Tech || '';
      if (techValue) {
        const techs = techValue.split(',').map(t => t.trim());
        techs.forEach(tech => {
          techFrequency[tech] = (techFrequency[tech] || 0) + 1;
        });
      }
      
      // Analizza business models
      const bmValue = caseResult.properties['Business Model'] || '';
      if (bmValue) {
        bmFrequency[bmValue] = (bmFrequency[bmValue] || 0) + 1;
      }
      
      // Analizza strategie
      const stratValue = caseResult.properties.Strategy || caseResult.properties['Market Strategy'] || '';
      if (stratValue) {
        stratFrequency[stratValue] = (stratFrequency[stratValue] || 0) + 1;
      }
    }
  });
  
  // Identifica pattern convergenti (frequenza >= 2)
  patterns.technologies = Object.entries(techFrequency)
    .filter(([tech, count]) => count >= 2)
    .map(([tech, count]) => tech);
    
  patterns.businessModels = Object.entries(bmFrequency)
    .filter(([bm, count]) => count >= 2)
    .map(([bm, count]) => bm);
    
  patterns.strategies = Object.entries(stratFrequency)
    .filter(([strat, count]) => count >= 2)
    .map(([strat, count]) => strat);
  
  return patterns;
}

function calculateConfidenceScore(verticalResults, caseResults) {
  // Calcola confidence basato su:
  // 1. Numero di verticali trovate
  // 2. Relevance score medio
  // 3. Numero di case studies trovati
  
  const verticalScore = Math.min(verticalResults.length / 3, 1) * 30;
  const avgRelevance = [...verticalResults, ...caseResults]
    .reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / 
    (verticalResults.length + caseResults.length || 1);
  const relevanceScore = Math.min(avgRelevance / 50, 1) * 40;
  const caseScore = Math.min(caseResults.length / 5, 1) * 30;
  
  return Math.round(verticalScore + relevanceScore + caseScore);
}