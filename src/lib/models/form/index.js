/**
 * Form model
 * a form is used to collect information from a user.
 * @module model/form
 * @requires module:helper.glob
 * @requires module:helper.path
 * @requires module:helper.colors
 * @requires module:crud
 */

const { glob, path, colors } = require('../../.helper'),
crud = require('../../crud'),
forms = {
   defaults: []
},
logger = require('../../.helper').logger()

logger.log('boot', `[boot/lib/models] gathering forms...`.yellow)
let files = glob.sync('./.data/forms/**/**.json')
files.forEach( file => {
   //read the file
   crud.read( file ).then( form => {
      form = JSON.parse( form )
      
      //check for default forms
      if( form.name.includes('Default') ) {
         //add them to forms object
         forms.defaults.push(form);
         logger.log( 'boot', `[boot/lib/models] -->> form added to defaults: ${form.name}`.green);
         console.log(`[boot/lib/models] -->> form added to defaults: ${form.name}`.green)

      } else {
         
         if( !forms.hasOwnProperty(form.tenant) ) {
            forms[form.tenant] = { [form.service]: new Array() }
         }
         else if( !forms[form.tenant].hasOwnProperty(form.service) ) {
            forms[form.tenant][form.service] = new Array()
         }

         forms[form.tenant][form.service].push( form );
         console.log(`[boot/lib/models] -->> form added to ${form.tenant}/${form.service}: ${form.name} (${form.category} > ${form.subcategory})`.green)
         logger.log( `boot`, `[boot/lib/models] -->> form added to ${form.tenant}/${form.service}: ${form.name} (${form.category} > ${form.subcategory})`.green);
      }
   })
})

let _form = ( forms ) => ({
   forms,

   get( tenant, { service, category, subcategory } ) {
      try {
			if(typeof( this.forms[tenant] ) == 'object') {
				//check and see if there's a form
				let form = this.forms[tenant][service].find(form => (form.category == category && form.subcategory == subcategory));
				//if there is, run the callback with the form
				if(form) {
					return form
            } else {
               //if there isn't, return a default form after checking the catalog entry

            }
            
            return null 
         }		
		} catch(error) {
			console.log(`[lib/models] there was an error:\n`.red, error);
			return error
		}
   }
})

module.exports = _form( forms )
