import { deepMerge } from './utils'
import { AxiosHttpDriver, DefaultJwtTokenDecoder, CookieTokenStorageDriver, IdleDetectionDriver } from './drivers'

import * as methods from './methods'

export const defaultOptions = {
  vueProperty: '$auth',
  module: 'auth',
  namespacedModule: true,

  autoLogout: true,

  autoInitializeLoggedUser: true,

  fetchUserAfterLogin: true,
  refreshTokenAfterLogin: true,
  fetchUserAfterTokenRefreshed: true,

  storeModuleExtras: {},

  // If true, automatically call `setToken` and `deleteToken` methods on the token storage driver instance, whenever
  // `setToken` or `logout` mutations were commited on the auth store.
  autoSyncTokenStoage: true,

  autoRefreshToken: true,

  // "Auth library, please do NOT refresh my token more often than every {value} seconds"
  minRefreshTokenSeconds: 10,

  // "Auth library, please DO refresh my token more often than every {value} seconds"
  maxRefreshTokenSeconds: 3600, // one hour

  // "Auth library, please refresh my token {value} seconds before it expires"
  refreshTokenSecondsAhead: 10,

  authEventEmitter2ExtraOptions: {},

  drivers: {
    http: new AxiosHttpDriver(),
    tokenDecoder: new DefaultJwtTokenDecoder(),
    tokenStorage: new CookieTokenStorageDriver(),
    idleDetector: new IdleDetectionDriver(),
  },

  apiEndpoints: {
    fetchUser: {
      method: 'post',
      url: 'user'
    },
    logout: {
      method: 'post',
      url: 'logout'
    },
    refreshToken: {
      method: 'post',
      url: 'refresh'
    },
    login: {
      method: 'post',
      url: 'login'
    }
  },

  methods,

  authMeta: {
    key: 'auth',
    value: {
      authenticated: true,
      unauthenticated: false
    }
  },
  // Those objects will be directly passed into router.push()
  redirects: {
    unauthenticated: { path: '/login' },
    authenticated: { path: '/' }
  }
}

export function mergeOptions (options) {
  return deepMerge(defaultOptions, options)
}
