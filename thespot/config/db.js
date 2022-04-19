import dotenv from "dotenv"
dotenv.config()

const getURI = () => {
   return process.env.NODE_ENV == "production"
    ? {postgressUri: process.env.PRODUCTION_POSTGRES_URI}
    : {postgressUri: process.env.DEV_POSTGRES_URI}
}

const db = getURI();

export default db