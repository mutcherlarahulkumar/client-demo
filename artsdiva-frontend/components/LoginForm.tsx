interface LoginFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

// Pure presentational component: props in, JSX out. No data-fetching here.
export function LoginForm({
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-lg font-medium">ArtsDiva</h1>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="email" className="flex flex-col gap-1 text-sm">
          Email
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="border px-2 py-1"
          />
        </label>

        <label htmlFor="password" className="flex flex-col gap-1 text-sm">
          Password
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="border px-2 py-1"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm">
            {error}
          </p>
        )}

        <button type="submit" disabled={isLoading} className="border px-2 py-1 text-sm">
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
