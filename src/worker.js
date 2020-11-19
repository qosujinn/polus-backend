const { init } = require('./router')

const { request } = require('./helper'),
CONFIG = require('./helper').CONFIG,
crud = require('./lib/crud')

let logger = require('./helper').logger()

module.exports = {
   async init() {
      
      return true
   }
}