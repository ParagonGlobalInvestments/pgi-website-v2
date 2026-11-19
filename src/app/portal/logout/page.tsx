'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { usePortalTransition } from '@/lib/portal-transitions';
import { NAVY, LAYOUT } from '@/lib/portal-transitions/config';
import type { MachineTag, TransitionFlow } from '@/lib/portal-transitions';
import { SITE_URL } from '@/components/portal/constants';

/** If the exit animation hasn't navigated by then, leave anyway */
const FALLBACK_MS = 2000;

/**
 * signingOut → exiting → navigated
 * - signingOut: waiting for Supabase to end the session
 * - exiting: the exit:logout flow is (or should be) expanding the navy panel
 * - navigated: the flow completed and sent the browser to SITE_URL
 */
type LogoutPhase = 'signingOut' | 'exiting' | 'navigated';

function getLogoutPhase(
  signOutSettled: boolean,
  tag: MachineTag,
  flow: TransitionFlow | null
): LogoutPhase {
  if (flow === 'exit:logout' && tag === 'complete') return 'navigated';
  return signOutSettled ? 'exiting' : 'signingOut';
}

export default function LogoutPage() {
  const supabase = createClient();
  const { start, tag, flow } = usePortalTransition();
  const [signOutSettled, setSignOutSettled] = useState(false);

  // Synchronous mobile check — must be correct on first render
  const [mobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth < Number.parseInt(LAYOUT.mobileBreakpoint.toString())
      : false
  );

  const phase = getLogoutPhase(signOutSettled, tag, flow);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Immediately set body to navy so there's no white flash during logout
  useEffect(() => {
    document.documentElement.style.backgroundColor = NAVY.primary;
    document.body.style.backgroundColor = NAVY.primary;
  }, []);

  // signingOut → exiting
  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .signOut()
      .catch(error => console.error('Error logging out:', error))
      .finally(() => {
        if (!cancelled) setSignOutSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // exiting: run the exit:logout flow (NavyOverlay draws it; the machine
  // navigates to SITE_URL when it completes)
  useEffect(() => {
    if (phase === 'exiting') start('exit:logout', { mobile });
  }, [phase, start, mobile]);

  // Fallback: leave if the flow hasn't navigated (sign-out hung, or the
  // machine was busy and rejected the flow)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phaseRef.current !== 'navigated') window.location.href = SITE_URL;
    }, FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  // NavyOverlay renders at root layout level — this page returns nothing
  return null;
}
