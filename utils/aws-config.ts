// Las credenciales se leen desde variables de entorno (VITE_*) definidas en
// .env.development y .env.production — nunca deben estar hardcodeadas en código.
export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId:     import.meta.env.VITE_AWS_ACCESS_KEY_ID     ?? '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ?? '',
  },
};
