// optional service

import { Context, Effect, Option } from "effect";

class Random extends Context.Tag("Random")<
  Random,
  {
    num: Effect.Effect<number>;
  }
>() {}

const program = Effect.serviceOption(Random).pipe(
  Effect.andThen((random) => {
    return Option.match(random, {
      onNone: () => Effect.succeed(0),
      onSome: (random) => random.num,
    });
  }),
  Effect.andThen((num) => console.log(num)),
);

// without service
program.pipe(Effect.runSync);
// with service
program.pipe(
  Effect.provideService(Random, {
    num: Effect.sync(() => Math.random()),
  }),
  Effect.runSync,
);
