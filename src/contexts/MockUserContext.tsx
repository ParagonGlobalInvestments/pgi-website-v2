'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserRole, UserProgram } from '@/types';
import {
  INACTIVE_MOCK,
  parseStoredMock,
  toStoredMock,
  type MockState,
} from '@/lib/mockMode';

export type { MockState } from '@/lib/mockMode';

const STORAGE_KEY = 'pgi-mock-user';

interface MockUserContextValue {
  mock: MockState;
  startMock: (role: UserRole, program: UserProgram | null) => void;
  /** Change the previewed role/program. No-op while inactive. */
  updateMock: (partial: {
    role?: UserRole;
    program?: UserProgram | null;
  }) => void;
  stopMock: () => void;
}

const MockUserContext = createContext<MockUserContextValue>({
  mock: INACTIVE_MOCK,
  startMock: () => {},
  updateMock: () => {},
  stopMock: () => {},
});

function loadFromStorage(): MockState {
  if (typeof window === 'undefined') return INACTIVE_MOCK;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INACTIVE_MOCK;
    return parseStoredMock(JSON.parse(raw));
  } catch {
    // corrupted — clear it
    localStorage.removeItem(STORAGE_KEY);
    return INACTIVE_MOCK;
  }
}

function saveToStorage(state: MockState) {
  if (typeof window === 'undefined') return;
  if (state.status === 'active') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStoredMock(state)));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function MockUserProvider({ children }: { children: ReactNode }) {
  const [mock, setMock] = useState<MockState>(INACTIVE_MOCK);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setMock(loadFromStorage());
  }, []);

  const startMock = useCallback(
    (role: UserRole, program: UserProgram | null) => {
      const next: MockState = { status: 'active', role, program };
      setMock(next);
      saveToStorage(next);
    },
    []
  );

  const updateMock = useCallback(
    (partial: { role?: UserRole; program?: UserProgram | null }) => {
      setMock(prev => {
        if (prev.status !== 'active') return prev;
        const next: MockState = { ...prev, ...partial };
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const stopMock = useCallback(() => {
    setMock(INACTIVE_MOCK);
    saveToStorage(INACTIVE_MOCK);
  }, []);

  return (
    <MockUserContext.Provider value={{ mock, startMock, updateMock, stopMock }}>
      {children}
    </MockUserContext.Provider>
  );
}

export function useMockUser() {
  return useContext(MockUserContext);
}
