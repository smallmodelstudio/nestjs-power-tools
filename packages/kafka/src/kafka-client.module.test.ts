import { KafkaClientModule } from './kafka-client.module.js';

describe('KafkaClientModule', () => {
  it('registers a named client', () => {
    const mod = KafkaClientModule.register({ name: 'KAFKA' });
    expect(mod.module).toBeDefined();
    expect(mod.providers?.length).toBe(1);
  });

  it('registers an async client', () => {
    const mod = KafkaClientModule.registerAsync({ name: 'KAFKA', useFactory: () => ({}) });
    expect(mod.exports).toBeDefined();
  });
});
