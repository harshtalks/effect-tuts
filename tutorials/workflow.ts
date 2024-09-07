// workflow example
// 1. s3
// 2. elastic
// 3. DB Entry

import { Context, Data, Effect, Layer, Console } from "effect";

// services

class S3Error extends Data.TaggedError("s3Error") {}
class ElasticError extends Data.TaggedError("elasticError") {}
class DBError extends Data.TaggedError("dbError") {}

interface Bucket {
  id: string;
}

class S3 extends Context.Tag("S3")<
  S3,
  {
    readonly createBucket: Effect.Effect<Bucket, S3Error>;
    readonly deleteBucket: (bucket: Bucket) => Effect.Effect<void>;
  }
>() {}

interface ElasticIndex {
  index: string;
}

class Elastic extends Context.Tag("Elastic")<
  Elastic,
  {
    readonly createIndex: Effect.Effect<ElasticIndex, ElasticError>;
    readonly deleteIndex: (index: ElasticIndex) => Effect.Effect<void>;
  }
>() {}

interface DBEntry {
  entry: string;
}

class DB extends Context.Tag("DB")<
  DB,
  {
    readonly createEntry: (
      bucket: Bucket,
      index: ElasticIndex,
    ) => Effect.Effect<DBEntry, DBError>;
    readonly deleteEntry: (entry: DBEntry) => Effect.Effect<void>;
  }
>() {}

const createBucket = S3.pipe(
  Effect.andThen(({ createBucket, deleteBucket }) => {
    return Effect.acquireRelease(createBucket, (bucket, exit) => {
      return Effect.isFailure(exit) ? deleteBucket(bucket) : Effect.void;
    });
  }),
);

const createIndex = Elastic.pipe(
  Effect.andThen(({ createIndex, deleteIndex }) => {
    return Effect.acquireRelease(createIndex, (index, exit) => {
      return Effect.isFailure(exit) ? deleteIndex(index) : Effect.void;
    });
  }),
);

const createEntry = (bucket: Bucket, index: ElasticIndex) =>
  DB.pipe(
    Effect.andThen(({ createEntry, deleteEntry }) => {
      return Effect.acquireRelease(
        createEntry(bucket, index),
        (entry, exit) => {
          return Effect.isFailure(exit) ? deleteEntry(entry) : Effect.void;
        },
      );
    }),
  );

// we got three of our resources set up with scope

const make = Effect.scoped(
  Effect.Do.pipe(
    Effect.bind("bucket", () => createBucket),
    Effect.bind("index", () => createIndex),
    Effect.andThen(({ bucket, index }) => createEntry(bucket, index)),
  ),
);

// Testing it out

type FailureCaseLiterals = "S3" | "ElasticSearch" | "Database" | undefined;
class FailureCase extends Context.Tag("FailureCase")<
  FailureCase,
  FailureCaseLiterals
>() {}

const S3Test = Layer.effect(S3);
