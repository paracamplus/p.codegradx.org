// -*- coding: utf-8 -*-

// Writable stores to hold common global values

import { writable } from 'svelte/store';
export const person = writable(undefined);
export const campaign = writable(undefined);
export const current_exercise = writable(undefined);
export const config = writable({});
export const lastmessage = writable(undefined);
export const markFactor = writable(100);

// end of stores.mjs
