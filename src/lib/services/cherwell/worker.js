/**
 * cherwell/worker.js
 * worker for the Cherwell service
 */
const { request, urlencode } = require('../../.helper'),

CONFIG = require('../../.helper').CONF.cherwell

//Load up libraries
const object = require('./lib/object'),
search = require('./lib/search'),
user = require('./lib/user')
//get a logger
let logger = require('../../.helper').logger()
//get the options from the request module
let options = request.OPTS
//set the base URL for the requests to be made
options.setURL( CONFIG.baseurl )

 module.exports = {
   object: object,
   search: search,
   user: user,

   async init() {
      return new Promise( (rsl, rej) => {
         logger.log( 'boot', `[boot/service/cherwell] requesting token...`)
         requestToken().then( () => {
            //start token refresh timer
            console.log("[boot/service/cherwell] token received. starting refresh timer...".green )
            tokenRefreshTimer( CONFIG.token.expires_in )
            rsl( true )
         }).catch( (e) => {
            console.log(`[boot/services/cherwell] there was an error requesting token`.red )
            console.log( e )
            rej( e )
         })
      })
   }
   
}

/**
 * sends a request to Cherwell for an access token
 * runs asynchronously, returning a Promise. if rejected, throws an error.
 * @return {Promise} resolve or reject
 */
async function requestToken() {
   return new Promise( (rsl, rej ) => {
      //set the api-key and the Content-Type for this request
      options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Content-Type': 'x-www-form-urlencoded'
      } )
      //make the form for the request
      let form = {
         grant_type: 'password',
         client_id: CONFIG.client_id,
         username: CONFIG.user,
         password: CONFIG.password,
      }
      //create a post function
      const post = request( options.url, options.headers, 'POST', 'json', 200)
      //fire the request
      post('/token', urlencode( form )).then( ( res ) => {
         //get the tokens and the expire time
         CONFIG.token = {
            access: res.access_token,
            refresh: res.refresh_token,
            expires_in: new Date().getTime() + (res.expires_in * 1000)
         }
         logger.log( 'services/cherwell', `[services/cherwell] token received.` )
         rsl( true )
      }).catch( (err) => {
         logger.log( 'services/cherwell', `[services/cherwell] ${err}` )
         rej(err)
      })
   })
}   

/**
 * sends a request to Cherwell for a refresh of the access token
 * runs asynchronously, returning a Promise. if rejected, throws an error.
 * @return {Promise} resolve or reject
 */
function refreshToken() {
   return new Promise( (resolve, reject) => {
      //creat the object for the request
      options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Content-Type': 'x-www-form-urlencoded',
         'Authorization': `Bearer ${CONFIG.token.access}`
      } )

      let form = {
         grant_type: 'refresh_token',
         client_id: CONFIG.client_id,
         refresh_token: CONFIG.token.refresh
      }

      const post = request( options.url, options.headers, 'POST', 'json', 200)
      
      //make the request
      logger.log( 'services/cherwell', '[services/cherwell] requesting token refresh...')
      post('/token', urlencode( form )).then( ( res ) => {
         //get the tokens and the expire time
         CONFIG.token.access = res.access_token,
         CONFIG.token.refresh = res.refresh_token,
         CONFIG.token.expires_in = new Date().getTime() + (res.expires_in * 1000)
         //start token refresh timer
         resolve( CONFIG.token.expires_in )
      }).catch( (err) => {
         reject(err)
      })
   })
}

/**
 * starts a timer for the token refresh. When it timeouts, it makes a refresh request and restarts the timer.
 * @param expiry - expiration time in milliseconds
 * @return {Promise} resolve or reject
 */
function tokenRefreshTimer(expiry) {
   let time = expiry - new Date().getTime()
   setTimeout( () => {
      refreshToken().then( expires_in => {
         logger.log( 'services/cherwell', "[services/cherwell] token refreshed! starting refresh timer (again)...")
         tokenRefreshTimer( expires_in )
      }).catch( e => {
         console.log(e)
      })
   }, time )
}








