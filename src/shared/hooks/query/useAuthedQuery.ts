"use client";

import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useAuth } from "@/shared/context/AuthContext";

type AuthedQueryOptions<T> = {
  queryKey: QueryKey;
  queryFn: (token: string) => Promise<T>;
  enabled?: boolean;
} & Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn" | "enabled">;

/** Runs a query once Firebase auth is ready and injects the Bearer token. */
export function useAuthedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  ...options
}: AuthedQueryOptions<T>) {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey,
    enabled: enabled && !authLoading && !!user,
    queryFn: async () => {
      const token = await user!.getIdToken();
      return queryFn(token);
    },
    ...options,
  });
}

type AuthedMutationOptions<TData, TVariables> = {
  mutationFn: (args: { token: string; variables: TVariables }) => Promise<TData>;
} & Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;

export function useAuthedMutation<TData, TVariables = void>({
  mutationFn,
  ...options
}: AuthedMutationOptions<TData, TVariables>) {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (!user) throw new Error("Not authenticated.");
      const token = await user.getIdToken();
      return mutationFn({ token, variables });
    },
    ...options,
  });
}
