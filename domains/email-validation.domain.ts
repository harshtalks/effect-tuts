import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApi,
  OpenApi,
  HttpApiBuilder,
  HttpMiddleware,
  HttpServer,
  HttpApiError,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { Effect, Layer } from "effect";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

const EmailValidationResultPair = Schema.Struct({
  value: Schema.Boolean,
  text: Schema.String,
});
