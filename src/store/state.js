export default function (auth) {
  return {
    /**
     * This can be one of these values:
     *  null - means, initializing process has not finished yet
     *  true - user is logged in
     *  false - user is NOT logged in
     */
    logged: null,

    /**
     * Holding the user object
     */
    user: {},

    /**
     * Holding actual access token
     */
    token: null,

    /**
     * Holding the information, whether user wants to be remembered. In case when this is `true`, access token will be
     * remembered using the token storage.
     */
    rememberToken: false
  }
}
