import { HttpService } from '@nestjs/axios';
import { HttpClientModule, createHttpService } from './http-client.module.js';

describe('HttpClientModule', () => {
  it('provides and exports HttpService', () => {
    const mod = HttpClientModule.register({ isGlobal: true });
    expect(mod.global).toBe(true);
    expect(mod.exports).toContain(HttpService);
  });

  it('only installs a retry interceptor when retry is set', () => {
    const count = (s: HttpService) =>
      (s.axiosRef.interceptors.response as unknown as { handlers: unknown[] }).handlers.length;
    expect(count(createHttpService())).toBe(0);
    expect(count(createHttpService({ retry: {} }))).toBe(1);
    expect(count(createHttpService({ retry: false }))).toBe(0);
  });
});
