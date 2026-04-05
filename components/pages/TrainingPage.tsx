import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../../App';
import { PaperAirplaneIcon, ArrowTrendingUpIcon, AcademicCapIcon, MicrophoneIcon, SpeakerWaveIcon } from '../IconComponents';

const StopMicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);
import { speak, stopAudio, resumeAudio } from '../../services/speech';
import { preloadCharacter, ask, switchCharacter } from '../../services/gemini';
import type { CharacterName } from '../../services/gemini';
import { startLipSync, frameUrl } from '../../services/lipsync';
import type { LipSyncHandle } from '../../services/lipsync';

interface TrainingPageProps {
  onBackToDashboard: () => void;
  onNavigate: (page: Page, anchor?: string) => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// ── Mensajes de fallback por si Gemini falla al inicializar el personaje ──────
const FALLBACK_GREETING: Record<CharacterName, string> = {
    florencia: '¡Hola! Soy Florencia, tu coach de IA. Estoy aquí para ayudarte a practicar y simular conversaciones. Para comenzar, selecciona uno de los roles a continuación.',
    marta:     'De acuerdo. Ahora soy Marta, tu cliente. Puedes empezar cuando quieras.',
    alejandra: 'Perfecto. Soy Alejandra, la vendedora. ¿En qué te puedo ayudar?',
};

// ── Instrucción de roleplay que se envía al cambiar de personaje ───────────────
// Equivale al primer `ask` de la API de Triskeledu con el command USER_CHAT_TEXT_NORMAL
// que le indica al personaje cómo debe arrancar la simulación.
const ROLE_START_INSTRUCTION: Record<CharacterName, string> = {
    florencia: 'Inicia la sesión de coaching. Preséntate brevemente y pregunta al ejecutivo cuál quiere ser su objetivo de práctica hoy.',
    marta:     'Inicia el roleplay. Salúdate brevemente como Marta, muestra interés en conocer las opciones de crédito hipotecario y haz tu primera pregunta natural.',
    alejandra: 'Inicia el roleplay. Salúdate brevemente como Alejandra, ejecutiva BCI, y comienza la conversación de ventas con el cliente.',
};

const TrainingPage: React.FC<TrainingPageProps> = ({ onBackToDashboard, onNavigate }) => {
    const [conversation, setConversation] = useState([{ type: 'florencia', text: FALLBACK_GREETING.florencia }]);
    const [userInput, setUserInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSettingRole, setIsSettingRole] = useState(false);
    const [character, setCharacter] = useState<CharacterName>('florencia');
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef    = useRef<any | null>(null);
    const baseTextRef       = useRef('');
    const silenceTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentInputRef   = useRef('');  // refleja userInput para acceso en callbacks
    // autoSubmitRef apunta siempre a la última versión de handleUserResponse
    const autoSubmitRef       = useRef<() => void>(() => {});
    // Modo conversación manos libres — mantiene escucha activa tras cada respuesta.
    // Usamos un ref (no solo state) para acceder al valor dentro de callbacks async.
    const isContinuousModeRef = useRef(false);
    const [isContinuousMode, setIsContinuousMode] = useState(false);
    // Referencia al handle de lipsync activo. LipSyncHandle tiene .stop()
    const lipSyncRef = useRef<LipSyncHandle | null>(null);
    const animationIdRef = useRef(0);

    // Mantener currentInputRef en sync con userInput (para callbacks asincrónicos)
    useEffect(() => { currentInputRef.current = userInput; }, [userInput]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    // ── Estado del frame del avatar (1-192 frames locales) ─────────────────────
    const [avatarFrame, setAvatarFrame] = useState(1);

    // ── Helper: iniciar escucha limpia ────────────────────────────────────────
    const startListening = () => {
        if (!recognitionRef.current) return;
        setUserInput('');
        currentInputRef.current = '';
        baseTextRef.current = '';
        try { recognitionRef.current.start(); } catch { /* ya activo */ }
        setIsListening(true);
    };

    // ── Helpers de lipsync ────────────────────────────────────────────────────
    const stopLipSync = () => {
        if (lipSyncRef.current) {
            lipSyncRef.current.stop();
            lipSyncRef.current = null;
        }
        setAvatarFrame(1);
    };

    // ── Helper de síntesis + lipsync ─────────────────────────────────────────
    //
    // Combina el audio (speak()) con la animación de visemas (startLipSync()).
    // Ambos corren en paralelo. Si speak() falla o termina prematuramente,
    // el lipsync sigue hasta que la secuencia de frames se agota.
    // animationIdRef evita que un stop tardío cancele una animación nueva.

    const speakWithAnimation = async (text: string) => {
        const myId = ++animationIdRef.current;

        setIsSpeaking(true);
        stopLipSync(); // cancelar cualquier animación anterior

        // Lanzar lipsync — corre independientemente del audio
        lipSyncRef.current = startLipSync(
            text,
            (frame) => setAvatarFrame(frame),
            () => {
                if (myId === animationIdRef.current) {
                    setIsSpeaking(false);
                    setAvatarFrame(1);
                    lipSyncRef.current = null;
                    // Modo continuo: volver a escuchar cuando el avatar termina
                    if (isContinuousModeRef.current) {
                        startListening();
                    }
                }
            }
        );

        // Lanzar audio en paralelo (puede fallar si AudioContext está suspendido)
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const estimatedMs = Math.max(wordCount * 430, 1800);
        const tStart = Date.now();

        try {
            await speak(text);
        } catch (error: any) {
            console.warn('[speakWithAnimation] speak error:', error instanceof Error ? error.message : error);
        }

        // ── ¿Qué hacer cuando termina el audio? ──────────────────────────────
        // Caso 1: audio terminó normalmente → detener lipsync (la boca se cierra)
        // Caso 2: audio falló casi de inmediato (< 300ms, AudioContext suspendido)
        //         → dejar que el lipsync siga su curso hasta agotarse, así el
        //         avatar igual "mueve los labios" aunque no se escuche sonido
        const elapsed = Date.now() - tStart;
        const audioFailedImmediately = elapsed < 300;

        if (myId === animationIdRef.current && !audioFailedImmediately) {
            // Audio terminó normalmente → cerrar lipsync
            stopLipSync();
            setIsSpeaking(false);
        }
        // Si audio falló inmediatamente, el onEnd del lipsync maneja el cierre
    };

    useEffect(() => {
        // Preload Florencia al arrancar (equivale a crear el Robot() en run.py)
        preloadCharacter('florencia').catch(e => console.error('[TrainingPage] preload error:', e));

        // Al montarse reproducimos el saludo inicial con animación garantizada
        speakWithAnimation(FALLBACK_GREETING.florencia);
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps — speakWithAnimation es estable

    // El useEffect sobre isSpeaking solo sincroniza el ícono del chat bubble.

    // ── Speech recognition ─────────────────────────────────────────────────────

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
            // Acumular solo los resultados de esta sesión de escucha
            let finals   = '';
            let interims = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finals   += event.results[i][0].transcript;
                } else {
                    interims += event.results[i][0].transcript;
                }
            }

            const fullText = (finals + interims).trim();
            setUserInput(fullText);
            currentInputRef.current = fullText;

            // ── Auto-envío por silencio ────────────────────────────────────────
            // Cada vez que hay un resultado final (frase completa reconocida),
            // reiniciamos el timer. Si pasan 1.5s sin nueva frase → auto-envío.
            if (finals) {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    silenceTimerRef.current = null;
                    // Detener reconocimiento
                    try { recognition.stop(); } catch {}
                    setIsListening(false);
                    // Auto-enviar si hay texto
                    if (currentInputRef.current.trim()) {
                        // Simular el envío usando el ref del handler
                        autoSubmitRef.current();
                    }
                }, 1200); // 1.2 segundos de silencio → envía
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
        };
        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            stopAudio();
            stopLipSync();
        };
    }, []);

    // ── Cambio de rol ─────────────────────────────────────────────────────────
    // Equivale exactamente a POST /literatus/api/ask con el command USER_CHAT_TEXT_NORMAL
    // la primera vez que se cambia de personaje en la API de Triskeledu.
    // run.py crea un nuevo Robot() del personaje → galatea.py lo inicializa con
    // DEFAULT_ASSISTANT_PROMT → robot.ask(instruction, 'USER_CHAT_TEXT_NORMAL').

    const handleSetRole = async (role: 'cliente' | 'vendedor' | 'coach') => {
        if (isThinking || isSettingRole) return;

        resumeAudio();
        setIsSettingRole(true);
        stopAudio();
        setIsSpeaking(false);
        stopLipSync(); // detener lipsync si el personaje anterior estaba hablando

        let newCharacter: CharacterName;

        if (role === 'cliente')  newCharacter = 'marta';
        else if (role === 'vendedor') newCharacter = 'alejandra';
        else newCharacter = 'florencia';

        setCharacter(newCharacter);

        try {
            // switchCharacter() destruye la sesión previa del personaje y crea una nueva,
            // igual que run.py cuando crea un nuevo Robot() para el mismo user+character.
            // La respuesta de inicialización viene del DEFAULT_ASSISTANT_PROMT (system init).
            const greetingFromInit = await switchCharacter(newCharacter, FALLBACK_GREETING[newCharacter]);

            // Luego enviamos la instrucción de inicio de roleplay (equivale al primer ask
            // con USER_CHAT_TEXT_NORMAL que hacía la API de Triskeledu al cambiar de rol).
            const startReply = await ask(
                ROLE_START_INSTRUCTION[newCharacter],
                newCharacter,
                'USER_CHAT_TEXT_NORMAL'
            );

            // Usamos el startReply como el mensaje visible de arranque (más natural)
            const displayMessage = startReply || greetingFromInit;

            const newAIMessage = { type: newCharacter, text: displayMessage };
            setConversation(prev => [...prev, newAIMessage]);
            await speakWithAnimation(displayMessage);  // ← animación directa garantizada

        } catch (error: any) {
            const msg = "Lo siento, tuve un problema al cambiar mi rol. Por favor, inténtalo de nuevo.";
            console.error('[TrainingPage] Error setting role:', error instanceof Error ? error.message : error);
            setConversation(prev => [...prev, { type: newCharacter, text: msg }]);
            await speakWithAnimation(msg);  // ← animación directa garantizada
        } finally {
            setIsSettingRole(false);
        }
    };

    // ── Respuesta del usuario ─────────────────────────────────────────────────
    // Equivale a POST /literatus/api/ask  { command: 'USER_CHAT_TEXT_NORMAL', ... }
    // → run.py → robot.ask(user_text, 'USER_CHAT_TEXT_NORMAL')

    const handleUserResponse = async () => {
        resumeAudio(); // CRÍTICO para tablets/móviles

        if (!userInput.trim() || isThinking || isSettingRole) return;

        stopAudio();
        setIsSpeaking(false);
        stopLipSync(); // detener lipsync si el avatar estaba hablando
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        const userMessage = { type: 'user', text: userInput };
        setConversation(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsThinking(true);

        try {
            // ask() es el equivalente exacto de robot.ask(user_text, command) de galatea.py:
            //   - Carga el parámetro USER_CHAT_TEXT_NORMAL del JSON del personaje
            //   - Construye q = prefix + user_text
            //   - Envía q a Gemini con el historial completo de la sesión
            //   - Guarda el nuevo turno en el historial
            //   - Limpia los asteriscos del reply
            const reply = await ask(currentInput, character, 'USER_CHAT_TEXT_NORMAL');

            const aiResponse = {
                type: character,
                text: reply || 'Lo siento, no he podido procesar esa respuesta. ¿Podrías intentarlo de nuevo?'
            };

            setIsThinking(false);
            setConversation(prev => [...prev, aiResponse]);
            await speakWithAnimation(aiResponse.text);  // ← animación directa garantizada

        } catch (error: any) {
            console.error('[TrainingPage] Error fetching from Gemini:', error instanceof Error ? error.message : error);
            setIsThinking(false);
            setConversation(prev => [...prev, {
                type: character,
                text: 'Lo siento, ha ocurrido un error de conexión. Por favor, inténtalo de nuevo más tarde.'
            }]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleUserResponse();
    };

    // Mantener autoSubmitRef actualizado apuntando a la última versión de handleUserResponse
    // Esto permite que el timer de silencio llame al handler sin closures obsoletas
    autoSubmitRef.current = handleUserResponse;

    const handleMicClick = () => {
        resumeAudio();
        if (!recognitionRef.current || isSettingRole) return;

        if (isContinuousMode) {
            // ── APAGAR modo conversación continua ──
            isContinuousModeRef.current = false;
            setIsContinuousMode(false);
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
            try { recognitionRef.current.stop(); } catch {}
            setIsListening(false);
            stopAudio();
            setIsSpeaking(false);
            stopLipSync();
        } else {
            // ── ENCENDER modo conversación continua ──
            isContinuousModeRef.current = true;
            setIsContinuousMode(true);
            stopAudio();
            setIsSpeaking(false);
            stopLipSync();
            startListening();
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const fundamentalConcepts = [
        { title: 'Mentalidad y Preparación',    anchor: 'mentalidad-preparacion' },
        { title: 'Estructura de la Conversación', anchor: 'proceso-venta' },
        { title: 'Manejo de Objeciones',         anchor: 'manejo-objeciones' },
        { title: 'Criterios y Normas BCI',       anchor: 'cumplimiento' },
        { title: 'Estrategias de Cierre',        anchor: 'estrategias-cierre' },
    ];

    const avatarImageUrl = frameUrl(avatarFrame); // new_alice_frames/001-026.jpg
    const characterName  = character.charAt(0).toUpperCase() + character.slice(1);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Sesión de Entrenamiento: Venta de Crédito Hipotecario</h1>
                    <button
                        onClick={onBackToDashboard}
                        className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Volver al Panel
                    </button>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[80vh]">

                    {/* ── Panel principal de conversación ── */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md flex flex-col h-[80vh]">

                        {/* Selector de roles + avatar */}
                        <div className="p-4 border-b flex flex-col md:flex-row items-center justify-center md:space-x-8 space-y-4 md:space-y-0">
                            <div className="text-center flex-shrink-0">
                                <img
                                    src={avatarImageUrl}
                                    alt={`Avatar de ${characterName}`}
                                    className="w-64 h-64 rounded-full object-cover border-4 border-indigo-200 mx-auto"
                                />
                                <h2 className="text-2xl font-bold text-gray-800 mt-2">{characterName}</h2>
                                <p className="text-sm text-green-500 font-semibold">En línea</p>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={() => handleSetRole('coach')}
                                    disabled={isThinking || isSettingRole}
                                    className="bg-green-100 text-green-800 font-semibold px-6 py-3 rounded-lg hover:bg-green-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Soy un coach y tu mi alumno
                                </button>
                                <button
                                    onClick={() => handleSetRole('cliente')}
                                    disabled={isThinking || isSettingRole}
                                    className="bg-indigo-100 text-indigo-800 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Soy un cliente y tu el vendedor
                                </button>
                                <button
                                    onClick={() => handleSetRole('vendedor')}
                                    disabled={isThinking || isSettingRole}
                                    className="bg-purple-100 text-purple-800 font-semibold px-6 py-3 rounded-lg hover:bg-purple-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Soy un vendedor y tu un cliente
                                </button>
                            </div>
                        </div>

                        {/* Burbuja de conversación */}
                        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                            {conversation.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.type !== 'user' && (
                                        <img
                                            src={avatarImageUrl}
                                            alt={`Avatar de ${characterName}`}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                    <div className={`max-w-lg px-4 py-2 rounded-xl ${msg.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <div className="flex items-center gap-2">
                                            <p>{msg.text}</p>
                                            {msg.type !== 'user' && isSpeaking && index === conversation.length - 1 && (
                                                <SpeakerWaveIcon className="h-5 w-5 text-gray-600 animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex items-end gap-2 justify-start">
                                    <img
                                        src={avatarImageUrl}
                                        alt={`Avatar de ${characterName}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="max-w-lg px-4 py-2 rounded-xl bg-gray-200 text-gray-800">
                                        <span className="animate-pulse">...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center space-x-2">
                            <textarea
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleUserResponse();
                                    }
                                }}
                                placeholder="Escribe tu respuesta aquí..."
                                className="flex-grow p-2 border border-gray-200 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500"
                                rows={2}
                                disabled={isThinking || isSettingRole}
                            />
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                                disabled={isThinking || !userInput.trim() || isSettingRole}
                            >
                                <PaperAirplaneIcon className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={handleMicClick}
                                aria-label={isContinuousMode ? 'Detener modo conversación' : 'Activar modo conversación manos libres'}
                                title={isContinuousMode ? 'Haz clic para detener la escucha automática' : 'Haz clic para conversar sin tocar botones'}
                                className={`p-3 rounded-full transition-all duration-200 ${
                                    isContinuousMode
                                        ? 'bg-red-500 text-white shadow-lg ' + (isListening ? 'animate-pulse' : '')
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                disabled={!SpeechRecognition || isSettingRole}
                            >
                                {isContinuousMode
                                    ? <StopMicIcon className="h-6 w-6" />
                                    : <MicrophoneIcon className="h-6 w-6" />
                                }
                            </button>
                        </form>
                    </div>

                    {/* ── Panel lateral de guía ── */}
                    <div className="bg-white rounded-xl shadow-md p-6 space-y-6 overflow-y-auto">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-indigo-600" />
                                Guía de Aprendizaje
                            </h3>
                            <p className="text-gray-600">Usa los conceptos fundamentales de abajo como referencia durante tu conversación.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Ideas Clave</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Empatía</span>
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Escucha activa</span>
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Claridad</span>
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Cumplimiento</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <AcademicCapIcon className="h-6 w-6 mr-2 text-indigo-600" />
                                Conceptos Fundamentales
                            </h3>
                            <div className="space-y-2">
                                {fundamentalConcepts.map(concept => (
                                    <button
                                        key={concept.anchor}
                                        onClick={() => onNavigate('mortgage-guide', concept.anchor)}
                                        className="w-full text-left p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-gray-700 hover:text-indigo-800"
                                    >
                                        {concept.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-800">Tarea de Repetición</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Repite esta idea: "Para ofrecerle la mejor tasa, necesito entender su perfil financiero."
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default TrainingPage;