import { ErrorBanner } from "./components/ErrorBanner";
import { PlayerCard } from "./components/PlayerCard";
import { RecentChips } from "./components/RecentChips";
import { UsernameInput } from "./components/UsernameInput";
import { usePlayerSearch } from "./hooks/usePlayerSearch";
import "./App.css";

export default function App() {
  const {
    username,
    setUsername,
    loading,
    profile,
    error,
    recent,
    search,
    manualJoin,
    clearError,
  } = usePlayerSearch();

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">R</div>
        <div>
          <h1 className="app__title">Roblox Snipe</h1>
          <p className="app__subtitle">
            Find a player and join their game instantly
          </p>
        </div>
      </header>

      <main className="app__main">
        <section className="app__search">
          <UsernameInput
            value={username}
            onChange={setUsername}
            onSubmit={() => search()}
            loading={loading}
          />
          <RecentChips
            usernames={recent}
            onSelect={(name) => search(name)}
            disabled={loading}
          />
        </section>

        {error && (
          <ErrorBanner error={error} onDismiss={clearError} />
        )}

        {profile && (
          <PlayerCard profile={profile} onJoin={manualJoin} />
        )}

        {!profile && !error && !loading && (
          <p className="app__hint">
            Enter a Roblox username. If they&apos;re in a public game, Roblox
            will launch automatically.
          </p>
        )}
      </main>

      <footer className="app__footer">
        Uses official Roblox public APIs. Join requires Roblox Player installed.
      </footer>
    </div>
  );
}
