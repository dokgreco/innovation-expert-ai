Il **README del progetto** è il file `README.md` che si trova nella cartella principale del tuo repository `innovation-expert-ai`.

## COME TROVARLO:

In VS Code:
1. Nella barra laterale sinistra (Explorer)
2. Cerca il file `README.md` nella root del progetto (stesso livello di `package.json`)

## COME AGGIORNARLO:

Attualmente il tuo README.md contiene solo:
```markdown
# innovation-expert-ai
Innovation Expert AI Chatbot with Notion Integration
```

**SOSTITUISCILO COMPLETAMENTE** con questo contenuto aggiornato:

```markdown
# Innovation Expert AI

Innovation Expert AI - Sistema di consulenza digitale per valutazione startup e progetti innovativi attraverso metodologia proprietaria basata su 200+ case histories.

## 🚀 Features

- **Metodologia Proprietaria 3-Step**: Identificazione verticali → Matching case histories → Pattern convergence
- **Notion Integration**: Estrazione completa da 3 database strutturati (15-37 properties per item)
- **Claude AI Analysis**: Analisi strutturata con framework settoriale specifico
- **Validated Scoring**: Sistema bi-fasico con validation questions e scoring calibrato
- **4-Step User Flow**: Input → Analysis → Validation → Scoring

## 📋 Stato del Progetto

- **Sprint 1-3**: ✅ Completati - Sistema base funzionante
- **Sprint 4**: 🚧 In corso - UI/UX alignment con prototipo
  - Task 1.1: ✅ Progress Indicator
  - Task 1.2: ⏳ Sidebar Enhancement
  - Task 1.3-3.2: 📅 Pianificati

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Notion API (3 databases)
- **AI**: Claude Sonnet 4 API
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Notion and Anthropic API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🔧 Environment Variables

```
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_1=database_id_1
NOTION_DATABASE_2=database_id_2
NOTION_DATABASE_3=database_id_3
ANTHROPIC_API_KEY=your_anthropic_key
```

## 📁 Project Structure

```
innovation-expert-ai/
├── pages/
│   ├── api/
│   │   ├── notion-query.js      # Notion semantic matching
│   │   ├── claude-analysis.js   # Claude AI integration
│   │   └── generate-scoring.js  # Scoring calibration
│   └── index.js                 # Main UI
├── components/
│   ├── StructuredAnalysisDisplay.js
│   └── ValidationQuestions.js
└── styles/
    └── globals.css
```

## 🔄 User Flow

1. **Input** - Descrizione startup/progetto
2. **Analysis** - Query Notion + Claude processing
3. **Validation** - 6 domande per calibrazione
4. **Scoring** - Risultati multi-dimensionali

## 📊 Metodologia

Sistema 3-step proprietario:
- **Step 1**: Identificazione verticali strategiche (DB1)
- **Step 2**: Matching case histories rilevanti (DB2+DB3)
- **Step 3**: Convergenza pattern e framework output

## 🚀 Deployment

Automatico su Vercel:
- Push su `main` → Production
- Push su `feature/*` → Preview

## 📝 License

Proprietario - Tutti i diritti riservati