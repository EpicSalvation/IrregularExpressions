async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  if (!res.ok && res.status !== 401) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res;
}

export async function fetchCurrentUser() {
  const res = await apiFetch('/auth/me');
  if (res.status === 401) return null;
  return res.json();
}

export async function login(email, password, rememberMe = false) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });
  return res.json();
}

export async function register(handle, email, password) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ handle, email, password }),
  });
  return res.json();
}

export async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function fetchProgress() {
  const res = await apiFetch('/api/progress');
  if (res.status === 401) return null;
  return res.json();
}

export async function pushProgress(progress) {
  await apiFetch('/api/progress', {
    method: 'PUT',
    body: JSON.stringify(progress),
  });
}
