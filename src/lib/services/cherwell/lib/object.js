/**
 * Module for Cherwell's user methods
 * @module cherwell/object
 * @requires module:helper.request
 * @requires module:helper.urlencode
 */

let { _request, request, urlencode } = require('../../../.helper'),
CONFIG = require('../../../.helper').CONF.cherwell,
req_options = request.OPTS

req_options.setURL( CONFIG.baseurl )
let logger = require('../../../.helper').logger()

const OBJ_ID = {}

module.exports = {

   /**
    * 
    * EXPORTED FUNCTIONS
    * 
    */
   
    /**
    * creates an object
    * @param {object} name - name of the object
    * @param {object} obj - object to be created
    * @return {boolean} returns true if successful
    */
   async create( name, data ) {
      //create the object
      let object = await createObject( name, data )
      //then save the object
      let result = await saveObject( object )
      if( result ) {
         res.status(200).send(true)
      } else {
         res.status(400).send(false)
      }

   },

   /**
    * updates an object
    * @param {object} obj - object to be updated
    * @return {boolean} returns true if successful
    */
   async update( obj ) {

   },

   /**
    * @summary get an object by its public ID
    * @param {string} id - public ID of object
    * @param {string} name - name of the object
    * @return {object} the business object
    */
   async get( id, name ) {
      return new Promise( async ( rsl, rej ) => {
         req_options.setHeaders( {
            'api-key': CONFIG.client_id,
            'Authorization': `Bearer ${CONFIG.token.access}`
         })
      
         let objid = await getObjectId( name )
         if( objid ) {
            let get = request( req_options.url, req_options.headers, 'json', 200)
            let path = `/api/V1/getbusinessobject/busobid/${objid}/publicid/${id}` 
            get( path ).then( result => {
               console.log( result )
               rsl( result )
            }).catch( e => {
               rej( e )
            })
         } else {
            rej( null )
         }
      })
   },

   /**
    * @summary gets an object by 
    * @param {object} obj - object to be created
    * @return {boolean} returns true if successful
    */
   async getByRecId( id, name ) {
      try {
         req_options.setHeaders( {
            'api-key': CONFIG.client_id,
            'Authorization': `Bearer ${CONFIG.token.access}`
         })
      
         let objid = await getObjectId( name )
         if( objid ) {
            let get = request( req_options.url, req_options.headers ),
            result = await get(`/api/V1/getbusinessobject/busobid/${objid}/busobrecid/${id}`)
            if( result ) {
               return result
            } else {
               return null
            }
         } 
      } catch( e ) {
         console.log( e )
         return null
      }
   },

   /**
    * @summary gets an object's related objects
    * @param {string} recId - record ID of business object
    * @param {string} name - name of business object
    * @param {object} options - holds values for relationships: displayName and relationshipId of the relationship. defaults to null.
    * @return {array} list of related business objects
    */
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

   /**
    * @summary gets the latest email of an Incident or HRCase business object
    * @param {string} recId - record ID of the business object
    * @param {string} name - name of the business object
    * @return {object} the latest Mail History journal
    */
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

   /**
    * @summary gets an ad-hoc search result
    * @param {string} name - name of the business object
    * @param {object} options - holds values for search: fields to return, filters for search results, pageSize for number of records per page
    * @return {object} the search result object
    */
   async search( name, options ) {
      try {
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
      
         let post = request(req_options.url, req_options.headers, 'POST', 'json', 200),
         result = await post('/api/V1/getsearchresults', body)
         
         if( !result ) return null
         else return result
      } catch( e ) {
         return null
      }

   }
}

/**
 * 
 * UTILITY FUNCTIONS
 * 
 */

/**
 * @summary gets the object id by name
 * @param {string} name - the name a of the object
 * @return {string} object ID
 */
