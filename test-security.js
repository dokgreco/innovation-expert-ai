// 🔒 F.2.1.5 Security Implementation Test
// Quick test to verify security components work correctly

console.log('🔒 Testing F.2.1.5 Security Implementation...\n');

// Test 1: SecureScoringEngine
try {
  const { SecureScoringEngine } = require('./utils/secureScoring');
  const scoringEngine = new SecureScoringEngine();
  
  const testAnswers = {
    'Jobs-to-be-Done & Market Trends': 'We will target specific customer segments with validated pain points, measuring success through KPIs and customer feedback interviews.',
    'Competitive Positioning Canvas': 'Our unique differentiation creates a strong competitive moat through proprietary technology and superior user experience.',
    'Technology Adoption & Validation': 'Scalable cloud architecture with tested APIs, implementing MVP validation and security best practices.',
    'Process & Metrics': 'We track KPIs including conversion rates, optimize workflows, and use automated monitoring dashboards.',
    'Partnership Activation': 'Strategic B2B partnerships with key distribution channels and ecosystem integration for synergistic growth.'
  };
  
  const result = scoringEngine.calculateSecureScore(testAnswers);
  console.log('✅ SecureScoringEngine Test PASSED');
  console.log(`   - Overall Score: ${result.overall.score}/10`);
  console.log(`   - Security Level: ${result.metadata.securityLevel}`);
  console.log(`   - Algorithm Version: ${result.metadata.algorithmVersion}\n`);
  
} catch (error) {
  console.log('❌ SecureScoringEngine Test FAILED:', error.message);
}

// Test 2: AlgorithmCore
try {
  const { AlgorithmCore } = require('./utils/algorithmCore');
  const algorithmCore = new AlgorithmCore();
  
  const testInput = 'fintech platform with AI-powered analytics, targeting digital banking sector with scalable cloud infrastructure';
  const result = algorithmCore.analyzePatterns(testInput, 'fintech');
  
  console.log('✅ AlgorithmCore Test PASSED');
  console.log(`   - Pattern Analysis Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`   - Benchmark Score: ${(result.benchmarkScore * 100).toFixed(1)}%`);
  console.log(`   - Core Version: ${result.metadata.coreVersion}\n`);
  
} catch (error) {
  console.log('❌ AlgorithmCore Test FAILED:', error.message);
}

// Test 3: AlgorithmLoader
try {
  const { AlgorithmLoader } = require('./utils/algorithmLoader');
  
  const availableVersions = AlgorithmLoader.getAvailableVersions();
  console.log('✅ AlgorithmLoader Test PASSED');
  console.log(`   - Available Versions: ${availableVersions.map(v => v.version).join(', ')}`);
  console.log(`   - Security Levels: ${availableVersions.map(v => v.securityLevel).join(', ')}\n`);
  
  // Test algorithm loading
  AlgorithmLoader.loadAlgorithm('latest', 'scoring').then(result => {
    console.log('✅ Dynamic Algorithm Loading Test PASSED');
    console.log(`   - Loaded Version: ${result.metadata.version}`);
    console.log(`   - Security Level: ${result.metadata.securityLevel}`);
    console.log(`   - Components: ${result.metadata.component}\n`);
  }).catch(error => {
    console.log('❌ Dynamic Algorithm Loading Test FAILED:', error.message);
  });
  
} catch (error) {
  console.log('❌ AlgorithmLoader Test FAILED:', error.message);
}

// Test 4: EnvironmentSecurity
try {
  const { getSecurityLevel, shouldObfuscateAlgorithm, shouldProtectWeights } = require('./utils/environmentSecurity');
  
  const securityConfig = getSecurityLevel();
  console.log('✅ EnvironmentSecurity Test PASSED');
  console.log(`   - Environment: ${securityConfig.environment}`);
  console.log(`   - Obfuscation: ${securityConfig.obfuscation}`);
  console.log(`   - Algorithm Protection: ${shouldObfuscateAlgorithm()}`);
  console.log(`   - Weights Protection: ${shouldProtectWeights()}\n`);
  
} catch (error) {
  console.log('❌ EnvironmentSecurity Test FAILED:', error.message);
}

// Test 5: Environment Variables
console.log('🔒 Environment Variables Check:');
const requiredEnvVars = [
  'WEIGHT_SPECIFICITY',
  'WEIGHT_ALIGNMENT', 
  'WEIGHT_COMPLETENESS',
  'WEIGHT_ACTIONABILITY',
  'ALGORITHM_VERSION'
];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: ${value}`);
  } else {
    console.log(`   ⚠️ ${envVar}: Not set (using defaults)`);
  }
});

console.log('\n🔒 F.2.1.5 Security Implementation Test Complete!');