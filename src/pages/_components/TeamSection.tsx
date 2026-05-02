import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, ChevronDown, Search, Users } from "lucide-react";
import { getTeamGroups, syncTeamGroupsFromSupabase, type TeamGroup } from "../../lib/data";

export default function TeamSection() {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<TeamGroup[]>(() => getTeamGroups());
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    void syncTeamGroupsFromSupabase().then(setGroups).catch(() => undefined);
  }, []);

  useEffect(() => {
    setOpenGroups((current) => current.length === 0 && groups.length > 0 ? [groups[0].id] : current);
  }, [groups]);

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

  function toggleGroup(groupId: string) {
    setOpenGroups((current) => current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]);
  }

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

      <div className="team-accordion">
        {filteredGroups.map((group) => {
          const isOpen = openGroups.includes(group.id);
          return (
            <article key={group.id} className={`team-accordion-card ${isOpen ? "open" : ""}`}>
              <button type="button" className="team-accordion-head" onClick={() => toggleGroup(group.id)}>
                <div>
                  <span><BriefcaseBusiness size={18} /></span>
                  <div>
                    <h3>{group.title}</h3>
                    <small>{group.members.length} عضو</small>
                  </div>
                </div>
                <ChevronDown size={18} />
              </button>

              {isOpen && (
                <div className="team-members">
                  {group.members.map((member) => (
                    <div key={`${group.id}-${member}`} className="team-member">
                      <Users size={14} />
                      <span>{member}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
