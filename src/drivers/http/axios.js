import axios from 'axios'
import { deepMerge } from '../../utils'

export const AxiosHttpDriverDefaultOptions = {
  tokenType: 'Bearer',
  apiBaseURL: '/',
  authorizationHeader: 'Authorization'
}

export class AxiosHttpDriver {
  constructor (options) {
    this.options = deepMerge(AxiosHttpDriverDefaultOptions, options)
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
