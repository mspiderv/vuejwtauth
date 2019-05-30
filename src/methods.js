import { FetchUserException } from './exceptions'

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
export function mapResponseToUserData (response) {
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
export function checkUserObject (user) {
  if (typeof user !== 'object') {
    throw new FetchUserException(`Failed to read user data from API HTTP response.`)
  }

  return user
}

export async function serverSideLogout (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

export function handleServerSideLogoutError (error) {
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
export function mapRefreshResponseToToken (response) {
  return response.data.token
}

export function mapCredentialsToRequestData (credentials) {
  return credentials
}

export async function attemptLogin (method, url, credentials) {
  return this.auth.options.drivers.http.sendRequest(
    method,
    url,
    this.auth.options.methods.mapCredentialsToRequestData(credentials)
  )
}

export function mapLoginResponseToToken (response) {
  return response.data.token
}

/**
 * this points to auth instance
 * @return {Promise<void>}
 */
export function initializedCallback () {
  console.log('Auth::initialized', this)
}

/**
 * this points to auth instance
 * @param error
 * @return {Promise<void>}
 */
export function handleError (error) {
  console.error('Auth::error', this, error)
}
