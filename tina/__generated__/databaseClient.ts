// @ts-nocheck
import { resolve } from "@tinacms/datalayer";
import type { TinaClient } from "tinacms/dist/client";

import { queries } from "./types.js";
import database from "../database";

function toPlain(value) {
  if (Array.isArray(value)) {
    return value.map(toPlain);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== null && proto !== Object.prototype) {
    return value;
  }
  const out = {};
  for (const key of Object.keys(value)) {
    out[key] = toPlain(value[key]);
  }
  return out;
}

export async function databaseRequest({ query, variables, user, isSignIn }) {
  const result = await resolve({
    config: {
      useRelativeMedia: true,
    },
    database,
    query,
    variables,
    verbose: true,
    ctxUser: user,
    isSignIn,
  });

  return toPlain(result);
}

export async function authenticate({ username, password }) {
    return databaseRequest({
      query: `query auth($username:String!, $password:String!) {
              authenticate(sub:$username, password:$password) {
               
              }
            }`,
      variables: { username, password },
      isSignIn: true,
    })
}

export async function authorize(user: { sub: string }) {
  return databaseRequest({
    query: `query authz { authorize { } }`,
    variables: {},
    user
  })
}

function createDatabaseClient<GenQueries = Record<string, unknown>>({
  queries,
}: {
  queries: (client: {
    request: TinaClient<GenQueries>["request"];
  }) => GenQueries;
}) {
  const request = async ({ query, variables, user }) => {
    const data = await databaseRequest({ query, variables, user });
    return { data: data.data as any, query, variables, errors: data.errors || null };
  };
  const q = queries({
    request,
  });
  return { queries: q, request, authenticate, authorize };
}

export const databaseClient = createDatabaseClient({ queries });

export const client = databaseClient;

export default databaseClient;
