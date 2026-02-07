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

const STORAGE_KEY = 'pgi-mock-user';

interface MockState {
  isActive: boolean;
  role: UserRole;
  program: UserProgram | null;
}

interface MockUserContextValue {
  mock: MockState;
  startMock: (role: UserRole, program: UserProgram | null) => void;
  updateMock: (partial: Partial<Pick<MockState, 'role' | 'program'>>) => void;
  stopMock: () => void;
}

const defaultMock: MockState = {
  isActive: false,
  role: 'analyst',
  program: null,
};

const MockUserContext = createContext<MockUserContextValue>({
  mock: defaultMock,
  startMock: () => {},
  updateMock: () => {},
  stopMock: () => {},
});

function loadFromStorage(): MockState {
  if (typeof window === 'undefined') return defaultMock;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMock;
    const parsed = JSON.parse(raw) as MockState;
    if (parsed.isActive && parsed.role) return parsed;
  } catch {
    // corrupted — clear it
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultMock;
}

function saveToStorage(state: MockState) {
  if (typeof window === 'undefined') return;
  if (state.isActive) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function MockUserProvider({ children }: { children: ReactNode }) {
  const [mock, setMock] = useState<MockState>(defaultMock);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setMock(loadFromStorage());
  }, []);

  const startMock = useCallback(
    (role: UserRole, program: UserProgram | null) => {
      const next: MockState = { isActive: true, role, program };
      setMock(next);
      saveToStorage(next);
    },
    []
  );

  const updateMock = useCallback(
    (partial: Partial<Pick<MockState, 'role' | 'program'>>) => {
      setMock(prev => {
        const next = { ...prev, ...partial };
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const stopMock = useCallback(() => {
    setMock(defaultMock);
    saveToStorage(defaultMock);
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
