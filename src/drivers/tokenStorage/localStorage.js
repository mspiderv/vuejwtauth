import { deepMerge } from '../../utils'

export const LocalStorageTokenStorageDriverDefaultOptions = {
  tokenKey: 'auth_token'
}

export class LocalStorageTokenStorageDriver {
  constructor (options) {
    this.options = deepMerge(LocalStorageTokenStorageDriverDefaultOptions, options)
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
