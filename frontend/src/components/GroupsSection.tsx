import GroupList, { type Group } from './GroupList';

export default function GroupsSection({ groups }: { groups: Group[] }) {
    return (
        <section className="card shadow-sm">
            <div className="card-body">
                <h2 className="h5 mb-3">Groupes inscrits</h2>
                <GroupList groups={groups} />
            </div>
        </section>
    );
}
