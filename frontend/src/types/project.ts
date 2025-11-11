export type Project = {
    id: string;
    title: string;
    org: string;
    description?: string | null;
    minPeople?: number;
    maxPeople?: number;
    createdAt?: string;
    inviteSlug?: string;
    inviteKey?: string;
};
