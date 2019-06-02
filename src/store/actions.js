export default function (auth) {
  // Shortcuts
  let { options } = auth
  let { drivers, methods } = options

  // Helpers
  function emitAfterActionEvent (action, result) {
    auth.emit(`action.${action}.after`, {
      action: action,
      result: result,
      context: auth.context
    })
  }

  return {
    /**
     * This method is responsible for:
     *  - trying to log user in using the remembered token
     *  - setting `logged` state (from `null`) to `true` or `false`
     *  - setting `token` state (if logging in using the remembered login was successful)
     *  - setting `rememberToken` state to `true` (if logging in using the remembered login was successful)
     *
     * This method assumes:
     *  - store is in the initial state
     *  - no other actions were dispatched before this one
     *  - we maybe have some remembered token
     *
     * This method should resolve:
     *  - right after the `logged`, `token` and `rememberToken` states were set
     *
     * This method should consider these options:
     *  - fetchUserAfterLogin
     *  - fetchUserAfterTokenRefreshed
     *
     * @param context
     * @return Promise<logged>
     */
    async initialize (context) {
      let token = await drivers.tokenStorage.getToken()
      if (token) {
        context.commit('setToken', token)
        context.commit('setRememberToken', true)
        try {
          await context.dispatch('refreshToken')
          context.commit('setLogged', true)
        } catch (error) {
          await context.commit('logout')
        }
        if (context.getters.logged && !auth.options.fetchUserAfterTokenRefreshed && auth.options.fetchUserAfterLogin) {
          // We do NOT wait for user fetching finishes
          context.dispatch('fetchUser')
        }
      } else {
        context.commit('setLogged', false)
      }

      const logged = context.getters.logged
      emitAfterActionEvent('initialize', logged)
      return logged
    },

    /**
     * This method is responsible for:
     *  - sending HTTP request to API for logging the user in using the given credentials
     *  - setting the `rememberToken` state
     *  - setting the `logged` state
     *  - setting the `token` state
     *
     * This method assumes:
     *  - user is NOT logged in
     *
     * This method should resolve:
     *  - right after the `logged`, `rememberToken` and `token` states were set
     *
     * This method should consider these options:
     *  - apiEndpoints.login.method
     *  - apiEndpoints.login.url
     *  - fetchUserAfterLogin
     *  - refreshTokenAfterLogin
     *  - fetchUserAfterTokenRefreshed
     *
     * @param context
     * @param credentials
     * @param rememberToken
     * @return Promise<logged>
     */
    async attemptLogin (context, { credentials, rememberToken }) {
      context.commit('logout')
      context.commit('setRememberToken', rememberToken)

      // Wait for this result, so caller context will be resolved after this finishes
      await methods.attemptLogin.call(
        { auth, context },
        options.apiEndpoints.login.method,
        options.apiEndpoints.login.url,
        credentials,
        context.getters.token
      )
        .then(methods.mapLoginResponseToToken.bind({ auth, context }))
        .then(token => context.commit('setToken', token))
        .then(() => context.commit('setLogged', true))

      // Run following code asynchronously, so the caller context will NOT wait until this finishes
      setTimeout(async () => {
        if (context.getters.logged) {
          if (auth.options.refreshTokenAfterLogin) {
            await context.dispatch('refreshToken')
          }
          if (!auth.options.fetchUserAfterTokenRefreshed && auth.options.fetchUserAfterLogin) {
            await context.dispatch('fetchUser')
          }
        }
      }, 0)

      const logged = context.getters.logged
      emitAfterActionEvent('attemptLogin', logged)
      return logged
    },

    /**
     * This method is responsible for:
     *  - sending HTTP request to API for refreshing token
     *  - updating `token` state
     *
     * This method assumes:
     *  - we already have the access token set in the store
     *
     * This method should resolve:
     *  - right after the `token` state was updated (token was refreshed)
     *
     *  This method should consider these options:
     *  - apiEndpoints.refreshToken.method
     *  - apiEndpoints.refreshToken.url
     *  - fetchUserAfterTokenRefreshed
     *
     * @param context
     * @return Promise<token>
     */
    async refreshToken (context) {
      const token = await methods.refreshToken.call(
        { auth, context },
        options.apiEndpoints.refreshToken.method,
        options.apiEndpoints.refreshToken.url,
        context.getters.token
      )
        .then(methods.mapRefreshTokenResponseToToken.bind({ auth, context }))

      context.commit('setToken', token)

      // We do NOT wait for user fetching finishes
      if (auth.options.fetchUserAfterTokenRefreshed) {
        context.dispatch('fetchUser')
      }

      emitAfterActionEvent('refreshToken', token)
      return token
    },

    /**
     * This method is responsible for:
     *  - sending HTTP request to API for fetching user data
     *  - setting `user` state
     *
     * This method assumes:
     *  - we already have the access token set in the store
     *
     * This method should resolve:
     *  - right after the `token` state was set (user was fetched)
     *
     *  This method should consider these options:
     *   - apiEndpoints.fetchUser.method
     *   - apiEndpoints.fetchUser.url
     *
     * @param context
     * @return Promise<user>
     */
    async fetchUser (context) {
      const user = await methods.fetchUser.call(
        { auth, context },
        options.apiEndpoints.fetchUser.method,
        options.apiEndpoints.fetchUser.url,
        context.getters.token
      )
        .then(methods.mapFetchUserResponseToUserData.bind({ auth, context }))

      context.commit('setUser', user)

      emitAfterActionEvent('fetchUser', user)
      return user
    },

    /**
     * This method is responsible for:
     *  - performing client-side logout (committing `logout` mutation)
     *  - sending HTTP request to API for server-side logout
     *
     * This method assumes:
     *  - we already have the access token set in the store
     *
     * This method should resolve:
     *  - right after the server-side logout was finished
     *
     * This method should consider these options:
     *  - apiEndpoints.logout.method
     *  - apiEndpoints.logout.url
     *
     * @param context
     * @return Promise<response>
     */
    async logout (context) {
      let token = context.getters.token

      context.commit('logout')

      return methods.serverSideLogout.call(
        { auth, context },
        options.apiEndpoints.logout.method,
        options.apiEndpoints.logout.url,
        token
      )
        .then(response => {
          emitAfterActionEvent('logout', response)
          return response
        })
    }
  }
}
