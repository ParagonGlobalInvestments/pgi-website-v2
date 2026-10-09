import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Preview serves build-time snapshots. Add writable ISR caching before cutover.
const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});

// Invoke Next directly so OpenNext does not recursively call the build script.
config.buildCommand = 'npx next build';

export default config;
