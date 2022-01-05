
/**
 * Lazily list, delay removing element
 * removed item marked by `removed` attribute
 */
import { useCallback, useState } from 'react';

interface IIndexable {
  id: string | number;
}

interface IWrapped<T extends IIndexable> {
  data: T;
  removed: boolean;
}

export default function useLazyList<T extends IIndexable>(
  initial: T[],
  timeout = 1000,
) {
  const [list, setList] = useState<IWrapped<T>[]>(() => initial.map((t) => ({ data: t, removed: false })));

  const remove = useCallback(
    (id: T['id'], immediate = false) => {
      if (immediate) {
        setList((oldList) => oldList.filter((item) => item.data.id !== id));
        return;
      }
      let found = false;
      setList((oldList) => oldList.map((item) => {
        if (item.data.id === id && !item.removed) {
          found = true;
          return { ...item, removed: true };
        }
        return item;
      }));
      if (found) {
        window.setTimeout(() => {
          remove(id, true);
        }, timeout);
      }
    },
    [timeout],
  );

	/**
	 * Remove element that is not in removing phase
	 */
  const removeFirstAvailable = useCallback(
    (immediate = false) => {
      const firstAvailable = list.find((item) => !item.removed);
      if (!firstAvailable) return;
      remove(firstAvailable.data.id, immediate);
    },
    [remove, list],
  );

	/**
	 * Remove element that is not in removing phase
	 */
  const removeLastAvailable = useCallback(
    (immediate = false) => {
      let index = -1;
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (!list[i].removed) {
          index = i;
          break;
        }
      }
      if (index === -1) return;
      remove(list[index].data.id, immediate);
    },
    [list, remove],
  );

  const append = useCallback((item: T) => {
    setList((oldList) => [...oldList, { data: item, removed: false }]);
  }, []);

  const prepend = useCallback((item: T) => {
    setList((oldList) => [{ data: item, removed: false }, ...oldList]);
  }, []);

  return {
    list,
    setList,
    remove,
    removeFirstAvailable,
    removeLastAvailable,
    append,
    prepend,
  };
}
