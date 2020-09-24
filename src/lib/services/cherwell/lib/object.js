let { _request, request, urlencode } = require('../../.helper'),
CONFIG = require('../../.helper').CONF.cherwell,
req_options = request.OPTS

req_options.setURL( CONFIG.baseurl )

const OBJ_ID = {}

const _object = {
   
   async create( obj ) {

   },

   async get( id, name ) {
      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })
   
      let objid = await getObjectId( name )
      if( !objid ) { return null }
      else {
         let get = request( req_options.url, req_options.headers, 'json', 200),
         result = await get(`/api/V1/getbusinessobject/busobid/${objid}/publicid/${id}`)
         return result
      } 
   },

   async getByRecId( id, name ) {
      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })
   
      let objid = await getObjectId( name )
      if( !objid ) { return null }
      else {
         let get = request( req_options.url, req_options.headers, 'json', 200),
         result = await get(`/api/V1/getbusinessobject/busobid/${objid}/busobrecid/${id}`)
         return result
      } 
   },

   async update( obj ) {

   },

   async getRelated( recId, name, options = null ) {
      let schema = await getObjectSchema(name, true)
      if( !schema ) { return null }
      else {
         let relation = schema['relationships'].find( rel => rel['displayName'] == options['displayName'] )

         options['relationshipId'] = relation['relationshipId']
         console.log('getRelated: here')
         let objs = await getRelatedObjects( recId, name, options )
         if ( !objs ) { return null }
         else {
            return objs
         }
      }
   },

   async getLatestEmail( recId, name ) {
      let relation
      switch( name ) {
         case 'incident':
         relation = 'Incident Owns Journals'
         break

         case 'hrcase':
         relation = "HRCase Owns Journals"
         break
      }
      console.log('here')
      let journals = await this.getRelated( recId, name, { displayName: relation } )
      if( !journals ) { 
         console.log('no journals')
         return null }
      else {
         //filter and sort the journals
         journals = journals.filter( journal => 
            journal['busObPublicId'] == 'Journal - Mail History' 
         ).reverse()
         //the first entry will be the latest email
         let latest = journals.shift()
         return latest
      }
   },

   async search( name, options ) {
      let busObId = await getObjectId( name )

      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })

      let body = { 
         busObId: busObId,
         fields: options.fields,
         filters: options.filters,
         pageSize: options.pageSize || 200,
         includeAll: false
      }
     
      let get = request(req_options.url, req_options.headers, 'POST', 'json', 200),
      result = await get('/api/V1/getsearchresults', body)
      console.log( `[object/search] hit`)
      if( !result ) return null
      else return result

   }
}

module.exports = _object

/**
 * 
 * STATIC FUNCTIONS
 * 
 */
async function getObject( id, name ) {
   req_options.setHeaders( {
      'api-key': CONFIG.client_id,
      'Authorization': `Bearer ${CONFIG.token.access}`
   })

   let objid = await getObjectId( name )
   if( !objid ) { return null }
   else {
      let get = request( req_options.url, req_options.headers, 'json', 200),
      result = await get(`/api/V1/getbusinessobject/busobid/${objid}/publicid/${id}`)
      return result
   } 
}

/*********
async getObjectId
sends a GET request to Cherwell for the business object ID based on the object name
runs asynchronously, returning a Promise. if resolved, it sends business object ID; if rejected, throws an error.

params
   obj_name: name of the business object
**********/
async function getObjectId( name ) {
   if( OBJ_ID[name] ) {
      return OBJ_ID[name]
   } else {
      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })
      let get = request( req_options.url, req_options.headers, 'json'),
      result = await get(`/api/V1/getbusinessobjectsummary/busobname/${name}`)
      if( !result ) { return null }
      else {
         OBJ_ID[name] = result[0]['busObId']
         return OBJ_ID[name]
      }
   }
}

async function getObjectTemplate( busObId, required = false, fields = [] ) {
   return new Promise( (resolve, reject) => {
         //set the options for the request call
         let options = {
            url: `${CONFIG.baseurl}/api/V1/getbusinessobjecttemplate`,
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            auth: {
               bearer: CONFIG.token.access
            },
            form: {
               busObId: busObId,
               fields: fields,
               includeRequired: required,
               includeAll: !required
            }
         }

         //send the request and return the promise based on the success or fail
         _request(options, (err, res, body) => {
            //parse the body
            body = JSON.parse(body);
            //if the status isn't OK, reject with the error that was sent
            if ( body.hasError ) {
               reject({ status: res.statusCode, errorCode: body.errorCode, message: body.errorMessage })
            } 
            //if it is, resolve and send the object ID and template
            else {
               resolve( {objId: objid, template: body} )
            }
         })		
   });
}

async function getObjectSchema( name, include ) { 
   req_options.setHeaders( {
      'api-key': CONFIG.client_id,
      'Content-Type': 'x-www-form-urlencoded',
      'Authorization': `Bearer ${CONFIG.token.access}`
   })
   console.log('[object/getObjectSchema] hit')
   let objid = await getObjectId( name )
   if( !objid ) { return null }
   else {
      let get = request( req_options.url, req_options.headers, 'json', 200),
      result = await get(`/api/V1/getbusinessobjectschema/busobid/${objid}?includerelationships=${include}`)
      if ( !result ) { return null }
      else {
         console.log( `got a schema`)
         return result
      }
   }
}

async function getRelatedObjects( recId, name, options ) {
   let objid = await getObjectId(name)
   if( !objid ) { return null }
   else {
      console.log('getRelatedObjects: here')
      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })
   
      let body =  {
         parentBusObId: objid,
         parentBusObRecId: recId,
         relationshipId: options.relationshipId,
         filters: options.filters,
         fieldsList: options.fields
      }
      console.log( body )
      let get = request(req_options.url, req_options.headers, 'POST', 'json', 200),
      result = await get('/api/V1/getrelatedbusinessobject', body ),
      objs = result['relatedBusinessObjects']
      console.log( objs )
      if ( !objs.length ) { return null }
      else {
         return objs
      }
   }
   
}

async function saveObject( obj ) {
   return new Promise( (resolve, reject) => {
      try {
         //set the persist value
         obj.persist = persist;
         //set the options for the request call
         let options = {
            url: `${CONFIG.baseurl}/api/V1/savebusinessobject`,
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            auth: {
               bearer: CONFIG.token.access
            },
            form: obj
         };

         _request(options, (err, res, body) => {
            body = JSON.parse(body);
            if( res.statusCode != 200 ) {
               console.log(body);
               let msg = body.Message ? body.Message : body.errorMessage;
               reject({ status: res.statusCode, errorCode: body.errorCode, message: msg });
            }
            else {
               resolve(body);
            }
         });
      }
      catch(error) {
         console.log('error: \n', error);
         reject(error);
      }
   });
}
