## Usage

Inside your Vue component scripts, you can access auth via `this.$auth`.
Inside your templates via `$auth`

### Available functions

You can call following functions on the `$auth` object:

 - `attemptLogin(credentials, rememberToken).then(logged => ...).catch(fail => ...)`
 - `logout().then(response => ...)`

You can also call following functions, but in most cases you will not, because those are called automatically, by default. You can change this behavior in [options object](configuration.md).

 - `initialize().then(logged => ...)` - Called automatically in `VueJwtAuth` constructor, by default.
 - `refreshToken().then(token => ...)` - Called automatically a few seconds before current token expiration, by default.
 - `fetchUser().then(user => ...)` - Called automatically after login and after token refresh, by default.

### Available properties

You can also access following properties:

 - `logged` - Is user logged in?
 - `ready` - Is auth initialized? If not, you should show *Loading...* for your users.
 - `user` - User object (fetched by `fetchUser`)
 - `token` - Access token (string)
 - `decodedToken` - Access token (object)
 - `rememberToken` - Remember current token in token storage?

### Example code snippets

Feel free to copy&pase following snippets.

###### Code snippet of your main `App.vue` template.

```vue
<template>
  <div>
    <div v-if="$auth.ready">
      <router-view />
    </div>
    <div v-if="!$auth.ready">
      Loading ...
    </div>
  </div>
</template>
```

###### Code snippet of your main `Login.vue` component.

```vue
<template>
  <div>
    <h4>Login form</h4>
    <p><label><strong>E-mail:</strong> <input type="email" v-model="email"></label></p>
    <p><label><strong>Password:</strong> <input type="password" v-model="password"></label></p>
    <p><label><input type="checkbox" v-model="rememberMe"> Remember me</label></p>
    <p><button @click="login">Submit</button></p>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: '',
        rememberMe: false
      }
    },
    methods: {
      login() {
        this.$auth.attemptLogin(
          {
            email: this.email,
            password: this.password
          },
          this.rememberMe
        ).then(() => {
          console.log('You were logged in')
        }).catch(error => {
          console.log(error && error.response && error.response.status === 401
                  ? 'Wrong e-mail or password'
                  : 'Something went wrong'
          )
        })
      }
    }
  }
</script>
```

###### Code snippet of your main `LogoutButton.vue` component.

```vue
<template>
  <a href="#" @click.prevent="logout()" v-if="$auth.logged">Logout</a>
</template>

<script>
export default {
  name: 'LogoutButton',
  methods: {
    logout() {
      this.$auth
        .logout()
        .then(() => console.log('Server-side logout finished'))
        .catch(error => console.error('Server-side logout failed'))
      console.log('Client-side logout finished')
    }
  }
}
</script>
```

###### Continue reading to [Protecting routes](protect-routes.md)
