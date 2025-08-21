import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ArrowLeft, Shield, Database, Lock, Eye } from 'lucide-react';

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

          {/* Third Parties */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-purple-600" size={20} />
              <h3 className="text-xl font-semibold text-gray-900">{t('thirdParties.title')}</h3>
            </div>
            <p className="text-gray-700 mb-4">{t('thirdParties.description')}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">{t('thirdParties.anthropic.title')}</h4>
              <p className="text-blue-700 text-sm">{t('thirdParties.anthropic.description')}</p>
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