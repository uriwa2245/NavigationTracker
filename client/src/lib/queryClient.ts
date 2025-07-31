import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// API base URL - works for both development and production
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL for same domain
    return '';
  }
  // Server-side: use environment variable or default
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000';
};

export const apiRequest = async (
  method: string,
  endpoint: string,
  data?: any
): Promise<any> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
