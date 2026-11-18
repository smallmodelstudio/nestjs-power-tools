# @nestjs-power-tools/kafka

Helpers for the [NestJS Kafka transport](https://docs.nestjs.com/microservices/kafka): server options, a client module and bootstrap functions.

## Install

```bash
pnpm add @nestjs-power-tools/kafka @nestjs/microservices kafkajs
```

Peers: `@nestjs/common`, `@nestjs/core`, `@nestjs/microservices` (>=11), `kafkajs` (>=2).

## Quick start

**Server** (`main.ts`)

```ts
import { createKafkaMicroservice, kafkaOptionsFromEnv } from '@nestjs-power-tools/kafka';

const app = await createKafkaMicroservice(AppModule, kafkaOptionsFromEnv());
await app.listen();
```

**Hybrid app** (HTTP + Kafka)

```ts
import { connectKafkaMicroservice } from '@nestjs-power-tools/kafka';

const app = await NestFactory.create(AppModule);
connectKafkaMicroservice(app, { client: { brokers: ['kafka:9092'] } });
await app.startAllMicroservices();
await app.listen(3000);
```

**Client**

```ts
@Module({
  imports: [
    KafkaClientModule.register({
      name: 'KAFKA',
      options: { client: { brokers: ['kafka:9092'] }, consumer: { groupId: 'orders-client' } },
    }),
  ],
})
export class AppModule {}

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectKafkaClient('KAFKA') private readonly client: ClientKafka) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('orders.create'); // request/response patterns only
    await this.client.connect();
  }
}
```

Use `KafkaClientModule.registerAsync({ name, useFactory, inject, imports })` to build options from `ConfigService`.

## API

| Export                                   | What it does                                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createKafkaOptions(options?)`           | Returns `{ transport: Transport.KAFKA, options }`. Defaults: brokers `localhost:9092`, clientId `nestjs-kafka`, groupId `nestjs-kafka-consumer`. `client` and `consumer` are merged with the defaults. |
| `kafkaOptionsFromEnv(env?)`              | Reads `KAFKA_BROKERS` (comma-separated), `KAFKA_CLIENT_ID`, `KAFKA_GROUP_ID`.                                                                                                                          |
| `KafkaClientModule.register/Async`       | `ClientsModule` pre-set to the Kafka transport. Accepts `isGlobal`.                                                                                                                                    |
| `createKafkaMicroservice(module, opts?)` | Wraps `NestFactory.createMicroservice`.                                                                                                                                                                |
| `connectKafkaMicroservice(app, opts?)`   | Wraps `app.connectMicroservice` with `inheritAppConfig: true`.                                                                                                                                         |
| `InjectKafkaClient(name)`                | Shorthand for `@Inject(name)`.                                                                                                                                                                         |

## Good to know

- Give each service its own consumer `groupId`; services sharing one split the messages between them.
- The helpers do not connect the client for you (see `onModuleInit` above).
