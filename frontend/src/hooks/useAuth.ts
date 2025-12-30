import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, getToken, setToken, removeToken } from "../lib/api";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const qc = useQueryClient();
  const [tokenState, setTokenState] = useState<string | null>(getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenState);

  useEffect(() => setIsAuthenticated(!!tokenState), [tokenState]);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    enabled: !!tokenState,
    retry: false,
    queryFn: async () => {
      try {
        return await apiFetch<User>("/api/me");
      } catch (e: any) {
        if (e?.status === 401) {
          removeToken();
          setTokenState(null);
          setIsAuthenticated(false);
          return null;
        }
        throw e;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiFetch<LoginResponse>("/api/login", {
        method: "POST",
        body: credentials as any, // IMPORTANT: pas de JSON.stringify ici
      });
    },
    onSuccess: (data) => {
      setToken(data.token);
      setTokenState(data.token);
      setIsAuthenticated(true);
      qc.setQueryData(["auth", "me"], data.user);
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/logout", { method: "POST" });
    } catch {}
    removeToken();
    setTokenState(null);
    setIsAuthenticated(false);
    qc.clear();
    qc.setQueryData(["auth", "me"], null);
  }, [qc]);

  return {
    token: tokenState,
    isAuthenticated,
    user: user || null,
    isLoading,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
