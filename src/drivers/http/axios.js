import axios from 'axios'
import { deepMerge } from '../../utils'

export const defaultOptions = {
  tokenType: 'Bearer',
  apiBaseURL: '/',
  authorizationHeader: 'Authorization'
}

export default class {
  constructor (options) {
    this.options = deepMerge(defaultOptions, options)
  }

  // Send request helpers
  async sendRequest (method, url, data = {}, config = {}) {
    return axios.request({
      method,
      url,
      data,
      baseURL: this.options.apiBaseURL,
      ...config
    })
      .then(response => {
        if (!response || !response.data || !response.data.status || response.data.status !== 'success') {
          throw new Error('API request failed')
        }

        return response
      })
  }

  async sendAuthenticatedRequest (method, url, token, data = {}, config = {}) {
    return this.sendRequest(method, url, data, {
      headers: {
        [this.options.authorizationHeader]: `${this.options.tokenType} ${token}`
      },
      ...config
    })
  }
}
