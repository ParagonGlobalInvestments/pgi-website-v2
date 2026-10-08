# Local braces security patch

This is the MIT-licensed `braces` 3.0.3 source from the npm registry, with its
original license retained. The package is private and named `@pgi/braces` to
distinguish it from the upstream release.

`package.json` overrides every transitive `braces` dependency with this copy.
CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm has no patched upstream release as of
2026-10-08. The local fix limits parser nesting and recursion in the compile,
expand, and stringify AST walkers to 100 levels, throwing `SyntaxError` before
the stack can overflow. Callers cannot disable the limit through options.

The only source changes are `lib/check-depth.js` and depth checks in
`lib/{parse,compile,expand,stringify}.js`. Run `bun run test:security` to check
ordinary globs, escaped patterns, ranges, and deeply nested strings and ASTs.

Remove this override and directory once an upstream patched release is available
and the regression checks pass against it. Do not replace this with an audit
exception: this copy contains the fix and must continue to receive upstream
security updates.
