import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';

const values = new Map();
globalThis.window = new EventTarget();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};
const { axiosInstance: api, setAccessToken, getAccessToken, refreshAccessToken } = await import('../src/api/axios.ts');
const ok = (config, data = {}) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
const unauthorized = config => Promise.reject(new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null,
  { ...ok(config), status: 401 }));
const tick = () => new Promise(resolve => setImmediate(resolve));
beforeEach(() => setAccessToken('old'));

test('simultaneous API 401s and bootstrap share one refresh rotation', async () => {
  let refreshes = 0;
  api.defaults.adapter = async config => {
    if (config.url === '/api/v1/auth/refresh') {
      refreshes++;
      await tick();
      return ok(config, { accessToken: 'new' });
    }
    if (config.headers.Authorization === 'Bearer old') return unauthorized(config);
    return ok(config, { authorized: true });
  };
  const result = await Promise.all([api.get('/api/v1/orders/buying'), api.get('/api/v1/products/me'), refreshAccessToken()]);
  assert.equal(refreshes, 1);
  assert.equal(result[0].data.authorized, true);
  assert.equal(result[1].data.authorized, true);
});

test('late failure for an old token retries with current token without rotating again', async () => {
  let refreshes = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  api.defaults.adapter = async config => {
    if (config.url === '/api/v1/auth/refresh') {
      refreshes++;
      return ok(config, { accessToken: 'new' });
    }
    if (config.headers.Authorization === 'Bearer old') {
      if (config.url.endsWith('/slow')) await gate;
      return unauthorized(config);
    }
    return ok(config);
  };
  const slow = api.get('/api/v1/slow');
  await api.get('/api/v1/fast');
  release();
  await slow;
  assert.equal(refreshes, 1);
});

test('login rejection does not refresh a previous session', async () => {
  let refreshes = 0;
  api.defaults.adapter = config => {
    if (config.url.endsWith('/refresh')) refreshes++;
    return unauthorized(config);
  };
  await assert.rejects(api.post('/api/v1/auth/login', { usernameOrEmail: 'wrong', password: 'wrong' }));
  assert.equal(refreshes, 0);
});

test('queued requests retry once even if replacement token is rejected', async () => {
  let refreshes = 0;
  api.defaults.adapter = async config => {
    if (config.url.endsWith('/refresh')) {
      refreshes++;
      await tick();
      return ok(config, { accessToken: 'new' });
    }
    return unauthorized(config);
  };
  const results = await Promise.allSettled([api.get('/api/v1/one'), api.get('/api/v1/two')]);
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(refreshes, 1);
});

test('temporary network failure retains token; invalid refresh expires session', async () => {
  api.defaults.adapter = async config => { throw new AxiosError('Network Error', 'ERR_NETWORK', config); };
  await assert.rejects(refreshAccessToken());
  assert.equal(getAccessToken(), 'old');
  api.defaults.adapter = unauthorized;
  await assert.rejects(refreshAccessToken());
  assert.equal(getAccessToken(), null);
});

test('refresh arriving after local logout cannot restore access token', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  api.defaults.adapter = async config => {
    await gate;
    return ok(config, { accessToken: 'late-token' });
  };
  const refresh = refreshAccessToken();
  setAccessToken(null);
  release();
  await assert.rejects(refresh, /Session changed/);
  assert.equal(getAccessToken(), null);
});
