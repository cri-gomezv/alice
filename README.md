# Alejandra — Sistema de Entrenamiento Conversacional con IA

> Documentación técnica y funcional completa del sistema  
> Actualizada: Abril 2026

---

## Tabla de Contenidos

1. [¿Qué es Alejandra?](#1-qué-es-alejandra)
2. [Arquitectura General](#2-arquitectura-general)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Flujo de Navegación](#5-flujo-de-navegación)
6. [Módulo de IA: Gemini (gemini.ts)](#6-módulo-de-ia-geminigeminits)
7. [Personajes y Configuración](#7-personajes-y-configuración)
8. [Módulo de Voz (speech.ts)](#8-módulo-de-voz-speechts)
9. [Motor de Síntesis Amazon Polly (polly.ts)](#9-motor-de-síntesis-amazon-pollypollyts)
10. [Motor de Síntesis Local Piper TTS (piperTTS.ts)](#10-motor-de-síntesis-local-piper-ttspiperttstts)
11. [Animación Labial: Lipsync (lipsync.ts)](#11-animación-labial-lipsyncliprsyncts)
12. [Reconocimiento de Voz](#12-reconocimiento-de-voz)
13. [Configuración Global (settings.ts)](#13-configuración-global-settingsts)
14. [Página de Entrenamiento (TrainingPage.tsx)](#14-página-de-entrenamiento-trainingpagetsx)
15. [Página: Guía de Crédito Hipotecario (MortgageGuidePage.tsx)](#15-página-guía-de-crédito-hipotecario-mortgageguidetsx)
16. [Landing Page: TalentFlow](#16-landing-page-talentflow)
17. [Panel de Configuración](#17-panel-de-configuración)
18. [Variables de Entorno](#18-variables-de-entorno)
19. [Diagramas de Flujo](#19-diagramas-de-flujo)
20. [Origen del Sistema: Puerto desde Python](#20-origen-del-sistema-puerto-desde-python)

---

## 1. ¿Qué es Alejandra?

**Alejandra** es un sistema de entrenamiento comercial con IA diseñado específicamente para ejecutivos de crédito hipotecario de **Banco BCI**. Su propósito es mejorar las habilidades de venta mediante simulaciones de conversación realistas con un avatar interactivo que habla, escucha y responde.

El sistema integra tres tecnologías centrales en una única aplicación web de página única (SPA):

- **Inteligencia Artificial Generativa** (Google Gemini) para generar respuestas naturales y contextualizadas
- **Síntesis de voz** (Amazon Polly o Piper TTS local) para que el avatar se exprese en audio
- **Animación labial** basada en frames de imagen sincronizados con el habla

### Casos de uso principales

| Modo | Personaje | Descripción |
|---|---|---|
| **Coach** | Alice | Entrenamiento guiado con metodología GROW + OARS. Evalúa habilidades y da feedback. |
| **Cliente** | Marta | El ejecutivo practica como vendedor; Marta es el cliente interesado en un crédito. |
| **Vendedor** | Alejandra | El ejecutivo practica como cliente; Alejandra es una ejecutiva de ventas del banco. |

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR (SPA)                                │
│                                                                         │
│  ┌─────────────┐   ┌────────────────────────────────────────────────┐  │
│  │  Landing    │   │              App.tsx (Router de estado)         │  │
│  │  (home)     │   │  page: 'home' | 'login' | 'dashboard' |        │  │
│  └─────────────┘   │         'training' | 'mortgage-guide'          │  │
│                    └────────────────────┬───────────────────────────┘  │
│                                         │                               │
│         ┌───────────────────────────────┼────────────────────────┐     │
│         ▼                               ▼                        ▼     │
│  ┌─────────────┐              ┌──────────────────┐       ┌─────────────┐│
│  │  Dashboard  │              │  TrainingPage    │       │  Mortgage   ││
│  │  (panel     │              │  - Avatar visual  │       │  Guide Page ││
│  │   usuario)  │              │  - Chat UI        │       │  (guía de   ││
│  └─────────────┘              │  - Speech I/O    │       │   ventas)   ││
│                               └────────┬─────────┘       └─────────────┘│
│                                        │                                │
│            ┌───────────────────────────┼──────────────────────────┐    │
│            ▼                           ▼                          ▼    │
│  ┌──────────────────┐  ┌───────────────────────┐  ┌─────────────────┐ │
│  │  services/       │  │  services/speech.ts   │  │ services/       │ │
│  │  gemini.ts       │  │  (orquestador de voz) │  │ lipsync.ts      │ │
│  │  (IA + historial)│  └──────────┬────────────┘  │ (animación)     │ │
│  └──────────┬───────┘             │               └─────────────────┘ │
│             │                ┌────┴─────┐                              │
│             │                ▼          ▼                              │
│             │       ┌──────────┐  ┌──────────┐                        │
│             │       │polly.ts  │  │piperTTS  │                        │
│             │       │(AWS TTS) │  │.ts(local)│                        │
│             │       └──────────┘  └──────────┘                        │
│             ▼                                                           │
│    Google Gemini API                                                    │
│    (REST via fetch)                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| **Framework UI** | React | 19.1.1 | Renderizado reactivo |
| **Lenguaje** | TypeScript | 5.8 | Tipado estático |
| **Build tool** | Vite | 6.2 | Dev server y bundler |
| **Estilos** | Tailwind CSS | (CDN) | Utilidades de diseño |
| **IA Generativa** | Google Gemini API | gemini-2.5-flash | LLM para personajes |
| **TTS Cloud** | Amazon Polly (Neural) | - | Voz Mia (español) |
| **TTS Local** | Piper TTS (WASM) | 0.1.4 | Síntesis offline |
| **Audio** | Web Audio API | nativa | Reproducción y control |
| **STT** | Web Speech API | nativa | Reconocimiento de voz |
| **Almacenamiento** | localStorage | nativa | Persistencia de settings |
| **Cache** | Cache API | nativa | Cache de modelos Piper |

---

## 4. Estructura del Proyecto

```
alejandra/
├── index.html              # Punto de entrada HTML (carga AWS SDK desde CDN)
├── index.tsx               # Punto de entrada React
├── App.tsx                 # Router de estado + renderizado condicional de páginas
├── types.ts                # Tipos TypeScript compartidos (Feature, Solution, etc.)
├── constants.ts            # Datos estáticos de la landing (FAQs, features, etc.)
│
├── components/             # Componentes de la Landing Page
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Solutions.tsx
│   ├── HowItWorks.tsx
│   ├── Results.tsx
│   ├── Services.tsx
│   ├── Testimonial.tsx
│   ├── Faq.tsx
│   ├── Cta.tsx
│   ├── Footer.tsx
│   ├── IconComponents.tsx  # Todos los íconos SVG como componentes React
│   │
│   └── pages/              # Páginas de la aplicación
│       ├── Login.tsx           # Autenticación
│       ├── Dashboard.tsx       # Panel principal + modal de configuración
│       ├── TrainingPage.tsx    # Página de simulación con avatar (CORE)
│       └── MortgageGuidePage.tsx # Guía de referencia de crédito hipotecario
│
├── services/               # Lógica de negocio y acceso a APIs externas
│   ├── gemini.ts           # Cliente Gemini / gestor de sesiones por personaje
│   ├── speech.ts           # Orquestador de síntesis de voz + AudioContext
│   ├── polly.ts            # Amazon Polly (TTS cloud)
│   ├── piperTTS.ts         # Piper TTS via Web Worker + WASM (TTS local/offline)
│   ├── lipsync.ts          # Motor de animación labial ping-pong
│   └── settings.ts         # Settings persistentes en localStorage
│
├── utils/
│   └── aws-config.ts       # Credenciales AWS leídas desde variables de entorno
│
└── public/
    ├── characters/             # Configs JSON de personajes
    │   ├── alice.json
    │   ├── marta.json
    │   └── alejandra.json
    ├── new_alejandra_frames/       # 26 imágenes JPG del avatar (001.jpg – 026.jpg)
    └── piper/                  # Binarios WASM de Piper TTS
        ├── piper_phonemize.js
        ├── piper_phonemize.wasm
        ├── piper_phonemize.data
        ├── piper_worker.js
        ├── dist/               # ONNX Runtime
        └── models/             # Modelos de voz descargados (≥35MB c/u)
            ├── es_AR-daniela-high.onnx
            ├── es_AR-daniela-high.onnx.json
            └── ...
```

---

## 5. Flujo de Navegación

El sistema no usa React Router. La navegación es gestionada puramente por estado en `App.tsx`, que mantiene una variable `page: Page` donde `Page = 'home' | 'login' | 'dashboard' | 'training' | 'mortgage-guide'`.

```
Landing (home)
    │
    ├── [Iniciar sesión] ──→ Login
    │                           │
    │                           └── [Login exitoso] ──→ Dashboard
    │                                                        │
    │                                              ┌─────────┴─────────┐
    │                                              ▼                   ▼
    │                                         [Entrenar]      [Abrir Configuración]
    │                                              │
    │                                        TrainingPage
    │                                              │
    │                                    [Concepto Fundamental]
    │                                              │
    │                                      MortgageGuidePage
    │                                      (con anchor al tema)
    │                                              │
    │                                     [Volver al entrenamiento]
    │                                              │
    └──────────────────────────────────────────────┘
```

**Nota:** La navegación preserva `anchor` para permitir scroll profundo a secciones específicas de la guía hipotecaria (ej. "manejo-objeciones", "estrategias-cierre").

---

## 6. Módulo de IA: Gemini (`gemini.ts`)

Este módulo es el **corazón del sistema de conversación**. Implementa la misma lógica que el sistema original en Python (`galatea.py` + `run.py` de Triskeledu), portada completamente a TypeScript.

### Cómo funciona internamente

#### a) Sesiones por personaje (singleton)

Cada personaje (`alice`, `marta`, `alejandra`) tiene su propia **sesión independiente** representada por un objeto `CharacterSession`:

```typescript
interface CharacterSession {
    params: Record<string, string>; // parámetros del JSON del personaje
    history: ChatTurn[];            // historial multi-turn para Gemini
    initialized: boolean;
}
```

Las sesiones se almacenan en el módulo como un mapa global (`sessions`), equivalente al diccionario `robots{}` de `run.py`.

#### b) Inicialización (equivalente a `Robot.__init__()`)

Al cargar un personaje, el sistema:
1. Descarga su JSON desde `/public/characters/{nombre}.json`
2. Extrae los parámetros del idioma `"es"`
3. Envía el `DEFAULT_ASSISTANT_PROMT` a Gemini como primer turno de la conversación
4. Guarda el intercambio inicial en el historial de la sesión

Esto garantiza que el personaje "adopte su personalidad" desde el inicio.

#### c) Función `ask()` (equivalente a `Robot.ask()`)

Cada mensaje del usuario sigue este flujo:

```
1. Obtener sesión del personaje activo
2. Leer el prefijo del comando (ej. USER_CHAT_TEXT_NORMAL)
3. Construir: q = prefijo + texto_usuario
4. Llamar callGemini(systemInstruction, historial, q)
5. Limpiar asteriscos del texto devuelto
6. Agregar el turno al historial de sesión
7. Devolver la respuesta limpia
```

#### d) Multi-turn conversation

Cada llamada a Gemini incluye el **historial completo** de la sesión en el campo `contents` del payload REST. Esto permite que el modelo recuerde todo lo que se ha hablado dentro de la misma sesión de personaje.

#### e) Cambio de personaje (`switchCharacter()`)

Al cambiar de personaje, el sistema **destruye y reinicializa** la sesión de ese personaje (equivalente a crear un nuevo `Robot()` en Python). Esto permite tener conversaciones completamente independientes por personaje.

### Comandos válidos

Los comandos controlan la longitud máxima de la respuesta del modelo:

| Comando | Longitud máxima |
|---|---|
| `USER_CHAT_TEXT_VERY_BRIEF` | 20 palabras |
| `USER_CHAT_TEXT_BRIEF` | 50 palabras |
| `USER_CHAT_TEXT_NORMAL` | 100 palabras |
| `USER_CHAT_TEXT_COMPLETE` | 150 palabras |
| `USER_CHAT_TEXT_VERY_COMPLETE` | 200 palabras |

---

## 7. Personajes y Configuración

Cada personaje tiene su propio archivo JSON en `/public/characters/`. Estos archivos son el **corazón de la personalidad** de cada avatar.

### Estructura del JSON de personaje

```json
{
  "es": {
    "ASSISTANT_NAME": "ALICE",
    "DEFAULT_ASSISTANT_PROMT": "...(system prompt extenso con instrucciones de rol)...",
    "USER_CHAT_TEXT_NORMAL": "Basta con que saludes la primera vez... Responde con máximo 100 palabras...",
    "REWORD_QUESTION": "Reformula la siguiente pregunta para un proceso de coaching...",
    "INVALID_ANSWER_PHRASE": "No puedo responder esa pregunta...",
    ...
  },
  "en": { ... }
}
```

### Los tres personajes

**Alice — Coach experta en ventas BCI**
- Metodología: GROW + OARS + Comunicación No Violenta
- Flujo: Acuerdo de objetivo → Exploración → Co-creación → Compromiso → Cierre
- Evaluación: Rúbrica 0–100% con 7 criterios medibles

**Marta — Cliente interesada en crédito hipotecario**
- Rol: Simula a una persona real buscando financiamiento
- Propósito: Que el ejecutivo practique el proceso de venta desde el lado de la venta

**Alejandra — Ejecutiva vendedora BCI**
- Rol: Simula a la vendedora del banco
- Propósito: Que el ejecutivo entienda el proceso desde la perspectiva del cliente

---

## 8. Módulo de Voz (`speech.ts`)

El orquestador de síntesis de voz gestiona un único `AudioContext` compartido y garantiza que solo un audio se reproduzca a la vez.

### Funciones principales

```typescript
initializeAndUnlockAudio()  // Crea y desbloquea el AudioContext (crítico en móviles)
resumeAudio()               // Reactiva el AudioContext tras interacción del usuario
speak(text)                 // Sintetiza y reproduce; devuelve Promise que resuelve al terminar
stopAudio()                 // Detiene el audio actual e invalida peticiones pendientes
isSpeaking()                // Indica si hay audio reproduciéndose
```

### Selección del motor de voz

`speak()` decide el motor en tiempo real según la configuración guardada:

```
settings.voiceEngine === 'piper' Y modelo cargado en memoria
    → synthesizePiper(text, modelId)  (local, offline)
en cualquier otro caso
    → synthesizeSpeech(text)          (Amazon Polly, cloud)
```

### Gestión de IDs de reproducción

Cada llamada a `speak()` incrementa un `currentSpeakId`. Las operaciones asíncronas intermedias (fetch, decode) verifican si el ID sigue siendo el actual antes de continuar. Esto garantiza que si se llama `stopAudio()` mientras se está descargando audio, la reproducción no se inicia.

---

## 9. Motor de Síntesis Amazon Polly (`polly.ts`)

Usa el **AWS SDK para JavaScript** (cargado como script global desde CDN en `index.html`) para llamar al servicio de TTS de Amazon Web Services.

| Parámetro | Valor |
|---|---|
| Voz | `Mia` (español femenino-neutral, voz de México) |
| Engine | `neural` (mayor naturalidad) |
| Formato | `mp3` |

**Requisitos:** Claves de AWS configuradas en `.env.development` / `.env.production` como `VITE_AWS_ACCESS_KEY_ID` y `VITE_AWS_SECRET_ACCESS_KEY`.

---

## 10. Motor de Síntesis Local Piper TTS (`piperTTS.ts`)

Piper TTS es un motor de síntesis de voz **100% local y offline** que se ejecuta en el navegador mediante **WebAssembly**. No requiere conexión a internet para sintetizar.

### Proceso de síntesis

```
1. Usuario descarga el modelo desde Settings (~35–114 MB según modelo)
   → El modelo se guarda en Cache API del navegador (no se vuelve a descargar)

2. Al sintetizar:
   a. Se crea un Web Worker con piper_worker.js
   b. Se envían al worker: texto, URLs del modelo, URLs de WASM (phonemizer + ONNX runtime)
   c. El worker ejecuta la inferencia ONNX en WASM
   d. El worker devuelve un Blob de audio WAV
   e. El Blob se convierte a ArrayBuffer para el AudioContext
   f. El worker se termina (garbage collected)
```

### Modelos disponibles

| ID | Idioma | Calidad | Tamaño aproximado |
|---|---|---|---|
| `es_AR-daniela-high` | Argentina | Alta | ~114 MB |
| `es_ES-davefx-medium` | España | Media | ~63 MB |
| `es_MX-claude-high` | México | Alta | ~114 MB |
| `es_MX-ald-medium` | México | Media | ~63 MB |
| `es_ES-carlfm-x_low` | España | Muy baja | ~28 MB |

### Ventaja vs desventaja

| | Polly | Piper TTS |
|---|---|---|
| Requiere internet | Sí | No (tras descarga del modelo) |
| Latencia inicial | Baja (~500ms) | Alta (inferencia local, ~2–5s) |
| Costo | Por caracteres | Gratis |
| Calidad | Muy alta (neural) | Alta (local) |
| Privacidad | Datos van a AWS | 100% local |

---

## 11. Animación Labial: Lipsync (`lipsync.ts`)

El avatar visual se compone de **26 imágenes JPG** ubicadas en `/public/new_alejandra_frames/001.jpg` hasta `026.jpg`. Representa la boca del avatar en diferentes posiciones que van desde cerrada (frame 1) hasta abierta (frame 26).

### Motor ping-pong

La animación no usa visemas fonéticos reales. En su lugar, utiliza un **loop ping-pong** que avanza y retrocede cíclicamente entre los frames:

```
1 → 2 → 3 → ... → 26 → 25 → ... → 2 → 1 → 2 → ...
```

Este loop corre indefinidamente hasta que se llama `.stop()`. El intervalo entre frames es:

```
frameMs = Math.max(50, Math.round(200 / speedMultiplier))
```

Donde `speedMultiplier` viene de `settings.avatarSpeed` (default 1.1 = 10% más rápido que la base de 200ms/frame).

### Sincronización con el texto

El lipsync se inicia **después de dos ciclos de `requestAnimationFrame`** para garantizar que el texto del diálogo ya esté visible en pantalla antes de que el avatar empiece a mover la boca (`speakAfterRender()`).

### API pública

```typescript
startLipSync(
  text: string,              // ignorado en esta versión (reservado para visemas futuros)
  onFrame: (n) => void,      // callback que recibe el número de frame actual
  onEnd: () => void,         // callback cuando termina (bucle infinito, no se llama)
  speedMultiplier?: number   // multiplicador de velocidad (default 1.0)
): LipSyncHandle            // handle con método .stop()
```

---

## 12. Reconocimiento de Voz

Se usa la **Web Speech API** nativa del navegador (`SpeechRecognition` / `webkitSpeechRecognition`), que está disponible en Chrome, Edge y Safari modernos.

### Configuración

```typescript
recognition.continuous     = true    // no se detiene automáticamente
recognition.interimResults = true    // resultados parciales mientras habla
recognition.lang           = 'es-ES' // idioma español
```

### Modo Conversación Continua (Manos Libres)

El botón del micrófono activa un modo especial donde:

1. El usuario habla
2. Tras 1.2 segundos de silencio → el texto se envía automáticamente
3. El avatar responde (habla y anima)
4. Al terminar la respuesta del avatar → el micrófono se reactiva automáticamente

Este ciclo se repite indefinidamente hasta que el usuario desactiva el micrófono.

### Auto-envío por silencio

```typescript
// Al recibir resultados finales (frases reconocidas):
if (finals) {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        recognition.stop();
        autoSubmitRef.current(); // envía el mensaje
    }, 1200); // 1.2s de silencio
}
```

---

## 13. Configuración Global (`settings.ts`)

Todos los parámetros configurables se persisten en `localStorage` bajo la clave `alejandra_settings`.

### Campos de configuración

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `voiceEngine` | `'polly' \| 'piper'` | `'polly'` | Motor de síntesis de voz |
| `geminiApiKey` | `string` | (key hardcoded) | API key de Google Gemini |
| `geminiApiUrl` | `string` | gemini-2.5-flash URL | Endpoint del modelo Gemini |
| `piperModelId` | `string` | `'es_AR-daniela-high'` | Modelo Piper TTS seleccionado |
| `avatarSpeed` | `number` | `1.1` | Multiplicador de velocidad de animación |

### Persistencia

```typescript
getSettings()                     // Lee settings (localStorage → defaults si no hay)
saveSettings(partial: Partial<AppSettings>) // Fusiona y persiste cambios parciales
```

Los cambios en settings se aplican **inmediatamente** en la próxima síntesis de voz o animación, sin necesidad de recargar la página.

---

## 14. Página de Entrenamiento (`TrainingPage.tsx`)

Es la página principal del sistema y la más compleja. Gestiona toda la interacción del usuario con el avatar.

### Estado interno

```typescript
conversation   // Array de mensajes { type: 'user' | 'alice' | 'marta' | 'alejandra', text }
userInput      // Texto actual del campo de entrada
isThinking     // true mientras Gemini está generando respuesta
isListening    // true mientras el micrófono está activo
isSpeaking     // true mientras el avatar habla
isSettingRole  // true mientras se está cambiando de personaje (bloquea UI)
character      // Personaje activo: 'alice' | 'marta' | 'alejandra'
avatarFrame    // Frame actual de la imagen del avatar (1–26)
isContinuousMode // true cuando el modo manos libres está activo
```

### Ciclo de vida de una respuesta del avatar

```
Usuario envía mensaje
    │
    ├── stopAudio()           // detener audio previo
    ├── stopLipSync()         // detener animación previa
    ├── setIsThinking(true)   // mostrar "..."
    ├── ask(texto, personaje) // llamar a Gemini API
    │       │
    │       └── Respuesta recibida
    │               │
    ├── setIsThinking(false)
    ├── setConversation(...)  // agregar mensaje al chat
    │
    └── speakAfterRender(texto)
            │
            ├── requestAnimationFrame × 2  // esperar render del DOM
            ├── startLipSync(...)          // iniciar animación labial
            └── speak(texto)               // sintetizar y reproducir audio
                    │
                    └── Al terminar el audio:
                            │
                            ├── stopLipSync()    // cerrar boca
                            └── if(modoContínuo): startListening()
```

### Prevención de condiciones de carrera

- `animationIdRef` evita que una animación tardía cancele una nueva
- `currentSpeakId` evita que audio de una petición anterior suene si se interrumpió
- `autoSubmitRef` permite al timer de silencio llamar siempre al handler más reciente

---

## 15. Página: Guía de Crédito Hipotecario (`MortgageGuidePage.tsx`)

Documentación de referencia completa sobre la venta de créditos hipotecarios en BCI. Está organizada en 5 secciones accesibles desde el panel lateral de la sesión de entrenamiento:

1. **Mentalidad y Preparación** — Mindset del ejecutivo, tipología de clientes
2. **Estructura de la Conversación** — Apertura → Diagnóstico → Propuesta → Objeciones → Cierre
3. **Manejo de Objeciones** — Respuestas a objeciones comunes con argumentos de valor
4. **Criterios y Normas BCI** — Restricciones crediticias, documentación, CAE
5. **Estrategias de Cierre** — Técnicas de cierre ético y urgencia real

La página soporta **navegación por anchor** (`#manejo-objeciones`, `#estrategias-cierre`, etc.) activada desde los botones de concepto en `TrainingPage`.

---

## 16. Landing Page: TalentFlow

La landing page está orientada a **compradores institucionales** (bancos, empresas) que quieren contratar el sistema. Presenta Alejandra bajo la marca comercial **TalentFlow**.

### Secciones

| Sección | Componente | Propósito |
|---|---|---|
| Header | `Header.tsx` | Navegación + CTA de acceso |
| Hero | `Hero.tsx` | Propuesta de valor principal |
| Features | `Features.tsx` | 5 características diferenciadoras |
| Solutions | `Solutions.tsx` | 8 soluciones de la plataforma |
| How It Works | `HowItWorks.tsx` | Proceso de implementación en 4 pasos |
| Results | `Results.tsx` | Métricas y KPIs de impacto |
| Services | `Services.tsx` | Servicios profesionales y consultoría |
| Testimonial | `Testimonial.tsx` | Testimonio de cliente |
| FAQ | `Faq.tsx` | 6 preguntas frecuentes |
| CTA | `Cta.tsx` | Llamada a la acción final |
| Footer | `Footer.tsx` | Links y créditos |

---

## 17. Panel de Configuración

Accesible desde el ícono ⚙️ en el header del Dashboard. Contiene tres secciones:

### Motor de Voz
- **Amazon Polly**: voz neural en la nube, requiere internet y credenciales AWS
- **Piper TTS**: síntesis local con selección de modelo por país/calidad. Incluye:
  - Selector de modelo (Argentina, España, México)
  - Probador de voz con texto personalizable
  - Botón de descarga con barra de progreso
  - Indicador de estado (en memoria / no cargado)

### Avatar
- **Slider de velocidad** (0.5× — 3.0×, paso 0.1×): controla el intervalo entre frames de la animación labial. Muestra el multiplicador y los ms/frame en tiempo real. Se guarda automáticamente y aplica en el siguiente speech.

### Gemini API
- **API Key**: campo password para la clave de Google AI Studio
- **URL del modelo**: permite cambiar a gemini-1.5-pro u otros modelos

---

## 18. Variables de Entorno

El sistema usa variables de entorno Vite (prefijo `VITE_`) que se inyectan en tiempo de build.

### `.env.development` y `.env.production`

```bash
# Google Gemini
VITE_GEMINI_API_KEY=AIzaSy...
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

# Amazon Polly (AWS)
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAZ5T...
VITE_AWS_SECRET_ACCESS_KEY=...
```

> ⚠️ **Importante**: Estos archivos están en `.gitignore` y **nunca deben subirse a GitHub**. GitHub Secret Scanning bloquea pushes que contengan credenciales de AWS o claves API.

**Nota:** Los valores de la API key de Gemini también se pueden sobreescribir en tiempo de ejecución desde el Panel de Configuración (se guardan en `localStorage` y tienen prioridad sobre las variables de entorno).

---

## 19. Diagramas de Flujo

### Flujo completo de una interacción con el avatar

```
[Usuario escribe o habla]
        │
        ▼
[handleUserResponse()]
        │
        ├── Detener audio y lipsync anteriores
        ├── Agregar mensaje usuario al chat
        ├── setIsThinking(true) → "..." en pantalla
        │
        ▼
[ask(texto, personaje, 'USER_CHAT_TEXT_NORMAL')]
        │
        ├── getSession(personaje)
        │       └── Si no existe: initSession() → Gemini API (inicialización)
        │
        ├── Construir: q = prefijo + texto
        ├── callGemini(systemInstruction, historial, q)
        │       └── HTTP POST → Google Gemini REST API
        │
        ├── cleanText(respuesta) → eliminar asteriscos
        ├── Actualizar historial de sesión
        └── Devolver texto limpio
        │
        ▼
[setIsThinking(false)]
[setConversation(prev → [...prev, { type: personaje, text: respuesta }])]
        │
        ▼
[speakAfterRender(respuesta)]
        │
        ├── requestAnimationFrame × 2 (esperar render del DOM)
        │
        ▼
[speakWithAnimation(respuesta)]
        │
        ├── setIsSpeaking(true)
        ├── startLipSync(texto, onFrame, onEnd, avatarSpeed)
        │       └── Loop ping-pong: frame 1→26→1→... cada ~182ms
        │
        └── speak(respuesta)
                │
                ├── Si motor=piper y modelo cargado:
                │       synthesizePiper(texto, modelId)
                │           └── Web Worker → WASM → WAV
                │
                └── Si motor=polly (o piper no disponible):
                        synthesizeSpeech(texto)
                            └── AWS SDK → Polly → MP3
                │
                ├── AudioContext.decodeAudioData()
                ├── createBufferSource().start()
                └── onended → stopLipSync() → setIsSpeaking(false)
                             → if(modoContínuo): startListening()
```

---

## 20. Origen del Sistema: Puerto desde Python

El sistema de IA es un **puerto fiel** del sistema original de Triskeledu, escrito en Python (`galatea.py` + `run.py`), adaptado completamente a TypeScript para correr 100% en el navegador.

### Equivalencias directas

| Python (galatea.py) | TypeScript (gemini.ts) |
|---|---|
| `class Robot` | `CharacterSession` (objeto por personaje) |
| `Robot.__init__()` | `initSession()` |
| `self.chat = model.start_chat()` | `session.history = []` (array multi-turn) |
| `chat.send_message(DEFAULT_ASSISTANT_PROMT)` | `callGemini(systemInstruction, [], initPrompt)` |
| `Robot.ask(question, command)` | `ask(userText, characterName, command)` |
| `prefix = params[command]` | `const prefix = params[command]` |
| `q = prefix + user_text` | `` const q = `${prefix}${userText}` `` |
| `chat.send_message(q).text` | `callGemini(system, history, q)` |
| `CLEAN_TEXT_REPLACE` | `cleanText()` (elimina asteriscos) |
| `robots[f"{name}_{lang}"]` | `sessions['alice' \| 'marta' \| 'alejandra']` |

La principal diferencia es que en Python el historial lo gestiona internamente el SDK de Gemini (`chat` object), mientras que en TypeScript se mantiene manualmente un array `ChatTurn[]` que se envía completo en cada petición REST al endpoint `generateContent`.

# Solución al acceso del Micrófono (HTTP) cuando está bloqueado

Los navegadores modernos bloquean el micrófono en orígenes no seguros (http), permitiéndolo únicamente en localhost o https. Para habilitarlo en una IP local de desarrollo:

1. Ve a: chrome://flags/#unsafely-treat-insecure-origin-as-secure
2. Cambia el estado a Enabled.
3. En el cuadro de texto, añade la dirección (ej: http://192.168.1.4:3000).
4. Haz clic en Relaunch.

Nota: Esta restricción se debe a la política de "Secure Contexts" implementada en versiones recientes de Chromium.

---

*Documentación generada para el proyecto Alejandra — Sistema de Entrenamiento Comercial BCI*  
*Stack: React 19 + TypeScript 5.8 + Vite 6 + Google Gemini + Amazon Polly + Piper TTS*
