import { Route, Switch, Redirect, useLocation } from "wouter";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLoc] = useLocation();

  if (isLoading) return <div style={{ padding: 24 }}>Chargement…</div>;
  if (!isAuthenticated) {
    setLoc("/login");
    return <div style={{ padding: 24 }}>Redirection…</div>;
  }
  return children;
}

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Protected>
          <div style={{ padding: 24 }}>
            <h1>Dashboard</h1>
            <p>Connexion OK.</p>
          </div>
        </Protected>
      </Route>
      <Route><Redirect to="/" /></Route>
    </Switch>
  );
}
