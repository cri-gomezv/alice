import React, { useState, useCallback } from 'react';
import type { Page } from '../../App';
import { 
    BriefcaseIcon, BellIcon, UserCircleIcon, StarIcon, TrophyIcon, 
    ClockIcon, LightBulbIcon, BookOpenIcon, UserGroupIcon, 
    QuestionMarkCircleIcon, ArrowTrendingUpIcon, ChatBubbleBottomCenterTextIcon,
    CheckCircleIcon, CogIcon
} from '../IconComponents';
import { initializeAndUnlockAudio } from '../../services/speech';
import { getSettings, saveSettings, PIPER_MODELS } from '../../services/settings';
import type { AppSettings } from '../../services/settings';
import { loadPiperModel, isPiperModelLoaded } from '../../services/piperTTS';

interface DashboardProps {
  user: string;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const AvatarFab: React.FC = () => (
    <button className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50 animate-pulse">
        <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
        <span className="sr-only">Hablar con el avatar</span>
    </button>
);

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigate }) => {
    const displayName = user === 'student' ? 'Juan' : user;

    // ── Estado del modal de configuración ─────────────────────────────────────
    const [showSettings, setShowSettings]   = useState(false);
    const [settings, setSettings]           = useState<AppSettings>(() => getSettings());
    const [loadProgress, setLoadProgress]   = useState<number | null>(null);
    const [loadLabel, setLoadLabel]         = useState('');
    const [modelLoaded, setModelLoaded]     = useState(() =>
        isPiperModelLoaded(getSettings().piperModelId)
    );
    const [testText, setTestText]           = useState('Hola, esta es mi voz neural en español.');
    const [isTesting, setIsTesting]         = useState(false);
    const [testStatus, setTestStatus]       = useState('');

    const handleSave = useCallback((patch: Partial<AppSettings>) => {
        const updated = { ...settings, ...patch };
        setSettings(updated);
        saveSettings(updated);
    }, [settings]);

    const handleLoadModel = async () => {
        setLoadProgress(0);
        setLoadLabel('Iniciando...');
        try {
            await loadPiperModel(settings.piperModelId, (pct, label) => {
                setLoadProgress(pct);
                setLoadLabel(label);
            });
            setModelLoaded(true);
            setLoadProgress(null);
        } catch (err: any) {
            setLoadLabel('Error: ' + err.message);
            setTimeout(() => setLoadProgress(null), 3000);
        }
    };

    // Prueba la voz seleccionada: carga el modelo si hace falta, sintetiza y reproduce
    const handleTestVoice = async () => {
        if (isTesting) return;
        setIsTesting(true);
        setTestStatus('Preparando...');
        try {
            // 1. Cargar modelo si no está en memoria
            if (!isPiperModelLoaded(settings.piperModelId)) {
                setTestStatus('Cargando modelo...');
                await loadPiperModel(settings.piperModelId, (pct, label) => {
                    setTestStatus(`${label} (${pct}%)`);
                });
                setModelLoaded(true);
            }
            // 2. Sintetizar
            setTestStatus('Sintetizando...');
            const { synthesizePiper } = await import('../../services/piperTTS');
            const audioBuffer = await synthesizePiper(testText || 'Hola, esta es mi voz.', settings.piperModelId);
            // 3. Reproducir con AudioContext propio (no interfiere con el avatar)
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') await ctx.resume();
            const decoded = await ctx.decodeAudioData(audioBuffer);
            const source  = ctx.createBufferSource();
            source.buffer = decoded;
            source.connect(ctx.destination);
            source.onended = () => { setTestStatus(''); setIsTesting(false); ctx.close(); };
            source.start();
            setTestStatus('Reproduciendo...');
        } catch (err: any) {
            setTestStatus('Error: ' + err.message);
            setIsTesting(false);
        }
    };

    const metrics = [
        { icon: StarIcon, label: 'Puntaje', value: '4.8/5', color: 'text-amber-500' },
        { icon: TrophyIcon, label: 'Logros', value: '12', color: 'text-lime-500' },
        { icon: ClockIcon, label: 'Tiempo Invertido', value: '4h 32m', color: 'text-sky-500' },
    ];

    const medals = [
        { icon: TrophyIcon, label: 'Nivel Oro en Ventas', color: 'bg-amber-100 text-amber-600' },
        { icon: CheckCircleIcon, label: 'Excelente en reclamos', color: 'bg-green-100 text-green-600' },
    ];
    
    const ranking = [
        { name: 'Ana Sofía', score: '9,820 pts' },
        { name: 'Carlos Pérez', score: '9,750 pts' },
        { name: 'Tú', score: '9,500 pts', highlight: true },
        { name: 'Laura Gómez', score: '9,210 pts' },
    ];

    const handleTrainClick = async () => {
        await initializeAndUnlockAudio();
        onNavigate('training');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
                            <span className="ml-3 text-2xl font-bold text-gray-800">TalentFlow</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-500 hover:text-gray-700"><BellIcon className="h-6 w-6" /></button>

                            {/* ── Botón Configuración ── */}
                            <button
                                onClick={() => setShowSettings(true)}
                                title="Configuración"
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                <CogIcon className="h-6 w-6" />
                            </button>

                            <div className="relative">
                                <button onClick={onLogout} className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
                                    <UserCircleIcon className="h-8 w-8" />
                                    <span className="hidden sm:inline font-medium">Cerrar sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Modal de Configuración ─────────────────────────────────────── */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <CogIcon className="h-5 w-5 text-indigo-600" />
                                <h2 className="text-lg font-bold text-gray-800">Configuración</h2>
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >×</button>
                        </div>

                        <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

                            {/* ── Sección: Voz ─────────────────────────────── */}
                            <section>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Motor de Voz</h3>
                                <div className="space-y-2">
                                    {/* Polly */}
                                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.voiceEngine === 'polly' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="voiceEngine"
                                            value="polly"
                                            checked={settings.voiceEngine === 'polly'}
                                            onChange={() => handleSave({ voiceEngine: 'polly' })}
                                            className="accent-indigo-600"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">Amazon Polly</p>
                                            <p className="text-xs text-gray-500">Voz de mujer en español · requiere internet</p>
                                        </div>
                                    </label>

                                    {/* Piper */}
                                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.voiceEngine === 'piper' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="voiceEngine"
                                            value="piper"
                                            checked={settings.voiceEngine === 'piper'}
                                            onChange={() => handleSave({ voiceEngine: 'piper' })}
                                            className="accent-indigo-600 mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 text-sm">Piper TTS · Neural (local)</p>
                                            <p className="text-xs text-gray-500">100% offline · requiere cargar el modelo</p>

                                            {/* Selector de modelo Piper */}
                                            <select
                                                value={settings.piperModelId}
                                                onChange={e => {
                                                    handleSave({ piperModelId: e.target.value });
                                                    setModelLoaded(isPiperModelLoaded(e.target.value));
                                                    setTestStatus('');
                                                }}
                                                className="mt-2 w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                {PIPER_MODELS.map(m => (
                                                    <option key={m.id} value={m.id}>{m.label}</option>
                                                ))}
                                            </select>

                                            {/* ── Probador de voz ── */}
                                            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                                                <p className="text-xs font-medium text-gray-600">Texto de prueba</p>
                                                <input
                                                    type="text"
                                                    value={testText}
                                                    onChange={e => setTestText(e.target.value)}
                                                    placeholder="Escribe algo para probar la voz..."
                                                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleTestVoice}
                                                        disabled={isTesting}
                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                                                    >
                                                        🔊 {isTesting ? 'Reproduciendo...' : 'Probar voz'}
                                                    </button>
                                                    {testStatus && (
                                                        <span className="text-xs text-gray-500 truncate max-w-[180px]">{testStatus}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botón cargar modelo */}
                                            <div className="mt-2 flex items-center gap-3">
                                                <button
                                                    onClick={handleLoadModel}
                                                    disabled={loadProgress !== null || isTesting}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {loadProgress !== null ? 'Cargando...' : modelLoaded ? '↺ Recargar modelo' : '⬇ Cargar modelo'}
                                                </button>
                                                {modelLoaded && loadProgress === null && (
                                                    <span className="text-xs text-emerald-600 font-semibold">✓ En memoria</span>
                                                )}
                                            </div>

                                            {/* Barra de progreso */}
                                            {loadProgress !== null && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${loadProgress}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{loadLabel} ({loadProgress}%)</p>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </section>

                            {/* ── Sección: Gemini API ───────────────────────── */}
                            <section>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Gemini API</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
                                        <input
                                            type="password"
                                            value={settings.geminiApiKey}
                                            onChange={e => handleSave({ geminiApiKey: e.target.value })}
                                            placeholder="AIzaSy..."
                                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">URL del modelo</label>
                                        <input
                                            type="text"
                                            value={settings.geminiApiUrl}
                                            onChange={e => handleSave({ geminiApiUrl: e.target.value })}
                                            placeholder="https://generativelanguage.googleapis.com/..."
                                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Cambia el modelo (ej. gemini-2.0-flash, gemini-1.5-pro)</p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer del modal */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Welcome Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-6">
                            <img src="https://i.pravatar.cc/150?u=avatar" alt="Avatar" className="w-24 h-24 rounded-full border-4 border-indigo-200"/>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-800">¡Hola, {displayName}!</h1>
                                <p className="mt-2 text-lg text-gray-600">"Hoy te acompañaré a mejorar tus habilidades en atención al cliente bancario."</p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center">
                             <button 
                                onClick={handleTrainClick}
                                className="w-full md:w-auto bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Entrenar con Alejandra
                            </button>
                        </div>
                        
                        {/* Progress Panel */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu Progreso</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-base font-medium text-indigo-700">Avance del Curso</span>
                                        <span className="text-sm font-medium text-indigo-700">75%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div className="bg-indigo-500 h-4 rounded-full" style={{width: '75%'}}></div>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg flex items-center space-x-4">
                                     <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600"/>
                                     <div>
                                        <p className="font-semibold text-gray-700">Próximo objetivo:</p>
                                        <p className="text-indigo-800 font-bold">Simulación de venta de un crédito hipotecario</p>
                                     </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    {metrics.map(metric => {
                                        const Icon = metric.icon;
                                        return (
                                            <div key={metric.label} className="bg-gray-50 p-4 rounded-lg">
                                                <Icon className={`h-8 w-8 mx-auto ${metric.color}`} />
                                                <p className="mt-2 text-2xl font-bold text-gray-800">{metric.value}</p>
                                                <p className="text-sm text-gray-500">{metric.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Feedback Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                             <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><LightBulbIcon className="h-7 w-7 mr-3 text-yellow-500"/>Retroalimentación Instantánea</h2>
                             <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="font-semibold text-blue-800">Última interacción:</p>
                                    <p className="text-gray-700">“Ayer mejoraste tu claridad al explicar productos.”</p>
                                </div>
                                 <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="font-semibold text-green-800">Recomendación personalizada:</p>
                                    <p className="text-gray-700">“Hoy te sugiero reforzar normas de cumplimiento.”</p>
                                </div>
                             </div>
                        </div>

                    </div>
                    
                    {/* Side Column */}
                    <div className="space-y-8">
                        {/* Gamification */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                             <h3 className="text-2xl font-bold text-gray-800 mb-4">Gamificación</h3>
                             <div className="space-y-4">
                                <p className="font-semibold text-gray-700">Medallas Obtenidas:</p>
                                <div className="flex flex-wrap gap-2">
                                    {medals.map(medal => {
                                        const Icon = medal.icon;
                                        return (
                                        <span key={medal.label} className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${medal.color}`}>
                                            <Icon className="h-5 w-5 mr-1.5"/> {medal.label}
                                        </span>
                                    )})}
                                </div>
                             </div>
                             <div className="mt-6">
                                <p className="font-semibold text-gray-700 mb-2 flex items-center"><UserGroupIcon className="h-5 w-5 mr-2 text-gray-500"/>Ranking del Equipo:</p>
                                <ul className="space-y-2">
                                   {ranking.map((player) => (
                                     <li key={player.name} className={`flex justify-between p-2 rounded-md ${player.highlight ? 'bg-indigo-100' : ''}`}>
                                        <span className={`font-medium ${player.highlight ? 'text-indigo-800' : 'text-gray-600'}`}>{player.name}</span>
                                        <span className={`font-bold ${player.highlight ? 'text-indigo-800' : 'text-gray-800'}`}>{player.score}</span>
                                     </li>
                                   ))}
                                </ul>
                             </div>
                        </div>

                        {/* Resources */}
                         <div className="bg-white p-6 rounded-xl shadow-md">
                             <h3 className="text-2xl font-bold text-gray-800 mb-4">Recursos Rápidos</h3>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                    <BookOpenIcon className="h-6 w-6 text-indigo-600 mr-3"/>
                                    <span className="font-medium text-gray-700">Biblioteca de procedimientos</span>
                                </a>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center">
                                       <QuestionMarkCircleIcon className="h-6 w-6 text-indigo-600 mr-3"/>
                                       <span className="font-medium text-gray-700">Pregunta del día</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 pl-9">Si un cliente pregunta por la tasa de interés de un préstamo, ¿cuál es el primer dato que debes solicitar?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <AvatarFab />
        </div>
    );
};

export default Dashboard;