import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Persist query cache to localStorage
export const persistQueryCache = () => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  const cacheData = queries.map(query => ({
    queryKey: query.queryKey,
    data: query.state.data,
    dataUpdatedAt: query.state.dataUpdatedAt,
  }));
  
  try {
    localStorage.setItem('react-query-cache', JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to persist query cache:', error);
  }
};

// Restore query cache from localStorage
export const restoreQueryCache = () => {
  try {
    const cached = localStorage.getItem('react-query-cache');
    if (cached) {
      const cacheData = JSON.parse(cached);
      cacheData.forEach((item: any) => {
        if (item.data !== undefined) {
          queryClient.setQueryData(item.queryKey, item.data);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to restore query cache:', error);
  }
};

// Set up persistence
if (typeof window !== 'undefined') {
  // Restore cache on page load
  restoreQueryCache();
  
  // Persist cache before page unload
  window.addEventListener('beforeunload', persistQueryCache);
  
  // Persist cache periodically
  setInterval(persistQueryCache, 30000); // Every 30 seconds
}
