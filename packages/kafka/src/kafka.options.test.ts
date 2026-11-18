import { Transport } from '@nestjs/microservices';
import { createKafkaOptions, kafkaOptionsFromEnv } from './kafka.options.js';

describe('createKafkaOptions', () => {
  it('applies defaults', () => {
    expect(createKafkaOptions()).toEqual({
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'], clientId: 'nestjs-kafka' },
        consumer: { groupId: 'nestjs-kafka-consumer' },
      },
    });
  });

  it('merges nested overrides', () => {
    const { options } = createKafkaOptions({
      client: { brokers: ['k:9092'] },
      consumer: { groupId: 'g' },
    });
    expect(options?.client).toEqual({ brokers: ['k:9092'], clientId: 'nestjs-kafka' });
    expect(options?.consumer?.groupId).toBe('g');
  });
});

describe('kafkaOptionsFromEnv', () => {
  it('maps env vars', () => {
    expect(
      kafkaOptionsFromEnv({ KAFKA_BROKERS: 'a:1, b:2', KAFKA_CLIENT_ID: 'c', KAFKA_GROUP_ID: 'g' }),
    ).toEqual({ client: { brokers: ['a:1', 'b:2'], clientId: 'c' }, consumer: { groupId: 'g' } });
  });

  it('returns nothing for an empty env', () => {
    expect(kafkaOptionsFromEnv({})).toEqual({});
  });
});
