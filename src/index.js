import Auth from './auth'
import { createNamespacedHelpers } from 'vuex'
import { mergeAuthOptions, mergeRouterOptions } from './options'

let global = {
  auth: null,
  authOptions: null,
  router: null,
  routerOptions: null,
  callbackCalled: false,
  check: {
    auth: {
      set () {
        if (global.auth === null) {
          throw Error('Auth was not initialized yet')
        }
      },
      unset () {
        if (global.auth !== null) {
          throw Error('Auth was already initialized')
        }
      }
    },
    router: {
      set () {
        if (global.router === null) {
          throw Error('Router was not initialized yet')
        }
      },
      unset () {
        if (global.router !== null) {
          throw Error('Router was already initialized')
        }
      }
    }
  },
  tryToRunCallback () {
    if (this.callbackCalled === false && this.auth !== null && this.router !== null) {
      this.callbackCalled = true
      this.callback(this.auth, this.authOptions, this.router, this.routerOptions)
    }
  },
  // This function will be called when both router and auth were set
  callback (auth, authOptions, router, routerOptions) {
    auth.initializeRouter(router, routerOptions)
  }
}

// This will call after router was initialized
export function authGuard (router, options) {
  global.check.auth.unset()
  global.routerOptions = mergeRouterOptions(options)
  global.router = router
  global.tryToRunCallback()
  return router
}

// This will call after store module was initialized
export function createAuthStoreModule (options) {
  global.check.auth.unset()
  global.authOptions = mergeAuthOptions(options)
  return store => {
    global.auth = new Auth(store, global.authOptions)
    global.tryToRunCallback()
  }
}

export function createAuthHelpers () {
  global.check.auth.set()
  return createNamespacedHelpers(global.auth.options.module)
}
