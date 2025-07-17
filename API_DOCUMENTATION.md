# Roy.js API Documentation

**Version:** 2.0.7  
**Description:** A powerful MVVM framework for React providing state management with reactive data binding.

## Table of Contents

1. [Installation](#installation)
2. [Core API](#core-api)
   - [Store](#store)
   - [inject](#inject)
   - [connect](#connect)
   - [Provider](#provider)
   - [DataSource](#datasource)
3. [React Hooks](#react-hooks)
   - [useStore](#usestore)
   - [useDispatch](#usedispatch)
4. [Utilities](#utilities)
   - [compose](#compose)
   - [hotRender](#hotrender)
   - [throttle](#throttle)
5. [Plugins](#plugins)
   - [devtools](#devtools-plugin)
   - [route](#route-plugin)
   - [set-values](#set-values-plugin)
6. [Advanced Usage](#advanced-usage)
7. [Examples](#examples)

---

## Installation

```bash
npm install @royjs/core --save
```

## Core API

### Store

The `Store` class is the core of Roy.js, providing reactive state management with actions and event handling.

#### Constructor

```javascript
new Store(params, options)
```

**Parameters:**
- `params` (Object):
  - `name` (String, optional): Store name identifier
  - `state` (Object): Initial state object
  - `actions` (Object): Action methods for state mutations
- `options` (Object, optional):
  - `strict` (Boolean, default: false): Enable strict mode
  - `plugins` (Array, default: []): Array of plugins to apply
  - `url` (String, optional): Base URL for DataSource
  - `primaryKey` (String, default: 'id'): Primary key for DataSource

**Example:**
```javascript
import { Store } from '@royjs/core';

const store = new Store({
  name: 'counter',
  state: {
    count: 0,
    users: []
  },
  actions: {
    increment(state, payload) {
      state.count += payload || 1;
    },
    async fetchUsers(state, payload) {
      const users = await fetch('/api/users').then(r => r.json());
      state.users = users;
    }
  }
}, {
  strict: false,
  plugins: [devtools]
});
```

#### Instance Methods

##### `get(key)`
Retrieve a value from the store state.

```javascript
const count = store.get('count');
const user = store.get('users.0.name');
```

##### `set(key, value, options)`
Set a value in the store state.

```javascript
store.set('count', 10);
store.set('user.name', 'John');
```

##### `dispatch(type, payload, options)`
Dispatch an action to modify the state.

```javascript
store.dispatch('increment', 5);
store.dispatch('fetchUsers');
```

##### `subscribe(callback)`
Subscribe to action dispatches.

```javascript
store.subscribe(({ type, payload, state }) => {
  console.log('Action:', type, 'Payload:', payload);
});
```

##### `transaction(fn)`
Execute multiple state changes as a single transaction.

```javascript
store.transaction(() => {
  store.set('count', 0);
  store.set('users', []);
});
```

##### `hot(state, actions, prefix, plugins)`
Hot reload state and actions for development.

```javascript
store.hot(newState, newActions, '', []);
```

#### Static Methods

##### `Store.create(store, name, params)`
Create a nested store.

```javascript
const childStore = Store.create(parentStore, 'child', {
  state: { value: 0 },
  actions: { setValue: (state, payload) => state.value = payload }
});
```

##### `Store.mount(target, name, store)`
Mount a store onto another store.

```javascript
Store.mount(parentStore, 'child', childStore);
```

##### `Store.get()`
Get the global store instance.

```javascript
const globalStore = Store.get();
```

#### Properties

- `state`: Reactive state object
- `actions`: Available actions object
- `dataSource`: DataSource instance for HTTP operations
- `request`: HTTP request interface

---

### inject

Higher-order component for connecting React components to stores.

#### Syntax

```javascript
inject(store)
inject(store, pure)
inject(key, store)
inject(storesObject)
```

**Parameters:**
- `store` (Store): Store instance to inject
- `pure` (Boolean): Enable pure component optimization
- `key` (String): Property name for the store
- `storesObject` (Object): Multiple stores object

**Example:**
```javascript
import { Store, inject } from '@royjs/core';

const store = new Store({
  state: { count: 0 },
  actions: {
    increment: (state) => state.count++
  }
});

@inject(store)
class Counter extends React.Component {
  render() {
    const { state, dispatch } = this.props;
    return (
      <div>
        <span>{state.count}</span>
        <button onClick={() => dispatch('increment')}>+</button>
      </div>
    );
  }
}

// With pure component optimization
@inject(store, true)
class PureCounter extends React.Component {
  // Component will only re-render when used state changes
}

// Multiple stores (deprecated)
@inject({
  counterStore: store,
  userStore: userStore
})
class MultiStore extends React.Component {
  // Access via this.props.counterStore and this.props.userStore
}
```

---

### connect

Alternative HOC for connecting components with more flexible state mapping.

#### Syntax

```javascript
connect(mapStateToProps, config)
```

**Parameters:**
- `mapStateToProps` (Array|Object|Function): State mapping configuration
- `config` (Object, optional): Additional configuration

**Example:**
```javascript
import { connect } from '@royjs/core';

// Array syntax - map state keys directly
const ConnectedComponent = connect(['count', 'users'])(Component);

// Object syntax - map state and actions
const ConnectedComponent = connect({
  state: ['count', 'users'],
  actions: ['increment', 'fetchUsers']
})(Component);

// Function syntax - custom mapping
const ConnectedComponent = connect((state) => ({
  count: state.count,
  isEven: state.count % 2 === 0
}))(Component);

// With key mapping
const ConnectedComponent = connect([
  'count',
  { userCount: 'users.length' }
])(Component);
```

---

### Provider

React Context provider for making stores available to child components.

#### Syntax

```javascript
<Provider store={store}>
  {children}
</Provider>
```

**Props:**
- `store` (Store): Store instance to provide
- `children` (ReactNode): Child components

**Example:**
```javascript
import { Provider, Store } from '@royjs/core';

const store = new Store({
  state: { theme: 'light' },
  actions: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    }
  }
});

function App() {
  return (
    <Provider store={store}>
      <Header />
      <Main />
      <Footer />
    </Provider>
  );
}
```

---

### DataSource

HTTP client for RESTful API operations.

#### Constructor

```javascript
new DataSource(props)
```

**Parameters:**
- `props` (Object):
  - `url` (String): Base URL for API endpoints
  - `request` (Object): HTTP client instance
  - `primaryKey` (String, default: 'id'): Primary key field

**Methods:**

##### `get(id, params)`
GET request for a specific resource.

```javascript
const user = await dataSource.get(123);
const user = await dataSource.get(123, { include: 'posts' });
```

##### `find(params)`
GET request for resource collection.

```javascript
const users = await dataSource.find({ page: 1, limit: 10 });
```

##### `post(params)`
POST request to create a resource.

```javascript
const newUser = await dataSource.post({ name: 'John', email: 'john@example.com' });
```

##### `put(id, params)`
PUT request to update a resource.

```javascript
const updatedUser = await dataSource.put(123, { name: 'Jane' });
```

##### `patch(id, params)`
PATCH request to partially update a resource.

```javascript
const updatedUser = await dataSource.patch(123, { email: 'jane@example.com' });
```

##### `remove(id)`
DELETE request to remove a resource.

```javascript
await dataSource.remove(123);
```

**Example:**
```javascript
import { DataSource } from '@royjs/core';

const userDataSource = new DataSource({
  url: '/api/users',
  request: fetch // or axios, etc.
});

// In store actions
const userStore = new Store({
  state: { users: [], loading: false },
  actions: {
    async fetchUsers(state) {
      state.loading = true;
      try {
        const users = await this.dataSource.find();
        state.users = users;
      } finally {
        state.loading = false;
      }
    },
    async createUser(state, userData) {
      const newUser = await this.dataSource.post(userData);
      state.users.push(newUser);
    }
  }
}, {
  url: '/api/users'
});
```

---

## React Hooks

### useStore

Hook for accessing store state in functional components.

#### Syntax

```javascript
const state = useStore(mapStateToProps)
```

**Parameters:**
- `mapStateToProps` (Function, optional): State mapping function

**Example:**
```javascript
import { useStore } from '@royjs/core';

function Counter() {
  // Access entire state
  const state = useStore();
  
  // Access specific state slice
  const count = useStore(state => state.count);
  
  // Access computed state
  const { count, isEven } = useStore(state => ({
    count: state.count,
    isEven: state.count % 2 === 0
  }));
  
  return <div>Count: {count}</div>;
}
```

### useDispatch

Hook for accessing the dispatch function in functional components.

#### Syntax

```javascript
const dispatch = useDispatch()
```

**Example:**
```javascript
import { useStore, useDispatch } from '@royjs/core';

function Counter() {
  const count = useStore(state => state.count);
  const dispatch = useDispatch();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch('increment')}>+</button>
      <button onClick={() => dispatch('decrement')}>-</button>
    </div>
  );
}
```

---

## Utilities

### compose

Utility for creating components with integrated store management.

#### Syntax

```javascript
compose(config)
```

**Parameters:**
- `config` (Object):
  - `name` (String): Component name
  - `view` (Function): Render function
  - `components` (Object): Available components
  - `state` (Object): Initial state
  - `actions` (Object): Actions
  - `container` (String|Element): Mount container
  - `init` (Function): Constructor logic
  - `mounted` (Function): componentDidMount logic
  - `beforeUpdate` (Function): componentWillUpdate logic
  - `updated` (Function): componentDidUpdate logic
  - `beforeDestroy` (Function): componentWillUnmount logic

**Example:**
```javascript
import { compose } from '@royjs/core';

const CounterComponent = compose({
  name: 'Counter',
  state: { count: 0 },
  actions: {
    increment: (state) => state.count++
  },
  view({ createElement, components }) {
    return createElement('div', null,
      createElement('span', null, this.props.state.count),
      createElement('button', {
        onClick: () => this.props.dispatch('increment')
      }, '+')
    );
  },
  mounted() {
    console.log('Counter mounted');
  }
});

// Auto-render to container
compose({
  // ... config
  container: '#app'
});
```

### hotRender

Development utility for hot reloading with store integration.

#### Syntax

```javascript
hotRender(element, container, options)
```

**Parameters:**
- `element` (ReactElement): React element to render
- `container` (String|Element): Mount container
- `options` (Object, optional):
  - `storeConfig` (Object): Store configuration for hot reloading

**Example:**
```javascript
import { hotRender } from '@royjs/core';

// Development hot reloading
hotRender(<App />, '#root', {
  storeConfig: {
    state: { count: 0 },
    actions: {
      increment: (state) => state.count++
    },
    plugins: [devtools]
  }
});

// Production rendering
hotRender(<App />, '#root');
```

### throttle

Decorator for throttling method calls.

#### Syntax

```javascript
@throttle
methodName() {
  // Method implementation
}
```

**Example:**
```javascript
import { throttle } from '@royjs/core';

class SearchComponent extends React.Component {
  @throttle
  onSearch(query) {
    // This method will be throttled to prevent excessive calls
    this.props.dispatch('search', query);
  }
  
  render() {
    return (
      <input
        onChange={(e) => this.onSearch(e.target.value)}
        placeholder="Search..."
      />
    );
  }
}
```

---

## Plugins

### devtools Plugin

Redux DevTools integration for debugging.

#### Usage

```javascript
import { Store } from '@royjs/core';
import devtools from '@royjs/core/src/plugins/devtools';

const store = new Store({
  state: { count: 0 },
  actions: {
    increment: (state) => state.count++
  }
}, {
  plugins: [devtools]
});
```

**Features:**
- Time-travel debugging
- Action replay
- State inspection
- Works with Redux DevTools browser extension

### route Plugin

React Router integration for navigation actions.

#### Usage

```javascript
import { Store } from '@royjs/core';
import routePlugin from '@royjs/core/src/plugins/route';

const store = new Store({
  state: { currentPage: 'home' },
  actions: {
    navigateToProfile: (state) => {
      this.dispatch('router.push', '/profile');
    }
  }
}, {
  plugins: [routePlugin]
});

// Set history instance
store.history = history;
```

**Available Actions:**
- `router.push(path)`: Navigate to path
- `router.replace(path)`: Replace current path
- `router.go(delta)`: Go back/forward by delta
- `router.goBack()`: Go back one step
- `router.goForward()`: Go forward one step

### set-values Plugin

Built-in plugin for batch state updates (automatically included).

#### Usage

```javascript
// Available in all stores by default
store.dispatch('setValues', {
  count: 10,
  name: 'John',
  'user.email': 'john@example.com'
});
```

**Features:**
- Batch multiple state updates
- Supports nested key paths
- Wrapped in transaction for performance

---

## Advanced Usage

### Store Composition

Create hierarchical stores for complex applications:

```javascript
const rootStore = new Store({
  state: { theme: 'light' },
  actions: {
    setTheme: (state, theme) => state.theme = theme
  }
});

const userStore = Store.create(rootStore, 'user', {
  state: { name: '', email: '' },
  actions: {
    setUser: (state, user) => Object.assign(state, user)
  }
});

const cartStore = Store.create(rootStore, 'cart', {
  state: { items: [] },
  actions: {
    addItem: (state, item) => state.items.push(item)
  }
});
```

### Custom Plugins

Create custom plugins to extend store functionality:

```javascript
const loggerPlugin = (store, actions) => {
  // Add custom actions
  actions.log = (state, message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
  };
  
  // Subscribe to store events
  store.subscribe(({ type, payload, state }) => {
    console.log(`Action: ${type}`, payload);
  });
  
  // Extend store instance
  store.customMethod = () => {
    console.log('Custom method called');
  };
};

const store = new Store({
  state: { count: 0 },
  actions: {
    increment: (state) => state.count++
  }
}, {
  plugins: [loggerPlugin]
});
```

### Async Actions

Handle asynchronous operations in actions:

```javascript
const store = new Store({
  state: {
    data: null,
    loading: false,
    error: null
  },
  actions: {
    async fetchData(state, url) {
      state.loading = true;
      state.error = null;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        state.data = data;
      } catch (error) {
        state.error = error.message;
      } finally {
        state.loading = false;
      }
    },
    
    async fetchWithRetry(state, { url, retries = 3 }) {
      for (let i = 0; i < retries; i++) {
        try {
          await this.dispatch('fetchData', url);
          break;
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
  }
});
```

---

## Examples

### Basic Counter

```javascript
import React from 'react';
import { Store, inject } from '@royjs/core';

const store = new Store({
  state: { count: 0 },
  actions: {
    increment: (state) => state.count++,
    decrement: (state) => state.count--,
    reset: (state) => state.count = 0
  }
});

@inject(store)
class Counter extends React.Component {
  render() {
    const { state, dispatch } = this.props;
    return (
      <div>
        <h1>Count: {state.count}</h1>
        <button onClick={() => dispatch('increment')}>+</button>
        <button onClick={() => dispatch('decrement')}>-</button>
        <button onClick={() => dispatch('reset')}>Reset</button>
      </div>
    );
  }
}
```

### Todo List with Hooks

```javascript
import React from 'react';
import { Store, Provider, useStore, useDispatch } from '@royjs/core';

const todoStore = new Store({
  state: {
    todos: [],
    filter: 'all' // all, active, completed
  },
  actions: {
    addTodo(state, text) {
      state.todos.push({
        id: Date.now(),
        text,
        completed: false
      });
    },
    toggleTodo(state, id) {
      const todo = state.todos.find(t => t.id === id);
      if (todo) todo.completed = !todo.completed;
    },
    removeTodo(state, id) {
      state.todos = state.todos.filter(t => t.id !== id);
    },
    setFilter(state, filter) {
      state.filter = filter;
    }
  }
});

function TodoApp() {
  const { todos, filter } = useStore();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = React.useState('');
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch('addTodo', inputValue.trim());
      setInputValue('');
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add todo..."
        />
        <button type="submit">Add</button>
      </form>
      
      <div>
        <button onClick={() => dispatch('setFilter', 'all')}>All</button>
        <button onClick={() => dispatch('setFilter', 'active')}>Active</button>
        <button onClick={() => dispatch('setFilter', 'completed')}>Completed</button>
      </div>
      
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch('toggleTodo', todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch('removeTodo', todo.id)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <Provider store={todoStore}>
      <TodoApp />
    </Provider>
  );
}
```

### Shopping Cart with DataSource

```javascript
import React from 'react';
import { Store, connect } from '@royjs/core';

const cartStore = new Store({
  state: {
    products: [],
    cart: [],
    loading: false
  },
  actions: {
    async fetchProducts(state) {
      state.loading = true;
      try {
        const products = await this.dataSource.find();
        state.products = products;
      } finally {
        state.loading = false;
      }
    },
    
    addToCart(state, product) {
      const existingItem = state.cart.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
    },
    
    removeFromCart(state, productId) {
      state.cart = state.cart.filter(item => item.id !== productId);
    },
    
    updateQuantity(state, { id, quantity }) {
      const item = state.cart.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
          this.dispatch('removeFromCart', id);
        }
      }
    }
  }
}, {
  url: '/api/products'
});

const ProductList = connect(['products', 'loading'])(({ products, loading, dispatch }) => {
  React.useEffect(() => {
    dispatch('fetchProducts');
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Products</h2>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => dispatch('addToCart', product)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
});

const Cart = connect(['cart'])(({ cart, dispatch }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <div>
      <h2>Cart</h2>
      {cart.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => dispatch('updateQuantity', {
              id: item.id,
              quantity: parseInt(e.target.value)
            })}
          />
          <span>${(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => dispatch('removeFromCart', item.id)}>
            Remove
          </button>
        </div>
      ))}
      <div>Total: ${total.toFixed(2)}</div>
    </div>
  );
});
```

---

## Best Practices

1. **Keep actions pure**: Actions should only modify state and not have side effects
2. **Use transactions**: Group related state changes in transactions for better performance
3. **Leverage plugins**: Use plugins for cross-cutting concerns like logging, routing, etc.
4. **Structure stores logically**: Create separate stores for different domains
5. **Use TypeScript**: Add type safety to your stores and actions
6. **Avoid deep nesting**: Keep state structure flat when possible
7. **Use computed properties**: Derive state in mapStateToProps instead of storing computed values

## Migration Guide

### From v1.x to v2.x

- Replace `@inject` with `inject()` function call
- Update plugin APIs to use new plugin system
- Use `Provider` component for context-based store access
- Migrate to React Hooks API where appropriate

---

This documentation covers all public APIs, functions, and components of Roy.js. For more examples and advanced usage patterns, refer to the examples directory in the repository.