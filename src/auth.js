import Vuex from 'vuex'
import { deepMerge } from './utils'
import createStoreModule from './store'
import { mergeOptions } from './options'
import { EventEmitter2 } from 'eventemitter2'

export class VueJwtAuth {
  constructor ({ Vue, router, store, options }) {
    if (!router) {
      throw 'VueRouter instance is required'
    }

    this.options = mergeOptions(options)
    Vue.prototype[this.options.vueProperty] = this
    this.router = router

    this.eventEmitter = new EventEmitter2({
      wildcard: true,
      maxListeners: 100,
      ...this.options.authEventEmitter2ExtraOptions,
    })

    if (!store) {
      Vue.use(Vuex)
      store = new Vuex.Store()
    }
    this.store = store

    this.initializeStore()
    this.initializeTokenStoage()
    this.initializeTokenAutoRefresher()
    this.initializeRouterGuard()
    this.initializeRouterRedirects()
    this.initializeEvents()

    if (this.options.autoLogout) {
      this.initializeAutoLogout()
    }

    if (this.options.autoInitializeLoggedUser) {
      this.initializeLoggedUser()
    }

    this.emit('ready', this)
  }

  initializeStore () {
    this.store.registerModule(this.options.module, createStoreModule(this))

    this.context = this.options.namespacedModule
      // TODO: Maybe there is cleaner way to retrieve module context
      ? this.store._modulesNamespaceMap[this.prefix('')].context
      : this.store

    this.store.subscribe((mutation, state) => {
      const unprefixedType = this.unprefix(mutation.type)
      this.emit(`mutation.${unprefixedType}`, {
        mutation: unprefixedType,
        payload: mutation.payload,
        context: this.context
      })
    })

    this.store.subscribeAction((action, state) => {
      const unprefixedType = this.unprefix(action.type)
      this.emit(`action.${unprefixedType}`, {
        action: unprefixedType,
        payload: action.payload,
        context: this.context
      })
    })
  }

  initializeTokenStoage () {
    if (this.options.autoSyncTokenStoage) {
      this.store.subscribe((mutation, state) => {
        // Save token to the storage after `setToken` mutation was commited
        if (mutation.type === this.prefix('setToken')) {
          let token = this.context.getters.token
          if (this.context.getters.rememberToken && token !== undefined && token !== null) {
            this.options.drivers.tokenStorage.setToken(token)
          } else {
            this.options.drivers.tokenStorage.deleteToken()
          }
        }
        // Remove token from the storage after `logout` mutation was commited
        if (mutation.type === this.prefix('logout')) {
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
            return self.context.dispatch('refreshToken')
          }
        }
      }

      this.store.subscribe((mutation, state) => {
        if (mutation.type === this.prefix('logout')) {
          this.tokenRefresher.clearTimeout()
        }
        if (mutation.type === this.prefix('setLogged') && !this.context.logged) {
          this.tokenRefresher.clearTimeout()
        }
        if (mutation.type === this.prefix('setToken')) {
          this.tokenRefresher.clearTimeout()
          let token = this.context.getters.token
          let decodedToken = this.options.drivers.tokenDecoder.decode(token)
          let now = Math.floor(0 + new Date() / 1000)
          let serverNowDelta = now - decodedToken.iat
          let refreshIn = decodedToken.exp - decodedToken.iat - serverNowDelta - this.options.refreshTokenSecondsAhead
          refreshIn = Math.max(this.options.minRefreshTokenSeconds, refreshIn)
          refreshIn = Math.min(this.options.maxRefreshTokenSeconds, refreshIn)
          this.tokenRefresher.setTimeout(refreshIn)
        }
      })
    }
  }

  initializeEvents () {
    this.eventEmitter.on('action.attemptLogin.after', (data) => {
      if (data.result) {
        this.eventEmitter.emit('login.success', data)
      } else {
        this.eventEmitter.emit('login.failed', data)
      }
    })
  }

  initializeAutoLogout () {
    this.options.drivers.idleDetector.registerEvents()
    this.options.drivers.idleDetector.resetTimer(false)

    this.on('mutation.setLogged', ({ payload }) => {
      if (payload) {
        this.options.drivers.idleDetector.resetTimer(false)
      }
    })

    this.options.drivers.idleDetector.onIdle(() => {
      if (this.context.getters.logged) {
        this.emit(`autoLogout`)
        this.context.dispatch('logout').then(() => {
          this.emit(`autoLogout.after`)
        })
      }
    })
  }

  initializeLoggedUser () {
    return this.context.dispatch('initialize')
  }

  initializeRouterGuard () {
    this.router.beforeEach((to, from, next) => {
      // If not ready, do nothing
      if (!this.context.getters.ready) {
        next()
        return
      }
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
      // If not ready, do nothing
      if (!this.context.getters.ready) {
        return
      }
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

  prefix (name) {
    if (name === null || name === undefined) {
      if (this.options.namespacedModule) {
        return this.options.module
      } else {
        return ''
      }
    } else {
      if (this.options.namespacedModule) {
        return `${this.options.module}/${name}`
      } else {
        return name
      }
    }
  }

  unprefix (name) {
    return (this.options.namespacedModule)
      ? name.slice(this.options.module.length + 1)
      : name
  }

  /* Proxy actions */
  initialize () {
    return this.context.dispatch('initialize')
  }
  attemptLogin (credentials, rememberToken) {
    return this.context.dispatch('attemptLogin', { credentials, rememberToken })
  }
  refreshToken () {
    return this.context.dispatch('refreshToken')
  }
  fetchUser () {
    return this.context.dispatch('fetchUser')
  }
  logout () {
    return this.context.dispatch('logout')
  }

  /* Proxy getters */
  get logged () {
    return this.context.getters.logged
  }
  get ready () {
    return this.context.getters.ready
  }
  get user () {
    return this.context.getters.user
  }
  get token () {
    return this.context.getters.token
  }
  get decodedToken () {
    return this.context.getters.decodedToken
  }
  get rememberToken () {
    return this.context.getters.rememberToken
  }

  /* Proxy emitter */
  on (...params) {
    return this.eventEmitter.on(...params)
  }

  prependListener (...params) {
    return this.eventEmitter.prependListener(...params)
  }

  onAny (...params) {
    return this.eventEmitter.onAny(...params)
  }

  prependAny (...params) {
    return this.eventEmitter.prependAny(...params)
  }

  once (...params) {
    return this.eventEmitter.once(...params)
  }

  prependOnceListener (...params) {
    return this.eventEmitter.prependOnceListener(...params)
  }

  many (...params) {
    return this.eventEmitter.many(...params)
  }

  prependMany (...params) {
    return this.eventEmitter.prependMany(...params)
  }

  removeListener (...params) {
    return this.eventEmitter.removeListener(...params)
  }

  off (...params) {
    return this.eventEmitter.off(...params)
  }

  offAny (...params) {
    return this.eventEmitter.offAny(...params)
  }

  emit (...params) {
    return this.eventEmitter.emit(...params)
  }
}
