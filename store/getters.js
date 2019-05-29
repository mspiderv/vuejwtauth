export default function (auth) {
  return {

    ready (state) {
      return state.initializedUser === true && state.initializedRouter === true
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

    rememberMe (state) {
      return state.rememberMe
    }
  }
}
