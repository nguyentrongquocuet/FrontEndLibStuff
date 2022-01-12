import React from 'react';

type TTransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

interface ITransitionProps {
  children: (state: TTransitionState) => React.ReactElement;
  show?: boolean;
  duration?: number;
  unmountOnExit?: boolean;
}

function isInEnterPhase(state?: TTransitionState) {
  return state === undefined || state === 'entered' || state === 'entering';
}

function isInExitPhase(state?: TTransitionState) {
  return state === 'exiting' || state === 'exited';
}

export default function Transition({
  children,
  show = false,
  duration = 2000,
  unmountOnExit = false,
}: ITransitionProps) {
  const lastState = React.useRef<TTransitionState>('exited');
  const [state, setState] = React.useState<TTransitionState>(() => (show ? 'entering' : 'exited'));

  const updateState = React.useCallback((newState: TTransitionState) => {
    setState(newState);
  }, []);

  React.useEffect(() => {
    const lS = lastState.current;
    let timeout: number;
    if (show) {
      if (isInEnterPhase(lS)) return;
      updateState('entering');
      timeout = window.setTimeout(() => {
        updateState('entered');
      }, duration);
    } else {
      if (isInExitPhase(lS)) return;
      updateState('exiting');
      timeout = window.setTimeout(() => {
        updateState('exited');
      }, duration);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      window.clearTimeout(timeout);
    };
  }, [show, updateState, duration]);

  React.useEffect(() => {
    console.log('children changes');
  }, [children]);

  lastState.current = state;

  console.log('rerendered');

  if (state === 'exited' && unmountOnExit) return null;
  return children(state) || null;
}

interface ICloneElTransitionProps {
  children: React.ReactElement<{ className?: string }>;
  show?: boolean;
  duration?: number;
  unmountOnExit?: boolean;
}

export function CloneElTransition({
  children,
  show = false,
  duration = 2000,
  unmountOnExit = false,
}: ICloneElTransitionProps) {
  const lastState = React.useRef<TTransitionState>('exited');
  const [state, setState] = React.useState<TTransitionState>(() => (show ? 'entering' : 'exited'));

  const updateState = React.useCallback((newState: TTransitionState) => {
    setState(newState);
  }, []);

  React.useEffect(() => {
    const lS = lastState.current;
    let timeout: number;
    if (show) {
      if (isInEnterPhase(lS)) return;
      updateState('entering');
      timeout = window.setTimeout(() => {
        updateState('entered');
      }, duration);
    } else {
      if (isInExitPhase(lS)) return;
      updateState('exiting');
      timeout = window.setTimeout(() => {
        updateState('exited');
      }, duration);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      window.clearTimeout(timeout);
    };
  }, [show, updateState, duration]);

  React.useEffect(() => {
    console.log('children changes');
  }, [children]);

  lastState.current = state;

  console.log('rerendered');

  if (state === 'exited' && unmountOnExit) return null;

  if (typeof children !== 'object') return children;

  return React.cloneElement(children, {
    className: `${children.props.className || ' '} ${state}`,
  });
}
