const mongoose = require('mongoose')

mongoose.Promise = Promise

mongoose.connect(process.env.DB_URL)

const db = mongoose.connection

db.on('error', console.error.bind(console,'connection error:'))

export {db, mongoose}