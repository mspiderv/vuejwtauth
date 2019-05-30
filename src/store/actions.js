export default function (auth) {
  let o = auth.options
  let m = o.methods
  return {

    /**
     * This method is responsible for sending API HTTP request for fetching user data and for processing the response.
     * This method assumes, we already have some token set in the store.
     *
     * Methods call sequence:
     *  1. getToken
     *  2. fetchUser
     *  3. mapResponseToUserData
     *  4. checkUserObject
     *  5. setUser
     *
     * @param context
     * @returns Promise<user>
     */
    async fetchUser (context) {
      await m.fetchUser.call(
        { auth, context },
        o.apiEndpoints.fetchUser.method,
        o.apiEndpoints.fetchUser.url,
        await m.getToken.call({ auth, context })
      )
        .then(m.mapResponseToUserData.bind({ auth, context }))
        .then(m.checkUserObject.bind({ auth, context }))
        .then(m.setUser.bind({ auth, context }))
      await m.afterFetchUser.call({ auth, context })
      return m.getUser.call({ auth, context })
    },

    /**
     * This method is responsible for sending API HTTP request for server-side logout.
     * This method assumes, we already have some token set in the store.
     *
     * Methods call sequence:
     *  1. getToken
     *  2. clientSideLogout
     *  3. serverSideLogout
     *  [4. handleServerSideLogoutError]
     *
     * @param context
     * @returns Promise<true>
     */
    async logout (context) {
      let token = await m.getToken.call({ auth, context })
      await m.clientSideLogout.call({ auth, context })
      m.serverSideLogout.call(
        { auth, context },
        o.apiEndpoints.logout.method,
        o.apiEndpoints.logout.url,
        token
      ).catch(m.handleServerSideLogoutError.bind({ auth, context }))
      await m.afterLogout.call({ auth, context })
      return true
    },

    /**
     * This method is responsible for sending API HTTP request for refreshing token.
     * This method assumes, we already have some token set in the store.
     *
     * Methods call sequence:
     *  1. getToken
     *  2. refreshToken
     *  3. mapRefreshResponseToToken
     *  4. setToken
     *
     * @param context
     * @returns Promise<token>
     */
    async refreshToken (context) {
      await m.refreshToken.call(
        { auth, context },
        o.apiEndpoints.refreshToken.method,
        o.apiEndpoints.refreshToken.url,
        await m.getToken.call({ auth, context })
      )
        .then(m.mapRefreshResponseToToken.bind({ auth, context }))
        .then(m.setToken.bind({ auth, context }))
        .then(() => {
          if (auth.options.fetchUserAfterTokenRefreshed) {
            return context.dispatch('fetchUser')
          }
        })
      await m.afterRefreshToken.call({ auth, context })
      return m.getToken.call({ auth, context })
    },

    /**
     *
     * @param context
     * @return Promise<token|false>
     */
    async initialize (context) {
      let token = await m.getRememberedToken.call({ auth, context })
      if (token) {
        await m.setRememberMe.call({ auth, context }, true)
        await m.setToken.call({ auth, context }, token)
        try {
          await context.dispatch('refreshToken')
          if (auth.options.fetchUserAfterRememberedLogin) {
            await context.dispatch('fetchUser')
          }
        } catch (error) {
          await context.dispatch('logout')
        }
      }
      await m.setInitializedUser.call({ auth, context })
      await m.afterInitialize.call({ auth, context })
      return token || false
    },

    async attemptLogin (context, { credentials, rememberMe }) {
      await m.setRememberMe.call({ auth, context }, rememberMe)
      await m.attemptLogin.call(
        { auth, context },
        o.apiEndpoints.login.method,
        o.apiEndpoints.login.url,
        credentials,
        await m.getToken.call({ auth, context })
      )
        .then(m.mapLoginResponseToToken.bind({ auth, context }))
        .then(m.setToken.bind({ auth, context }))
      if (auth.options.refreshTokenAfterLogin) {
        await context.dispatch('refreshToken')
      }
      if (auth.options.fetchUserAfterLogin) {
        await context.dispatch('fetchUser')
      }
      await m.afterLogin.call({ auth, context })
    }
  }
}
