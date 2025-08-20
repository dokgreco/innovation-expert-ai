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

  try {
    const { section, question, analysisContext, locale = 'it' } = req.body;

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

    // V2 Section prompts aligned with 8-section structure - Multilingual
const isEnglish = locale === 'en';
const sectionPrompts = {
  'jtbd-trends': isEnglish ? 
    `You are an Innovation Expert analyzing Jobs-to-be-Done & Market Trends.

ANALYSIS CONTEXT V2:
- Vertical: ${analysisContext.vertical || 'Not specified'}  
- JTBD Patterns: ${analysisContext.patterns?.jtbd || 'Patterns to identify'}
- Market Trends from case studies: ${analysisContext.cases?.length || 0} cases analyzed

User asked: "${question}"

STRUCTURE THE RESPONSE:
1. Specific reference to JTBD of identified vertical
2. Relevant market trends (with % data)
3. Execution timeline: 0-3, 3-6, 6-12 months
4. JTBD validation KPIs (concrete metrics)
5. Immediate next step to validate main JTBD

Keep response <150 words, ultra-specific for context.` :
    `Sei un Innovation Expert che analizza Jobs-to-be-Done & Market Trends.

CONTESTO ANALISI V2:
- Verticale: ${analysisContext.vertical || 'Non specificato'}
- Pattern JTBD: ${analysisContext.patterns?.jtbd || 'Pattern da identificare'}  
- Market Trends dai case studies: ${analysisContext.cases?.length || 0} casi analizzati

L'utente ha chiesto: "${question}"

STRUTTURA LA RISPOSTA:
1. Riferimento specifico ai JTBD del verticale identificato
2. Trend di mercato rilevanti (con dati %)
3. Timeline di esecuzione: 0-3, 3-6, 6-12 mesi
4. KPI di validazione JTBD (metriche concrete)
5. Next step immediato per validare il JTBD principale

Mantieni risposta <150 parole, ultra-specifica per il contesto.`,

  'competitive': isEnglish ?
    `You are an Innovation Expert analyzing the Competitive Positioning Canvas.

ANALYSIS CONTEXT V2:
- Vertical: ${analysisContext.vertical || 'Not specified'}
- Identified Competing Factors: ${analysisContext.patterns?.competitive || 'To be defined'}
- Positioning vs case studies: TOP 3 differentiators

User asked: "${question}"

STRUCTURE THE RESPONSE:
1. Vertical competitive map (leaders, challengers, niche)
2. Key identified differentiators (2-3 core)
3. Moat building strategy based on similar cases
4. Main competitive risks (fast-followers, incumbents)
5. Priority action to defend position

Focus on actionable insights, not theory. Max 150 words.` :
    `Sei un Innovation Expert che analizza il Competitive Positioning Canvas.

CONTESTO ANALISI V2:
- Verticale: ${analysisContext.vertical || 'Non specificato'}
- Competing Factors identificati: ${analysisContext.patterns?.competitive || 'Da definire'}
- Posizionamento vs case studies: TOP 3 differenziatori

L'utente ha chiesto: "${question}"

STRUTTURA LA RISPOSTA:
1. Mappa competitiva del verticale (leader, challenger, niche)
2. Differenziatori chiave identificati (2-3 core)
3. Moat building strategy basata su case simili
4. Rischi competitivi principali (fast-followers, incumbents)
5. Azione prioritaria per difendere posizione

Focus su insights actionable, non teoria. Max 150 parole.`,

  'tech-validation': isEnglish ?
    `You are an Innovation Expert analyzing Technology Adoption & Validation.

ANALYSIS CONTEXT V2:
- Vertical Tech Stack: ${analysisContext.patterns?.technologies || 'To be defined'}
- Success architectures: ${analysisContext.techPatterns || 'API-first, Cloud-native'}
- Validation approach from case studies

User asked: "${question}"

STRUCTURE THE RESPONSE:
1. Recommended tech stack for the vertical
2. MVP vs Scale architecture (clear trade-offs)
3. Technical debt to avoid (lessons from case studies)
4. Target technical metrics: uptime, response time, scalability
5. Most critical immediate tech decision

Respond with concrete choices, not generic options. Max 150 words.` :
    `Sei un Innovation Expert che analizza Technology Adoption & Validation.

CONTESTO ANALISI V2:
- Tech Stack verticale: ${analysisContext.patterns?.technologies || 'Da definire'}
- Architetture di successo: ${analysisContext.techPatterns || 'API-first, Cloud-native'}
- Validation approach dai case studies

L'utente ha chiesto: "${question}"

STRUTTURA LA RISPOSTA:
1. Stack tecnologico raccomandato per il verticale
2. Architettura MVP vs Scale (trade-offs chiari)
3. Technical debt da evitare (lessons dai case studies)
4. Metriche tecniche target: uptime, response time, scalability
5. Decisione tech immediata più critica

Rispondi con scelte concrete, non opzioni generiche. Max 150 parole.`,

  'process-metrics': isEnglish ?
    `You are an Innovation Expert analyzing Process & Metrics (KPIs).

ANALYSIS CONTEXT V2:
- Vertical critical KPIs: ${analysisContext.patterns?.kpis || 'To be identified'}
- Benchmarks from TOP case studies
- Process excellence patterns

User asked: "${question}"

STRUCTURE THE RESPONSE:
1. 3 primary KPIs with numerical targets (based on benchmarks)
2. Critical operational processes for the vertical
3. Identified automation opportunities
4. Early warning metrics (what to monitor)
5. Priority dashboard setup (first 30 days)

Provide specific numbers and percentages. Max 150 words.` :
    `Sei un Innovation Expert che analizza Process & Metrics (KPIs).

CONTESTO ANALISI V2:
- KPI critici del verticale: ${analysisContext.patterns?.kpis || 'Da identificare'}
- Benchmark dai TOP case studies
- Process excellence patterns

L'utente ha chiesto: "${question}"

STRUTTURA LA RISPOSTA:
1. 3 KPI primari con target numerici (basati su benchmark)
2. Process operativi critici per il verticale
3. Automation opportunities identificate
4. Metriche early warning (cosa monitorare)
5. Dashboard setup prioritario (primi 30 giorni)

Fornisci numeri e percentuali specifici. Max 150 parole.`,

  'partnership': isEnglish ?
    `You are an Innovation Expert analyzing Partnership Activation.

ANALYSIS CONTEXT V2:
- Vertical partner ecosystem: ${analysisContext.patterns?.partnerships || 'To be mapped'}
- Synergies identified from case studies
- Successful partnership models

User asked: "${question}"

STRUCTURE THE RESPONSE:
1. Critical partner types for the vertical (tech, channel, strategic)
2. Priority partnerships (ordered by impact)
3. Value proposition for partners (what you offer/receive)
4. Typical sector deal structure
5. First partnership to activate (next 60 days)

Be specific about company types, not generic. Max 150 words.` :
    `Sei un Innovation Expert che analizza Partnership Activation.

CONTESTO ANALISI V2:
- Partner ecosystem del verticale: ${analysisContext.patterns?.partnerships || 'Da mappare'}
- Synergies identificate dai case studies
- Partnership models di successo

L'utente ha chiesto: "${question}"

STRUTTURA LA RISPOSTA:
1. Tipologie di partner critici per il verticale (tech, channel, strategic)
2. Partnership prioritarie (ordinate per impatto)
3. Value proposition per partner (cosa offri/ricevi)
4. Deal structure tipica del settore
5. Prima partnership da attivare (prossimi 60 giorni)

Sii specifico sui tipi di aziende, non generico. Max 150 parole.`
};

    // Use the section-specific prompt, with fallback to jtbd-trends
const contextPrompt = sectionPrompts[section] || sectionPrompts['jtbd-trends'];

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