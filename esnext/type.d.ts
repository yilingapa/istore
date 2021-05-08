import { Subject } from 'rxjs';
export declare type actionType = {
    [key in string | number | symbol]: (...arg: any[]) => void;
};
export interface Store<T, action extends Record<string, any>> {
    state: T;
    subject: Subject<T>;
    init: () => void;
    action: action;
}
export declare type setStateFunc<T> = (arg: (s: T) => any) => void;
