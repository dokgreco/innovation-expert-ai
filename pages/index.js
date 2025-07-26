import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, User, Database, Brain, Lightbulb, TrendingUp, 
  Filter, Save, History, Star, Search, FileText,
  BarChart3, Target, Zap, Building2, Rocket, ChevronRight,
  Clock, Bookmark, X, Plus, Edit3, Check, Loader, Menu,
  Globe, ChevronDown, Download, Upload, Trash2, ArrowDown
} from 'lucide-react';
import { languages, useTranslation, getLocalizedPrompts } from '../utils/translations';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, exportToCSV, importFromCSV } from '../utils/storage';

export default function InnovationExpertAI() {
  // Language state - MUST be first
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('innovation-language');
      if (saved && languages.map(l => l.code).includes(saved)) {
        return saved;
      }
      const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
      const supported = languages.map(lang => lang.code);
      return supported.includes(browserLang) ? browserLang : 'it';
    }
    return 'it';
  });
  
  // Translation hook
  const { t } = useTranslation(currentLanguage);
  
  // Localized prompts
  const quickPrompts = getLocalizedPrompts(currentLanguage);
  
  // Smart Scroll states
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState(null);
  
  // Storage states
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // UI States
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [messages, setMessages] = useState([]);
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
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Smart scroll functions
  const scrollToBottom = useCallback(() => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isUserScrolling]);

  const scrollToBottomForced = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowScrollButton(false);
      setIsUserScrolling(false);
    }
  }, []);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
    const isScrolledUp = scrollTop < scrollHeight - clientHeight - 200;
    
    // Show floating button if user scrolled up and there are enough messages
    setShowScrollButton(isScrolledUp && messages.length > 2);
    
    // User is scrolling manually if not at bottom
    setIsUserScrolling(!isAtBottom);
    
    // Reset user scrolling after 3 seconds of inactivity
    if (scrollTimeout) clearTimeout(scrollTimeout);
    const timeout = setTimeout(() => {
      if (isAtBottom) {
        setIsUserScrolling(false);
      }
    }, 3000);
    setScrollTimeout(timeout);
  }, [messages.length, scrollTimeout]);

  // Initialize messages from localStorage or create welcome message
  useEffect(() => {
    const loadMessages = () => {
      const savedMessages = loadFromLocalStorage();
      if (savedMessages && Array.isArray(savedMessages) && savedMessages.length > 0) {
        setMessages(savedMessages);
        setLastSaved(new Date());
      } else {
        // Create welcome message in current language
        const welcomeMessage = {
          id: '1',
          role: 'assistant',
          content: t('welcome.message'),
          timestamp: new Date(),
          category: 'welcome'
        };
        setMessages([welcomeMessage]);
      }
    };

    loadMessages();
  }, [t]);

  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].category === 'welcome') {
      const updatedMessages = [...messages];
      updatedMessages[0] = {
        ...updatedMessages[0],
        content: t('welcome.message'),
        timestamp: new Date()
      };
      setMessages(updatedMessages);
    }
  }, [currentLanguage, t]);

  // Auto-save messages to localStorage
  useEffect(() => {
    if (autoSaveEnabled && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        const success = saveToLocalStorage(messages);
        if (success) {
          setLastSaved(new Date());
        }
      }, 1000); // Save 1 second after last change

      return () => clearTimeout(timeoutId);
    }
  }, [messages, autoSaveEnabled]);

  // Smart scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollTimeout]);

  const changeLanguage = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    setShowLanguageMenu(false);
    
    // Save language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('innovation-language', newLanguage);
    }
  };

  // Storage functions
  const handleExportCSV = async () => {
    try {
      const result = exportToCSV(messages);
      if (result.success) {
        // Could show success notification here
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await importFromCSV(file);
      if (result.success) {
        // Merge with existing messages (append)
        setMessages(prev => [...prev, ...result.messages]);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error.message}`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearHistory = () => {
    const success = clearLocalStorage();
    if (success) {
      // Reset to welcome message in current language
      const welcomeMessage = {
        id: '1',
        role: 'assistant',
        content: t('welcome.message'),
        timestamp: new Date(),
        category: 'welcome'
      };
      setMessages([welcomeMessage]);
      setLastSaved(new Date());
      setShowClearDialog(false);
    }
  };

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

    if (!promptHistory.includes(currentInput)) {
      setPromptHistory(prev => [currentInput, ...prev.slice(0, 9)]);
    }

    try {
      // Step 1: Query Notion databases
      const notionResponse = await fetch('/api/notion-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentInput, 
          filters: selectedFilters 
        })
      });
      
      const notionData = await notionResponse.json();
      
      setIsAnalyzing(false);
      setIsLoading(true);

      // Step 2: Send to Claude AI with Notion context (limited payload)
      const claudeResponse = await fetch('/api/claude-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentInput,
          notionData: {
            totalResults: notionData.totalResults || 0,
            insights: (notionData.insights || []).slice(0, 2).map(i => i.substring(0, 100)),
            bestPractices: (notionData.bestPractices || []).slice(0, 2),
            results: (notionData.results || []).slice(0, 1).map(r => ({
              title: r.title || 'Untitled',
              content: (r.content || '').substring(0, 150)
            }))
          },
          filters: selectedFilters
        })
      });

      if (!claudeResponse.ok) {
        throw new Error(`Claude API responded with status: ${claudeResponse.status}`);
      }

      const result = await claudeResponse.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.analysis || 'Analisi completata ma contenuto non disponibile',
        timestamp: new Date(),
        sources: result.sources || [],
        notionQuery: {
          totalResults: notionData.totalResults || 0,
          filtersApplied: selectedFilters.length
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      setIsAnalyzing(false);
      setIsLoading(false);
      
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Errore nell'analisi: ${error.message}. Controlla console per dettagli.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
              <span className="font-bold text-sm">{t('header.title')}</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
          <div className="text-xs opacity-90 mt-1">{t('header.subtitle')}</div>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">{t('quickPrompts.title')}</h3>
          <div className="space-y-2 mb-6">
            {quickPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handleQuickPrompt(prompt)}
                className="w-full text-left p-2 bg-gray-50 hover:bg-indigo-50 rounded border border-gray-200 hover:border-indigo-200 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="text-indigo-600 text-sm">{prompt.icon}</div>
                  <span className="text-xs font-medium text-gray-800">{prompt.text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Storage Controls */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3">
              {currentLanguage === 'en' ? 'Chat History' : 
               currentLanguage === 'es' ? 'Historial de Chat' :
               currentLanguage === 'fr' ? 'Historique Chat' : 'Cronologia Chat'}
            </h3>
            
            {/* Auto-save Status */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 rounded border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="text-xs text-green-700 font-medium">
                  {currentLanguage === 'en' ? 'Auto-saved' :
                   currentLanguage === 'es' ? 'Guardado automático' :
                   currentLanguage === 'fr' ? 'Sauvegarde automatique' : 'Salvato automaticamente'}
                </div>
                <div className="text-xs text-green-600">
                  {messages.length} {currentLanguage === 'en' ? 'messages' :
                                    currentLanguage === 'es' ? 'mensajes' :
                                    currentLanguage === 'fr' ? 'messages' : 'messaggi'}
                  {lastSaved && (
                    <span className="ml-1">
                      • {lastSaved.toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'it-IT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Export/Import Buttons */}
            <div className="space-y-2">
              <button 
                onClick={handleExportCSV}
                disabled={messages.length <= 1}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={12} />
                {currentLanguage === 'en' ? 'Export CSV' :
                 currentLanguage === 'es' ? 'Exportar CSV' :
                 currentLanguage === 'fr' ? 'Exporter CSV' : 'Esporta CSV'}
              </button>
              
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
                >
                  <Upload size={12} />
                  {currentLanguage === 'en' ? 'Import CSV' :
                   currentLanguage === 'es' ? 'Importar CSV' :
                   currentLanguage === 'fr' ? 'Importer CSV' : 'Importa CSV'}
                </button>
              </div>
              
              {/* Clear History */}
              <button 
                onClick={() => setShowClearDialog(true)}
                disabled={messages.length <= 1}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} />
                {currentLanguage === 'en' ? 'Clear History' :
                 currentLanguage === 'es' ? 'Limpiar Historial' :
                 currentLanguage === 'fr' ? 'Effacer Historique' : 'Cancella Cronologia'}
              </button>
            </div>
          </div>
          
          {selectedFilters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
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
                3 {t('header.databases')}
              </span>
              {selectedFilters.length > 0 && (
                <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {selectedFilters.length}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Globe size={12} />
                <span>{currentLanguage.toUpperCase()}</span>
                <ChevronDown size={10} />
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]">
                  {languages.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors ${
                        currentLanguage === lang.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={messages.length <= 1}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save size={12} />
              {t('header.save')}
            </button>
          </div>
        </div>

        {/* Messages Area with Smart Scroll */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 relative"
          onScroll={handleScroll}
        >
          <div className="max-w-full space-y-6">
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
                    <span>{new Date(message.timestamp).toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                    {message.role === 'assistant' && !message.isError && (
                      <span className="text-green-600">• {t('status.databasesAnalyzed')}</span>
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
                    <span className="text-sm">{t('status.analyzingNotion')}</span>
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
                    <span className="text-sm">{t('status.processingAnalysis')}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottomForced}
              className="fixed bottom-24 right-6 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 animate-bounce border-2 border-white"
              title={currentLanguage === 'en' ? 'Scroll to bottom' :
                     currentLanguage === 'es' ? 'Ir abajo' :
                     currentLanguage === 'fr' ? 'Aller en bas' : 'Vai in fondo'}
            >
              <ArrowDown size={18} />
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
              placeholder={t('input.placeholder')}
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
            {t('input.quickTip')}
          </div>
        </div>
      </div>

      {/* Clear History Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentLanguage === 'en' ? 'Clear History' :
               currentLanguage === 'es' ? 'Limpiar Historial' :
               currentLanguage === 'fr' ? 'Effacer Historique' : 'Cancella Cronologia'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLanguage === 'en' ? 'Are you sure you want to clear all chat history? This action cannot be undone.' :
               currentLanguage === 'es' ? '¿Estás seguro de que quieres limpiar todo el historial de chat? Esta acción no se puede deshacer.' :
               currentLanguage === 'fr' ? 'Êtes-vous sûr de vouloir effacer tout l\'historique du chat? Cette action ne peut pas être annulée.' : 
               'Sei sicuro di voler cancellare tutta la cronologia chat? Questa azione non può essere annullata.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {currentLanguage === 'en' ? 'Cancel' :
                 currentLanguage === 'es' ? 'Cancelar' :
                 currentLanguage === 'fr' ? 'Annuler' : 'Annulla'}
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {currentLanguage === 'en' ? 'Clear' :
                 currentLanguage === 'es' ? 'Limpiar' :
                 currentLanguage === 'fr' ? 'Effacer' : 'Cancella'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dialogs.saveTitle')}</h3>
            <input
              type="text"
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              placeholder={t('dialogs.titlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('dialogs.cancel')}
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
                {t('dialogs.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}