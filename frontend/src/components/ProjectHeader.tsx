import type { Project } from '../types/project';

const origin = window.location.origin;

type Props = { project: Project; onCopyLink?: (link: string) => void; };

export default function ProjectHeader({ project, onCopyLink }: Props) {
    const shareLink = (project.id && project.inviteKey)
        ? `${origin}/creategroup/${project.id}/${project.inviteKey}`   // ✅ nouveau format
        : null;

    return (
        <header className="mb-3">
            <h1 className="h3 mb-1">{project.title}</h1>
            <p className="text-muted small mb-0">{project.description?.trim() || 'aucune description'}</p>

            {shareLink && (
                <div className="mt-2">
                    <span className="text-muted small me-2">Lien :</span>
                    <a href={shareLink} className="link-primary me-2" target="_blank" rel="noreferrer">
                        {shareLink}
                    </a>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onCopyLink?.(shareLink)}
                    >
                        Copier
                    </button>
                </div>
            )}
        </header>
    );
}
