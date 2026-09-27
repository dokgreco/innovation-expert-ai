// 🤖 CLAUDE CONFIG - Modello Claude usato da tutte le API
// (claude-analysis, generate-scoring, claude-section-qa).
//
// Per cambiare modello senza toccare il codice: impostare CLAUDE_MODEL nelle
// Environment Variables di Vercel e rifare il deploy (Redeploy).
// Se la variabile non è impostata si usa il default qui sotto.
//
// ⚠️ Le API inviano thinking: { type: "disabled" }: accettato da claude-sonnet-5,
// claude-sonnet-4-6, claude-opus-5 e claude-haiku-4-5, ma rifiutato (errore 400)
// da claude-opus-5-5 e claude-fable-5-1.

const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-5';

const CLAUDE_MODEL = (process.env.CLAUDE_MODEL || '').trim() || DEFAULT_CLAUDE_MODEL;

module.exports = { CLAUDE_MODEL };
