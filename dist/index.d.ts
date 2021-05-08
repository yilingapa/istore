import { Store, actionType, setStateFunc } from './type';
export declare function useStore<T, action extends actionType, option extends {
    selector: (s: T) => any;
    resetOnUnMountHooks?: (s: T) => void;
    selectorDependence?: any[];
}>(store: Store<T, action>, option: option): [ReturnType<option['selector']>, action];
export declare function useStore<T, action extends actionType, option extends {
    resetOnUnMount?: boolean;
}>(store: Store<T, action>, option?: option): [T, action];
export declare const createStore: <T, G extends (set: setStateFunc<T>) => Record<string, any>, actionType_1 = ReturnType<G> & {
    setState: setStateFunc<T>;
}>(initState: {
    [x: string]: T;
}, getActions?: G | undefined) => Store<T, actionType_1>;
export type { setStateFunc } from './type';
