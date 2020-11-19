const ENV = require('../../../.helper').CONF.env

let { request } = require('../../../.helper'),
model = require('../../.models').form

const _form = {
   async get( tenant, { service, category, subcategory } ) {

      let form = model.get(  tenant, { service, category, subcategory } )
      if( form ) {
         return form
      } else return null
   },

   async submit( data ) {
     let form = processFormData( data ),
     //create a post request for the ticket creation
     post = request(ENV.domain, 'POST', 'json', 200)
      
     let result = await post(`/s/cherwell/object/${form.type}`, form)
     if( result ) {
        res.status(200).send(true)
     } else {
        res.status(200).send(null)
     }

   }
}

function processFormData( data ) {
   try {
      if( !data ) { return null }
      else {
         let queries = "";
         //process the form queries
         data.queries.forEach( query => {
            if(query.type == 'file') {
               data.file = {
                  filename: query.filename,
                  value: query.value,
                  size: query.size
               }
            }
            //if a query has a fieldName, add it directly to the field array
            if(query.fieldName) {
               data.fields.push({ name: query.fieldName, value: query.value });
            }
            //if value is an array, convert it to string and add a space after commas
            if ( Array.isArray(query.value) ) {
               query.value = query.value.toString().replace(/\,/g, ", ");
            } 

            queries += `<p><b>${query.text}</b><br />${query.value}</p>`;

            if(query.subqueries != null) {

               query.subqueries.forEach(subqry => {
                  if ( Array.isArray(subqry.value) ) {
                     subqry.value = subqry.value.toString().replace(/\,/g, ", ");
                  }

                  queries += `<p><b>${subqry.text}</b><br />${subqry.value}</p>`;
               });
            }
         });
         //once all of the queries have been processed, add the form string to the Description and the classifications
         data.fields.push({ name: `${ data.type == "HRCase" ? 'CaseType' : 'Service' }`, value: data.service }, 
            { name: "Category", value: data.category }, 
            { name: "Subcategory", value: data.subcategory },
            { name: 'Tenant', value: data.tenant });

         //if there's no Description in fields, set it to the queries
         let desc = data.fields.find(field => field.name == "Description");
         if(!desc) {
            data.fields.push({ name: 'Description', value: queries });
         }

         //if there's no ShortDescription fields, set it to the title.
         let shortdesc = data.fields.find(field => field.name == "ShortDescription");
         if(!shortdesc) {
            data.fields.push({ name: 'ShortDescription', value: data.title });
         }

         return data
      }


   } catch(error) {
      console.log('an error occured.')
      console.log(error)
      return null
   }
}

module.exports = _form