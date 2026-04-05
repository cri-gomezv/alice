import { awsConfig } from '../utils/aws-config';

// Configure AWS SDK
// Cast window to `any` to access the AWS object from the global scope.
if ((window as any).AWS) {
    (window as any).AWS.config.update(awsConfig);
}

const Polly = (window as any).AWS ? new (window as any).AWS.Polly({ apiVersion: '2016-06-10' }) : null;

export const synthesizeSpeech = (text: string): Promise<ArrayBuffer> => {
    if (!Polly) {
        console.error('AWS SDK or Polly service not initialized.');
        return Promise.reject('AWS SDK not initialized.');
    }

    const params = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: 'Mia', // Spanish (US) Female voice
        Engine: 'neural'
    };

    return new Promise((resolve, reject) => {
        Polly.synthesizeSpeech(params, (err: any, data: any) => {
            if (err) {
                console.error('Error synthesizing speech:', err);
                reject(err);
            } else if (data && data.AudioStream) {
                // The AudioStream is a Uint8Array in the browser
                resolve(data.AudioStream.buffer);
            } else {
                reject('No audio stream received');
            }
        });
    });
};
