import { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';

export default function useClickOutside(
  ref: RefObject<HTMLElement>,
  callback: () => any,
) {
  useEffect(() => {
    const handleClick = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [callback, ref]);
}
