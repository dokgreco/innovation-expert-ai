import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ValidationQuestions = memo(function ValidationQuestions({ questions, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [wordCounts, setWordCounts] = useState({});
  const [errors, setErrors] = useState({});

  // Debug nel terminale del server
  useEffect(() => {
    console.log('📝 Validation Questions ricevute:', questions?.length || 0, 'domande');
    if (questions && questions.length > 0) {
      console.log('Struttura prima domanda:', {
        dimension: questions[0].dimension,
        question: questions[0].question?.substring(0, 50) + '...',
        hasOptions: !!questions[0].options
      });
    }
  }, [questions]);

  // Memoizza la funzione di calcolo parole per evitare ricreazioni
  const countWords = useCallback((text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  // Handler ottimizzato con useCallback
  const handleTextChange = useCallback((dimension, value) => {
    // Aggiorna la risposta
    setAnswers(prev => ({
      ...prev,
      [dimension]: value
    }));
    
    // Calcola il numero di parole
    const wordCount = countWords(value);
    
    setWordCounts(prev => ({
      ...prev,
      [dimension]: wordCount
    }));

    // Rimuovi errore se esiste e il conteggio è valido
    setErrors(prev => {
      if (prev[dimension] && wordCount >= 20) {
        const newErrors = { ...prev };
        delete newErrors[dimension];
        return newErrors;
      }
      return prev;
    });
  }, [countWords]);

  // Handler submit ottimizzato
  const handleSubmit = useCallback(() => {
    // Valida che tutte le risposte abbiano almeno 20 parole
    const newErrors = {};
    questions.forEach(q => {
      const answer = answers[q.dimension] || '';
      const wordCount = countWords(answer);
      if (wordCount < 20) {
        newErrors[q.dimension] = `Minimo 20 parole richieste (attuale: ${wordCount})`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('✅ Risposte inviate:', Object.keys(answers).length, 'risposte');
    onComplete(answers);
  }, [questions, answers, countWords, onComplete]);

  // Memoizza il check se tutte le risposte sono valide
  const isFormValid = useMemo(() => {
    if (!questions || questions.length === 0) return false;
    
    return questions.every(q => {
      const wordCount = wordCounts[q.dimension] || 0;
      return wordCount >= 20;
    });
  }, [questions, wordCounts]);

  // Memoizza il conteggio totale delle parole
  const totalWordCount = useMemo(() => {
    return Object.values(wordCounts).reduce((sum, count) => sum + count, 0);
  }, [wordCounts]);

  // Se non ci sono domande, non mostrare nulla
  if (!questions || questions.length === 0) {
    console.log('⚠️ Nessuna validation question ricevuta');
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Validazione per Assessment Calibrato
      </h2>
      <p className="text-gray-600 mb-2">
        Descrivi il tuo approccio per ogni dimensione strategica.
      </p>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-indigo-600">
          💡 Risposte dettagliate (minimo 20 parole) generano scoring più accurati
        </p>
        {totalWordCount > 0 && (
          <span className="text-xs text-gray-500">
            Totale: {totalWordCount} parole
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
              <p className="text-sm text-gray-700 mb-3">{q.question}</p>
              
              {/* TEXTAREA per risposta testuale */}
              <div className="space-y-2">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Descrivi il tuo approccio in dettaglio..."
                  value={answers[q.dimension] || ''}
                  onChange={(e) => handleTextChange(q.dimension, e.target.value)}
                />
                
                {/* Contatore parole */}
                <div className="flex justify-between items-center text-xs">
                  <span className={`${
                    isValid ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {wordCount} parole
                    {isValid && ' ✓'}
                  </span>
                  <span className="text-gray-400">
                    Minimo 20 parole
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
        Genera Scoring Calibrato
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparazione custom: evita re-render se questions e onComplete non cambiano
  return (
    JSON.stringify(prevProps.questions) === JSON.stringify(nextProps.questions) &&
    prevProps.onComplete === nextProps.onComplete
  );
});

export default ValidationQuestions;