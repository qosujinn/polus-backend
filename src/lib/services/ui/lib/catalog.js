const ENV = require('../../../.helper').CONF.env,
CONFIG = require('../../../.helper').CONF.cherwell

let { request, urlencode } = require('../../../.helper'),
model = require('../../.models').catalog

const _catalog = {
   async get( type, tenant ) {
      try {
         if( type === 'incident') {
            let get = request('json', 200, 404)
            //get the catalog options from CONFIG, and set the tenant filter value
            let options = CONFIG.catalog.incident( tenant )
            //make a request for the catalog data
            let incidentData = await get( `${ENV.domain}/s/cherwell/search`, options )
            if( incidentData ) {
               let objs = incidentData['businessObjects']
               //create a tree
               let incidentCatalog = model( 'Incident' )
               objs.forEach( subcat => {
                  //get the categorization
                  let subcategory = subcat.busObPublicId,
                  category = subcat.fields.find( el => el.name == "Service"),
                  service = subcat.fields.find( el => el.name == "ServiceClassification")
                  //add it to the tree
                  incidentCatalog.add(service.value, 'Incident')
                  incidentCatalog.add(category.value, service.value)
                  incidentCatalog.add(subcategory, category.value)
               })
               return incidentCatalog
            }
         }
         else if( type === 'hrcase' ) {
            let get = request('json', 200, 404),
            //get the catalog options from CONFIG, and set the tenant filter value
            options = CONFIG.catalog.hrcase( tenant )
            let hrcaseData = await get( `${ENV.domain}/s/cherwell/search`, options )
            if( hrcaseData ) {
               let objs = hrcaseData['businessObjects']

               let hrcaseCatalog = model( 'HRCase' )
               objs.forEach( subcat => {
                  //get the categorization
                  let subcategory = subcat.busObPublicId,
                  category = subcat.fields.find( el => el.name == "Category"),
                  service = subcat.fields.find( el => el.name == "CaseType")
                  
                  hrcaseCatalog.add(service.value, 'HRCase')
                  hrcaseCatalog.add(category.value, service.value)
                  hrcaseCatalog.add(subcategory, category.value)
               })
               return hrcaseCatalog
            }
         }
      } catch( e ) {
         console.log( e )
         return null
      }
   }
}

module.exports = _catalog

