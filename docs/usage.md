## Usage

### Edit your `src/router.js` file

Add this import
```javascript
import { authGuard } from '@mspiderv/vuejwtauth'
```

Then the whole `new Router({...})` object wrap into `authGuard` function. The result should looks like this:
```javascript
export default authGuard(new Router({
    ...
}))
```

Alternatively, you can save your router into local variable, then wrap it with `authGuard` function and finally return it. The result would looks like this:
```javascript
const router = new Router({
    ...
});

authGuard(router)

export default router
```

### Edit your `src/store.js`

Add this import
```javascript
import { createAuthStoreModule } from '@mspiderv/vuejwtauth'
import AxiosHttpDriver from '@mspiderv/vuejwtauth/src/drivers/http/axios'
```

Somewhere under the imports, define your auth config object
```javascript
const authOptions = {
  drivers: {
    http: new AxiosHttpDriver({
      // Set your backend URL here
      apiBaseURL: 'http://127.0.0.1:3000/api/'
    })
  }
}
```

Feel free to extract this config object to another file.

Inside your store object add auth plugin
```javascript
plugins: [createAuthStoreModule(authOptions)]
```

The result should looks like this:
```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import { createAuthStoreModule } from '@mspiderv/vuejwtauth'
import AxiosHttpDriver from '@mspiderv/vuejwtauth/src/drivers/http/axios'

const authOptions = {
  drivers: {
    http: new AxiosHttpDriver({
      // Set your backend URL here
      apiBaseURL: 'http://127.0.0.1:3000/api/'
    })
  }
}

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [createAuthStoreModule(authOptions)]
})
```

### Protect your routes

#### Routes only for authenticated users

For every route, you want to make accessible only for **authenticated** users add following object:

```javascript
meta: { auth: true }
```

Example of route only for **authenticated** users definition:

```javascript
{
    path: '/admin/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { auth: true } // You need to be logged in to access this route
}
```

#### Routes only for unauthenticated users

For every route, you want to make accessible only for  **unauthenticated** users add following object:

```javascript
meta: { auth: false }
```

Example of route only for **unauthenticated** users definition:

```javascript
{
    path: '/login',
    name: 'login',
    component: Login,
    meta: { auth: false } // You need to be logged out to access this route
}
```

#### Public routes

Public route is such a route, that can be accessed by both **authenticated and unauthenticated** users. For every route, you want to make public **do not add** `meta { auth: ... }` object at all.

Example:

```javascript
{
    path: '/about',
    name: 'about',
    component: About
}
```