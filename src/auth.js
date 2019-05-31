import { deepMerge } from './utils'
import { EventEmitter } from 'events'
import createStoreModule from './store'
import { mergeOptions } from './options'
import { RefreshTokenException } from './exceptions'

export class VueJwtAuth {
  constructor (router, store, options) {
    this.store = store
    this.router = router
    this.options = mergeOptions(options)

    try {
      this.initialize()
      this.options.methods.onReady.call(this)
    } catch (error) {
      this.options.methods.handleError.call(this, error)
    }
  }

  initialize () {
    this.initializeStore()
    this.initializeTokenStoage()
    this.initializeTokenAutoRefresher()
    this.initializeLoggedUser()
    this.initializeRouterGuard()
    this.initializeRouterRedirects()
  }

  initializeStore () {
    this.store.registerModule(this.options.module, createStoreModule(this))
    // TODO: Maybe there is cleaner way to retrieve module context
    this.context = this.store._modulesNamespaceMap[this.options.module + '/'].context
  }

  initializeTokenStoage () {
    if (this.options.autoSyncTokenStoage) {
      this.store.subscribe((mutation, state) => {
        // Save token to the storage after `setToken` mutation was commited
        if (mutation.type === `${this.options.module}/setToken`) {
          let token = this.context.getters.token
          if (this.context.getters.rememberToken && token !== undefined && token !== null) {
            this.options.drivers.tokenStorage.setToken(token)
          } else {
            this.options.drivers.tokenStorage.deleteToken()
          }
        }
        // Remove token from the storage after `logout` mutation was commited
        if (mutation.type === `${this.options.module}/logout`) {
          this.options.drivers.tokenStorage.deleteToken()
        }
      })
    }
  }

  // TODO: spravit z toho `TokenRefresherDriver`
  // tie optiony ktore sa toho tykaju dat ako default config toho drivera
  initializeTokenAutoRefresher () {
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

        refreshTokenHandler () {
          if (self.context.getters.logged) {
            self.context.dispatch('refreshToken')
          }
        }
      }

      this.store.subscribe((mutation, state) => {
        if (mutation.type === `${this.options.module}/setToken`) {
          this.tokenRefresher.clearTimeout()
          try {
            let token = this.context.getters.token
            let decodedToken = this.options.drivers.tokenDecoder.decode(token)
            let now = Math.floor(0 + new Date() / 1000)
            let serverNowDelta = now - decodedToken.iat
            let refreshIn = decodedToken.exp - decodedToken.iat - serverNowDelta - this.options.refreshTokenSecondsAhead
            refreshIn = Math.max(this.options.minRefreshTokenSeconds, refreshIn)
            refreshIn = Math.min(this.options.maxRefreshTokenSeconds, refreshIn)
            this.tokenRefresher.setTimeout(refreshIn)
          } catch (e) {
            // TODO: toto nejako domysliet
            throw new RefreshTokenException()
          }
        }
      })
    }
  }

  initializeLoggedUser () {
    if (this.options.autoInitialize) {
      this.context.dispatch('initialize')
    }
  }

  initializeRouterGuard () {
    this.router.beforeEach((to, from, next) => {
      if (to.matched.some(route => route.meta[this.options.authMeta.key] === this.options.authMeta.value.authenticated)) {
        // Accesing route only for authenticated users
        if (this.context.getters.logged) {
          // We are logged, so we can continue
          next()
        } else {
          // We are not logged, so we need to login first
          next(deepMerge(
            { params: { nextUrl: to.fullPath } },
            this.options.redirects.unauthenticated
          ))
        }
      } else if (to.matched.some(route => route.meta[this.options.authMeta.key] === this.options.authMeta.value.unauthenticated)) {
        // Accesing route only for unauthenticated users
        if (this.context.getters.logged) {
          // We are logged, so we need to redirect
          next(this.options.redirects.authenticated)
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

  initializeRouterRedirects () {
    this.store.subscribe((mutation, state) => {
      this.redirectIfNeed()
    })
  }

  redirectIfNeed () {
    if (this.router.currentRoute.matched.some(route =>
      route.meta[this.options.authMeta.key] ===
      this.options.authMeta.value.authenticated
    )) {
      // Accesing route only for authenticated users
      if (!this.context.getters.logged) {
        // We are not logged, so we need to login first
        this.router.push(deepMerge(
          { params: { nextUrl: this.router.currentRoute.fullPath } },
          this.options.redirects.unauthenticated
        ))
      }
    } else if (this.router.currentRoute.matched.some(route =>
      route.meta[this.options.authMeta.key] ===
      this.options.authMeta.value.unauthenticated
    )) {
      // Accesing route only for unauthenticated users
      if (this.context.getters.logged) {
        // We are logged, so we need to redirect
        this.router.push(this.options.redirects.authenticated)
      }
    }
  }
}
