const request = require('bent')
request.OPTS = {
   setURL: function(url) {
      this.url = url 
   },
   setHeaders: function(headers) {
      this.headers = headers
   }
}

module.exports = request