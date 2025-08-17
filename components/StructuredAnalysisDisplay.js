import React, { memo } from 'react';
import { FileText, Target, Rocket, BarChart3, CheckCircle } from 'lucide-react';

// Helper function per formattare il testo (spostata fuori per evitare ricreazioni)
function formatSection(text) {
  if (!text) return '';
  
  // Converti markdown base in HTML
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/\n/g, '<br />') // line breaks
    .replace(/- /g, '• '); // bullet points
}

// Componente ottimizzato con React.memo
const AnalysisDisplay = memo(function AnalysisDisplay({ data }) {
  if (!data || !data.parsedSections) return null;

  const sections = data.parsedSections;

  return (
    <div className="space-y-6">
      {/* Vertical Section */}
      {sections.vertical && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
            <Target className="mr-2 text-indigo-600" size={20} />
            🎯 Verticale Strategica Principale
          </h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: formatSection(sections.vertical) }} />
          </div>
        </div>
      )}

      {/* Patterns Section */}
      {sections.patterns && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
            <FileText className="mr-2 text-purple-600" size={20} />
            🔄 Pattern Strategici Convergenti
          </h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: formatSection(sections.patterns) }} />
          </div>
        </div>
      )}

      {/* Case Studies Section */}
      {sections.cases && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
            <Rocket className="mr-2 text-green-600" size={20} />
            📚 Case Studies di Riferimento
          </h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: formatSection(sections.cases) }} />
          </div>
        </div>
      )}

      {/* Roadmap Section */}
      {sections.roadmap && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
            <BarChart3 className="mr-2 text-blue-600" size={20} />
            🚀 Roadmap Operativa
          </h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: formatSection(sections.roadmap) }} />
          </div>
        </div>
      )}

      {/* Success Metrics Section */}
      {sections.metrics && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
            <CheckCircle className="mr-2 text-indigo-600" size={20} />
            📊 Success Metrics & KPIs
          </h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: formatSection(sections.metrics) }} />
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparazione personalizzata: evita re-render se i dati sono gli stessi
  if (!prevProps.data && !nextProps.data) return true;
  if (!prevProps.data || !nextProps.data) return false;
  
  // Confronta solo parsedSections che è quello che usiamo
  return JSON.stringify(prevProps.data.parsedSections) === JSON.stringify(nextProps.data.parsedSections);
});

// Export del componente memoizzato
export default AnalysisDisplay;