import { ApiError, ApiResponse } from '@/lib/types/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let requestUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (!(options.body instanceof FormData) && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(requestUrl, {
      ...restOptions,
      headers: finalHeaders,
    });

    const contentType = res.headers.get('content-type');
    let data: unknown;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMessage =
        typeof data === 'object' && data !== null && 'error' in data
          ? String((data as ApiResponse).error)
          : typeof data === 'object' && data !== null && 'message' in data
          ? String((data as ApiResponse).message)
          : `HTTP Error ${res.status}: ${res.statusText}`;

      throw new ApiError({
        message: errorMessage,
        status: res.status,
        details: data,
      });
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError({
      message: err instanceof Error ? err.message : 'Network error occurred',
      status: 0,
      details: err,
    });
  }
}

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' }),

  upload: async <T>(url: string, formData: FormData, options?: RequestOptions): Promise<T> => {
    const { headers, ...restOptions } = options || {};
    const requestHeaders = { ...(headers || {}) };
    delete (requestHeaders as Record<string, string>)['Content-Type'];
    
    return request<T>(url, {
      ...restOptions,
      method: 'POST',
      body: formData,
      headers: requestHeaders,
    });
  },
};
