import { Context, Effect } from "effect";

class Random extends Context.Tag("Random")<
  Random,
  {
    readonly num: Effect.Effect<number>;
  }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  {
    readonly log: (message: string) => Effect.Effect<void>;
  }
>() {}

const program = Effect.all([Random, Logger]).pipe(
  Effect.andThen(([random, logger]) =>
    random.num.pipe(
      Effect.andThen((randomNumber) => {
        return logger.log(`Random number: ${randomNumber}`);
      }),
    ),
  ),
);

const runnable1 = program.pipe(
  Effect.provideService(Random, {
    num: Effect.sync(() => Math.random()),
  }),
  Effect.provideService(Logger, {
    log: (message) => Effect.sync(() => console.log(message)),
  }),
);

const context = Context.empty().pipe(
  Context.add(Random, {
    num: Effect.sync(() => Math.random()),
  }),
  Context.add(Logger, {
    log: (message) => Effect.sync(() => console.log(message)),
  }),
);

const runnable2 = program.pipe(Effect.provide(context));

runnable1.pipe(Effect.runSync);
runnable2.pipe(Effect.runSync);
