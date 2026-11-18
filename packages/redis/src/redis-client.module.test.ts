import { RedisClientModule } from './redis-client.module.js';

describe('RedisClientModule', () => {
  it('registers a named client', () => {
    const mod = RedisClientModule.register({ name: 'REDIS' });
    expect(mod.module).toBeDefined();
    expect(mod.providers?.length).toBe(1);
  });

  it('registers an async client', () => {
    const mod = RedisClientModule.registerAsync({ name: 'REDIS', useFactory: () => ({}) });
    expect(mod.exports).toBeDefined();
  });
});
