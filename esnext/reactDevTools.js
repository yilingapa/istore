import { BehaviorSubject } from 'rxjs';
const extension = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__;
const STATE = {};
const reducer = () => (STATE ? { ...STATE } : STATE);
const createStore = (reducer) => {
    const currentState$ = new BehaviorSubject(undefined);
    const getState = () => currentState$.getValue();
    const dispatch = (action) => {
        const currentState = reducer(getState(), action);
        currentState$.next(currentState);
        return action;
    };
    dispatch({ type: '@@redux/INIT' });
    return {
        getState,
        dispatch,
        subscribe: currentState$.subscribe.bind(currentState$),
    };
};
export const reduxExtensionStore = extension
    ? extension({
        name: 'istore'
    })(createStore)(reducer)
    : undefined;
export function logAction(namespace, infos) {
    const action = {
        type: `${namespace}/${infos.actionName}`,
        namespace
    };
    if (infos.state)
        STATE[namespace] = infos.state;
    if (reduxExtensionStore)
        reduxExtensionStore.dispatch(action);
}
