export default function (auth) {
  return {
    setToken (state, token) {
      state.token = token
    },

    setReady (state) {
      state.ready = true
    },

    setUser (state, user) {
      state.user = user || {}
    },

    logout (state) {
      state.token = null
      state.user = {}
    },

    setRememberMe (state, rememberMe) {
      state.rememberMe = !!rememberMe
    }
  }
}
