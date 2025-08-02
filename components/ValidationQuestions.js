import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ValidationQuestions({ questions, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  const handleAnswerChange = (dimension, value) => {
    setAnswers({
      ...answers,
      [dimension]: value
    });
    // Clear error for this dimension
    if (errors[dimension]) {
      setErrors({
        ...errors,
        [dimension]: false
      });
    }
  };

  const handleSubmit = () => {
    // Validate all questions answered
    const newErrors = {};
    questions.forEach(q => {
      if (!answers[q.dimension]) {
        newErrors[q.dimension] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete(answers);
  };

  // Se non ci sono domande, non mostrare nulla
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Validazione per Assessment Calibrato
      </h2>
      <p className="text-gray-600 mb-6">
        Conferma questi insight strategici per generare uno scoring accurato:
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
            
            <div className="space-y-2">
              {q.options.map((option, oidx) => (
                <label key={oidx} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={option}
                    onChange={() => handleAnswerChange(q.dimension, option)}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            
            {errors[q.dimension] && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                Questa domanda è obbligatoria
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