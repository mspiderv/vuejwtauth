import jwtDecode from 'jwt-decode'
import { deepMerge } from '../../utils'

export const DefaultJwtTokenDecoderDefaultOptions = {
  //
}

export class DefaultJwtTokenDecoder {
  constructor (options) {
    this.options = deepMerge(DefaultJwtTokenDecoderDefaultOptions, options)
  }

  /**
   * This method will accept encoded JWT token (string) and should return decoded token (JSON object)
   *
   * @param token encoded JWT token (string)
   * @returns decoded token (JSON object)
   */
  decode (token) {
    try {
      return jwtDecode(token)
    } catch (e) {
      return null
    }
  }
}
