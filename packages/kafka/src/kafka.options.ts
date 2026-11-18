import { Transport, type KafkaOptions } from '@nestjs/microservices';
import {
  KAFKA_DEFAULT_BROKERS,
  KAFKA_DEFAULT_CLIENT_ID,
  KAFKA_DEFAULT_GROUP_ID,
} from './kafka.constants.js';

export type KafkaTransportOptions = NonNullable<KafkaOptions['options']>;

/**
 * Builds the options object accepted by `NestFactory.createMicroservice`,
 * `app.connectMicroservice` and `ClientsModule`. Defaults are applied to
 * `client.brokers`, `client.clientId` and `consumer.groupId`; nested `client`
 * and `consumer` objects are merged rather than replaced.
 */
export function createKafkaOptions(options: KafkaTransportOptions = {}): KafkaOptions {
  return {
    transport: Transport.KAFKA,
    options: {
      ...options,
      client: {
        brokers: KAFKA_DEFAULT_BROKERS,
        clientId: KAFKA_DEFAULT_CLIENT_ID,
        ...options.client,
      },
      consumer: {
        groupId: KAFKA_DEFAULT_GROUP_ID,
        ...options.consumer,
      },
    },
  };
}

/**
 * Reads connection details from environment variables
 * (`KAFKA_BROKERS` comma separated, `KAFKA_CLIENT_ID`, `KAFKA_GROUP_ID`).
 */
export function kafkaOptionsFromEnv(
  env: Record<string, string | undefined> = process.env,
): KafkaTransportOptions {
  const brokers = env['KAFKA_BROKERS']
    ?.split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
  const clientId = env['KAFKA_CLIENT_ID'];
  const groupId = env['KAFKA_GROUP_ID'];
  return {
    ...(brokers?.length || clientId
      ? { client: { ...(brokers?.length && { brokers }), ...(clientId && { clientId }) } }
      : {}),
    ...(groupId ? { consumer: { groupId } } : {}),
  } as KafkaTransportOptions;
}