async function getObjectId( name ) {
   return new Promise( async ( rsl, rej ) => {
      if( OBJ_ID[name] ) {
         rsl( OBJ_ID[name] )
      } else {
         req_options.setHeaders( {
            'api-key': CONFIG.client_id,
            'Authorization': `Bearer ${CONFIG.token.access}`
         })
         let get = request( req_options.url, req_options.headers, 'json'),
         result = await get(`/api/V1/getbusinessobjectsummary/busobname/${name}`) 
         if( result === [] ) { 
            rej( null ) 
         }
         else {
            OBJ_ID[name] = result[0]['busObId']
            rsl( OBJ_ID[name] )
         }
      }
   })
}

/**
 * @summary gets the template for the business object by its ID
 * @param {string} busObId - the id of the business object
 * @param {boolean} required - include required fields in the template
 * @param {array} fields - fields to include in the template. an array of field IDs
 */
async function getObjectTemplate( busObId, required = false, fields = [] ) {
   try {   
      //set the options for the request call
      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })

      let body = {
         busObId: busObId,
         fields: fields,
         includeRequired: required,
         includeAll: !required
      }

      let post = request(req_options.url, req_options.headers, 'POST', 'json', 200),
      result = await post('/api/V1/getbusinessobjecttemplate', body )
      return result
   } catch( e ) {
      logger.log( 'services/cherwell', e )
      return null
   }
}


/**
 * @summary gets the schema for the business object by name
 * @param {string} busObId - the id of the business object
 * @param {boolean} include - include relationships for the object
 * @return {object} business object schema
 */
async function getObjectSchema( name, include ) { 
   try{
      req_options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Authorization': `Bearer ${CONFIG.token.access}`
      })

      let objid = await getObjectId( name )
      if( !objid ) { return null }
      else {
         let get = request( req_options.url, req_options.headers, 'json', 200),
         result = await get(`/api/V1/getbusinessobjectschema/busobid/${objid}?includerelationships=${include}`)
         if ( !result ) { return null }
         else {
            return result
         }
      }
   } catch( e ) {
      return null
   }
}


/**
 * @summary gets a record's related objects
 * @param {string} recId - the id of the record
 * @param {string} name - the name of the business object
 * @param {object} options - optional params to be sent in the body of the request (ex. filters, fieldList. consult the Cherwell API for the /getrelatedbusinessobject endpoint for more information)
 * @return {array} related business objects
 */
async function getRelatedObjects( recId, name, options ) {
   let objid = await getObjectId(name)
   if( !objid ) { return null }
   else {
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

      let post = request(req_options.url, req_options.headers, 'POST', 'json', 200),
      result = await post('/api/V1/getrelatedbusinessobject', body ),
      objs = result['relatedBusinessObjects']
      
      if ( !objs.length ) { return null }
      else {
         return objs
      }
   }
   
}

/**
 * @description creates a business object
 * @param {object} obj - the object to be saved
 * @return {object} resolves or rejects
 */
async function createObject( name, data ) {
   //first, get the object template
   let objId = await getObjectId( name )
   if( objId ) {
      let template = await getObjectTemplate( objid )
      if( template ) {
         //set the object values from the result
         let fields = template.fields;
         let obj = { 
            busObId: objId,
            fields: []
         };
         //then set the field values from the data
         fields.forEach(field =>  {
            data.fields.forEach(item => {
               if(item.name == field.name) {
                  //insert the value, and set dirty to true
                  if(item.name == "Description") { field.html = item.html; }
                  field.value = item.value;
                  field.dirty = true;
                  //add field to object array
                  obj.fields.push(field);
               }
            });
         });
         //return the object
         return obj
      } else {
         return null
      }
   } else {
      return null
   }
}

/**
 * @description saves the business object
 * @param {object} obj - the object to be saved
 * @return {Promise} resolves or rejects
 */
async function saveObject( obj ) {
   //set the persist value
   obj.persist = persist;
   //set the options for the request call
   req_options.setHeaders( {
      'api-key': CONFIG.client_id,
      'Authorization': `Bearer ${CONFIG.token.access}`
   })

   let post = request(req_options.url, req_options.headers, 'POST', 'json', 200),
   result = await post('/api/V1/savebusinessobject', obj )
   if( result.statusCode != 200 ) {
      return null
   }
   else {
      return true
   }
}
