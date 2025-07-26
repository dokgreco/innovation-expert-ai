// ============= FILE 1: utils/translations.js =============
// Sovrascrivi completamente utils/translations.js con questo:

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export const translations = {
  en: {
    // Header & Navigation
    header: {
      title: 'Innovation Expert',
      subtitle: '200+ Case Studies',
      save: 'Save',
      databases: 'Notion Databases'
    },
    
    // Quick Prompts
    quickPrompts: {
      title: 'Quick Start',
      evalStartup: 'Evaluate Startup',
      marketAnalysis: 'Market Analysis',
      bestPractices: 'Best Practices',
      compareCases: 'Compare Cases'
    },
    
    // Input & Status
    input: {
      placeholder: 'Describe your startup or innovative project for evaluation...',
      quickTip: '💡 Use Quick Prompts in the sidebar or describe your project for a complete evaluation'
    },
    
    status: {
      analyzingNotion: 'Analyzing Notion databases...',
      processingAnalysis: 'Processing innovation analysis...',
      databasesAnalyzed: 'DB analyzed'
    },
    
    // Welcome Message
    welcome: {
      message: 'Hello! I\'m your Innovation Expert AI. I have access to Notion databases with over 200 case histories and best practices to evaluate startups and innovative projects. Use the quick prompts to get started or ask me a specific question.'
    },
    
    // Dialogs
    dialogs: {
      saveTitle: 'Save Conversation',
      titlePlaceholder: 'Conversation title...',
      cancel: 'Cancel',
      save: 'Save'
    }
  },

  it: {
    // Header & Navigation
    header: {
      title: 'Innovation Expert',
      subtitle: '200+ Case Studies',
      save: 'Salva',
      databases: 'Database Notion'
    },
    
    // Quick Prompts
    quickPrompts: {
      title: 'Quick Start',
      evalStartup: 'Valuta startup',
      marketAnalysis: 'Analisi mercato',
      bestPractices: 'Best practices',
      compareCases: 'Confronta casi'
    },
    
    // Input & Status
    input: {
      placeholder: 'Descrivi la tua startup o progetto innovativo per la valutazione...',
      quickTip: '💡 Usa i Quick Prompts nella sidebar o descrivi il tuo progetto per una valutazione completa'
    },
    
    status: {
      analyzingNotion: 'Analizzo i database Notion...',
      processingAnalysis: 'Elaboro l\'analisi di innovazione...',
      databasesAnalyzed: 'DB analizzati'
    },
    
    // Welcome Message
    welcome: {
      message: 'Ciao! Sono il tuo Innovation Expert AI. Ho accesso ai database Notion con oltre 200 case histories e best practices per valutare startup e progetti innovativi. Usa i quick prompts per iniziare o fammi una domanda specifica.'
    },
    
    // Dialogs
    dialogs: {
      saveTitle: 'Salva Conversazione',
      titlePlaceholder: 'Titolo della conversazione...',
      cancel: 'Annulla',
      save: 'Salva'
    }
  },

  es: {
    // Header & Navigation
    header: {
      title: 'Innovation Expert',
      subtitle: '200+ Casos de Estudio',
      save: 'Guardar',
      databases: 'Bases de Datos Notion'
    },
    
    // Quick Prompts
    quickPrompts: {
      title: 'Inicio Rápido',
      evalStartup: 'Evaluar Startup',
      marketAnalysis: 'Análisis de Mercado',
      bestPractices: 'Mejores Prácticas',
      compareCases: 'Comparar Casos'
    },
    
    // Input & Status
    input: {
      placeholder: 'Describe tu startup o proyecto innovador para la evaluación...',
      quickTip: '💡 Usa los Quick Prompts en la barra lateral o describe tu proyecto para una evaluación completa'
    },
    
    status: {
      analyzingNotion: 'Analizando bases de datos Notion...',
      processingAnalysis: 'Procesando análisis de innovación...',
      databasesAnalyzed: 'BD analizadas'
    },
    
    // Welcome Message
    welcome: {
      message: '¡Hola! Soy tu Innovation Expert AI. Tengo acceso a bases de datos Notion con más de 200 casos de estudio y mejores prácticas para evaluar startups y proyectos innovadores. Usa los quick prompts para comenzar o hazme una pregunta específica.'
    },
    
    // Dialogs
    dialogs: {
      saveTitle: 'Guardar Conversación',
      titlePlaceholder: 'Título de la conversación...',
      cancel: 'Cancelar',
      save: 'Guardar'
    }
  },

  fr: {
    // Header & Navigation
    header: {
      title: 'Innovation Expert',
      subtitle: '200+ Études de Cas',
      save: 'Sauvegarder',
      databases: 'Bases de Données Notion'
    },
    
    // Quick Prompts
    quickPrompts: {
      title: 'Démarrage Rapide',
      evalStartup: 'Évaluer Startup',
      marketAnalysis: 'Analyse de Marché',
      bestPractices: 'Meilleures Pratiques',
      compareCases: 'Comparer Cas'
    },
    
    // Input & Status
    input: {
      placeholder: 'Décrivez votre startup ou projet innovant pour l\'évaluation...',
      quickTip: '💡 Utilisez les Quick Prompts dans la barre latérale ou décrivez votre projet pour une évaluation complète'
    },
    
    status: {
      analyzingNotion: 'Analyse des bases de données Notion...',
      processingAnalysis: 'Traitement de l\'analyse d\'innovation...',
      databasesAnalyzed: 'BD analysées'
    },
    
    // Welcome Message
    welcome: {
      message: 'Bonjour! Je suis votre Innovation Expert AI. J\'ai accès aux bases de données Notion avec plus de 200 études de cas et meilleures pratiques pour évaluer les startups et projets innovants. Utilisez les quick prompts pour commencer ou posez-moi une question spécifique.'
    },
    
    // Dialogs
    dialogs: {
      saveTitle: 'Sauvegarder Conversation',
      titlePlaceholder: 'Titre de la conversation...',
      cancel: 'Annuler',
      save: 'Sauvegarder'
    }
  }
};

