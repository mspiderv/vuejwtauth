export default function (auth) {
  let o = auth.options
  let d = o.drivers
  let m = o.methods
  return {

    /**
     * This method is responsible for sending API HTTP request for fetching user data and for processing the response.
     * This method assumes, we already have some token set in the store.
     */
    async fetchUser (context) {
      const user = await m.fetchUser.call(
        { auth, context },
        o.apiEndpoints.fetchUser.method,
        o.apiEndpoints.fetchUser.url,
        context.getters.token
      ).then(m.mapFetchUserResponseToUserData.bind({ auth, context }))

      context.commit('setUser', user)

      return user
    },

    /**
     * This method is responsible for sending API HTTP request for server-side logout.
     * This method assumes, we already have some token set in the store.
     */
    async logout (context) {
      let token = context.getters.token
      context.commit('logout')
      return m.serverSideLogout.call(
        { auth, context },
        o.apiEndpoints.logout.method,
        o.apiEndpoints.logout.url,
        token
      )
    },

    /**
     * This method is responsible for sending API HTTP request for refreshing token.
     * This method assumes, we already have some token set in the store.
     */
    async refreshToken (context) {
      const token = await m.refreshToken.call(
          { auth, context },
          o.apiEndpoints.refreshToken.method,
          o.apiEndpoints.refreshToken.url,
          context.getters.token
        )
        .then(m.mapRefreshTokenResponseToToken.bind({ auth, context }))

      context.commit('setToken', token)

      if (auth.options.fetchUserAfterTokenRefreshed) {
        await context.dispatch('fetchUser')
      }

      return token
    },

    async initialize (context) {
      let token = await d.tokenStorage.getToken()
      if (token) {
        context.commit('setToken', token)
        context.commit('setRememberMe', true)
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
