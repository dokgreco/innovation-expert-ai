import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'next-i18next';

function ValidationQuestions({ questions, onComplete, resetTrigger, isEditingAnswers = false, submissionCount = 0 }) {
  const { t } = useTranslation('common');
  const [answers, setAnswers] = useState({});
  const [wordCounts, setWordCounts] = useState({});
  const [errors, setErrors] = useState({});

  // Reset dello state quando resetTrigger cambia
  useEffect(() => {
    if (resetTrigger) {
      if (isEditingAnswers) {
        // Preserve current answers and word counts when editing
        setErrors({}); // Only clear errors
      } else {
        // Fresh start - clear everything
        setAnswers({});
        setWordCounts({});
        setErrors({});
      }
    }
  }, [resetTrigger, isEditingAnswers]);

  // Map delle dimensioni API alle chiavi di traduzione
  const getTranslatedQuestion = useCallback((dimension) => {
    const dimensionLower = dimension.toLowerCase();
    if (dimensionLower.includes('jtbd') || dimensionLower.includes('trends')) {
      return t('validation.questions.jtbdTrends');
    }
    if (dimensionLower.includes('competitive') || dimensionLower.includes('positioning')) {
      return t('validation.questions.competitive');
    }
    if (dimensionLower.includes('tech') || dimensionLower.includes('validation') || dimensionLower.includes('adoption')) {
      return t('validation.questions.techValidation');
    }
    if (dimensionLower.includes('process') || dimensionLower.includes('metrics')) {
      return t('validation.questions.processMetrics');
    }
    if (dimensionLower.includes('partnership') || dimensionLower.includes('activation')) {
      return t('validation.questions.partnership');
    }
    // Fallback per dimensioni non riconosciute
    return t('validation.placeholder');
  }, [t]);

  // Debug nel terminale del server
  useEffect(() => {
    // Minimal debug logging only
  }, [questions]);

  // Memoizza la funzione di calcolo parole per evitare ricreazioni
  const countWords = useCallback((text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  // Handler ottimizzato con useCallback
  const handleTextChange = useCallback((dimension, value) => {
    // Calcola il numero di parole immediatamente
    const wordCount = countWords(value);
    
    // Aggiorna tutti gli stati in batch per evitare inconsistenze
    setAnswers(prev => ({
      ...prev,
      [dimension]: value
    }));
    
    setWordCounts(prev => ({
      ...prev,
      [dimension]: wordCount
    }));

    // Rimuovi errore se esiste e il conteggio è valido
    if (wordCount >= 20) {
      setErrors(prev => {
        if (prev[dimension]) {
          const newErrors = { ...prev };
          delete newErrors[dimension];
          return newErrors;
        }
        return prev;
      });
    }
  }, [countWords]);

  // Handler submit ottimizzato
  const handleSubmit = useCallback(() => {
    // Valida che tutte le risposte abbiano almeno 20 parole
    const newErrors = {};
    questions.forEach(q => {
      const answer = answers[q.dimension] || '';
      const wordCount = countWords(answer);
      if (wordCount < 20) {
        newErrors[q.dimension] = t('validation.minWordsError', { count: wordCount });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete(answers);
  }, [questions, answers, countWords, t, onComplete]);

  // Memoizza il check se tutte le risposte sono valide
  const isFormValid = useMemo(() => {
    if (!questions || questions.length === 0) {
      return false;
    }
    
    // Verifica che tutti i field abbiano sia testo che conteggio parole valido
    const valid = questions.every(q => {
      const answer = answers[q.dimension] || '';
      const wordCount = wordCounts[q.dimension] || 0;
      return answer.trim().length > 0 && wordCount >= 20;
    });
    
    return valid;
  }, [questions, wordCounts, answers]);

  // Memoizza il conteggio totale delle parole
  const totalWordCount = useMemo(() => {
    return Object.values(wordCounts).reduce((sum, count) => sum + count, 0);
  }, [wordCounts]);

  // Se non ci sono domande, non mostrare nulla
  if (!questions || questions.length === 0) {
    console.log('⚠️ Nessuna validation question ricevuta');
    return <div className="bg-red-100 p-4 rounded">No validation questions received</div>;
  }


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t('validation.title')}
      </h2>
      <p className="text-gray-600 mb-2">
        {t('validation.description')}
      </p>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-indigo-600">
          {t('validation.detailedTip')}
        </p>
        {totalWordCount > 0 && (
          <span className="text-xs text-gray-500">
            {t('validation.totalWords', { count: totalWordCount })}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const wordCount = wordCounts[q.dimension] || 0;
          const hasError = !!errors[q.dimension];
          const isValid = wordCount >= 20;
          
          
          return (
            <div 
              key={q.dimension} 
              className={`border rounded-lg p-4 transition-colors ${
                hasError ? 'border-red-300 bg-red-50' : 
                isValid ? 'border-green-200 bg-green-50' : 
                'border-gray-200'
              }`}
            >
              <h4 className="font-medium text-gray-900 mb-2">
                {idx + 1}. {q.dimension}
              </h4>
              <p className="text-sm text-gray-700 mb-3">{getTranslatedQuestion(q.dimension)}</p>
              
              {/* TEXTAREA per risposta testuale */}
              <div className="space-y-2">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder={t('validation.placeholder')}
                  value={answers[q.dimension] || ''}
                  onChange={(e) => handleTextChange(q.dimension, e.target.value)}
                />
                
                {/* Contatore parole */}
                <div className="flex justify-between items-center text-xs">
                  <span className={`${
                    isValid ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {t('validation.wordCount', { count: wordCount })}
                    {isValid && ' ✓'}
                  </span>
                  <span className="text-gray-400">
                    {t('validation.minWords')}
                  </span>
                </div>
              </div>
              
              {hasError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors[q.dimension]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isFormValid}
        className={`mt-6 w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center ${
          isFormValid 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <CheckCircle className="mr-2" size={16} />
        {submissionCount === 0 
          ? t('validation.generateScoring')
          : t('validation.regenerateScoring', { current: submissionCount + 1, total: 3 })
        }
      </button>
    </div>
  );
}

export default ValidationQuestions;