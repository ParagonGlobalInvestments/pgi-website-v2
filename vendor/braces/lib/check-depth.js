'use strict';

// Bound recursion before AST walkers can exhaust the JavaScript stack.
module.exports = depth => {
  if (depth > 100) {
    throw new SyntaxError('Brace pattern exceeds maximum nesting depth (100)');
  }
};
