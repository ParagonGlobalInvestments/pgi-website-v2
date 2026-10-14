// Custom Worker entry: wraps the OpenNext handler and adds the cron trigger
// configured in wrangler.jsonc. Excluded from tsc; wrangler bundles it after
// `opennextjs-cloudflare build` generates .open-next/worker.js.

// @ts-expect-error: generated at build time
import { default as handler } from './.open-next/worker.js';

interface Env {
  CRON_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  fetch: handler.fetch,

  async scheduled(_controller: unknown, env: Env, ctx: ExecutionContext) {
    const origin = env.NEXT_PUBLIC_APP_URL || 'https://paragoninvestments.org';
    const request = new Request(`${origin}/api/cron/cleanup-observability`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });

    const response = await handler.fetch(request, env, ctx);
    if (!response.ok) {
      throw new Error(
        `[cron/cleanup] ${response.status}: ${await response.text()}`
      );
    }
  },
};

// @ts-expect-error: generated at build time
export { DOQueueHandler, DOShardedTagCache } from './.open-next/worker.js';
