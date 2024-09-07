// service implementation

import { Context, Effect } from "effect";

// dep declaration

class RandomNumber extends Context.Tag("randomNumber")<
  RandomNumber,
  {
    readonly number: Effect.Effect<number>;
  }
>() {}

// dep consumptioon,provision
const programGen = Effect.gen(function* () {
  const random = yield* RandomNumber;
  const randomNumber = yield* random.number;
  return randomNumber;
});

const programPipe = RandomNumber.pipe(
  Effect.andThen((el) => el.number),
  Effect.andThen((el) => el),
);

const runnable = Effect.provideService(programGen, RandomNumber, {
  number: Effect.sync(() => 42),
});

runnable.pipe(
  Effect.andThen((el) => console.log(el)),
  Effect.runSync,
);
