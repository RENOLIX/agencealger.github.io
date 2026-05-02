import { useMemo, useState } from "react";
import { BriefcaseBusiness, Search, Users } from "lucide-react";
import { getTeamGroups } from "../../lib/data";

export default function TeamSection() {
  const [query, setQuery] = useState("");
  const groups = getTeamGroups();

  const filteredGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;

    return groups
      .map((group) => ({
        ...group,
        members: group.members.filter((member) => member.toLowerCase().includes(needle)),
      }))
      .filter((group) => group.title.toLowerCase().includes(needle) || group.members.length > 0);
  }, [groups, query]);

  return (
    <section id="team" className="section team-section">
      <div className="section-head">
        <div>
          <span className="label">فريقنا</span>
          <h2>الطاقم الإداري<br /><em>والميداني</em></h2>
        </div>
        <div className="team-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن اسم أو منصب"
            aria-label="ابحث عن اسم أو منصب"
          />
        </div>
      </div>

      <div className="team-grid">
        {filteredGroups.map((group) => (
          <article key={group.id} className="team-card">
            <div className="team-card-head">
              <span><BriefcaseBusiness size={18} /></span>
              <div>
                <h3>{group.title}</h3>
                <small>{group.members.length} عضو</small>
              </div>
            </div>
            <div className="team-members">
              {group.members.map((member) => (
                <div key={`${group.id}-${member}`} className="team-member">
                  <Users size={14} />
                  <span>{member}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
