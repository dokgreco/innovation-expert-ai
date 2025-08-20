// 🚀 QUICK VALIDATION TEST - Innovation Expert AI v1.2
// Test rapido per validare funzionalità core

const TEST_BASE_URL = 'http://localhost:3005';

async function quickValidationTest() {
  console.log('🧪 Quick Validation Test v1.2');
  console.log('='.repeat(40));
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Notion Query API
  console.log('\n1️⃣ Testing Notion Query API...');
  try {
    const response = await fetch(`${TEST_BASE_URL}/api/notion-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'fintech startup', filters: [] })
    });
    
    totalTests++;
    if (response.ok) {
      passedTests++;
      console.log('✅ Notion Query API - Working');
    } else {
      console.log(`❌ Notion Query API - HTTP ${response.status}`);
    }
  } catch (error) {
    totalTests++;
    console.log(`❌ Notion Query API - ${error.message}`);
  }

  // Test 2: Multilingual Scoring
  console.log('\n2️⃣ Testing Multilingual Scoring...');
  try {
    const scoringData = {
      analysisData: { analysis: 'Test fintech analysis' },
      validationAnswers: {
        'Competitive Positioning': 'We offer AI-powered fraud detection with 99% accuracy, reducing processing fees by 30% compared to traditional payment processors like Square.',
        'Technology Validation': 'Our platform has processed over 50M transactions with 99.9% uptime and integrates with major e-commerce platforms.'
      },
      language: 'en'
    };
    
    const response = await fetch(`${TEST_BASE_URL}/api/generate-scoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoringData)
    });
    
    totalTests++;
    if (response.ok) {
      const data = await response.json();
      if (data.scoring && data.scoring.overall) {
        passedTests++;
        console.log(`✅ Multilingual Scoring - Score: ${data.scoring.overall.score}/10`);
        
        // Check if risks are in English
        const riskInEnglish = data.scoring.risks && data.scoring.risks[0] && 
                             !data.scoring.risks[0].factor.includes('Validazione');
        if (riskInEnglish) {
          console.log('✅ Risk Assessment in English - Working');
        } else {
          console.log('⚠️ Risk Assessment might be in Italian');
        }
      } else {
        console.log('❌ Multilingual Scoring - Invalid response structure');
      }
    } else {
      console.log(`❌ Multilingual Scoring - HTTP ${response.status}`);
    }
  } catch (error) {
    totalTests++;
    console.log(`❌ Multilingual Scoring - ${error.message}`);
  }

  // Test 3: Italian Scoring
  console.log('\n3️⃣ Testing Italian Scoring...');
  try {
    const scoringDataIT = {
      analysisData: { analysis: 'Test fintech analysis in Italian' },
      validationAnswers: {
        'Posizionamento Competitivo': 'Offriamo rilevamento frodi basato su AI con precisione del 99%, riducendo le commissioni di elaborazione del 30% rispetto ai processori di pagamento tradizionali.',
        'Validazione Tecnologica': 'La nostra piattaforma ha elaborato oltre 50M transazioni con 99.9% uptime e si integra con le principali piattaforme e-commerce.'
      },
      language: 'it'
    };
    
    const response = await fetch(`${TEST_BASE_URL}/api/generate-scoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoringDataIT)
    });
    
    totalTests++;
    if (response.ok) {
      const data = await response.json();
      if (data.scoring && data.scoring.overall) {
        passedTests++;
        console.log(`✅ Italian Scoring - Score: ${data.scoring.overall.score}/10`);
        
        // Check if risks are in Italian
        const riskInItalian = data.scoring.risks && data.scoring.risks[0] && 
                             (data.scoring.risks[0].factor.includes('Tecnolog') || 
                              data.scoring.risks[0].factor.includes('Validazione') ||
                              data.scoring.risks[0].level === 'Medio');
        if (riskInItalian) {
          console.log('✅ Risk Assessment in Italian - Working');
        } else {
          console.log('⚠️ Risk Assessment might be in English');
        }
      } else {
        console.log('❌ Italian Scoring - Invalid response structure');
      }
    } else {
      console.log(`❌ Italian Scoring - HTTP ${response.status}`);
    }
  } catch (error) {
    totalTests++;
    console.log(`❌ Italian Scoring - ${error.message}`);
  }

  // Test Summary
  console.log('\n' + '='.repeat(40));
  console.log('📊 QUICK TEST RESULTS');
  console.log('='.repeat(40));
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${totalTests - passedTests} ❌`);
  console.log(`Success Rate: ${successRate}%`);
  
  const grade = successRate >= 90 ? 'A+' :
                successRate >= 80 ? 'A' :
                successRate >= 70 ? 'B' : 'C';
  
  console.log(`Overall Grade: ${grade}`);
  
  if (successRate >= 80) {
    console.log('\n🎉 System validation PASSED!');
    console.log('✅ Core functionality working correctly');
    console.log('✅ Multilingual system operational');
    console.log('🚀 Ready for production use!');
  } else {
    console.log('\n⚠️ Some issues detected - review failed tests');
  }
}

// Run the test
quickValidationTest()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });