import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { 
  Brain, Database, Target, Rocket, BarChart3, CheckCircle,
  ArrowLeft, Users, Zap, FileText, Award, MessageCircle, Lock, Eye, Shield
} from 'lucide-react';

export default function Istruzioni() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{t('instructions.backToApp')}</span>
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('instructions.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('instructions.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Assurance Box */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Lock className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  🛡️ {router.locale === 'en' ? 'Your Privacy is Guaranteed' : 'La Tua Privacy è Garantita'}
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  {router.locale === 'en' 
                    ? 'We never save your data. Analysis based only on public and anonymized sources.'
                    : 'Non salviamo mai i tuoi dati. Analisi basate solo su fonti pubbliche e anonimizzate.'
                  }
                </p>
              </div>
            </div>
            <a href="/privacy" className="text-green-600 hover:text-green-800 underline text-sm font-medium whitespace-nowrap">
              {router.locale === 'en' ? 'Complete information →' : 'Informativa completa →'}
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Metodologia Proprietaria */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="text-indigo-600" size={24} />
              {t('instructions.methodology.title')}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                {t('instructions.methodology.description')}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t('instructions.methodology.features', { returnObjects: true }).map((feature, idx) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Come Funziona */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Rocket className="text-indigo-600" size={24} />
              {t('instructions.howItWorks.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {t('instructions.howItWorks.steps', { returnObjects: true }).slice(0, 2).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {t('instructions.howItWorks.steps', { returnObjects: true }).slice(2, 4).map((step, idx) => (
                  <div key={idx + 2} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{idx + 3}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Deep Dive Analysis */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="text-indigo-600" size={24} />
              {t('instructions.deepDiveSections.title')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('instructions.deepDiveSections.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Jobs-to-be-Done & Trends</h3>
                </div>
                <p className="text-sm text-gray-600">{t('instructions.deepDiveSections.jtbd')}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Competitive Canvas</h3>
                </div>
                <p className="text-sm text-gray-600">{t('instructions.deepDiveSections.competitive')}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket size={16} className="text-green-600" />
                  <h3 className="font-semibold text-gray-900">Tech Validation</h3>
                </div>
                <p className="text-sm text-gray-600">{t('instructions.deepDiveSections.tech')}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Process & Metrics</h3>
                </div>
                <p className="text-sm text-gray-600">{t('instructions.deepDiveSections.metrics')}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Partnership</h3>
                </div>
                <p className="text-sm text-gray-600">{t('instructions.deepDiveSections.partnership')}</p>
              </div>
            </div>
          </section>

          {/* Quick Prompts */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="text-indigo-600" size={24} />
              {t('instructions.quickPrompts.title')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('instructions.quickPrompts.description')}
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-1">{router.locale === 'en' ? 'Startup Evaluation' : 'Valutazione Startup'}</h4>
                <p className="text-sm text-gray-600">"{t('instructions.quickPrompts.startup')}"</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-1">{router.locale === 'en' ? 'Market Analysis' : 'Analisi di Mercato'}</h4>
                <p className="text-sm text-gray-600">"{t('instructions.quickPrompts.market')}"</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-1">Best Practices</h4>
                <p className="text-sm text-gray-600">"{t('instructions.quickPrompts.practices')}"</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-1">{router.locale === 'en' ? 'Case Study Comparison' : 'Confronto Case Studies'}</h4>
                <p className="text-sm text-gray-600">"{t('instructions.quickPrompts.compare')}"</p>
              </div>
            </div>
          </section>

          {/* Database Info */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="text-indigo-600" size={24} />
              {t('instructions.database.title')}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                {t('instructions.database.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('instructions.database.types')}</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Startup unicorno e scale-up di successo</li>
                    <li>• Innovazioni corporate e intrapreneurship</li>
                    <li>• Pivot strategici e trasformazioni digitali</li>
                    <li>• Casi di fallimento e lezioni apprese</li>
                    <li>• Breakthrough tecnologici settoriali</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('instructions.database.sectors')}</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• FinTech, InsurTech, RegTech</li>
                    <li>• HealthTech, MedTech, BioTech</li>
                    <li>• IoT, Industry 4.0, Smart Cities</li>
                    <li>• E-commerce, Retail, MarTech</li>
                    <li>• CleanTech, Energy, Sustainability</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Source Transparency Section */}
          <div className="methodology-section mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">
                📊 {router.locale === 'en' ? 'Transparency on Our Data' : 'Trasparenza sui Nostri Dati'}
              </h2>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="font-bold mb-4 text-gray-900">
                {router.locale === 'en' ? 'The Proprietary Database (200+ Case Histories)' : 'Il Database Proprietario (200+ Case Histories)'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    🔍 {router.locale === 'en' ? 'What It Contains:' : 'Cosa Contiene:'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• {router.locale === 'en' ? 'Best practices from official press releases' : 'Best practices da comunicati stampa ufficiali'}</li>
                    <li>• {router.locale === 'en' ? 'Success patterns from public company reports' : 'Pattern di successo da report pubblici aziendali'}</li>
                    <li>• {router.locale === 'en' ? 'Aggregate benchmark metrics by sector' : 'Metriche benchmark aggregate per settore'}</li>
                    <li>• {router.locale === 'en' ? 'Methodological frameworks from specialized literature' : 'Framework metodologici da letteratura specializzata'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    🛡️ {router.locale === 'en' ? 'Collection Principles:' : 'Principi di Raccolta:'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <span className="text-green-600">✓</span> {router.locale === 'en' ? 'Only verified public sources' : 'Solo fonti pubbliche verificate'}</li>
                    <li>• <span className="text-green-600">✓</span> {router.locale === 'en' ? 'Total data anonymization' : 'Anonimizzazione totale dei dati'}</li>
                    <li>• <span className="text-green-600">✓</span> {router.locale === 'en' ? 'Zero sensitive information' : 'Zero informazioni sensibili'}</li>
                    <li>• <span className="text-green-600">✓</span> {router.locale === 'en' ? 'Full GDPR compliance' : 'Piena conformità GDPR'}</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🎯 {router.locale === 'en' ? 'How We Protect Privacy and IP' : 'Come Proteggiamo Privacy e IP'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="bg-blue-100 p-2 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                      <Eye size={20} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">
                      {router.locale === 'en' ? 'Only Public Data' : 'Solo Dati Pubblici'}
                    </span>
                    <p className="text-gray-600 mt-1">
                      {router.locale === 'en' ? 'Never confidential or proprietary information' : 'Mai informazioni riservate o confidenziali'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-2 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                      <Shield size={20} className="text-green-600" />
                    </div>
                    <span className="font-medium text-gray-800">
                      {router.locale === 'en' ? 'Total Anonymity' : 'Anonimato Totale'}
                    </span>
                    <p className="text-gray-600 mt-1">
                      {router.locale === 'en' ? 'No identifying reference maintained' : 'Nessun riferimento identificativo mantenuto'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-2 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                      <Lock size={20} className="text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-800">
                      {router.locale === 'en' ? 'IP Protection' : 'IP Protection'}
                    </span>
                    <p className="text-gray-600 mt-1">
                      {router.locale === 'en' ? 'Complete respect for intellectual property' : 'Rispetto completo della proprietà intellettuale'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Alpha Testing Guide */}
          <div className="methodology-section mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-orange-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">
                🧪 {router.locale === 'en' ? 'Alpha Testing Phase - Your Experience' : 'Alpha Testing Phase - La Tua Esperienza'}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3">
                  ✅ {router.locale === 'en' ? '100% Operational System' : 'Sistema Completamente Operativo'}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>
                    {router.locale === 'en' ? '3-step methodology' : 'Metodologia 3-step'}
                  </strong> {router.locale === 'en' ? '100% functional' : 'funzionante al 100%'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? '200+ case histories' : '200+ case histories'}
                  </strong> {router.locale === 'en' ? 'from verified public sources' : 'da fonti pubbliche verificate'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? 'Advanced scoring' : 'Scoring avanzato'}
                  </strong> {router.locale === 'en' ? 'with validation questions' : 'con validation questions'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? 'Bilingual support' : 'Supporto bilingue'}
                  </strong> {router.locale === 'en' ? 'IT/EN complete' : 'IT/EN completo'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? 'Optimized performance:' : 'Performance ottimizzate:'}
                  </strong> {router.locale === 'en' ? '19s first query, 2s cached' : '19s prima query, 2s cached'}</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">
                  📊 {router.locale === 'en' ? 'How We\'re Improving' : 'Come Stiamo Migliorando'}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>
                    {router.locale === 'en' ? 'User feedback:' : 'User feedback:'}
                  </strong> {router.locale === 'en' ? 'gathering suggestions for UX' : 'raccogliamo suggerimenti per UX'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? 'Performance monitoring:' : 'Performance monitoring:'}
                  </strong> {router.locale === 'en' ? 'optimal response times' : 'tempi di risposta ottimali'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? 'Content quality:' : 'Content quality:'}
                  </strong> {router.locale === 'en' ? 'continuous analysis improvement' : 'miglioramento continuo analisi'}</li>
                  <li>• <strong>
                    {router.locale === 'en' ? 'Feature enhancement:' : 'Feature enhancement:'}
                  </strong> {router.locale === 'en' ? 'new functionalities based on usage' : 'nuove funzionalità basate su usage'}</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">
                🎯 {router.locale === 'en' ? 'Your Contribution as Alpha Tester' : 'Il Tuo Contributo Come Alpha Tester'}
              </h3>
              <p className="text-orange-800 text-sm mb-3">
                {router.locale === 'en' 
                  ? 'Your experience helps us perfect the system. Here\'s how you contribute:'
                  : 'La tua esperienza ci aiuta a perfezionare il sistema. Ecco come contribuisci:'
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-3 rounded border border-orange-200">
                  <span className="font-medium text-orange-900">
                    📝 {router.locale === 'en' ? 'Usage Patterns' : 'Usage Patterns'}
                  </span>
                  <p className="text-orange-700 mt-1">
                    {router.locale === 'en' 
                      ? 'Your usage patterns (anonymous) guide us in improvements'
                      : 'I tuoi pattern di utilizzo (anonimi) ci guidano nei miglioramenti'
                    }
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <span className="font-medium text-orange-900">
                    ⚡ {router.locale === 'en' ? 'Performance Feedback' : 'Performance Feedback'}
                  </span>
                  <p className="text-orange-700 mt-1">
                    {router.locale === 'en' 
                      ? 'We monitor response times for optimizations'
                      : 'Monitoriamo tempi di risposta per ottimizzazioni'
                    }
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <span className="font-medium text-orange-900">
                    🎯 {router.locale === 'en' ? 'Feature Validation' : 'Feature Validation'}
                  </span>
                  <p className="text-orange-700 mt-1">
                    {router.locale === 'en' 
                      ? 'Your engagement validates the effectiveness of features'
                      : 'Il tuo engagement valida l\'efficacia delle funzionalità'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Original Alpha Testing Guide for Known Issues */}
          <section className="bg-orange-50 rounded-lg border border-orange-200 p-6">
            <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
              <MessageCircle className="text-orange-600" size={24} />
              {router.locale === 'en' ? 'Known Issues & Testing Flow' : 'Problemi Noti & Flusso di Test'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What's Working */}
              <div>
                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  {router.locale === 'en' ? 'What\'s Working' : 'Funzionalità Operative'}
                </h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✅ {router.locale === 'en' ? 'Query & Analysis with 300+ case histories' : 'Query & Analysis con 300+ case histories'}</li>
                  <li>✅ {router.locale === 'en' ? 'Validation and scoring system' : 'Sistema validazione e scoring'}</li>
                  <li>✅ {router.locale === 'en' ? 'Iterative re-scoring (max 3 times)' : 'Re-scoring iterativo (max 3 volte)'}</li>
                  <li>✅ {router.locale === 'en' ? 'Interactive Deep Dive sections' : 'Sezioni Deep Dive interattive'}</li>
                  <li>✅ {router.locale === 'en' ? 'Multilingual support IT/EN' : 'Supporto multilingue IT/EN'}</li>
                </ul>
              </div>
              
              {/* Known Issues */}
              <div>
                <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="text-orange-600" size={16} />
                  {router.locale === 'en' ? 'Known Issues & Solutions' : 'Problemi Noti & Soluzioni'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded p-3 border border-orange-200">
                    <h4 className="font-medium text-gray-900">
                      {router.locale === 'en' ? 'Validation Text Areas' : 'Area Testo Validazione'}
                    </h4>
                    <p className="text-gray-600 text-xs mt-1">
                      {router.locale === 'en' 
                        ? 'If word counter freezes: ' 
                        : 'Se il contatore parole si blocca: '
                      }
                      <strong>
                        {router.locale === 'en' ? 'refresh page 1-2 times' : 'ricarica la pagina 1-2 volte'}
                      </strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3 border border-orange-200">
                    <h4 className="font-medium text-gray-900">Claude API Overload (529)</h4>
                    <p className="text-gray-600 text-xs mt-1">
                      {router.locale === 'en' 
                        ? 'Service temporarily unavailable: ' 
                        : 'Servizio temporaneamente non disponibile: '
                      }
                      <strong>
                        {router.locale === 'en' ? 'wait 5-10 minutes' : 'attendi 5-10 minuti'}
                      </strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3 border border-orange-200">
                    <h4 className="font-medium text-gray-900">
                      {router.locale === 'en' ? 'Loading Times' : 'Tempi di Caricamento'}
                    </h4>
                    <p className="text-gray-600 text-xs mt-1">Query: ~5-15s • Analysis: ~10-30s • Scoring: ~15-45s</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testing Flow */}
            <div className="mt-6 bg-white rounded-lg p-4 border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-3">
                {router.locale === 'en' ? '🎯 Testing Flow' : '🎯 Flusso di Test'}
              </h3>
              <ol className="space-y-1 text-sm text-gray-700">
                <li>1. <strong>{router.locale === 'en' ? 'Submit detailed project description' : 'Invia descrizione dettagliata'}</strong> {router.locale === 'en' ? '' : 'del progetto'}</li>
                <li>2. <strong>{router.locale === 'en' ? 'If validation doesn\'t work' : 'Se validazione non funziona'}</strong>: {router.locale === 'en' ? 'refresh page' : 'ricarica pagina'}</li>
                <li>3. <strong>{router.locale === 'en' ? 'Fill all 5 dimensions' : 'Compila tutte le 5 dimensioni'}</strong> ({router.locale === 'en' ? 'min 20 words each' : 'min 20 parole ciascuna'})</li>
                <li>4. <strong>{router.locale === 'en' ? 'Generate scoring' : 'Genera scoring'}</strong> {router.locale === 'en' ? 'and test re-scoring' : 'e testa re-scoring'}</li>
                <li>5. <strong>{router.locale === 'en' ? 'Try Deep Dive sections' : 'Prova le sezioni Deep Dive'}</strong></li>
              </ol>
            </div>

            {/* Pro Tips */}
            <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">
                💡 {router.locale === 'en' ? 'Pro Tips' : 'Suggerimenti Pro'}
              </h4>
              <ul className="space-y-1 text-xs text-indigo-800">
                <li>• {router.locale === 'en' ? 'Write detailed responses (30-50 words per dimension)' : 'Scrivi risposte dettagliate (30-50 parole per dimensione)'}</li>
                <li>• {router.locale === 'en' ? 'Use specific examples in validation answers' : 'Usa esempi specifici nelle risposte di validazione'}</li>
                <li>• {router.locale === 'en' ? 'Be patient with API response times' : 'Sii paziente con i tempi di risposta API'}</li>
                <li>• {router.locale === 'en' ? 'For issues: description, steps, browser, timestamp' : 'Per problemi: descrizione, passi, browser, timestamp'}</li>
              </ul>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Award className="text-indigo-600" size={24} />
              {t('instructions.tips.title')}
            </h2>
            <div className="space-y-3">
              {t('instructions.tips.items', { returnObjects: true }).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-gray-700"><strong>{tip.title}:</strong> {tip.description}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 mb-4">
            {t('instructions.footer')}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-2">
            <span>{t('instructions.copyright')}</span>
            <span>•</span>
            <button 
              onClick={() => router.push('/privacy')}
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              {t('instructions.privacyLink')}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {t('instructions.alphaNote')}
          </p>
        </div>
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