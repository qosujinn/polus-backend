# SERVICES <!-- {docsify-ignore} -->

A service is an integration designed for interfacing with a software product. The first service for POLUS was Cherwell.

Services are designed in a 'microservice' way, meaning that each service has its own API endpoints that POLUS uses to communicate between them. This way, a service can work independently of another, and POLUS will still run if a service is offline or something in the code breaks. It also means services can be developed independently.

# Design

A service has four main parts:
- an **index.js** file 
- a **worker**, which holds the libraries and handles any initilization
- a **handler**, which holds all of the routes, events and commands for the service
- a **lib** folder, where the libraries are located

## index.js

The index file exports an asynchronous function that's run at boot, when all of the libraries are initialized. This function initializes the worker and handler, then returns the service name and handler in an object.

```js
module.exports = async function() {
   let success = await worker.init()
         if( success ) {
               //get the handles
            let handles = handler( worker )
            //return the name and the handles
            return { name, handles }
         } else {
            return null
         }
}
```

## The worker

the worker holds the services libraries and handles any intitialization that needs to happen for the service, like retrieving data or gathering tokens. The libraries are included in an exported object, along with an asynchronous `init()` function. Here's an example from the Cherwell service:

```js
const object = require('./lib/object'),
search = require('./lib/search'),
user = require('./lib/user'),
teams = require('./lib/teams')

 module.exports = {
   object: object,
   search: search,
   user: user,
   teams: teams,

   async init() {
      return new Promise( (rsl, rej) => {
         requestToken().then( () => {
            //start token refresh timer
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
```
The libraries are imported, then assigned to the exported object. For the Cherwell service, tokens are needed to make requests to cherwell; so on `init()`, tokens are requested and a refresh timer is started. 

## handler

The handler is what holds the routes, events, and commands for the service. It's made up of objects of functions, keyed to a route. Here's what it looks like:

```js
module.exports = ( worker ) => ({
   routes: {
      '/object/:name': {
         get: ( req, res ) => {
            result = await worker.object.search( name )
            if( !result ) res.status(500).send()
            else {
               
               res.status(200).send( result )
            }
         },
         post: async ( req, res ) => {
            // function code
            
         }
   ...
```
POLUS uses the [Express](https://expressjs.org) web framework to handle routing for the application, and the functions follow that `(request, response)` pattern. Each route has any combination of HTTP request methods, while events and commands all use the POST method.

The worker object, which contains the libraries for the service, is passed into the handler. The worker handles any calls to those libraries in the function code.

