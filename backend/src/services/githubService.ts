import axios from 'axios';

const GH_API = 'https://api.github.com';

function gh(headersToken: string) {
    return axios.create({
        baseURL: GH_API,
        headers: {
            Authorization: `Bearer ${headersToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'git-teams-app', // une chaine stable
        },
        timeout: 15_000,
    });
}

/** Vérifie qu’un user GitHub existe (200 si OK) */
export async function githubUserExists(username: string, token?: string): Promise<boolean> {
    try {
        const api = token ? gh(token) : axios.create({ baseURL: GH_API });
        await api.get(`/users/${encodeURIComponent(username)}`);
        return true;
    } catch (e: any) {
        if (e?.response?.status === 404) return false;
        throw e; // autre erreur = réseau / rate limit → à traiter par l’appelant
    }
}

/** Crée un repository. Si org est fourni → /orgs/:org/repos, sinon /user/repos */
export async function createRepository(params: {
    token: string;
    name: string;
    org?: string;
    description?: string;
    privateRepo?: boolean;
}): Promise<{ htmlUrl: string; fullName: string; ownerLogin: string; repoName: string }> {
    const { token, name, org, description, privateRepo = true } = params;
    const api = gh(token);

    const body = {
        name,
        description: description ?? undefined,
        private: privateRepo,
        auto_init: true, // crée un README
    };

    const url = org ? `/orgs/${encodeURIComponent(org)}/repos` : `/user/repos`;
    const { data } = await api.post(url, body);

    return {
        htmlUrl: data.html_url,
        fullName: data.full_name, // owner/name
        ownerLogin: data.owner?.login,
        repoName: data.name,
    };
}

/** Ajoute un collaborateur sur un repo (permission push) */
export async function addCollaborator(params: {
    token: string;
    owner: string;
    repo: string;
    username: string;
}): Promise<'added' | 'invited' | 'exists'> {
    const { token, owner, repo, username } = params;
    const api = gh(token);

    const { status } = await api.put(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/collaborators/${encodeURIComponent(username)}`,
        { permission: 'push' }
    );

    // GitHub retourne:
    // 201 Created → invitation envoyée
    // 204 No Content → déjà collaborateur
    if (status === 201) return 'invited';
    if (status === 204) return 'exists';
    return 'added';
}
