# JSON Web Tokens auth for [Vue.js](https://vuejs.org/) and [Quasar](https://quasar.dev/)

**This is a client-side** [JSON Web Tokens (JWT)](https://jwt.io/) authentication package for [Vue.js](https://vuejs.org/) and [Quasar](https://quasar.dev/) applications.

**This is not a server-side solution.** If you need a server-side JWT auth, then take a look at our Laravel server-side package. - *comming soon*

## Features

 - **Login** functionality.
 - **Remember me** functionality. Stores JWT in *token storage*, using one of the following drivers:
   - `cookie` driver (*recommended*).
   - `localStorage` driver.
   - You can create your own *token storage* driver.
 - **Logout** functionality.
   - Automatically logout idle users (after 5 minutes by default, but you can configure it or fully disable).
 - **Fetch user** functionality (retrieve any extra information about logged user from API).
 - **Automatically refreshes JWT** to make it valid for ever (based on JWT `exp` property).
 - **Decodes JWT** to JSON.
   - Allows you to read information from JWT directly.
   - Uses [jwt-decode](https://github.com/auth0/jwt-decode) under the hood.
   - You can create your own *token decoder* driver.
 - Sends HTTP requests to your JWT auth API, using one of the following drivers:
   - [Axios](https://github.com/axios/axios) HTTP driver.
   - You can create your own *HTTP* driver.
 - Uses [Vuex](https://vuex.vuejs.org/) under the hood, which allows you to use all Vuex module functionality directly.
 - Fully [configurable](docs/configuration.md).

## Contents

1. [Installation](docs/installation.md)
2. [Usage](docs/usage.md)
3. [Protecting routes](docs/protect-routes.md)
4. [Configuration](docs/configuration.md)

## Requirements

1. This package assumes, you use [VueRouter](https://router.vuejs.org/) in your application.
2. JWT auth server. (Do you need a server-side JWT auth solution? Take a look at our Laravel server-side package - *comming soon*)

## Thanks to

These are the main packages we use under the hood.

 - [axios](https://github.com/axios/axios)
 - [voltace/browser-cookies](https://github.com/voltace/browser-cookies)
 - [TehShrike/deepmerge](https://github.com/TehShrike/deepmerge)
 - [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)
 - [auth0/jwt-decode](https://github.com/auth0/jwt-decode)
