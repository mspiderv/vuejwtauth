import cookies from 'browser-cookies'
import { deepMerge } from '../../utils'

export const CookieTokenStorageDriverDefaultOptions = {
  tokenKey: 'auth_token',
  setConfig: {}
}

export class CookieTokenStorageDriver {
  constructor (options) {
    this.options = deepMerge(CookieTokenStorageDriverDefaultOptions, options)
  }

  async setToken (token) {
    cookies.set(this.options.tokenKey, token, this.options.setConfig)
  }

  async deleteToken () {
    cookies.erase(this.options.tokenKey)
  }

  async getToken () {
    return cookies.get(this.options.tokenKey)
  }
}
