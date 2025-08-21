import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { SecureLogger } from '../utils/secureLogger';
import { 
  Send, Bot, User, Database, Brain, Lightbulb, TrendingUp, 
  Filter, History, Star, Search, FileText,
  BarChart3, Target, Zap, Building2, Rocket, ChevronRight,
  Clock, Bookmark, X, Plus, Edit3, Check, Loader, Menu,
  Award, CheckCircle, Users, MessageCircle
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import AnalysisDisplay from '../components/StructuredAnalysisDisplay';
import ValidationQuestions from '../components/ValidationQuestions';

// Funzione avanzata per formattare il testo Markdown in HTML
const formatMarkdownText = (text) => {
  if (!text) return '';
  
  // Prima passa: sostituisci i pattern Markdown con HTML
  let formatted = text
    // Headers con emoji/numeri - specifici per deep dive
    .replace(/^##\s+(.+)$/gm, '<h2 class="font-bold text-lg mt-6 mb-4 text-indigo-800 border-b border-indigo-200 pb-2">$1</h2>')
    .replace(/^###\s+(.+)$/gm, '<h3 class="font-bold text-base mt-4 mb-3 text-indigo-900">$1</h3>')
    .replace(/^#\s+(.+)$/gm, '<h1 class="font-bold text-xl mt-6 mb-4 text-indigo-700">$1</h1>')
    
    // Pattern numerati (es: "1. JTBD Verticale IoT Platform:")
    .replace(/^\*\*(\d+)\.\s+([^*]+):\*\*/gm, '<div class="mt-5 mb-3"><h4 class="font-bold text-indigo-800 text-base">$1. $2</h4></div>')
    
    // Bold con : all'interno di liste (es: "**Core Job**: "Help me...")  
    .replace(/\*\*([^*:]+):\*\*\s*"([^"]+)"/g, '<div class="ml-4 mb-2"><span class="font-semibold text-gray-800">$1:</span> <em class="text-gray-700">"$2"</em></div>')
    .replace(/\*\*([^*:]+):\*\*\s*(.+)/g, '<div class="ml-4 mb-2"><span class="font-semibold text-gray-800">$1:</span> <span class="text-gray-700">$2</span></div>')
    
    // Bold text normale
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Liste con - (sub-liste)
    .replace(/^-\s+(.+)$/gm, '<li class="ml-8 mb-2 text-gray-700 list-disc">$1</li>')
    
    // Timeline format specifico
    .replace(/^\*\*(\d+-\d+\s+\w+)\*\*:\s*(.+)$/gm, 
      '<div class="flex gap-3 my-3 ml-4"><span class="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-sm">$1</span><span class="text-gray-700 flex-1">$2</span></div>')
    
    // Gestione migliorata dei line breaks
    .replace(/\n\n+/g, '|||PARAGRAPH|||') // Doppi/multipli a capo = nuovi paragrafi
    .replace(/\n(?=\d+\.)/g, '|||PARAGRAPH|||') // A capo prima di numeri = nuovo paragrafo
    .replace(/\n(?=\*\*)/g, '|||PARAGRAPH|||') // A capo prima di bold = nuovo paragrafo  
    .replace(/\n(?=-\s)/g, ' ') // A capo prima di lista = spazio
    .replace(/\n/g, '<br>') // Altri a capo = line break
    .replace(/\|\|\|PARAGRAPH\|\|\|/g, '</div><div class="mb-4">');
  
  // Seconda passa: sistema le liste
  formatted = formatted
    // Raggruppa i <li> consecutivi in <ul>
    .replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
      return '<ul class="space-y-1 my-3">' + match + '</ul>';
    });
  
  // Terza passa: wrappa tutto in un div principale
  if (!formatted.startsWith('<div') && !formatted.startsWith('<h')) {
    formatted = '<div class="mb-4">' + formatted;
  }
  if (!formatted.endsWith('</div>') && !formatted.endsWith('>')) {
    formatted = formatted + '</div>';
  }
  
  // Fix finali: pulisci e sistema
  formatted = formatted
    .replace(/<div class="mb-4">\s*<\/div>/g, '')
    .replace(/<div class="mb-4">\s*<h/g, '<h')
    .replace(/<\/h(\d)>\s*<\/div>/g, '</h$1>');
  
  return formatted;
};
// Progress steps configuration
const steps = [
  { num: 1, label: "Input", icon: <Edit3 size={16} /> },
  { num: 2, label: "Analysis", icon: <Search size={16} /> },
  { num: 3, label: "Validation", icon: <CheckCircle size={16} /> },
  { num: 4, label: "Scoring", icon: <Award size={16} /> }
];

// Lazy load del componente Deep Dive per performance
// Componente inline per Deep Dive (lazy loading non necessario per componenti inline)
// Commentato per future implementazioni
// const DeepDiveSection = lazy(() => import('../components/DeepDiveSection'));
export default function InnovationExpertAI() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  
  // Set initial message after translations are loaded
  useEffect(() => {
    if (messages.length === 0 && ready && t('welcome.message')) {
      setMessages([
        { 
          id: '1',
          role: 'assistant', 
          content: t('welcome.message'),
          timestamp: new Date(),
          category: 'welcome'
        }
      ]);
    }
  }, [t, ready, messages.length]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const [notionConnected, setNotionConnected] = useState(true);
  
  const messagesEndRef = useRef(null);
  const [showValidation, setShowValidation] = useState(false);
const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
const [validationAnswers, setValidationAnswers] = useState({});
const [scoringData, setScoringData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepHistory, setStepHistory] = useState([1]);
  const [deepDiveMode, setDeepDiveMode] = useState(null);
  const [validationResetTrigger, setValidationResetTrigger] = useState(0);
  
  // 🚀 RE-SUBMISSION FLOW STATES (Phase E.3)
  const [scoringHistory, setScoringHistory] = useState([]);
  const [isEditingAnswers, setIsEditingAnswers] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [previousScore, setPreviousScore] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  // Stati per Deep Dive conversations
const [sectionConversations, setSectionConversations] = useState({});
const [sectionInputs, setSectionInputs] = useState({});
const [sectionLoading, setSectionLoading] = useState({});
  // Quick Prompts essenziali con traduzioni
  const quickPrompts = [
    {
      id: 'eval-startup',
      text: t('quickPrompts.evalStartup.text'),
      prompt: t('quickPrompts.evalStartup.prompt'),
      icon: <Rocket size={14} />
    },
    {
      id: 'market-analysis',
      text: t('quickPrompts.marketAnalysis.text'),
      prompt: t('quickPrompts.marketAnalysis.prompt'),
      icon: <BarChart3 size={14} />
    },
    {
      id: 'best-practices',
      text: t('quickPrompts.bestPractices.text'),
      prompt: t('quickPrompts.bestPractices.prompt'),
      icon: <Star size={14} />
    },
    {
      id: 'compare-cases',
      text: t('quickPrompts.compareCases.text'),
      prompt: t('quickPrompts.compareCases.prompt'),
      icon: <Target size={14} />
    }
  ];

  // Deep Dive Sections con traduzioni
const deepDiveSections = [
  { 
    icon: <Target size={14} />, 
    text: t('deepDive.sections.jtbdTrends.title'), 
    key: "jtbd-trends",
    subtitle: t('deepDive.sections.jtbdTrends.subtitle'),
    count: sectionConversations['jtbd-trends']?.length || 0
  },
  { 
    icon: <Zap size={14} />, 
    text: t('deepDive.sections.competitive.title'), 
    key: "competitive",
    subtitle: t('deepDive.sections.competitive.subtitle'),
    count: sectionConversations.competitive?.length || 0
  },
  { 
    icon: <Rocket size={14} />, 
    text: t('deepDive.sections.techValidation.title'), 
    key: "tech-validation",
    subtitle: t('deepDive.sections.techValidation.subtitle'),
    count: sectionConversations['tech-validation']?.length || 0
  },
  { 
    icon: <BarChart3 size={14} />, 
    text: t('deepDive.sections.processMetrics.title'), 
    key: "process-metrics",
    subtitle: t('deepDive.sections.processMetrics.subtitle'),
    count: sectionConversations['process-metrics']?.length || 0
  },
  { 
    icon: <Users size={14} />, 
    text: t('deepDive.sections.partnership.title'), 
    key: "partnership",
    subtitle: t('deepDive.sections.partnership.subtitle'),
    count: sectionConversations.partnership?.length || 0
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

// Compatibility mapping for old keys to new V2 structure
const sectionKeyMapping = {
  "strategic": "jtbd-trends",
  "competitive": "competitive", 
  "roadmap": "tech-validation",
  "kor": "process-metrics",
  "partners": "partnership"
};

const handleSectionQuestion = async (section, question) => {
  if (!question.trim()) return;
  
  // Map old keys to new V2 keys if necessary
  const mappedSection = sectionKeyMapping[section] || section;
  
  // NUOVO: Trova l'ultimo messaggio con analisi completa
  const lastAnalysisMessage = messages.filter(m => m.parsedSections).pop();
  const contextData = lastAnalysisMessage?.parsedSections || {};
  
  setSectionLoading({ ...sectionLoading, [mappedSection]: true });
  
  const newConversation = [
    ...(sectionConversations[mappedSection] || []),
    { role: 'user', content: question, timestamp: new Date() }
  ];
  
  setSectionConversations({
    ...sectionConversations,
    [mappedSection]: newConversation
  });
  
  setSectionInputs({ ...sectionInputs, [mappedSection]: '' });

  try {
    const response = await fetch('/api/claude-section-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: mappedSection,
        question: question,
        locale: router.locale,
        analysisContext: {
          // NUOVO: Usa i dati reali dall'analisi
          vertical: contextData.verticals || 'IoT Platform Solutions',
          patterns: contextData.patterns || '',
          cases: contextData.cases || '',
          
          // Passa le sezioni specifiche
          jtbdTrends: contextData.jtbdTrends || '',
          competitiveCanvas: contextData.competitiveCanvas || '',
          techValidation: contextData.techValidation || '',
          processMetrics: contextData.processMetrics || '',
          partnership: contextData.partnership || '',
          
          // Query originale dell'utente
          originalQuery: messages.find(m => m.role === 'user')?.content || ''
        }
      })
    });

    const data = await response.json();
    
    setSectionConversations(prev => ({
      ...prev,
      [mappedSection]: [
        ...newConversation,
        { role: 'assistant', content: data.answer || 'Response generated', timestamp: new Date() }
      ]
    }));
  } catch (error) {
    console.error('Section Q&A Error:', error);
    setSectionConversations(prev => ({
      ...prev,
      [mappedSection]: [
        ...newConversation,
        { role: 'assistant', content: 'Error generating response. Please try again.', timestamp: new Date() }
      ]
    }));
  } finally {
    setSectionLoading({ ...sectionLoading, [mappedSection]: false });
  }
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
      SecureLogger.dev('🚀 Query to Notion API initiated');
      
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
      SecureLogger.dev('📊 Notion data received - count:', notionData?.length || 0);
      
      setIsAnalyzing(false);
      setIsLoading(true);

      // Step 2: Send to Claude AI with Notion context
      SecureLogger.dev('🧠 Sending data to Claude API...');
      
      const claudeResponse = await fetch('/api/claude-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentInput,
          locale: router.locale,
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
      SecureLogger.dev('✅ Claude response received - sections:', result?.parsedSections?.length || 0);

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
SecureLogger.dev('🎯 Backend result received:', {
  hasAnalysis: !!result.analysis,
  hasParsedSections: !!result.parsedSections,
  questionCount: result.parsedSections?.validationQuestions?.length || 0
});
      SecureLogger.dev('📝 Adding assistant message');
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
      
      SecureLogger.dev('📝 Adding error message');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  // Show loading while translations are being loaded
  if (!ready) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
              <span className="font-bold text-sm">{t('app.title')}</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
          <div className="text-xs opacity-90 mt-1">{t('app.caseStudies')}</div>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 flex-1 overflow-y-auto">
          
          {/* Instructions Link */}
          <div className="mb-4">
            <button
              onClick={() => router.push('/istruzioni')}
              className="w-full text-left p-3 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span className="text-xs font-medium">{t('navigation.instructions')}</span>
              </div>
              <div className="text-xs text-indigo-600 mt-1">{t('navigation.instructionsSubtitle')}</div>
            </button>
          </div>
                    
          {/* Deep Dive Sections - Always available after analysis */}
          {currentStep >= 2 && messages.some(m => m.parsedSections) && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Deep Dive Analysis</h3>
              <div className="space-y-2">
                {deepDiveSections.map((section) => (
                  <div
                    key={section.key}
                    onClick={() => setDeepDiveMode(deepDiveMode === section.key ? null : section.key)}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                      deepDiveMode === section.key
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="text-xs font-medium">{section.text}</span>
                      </div>
                      {section.count > 0 && (
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">
                          {section.count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-5">{section.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedFilters.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">{t('ui.filters.active')}</h3>
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
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
              {t('app.alphaVersion')}
            </span>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu size={20} />
            </button>
            
{selectedFilters.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {selectedFilters.length}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  const newLocale = router.locale === 'it' ? 'en' : 'it';
                  const { pathname, asPath, query } = router;
                  router.push({ pathname, query }, asPath, { locale: newLocale });
                }}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors border"
                title={t('language.switch')}
              >
                <span className="font-medium">{t(`language.code.${router.locale}`)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                </svg>
              </button>
            </div>
          </div>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('app.title')} {t('app.subtitle')}</h1>
                <p className="text-lg text-gray-700 mb-4 font-medium">
                  {t('app.methodology')}
                </p>
                <p className="text-gray-600 mb-8">
                  {t('app.description')}
                </p>
              </div>
            )}
            
            {/* Original messages display for steps 2+ */}
{currentStep > 1 && (
  <>
    {/* NUOVA LOGICA: Mostra Deep Dive O messages normali */}
    {deepDiveMode && messages.some(m => m.parsedSections) ? (
  // VISTA DEEP DIVE
  <div className="w-full max-w-none">
        {/* Back button */}
        <button
          onClick={() => setDeepDiveMode(null)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="rotate-180" size={20} />
          <span>{t('deepDive.backToAnalysis')}</span>
        </button>
        
        {/* Deep Dive Content */}
<div className="space-y-6">
  {/* Sezione contenuto principale */}
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      {deepDiveMode === 'jtbd-trends' && '🎯 Jobs-to-be-Done & Market Trends'}
{deepDiveMode === 'competitive' && '⚔️ Competitive Positioning Canvas'}
{deepDiveMode === 'tech-validation' && '🚀 Technology Adoption & Validation'}
{deepDiveMode === 'process-metrics' && '📊 Process & Metrics'}
{deepDiveMode === 'partnership' && '🤝 Partnership Activation'}
    </h2>
    
    {/* Contenuto specifico per sezione */}
    <div className="space-y-4">
      {(() => {
        // Trova il messaggio con parsedSections
        const analysisMessage = messages.find(m => m.parsedSections);
        if (!analysisMessage) return <p>Nessuna analisi disponibile</p>;
        
        const sections = analysisMessage.parsedSections;
        
        switch(deepDiveMode) {
  case 'jtbd-trends':
  return (
    <>
      {sections.jtbdTrends && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Jobs-to-be-Done & Market Trends</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="prose prose-indigo max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.jtbdTrends) }} />
          </div>
        </div>
      )}
    </>
  );
  
case 'competitive':
  return (
    <>
      {sections.competitiveCanvas && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Competitive Positioning Canvas</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="prose prose-yellow max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.competitiveCanvas) }} />
          </div>
        </div>
      )}
    </>
  );
  
case 'tech-validation':
  return (
    <>
      {sections.techValidation && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Adoption & Validation</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="prose prose-green max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.techValidation) }} />
          </div>
        </div>
      )}
    </>
  );
  
case 'process-metrics':
  return (
    <>
      {sections.processMetrics && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Process & Metrics</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="prose prose-purple max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.processMetrics) }} />
          </div>
        </div>
      )}
    </>
  );
  
case 'partnership':
  return (
    <>
      {sections.partnership && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Partnership Activation</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="prose prose-blue max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.partnership) }} />
          </div>
        </div>
      )}
    </>
  );
    
  default:
    return <p className="text-gray-500">Sezione non disponibile. Fai prima un'analisi completa.</p>;
}
      })()}
    </div>
  </div>

  {/* Area Q&A Interattiva */}
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <MessageCircle size={20} className="text-indigo-600" />
      {t('deepDive.askMore')}
    </h3>
    
    {/* Thread conversazione per questa sezione */}
    {sectionConversations[deepDiveMode] && sectionConversations[deepDiveMode].length > 0 && (
      <div className="mb-6 space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
        {sectionConversations[deepDiveMode].map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl p-4 rounded-lg shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {msg.role === 'user' ? (
                <div className="text-sm leading-relaxed">{msg.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none leading-relaxed text-gray-800" dangerouslySetInnerHTML={{ __html: formatMarkdownText(msg.content) }} />
              )}
              <div className="text-xs opacity-70 mt-2 pt-2 border-t border-gray-200 border-opacity-30">
                {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    
    {/* Loading state */}
    {sectionLoading[deepDiveMode] && (
      <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 rounded-lg">
        <Loader className="animate-spin h-4 w-4 text-indigo-600" />
        <span className="text-sm text-indigo-700">{t('deepDive.generating')}</span>
      </div>
    )}
    
    {/* Input area */}
    <div className="flex gap-2">
      <input
        type="text"
        value={sectionInputs[deepDiveMode] || ''}
        onChange={(e) => setSectionInputs({ ...sectionInputs, [deepDiveMode]: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSectionQuestion(deepDiveMode, sectionInputs[deepDiveMode]);
          }
        }}
        placeholder={t(`deepDive.placeholder.${deepDiveMode}`)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        disabled={sectionLoading[deepDiveMode]}
      />
      <button
        onClick={() => handleSectionQuestion(deepDiveMode, sectionInputs[deepDiveMode])}
        disabled={!sectionInputs[deepDiveMode]?.trim() || sectionLoading[deepDiveMode]}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[50px]"
      >
        {sectionLoading[deepDiveMode] ? <Loader className="animate-spin h-4 w-4" /> : <Send size={16} />}
      </button>
    </div>
    
    <div className="mt-2 text-xs text-gray-500">
      {t('deepDive.examples')}
    </div>
  </div>
</div>
      </div>
  ) : (
    // VISTA NORMALE
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

{/* AGGIUNGI QUI IL NUOVO BLOCCO - INIZIO */}
{/* Display Operational Sections V2 */}
{message.parsedSections && (
  <div className="mt-6 space-y-4">
    {message.parsedSections.jtbdTrends && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">4. Jobs-to-be-Done & Market Trends</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.parsedSections.jtbdTrends}</div>
      </div>
    )}
    
    {message.parsedSections.competitiveCanvas && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">5. Competitive Positioning Canvas</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.parsedSections.competitiveCanvas}</div>
      </div>
    )}
    
    {message.parsedSections.techValidation && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">6. Technology Adoption & Validation</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.parsedSections.techValidation}</div>
      </div>
    )}
    
    {message.parsedSections.processMetrics && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">7. Process & Metrics</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.parsedSections.processMetrics}</div>
      </div>
    )}
    
    {message.parsedSections.partnership && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">8. Partnership Activation</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.parsedSections.partnership}</div>
      </div>
    )}
  </div>
)}
{/* AGGIUNGI QUI IL NUOVO BLOCCO - FINE */}
                    
{/* Mostra validation questions se presenti */}
{message.parsedSections && 
 currentStep === 2 && (
  <div className="mt-6">
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-indigo-800">
                            {t('analysis.completed')}
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
                          {t('ui.buttons.proceed')}
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
                          resetTrigger={validationResetTrigger}
                          isEditingAnswers={isEditingAnswers}
                          submissionCount={submissionCount}
                          onComplete={async (answers) => {
                            SecureLogger.dev('Validation answers count:', Object.keys(answers).length);
                            
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
                                  validationAnswers: answers,
                                  language: router.locale || 'it'
                                })
                              });
                              
                              if (!response.ok) {
                                throw new Error('Errore nella generazione dello scoring');
                              }
                              
                              const result = await response.json();
                              
                              // 🚀 RE-SUBMISSION LOGIC - Salva nella history e calcola delta
                              const newSubmissionCount = submissionCount + 1;
                              const currentScore = result.scoring.overall.score;
                              let scoreDelta = null;
                              
                              if (previousScore !== null) {
                                scoreDelta = currentScore - previousScore;
                              }
                              
                              // Salva nella history
                              const scoringRecord = {
                                submissionNumber: newSubmissionCount,
                                score: currentScore,
                                rating: result.scoring.overall.rating,
                                delta: scoreDelta,
                                timestamp: new Date(),
                                answers: answers
                              };
                              
                              setScoringHistory(prev => [...prev, scoringRecord]);
                              setSubmissionCount(newSubmissionCount);
                              setPreviousScore(currentScore);
                              setIsEditingAnswers(false);
                              
                              SecureLogger.dev('💾 Scoring saved to history');
                              
                              // Passa automaticamente a Step 4
                              setCurrentStep(4);
                              if (!stepHistory.includes(4)) {
                                setStepHistory([...stepHistory, 4]);
                              }
                              
                              // Aggiungi il messaggio con lo scoring e delta
                              const scoringMessage = {
                                id: Date.now().toString(),
                                role: 'assistant',
                                content: submissionCount > 0 
                                  ? t('scoring.recalculated', { iteration: newSubmissionCount })
                                  : t('scoring.generated'),
                                timestamp: new Date(),
                                scoringData: result.scoring,
                                scoreDelta: scoreDelta,
                                submissionNumber: newSubmissionCount,
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
                          <h3 className="text-lg font-bold">{t('scoring.title')}</h3>
                          <p className="text-indigo-100 text-sm">{t('scoring.subtitle')}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{message.scoringData.overall.score}/10</div>
                          <div className="text-indigo-200">{message.scoringData.overall.rating}</div>
                        </div>
                      </div>
                    </div>

                    {/* Delta Score Display (solo per re-submissions) */}
                    {message.scoreDelta !== null && message.scoreDelta !== undefined && (
                      <div className={`border-2 rounded-lg p-4 ${
                        message.scoreDelta > 0 
                          ? 'border-green-200 bg-green-50' 
                          : message.scoreDelta < 0 
                          ? 'border-red-200 bg-red-50'
                          : 'border-yellow-200 bg-yellow-50'
                      }`}>
                        <div className="flex items-center justify-center space-x-3">
                          <div className="text-sm font-medium text-gray-700">
                            {t('scoring.iteration', { current: message.submissionNumber, total: 3 })}
                          </div>
                          <div className={`text-xl font-bold ${
                            message.scoreDelta > 0 
                              ? 'text-green-600' 
                              : message.scoreDelta < 0 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                          }`}>
                            {message.scoreDelta > 0 ? '+' : ''}{message.scoreDelta.toFixed(1)}
                            {message.scoreDelta > 0 ? ' ↗️' : message.scoreDelta < 0 ? ' ↘️' : ' ➡️'}
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <span className={`text-sm ${
                            message.scoreDelta > 0 
                              ? 'text-green-700' 
                              : message.scoreDelta < 0 
                              ? 'text-red-700' 
                              : 'text-yellow-700'
                          }`}>
                            {message.scoreDelta > 0 
                              ? '✅ Miglioramento rilevato!' 
                              : message.scoreDelta < 0 
                              ? '⚠️ Score diminuito' 
                              : '💡 Score invariato'
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Dimensions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4">{t('scoring.dimensionsTitle')}</h4>
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
                      <h4 className="font-semibold text-gray-900 mb-4">{t('scoring.riskAssessment')}</h4>
                      <div className="space-y-3">
                        {message.scoringData.risks.map((risk, idx) => (
                          <div key={idx} className="border-l-4 border-yellow-400 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{risk.factor}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                risk.level === 'Alto' || risk.level === 'High' ? 'bg-red-100 text-red-800' : 
                                risk.level === 'Medio' || risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {risk.level}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{risk.description}</p>
                            <p className="text-sm text-indigo-600 mt-1">
                              <strong>{t('scoring.priority')}:</strong> {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Re-Score Button */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('scoring.rescore')}</h4>
                      <p className="text-sm text-gray-600 mb-4">{t('scoring.rescoreSubtitle')}</p>
                      
                      {submissionCount < 3 ? (
                        <button
                          onClick={() => {
                            SecureLogger.dev('🔄 RE-SCORE button clicked - iteration:', submissionCount + 1);
                            setCurrentStep(3);
                            setStepHistory(prev => [...prev, 3]);
                            setValidationResetTrigger(prev => prev + 1);
                            setIsEditingAnswers(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          {submissionCount === 0 
                            ? t('scoring.rescore') 
                            : t('scoring.improve', { current: submissionCount + 1, total: 3 })
                          }
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            ✅ Limite di 3 iterazioni raggiunto
                          </p>
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            Limite Raggiunto (3/3)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">🔍 {t('ui.conversation.analyzed')}:</p>
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
                        {t('ui.conversation.totalResults')}: {message.notionQuery.totalResults} • {t('ui.conversation.filters')}: {message.notionQuery.filtersApplied}
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
                  <span className="text-green-600">• {t('ui.conversation.analyzed')}</span>
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
              <div className="flex items-center gap-2 mb-3">
                <Loader className="animate-spin h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">{t('system.loading.databases')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '65%'}}></div>
              </div>
              <div className="text-xs text-gray-500">Analyzing 300+ case histories...</div>
            </div>
          </div>
        )}

        {isLoading && !isAnalyzing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div className="bg-white text-gray-800 p-4 rounded-lg border border-gray-200 shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Loader className="animate-spin h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium">{t('system.loading.claude')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full animate-pulse" style={{width: '80%'}}></div>
              </div>
              <div className="text-xs text-gray-500">Processing innovation analysis...</div>
            </div>
          </div>
        )}
      </>
    )}
  </>
)}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Hide in deep-dive mode and validation step */}
        {!deepDiveMode && currentStep !== 3 && (
          <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
              placeholder={t('form.placeholder')}
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
          
          {/* Copyright & Privacy */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-1">
              <span>{t('instructions.copyright')}</span>
              <span>•</span>
              <button 
                onClick={() => router.push('/privacy')}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                {t('instructions.privacyLink')}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}