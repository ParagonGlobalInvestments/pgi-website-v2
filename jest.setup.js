// Add Jest extended assertions
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Clerk auth hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    isLoaded: true,
    user: {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      publicMetadata: {
        role: 'member',
        track: 'value',
        chapter: 'Yale University',
      },
    },
  })),
  useAuth: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
  })),
  UserButton: props => <div data-testid="user-button" {...props} />,
  SignIn: props => <div data-testid="sign-in" {...props} />,
  SignUp: props => <div data-testid="sign-up" {...props} />,
}));

// Set up global fetch mock for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    statusText: 'OK',
  })
);
