/** OS keyring `service` identifier for every comms-cli secret. */
export const SECURE_STORE_SERVICE = 'comms-cli'

/**
 * The CLI's OAuth `client_id`: the URL of its client ID metadata document,
 * which the Comms backend serves. Todoist fetches the document from exactly
 * this URL (no redirects) at every login, requires its `client_id` field to
 * equal the URL, and binds every token it issues to that client. Never change
 * it: a new URL is a new client, and each released version keeps signing in
 * with the URL it shipped.
 *
 * 5.2.0 and earlier sign in with `oauth/client-metadata.json` on `main`
 * instead, so that file has to stay too. Accounts that signed in with it keep
 * refreshing against it (each account stores its own client), but refreshing
 * doesn't fetch the document.
 */
export const OAUTH_CLIENT_ID = 'https://comms.todoist.com/api/.well-known/oauth-client-cli'

/**
 * Icon shown on the local auth result pages, and the `logo_uri` in
 * `oauth/client-metadata.json`. Todoist re-reads the document, but OAuth clients that
 * earlier versions registered through DCR keep the URL they registered with,
 * so never rename or delete the file behind it. (1.0.0 to 1.4.0 used a
 * commit-pinned URL that no longer resolves, and 3.6.1 to 3.6.4 registered
 * `icons/comms-cli_512px.png`, since removed, so those clients show Todoist's
 * fallback icon.)
 */
export const LOGO_URI = 'https://raw.githubusercontent.com/doist/comms-cli/main/icons/comms-cli.png'
