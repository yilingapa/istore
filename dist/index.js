import { Subject } from 'rxjs';
import produce from 'immer';
import { useState, useLayoutEffect, useRef } from 'react';
import { tap } from 'rxjs/operators';
import { logAction, reduxExtensionStore } from './reactDevTools';
function checkDiff(next, cache) {
    for (const key in next) {
        if (next[key] !== cache[key])
            return true;
    }
    return false;
}
export function useStore(store, option = { resetOnUnMount: false }) {
    if (typeof option.selector !== 'undefined') {
        option.selectorDependence = option.selectorDependence || [];
        const [state, setState] = useState(option.selector(store.state));
        const stateCache = useRef(state);
        useLayoutEffect(() => {
            const selected = option.selector(store.state);
            if (checkDiff(selected, stateCache.current)) {
                stateCache.current = selected;
                setState(selected);
            }
            const sub = store.subject.subscribe(() => {
                const selected = option.selector(store.state);
                if (checkDiff(selected, stateCache.current)) {
                    stateCache.current = selected;
                    setState(selected);
                }
            });
            return () => {
                if (option.resetOnUnMountHooks) {
                    store.action.setState(option.resetOnUnMountHooks);
                }
                sub.unsubscribe();
            };
        }, option.selectorDependence);
        return [state, store.action];
    }
    else {
        const [state, setState] = useState(store.state);
        useLayoutEffect(() => {
            const sub = store.subject.subscribe(setState);
            return () => {
                if (option.resetOnUnMount) {
                    store.init();
                }
                sub.unsubscribe();
            };
        }, []);
        return [state, store.action];
    }
}
export const createStore = (initState, getActions) => {
    'use strict';
    const subject = new Subject();
    const actions = Object.create(null);
    const canConnectReduxDevTools = typeof reduxExtensionStore !== 'undefined';
    let storeName;
    let keyLength = 0;
    for (const key in initState) {
        keyLength += 1;
        storeName = key;
        if (keyLength > 1) {
            console.error(`Use createStore({stateScopeName}) pls.[give a name to the state, it helps to distinguish state scope in Redux DevTool.]`);
            throw 'creat store filed because of error use of init state';
        }
    }
    let stateGard = false;
    const storeShadow = {
        state: initState[storeName]
    };
    const store = {
        get state() {
            return storeShadow.state;
        },
        set state(value) {
            if (stateGard) {
                storeShadow.state = value;
            }
            else {
                console.warn('Do not modify state directly, use action only.');
            }
        },
        subject,
        init: () => subject.next(initState[storeName]),
        action: actions
    };
    store.subject = store.subject.pipe(tap((s) => {
        stateGard = true;
        store.state = s;
        stateGard = false;
    }));
    Object.freeze(store);
    const setState = ((cb) => {
        const s = produce(storeShadow.state, (draft) => {
            cb(draft);
        });
        if (canConnectReduxDevTools) {
            logAction(storeName, {
                actionName: 'setState',
                state: s
            });
        }
        store.subject.next(s);
    });
    if (typeof getActions !== 'undefined') {
        const actionsToAdd = getActions(setState);
        if (canConnectReduxDevTools) {
            Object.keys(actionsToAdd).forEach(key => {
                const pre = actionsToAdd[key].bind(null);
                actionsToAdd[key] = (...arg) => {
                    pre(...arg);
                    logAction(storeName, {
                        actionName: key,
                        state: store.state
                    });
                };
            });
        }
        Object.assign(actions, actionsToAdd, { setState });
    }
    else {
        Object.assign(actions, { setState });
    }
    if (canConnectReduxDevTools) {
        let latestActionId = 1;
        reduxExtensionStore.subscribe((res) => {
            var _a, _b, _c, _d, _e;
            try {
                if (res.currentStateIndex <= latestActionId) {
                    if (((_b = (_a = res.actionsById[res.currentStateIndex]) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.namespace) === storeName) {
                        store.subject.next((_e = (_d = (_c = res.computedStates[res.currentStateIndex]) === null || _c === void 0 ? void 0 : _c.state) === null || _d === void 0 ? void 0 : _d[storeName]) !== null && _e !== void 0 ? _e : initState[storeName]);
                    }
                }
            }
            catch (e) {
                console.log(`redux devtool sync state error:`, e);
            }
            latestActionId = res.stagedActionIds[res.stagedActionIds.length - 1];
        });
    }
    return store;
};
