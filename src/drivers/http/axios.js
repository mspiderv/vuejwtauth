import axios from 'axios'
import { deepMerge } from '../../utils'

export const AxiosHttpDriverDefaultOptions = {
  tokenType: 'Bearer',
  apiBaseURL: '/',
  authorizationHeader: 'Authorization',
  responseChecker (response) {
    return true
  }
}

export class AxiosHttpDriver {
  constructor (options) {
    this.options = deepMerge(AxiosHttpDriverDefaultOptions, options)
  }

  async sendRequest (method, url, data = {}, config = {}) {
    return axios.request({
      method,
      url,
      data,
      baseURL: this.options.apiBaseURL,
      ...config
    })
      .then(response => {
        if (this.options.responseChecker && !this.options.responseChecker(response)) {
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
