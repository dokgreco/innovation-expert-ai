#!/usr/bin/env node

// 🧪 F.2.1 Security: Rate Limiting Test Script
// Usage: node test-rate-limiting.js [endpoint] [count]

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://innovation-expert-ai-sana.vercel.app'
  : 'http://localhost:3000';

const ENDPOINTS = {
  'notion': '/api/notion-query',
  'claude': '/api/claude-analysis', 
  'scoring': '/api/generate-scoring',
  'qa': '/api/claude-section-qa'
};

const TEST_PAYLOADS = {
  'notion': { query: 'test', filters: [] },
  'claude': { query: 'test', notionData: { results: [] }, filters: [] },
  'scoring': { analysisData: {}, validationAnswers: {} },
  'qa': { section: 'jtbd-trends', question: 'test', analysisContext: {} }
};

async function makeRequest(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const requestModule = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Rate-Limit-Test/1.0'
      }
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function testRateLimit(endpoint = 'notion', requestCount = 105) {
  console.log(`🧪 Testing Rate Limit on ${BASE_URL}${ENDPOINTS[endpoint]}`);
  console.log(`📊 Sending ${requestCount} requests...`);
  console.log(`⏱️  Rate limit: ${process.env.NODE_ENV === 'development' ? '200' : '100'}/hour\n`);

  const results = {
    success: 0,
    rateLimited: 0,
    errors: 0,
    firstRateLimit: null
  };

  for (let i = 1; i <= requestCount; i++) {
    try {
      const response = await makeRequest(ENDPOINTS[endpoint], TEST_PAYLOADS[endpoint]);
      
      if (response.status === 429) {
        results.rateLimited++;
        if (!results.firstRateLimit) {
          results.firstRateLimit = i;
          console.log(`🚫 First rate limit hit at request #${i}`);
          
          // Parse retry-after header
          const retryAfter = response.headers['retry-after'] || 
                            JSON.parse(response.body || '{}').retryAfter;
          if (retryAfter) {
            console.log(`⏰ Retry after: ${retryAfter} seconds`);
          }
        }
      } else if (response.status < 400) {
        results.success++;
      } else {
        results.errors++;
        console.log(`❌ Request #${i} failed: ${response.status}`);
      }

      // Progress indicator
      if (i % 10 === 0) {
        console.log(`📈 Progress: ${i}/${requestCount} - Success: ${results.success}, Rate Limited: ${results.rateLimited}`);
      }

      // Small delay to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      results.errors++;
      console.log(`💥 Request #${i} error:`, error.message);
    }
  }

  console.log('\n📊 RESULTS:');
  console.log(`✅ Successful requests: ${results.success}`);
  console.log(`🚫 Rate limited requests: ${results.rateLimited}`);
  console.log(`❌ Error requests: ${results.errors}`);
  console.log(`🎯 First rate limit at request: ${results.firstRateLimit || 'None'}`);
  
  const expectedLimit = process.env.NODE_ENV === 'development' ? 200 : 100;
  const testPassed = results.firstRateLimit && results.firstRateLimit <= expectedLimit + 5;
  
  console.log(`\n${testPassed ? '✅ TEST PASSED' : '⚠️ TEST NEEDS REVIEW'}: Rate limiting ${testPassed ? 'working correctly' : 'may need adjustment'}`);
  
  return results;
}

// CLI Interface
const endpoint = process.argv[2] || 'notion';
const count = parseInt(process.argv[3]) || 105;

if (!ENDPOINTS[endpoint]) {
  console.log('❌ Invalid endpoint. Available:', Object.keys(ENDPOINTS).join(', '));
  process.exit(1);
}

testRateLimit(endpoint, count).catch(console.error);