"use client";

import { useSyncExternalStore } from "react";
import { isoDate } from "./booking";

const noop = () => () => {};

/** Today's date as YYYY-MM-DD in the browser; empty during prerender so Cache Components stays static. */
export function useToday() {
  return useSyncExternalStore(noop, () => isoDate(new Date()), () => "");
}
