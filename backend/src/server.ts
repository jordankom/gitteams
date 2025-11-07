import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDB } from './config/db';

// Import des routes
import authRoutes from './routes/authRoutes';
import githubRoutes from './routes/githubRoutes';
import projectRoutes from './routes/projectsRoutes';

async function bootstrap() {
    // 🧩 Connexion à la base de données
    await connectDB();

    const app = express();

    // 🔒 Sécurité de base (headers)
    app.use(helmet());

    // 🌐 Autoriser le frontend à appeler l'API
    app.use(
        cors({
            origin: env.CLIENT_ORIGIN, // exemple : http://localhost:5173
            credentials: true,
        })
    );

    // 🔧 Parser JSON (limite de taille)
    app.use(express.json({ limit: '1mb' }));

    // 🛡️ Rate limit de base sur /api
    app.use(
        '/api',
        rateLimit({
            windowMs: 60_000, // 1 minute
            max: 200,         // 200 requêtes / minute / IP
            standardHeaders: true,
            legacyHeaders: false,
        })
    );

    // 🔑 Routes principales
    app.use('/api/auth', authRoutes);
    app.use('/api/github', githubRoutes);      // GET /api/github/orgs
    app.use('/api/projects', projectRoutes);   // GET/POST /api/projects

    // 🔍 Healthcheck pour tester si tout fonctionne
    app.get('/api/health', (_req, res) => res.json({ ok: true }));

    // 🚧 Route 404 pour toutes les routes /api non trouvées
    // ⚠️ Express 5 ne supporte plus le pattern '/api/*'
    app.use('/api', (_req, res) => {
        res.status(404).json({ message: 'Not found' });
    });

    // 🧯 Gestion centralisée des erreurs
    app.use(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            const status = err?.status || 500;
            const message = err?.message || 'Erreur interne du serveur';
            if (env.NODE_ENV !== 'production') {
                console.error('❌ Erreur API :', err);
            }
            res.status(status).json({ message });
        }
    );

    // 🚀 Lancement du serveur
    app.listen(env.PORT, () => {
        console.log(`🚀 API disponible sur http://localhost:${env.PORT}`);
    });
}

// Démarrage sécurisé de l'application
bootstrap().catch((e) => {
    console.error('❌ Erreur de démarrage', e);
    process.exit(1);
});
