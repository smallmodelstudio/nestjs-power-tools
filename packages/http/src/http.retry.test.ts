import axios, { AxiosError, type AxiosAdapter } from 'axios';
import { attachRetry } from './http.retry.js';

/** Adapter that fails with the given statuses (0 = network error) then succeeds. */
function flaky(failures: number[]) {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    const status = failures[calls++];
    if (status === undefined) {
      return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config };
    }
    const response =
      status === 0 ? undefined : { data: null, status, statusText: '', headers: {}, config };
    throw new AxiosError(
      'fail',
      status === 0 ? 'ERR_NETWORK' : 'ERR_BAD_RESPONSE',
      config,
      null,
      response,
    );
  };
  return { adapter, calls: () => calls };
}

describe('attachRetry', () => {
  it('retries 5xx until success', async () => {
    const { adapter, calls } = flaky([503, 500]);
    const client = attachRetry(axios.create({ adapter }), { delay: 0 });
    expect((await client.get('/x')).data).toBe('ok');
    expect(calls()).toBe(3);
  });

  it('retries network errors', async () => {
    const { adapter, calls } = flaky([0]);
    const client = attachRetry(axios.create({ adapter }), { delay: 0 });
    await client.get('/x');
    expect(calls()).toBe(2);
  });

  it('gives up after the configured retries', async () => {
    const { adapter, calls } = flaky([500, 500, 500, 500, 500]);
    const client = attachRetry(axios.create({ adapter }), { delay: 0, retries: 2 });
    await expect(client.get('/x')).rejects.toThrow('fail');
    expect(calls()).toBe(3);
  });

  it('does not retry 4xx', async () => {
    const { adapter, calls } = flaky([404]);
    const client = attachRetry(axios.create({ adapter }), { delay: 0 });
    await expect(client.get('/x')).rejects.toThrow();
    expect(calls()).toBe(1);
  });

  it('does not retry POST by default', async () => {
    const { adapter, calls } = flaky([500]);
    const client = attachRetry(axios.create({ adapter }), { delay: 0 });
    await expect(client.post('/x')).rejects.toThrow();
    expect(calls()).toBe(1);
  });

  it('retries POST when allowed and reports onRetry', async () => {
    const { adapter } = flaky([500]);
    const onRetry = vi.fn();
    const client = attachRetry(axios.create({ adapter }), {
      delay: 0,
      methods: ['post'],
      onRetry,
    });
    await client.post('/x');
    expect(onRetry).toHaveBeenCalledWith(expect.any(AxiosError), 1, 0);
  });

  it('honours a custom shouldRetry', async () => {
    const { adapter, calls } = flaky([418]);
    const client = attachRetry(axios.create({ adapter }), {
      delay: 0,
      shouldRetry: (e) => e.response?.status === 418,
    });
    await client.get('/x');
    expect(calls()).toBe(2);
  });
});
