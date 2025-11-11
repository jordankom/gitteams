import 'dotenv/config';

function required(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT ?? 4000),
    MONGODB_URL: required('MONGODB_URL'),

    ENCRYPTION_SECRET: required('ENCRYPTION_SECRET'),
    ENCRYPTION_IV: required('ENCRYPTION_IV'),

    GITHUB_USER_AGENT: process.env.GITHUB_USER_AGENT ?? "git-teams-app",
    //  JWT pour authentifier les requêtes front → back
    JWT_SECRET: required('JWT_SECRET'),

    //  CORS : URL du frontend (Vite)
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

};
