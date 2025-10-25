import { QueryClient } from "@repo/shared";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
