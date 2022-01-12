/* eslint-disable max-len */
/**
 * This interface provides accessing to every nested properties include optional properties
 * @example const [store, setStore] = (getStore as TGetStore<{ test: { test1: string[], test2: { test3: { test4?: { test5?: string[], test6?: "h" | "i" | "j" | "k"} }}}}>).test.test2.test3.test4.test5();
 * setStore(undefined)
 * @description How it works:
 * There are 3 things you should care about:
 * - S: input type
 *   + if not a object(undefined, null, array, whatever), immediately finish the chain, because we can't access deeper
 *   + else: will be used for accessing its children
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++
 * - O: optional frag
 *   + if true, S and its children of S will be considered as optional properties
 *   + t makes sense because teaful allows creating property of optional property on the fly
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++
 * - OG: original type of S, might be undefined
 *   + if we call the expression, OG will be returned
 */
export type IDeepTypedStore<
	S,
	O extends boolean = false,
	OG extends S = S,
> = S extends Record<string, any>
  ? {
    [K in keyof Required<S>]: undefined extends S[K]
      ? IDeepTypedStore<Required<S>[K], true, S[K]>
      : IDeepTypedStore<Required<S>[K], O, S[K]>;
	  } &
  TStoreUtilFactory<OG, O>
  : TStoreUtilFactory<OG, O>;

type TStoreUpdater<S> = (prev: S) => S;

export type TUpdateStoreFn<S> = (input: TStoreUpdater<S> | S) => void;

export type TStoreUtil<S, O> = O extends false
  ? [S, TUpdateStoreFn<S>]
  : [S | undefined, TUpdateStoreFn<S | undefined>];

export type TStoreUtilFactory<S, O extends boolean = false> = () => TStoreUtil<
S,
O
>;

export type TGetDeepStore<S> = IDeepTypedStore<S>;

export type TUseDeepStore<S> = IDeepTypedStore<S>;

export interface IStoreInstance<S> {
  getStore: TGetDeepStore<S>;
  useStore: TUseDeepStore<S>;
}

export type TAfterUpdate<S> = {
  store: S;
  prevStore: S;
};

export type TAfterUpdateCallback<S> = (t: TAfterUpdate<S>) => void;






/***
 * tweaked createStore to support typing
 ***/
import createTFStore from 'teaful';
//import { IStoreInstance, TAfterUpdateCallback } from './base.type';

export default function createStore<S>(state: S, cb?: TAfterUpdateCallback<S>) {
  const { getStore, useStore } = createTFStore(state, cb);
  return {
    getStore,
    useStore,
  } as IStoreInstance<S>;
}

