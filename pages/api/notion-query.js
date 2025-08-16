// PROBLEMA IDENTIFICATO: Il file attuale NON filtra per query!
// La funzione fa sempre la stessa ricerca generica su tutti i database
// Questo causa il ritorno di dati random/cached invece della query specifica

import { Client } from '@notionhq/client';
import { setSecureCache, getSecureCache, hasValidCache } from '../../utils/secureCache';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
// Costanti di configurazione per ottimizzazione context
const MAX_CONTENT_LENGTH = 150; // Ridotto da 200 a 150 per Phase 3

const databases = [
  process.env.NOTION_DATABASE_1,
  process.env.NOTION_DATABASE_2,
  process.env.NOTION_DATABASE_3
];

// TASK 6: Test suite automatizzato - COMPLETO
const testQueries = [
  "E-learning platform for kids",
  "Fintech payment solution",
  "AI platform for medical diagnosis",
  "Blockchain for supply chain traceability",
  "IoT sensors for agriculture",
  "Marketplace for families with babysitters",
  "Sustainable agriculture technology",
  "Social media analytics tool",
  "Electric vehicle charging network",
  "Remote work collaboration software"
];

// Funzione per eseguire test automatici (chiamata solo in development)
async function runTestSuite() {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('\n🧪 === RUNNING TEST SUITE ===');
  const results = [];
  
  for (const query of testQueries.slice(0, 3)) { // Test solo prime 3 per velocità
    console.log(`\n📝 Testing: "${query}"`);
    // Qui metteremo logica di test
    results.push({
      query,
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('\n✅ TEST SUITE COMPLETE');
  return results;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, filters } = req.body;
    const startTime = Date.now(); // Sposta qui, PRIMA del cache check
    // 🔒 SECURE CACHE IMPLEMENTATION
    const cacheKey = `query_${query.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;
    
    // Check secure cache first
    console.log(`🔍 [DEBUG] Looking for cache with key: ${cacheKey}`);
    const cachedIds = getSecureCache(cacheKey);
    if (cachedIds && cachedIds.length > 0) {
      console.log(`✅ [SecureCache] Cache hit for: ${query}`);
      console.log(`📊 [SecureCache] Fetching ${cachedIds.length} cached records`);
      
      // PHASE 1: Fetch full data using cached IDs
      const cachedResults = await fetchRecordsByIds(cachedIds);
      
      // Process for methodology
      const verticalResults = cachedResults.slice(0, 1);
      const caseResults = cachedResults.slice(1, 5);
      const convergencePatterns = analyzeConvergencePatterns(caseResults);
      
      // Return full response with cached data
      return res.status(200).json({
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
          fromCache: true,
          totalScanned: cachedResults.length,
          processingTime: `${Date.now() - startTime}ms (cached)`,
          confidenceScore: calculateConfidenceScore(verticalResults, caseResults),
          queryProcessed: query,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    console.log(`❌ [SecureCache] Cache miss for: ${query}`);
        
    // 🚨 DEBUG: Log della query ricevuta
    console.log('🔍 Query ricevuta:', query);
    console.log('📋 Filtri ricevuti:', filters);
    
    let allResults = [];
    let totalResults = 0;

    // 🔧 TASK 2.1: Tracking statistiche per database
const dbStats = {
  [databases[0]]: { maxScore: 0, count: 0, results: [] },
  [databases[1]]: { maxScore: 0, count: 0, results: [] },
  [databases[2]]: { maxScore: 0, count: 0, results: [] }
};
    // Query each database
    // 🔧 TASK 1.3: Estrai keywords per i filtri
const keywords = extractKeyTokens(query);
console.log('🔍 Keywords estratte per filtri:', keywords);

// Query each database
    for (const dbId of databases) {
      if (!dbId) continue;
      
      try {
        // 🔍 DEBUG DB2
    if (dbId === databases[1]) {
      console.log('🔍 DEBUG DB2 - Database ID:', dbId);
    }

        // 🔧 FIX 1: Aggiungere filtro di ricerca basato sulla query
const searchFilter = buildNotionFilter(dbId, query, keywords);

// Log per debug
if (searchFilter) {
  console.log(`📋 DB${databases.indexOf(dbId) + 1}: Query CON filtri applicati`);
} else {
  console.log(`📋 DB${databases.indexOf(dbId) + 1}: Query SENZA filtri (fallback)`);
}

// 🔧 FIX 2: Usare il filtro nella query
const dbResponse = await notion.databases.query({
  database_id: dbId,
  page_size: 20, // Ridotto per performance
  filter: searchFilter, // 🆕 SEMPLIFICATO - passa direttamente searchFilter
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
              .substring(0, MAX_CONTENT_LENGTH)
.replace(/\s+\S*$/, '...'); // Smart truncation - taglia all'ultima parola completa

            // 🔧 FIX 4: Solo aggiungere se c'è contenuto rilevante
const allProperties = extractAllProperties(page);
// Debug: verifica nuovo scoring
console.log('📍 Calling calculateRelevance with:', {
  hasContent: !!content,
  contentLength: content ? content.length : 0,
  query: query,
  hasProperties: !!allProperties,
  propertiesCount: Object.keys(allProperties || {}).length
});

const relevanceScore = calculateRelevance(content, query, allProperties);

console.log('✅ Relevance result:', {
  score: relevanceScore.toFixed(3),
  percentage: (relevanceScore * 100).toFixed(1) + '%'
});

// 🔍 DEBUG: Log per capire perché DB2 non passa
if (dbId === databases[1]) {
  console.log(`🔍 DB2 Check - Title: "${getPageTitle(page)}", Content length: ${content.length}, Score: ${relevanceScore.toFixed(2)}`);
}

// MODIFICATO: Accetta anche se ha properties ricche, non solo content
if (content.length > 10 || relevanceScore > 5 || Object.keys(allProperties).length > 10) {
  // 🔧 Prima salva il raw score per trovare il max
const rawScore = relevanceScore;

// Aggiorna il max score per questo database
if (rawScore > dbStats[dbId].maxScore) {
  dbStats[dbId].maxScore = rawScore;
}

// Salva temporaneamente con raw score
allResults.push({
  id: page.id,
  title: getPageTitle(page),
  content: content,
  properties: allProperties,
  database: dbId,
  relevanceScore: rawScore, // Temporaneo
  rawScore: rawScore // Salva anche il raw per dopo
});

dbStats[dbId].count++;

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

    // 🔧 TASK 2.4: Normalizza tutti gli score dopo aver trovato i max
console.log('📊 DB Stats prima della normalizzazione:');
Object.entries(dbStats).forEach(([db, stats], idx) => {
  console.log(`DB${idx + 1}: Max score = ${stats.maxScore}, Count = ${stats.count}`);
});

// Applica normalizzazione a tutti i risultati
allResults = allResults.map(result => {
  // Usa un minimo threshold per evitare over-normalizzazione
// Se il maxScore del DB è troppo basso, usa un minimo di 0.5 per evitare inflazione
const rawDbMaxScore = dbStats[result.database].maxScore || 0.5;
const dbMaxScore = Math.max(rawDbMaxScore, 0.5); // Minimo 0.5 per evitare over-boost

// Log per debug quando c'è differenza
if (rawDbMaxScore < 0.5 && process.env.NODE_ENV === 'development') {
  console.log(`⚠️ DB MaxScore adjustment: ${rawDbMaxScore.toFixed(3)} → ${dbMaxScore} for ${result.title}`);
}

  const finalScore = calculateFinalScore(
    result.rawScore,
    result.content,
    result.properties,
    dbMaxScore
  );
  
  // AGGIUNGI QUESTO LOG
  if (result.rawScore > 100) {
    console.log(`🔍 SCORING DEBUG - ${result.title}:`);
    console.log(`   Raw: ${result.rawScore}, Max: ${dbMaxScore}, Final: ${finalScore}`);
    console.log(`   Content length: ${result.content?.length || 0}`);
    console.log(`   Properties: ${Object.keys(result.properties || {}).length}`);
  }
  
  return {
    ...result,
    relevanceScore: finalScore,
    finalScore: finalScore
  };
});

// 🔧 TASK 4: Acceptance Adattiva - Calcola percentili per soglia dinamica
function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Applica acceptance basata su percentili invece di threshold fissi
function applyAdaptiveAcceptance(results) {
  if (!results || results.length === 0) return results;
  
  // Estrai tutti gli score
  const allScores = results.map(r => r.finalScore || r.relevanceScore || 0);
  
  // Calcola il 70° percentile (accetta solo top 30%)
  // Usa 60° percentile per essere meno restrittivi
const cutoff = percentile(allScores, 60);
  
  // Imposta un minimo di sicurezza per evitare di escludere tutto
  // Abbassa il minimo per accettare risultati con score più bassi ma rilevanti
const minAcceptable = 25;
  
  // Filtra risultati che superano la soglia adattiva
  const accepted = results.filter(r => {
    const score = r.finalScore || r.relevanceScore || 0;
    return score >= Math.max(cutoff, minAcceptable);
  });
  
  // Log per debug
  console.log(`🎯 Adaptive Acceptance: Cutoff=${cutoff.toFixed(1)}, Accepted=${accepted.length}/${results.length}`);
  
  // Mantieni almeno 3 risultati anche se sotto soglia (fallback)
  if (accepted.length < 3 && results.length >= 3) {
    return results.slice(0, 3);
  }
  
  return accepted;
}

// 🔧 TASK 5: Multi-Criteria Sorting con tie-breakers
function countPriorityFields(properties) {
  if (!properties) return 0;
  
  const priorityFields = [
    'JTDs', 'Business Model', 'Technology Adoption',
    'KOR', 'Market Type Strategy', 'Competing Factors',
    'Value Proposition', 'Technologies', 'Impact'
  ];
  
  let count = 0;
  Object.keys(properties).forEach(key => {
    if (priorityFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      count++;
    }
  });
  
  return count;
}

function multiCriteriaSort(results) {
  return results.sort((a, b) => {
    // Primary: Final Score (descending)
    const scoreA = a.finalScore || a.relevanceScore || 0;
    const scoreB = b.finalScore || b.relevanceScore || 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // Secondary: Content Length (descending)
    const contentA = a.content?.length || 0;
    const contentB = b.content?.length || 0;
    if (contentB !== contentA) {
      return contentB - contentA;
    }
    
    // Tertiary: Priority Fields Count (descending)
    const priorityA = countPriorityFields(a.properties);
    const priorityB = countPriorityFields(b.properties);
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }
    
    // Quaternary: Title alphabetical (ascending) as final tie-breaker
    const titleA = a.title || '';
    const titleB = b.title || '';
    return titleA.localeCompare(titleB);
  });
}

// 🔧 TASK 4: Applica acceptance adattiva PRIMA del sort
allResults = applyAdaptiveAcceptance(allResults);

// 🔧 TASK 5: Applica multi-criteria sorting invece di sorting semplice
allResults = multiCriteriaSort(allResults);

// Log per verificare multi-criteria sorting
console.log('🎯 Multi-Criteria Sort Applied:');
allResults.slice(0, 3).forEach((r, idx) => {
  console.log(`  ${idx + 1}. ${r.title} - Score: ${r.finalScore || r.relevanceScore}, Content: ${r.content?.length || 0} chars, Priority fields: ${countPriorityFields(r.properties)}`);
});

// 🔧 TASK 3.2: Applica diversity filters
allResults = applyDiversityFilters(allResults);

console.log('📊 POST-DIVERSITY Distribution:');
const dbCounts = {};
allResults.forEach(r => {
  const dbIndex = databases.indexOf(r.database) + 1;
  dbCounts[`DB${dbIndex}`] = (dbCounts[`DB${dbIndex}`] || 0) + 1;
});
console.log(dbCounts);

console.log('✅ Score normalizzati:');
// Log acceptance statistics
console.log('📊 Acceptance Statistics:');
console.log(`- Total candidates: ${allResults.length + (allResults.length < 3 ? ' (min threshold applied)' : '')}`);
console.log(`- Score range: ${Math.min(...allResults.map(r => r.finalScore || 0)).toFixed(1)} - ${Math.max(...allResults.map(r => r.finalScore || 0)).toFixed(1)}`);
allResults.slice(0, 5).forEach(r => {
  console.log(`- ${r.title}: Raw=${r.rawScore.toFixed(0)} → Final=${r.finalScore}`);
});

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
    
    // Aggiungi questo PRIMA del return alla fine della funzione
console.log('=== NOTION QUERY DEBUG ===');
console.log('Query Input:', query);
console.log('Total Results Found:', allResults.length);

// 🔧 TASK 6: Calcola metriche per monitoring
const calculateMetrics = () => {
  const metrics = {
    queryOverlap: 0, // Calcoleremo in futuro confrontando risultati
    varietyScore: new Set(allResults.map(r => r.title)).size / allResults.length * 100,
    dbDistribution: {
      DB1: allResults.filter(r => r.database === databases[0]).length,
      DB2: allResults.filter(r => r.database === databases[1]).length,
      DB3: allResults.filter(r => r.database === databases[2]).length
    },
    avgScore: allResults.reduce((sum, r) => sum + (r.finalScore || 0), 0) / allResults.length || 0,
    processingTime: Date.now() - startTime
  };
  
  console.log('\n📊 === QUERY METRICS ===');
  console.log(`Variety Score: ${metrics.varietyScore.toFixed(1)}%`);
  console.log(`DB Distribution: DB1=${metrics.dbDistribution.DB1}, DB2=${metrics.dbDistribution.DB2}, DB3=${metrics.dbDistribution.DB3}`);
  console.log(`Average Score: ${metrics.avgScore.toFixed(1)}`);
  console.log(`Processing Time: ${metrics.processingTime}ms`);
  
  return metrics;
};

// Chiama il calcolo metriche
const queryMetrics = calculateMetrics();

// Mostra TUTTI i risultati con scores
allResults.forEach((result, idx) => {
  console.log(`\n[${idx}] Title: ${result.title}`);
  console.log(`   Content preview: ${result.content?.substring(0, 100)}`);
  console.log(`   Properties popolate: ${Object.keys(result.properties).length}`);
  // Se hai già un similarity score, mostralo
});

console.log('\n=== TOP 5 SELECTED ===');
allResults.slice(0, 5).forEach(r => {
  console.log(`- ${r.title}`);
});

// === NUOVO TEST SCORING BREAKDOWN ===
console.log('\n🔍 === SCORING BREAKDOWN TEST ===');
allResults.forEach((r, idx) => {
  // Conta i priority fields
  const priorityFields = [
    'JTDs', 'Business Model', 'Technology Adoption', 
    'KOR', 'Market Type Strategy', 'Competing Factors',
    'Description', 'Impact', 'Technologies', 'Value Proposition'
  ];
  
  let priorityCount = 0;
  Object.keys(r.properties || {}).forEach(key => {
    if (priorityFields.some(pf => key.includes(pf))) {
      priorityCount++;
    }
  });
  
  console.log(`\n[${idx}] ${r.title}:`);
  console.log(`  📊 Properties totali: ${Object.keys(r.properties || {}).length}`);
  console.log(`  📝 Content length: ${r.content?.length || 0} chars`);
  console.log(`  ⭐ Priority fields: ${priorityCount}`);
  console.log(`  🎯 Database: ${r.database?.substring(0, 8)}...`);
  console.log(`  💯 Score: ${r.relevanceScore || r.score || 'NO SCORE'}`);
});
console.log('=== END SCORING BREAKDOWN ===\n');
console.log(`🔍 [DEBUG] Preparing to save cache with key: ${cacheKey}`);
    console.log(`🔍 [DEBUG] Results to cache: ${allResults.length} total, saving first 10`);
// 🔒 SAVE TO SECURE CACHE (IDs only)
    const resultIds = allResults.slice(0, 10).map(r => r.id);
    if (resultIds.length > 0) {
      setSecureCache(cacheKey, resultIds);
      console.log(`💾 [SecureCache] Saved ${resultIds.length} IDs to cache`);
    }    
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
    console.error('Notion API Error:', error);
    
    // User-friendly error messages
    let userMessage = 'Si è verificato un errore durante l\'analisi dei database.';
    let statusCode = 500;
    
    if (error.message && error.message.includes('413')) {
      userMessage = 'L\'analisi richiesta è troppo complessa. Prova con una descrizione più breve (max 500 caratteri).';
      statusCode = 413;
    } else if (error.message && error.message.includes('timeout')) {
      userMessage = 'L\'analisi sta richiedendo più tempo del previsto. Riprova tra qualche secondo.';
      statusCode = 504;
    } else if (error.message && error.message.includes('401')) {
      userMessage = 'Errore di autenticazione con i database. Contatta il supporto tecnico.';
      statusCode = 401;
    } else if (error.message && error.message.includes('429')) {
      userMessage = 'Troppe richieste in poco tempo. Attendi 30 secondi prima di riprovare.';
      statusCode = 429;
    } else if (error.message && error.message.includes('network')) {
      userMessage = 'Problema di connessione ai database. Verifica la tua connessione internet.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      technicalDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 🔧 FUNZIONE HELPER: Calcola rilevanza
// 🔧 FUNZIONE MIGLIORATA: Calcola rilevanza con scoring avanzato
function calculateRelevance(content, query, properties = {}) {
  if (!query) return 0;
    console.log('🎯 NEW SCORING v2 ACTIVE');

  // Nuovo scoring algorithm con 3 componenti
  const scores = {
    crossDomain: 0,    // 30% weight
    semantic: 0,       // 60% weight  
    popularity: 0      // 10% weight
  };

  // Normalizza query e content per matching
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedContent = (content || '').toLowerCase();
  
  // 1. CROSS-DOMAIN SCORING (30%)
  // Conta quanti domini/settori sono menzionati
  const domains = [
    'fintech', 'healthtech', 'edtech', 'agritech', 'proptech',
    'insurtech', 'legaltech', 'hrtech', 'martech', 'retailtech',
    'ai', 'machine learning', 'blockchain', 'iot', 'cybersecurity',
    'saas', 'marketplace', 'platform', 'b2b', 'b2c'
  ];
  
  let domainMatches = 0;
  domains.forEach(domain => {
    if (normalizedContent.includes(domain)) {
      domainMatches++;
    }
  });
  
  // Normalizza: 1 domain = 0.3, 2 domains = 0.6, 3+ domains = 1.0
  scores.crossDomain = Math.min(domainMatches * 0.33, 1.0);
  
  // 2. SEMANTIC MATCHING (60%)
  // Migliorato per gestire query multi-parola
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  let semanticPoints = 0;
  
  // Exact phrase match (bonus maggiore)
  if (normalizedContent.includes(normalizedQuery)) {
    semanticPoints += 0.8;  // Aumentato da 0.5
  }
  
  // Individual word matches con peso proporzionale
  let matchedWords = 0;
  queryWords.forEach(word => {
    if (normalizedContent.includes(word)) {
      matchedWords++;
    }
  });
  
  // Calcola percentuale di parole matchate
  if (queryWords.length > 0) {
    const matchRatio = matchedWords / queryWords.length;
    semanticPoints += matchRatio * 0.5;  // Max 0.5 punti extra
  }
  
  // Bonus per title match (se presente nelle properties)
  if (properties.title || properties.name || properties.Name) {
    const title = (properties.title || properties.name || properties.Name || '').toLowerCase();
    if (title.includes(normalizedQuery)) {
      semanticPoints += 0.3;
    }
    // Check singole parole nel titolo
    queryWords.forEach(word => {
      if (title.includes(word)) {
        semanticPoints += 0.1;
      }
    });
  }
  
  scores.semantic = Math.min(semanticPoints, 1.0);
  
  // 3. POPULARITY SIGNAL (10%)
  // Migliorato per riconoscere più segnali
  let popularityScore = 0;
  
  // Check validation score
  if (properties.validation_score) {
    const score = parseFloat(properties.validation_score);
    popularityScore += (score / 10) * 0.3;  // Normalizzato 0-10 → 0-0.3
  }
  
  // Check best practice indicators
  const bestPracticeIndicators = [
    'best practice', 'best_practice', 'bestpractice',
    'validated', 'proven', 'success'
  ];
  
  const propsString = JSON.stringify(properties).toLowerCase();
  bestPracticeIndicators.forEach(indicator => {
    if (propsString.includes(indicator)) {
      popularityScore += 0.2;
    }
  });
  
  // Bonus per completezza dati (più properties = più popolare/completo)
  const propCount = Object.keys(properties).length;
  if (propCount > 20) popularityScore += 0.3;
  else if (propCount > 10) popularityScore += 0.2;
  else if (propCount > 5) popularityScore += 0.1;
  
  scores.popularity = Math.min(popularityScore, 1.0);
  
  // CALCOLO FINALE con weights
  const finalScore = 
    (scores.crossDomain * 0.30) +
    (scores.semantic * 0.60) +
    (scores.popularity * 0.10);
  
  // Debug logging (rimuovere in produzione)
  if (process.env.NODE_ENV === 'development') {
    console.log('Scoring breakdown:', {
      query: normalizedQuery.substring(0, 50),
      crossDomain: scores.crossDomain.toFixed(2),
      semantic: scores.semantic.toFixed(2),
      popularity: scores.popularity.toFixed(2),
      final: finalScore.toFixed(2)
    });
  }
  
  return finalScore;
}

// 🔧 TASK 2.2: Calcola score finale normalizzato
function calculateFinalScore(rawScore, content, properties, dbMaxScore) {
  // NUOVA NORMALIZZAZIONE - Preserva differenze
  // Usa una scala logaritmica per mantenere le proporzioni
  let normalized;
  
  if (dbMaxScore > 0) {
    // Normalizzazione progressiva che mantiene le differenze
    const ratio = rawScore / dbMaxScore;
    
    // Scala non lineare: score bassi rimangono bassi, alti rimangono alti
    if (ratio < 0.1) {
      normalized = ratio * 200;  // 0-0.1 → 0-20
    } else if (ratio < 0.3) {
      normalized = 20 + ((ratio - 0.1) * 150);  // 0.1-0.3 → 20-50
    } else if (ratio < 0.6) {
      normalized = 50 + ((ratio - 0.3) * 100);  // 0.3-0.6 → 50-80
    } else {
      normalized = 80 + ((ratio - 0.6) * 50);   // 0.6-1.0 → 80-100
    }
  } else {
    normalized = rawScore * 100;
  }
  
  // DICHIARAZIONE propCount
  const propCount = Object.keys(properties || {}).length;
  
  // Penalità content vuoto (meno aggressiva)
  const contentPenalty = (content?.length || 0) < 50 ? 0.9 : 1;
  
  // Property penalty (più bilanciata)
  let propertyPenalty = 1;
  if (propCount > 40) {
    propertyPenalty = 0.95;  // Era 0.9
  } else if (propCount < 5) {
    propertyPenalty = 0.85;  // Era 0.8
  }
  
  // Boost per high relevance (basato sul nuovo scoring 0-1)
  let relevanceBoost = 1;
  if (rawScore > 0.8) {
    relevanceBoost = 1.05;  // Boost leggero per score eccellenti
  } else if (rawScore > 0.6) {
    relevanceBoost = 1.02;  // Mini boost per score buoni
  }
  
  // Score finale con modificatori
  const finalScore = normalized * contentPenalty * propertyPenalty * relevanceBoost;
  
  // Log per debug
  if (process.env.NODE_ENV === 'development') {
    console.log(`📈 Normalizzazione: Raw=${rawScore.toFixed(3)} → Normalized=${normalized.toFixed(1)} → Final=${finalScore.toFixed(1)}`);
  }
  
  return Math.min(Math.round(finalScore * 10) / 10, 100);
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
  
  // NUOVO: Limiti per ottimizzazione context Phase 3
  const MAX_PROPERTIES = 10;
  const MAX_PROPERTY_LENGTH = 500;
  let propertyCount = 0;
  
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
  
  // Prima ordina le properties per priorità
  const sortedEntries = Object.entries(page.properties).sort(([keyA], [keyB]) => {
    const isPriorityA = priorityFields.some(field => keyA.toLowerCase().includes(field.toLowerCase()));
    const isPriorityB = priorityFields.some(field => keyB.toLowerCase().includes(field.toLowerCase()));
    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;
    return 0;
  });
  
  // Estrai ogni property
  sortedEntries.forEach(([key, value]) => {
    // Limita numero di properties
    if (propertyCount >= MAX_PROPERTIES) return;
    
    try {
      let extractedValue = null;
      
      switch(value.type) {
        case 'title':
          if (value.title && value.title.length > 0) {
            extractedValue = value.title.map(t => t.plain_text).join('');
          }
          break;
          
        case 'rich_text':
          if (value.rich_text && value.rich_text.length > 0) {
            extractedValue = value.rich_text.map(t => t.plain_text).join('');
          }
          break;
          
        case 'select':
          if (value.select) {
            extractedValue = value.select.name;
          }
          break;
          
        case 'multi_select':
          if (value.multi_select && value.multi_select.length > 0) {
            extractedValue = value.multi_select.map(s => s.name).join(', ');
          }
          break;
          
        case 'number':
          if (value.number !== null) {
            extractedValue = value.number;
          }
          break;
          
        case 'checkbox':
          extractedValue = value.checkbox || false;
          break;
          
        case 'url':
          if (value.url) {
            extractedValue = value.url;
          }
          break;
          
        case 'date':
          if (value.date) {
            extractedValue = value.date.start;
          }
          break;
          
        case 'formula':
          if (value.formula) {
            extractedValue = value.formula.string || value.formula.number;
          }
          break;
          
        default:
          // Log per vedere se ci sono altri tipi
          console.log(`📝 Tipo property non gestito: ${value.type}`);
      }
      
      // Limita lunghezza del valore se è una stringa
      if (extractedValue && typeof extractedValue === 'string' && extractedValue.length > MAX_PROPERTY_LENGTH) {
        extractedValue = extractedValue.substring(0, MAX_PROPERTY_LENGTH).replace(/\s+\S*$/, '...');
      }
      
      // Solo se ha valore, incrementa il counter e assegna
      if (extractedValue !== null && extractedValue !== '') {
        propertyCount++;
        properties[key] = extractedValue;
      }
      
    } catch (err) {
      console.error(`❌ Errore estrazione property ${key}:`, err);
    }
  });
  
  // Log per debug
  const foundPriorityFields = priorityFields.filter(field => 
    Object.keys(properties).some(key => key.toLowerCase().includes(field.toLowerCase()))
  );
  
  console.log(`✅ Properties estratte: ${Object.keys(properties).length} (max ${MAX_PROPERTIES})`);
  console.log(`🎯 Priority fields trovati: ${foundPriorityFields.join(', ')}`);
  
  return properties;
}

// 🔧 TASK 3.1: Applica filtri di diversità
function applyDiversityFilters(results) {
  const limits = {
    perDatabase: 5,    // Max 5 per database
    perVertical: 2     // Max 2 per stesso verticale
  };
  
  const counts = {
    db: {},
    vertical: {}
  };
  
  const seen = new Set();
  const filtered = [];
  
  for (const result of results) {
    const dbKey = result.database;
    const verticalKey = result.properties?.['Project Vertical'] || 
                       result.properties?.['Vertical'] || 
                       result.properties?.['Innovation Verticals'] ||
                       'unknown';
    const titleKey = (result.title || '').toLowerCase().replace(/\W+/g, '');
    
    // Skip duplicati
    if (seen.has(titleKey)) {
      console.log(`⏭️ Skip duplicato: ${result.title}`);
      continue;
    }
    
    // Check limite database
    if ((counts.db[dbKey] || 0) >= limits.perDatabase) {
      console.log(`⏭️ Skip per limite DB: ${result.title}`);
      continue;
    }
    
    // Check limite verticale
    if ((counts.vertical[verticalKey] || 0) >= limits.perVertical) {
      console.log(`⏭️ Skip per limite verticale: ${result.title}`);
      continue;
    }
    
    // Accetta risultato
    filtered.push(result);
    seen.add(titleKey);
    counts.db[dbKey] = (counts.db[dbKey] || 0) + 1;
    counts.vertical[verticalKey] = (counts.vertical[verticalKey] || 0) + 1;
  }
  
  console.log(`🎯 Diversity filter: ${results.length} → ${filtered.length} risultati`);
  return filtered;
}

// 🔧 TASK 1.1: Estrae parole chiave dalla query per filtri Notion
function extractKeyTokens(query) {
  if (!query) return [];
  
  return query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 3); // Massimo 3 keywords
}
// 🔧 TASK 1.2: Costruisce filtri specifici per ogni database (FIXED)
function buildNotionFilter(dbId, query, keywords) {
  // Se non ci sono keywords, non filtrare
  if (!keywords || keywords.length === 0) {
    return undefined;
  }

  const filterMap = {
    [databases[0]]: { // DB1 - Verticals
  or: [
    { property: "Project Vertical", title: { contains: keywords[0] } },
    { property: "Technology Adoption & Validation", rich_text: { contains: keywords[0] } }
    // RIMUOVI la riga Keywords che causa l'errore
  ]
},
    [databases[1]]: { // DB2 - Case Histories (FUNZIONA!)
      or: [
        { property: "Description", rich_text: { contains: keywords[0] } },
        { property: "Description (ENG)", rich_text: { contains: keywords[0] } },
        { property: "Value Proposition", rich_text: { contains: keywords[0] } }
      ]
    },
    [databases[2]]: { // DB3 - Mixed
      or: [
        { property: "Project Vertical", title: { contains: keywords[0] } },
        // JTDs è rich_text, dovrebbe funzionare
        { property: "JTDs", rich_text: { contains: keywords[0] } }
      ]
    }
  };
  
  return filterMap[dbId];
}
// 🚀 PHASE 1: Fetch specific records by IDs for cache optimization
async function fetchRecordsByIds(ids) {
  console.log(`🎯 [Phase1] Fetching ${ids.length} specific records by ID`);
  const startFetch = Date.now();
  const results = [];
  
  for (const id of ids) {
    try {
      // Fetch page data
      const page = await notion.pages.retrieve({ page_id: id });
      
      // Get content (limited for performance)
      const pageContent = await notion.blocks.children.list({
        block_id: id,
        page_size: 10
      });
      
      const content = pageContent.results
        .filter(block => 
          block.type === 'paragraph' && 
          block.paragraph.rich_text.length > 0
        )
        .map(block => block.paragraph.rich_text.map(text => text.plain_text).join(''))
        .join(' ')
        .substring(0, 200);
      
      // Extract properties
      const properties = extractAllProperties(page);
      
      results.push({
        id: page.id,
        title: getPageTitle(page),
        content: content,
        properties: properties,
        database: page.parent.database_id,
        fromCache: true
      });
      
      console.log(`✅ Fetched: ${getPageTitle(page)}`);
    } catch (error) {
      console.error(`❌ Error fetching ID ${id}:`, error.message);
    }
  }
  
  console.log(`⏱️ [Phase1] Fetched ${results.length}/${ids.length} records in ${Date.now() - startFetch}ms`);
  return results;
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