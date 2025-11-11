import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db';
import { User } from './models/User' ;


async function seedUser() {
    try {
        await connectDB();

        const name = process.argv[2];
        const password = process.argv[3];
        const githubToken = process.argv[4];

        if (!name || !password || !githubToken) {
            console.error('❌ Usage: npm run seed:user -- <name> <password> <githubToken>');
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        let user = await User.findOne({ name });
        if (user) {
            user.passwordHash = passwordHash;
            user.githubToken = githubToken;
            await user.save();
            console.log(`🔁 Utilisateur mis à jour : ${name}`);
        } else {
            user = await User.create({ name, passwordHash, githubToken });
            console.log(`✅ Utilisateur créé : ${name}`);
        }

        console.log(`➡️  Identifiant : ${user.id}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur seedUser:', err);
        process.exit(1);
    }
}

seedUser();
