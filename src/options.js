import { deepMerge } from './utils'
import AxiosHttpDriver from './drivers/http/axios'
import CookieTokenStorageDriver from './drivers/tokenStorage/cookieStorage'
import JwtTokenDecoder from './drivers/tokenDecoder/jwtDecode'

import * as methods from './methods'

export const defaultAuthOptions = {
  module: 'auth',
  namespacedModule: true,

  autoInitialize: true,

  fetchUserAfterLogin: false,
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

  drivers: {
    http: new AxiosHttpDriver(),
    tokenStorage: new CookieTokenStorageDriver(),
    tokenDecoder: new JwtTokenDecoder()
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

  methods
}

export const defaultRouterOptions = {
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

export function mergeAuthOptions (options) {
  return deepMerge(defaultAuthOptions, options)
}

export function mergeRouterOptions (options) {
  return deepMerge(defaultRouterOptions, options)
}
