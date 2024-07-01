import type { Load } from "@sveltejs/kit";
import { createToken } from "$lib/token.server";
import { redirect } from '@sveltejs/kit';

// We generate the token on the server side to not leak our clientSecret

export const load: Load = async ({ url }) => {
  const origin = url.origin;
  const token = await createToken({ mode: 'embedded', origin });
  return { token };
}

export function _move() {
  // ...
  redirect(302, '/http'); // needs `throw` in v1
}