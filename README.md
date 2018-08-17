# Roy  ![buildStatus](https://travis-ci.org/windyGex/roy.svg?branch=master)

A powerful mvvm framework for react.

## Install

```shell
npm install royjs --save
```

## Motive

![image](https://img.alicdn.com/tfs/TB1rzpgGHGYBuNjy0FoXXciBFXa-627-241.png)

The state management is nothing more than changing the state from partial to partial sharing, so in an application, each component can be managed corresponding to a state, and only when this part needs to be shared, it is extracted.

## Usage

### Basic Usage

```js
import {Store, inject} from 'royjs';

const store = new Store({
    state: {
        count: 0
    },
    actions: {
        add(state, payload) {
            const {count} = state;
            this.set('count', count + 1);
        },
        reduce(state, payload) {
            const {count} = state;
            this.set('count', count - 1);
        }
    }
});

@inject(store)
class App extends React.Component {
    render() {
        const {count} = this.store.state;
        return <div onClick={() => this.store.dispatch('add')}>{count}</div>
    }
}

```

### Centralized Store

```js
import {Store, connect} from 'royjs';

const store = new Store({}, {
    plugins: [devtools]
});

store.create('module1', {
    state: {
        name: 'module1'
    },
    actions: {
        change(state, payload){
            state.set('name', payload);
        }
    }
});

store.create('module2', {
    state: {
        name: 'module2'
    },
    actions: {
        change(state, payload){
            state.set('name', payload);
        }
    }
});

@connect(state => state.module1)
class App extends React.Component {
    onClick = () => {
        this.store.dispatch('module2.change', 'changed name from module1');
    }
    render() {
        return <div onClick={this.onClick}>{this.props.name}</div>
    }
}

@connect(state => state.module2)
class App2 extends React.Component {
    render() {
        return <div>{this.props.name}</div>
    }
}
```

### Merge localStore to globalStore

```js
import {Store, inject, connect} from 'royjs';

const store = new Store();

const subModuleStore = new Store({
    state: {
        name: 'subModule'
    },
    actions: {
        change(state) {
            state.set('name', 'subModuleChanged');
        }
    }
})
@inject(subModuleStore)
class SubModule extends React.Component {
    render() {
        return <div onClick={this.store.change}>{this.store.state.name}</div>
    }
}

store.mount('subModule', subModuleStore);

@connect(state => state.subModule)
class App extends React.Component {
    render() {
        return <div>{this.props.name}</div>
    }
}
```

### Async Request

```js
import {Store, inject} from 'royjs';

const store = new Store({
    state: {
        count: 0
    },
    actions: {
        add(state, payload) {
            const {count} = state;
            state.set('count', count + 1);
        },
        reduce(state, payload) {
            const {count} = state;
            state.set('count', count - 1);
        },
        fetch(state, payload) {
            this.request('./url').then(ret => {
                state.set('dataSource', ret.ds)
            });
        }
    }
});

@inject(store)
class App extends React.Component {
    componentDidMount() {
        this.store.dispatch('fetch');
    }
    render() {
        const {dataSource} = this.store.state;
        return <div onClick={() => this.store.dispatch('add')}>{dataSource}</div>
    }
}
```

## Benchmark

Test on my macbook pro (Intel Core i7 2.2GHz)

![benchmark](https://img.alicdn.com/tfs/TB1n.LgIuSSBuNjy0FlXXbBpVXa-786-140.png)

```shell
tnpm run benchmark
```
