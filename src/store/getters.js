export default function (auth) {
  return {

    logged (state) {
      return state.logged
    },

    ready (state) {
      return state.logged === true || state.logged === false
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
