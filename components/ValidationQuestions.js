import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ValidationQuestions({ questions, onComplete }) {
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

  const handleTextChange = (dimension, value) => {
    // Aggiorna la risposta
    setAnswers({
      ...answers,
      [dimension]: value
    });
    
    // Calcola il numero di parole
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    setWordCounts({
      ...wordCounts,
      [dimension]: wordCount
    });

    // Rimuovi errore se esiste
    if (errors[dimension] && wordCount >= 20) {
      setErrors({
        ...errors,
        [dimension]: false
      });
    }
  };

  const handleSubmit = () => {
    // Valida che tutte le risposte abbiano almeno 20 parole
    const newErrors = {};
    questions.forEach(q => {
      const answer = answers[q.dimension] || '';
      const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
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
  };

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
      <p className="text-sm text-indigo-600 mb-6">
        💡 Risposte dettagliate (minimo 20 parole) generano scoring più accurati
      </p>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div 
            key={idx} 
            className={`border rounded-lg p-4 ${
              errors[q.dimension] ? 'border-red-300 bg-red-50' : 'border-gray-200'
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
                  (wordCounts[q.dimension] || 0) >= 20 
                    ? 'text-green-600 font-medium' 
                    : 'text-gray-500'
                }`}>
                  {wordCounts[q.dimension] || 0} parole
                  {(wordCounts[q.dimension] || 0) >= 20 && ' ✓'}
                </span>
                <span className="text-gray-400">
                  Minimo 20 parole
                </span>
              </div>
            </div>
            
            {errors[q.dimension] && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors[q.dimension]}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
      >
        <CheckCircle className="mr-2" size={16} />
        Genera Scoring Calibrato
      </button>
    </div>
  );
}