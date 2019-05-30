import { deepMerge } from '../../utils'

export const defaultOptions = {
  tokenKey: 'auth_token'
}

export default class {
  constructor (options) {
    this.options = deepMerge(defaultOptions, options)
  }

  async setToken (token) {
    localStorage.setItem(this.options.tokenKey, token)
  }

  async deleteToken () {
    localStorage.removeItem(this.options.tokenKey)
  }

  async getToken () {
    return localStorage.getItem(this.options.tokenKey)
  }
}
