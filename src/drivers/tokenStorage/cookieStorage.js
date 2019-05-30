import cookies from 'browser-cookies'
import { deepMerge } from '../../utils'

export const defaultOptions = {
  tokenKey: 'auth_token',
  setConfig: {}
}

export default class {
  constructor (options) {
    this.options = deepMerge(defaultOptions, options)
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
