import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

const config = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  // Read invalidations directly so CMS edits do not wait on a regional cache.
  tagCache: doShardedTagCache({ baseShardSize: 1, regionalCache: false }),
});

// Invoke Next directly so OpenNext does not recursively call the build script.
config.buildCommand = 'npx next build';

export default config;
