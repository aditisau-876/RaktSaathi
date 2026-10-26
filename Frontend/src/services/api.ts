
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1'
).replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const responseText = await response.text();

  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    let message = `Request failed with HTTP ${response.status}.`;

    if (payload && typeof payload === 'object') {
      const errorPayload = payload as {
        detail?: unknown;
        message?: unknown;
      };

      const detail = errorPayload.detail ?? errorPayload.message;

      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((item) => {
            if (item && typeof item === 'object') {
              const error = item as {
                msg?: string;
                loc?: unknown[];
              };

              const location = error.loc?.join('.');
              return location
                ? `${location}: ${error.msg ?? 'Invalid value'}`
                : error.msg ?? 'Invalid value';
            }

            return String(item);
          })
          .join('; ');
      }
    } else if (typeof payload === 'string' && payload.trim()) {
      message = payload;
    }

    throw new ApiError(message, response.status, payload);
  }

  if (response.status === 204 || !responseText) {
    return undefined as T;
  }

  return payload as T;
}

export const api = {
  get<T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'POST', body });
  },

  patch<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },

  put<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },

  delete<T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};

export { API_BASE_URL };
