const TOKEN_KEY = 'clarityroom_token';

export const authStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  set: (token, remember = true) => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

export async function api(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = authStore.get();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Something went wrong.');
  }

  return payload;
}
