export default function (auth) {
  return {
    setLogged (state, logged) {
      state.logged = !!logged
    },

    setUser (state, user) {
      state.user = user || {}
    },

    setToken (state, token) {
      state.token = token
    },

    setRememberToken (state, rememberToken) {
      state.rememberToken = !!rememberToken
    },

    logout (state) {
      state.logged = false
      state.user = {}
      state.token = null
      state.rememberToken = false
    }
  }
}
