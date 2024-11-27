const mongose = require('mongoose')
mongose.set('strictQuery', false)
const connectDB = async() => {
  try {
 
    const conn = await mongose.connect(process.env.MONGO_URI, {dbName: process.env.MONGODB_DATABASE})
    console.log(`server connect ${conn.connection.host}`);
  } catch (err) {
    console.log(`database err ${err}`)
    process.exit(1);
  }
}

module.exports = connectDB