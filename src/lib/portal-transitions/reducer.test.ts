import { canStart, getSequence, portalTransitionReducer } from './reducer';
import { TIMING } from './config';
import type {
  MachineEffect,
  MachineEvent,
  MachineState,
  TransitionFlow,
} from './types';

const idle: MachineState = { _tag: 'idle' };

/** Start a flow and ADVANCE until it completes, collecting every step */
function run(flow: TransitionFlow, mobile: boolean) {
  const steps: [MachineState['_tag'], MachineEffect][] = [];
  let [state, effect] = portalTransitionReducer(idle, {
    type: 'START',
    flow,
    mobile,
    userName: 'Ada',
  });
  steps.push([state._tag, effect]);
  while (effect.type === 'SCHEDULE_ADVANCE') {
    [state, effect] = portalTransitionReducer(state, { type: 'ADVANCE' });
    steps.push([state._tag, effect]);
  }
  return { steps, state };
}

const total = (steps: [string, MachineEffect][]) =>
  steps.reduce(
    (ms, [, e]) => ms + (e.type === 'SCHEDULE_ADVANCE' ? e.delayMs : 0),
    0
  );

describe('portalTransitionReducer', () => {
  it('entrance:login on desktop skips the zero-length hold and navigates at 1400ms', () => {
    const { steps, state } = run('entrance:login', false);
    expect(steps.map(([tag]) => tag)).toEqual([
      'navy-fill',
      'panel-slide',
      'complete',
    ]);
    expect(total(steps)).toBe(TIMING.loginEntry.desktopTotal);
    expect(steps.at(-1)?.[1]).toEqual({
      type: 'NAVIGATE',
      path: '/portal/login',
      mode: 'push',
    });
    expect(state._tag).toBe('complete');
  });

  it('entrance:login on mobile holds with the logo and navigates at 800ms', () => {
    const { steps } = run('entrance:login', true);
    expect(steps.map(([tag]) => tag)).toEqual([
      'navy-fill',
      'navy-hold',
      'panel-slide',
      'complete',
    ]);
    expect(total(steps)).toBe(TIMING.loginEntry.mobileTotal);
  });

  it('entrance:portal compresses then does a full-page navigation', () => {
    for (const mobile of [false, true]) {
      const { steps } = run('entrance:portal', mobile);
      expect(steps.map(([tag]) => tag)).toEqual(['compress', 'complete']);
      expect(total(steps)).toBe(
        mobile ? TIMING.portalEntry.mobile : TIMING.portalEntry.desktop
      );
      expect(steps.at(-1)?.[1]).toMatchObject({
        type: 'NAVIGATE',
        path: '/portal?entrance=true',
        mode: 'href',
      });
    }
  });

  it('login:morph carries the user name and leaves navigation to the caller', () => {
    const [greeting] = portalTransitionReducer(idle, {
      type: 'START',
      flow: 'login:morph',
      mobile: false,
      userName: 'Ada',
    });
    expect(greeting).toMatchObject({ _tag: 'greeting', userName: 'Ada' });
    const { steps } = run('login:morph', false);
    expect(steps.map(([tag]) => tag)).toEqual([
      'greeting',
      'morph',
      'complete',
    ]);
    expect(steps.at(-1)?.[1]).toEqual({ type: 'NONE' });
  });

  it('exit flows expand then navigate to the public site', () => {
    for (const flow of ['exit:back', 'exit:logout'] as const) {
      const { steps } = run(flow, false);
      expect(steps.map(([tag]) => tag)).toEqual(['expand', 'complete']);
      expect(steps.at(-1)?.[1]).toMatchObject({
        type: 'NAVIGATE',
        mode: 'href',
      });
    }
  });

  it('rejects START while a flow is running', () => {
    const [running] = portalTransitionReducer(idle, {
      type: 'START',
      flow: 'exit:back',
      mobile: false,
    });
    const [next, effect] = portalTransitionReducer(running, {
      type: 'START',
      flow: 'exit:logout',
      mobile: false,
    });
    expect(next).toBe(running);
    expect(effect).toEqual({ type: 'NONE' });
  });

  it('accepts START from a completed flow', () => {
    const { state } = run('login:morph', false);
    expect(canStart(state)).toBe(true);
    const [next] = portalTransitionReducer(state, {
      type: 'START',
      flow: 'exit:back',
      mobile: false,
    });
    expect(next).toMatchObject({ _tag: 'expand', flow: 'exit:back' });
  });

  it('settles a router.push flow to idle on ROUTE_CHANGED, but not others', () => {
    const routeChanged: MachineEvent = { type: 'ROUTE_CHANGED' };
    const login = run('entrance:login', false).state;
    expect(portalTransitionReducer(login, routeChanged)[0]).toEqual(idle);

    const morph = run('login:morph', false).state;
    expect(portalTransitionReducer(morph, routeChanged)[0]).toBe(morph);

    const [midFlow] = portalTransitionReducer(idle, {
      type: 'START',
      flow: 'entrance:login',
      mobile: false,
    });
    expect(portalTransitionReducer(midFlow, routeChanged)[0]).toBe(midFlow);
  });

  it('CANCEL returns to idle from anywhere', () => {
    const { state } = run('entrance:portal', true);
    expect(portalTransitionReducer(state, { type: 'CANCEL' })[0]).toEqual(idle);
  });

  it('every entered phase has a positive duration', () => {
    const flows: TransitionFlow[] = [
      'entrance:login',
      'entrance:portal',
      'login:morph',
      'exit:logout',
      'exit:back',
    ];
    for (const flow of flows) {
      for (const mobile of [false, true]) {
        const { steps } = run(flow, mobile);
        for (const [tag, effect] of steps) {
          if (tag === 'complete') continue;
          expect(effect.type).toBe('SCHEDULE_ADVANCE');
        }
        expect(getSequence(flow, mobile).at(-1)).toBe('complete');
      }
    }
  });
});
