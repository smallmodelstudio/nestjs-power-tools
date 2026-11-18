import { Writable } from 'node:stream';
import pino from 'pino';
import { PinoLogger } from './pino-logger.service.js';

function setup(level = 'trace') {
  const lines: Record<string, any>[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(JSON.parse(chunk.toString()));
      cb();
    },
  });
  const logger = new PinoLogger(pino({ level }, stream));
  return { logger, lines };
}

describe('PinoLogger', () => {
  it('maps log to info with context', () => {
    const { logger, lines } = setup();
    logger.log('hello', 'AppService');
    expect(lines[0]).toMatchObject({ level: 30, msg: 'hello', context: 'AppService' });
  });

  it('treats the error stack and context separately', () => {
    const { logger, lines } = setup();
    logger.error('boom', 'trace-here', 'Ctx');
    expect(lines[0]).toMatchObject({ level: 50, msg: 'boom', stack: 'trace-here', context: 'Ctx' });
  });

  it('serialises Error instances', () => {
    const { logger, lines } = setup();
    logger.error(new Error('bad'));
    expect(lines[0]?.['err']?.message).toBe('bad');
  });

  it('merges object messages', () => {
    const { logger, lines } = setup();
    logger.warn({ userId: 1 }, 'Ctx');
    expect(lines[0]).toMatchObject({ level: 40, userId: 1, context: 'Ctx' });
  });

  it('maps verbose to trace and fatal to fatal', () => {
    const { logger, lines } = setup();
    logger.verbose('v');
    logger.fatal('f');
    expect(lines.map((l) => l['level'])).toEqual([10, 60]);
  });

  it('child carries a default context', () => {
    const { logger, lines } = setup();
    logger.child('Child').log('x');
    expect(lines[0]?.['context']).toBe('Child');
  });

  it('setLogLevels adjusts the pino level', () => {
    const { logger, lines } = setup();
    logger.setLogLevels(['warn', 'error']);
    logger.log('hidden');
    logger.warn('shown');
    expect(lines).toHaveLength(1);
  });
});
