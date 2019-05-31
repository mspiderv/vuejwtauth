export default function (auth) {
  return {

    ready (state) {
      return state.ready
    },

    logged (state) {
      return state.token !== null && state.token !== undefined
    },

    user (state) {
      return state.user
    },

    token (state) {
      return state.token
    },

    decodedToken (state) {
      return auth.options.drivers.tokenDecoder.decode(state.token)
    },

    rememberToken (state) {
      return state.rememberToken
    }
  }
}
