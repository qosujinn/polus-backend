/**
 * Module for the dashboard UI
 * @module ui/dashboard
 * @requires module:helper.request
 * @requires module:model/dashboard
 * @requires module:model/ticket
 * @requires module:model/task
 */

const ENV = require('../../../.helper').CONF.env

let { request } = require('../../../.helper')
let _ticket = require('../../.models').ticket,
_task = require('../../.models').task,
model = require('../../.models').dashboard

const _dash = {
   async get( name, options ) {
      console.log('[dashboard.js] hit')
      //create a request for the task info from cherwell
      let dashboard = model.get( name )( options )

      dashboard.data.tickets = await getTickets( dashboard.widget.tickets )
      dashboard.data.tasks = await getTasks( dashboard.widget.tasks )
      
      return dashboard
   },

   async update() {

   }
}

module.exports = _dash

async function getTickets( options ) {
   let tickets = []
   console.log('getTickets hit')
   let body = options['hrcase']
   let get = request(`${ENV.domain}`, 'json', 200),
   hrcases = await get(`/s/cherwell/object/hrcase`, body)
   
   if( hrcases ) {
      //TODO: finish this, HRCases need parsing 
      tickets = tickets.concat( hrcases )
   }

   body = options['incident'],
   get = request(`${ENV.domain}`, 'json', 200),
   incidents = await get('/s/cherwell/object/incident', body)
   
   if( incidents ) {
      let parsed = []
      while( incidents.length != 0) {
         let incident = incidents.pop(),
         ticket = _ticket( incident.busObPublicId )
         .parse( 'cherwell', incident )

         parsed.push( ticket )
      }
      tickets = tickets.concat( parsed )
   }

   return tickets
}

async function getTasks( options ) {
   console.log('getTasks hit')
   let tasks = [],
   body = options
   let get = request(`${ENV.domain}`, 'json', 200),
   objects = await get(`/s/cherwell/object/task`, body)
   if( objects ) {
      while( objects.length != 0) {
         let task = objects.pop(),
         task_parsed = _task( task.busObPublicId )
         .parse( 'cherwell', task )

         tasks.push( task_parsed )
      }
   }

   return tasks
} 