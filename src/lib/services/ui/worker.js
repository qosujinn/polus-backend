let dashboard = require('./lib/dashboard'),
ticket = require('./lib/ticket'),
task = require('./lib/task'),
form = require('./lib/form'),
catalog = require('./lib/catalog'),
user = require('./lib/user')

let logger = require('../../.helper').logger()

module.exports = () => ({
   dashboard: dashboard,
   ticket: ticket,
   task: task,
   form: form,
   catalog: catalog,
   user: user,

   async init() {
      
      return true      
   }   
   
})


