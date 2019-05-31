//
// HTTP API requests senders
//

/**
 * Responsible for fetching the user by sending a HTTP request to API.
 *
 * Warning: This function is also responsible for handling errors.
 *
 * @param method
 * @param url
 * @param token
 * @return Promise<response>
 */
export async function fetchUser (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

/**
 * Responsible for server-side logout by sending a HTTP request to API.
 *
 * Warning: This function is also responsible for handling errors.
 *
 * @param method
 * @param url
 * @param token
 * @return Promise<response>
 */
export async function serverSideLogout (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

/**
 * Responsible for refreshing the token by sending a HTTP request to API.
 *
 * Warning: This function is also responsible for handling errors.
 *
 * @param method
 * @param url
 * @param token
 * @return Promise<response>
 */
export async function refreshToken (method, url, token) {
  return this.auth.options.drivers.http.sendAuthenticatedRequest(method, url, token)
}

/**
 * Responsible for logging in by sending a HTTP request to API.
 * This function is probably not responsible for handling errors.
 * You probably want to handle potential errors in the caller context.
 *
 * @param method
 * @param url
 * @param credentials
 * @return Promise<response>
 */
export async function attemptLogin (method, url, credentials) {
  return this.auth.options.drivers.http.sendRequest(
    method,
    url,
    credentials
  )
}

//
// Response mappers
//

/**
 * Responsible for mapping `attemptLogin` response to token.
 *
 * @param response
 * @return token
 */
export function mapLoginResponseToToken (response) {
  return response.data.token
}


/**
 * Responsible for mapping `refreshToken` response to token.
 *
 * @param response
 * @return token
 */
export function mapRefreshTokenResponseToToken (response) {
  return response.data.token
}

/**
 * Responsible for mapping `fetchUser` response to user data object.
 *
 * @param response
 * @return user data object
 */
export function mapFetchUserResponseToUserData (response) {
  return response.data.user
}

//
// Auth callbacks
//

/**
 * Responsible for handling auth ready callback.
 *
 * `this` points to auth instance
 * @return {Promise<void>}
 */
export function onReady () {
  //
}

/**
 * Responsible for handling auth errors.
 *
 * `this` points to auth instance
 * @param error
 */
export function handleError (error) {
  console.error('Auth error', error)
}
