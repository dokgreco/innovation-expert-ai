import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ArrowLeft, Shield, Database, Lock, Eye, CheckCircle, BarChart3, Users } from 'lucide-react';

export default function Privacy() {
  const { t } = useTranslation('privacy');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">{t('backToApp')}</span>
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Alpha Testing Context */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🧪</span>
              <h3 className="font-semibold text-orange-900">
                {t('alphaTesting.title')}
              </h3>
            </div>
            <p className="text-orange-800 mb-3">
              {t('alphaTesting.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-3 rounded border border-orange-200">
                <span className="text-green-600">✅</span>
                <span className="ml-2">
                  {t('alphaTesting.fullyOperational')}
                </span>
              </div>
              <div className="bg-white p-3 rounded border border-orange-200">
                <span className="text-green-600">✅</span>
                <span className="ml-2">
                  {t('alphaTesting.secureProcessing')}
                </span>
              </div>
              <div className="bg-white p-3 rounded border border-orange-200">
                <span className="text-blue-600">📊</span>
                <span className="ml-2">
                  {t('alphaTesting.feedbackCollection')}
                </span>
              </div>
            </div>
            <a 
              href="/istruzioni" 
              className="inline-block mt-3 text-orange-600 hover:text-orange-800 underline text-sm"
            >
              {t('alphaTestingGuide')}
            </a>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('introduction.title')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('introduction.description')}
            </p>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="text-green-600" size={16} />
                <span className="font-semibold text-green-800">{t('introduction.keyPoint')}</span>
              </div>
              <p className="text-green-700 text-sm">
                {t('introduction.noDataCollection')}
              </p>
            </div>
          </div>

          {/* Data Processing */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-600" size={20} />
              <h3 className="text-xl font-semibold text-gray-900">{t('dataProcessing.title')}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">{t('dataProcessing.inputData.title')}</h4>
                <p className="text-gray-700">{t('dataProcessing.inputData.description')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">{t('dataProcessing.analysis.title')}</h4>
                <p className="text-gray-700">{t('dataProcessing.analysis.description')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">{t('dataProcessing.storage.title')}</h4>
                <p className="text-gray-700">{t('dataProcessing.storage.description')}</p>
              </div>
            </div>
          </section>

          {/* Case History Data Source Clarity */}
          <div className="privacy-section mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">
                {t('dataTransparency.title')}
              </h2>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="font-semibold mb-2 text-blue-900">
                {t('dataTransparency.description')}
              </p>
              <p className="text-blue-800">
                {t('dataTransparency.proprietaryMethodology')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  {t('dataSourcesUsed.whatWeUse')}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>
                        {t('dataSourcesUsed.verifiedSources')}
                      </strong>{' '}
                      {t('dataSourcesUsed.verifiedSourcesDesc')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>
                        {t('dataSourcesUsed.anonymizedInfo')}
                      </strong>{' '}
                      {t('dataSourcesUsed.anonymizedInfoDesc')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>
                        {t('dataSourcesUsed.sectorialPractices')}
                      </strong>{' '}
                      {t('dataSourcesUsed.sectorialPracticesDesc')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>
                      <strong>
                        {t('dataSourcesUsed.benchmarkMetrics')}
                      </strong>{' '}
                      {t('dataSourcesUsed.benchmarkMetricsDesc')}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  {t('dataSourcesNeverUsed.whatWeNeverUse')}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✕</span>
                    <span>
                      {t('dataSourcesNeverUsed.confidentialInfo')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✕</span>
                    <span>
                      {t('dataSourcesNeverUsed.sensitiveData')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✕</span>
                    <span>
                      {t('dataSourcesNeverUsed.personalInfo')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✕</span>
                    <span>
                      {t('dataSourcesNeverUsed.tradeSecrets')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Third Parties */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-purple-600" size={20} />
              <h3 className="text-xl font-semibold text-gray-900">{t('thirdParties.title')}</h3>
            </div>
            <p className="text-gray-700 mb-4">{t('thirdParties.description')}</p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">{t('thirdParties.anthropic.title')}</h4>
                <p className="text-blue-700 text-sm">{t('thirdParties.anthropic.description')}</p>
              </div>
              
              {/* Enhanced Vercel Analytics Transparency */}
              <div className="privacy-section mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="text-purple-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('vercelAnalytics.title')}
                  </h2>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    📊 {t('vercelAnalytics.useOfVercel')}
                  </h3>
                  <p className="text-purple-800 text-sm mb-3">
                    {t('vercelAnalytics.useDescription')}
                  </p>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• <strong>
                      {t('vercelAnalytics.performanceMonitoringDetailed')}
                    </strong> {t('vercelAnalytics.performanceDesc')}</li>
                    <li>• <strong>
                      {t('vercelAnalytics.errorTrackingDetailed')}
                    </strong> {t('vercelAnalytics.errorDesc')}</li>
                    <li>• <strong>
                      {t('vercelAnalytics.usagePatternsDetailed')}
                    </strong> {t('vercelAnalytics.usageDesc')}</li>
                    <li>• <strong>
                      {t('vercelAnalytics.alphaTestingInsights')}
                    </strong> {t('vercelAnalytics.alphaDesc')}</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p className="mb-2"><strong>🔒 {t('vercelAnalytics.privacyGuarantee')}</strong></p>
                  <p className="text-gray-700">
                    {t('vercelAnalytics.gdprCompliant')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('userRights.title')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{t('userRights.noPersonalData')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{t('userRights.sessionBased')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{t('userRights.transparency')}</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('contact.title')}</h3>
            <p className="text-gray-700">{t('contact.description')}</p>
          </section>

          {/* Updates */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('updates.title')}</h3>
            <p className="text-gray-700 mb-2">{t('updates.description')}</p>
            <p className="text-sm text-gray-500">{t('updates.lastUpdated')}</p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 mb-2">
            Innovation Expert AI - Metodologia proprietaria su basi conoscenza curate
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Copyright © Greco Technologies&Arts - All Rights Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['privacy'])),
    },
  };
}