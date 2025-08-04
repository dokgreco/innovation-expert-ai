import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Database, Brain, Lightbulb, TrendingUp, 
  Filter, Save, History, Star, Search, FileText,
  BarChart3, Target, Zap, Building2, Rocket, ChevronRight,
  Clock, Bookmark, X, Plus, Edit3, Check, Loader, Menu,
  Award, CheckCircle
} from 'lucide-react';
import AnalysisDisplay from '../components/StructuredAnalysisDisplay';
import ValidationQuestions from '../components/ValidationQuestions';

// Progress steps configuration
const steps = [
  { num: 1, label: "Input", icon: <Edit3 size={16} /> },
  { num: 2, label: "Analysis", icon: <Search size={16} /> },
  { num: 3, label: "Validation", icon: <CheckCircle size={16} /> },
  { num: 4, label: "Scoring", icon: <Award size={16} /> }
];

export default function InnovationExpertAI() {
  const [messages, setMessages] = useState([
    { 
      id: '1',
      role: 'assistant', 
      content: 'Ciao! Sono il tuo Innovation Expert AI. Ho accesso ai database Notion con oltre 200 case histories e best practices per valutare startup e progetti innovativi. Usa i quick prompts per iniziare o fammi una domanda specifica.',
      timestamp: new Date(),
      category: 'welcome'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [savedConversations, setSavedConversations] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [notionConnected, setNotionConnected] = useState(true);
  
  const messagesEndRef = useRef(null);
  const [showValidation, setShowValidation] = useState(false);
const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
const [validationAnswers, setValidationAnswers] = useState({});
const [scoringData, setScoringData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepHistory, setStepHistory] = useState([1]);
  const [deepDiveMode, setDeepDiveMode] = useState(null);
  // Quick Prompts essenziali
  const quickPrompts = [
    {
      id: 'eval-startup',
      text: 'Valuta startup',
      prompt: 'Analizza questa idea di startup utilizzando la metodologia di valutazione dell\'innovazione presente nei database Notion. Fornisci un punteggio strutturato e confronta con case histories simili.',
      icon: <Rocket size={14} />
    },
    {
      id: 'market-analysis',
      text: 'Analisi mercato',
      prompt: 'Fornisci un\'analisi dettagliata del mercato per questa innovazione, includendo trend, competitors e opportunità basandoti sulle best practices dei database Notion.',
      icon: <BarChart3 size={14} />
    },
    {
      id: 'best-practices',
      text: 'Best practices',
      prompt: 'Mostrami le best practices più rilevanti per questo settore, estraendo insights dalle case histories disponibili nei database Notion.',
      icon: <Star size={14} />
    },
    {
      id: 'compare-cases',
      text: 'Confronta casi',
      prompt: 'Confronta questo progetto con le case histories più rilevanti nei database Notion, evidenziando similitudini, differenze e lezioni apprese.',
      icon: <Target size={14} />
    }
  ];
// Navigation function for steps
  const navigateToStep = (targetStep) => {
    if (targetStep <= Math.max(...stepHistory) + 1) {
      setCurrentStep(targetStep);
      setDeepDiveMode(null);
      if (!stepHistory.includes(targetStep)) {
        setStepHistory([...stepHistory, targetStep]);
      }
      // Scroll to step will be implemented later
      // setTimeout(() => scrollToStep(targetStep), 100);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickPrompt = (promptData) => {
    setInput(promptData.prompt);
    handleSubmit(null, promptData.prompt);
    setSidebarOpen(false);
  };

  const handleSubmit = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const currentInput = customPrompt || input.trim();
    if (!currentInput) return;

    const userMessage = { 
      id: Date.now().toString(),
      role: 'user', 
      content: currentInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsAnalyzing(true);
    setCurrentStep(2);
    setIsLoading(false);

    if (!promptHistory.includes(currentInput)) {
      setPromptHistory(prev => [currentInput, ...prev.slice(0, 9)]);
    }
    // Aggiorna step history se non già presente
if (!stepHistory.includes(2)) {
  setStepHistory([...stepHistory, 2]);
}

    try {
      console.log('🚀 Invio query a Notion API:', currentInput);
      
      // Step 1: Query Notion databases
      const notionResponse = await fetch('/api/notion-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentInput, 
          filters: selectedFilters 
        })
      });
      
      if (!notionResponse.ok) {
        throw new Error(`Notion API error: ${notionResponse.status}`);
      }
      
      const notionData = await notionResponse.json();
      console.log('📊 Dati Notion ricevuti:', notionData);
      
      setIsAnalyzing(false);
      setIsLoading(true);

      // Step 2: Send to Claude AI with Notion context
      console.log('🧠 Invio dati a Claude API...');
      
      const claudeResponse = await fetch('/api/claude-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentInput,
          notionData: {
            totalResults: notionData.totalResults || 0,
            insights: (notionData.insights || []).slice(0, 3),
            bestPractices: (notionData.bestPractices || []).slice(0, 3),
            results: (notionData.results || []).slice(0, 2),
            methodology: notionData.methodology || "Metodologia proprietaria"
          },
          filters: selectedFilters
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
      }

      const result = await claudeResponse.json();
      console.log('✅ Risposta Claude ricevuta:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      const assistantMessage = {
  id: Date.now().toString(),
  role: 'assistant',
  content: result.analysis || 'Analisi completata ma contenuto non disponibile',
  timestamp: new Date(),
  sources: result.sources || [],
  parsedSections: result.parsedSections, // <-- AGGIUNGI QUESTA RIGA
  notionQuery: {
    totalResults: notionData.totalResults || 0,
    filtersApplied: selectedFilters.length
  }
};
// 🔍 DEBUG: Verifica cosa arriva al frontend
console.log('🎯 RESULT DAL BACKEND:', {
  hasAnalysis: !!result.analysis,
  hasParsedSections: !!result.parsedSections,
  validationQuestions: result.parsedSections?.validationQuestions || 'non trovate',
  questionCount: result.parsedSections?.validationQuestions?.length || 0
});
      console.log('📝 Aggiungendo messaggio assistant:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('❌ Errore completo:', error);
      setIsAnalyzing(false);
      setIsLoading(false);
      
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Errore nell'analisi: ${error.message}. Le API sono funzionanti ma c'è un problema nell'interfaccia. Controlla console per dettagli.`,
        timestamp: new Date(),
        isError: true
      };
      
      console.log('📝 Aggiungendo messaggio errore:', errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-50 w-64 h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>
        
        {/* Sidebar Header */}
        <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={16} />
              <span className="font-bold text-sm">Innovation Expert</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
          <div className="text-xs opacity-90 mt-1">200+ Case Studies</div>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Start</h3>
          <div className="space-y-2">
            {quickPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handleQuickPrompt(prompt)}
                className="w-full text-left p-2 bg-gray-50 hover:bg-indigo-50 rounded border border-gray-200 hover:border-indigo-200 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="text-indigo-600">{prompt.icon}</div>
                  <span className="text-xs font-medium text-gray-800">{prompt.text}</span>
                </div>
              </button>
            ))}
          </div>
          
          {selectedFilters.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Filtri Attivi</h3>
              <div className="flex flex-wrap gap-1">
                {selectedFilters.map(filter => {
                  const [type, value] = filter.split(':');
                  return (
                    <span key={filter} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {value}
                      <button onClick={() => setSelectedFilters(prev => prev.filter(f => f !== filter))}>
                        <X size={8} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <Database size={16} className={notionConnected ? 'text-green-600' : 'text-red-600'} />
              <span className="text-sm font-medium text-gray-700">
                3 Database Notion
              </span>
              {selectedFilters.length > 0 && (
                <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {selectedFilters.length}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={messages.length <= 1}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save size={12} />
            Salva
          </button>
        </div>
{/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
          {steps.map((item, idx) => (
            <div key={item.num} className="flex items-center">
              <button
                onClick={() => navigateToStep(item.num)}
                disabled={item.num > Math.max(...stepHistory) + 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= item.num 
                    ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700' 
                    : item.num <= Math.max(...stepHistory) + 1
                    ? 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400 cursor-pointer'
                    : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                }`}>
                {currentStep > item.num ? <Check size={16} /> : item.icon}
              </button>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= item.num ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
              {idx < 3 && (
                <ChevronRight className={`mx-3 ${
                  currentStep > item.num ? 'text-indigo-600' : 'text-gray-300'
                }`} size={16} />
              )}
            </div>
          ))}
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-full space-y-6">
            {/* Step-based content display */}
            {currentStep === 1 && (
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Innovation Pattern Analysis</h1>
                <p className="text-gray-600 mb-8">
                  Descrivi il tuo progetto innovativo per una valutazione basata su 200+ case histories e metodologia proprietaria.
                </p>
              </div>
            )}
            
            {/* Original messages display for steps 2+ */}
            {currentStep > 1 && (
              <>
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain size={16} className="text-white" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white ml-auto max-w-2xl'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

                    {message.parsedSections && (
  <div className="mt-6 border-t border-gray-200 pt-6">
    <AnalysisDisplay data={message} />
    
    {/* Mostra validation questions se presenti */}
{message.parsedSections.validationQuestions && 
 message.parsedSections.validationQuestions.length > 0 && 
 currentStep === 2 && (
  <div className="mt-6">
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-indigo-800">
        ✅ Analisi completata! Procedi con la validazione per generare lo scoring calibrato.
      </p>
    </div>
    <button
      onClick={() => {
        setCurrentStep(3);
        if (!stepHistory.includes(3)) {
          setStepHistory([...stepHistory, 3]);
        }
      }}
      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
    >
      <CheckCircle size={20} />
      Procedi alla Validazione
    </button>
  </div>
)}

{/* Mostra validation questions in Step 3 */}
{message.parsedSections.validationQuestions && 
 message.parsedSections.validationQuestions.length > 0 && 
 currentStep === 3 && (
  <div className="mt-6">
    <ValidationQuestions 
      questions={message.parsedSections.validationQuestions}
      onComplete={async (answers) => {
        console.log('Validation answers:', answers);
        
        // Salva le risposte
        setValidationAnswers(answers);
        
        // Mostra loading
        setIsLoading(true);
        
        try {
          // Prepara i dati per lo scoring
          const analysisData = {
            analysis: message.content,
            validationQuestions: message.parsedSections.validationQuestions,
            vertical: message.parsedSections.vertical,
            patterns: message.parsedSections.patterns,
            cases: message.parsedSections.cases
          };
          
          // Chiama l'API di scoring
          const response = await fetch('/api/generate-scoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisData: analysisData,
              validationAnswers: answers
            })
          });
          
          if (!response.ok) {
            throw new Error('Errore nella generazione dello scoring');
          }
          
          const result = await response.json();
          
          // Passa automaticamente a Step 4
          setCurrentStep(4);
          if (!stepHistory.includes(4)) {
            setStepHistory([...stepHistory, 4]);
          }
          
          // Aggiungi il messaggio con lo scoring
          const scoringMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Ho generato lo scoring calibrato basato sulla tua validazione:',
            timestamp: new Date(),
            scoringData: result.scoring,
            isScoring: true
          };
          
          setMessages(prev => [...prev, scoringMessage]);
          
        } catch (error) {
          console.error('Error generating scoring:', error);
          alert('Errore nella generazione dello scoring. Riprova.');
        } finally {
          setIsLoading(false);
        }
      }}
    />
  </div>
)}
  </div>
)}
{/* Mostra scoring se presente */}
{message.isScoring && message.scoringData && currentStep === 4 && (
  <div className="mt-6 space-y-6">
    {/* Overall Score Card */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">🎯 Innovation Score</h3>
          <p className="text-indigo-100 text-sm">Calibrato su benchmark reali</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{message.scoringData.overall.score}/10</div>
          <div className="text-indigo-200">{message.scoringData.overall.rating}</div>
        </div>
      </div>
    </div>

    {/* Dimensions */}
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-4">📊 Scoring per Dimensione</h4>
      <div className="space-y-4">
        {message.scoringData.dimensions.map((dim, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{dim.name}</span>
              <span className="text-sm font-bold text-indigo-600">{dim.score}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${(dim.score / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">{dim.rationale}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Risks */}
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-4">⚠️ Risk Assessment</h4>
      <div className="space-y-3">
        {message.scoringData.risks.map((risk, idx) => (
          <div key={idx} className="border-l-4 border-yellow-400 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{risk.factor}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                risk.level === 'Alto' ? 'bg-red-100 text-red-800' : 
                risk.level === 'Medio' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {risk.level}
              </span>
            </div>
            <p className="text-sm text-gray-600">{risk.description}</p>
            <p className="text-sm text-indigo-600 mt-1">
              <strong>Mitigazione:</strong> {risk.mitigation}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-2">🔍 Database Consultati:</p>
                        <div className="space-y-2">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
                              <span className="font-medium">{source.title}</span>
                              <span className="text-indigo-600 font-mono">{source.id?.slice(0, 8)}...</span>
                            </div>
                          ))}
                        </div>
                        {message.notionQuery && (
                          <div className="mt-2 text-xs text-gray-600">
                            Totale risultati: {message.notionQuery.totalResults} • Filtri: {message.notionQuery.filtersApplied}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <span>{message.timestamp.toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                    {message.role === 'assistant' && !message.isError && (
                      <span className="text-green-600">• DB analizzati</span>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isAnalyzing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Database size={16} className="text-white animate-pulse" />
                </div>
                <div className="bg-white text-gray-800 p-4 rounded-lg border border-gray-200 shadow-sm flex-1">
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin h-4 w-4 text-purple-500" />
                    <span className="text-sm">Analizzo i database Notion...</span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !isAnalyzing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <div className="bg-white text-gray-800 p-4 rounded-lg border border-gray-200 shadow-sm flex-1">
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin h-4 w-4 text-indigo-500" />
                    <span className="text-sm">Elaboro l'analisi di innovazione...</span>
                  </div>
                </div>
              </div>
            )}

            </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
              placeholder="Descrivi la tua startup o progetto innovativo per la valutazione..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              disabled={isLoading || isAnalyzing}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || isAnalyzing || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[60px]"
            >
              {isLoading || isAnalyzing ? <Loader className="animate-spin h-4 w-4" /> : <Send size={16} />}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 Usa i Quick Prompts nella sidebar o descrivi il tuo progetto per una valutazione completa
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salva Conversazione</h3>
            <input
              type="text"
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              placeholder="Titolo della conversazione..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  if (conversationTitle.trim()) {
                    setSavedConversations(prev => [{
                      id: Date.now().toString(),
                      title: conversationTitle.trim(),
                      messages: [...messages],
                      timestamp: new Date(),
                      filters: [...selectedFilters]
                    }, ...prev]);
                    setShowSaveDialog(false);
                    setConversationTitle('');
                  }
                }}
                disabled={!conversationTitle.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}