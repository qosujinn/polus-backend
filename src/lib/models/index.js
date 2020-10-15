/**
 * Models library
 * initializes the models and exports them
 * @module model
 */

module.exports = {
   ticket: require('./ticket'),
   task: require('./task'),
   dashboard: require('./dashboard')(),
   form: require('./form')(),
   user: require('./user')
}