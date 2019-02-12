# Roy  ![buildStatus](https://travis-ci.org/windyGex/royjs.svg?branch=master)

A powerful mvvm framework for react.

## Install

```shell
npm install @royjs/core --save
```

## Motive

![image](https://img.alicdn.com/tfs/TB1rzpgGHGYBuNjy0FoXXciBFXa-627-241.png)

The state management is nothing more than changing the state from partial to partial sharing, so in an application, each component can be managed corresponding to a state, and only when this part needs to be shared, it is extracted.

## Usage

### Basic Usage

```js
import {Store, inject} from '@royjs/core';

const store = new Store({
    state: {
        count: 0
    },
    actions: {
        add(state, payload) {
            state.count++;
        },
        reduce(state, payload) {
            state.count--;
        }
    }
});

@inject(store)
class App extends React.Component {
    render() {
        const {count} = this.props.state;
        return <div onClick={() => this.props.dispatch('add')}>{count}</div>
    }
}

```

### Centralized Store

```js
import {Store, connect} from '@royjs/core';

const store = new Store({}, {
    plugins: [devtools]
});

store.create('module1', {
    state: {
        name: 'module1'
    },
    actions: {
        change(state, payload){
            state.name = payload;
        }
    }
});

store.create('module2', {
    state: {
        name: 'module2'
    },
    actions: {
        change(state, payload){
            state.name = payload;
        }
    }
});

@connect(state => state.module1)
class App extends React.Component {
    onClick = () => {
        this.props.dispatch('module2.change', 'changed name from module1');
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
import {Store, inject, connect} from '@royjs/core';

const store = new Store();

const subModuleStore = new Store({
    state: {
        name: 'subModule'
    },
    actions: {
        change(state) {
            state.name = 'subModuleChanged';
        }
    }
})
@inject(subModuleStore)
class SubModule extends React.Component {
    render() {
        return <div onClick={() => this.props.dispatch('change')}>{this.props.state.name}</div>
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
import {Store, inject} from '@royjs/core';

const store = new Store({
    state: {
        count: 0
    },
    actions: {
        add(state, payload) {
            state.count++;
        },
        reduce(state, payload) {
            state.count--;
        },
        fetch(state, payload) {
            this.request('./url').then(ret => {
                state.dataSource = ret.ds;
            });
        }
    }
});

@inject(store)
class App extends React.Component {
    componentDidMount() {
        this.props.dispatch('fetch');
    }
    render() {
        const {dataSource} = this.props.state;
        return <div onClick={() => this.props.dispatch('add')}>{dataSource}</div>
    }
}
```

## Benchmark

Test on my macbook pro (Intel Core i7 2.2GHz)

![benchmark](https://img.alicdn.com/tfs/TB1n.LgIuSSBuNjy0FlXXbBpVXa-786-140.png)

```shell
tnpm run benchmark
```
