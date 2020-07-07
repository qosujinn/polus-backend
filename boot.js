const app = require('./src/app')

let cher = require('./src/lib/service/cherwell')

app.initialize()

cher.refreshToken()
