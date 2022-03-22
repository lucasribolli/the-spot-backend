require('dotenv').config();

if(process.env.NODE_ENV == "production") {
    module.exports = {
        postgresUri: process.env.PRODUCTION_POSTGRES_URI
    }
} else {
    module.exports = {
        postgresUri: process.env.DEV_POSTGRES_URI
    }
}