// Hook personalizzato per le traduzioni
export const useTranslation = (language) => {
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language] || translations.it;
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    return value || key;
  };

  return { t };
};

// Quick Prompts localizzati
export const getLocalizedPrompts = (language) => {
  const { t } = useTranslation(language);
  
  return [
    {
      id: 'eval-startup',
      text: t('quickPrompts.evalStartup'),
      prompt: language === 'it' 
        ? 'Analizza questa idea di startup utilizzando la metodologia di valutazione dell\'innovazione presente nei database Notion. Fornisci un punteggio strutturato e confronta con case histories simili.'
        : language === 'es'
        ? 'Analiza esta idea de startup utilizando la metodología de evaluación de innovación de las bases de datos Notion. Proporciona puntuación estructurada y compara con historiales de casos similares.'
        : language === 'fr' 
        ? 'Analysez cette idée de startup en utilisant la méthodologie d\'évaluation de l\'innovation des bases de données Notion. Fournissez un score structuré et comparez avec des histoires de cas similaires.'
        : 'Analyze this startup idea using the innovation assessment methodology from the Notion databases. Provide structured scoring and compare with similar case histories.',
      icon: '🚀'
    },
    {
      id: 'market-analysis',
      text: t('quickPrompts.marketAnalysis'),
      prompt: language === 'it'
        ? 'Fornisci un\'analisi dettagliata del mercato per questa innovazione, includendo trend, competitors e opportunità basandoti sulle best practices dei database Notion.'
        : language === 'es'
        ? 'Proporciona análisis detallado del mercado para esta innovación, incluyendo tendencias, competidores y oportunidades basado en mejores prácticas de las bases de datos Notion.'
        : language === 'fr'
        ? 'Fournissez une analyse détaillée du marché pour cette innovation, incluant tendances, concurrents et opportunités basée sur les meilleures pratiques des bases de données Notion.'
        : 'Provide detailed market analysis for this innovation, including trends, competitors and opportunities based on best practices from Notion databases.',
      icon: '📊'
    },
    {
      id: 'best-practices',
      text: t('quickPrompts.bestPractices'),
      prompt: language === 'it'
        ? 'Mostrami le best practices più rilevanti per questo settore, estraendo insights dalle case histories disponibili nei database Notion.'
        : language === 'es'
        ? 'Muéstrame las mejores prácticas más relevantes para este sector, extrayendo insights de los historiales de casos disponibles en las bases de datos Notion.'
        : language === 'fr'
        ? 'Montrez-moi les meilleures pratiques les plus pertinentes pour ce secteur, en extrayant des insights des histoires de cas disponibles dans les bases de données Notion.'
        : 'Show me the most relevant best practices for this sector, extracting insights from available case histories in Notion databases.',
      icon: '⭐'
    },
    {
      id: 'compare-cases',
      text: t('quickPrompts.compareCases'),
      prompt: language === 'it'
        ? 'Confronta questo progetto con le case histories più rilevanti nei database Notion, evidenziando similitudini, differenze e lezioni apprese.'
        : language === 'es'
        ? 'Compara este proyecto con los historiales de casos más relevantes en las bases de datos Notion, destacando similitudes, diferencias y lecciones aprendidas.'
        : language === 'fr'
        ? 'Comparez ce projet avec les histoires de cas les plus pertinentes dans les bases de données Notion, en soulignant les similitudes, différences et leçons apprises.'
        : 'Compare this project with the most relevant case histories in Notion databases, highlighting similarities, differences and lessons learned.',
      icon: '🎯'
    }
  ];
};