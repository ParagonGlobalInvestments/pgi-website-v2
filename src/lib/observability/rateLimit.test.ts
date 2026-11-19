import { checkRateLimitWindow, createRateLimiter } from './rateLimit';

const options = { limit: 2, windowMs: 1000 };

describe('checkRateLimitWindow', () => {
  it('opens a window on the first request', () => {
    expect(checkRateLimitWindow(undefined, 100, options)).toEqual({
      allowed: true,
      next: { count: 1, resetTime: 1100 },
    });
  });

  it('counts requests inside an open window', () => {
    expect(
      checkRateLimitWindow({ count: 1, resetTime: 1100 }, 500, options)
    ).toEqual({ allowed: true, next: { count: 2, resetTime: 1100 } });
  });

  it('blocks at the limit without changing the window', () => {
    const entry = { count: 2, resetTime: 1100 };
    expect(checkRateLimitWindow(entry, 500, options)).toEqual({
      allowed: false,
      next: entry,
    });
  });

  it('still blocks exactly at resetTime and reopens after it', () => {
    const entry = { count: 2, resetTime: 1100 };
    expect(checkRateLimitWindow(entry, 1100, options).allowed).toBe(false);
    expect(checkRateLimitWindow(entry, 1101, options)).toEqual({
      allowed: true,
      next: { count: 1, resetTime: 2101 },
    });
  });
});

describe('createRateLimiter', () => {
  it('limits each key independently and resets after the window', () => {
    const check = createRateLimiter(options);

    expect(check('a', 0)).toBe(true);
    expect(check('a', 10)).toBe(true);
    expect(check('a', 20)).toBe(false);
    expect(check('b', 20)).toBe(true);
    expect(check('a', 1001)).toBe(true);
  });

  it('keeps separate stores per limiter', () => {
    const first = createRateLimiter({ limit: 1, windowMs: 1000 });
    const second = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(first('a', 0)).toBe(true);
    expect(first('a', 1)).toBe(false);
    expect(second('a', 1)).toBe(true);
  });
});
