"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./TeamSelector.module.css";

const SAMPLE_TEAMS = [
  { team_id: 1, team_name: "알파", team_code: "ALPHA01" },
  { team_id: 2, team_name: "베타", team_code: "BETA02" },
  { team_id: 3, team_name: "감마", team_code: "GAMMA03" },
];

function TeamSelector({
  teams = SAMPLE_TEAMS,
  selectedTeamId,
  onTeamSelect,
  label = "팀 선택",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  const resolvedId =
    selectedTeamId ?? teams[0]?.team_id ?? SAMPLE_TEAMS[0].team_id;
  const selectedTeam =
    teams.find((team) => team.team_id === Number(resolvedId)) ?? teams[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectTeam = (teamId) => {
    setIsOpen(false);
    if (onTeamSelect) {
      onTeamSelect(teamId);
      return;
    }
    router.push(`/?teamId=${teamId}`);
    router.refresh();
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerLabel}>{label}</span>
        <span className={styles.triggerTeam}>
          {selectedTeam?.team_name ?? "팀 없음"}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          {isOpen ? "▴" : "▾"}
        </span>
      </button>

      <ul
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
        role="listbox"
        aria-label="팀 목록"
        aria-hidden={!isOpen}
      >
        {teams.map((team) => {
          const isSelected = team.team_id === Number(resolvedId);

          return (
            <li key={team.team_id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                className={`${styles.option} ${
                  isSelected ? styles.optionSelected : ""
                }`}
                onClick={() => handleSelectTeam(team.team_id)}
              >
                <span className={styles.optionName}>{team.team_name}</span>
                <span className={styles.optionCode}>{team.team_code}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TeamSelector;
