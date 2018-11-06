import observable from '../../src/proxy';

const state = {
    a: {}
};

window.o = observable(state);

window.o.on('get', function (args) {
    console.log('get', args);
});

window.o.on('change', function(args) {
    console.log('change', args);
});

// o.get('a'), o.a ==> a
// o.get('a.b'), o.a.b ==> a, a.b
// o.get('a.b.c'), o.a.b.c ==> a, a.b, a.b.c

// o.get('a');
// o.get('a.b');
// o.get('a.b.c');

// o.a
// o.a.b
console.log(o.a.b)
