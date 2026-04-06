// ============================================================
// gemini.ts — Puerto React/TypeScript de galatea.py + run.py
// (FuncionaBien original de Triskeledu)
// ============================================================
//
// LÓGICA ORIGINAL EN PYTHON (galatea.py):
//   1. Robot.__init__() carga el JSON del personaje y llama a
//      chat.send_message(DEFAULT_ASSISTANT_PROMT) para inicializar
//      la personalidad del chat.
//   2. Robot.ask(question, command) antepone el prefijo del comando
//      (ej. USER_CHAT_TEXT_NORMAL) al texto del usuario y llama a
//      chat.send_message(q).text para obtener la respuesta.
//   3. El objeto `chat` mantiene el historial completo de la sesión.
//
// EQUIVALENCIA EN REACT:
//   - El historial se guarda en un array de "turns" (conversationHistory)
//   - En cada llamada a Gemini se envía el historial completo como
//     el campo `contents` del payload (multi-turn conversation)
//   - El DEFAULT_ASSISTANT_PROMT va en `systemInstruction` (equivale
//     al primer send_message de inicialización) — excepto para Marta
//     y Alejandra cuyos prompts YA incluyen la instrucción de rol en
//     el system, como hace la API de Triskeledu originalmente.
//   - Cada personaje (alice/marta/alejandra) tiene su propio
//     historial de sesión independiente, igual que en run.py donde
//     cada `robot_key` es `{character_name}_{language}`.
// ============================================================

import { getSettings } from './settings';

// La URL y API key se leen en cada llamada desde settings (localStorage),
// de modo que cambiarlas en el panel de configuración surte efecto inmediato.
const getApiUrl = () => getSettings().geminiApiUrl;
const getApiKey = () => getSettings().geminiApiKey;
const LANGUAGE = 'es';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type CharacterName = 'alice' | 'marta' | 'alejandra';

// Comandos válidos — equivalentes a valid_commands de run.py
const VALID_COMMANDS = [
    'USER_CHAT_TEXT_VERY_BRIEF',
    'USER_CHAT_TEXT_BRIEF',
    'USER_CHAT_TEXT_NORMAL',
    'USER_CHAT_TEXT_COMPLETE',
    'USER_CHAT_TEXT_VERY_COMPLETE',
] as const;

type ValidCommand = typeof VALID_COMMANDS[number];

// Turn del historial de conversación (multi-turn Gemini API)
interface ChatTurn {
    role: 'user' | 'model';
    parts: [{ text: string }];
}

// Estado por personaje — equivalente al objeto Robot de galatea.py
interface CharacterSession {
    params: Record<string, string>; // parámetros del JSON del personaje
    history: ChatTurn[];            // historial de conversación (chat history)
    initialized: boolean;           // si ya se ejecutó el DEFAULT_ASSISTANT_PROMT
}

// ── Estado del módulo (singleton, equivalente a robots{} de run.py) ───────────

const sessions: Record<CharacterName, CharacterSession | null> = {
    alice: null,
    marta: null,
    alejandra: null,
};

// Cache de configs de personajes ya cargadas
const characterConfigs: Record<string, Record<string, string>> = {};

// ── Carga del character JSON ──────────────────────────────────────────────────

async function loadCharacterConfig(characterName: CharacterName): Promise<Record<string, string>> {
    if (characterConfigs[characterName]) return characterConfigs[characterName];

    // Los JSON están en /public/characters/ copiados desde FuncionaBien/
    const url = `${import.meta.env.BASE_URL}characters/${characterName}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar ${url} (HTTP ${res.status})`);

    const fullConfig = await res.json();
    const params = fullConfig[LANGUAGE] as Record<string, string>;
    if (!params) throw new Error(`Idioma "${LANGUAGE}" no encontrado en ${characterName}.json`);

    characterConfigs[characterName] = params;
    return params;
}

// ── Llamada REST a Gemini ─────────────────────────────────────────────────────

async function callGemini(
    systemInstruction: string,
    history: ChatTurn[],
    userPrompt: string
): Promise<string> {
    const url = `${getApiUrl()}?key=${getApiKey()}`;

    // Construimos los contents: historial previo + turno actual del usuario
    const contents: ChatTurn[] = [
        ...history,
        { role: 'user', parts: [{ text: userPrompt }] },
    ];

    const body = {
        contents,
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            temperature: 1,
            maxOutputTokens: 2000,
        },
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const data = await res.json();

    if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text as string;
    }

    return 'Lo siento, no pude generar una respuesta.';
}

// ── Texto de limpieza — equivalente a CLEAN_TEXT_REPLACE de galatea.py ────────

function cleanText(text: string): string {
    return text.replace(/\*/g, '');
}

// ── Inicialización de sesión — equivalente a Robot.__init__() ─────────────────

