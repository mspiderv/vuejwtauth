# JWT Auth for Vue.js

## Installation

Via npm
```
npm install @mspiderv/vuejwtauth --save
```

Via yarn
```
yarn add @mspiderv/vuejwtauth
```

## Usage

Follow steps 6 and 7 below.

## Step-by-step tutorial: How to create an empty Vue app with auth functionality

1. Create a new Vue app
```
vue create my-jwt-auth-app
```

2. Select `router` and `vuex` features during installation.

3. Open our app directory
```
cd my-jwt-auth-app
```

4. Add our JWT auth library
Via npm
```
npm install @mspiderv/vuejwtauth --save
```

Via yarn
```
yarn add @mspiderv/vuejwtauth
```

5. Run our app

Via npm
```
npm run serve
```

Via yarn
```
yarn run serve
```

6. Edit your `src/router.js` file

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

7. Edit your `src/store.js`

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

8. Protect our routes now

Replace your `routes` property (in `src/router.js` file) with the following array
```javascript
[
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue'),
    meta: { auth: false } // This route is not allowed for logged users
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { auth: true } // You need to be logged in to access this
  },
  {
    // Whoever can access this route
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue')
  }
]
```

9. Create login form

Create an empty file at `src/views/Login.vue` and fill it with the following content
```vue
<template>
  <div>
    <h4>Login form</h4>
    <p><label><strong>E-mail:</strong> <input type="email" v-model="email"></label></p>
    <p><label><strong>Password:</strong> <input type="password" v-model="password"></label></p>
    <p><label><input type="checkbox" v-model="rememberMe"> Remember me</label></p>
    <p><button @click="onLoginButton">Submit</button></p>
  </div>
</template>

<script>
import { createAuthHelpers } from '@mspiderv/vuejwtauth'
const { mapActions } = createAuthHelpers()

export default {
  name: 'login',
  data() {
    return {
      email: 'coy.osinski@example.org',
      password: 'password',
      rememberMe: true
    }
  },
  methods: {
    ...mapActions([
      'attemptLogin'
    ]),
    onLoginButton() {
      this.attemptLogin({
        credentials: {
          email: this.email,
          password: this.password
        },
        rememberMe: this.rememberMe
      }).then(() => {
        console.log('You were logged in')
      }).catch(error => {
        alert(error && error.response && error.response.status === 401
          ? 'Wrong e-mail or password'
          : 'Something went wrong'
        )
      })
    }
  }
}
</script>

<style>
  label strong {
    display: inline-block;
    width: 120px;
  }
</style>
```

10. Finally, update your `src/App.vue` file with the following content:

```vue
<template>
  <div id="app">
    <div v-if="ready">
      <div id="nav">
        <router-link to="/" v-if="logged">Home</router-link> |
        <router-link to="/about">About</router-link> |
        <router-link v-if="!logged" to="/login">Login</router-link> |
        <a href="#" @click.prevent="logoutButtonClicked()" v-if="logged">Logout</a>
      </div>
      <router-view/>
    </div>
    <div v-if="!ready">
      Loading ...
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('auth')

export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'ready',
      'logged',
    ])
  },
  methods: {
    ...mapActions([
      'logout'
    ]),
    logoutButtonClicked() {
      this.logout().then(() => console.log('You were logged out'))
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
```