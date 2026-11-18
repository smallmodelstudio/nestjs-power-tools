import { Inject } from '@nestjs/common';

/** Shorthand for `@Inject(name)` on a client registered via `KafkaClientModule`. */
export const InjectKafkaClient = (name: string | symbol) => Inject(name);
