/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as chatbot from "../chatbot.js";
import type * as connections from "../connections.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as memoryGames from "../memoryGames.js";
import type * as mood from "../mood.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as reminders from "../reminders.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  chatbot: typeof chatbot;
  connections: typeof connections;
  crons: typeof crons;
  http: typeof http;
  memoryGames: typeof memoryGames;
  mood: typeof mood;
  notifications: typeof notifications;
  profiles: typeof profiles;
  reminders: typeof reminders;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
