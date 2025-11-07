const KEY = 'token';
const NAME = 'userName';

export function setSession(token: string, name: string) {
    localStorage.setItem(KEY, token);
    localStorage.setItem(NAME, name);
}

export function clearSession() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(NAME);
}

export function getToken(): string | null {
    return localStorage.getItem(KEY);
}

export function getUserName(): string {
    return localStorage.getItem(NAME) || 'Utilisateur';
}

export function isAuthenticated(): boolean {
    return !!getToken();
}
