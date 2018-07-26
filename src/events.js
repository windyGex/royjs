/* eslint-disable no-cond-assign */

function Events() {}

Events.prototype = {
    on(type, callback) {
        let cache;
        if (!callback) return this;
        cache = this.__events || (this.__events = {});
        (cache[type] || (cache[type] = [])).push(callback);
        return this;
    },
    off(type, callback) {
        const cache = this.__events;
        if (cache && cache[type]) {
            const index = cache[type].indexOf(callback);
            if (index !== -1) {
                cache[type].splice(index, 1);
            }
        }
        return this;
    },
    trigger(type, evt) {
        const cache = this.__events;
        if (cache && cache[type]) {
            cache[type].forEach(callback => callback(evt));
        }
    }
};

// Mix `Events` to object instance or Class function.
Events.mixTo = function (receiver) {
    receiver = typeof (receiver) === 'function' ? receiver.prototype : receiver;
    const proto = Events.prototype;
    for (let p in proto) {
        if (proto.hasOwnProperty(p)) {
            receiver[p] = proto[p];
        }
    }
};

export default Events;
