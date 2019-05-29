import { deepMerge } from './utils'
import { EventEmitter } from 'events'
import createStoreModule from './store'
import { RefreshTokenException } from './exceptions'

export default class {
  constructor (store, options) {
    this.initializationSequence = new Promise((resolve, reject) => {
      this.initializeOptions(options)
        .then(() => this.initializeStore(store))
        .then(this.initializeTokenStoage.bind(this))
        .then(this.initializeTokenAutoRefresher.bind(this))
        .then(this.initializeLoggedUser.bind(this))
        .then(() => this.options.methods.initializedCallback.call(this))
        .then(resolve)
        .catch(error => {
          reject(error)
          this.options.methods.handleError.call(this, error)
        })
    })
  }

  async initializeOptions (options) {
    this.options = options
  }

  async initializeStore (store) {
    await store.registerModule(this.options.module, createStoreModule(this))
    let self = this
    this.store = {
      get 'wrapped' () {
        return store
      },

      async dispatch (action, ...params) {
        return store.dispatch(this.helpers.prefix + action, ...params)
      },

      commit (mutation, ...params) {
        return store.commit(this.helpers.prefix + mutation, ...params)
      },

      subscribe (callback) {
        return store.subscribe((mutation, state) => {
          mutation.type = this.helpers.unprefixName(mutation.type)
          return callback(mutation, state)
        })
      },

      getter (getter) {
        return store.getters[this.helpers.prefix + getter]
      },

      helpers: {
        get 'prefix' () {
          return `${self.options.module}/`
        },

        unprefixName (prefixedName) {
          return prefixedName.slice(this.prefix.length)
        }
      },

      mutationObserver: new EventEmitter()
    }
    this.store.subscribe((mutation, state) => {
      this.store.mutationObserver.emit(mutation.type, mutation.payload, state)
    })
  }

  async initializeTokenStoage () {
    if (this.options.autoSyncTokenStoage) {
      // Save token to the storage after `setToken` mutation was commited
      this.store.mutationObserver.on('setToken', () => {
        let token = this.store.getter('token')
        if (this.store.getter('rememberMe') && token !== undefined && token !== null) {
          this.options.drivers.tokenStorage.setToken(token)
        } else {
          this.options.drivers.tokenStorage.deleteToken()
        }
      })
      // Remove token from the storage after `logout` mutation was commited
      this.store.mutationObserver.on('logout', () => {
        this.options.drivers.tokenStorage.deleteToken()
      })
    }
  }

  async initializeTokenAutoRefresher () {
    if (this.options.autoRefreshToken) {
      let self = this
      this.tokenRefresher = {
        clearTimeout () {
          if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout)
          }
        },

        setTimeout (timeout) {
          this.clearTimeout()
          this.refreshTokenTimeout = setTimeout(this.refreshTokenHandler.bind(this), timeout * 1000)
        },

        async refreshTokenHandler () {
          if (self.store.getter('logged')) {
            await self.store.dispatch('refreshToken')
          }
        }
      }

      this.store.mutationObserver.on('setToken', async () => {
        this.tokenRefresher.clearTimeout()
        try {
          let token = this.store.getter('token')
          let decodedToken = this.options.drivers.tokenDecoder.decode(token)
          let now = Math.floor(0 + new Date() / 1000)
          let serverNowDelta = now - decodedToken.iat
          let refreshIn = decodedToken.exp - decodedToken.iat - serverNowDelta - this.options.refreshTokenSecondsAhead
          refreshIn = Math.max(this.options.minRefreshTokenSeconds, refreshIn)
          refreshIn = Math.min(this.options.maxRefreshTokenSeconds, refreshIn)
          this.tokenRefresher.setTimeout(refreshIn)
        } catch (e) {
          throw new RefreshTokenException()
        }
      })
    }
  }

  async initializeLoggedUser () {
    if (this.options.autoInitialize) {
      await this.store.dispatch('initialize')
    }
  }

  async initializeRouter (router, routerOptions) {
    this.router = router
    this.routerOptions = routerOptions

    await this.initializationSequence

    return new Promise((resolve, reject) => {
      this.router.onReady(async () => {
        try {
          await this.initializeRouterGuard()
          await this.initializeRouterRedirects()
          await this.redirectIfNeed()
          await this.store.commit('setInitializedRouter')
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async initializeRouterGuard () {
    this.router.beforeEach((to, from, next) => {
      if (to.matched.some(route => route.meta[this.routerOptions.authMeta.key] === this.routerOptions.authMeta.value.authenticated)) {
        // Accesing route only for authenticated users
        if (this.store.getter('logged')) {
          // We are logged, so we can continue
          next()
        } else {
          // We are not logged, so we need to login first
          next(deepMerge(
            { params: { nextUrl: to.fullPath } },
            this.routerOptions.redirects.unauthenticated
          ))
        }
      } else if (to.matched.some(route => route.meta[this.routerOptions.authMeta.key] === this.routerOptions.authMeta.value.unauthenticated)) {
        // Accesing route only for unauthenticated users
        if (this.store.getter('logged')) {
          // We are logged, so we need to redirect
          next(this.routerOptions.redirects.authenticated)
        } else {
          // We are not logged, so we can continue
          next()
        }
      } else {
        // Accesing public route (for authenticated and also for unauthenticated users)
        next()
      }
    })
  }

  async initializeRouterRedirects () {
    this.store.subscribe(async (mutation, state) => {
      await this.redirectIfNeed()
    })
  }

  async redirectIfNeed () {
    if (this.router.currentRoute.matched.some(route =>
      route.meta[this.routerOptions.authMeta.key] ===
      this.routerOptions.authMeta.value.authenticated
    )) {
      // Accesing route only for authenticated users
      if (!this.store.getter('logged')) {
        // We are not logged, so we need to login first
        this.router.push(deepMerge(
          { params: { nextUrl: this.router.currentRoute.fullPath } },
          this.routerOptions.redirects.unauthenticated
        ))
      }
    } else if (this.router.currentRoute.matched.some(route =>
      route.meta[this.routerOptions.authMeta.key] ===
      this.routerOptions.authMeta.value.unauthenticated
    )) {
      // Accesing route only for unauthenticated users
      if (this.store.getter('logged')) {
        // We are logged, so we need to redirect
        this.router.push(this.routerOptions.redirects.authenticated)
      }
    }
  }
}
