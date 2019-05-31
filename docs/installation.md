## Installation

### Install dependency

Via yarn
```
yarn add @mspiderv/vuejwtauth
```

Via npm
```
npm install @mspiderv/vuejwtauth --save
```

### Update your application code

In order to use this library, you need to create a new instance of `VueJwtAuth` class and pass an object with these properties as the only constructor argument:
 - `Vue` - [Vue](https://vuejs.org/) class (**required argument**)
 - `router` - Your [VueRouter](https://router.vuejs.org/) instance (**required argument**)
 - `store` - Your [Vuex](https://vuejs.org/) instance (*optional argument*)
 - `options` - [Options object](configuration.md) (*optional argument*)

#### Example in Vue.js application

Add the following code to your `src/main.js`.

```vue
import { VueJwtAuth, AxiosHttpDriver } from '@mspiderv/vuejwtauth'

new VueJwtAuth({
  Vue, // required
  router, // required
  store, // optional
  options: { // optional
    drivers: {
      http: new AxiosHttpDriver({
        // Your API URL here
        apiBaseURL: 'http://127.0.0.1:3000/api/'
      })
    }
  }
})
```

The result `src/main.js` can looks like this.

```vue
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { VueJwtAuth, AxiosHttpDriver } from '@mspiderv/vuejwtauth'

Vue.config.productionTip = false

new VueJwtAuth({
  Vue, // required
  router, // required
  store, // optional
  options: { // optional
    drivers: {
      http: new AxiosHttpDriver({
        // Your API URL here
        apiBaseURL: 'http://127.0.0.1:3000/api/'
      })
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

```

###### Continue reading to [Usage](usage.md)
