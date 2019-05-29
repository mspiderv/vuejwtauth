import { FetchUserException } from './exceptions'

/**
 * This method is responsible for returning the current token (from store).
 *
 * @returns {Promise<token>}
 */
export async function getToken () {
  return this.context.getters.token
}

export async function getUser () {
  return this.context.getters.user
}

/**
 * This method is responsible for returning the remembered token (from token storage).
 *
 * @returns {Promise<token>}
 */
export async function getRememberedToken () {
  return this.auth.options.drivers.tokenStorage.getToken()
}

/**
 * This method is responsible for sending API HTTP request for fetching user data.
 *
 * Called after 'fetchUser' action.
 *
 * @param method
 * @param url
 * @param token
 * @returns {Promise<*>}
 */
export async function fetchUser (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

/**
 * This method is used for mapping API HTTP response to user object.
 *
 * Called after 'fetchUser' method.
 *
 * @param response
 * @returns user object
 */
export async function mapResponseToUserData (response) {
  return response.data.user
}

/**
 * This method should check incomming user object. If the check fails, it should throw any error.
 *
 * Called after 'mapResponseToUserData' method.
 *
 * @throws Any error if needed
 * @param user object
 * @returns the same user object
 */
export async function checkUserObject (user) {
  if (typeof user !== 'object') {
    throw new FetchUserException(`Failed to read user data from API HTTP response.`)
  }

  return user
}

/**
 * This method should set the current user and it should not perform any checks and should not throw any errors.
 *
 * Called after 'checkUserObject' method.
 *
 * @param user - Valid (checked) user object.
 * @returns void
 */
export async function setUser (user) {
  this.context.commit('setUser', user)
}

export async function clientSideLogout () {
  this.context.commit('logout')
}

export async function serverSideLogout (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

export async function handleServerSideLogoutError (error) {
  console.log('Error during logout on server side, but successfully logged out on client side.', error)
}

export async function refreshToken (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

/**
 * This method is used for mapping API HTTP response to token string.
 *
 * Called after 'refreshToken' method.
 *
 * @param response
 * @returns token
 */
export async function mapRefreshResponseToToken (response) {
  return response.data.token
}

/**
 * This method should set the current token and it should not perform any checks and should not throw any errors.
 *
 * Called after 'mapRefreshResponseToToken' method.
 *
 * @param token
 * @returns void
 */
export async function setToken (token) {
  this.context.commit('setToken', token)
}

export async function setInitializedUser () {
  this.context.commit('setInitializedUser')
}

export async function mapCredentialsToRequestData (credentials) {
  return credentials
}

export async function setRememberMe (rememberMe) {
  this.context.commit('setRememberMe', rememberMe)
}

export async function attemptLogin (method, url, credentials) {
  return this.auth.options.drivers.http.sendRequest(
    method,
    url,
    await this.auth.options.methods.mapCredentialsToRequestData(credentials)
  )
}

export async function mapLoginResponseToToken (response) {
  return response.data.token
}

/**
 * this points to auth instance
 * @return {Promise<void>}
 */
export async function initializedCallback () {
  console.log('Auth::initialized', this)
}

/**
 * this points to auth instance
 * @param error
 * @return {Promise<void>}
 */
export async function handleError (error) {
  console.error('Auth::error', this, error)
}

// After callbacks
export async function afterFetchUser () {
  //
}

export async function afterLogout () {
  //
}

export async function afterRefreshToken () {
  //
}

export async function afterInitialize () {
  //
}

export async function afterLogin () {
  //
}
