import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [, setLoc] = useLocation();
  const { user, loginAsync, isLoggingIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setLoc("/");
  }, [user, setLoc]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await loginAsync({ email, password });
      setLoc("/");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la connexion");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "40px auto" }}>
      <h1>Connexion</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 8 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isLoggingIn}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Mot de passe</label>
          <input
            style={{ width: "100%", padding: 8 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={isLoggingIn}
          />
        </div>

        <button disabled={isLoggingIn} style={{ padding: "10px 14px" }}>
          {isLoggingIn ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
