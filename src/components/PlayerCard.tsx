import {
  isJoinable,
  presenceLabel,
} from "../api/roblox";
import { JoinTarget, PlayerProfile, UserPresenceType } from "../types/roblox";
import "./PlayerCard.css";

interface PlayerCardProps {
  profile: PlayerProfile;
  onJoin?: (target: JoinTarget) => void;
}

function statusClass(type: UserPresenceType): string {
  switch (type) {
    case UserPresenceType.InGame:
      return "player-card__status--ingame";
    case UserPresenceType.Online:
      return "player-card__status--online";
    case UserPresenceType.InStudio:
      return "player-card__status--studio";
    default:
      return "player-card__status--offline";
  }
}

/** Displays resolved player info: avatar, name, and presence */
export function PlayerCard({ profile, onJoin }: PlayerCardProps) {
  const { user, presence, avatarUrl, joinTriggered } = profile;
  const joinable = isJoinable(presence);
  const label = presenceLabel(presence.userPresenceType);

  return (
    <article className="player-card">
      <div className="player-card__avatar-wrap">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${user.displayName}'s avatar`}
            className="player-card__avatar"
            width={96}
            height={96}
          />
        ) : (
          <div className="player-card__avatar player-card__avatar--placeholder" />
        )}
        <span
          className={`player-card__status-dot ${statusClass(presence.userPresenceType)}`}
          title={label}
        />
      </div>

      <div className="player-card__info">
        <h2 className="player-card__name">
          {user.displayName}
          {user.hasVerifiedBadge && (
            <span className="player-card__verified" title="Verified">✓</span>
          )}
        </h2>
        <p className="player-card__username">@{user.name}</p>
        <p className={`player-card__presence ${statusClass(presence.userPresenceType)}`}>
          {label}
          {presence.lastLocation && presence.userPresenceType !== UserPresenceType.Offline && (
            <span className="player-card__location"> · {presence.lastLocation}</span>
          )}
        </p>

        {joinTriggered && (
          <p className="player-card__join-notice">
            Launching Roblox…
          </p>
        )}

        {joinable && onJoin && presence.placeId && presence.gameId && (
          <button
            type="button"
            className="player-card__join-btn"
            onClick={() =>
              onJoin({
                placeId: presence.placeId!,
                gameInstanceId: presence.gameId!,
              })
            }
          >
            Join Again
          </button>
        )}
      </div>
    </article>
  );
}
