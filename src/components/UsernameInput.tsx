import { FormEvent } from "react";
import "./UsernameInput.css";

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Controlled username search field with submit handling */
export function UsernameInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
}: UsernameInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loading && value.trim()) onSubmit();
  };

  return (
    <form className="username-input" onSubmit={handleSubmit}>
      <label htmlFor="username" className="username-input__label">
        Roblox Username
      </label>
      <div className="username-input__row">
        <input
          id="username"
          type="text"
          className="username-input__field"
          placeholder="Enter username…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="username-input__button"
          disabled={disabled || loading || !value.trim()}
        >
          {loading ? "Searching…" : "Join Player"}
        </button>
      </div>
    </form>
  );
}
