const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const braces = require('../vendor/braces');

assert.deepEqual(braces.expand('src/{app,components}/**/*.{ts,tsx}'), [
  'src/app/**/*.ts', 'src/app/**/*.tsx',
  'src/components/**/*.ts', 'src/components/**/*.tsx',
]);
assert.deepEqual(braces.expand('file-{01..03}.ts'), [
  'file-01.ts', 'file-02.ts', 'file-03.ts',
]);
assert.deepEqual(braces.expand('a/{b,{c,d}}/e'), ['a/b/e', 'a/c/e', 'a/d/e']);
assert.equal(braces.compile('a/{b,c}/d'), 'a/(b|c)/d');
assert.equal(braces.stringify('a/{b,c}/d'), 'a/{b,c}/d');
assert.deepEqual(braces.expand('a/\\{b,c\\}/d'), ['a/{b,c}/d']);
assert.deepEqual(braces.expand('${a,b}'), ['${a,b}']);

const nested = depth => '{'.repeat(depth) + 'a,b' + '}'.repeat(depth);
const isDepthError = error => error instanceof SyntaxError && /maximum nesting depth/.test(error.message);
for (const operation of ['parse', 'compile', 'expand', 'stringify']) {
  assert.doesNotThrow(() => braces[operation](nested(20)));
  for (const pattern of [nested(1000), '{'.repeat(1000), '('.repeat(1000) + 'x' + ')'.repeat(1000)]) {
    assert.throws(() => braces[operation](pattern), isDepthError);
  }
  assert.throws(() => braces[operation](nested(1000), { maxDepth: Infinity }), isDepthError);
}

// Public walkers also accept ASTs, bypassing the parser.
for (const operation of ['compile', 'expand', 'stringify']) {
  const root = { type: 'root', nodes: [] };
  let node = root;
  for (let i = 0; i < 1000; i++) {
    const child = { type: 'brace', nodes: [], parent: node, commas: 1 };
    node.nodes.push(child);
    node = child;
  }
  node.nodes.push({ type: 'text', value: 'x' });
  assert.throws(() => braces[operation](root), isDepthError);
}

for (const dependent of ['micromatch', 'chokidar']) {
  const requireFromDependent = createRequire(require.resolve(dependent));
  const installed = requireFromDependent('braces');
  assert.throws(() => installed.compile(nested(1000)), isDepthError);
}

console.log('braces security regression checks passed');
