import { PinoLogger } from './pino-logger.service.js';
import { PinoLoggerModule } from './pino-logger.module.js';

describe('PinoLoggerModule', () => {
  it('is global by default and exports PinoLogger', () => {
    const mod = PinoLoggerModule.forRoot();
    expect(mod.global).toBe(true);
    expect(mod.exports).toContain(PinoLogger);
  });
});
