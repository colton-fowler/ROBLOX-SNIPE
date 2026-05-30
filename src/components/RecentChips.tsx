import "./RecentChips.css";

interface RecentChipsProps {
  usernames: string[];
  onSelect: (username: string) => void;
  disabled?: boolean;
}

/** Quick-click chips for the last 3 searched usernames */
export function RecentChips({
  usernames,
  onSelect,
  disabled = false,
}: RecentChipsProps) {
  if (usernames.length === 0) return null;

  return (
    <div className="recent-chips">
      <span className="recent-chips__label">Recent</span>
      <div className="recent-chips__list">
        {usernames.map((name) => (
          <button
            key={name}
            type="button"
            className="recent-chips__chip"
            onClick={() => onSelect(name)}
            disabled={disabled}
            title={`Search ${name}`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
