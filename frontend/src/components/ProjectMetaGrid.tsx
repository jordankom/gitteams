import React from 'react';
import type { Project } from '../types/project';
import MetaStat from './MetaStat';

export default function ProjectMetaGrid({ project }: { project: Project }) {
    return (
        <section className="row g-3 mb-4">
        <div className="col-12 col-md-4">
        <div className="card shadow-sm">
        <div className="card-body">
        <MetaStat label="Étudiants minimum" value={project.minPeople ?? '-'} />
    </div>
    </div>
    </div>
    <div className="col-12 col-md-4">
    <div className="card shadow-sm">
    <div className="card-body">
    <MetaStat label="Étudiants maximum" value={project.maxPeople ?? '-'} />
    </div>
    </div>
    </div>
    <div className="col-12 col-md-4">
    <div className="card shadow-sm">
    <div className="card-body">
    <MetaStat label="Organisation" value={project.org} />
    </div>
    </div>
    </div>
    </section>
);
}
