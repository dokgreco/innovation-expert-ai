import { useState } from 'react';

export default function TestAPI() {
  const [notionResult, setNotionResult] = useState('');
  const [claudeResult, setClaudeResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testNotion = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notion-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test', filters: [] })
      });
      const data = await response.json();
      setNotionResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setNotionResult('Errore: ' + error.message);
    }
    setLoading(false);
  };

  const testClaude = async () => {
    setLoading(true);
    try {
      const mockNotionData = {
        totalResults: 5,
        insights: ['test insight'],
        bestPractices: ['test practice'],
        results: [{ title: 'test', content: 'test content', database: 'test' }]
      };
      
      const response = await fetch('/api/claude-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: 'test startup evaluation', 
          notionData: mockNotionData, 
          filters: [] 
        })
      });
      const data = await response.json();
      setClaudeResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setClaudeResult('Errore: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test API Keys</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <button 
            onClick={testNotion}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Notion API'}
          </button>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto h-64">
            {notionResult || 'Clicca per testare Notion API'}
          </pre>
        </div>
        
        <div>
          <button 
            onClick={testClaude}
            disabled={loading}
            className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Claude API'}
          </button>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto h-64">
            {claudeResult || 'Clicca per testare Claude API'}
          </pre>
        </div>
      </div>
    </div>
  );
}
