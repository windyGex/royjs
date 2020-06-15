import { useContext, useEffect, useState, useRef } from 'react';
import Store from './store';
import { StoreContext } from './provider';
import { isPlainObject } from './utils';

export function useStore(mapStateToProps = state => state) {
    const ctx = useContext(StoreContext);
    const store = (ctx && ctx.store) || Store.get();
    const deps = {};
    const get = useRef();
    const change = useRef();
    const set = useRef();
    get.current = (data) => {
        deps[data.key] = true;
    };
    store.on('get', get.current);
    let [state, setState] = useState(() => mapStateToProps(store.state));
    if (state === store.state) {
        state = {...state}; // for deps
    }
    store.off('get', get.current);
    set.current = (newState: any) => {
        if (Array.isArray(newState)) {
            newState = [...newState];
        } else if (isPlainObject(newState)) {
            newState = { ...newState };
        }
        setState(newState);
    };
    change.current = (obj: any) => {
        obj = Array.isArray(obj) ? obj : [obj];
        let matched;
        for (let index = 0; index < obj.length; index++) {
            const item = obj[index];
            const match = Object.keys(deps).some((dep) => item.key.indexOf(dep) === 0);
            if (match) {
                matched = true;
            }
        }
        if (matched) {
            const newState = mapStateToProps(store.state);
            set.current(newState);
        }
    };

    useEffect(() => {
        store.on('change', change.current);
        return () => {
            store.off('change', change.current);
        };
    }, [store]);
    return state;
}

export function useDispatch() {
    const ctx = useContext(StoreContext);
    const store = (ctx && ctx.store) || Store.get();
    return store.dispatch;
}
