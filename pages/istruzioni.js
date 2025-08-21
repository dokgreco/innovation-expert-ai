import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { 
  Brain, Database, Target, Rocket, BarChart3, CheckCircle,
  ArrowLeft, Users, Zap, FileText, Award, MessageCircle
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

          {/* Alpha Testing Guide */}
          <section className="bg-orange-50 rounded-lg border border-orange-200 p-6">
            <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
              <MessageCircle className="text-orange-600" size={24} />
              {router.locale === 'en' ? 'Alpha Testing Guide' : 'Guida Alpha Testing'}
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