async function initSession(characterName: CharacterName): Promise<CharacterSession> {
    const params = await loadCharacterConfig(characterName);

    // Primer mensaje: DEFAULT_ASSISTANT_PROMT (igual que en galatea.py línea 71)
    // Lo enviamos como primer turno de "user" con la instrucción de rol,
    // y guardamos la respuesta del modelo en el historial.
    // Esto inicializa la "personalidad" del chat, igual que en Python.
    const initPrompt = params['DEFAULT_ASSISTANT_PROMT'] || '';
    const systemInstruction = params['DEFAULT_ASSISTANT_PROMT'] || '';

    const session: CharacterSession = {
        params,
        history: [],
        initialized: false,
    };

    // Enviamos el prompt inicial para que el modelo se "presente" y adopte su rol
    // (equivalente a: response = self.chat.send_message(self.parameters["DEFAULT_ASSISTANT_PROMT"]))
    try {
        const initReply = await callGemini(systemInstruction, [], initPrompt);
        // Guardamos el intercambio inicial en el historial
        session.history = [
            { role: 'user', parts: [{ text: initPrompt }] },
            { role: 'model', parts: [{ text: initReply }] },
        ];
    } catch (e) {
        console.warn('[GeminiService] No se pudo inicializar el chat del personaje:', e);
        // Continuamos sin historial inicial, no es crítico
        session.history = [];
    }

    session.initialized = true;
    return session;
}

async function getSession(characterName: CharacterName): Promise<CharacterSession> {
    if (!sessions[characterName]) {
        sessions[characterName] = await initSession(characterName);
    }
    return sessions[characterName]!;
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Preload del personaje. Llámalo al montar el componente para reducir
 * la latencia del primer mensaje (equivale al Robot() que crea run.py
 * la primera vez que se hace un request para ese usuario+personaje).
 */
export async function preloadCharacter(characterName: CharacterName = 'alice'): Promise<void> {
    await getSession(characterName);
}

/**
 * Envía un mensaje del usuario al personaje activo y devuelve la respuesta.
 *
 * Equivale exactamente a Robot.ask(user_text, command) de galatea.py:
 *   1. Obtiene el prefijo de la clave `command` del JSON del personaje
 *   2. Construye q = prefix + user_text
 *   3. Llama a chat.send_message(q).text
 *   4. Limpia el texto (* → '')
 *   5. Actualiza el historial de la sesión
 *
 * @param userText       Texto del usuario
 * @param characterName  Personaje activo
 * @param command        Clave de prompt (USER_CHAT_TEXT_NORMAL, etc.)
 */
export async function ask(
    userText: string,
    characterName: CharacterName,
    command: ValidCommand = 'USER_CHAT_TEXT_NORMAL'
): Promise<string> {
    const session = await getSession(characterName);
    const params = session.params;

    // Si el comando no es válido, usamos DEFAULT_QUESTION_PROMPT
    const prefix = VALID_COMMANDS.includes(command)
        ? (params[command] || params['DEFAULT_QUESTION_PROMPT'] || '')
        : (params['DEFAULT_QUESTION_PROMPT'] || '');

    // q = prefix + user_text  (idéntico a galatea.py línea 166)
    const q = `${prefix}${userText}`;

    const systemInstruction = params['DEFAULT_ASSISTANT_PROMT'] || '';

    const rawReply = await callGemini(systemInstruction, session.history, q);
    const cleanReply = cleanText(rawReply);

    // Actualizamos el historial (equivalente al estado interno de `chat` en Python)
    session.history = [
        ...session.history,
        { role: 'user', parts: [{ text: q }] },
        { role: 'model', parts: [{ text: cleanReply }] },
    ];

    return cleanReply;
}

/**
 * Cambia de personaje: destruye la sesión anterior y crea una nueva.
 * Equivale a que run.py cree un nuevo Robot() con otro character_name.
 *
 * Devuelve el mensaje de saludo inicial que el nuevo personaje generó
 * durante la inicialización (o el mensaje de fallback si falló).
 */
export async function switchCharacter(
    newCharacter: CharacterName,
    fallbackGreeting: string
): Promise<string> {
    // Destruir sesión anterior para ese personaje (force re-init)
    sessions[newCharacter] = null;

    const session = await getSession(newCharacter);

    // Si el historial tiene la respuesta de inicialización, la usamos como saludo
    if (session.history.length >= 2) {
        const initReply = session.history[1].parts[0].text;
        return cleanText(initReply) || fallbackGreeting;
    }

    return fallbackGreeting;
}

/**
 * Limpia el historial de un personaje sin re-inicializarlo.
 * Útil para "reiniciar" la conversación con el mismo personaje.
 */
export function resetHistory(characterName: CharacterName): void {
    sessions[characterName] = null;
}
