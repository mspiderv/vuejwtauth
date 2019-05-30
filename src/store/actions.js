export default function (auth) {
  let o = auth.options
  let m = o.methods
  return {

    /**
     * This method is responsible for sending API HTTP request for fetching user data and for processing the response.
     * This method assumes, we already have some token set in the store.
     */
    async fetchUser (context) {
      await m.fetchUser.call(
        { auth, context },
        o.apiEndpoints.fetchUser.method,
        o.apiEndpoints.fetchUser.url,
        context.getters.token
      )
        .then(m.mapResponseToUserData.bind({ auth, context }))
        .then(m.checkUserObject.bind({ auth, context }))
        .then(user => context.commit('setUser', user))
      return context.getters.user
    },

    /**
     * This method is responsible for sending API HTTP request for server-side logout.
     * This method assumes, we already have some token set in the store.
     */
    async logout (context) {
      let token = context.getters.token
      context.commit('logout')
      m.serverSideLogout.call(
        { auth, context },
        o.apiEndpoints.logout.method,
        o.apiEndpoints.logout.url,
        token
      ).catch(m.handleServerSideLogoutError.bind({ auth, context }))
      return true
    },

    /**
     * This method is responsible for sending API HTTP request for refreshing token.
     * This method assumes, we already have some token set in the store.
     */
    async refreshToken (context) {
      await m.refreshToken.call(
        { auth, context },
        o.apiEndpoints.refreshToken.method,
        o.apiEndpoints.refreshToken.url,
        context.getters.token
      )
        .then(m.mapRefreshResponseToToken.bind({ auth, context }))
        .then(token => context.commit('setToken', token))
        .then(() => {
          if (auth.options.fetchUserAfterTokenRefreshed) {
            return context.dispatch('fetchUser')
          }
        })
      return context.getters.token
    },

    async initialize (context) {
      let token = await m.getRememberedToken.call({ auth, context })
      if (token) {
        context.commit('setRememberMe', true)
        context.commit('setToken', token)
        try {
          await context.dispatch('refreshToken')
          if (auth.options.fetchUserAfterRememberedLogin) {
            await context.dispatch('fetchUser')
          }
        } catch (error) {
          await context.dispatch('logout')
        }
      }
      context.commit('setInitializedUser')
      return token || false
    },

    async attemptLogin (context, { credentials, rememberMe }) {
      context.commit('setRememberMe', rememberMe)
      await m.attemptLogin.call(
        { auth, context },
        o.apiEndpoints.login.method,
        o.apiEndpoints.login.url,
        credentials,
        context.getters.token
      )
        .then(m.mapLoginResponseToToken.bind({ auth, context }))
        .then(token => context.commit('setToken', token))
      if (auth.options.refreshTokenAfterLogin) {
        await context.dispatch('refreshToken')
      }
      if (auth.options.fetchUserAfterLogin) {
        await context.dispatch('fetchUser')
      }
    }
  }
}
