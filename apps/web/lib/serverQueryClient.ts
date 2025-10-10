import { QueryClient } from "@repo/shared";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: Infinity,
      // gcTime: 1000 * 60 * 10, // 10 dakika sonra cache'den temizle
      // Veriyi hemen "stale" hale getirir, yani her defasında yeniden fetch eder
      staleTime: 0,
      // Cache'te tutmaz, hemen temizler
      gcTime: 0,
    },
  },
});
