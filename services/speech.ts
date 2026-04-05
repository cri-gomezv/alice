import { synthesizeSpeech } from './polly';
import { synthesizePiper, isPiperModelLoaded } from './piperTTS';
import { getSettings } from './settings';

let audioContext: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;
let currentSpeakId = 0;

export const initializeAndUnlockAudio = async () => {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Failed to create AudioContext:", e);
            return;
        }
    }
    if (audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
        } catch (e) {
            console.error("Could not resume audio context:", e);
        }
    }
};

// Helper function to explicitly resume audio context during user interactions (clicks)
// This is crucial for mobile devices (iOS/Android) where playing audio after an async fetch
// is blocked unless the context was touched during the event handler.
export const resumeAudio = () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error("Manual audio resume failed:", e));
    } else if (!audioContext) {
        initializeAndUnlockAudio();
    }
};

const cleanup = () => {
    if (currentAudioSource) {
        try {
            currentAudioSource.stop();
            currentAudioSource.disconnect();
        } catch (e) {
            // Ignore errors if source is already stopped
        }
        currentAudioSource = null;
    }
};

export const stopAudio = () => {
    cleanup();
    currentSpeakId++; // Invalidate any pending speak operations
};

export const speak = (text: string): Promise<void> => {
    stopAudio();
    const speakId = ++currentSpeakId;
    
    return new Promise(async (resolve, reject) => {
        try {
            if (!audioContext) {
                await initializeAndUnlockAudio();
            }
            
            // Double check context state
            if (audioContext && audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            if (!audioContext || audioContext.state !== 'running') {
                 // If we still aren't running, try one last force resume or throw
                 if (audioContext) await audioContext.resume();
                 if (!audioContext || audioContext.state !== 'running') {
                    throw new Error(`AudioContext is not in a running state. Current state: ${audioContext?.state}`);
                 }
            }

            // ── Selección de motor de voz según configuración ─────────────────
            const settings = getSettings();
            let audioData: ArrayBuffer;

            if (settings.voiceEngine === 'piper' && isPiperModelLoaded(settings.piperModelId)) {
                audioData = await synthesizePiper(text, settings.piperModelId);
            } else {
                audioData = await synthesizeSpeech(text);
            }
            
            if (speakId !== currentSpeakId) {
                // Another speak call was initiated while we were fetching the audio
                resolve();
                return;
            }

            if (!audioData || audioData.byteLength === 0) {
                throw new Error("Synthesized audio data is empty.");
            }
            
            const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));

            // Check again because decodeAudioData is async
            if (speakId !== currentSpeakId) {
                resolve();
                return;
            }

            currentAudioSource = audioContext.createBufferSource();
            currentAudioSource.buffer = audioBuffer;
            currentAudioSource.connect(audioContext.destination);

            currentAudioSource.onended = () => {
                cleanup();
                resolve();
            };
            
            currentAudioSource.start(0);

        } catch (error: any) {
            // If the speak was aborted, we don't necessarily want to reject from a user perspective
            if (speakId !== currentSpeakId) {
                resolve();
                return;
            }

            let errorMessage = "Error in speech synthesis playback: ";
            if (error instanceof DOMException) {
                errorMessage += `${error.name} - ${error.message}`;
            } else if (error instanceof Error) {
                errorMessage += error.message;
            } else {
                errorMessage += JSON.stringify(error);
            }
            console.error(errorMessage);
            cleanup();
            reject(error);
        }
    });
};

export const isSpeaking = (): boolean => {
  return currentAudioSource !== null;
}