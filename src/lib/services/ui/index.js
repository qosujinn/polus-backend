const name = 'ui',
handler = require('./handler')

module.exports = async function() {
   return { name, handler }
}