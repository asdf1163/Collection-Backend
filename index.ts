import express from 'express'
import { connect } from 'mongoose'
import cors from 'cors'
import collection from './routes/collection.routes'
import item from './routes/item.routes'
import user from './routes/user.routes'
import session, { Store } from 'express-session'
import MongoStore from 'connect-mongo'
import { IuserSchema } from '../frontend/src/interfaces/users.interfaces'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.DATABASE_URL

const allowedOrigins = ["http://localhost:3000", "https://project-collection001.herokuapp.com/"];
const options: cors.CorsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}
app.use(cors(options))
app.use(express.urlencoded({ limit: '5mb' }))
app.use(express.json({ limit: '5mb', }))

const timeout = {
    sessionHours: 24,
    mongoDb: function () { return this.sessionHours * 60 * 60 },
    experssSession: function () { return this.sessionHours * 60 * 60 * 1000 },
}

var sessionStore = MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: timeout.mongoDb(),
}) as Store


app.use(session({
    secret: 'This is my secret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        secure: true,
        httpOnly: false,
        maxAge: timeout.experssSession()
    }
}))

declare module 'express-session' {
    interface SessionData {
        user: IuserSchema
        lastSearchedUser: IuserSchema
    }
}

app.use(function (req, res, next) {
    if (!req.session.user) {
        req.session.user = {
            _id: "",
            username: "",
            email: "",
            status: "unlocked",
            privilage: "guest"
        }
    }
    if (!req.session.lastSearchedUser) {
        req.session.lastSearchedUser = {
            _id: "",
            username: '',
            email: '',
            status: 'unlocked',
            privilage: 'owner'
        }
    }
    next()
})

app.use('/api/collection', collection)
app.use('/api/item', item)
app.use('/api/user', user)

app.listen(PORT, () => {
    try {
        console.log(`Connected on PORT: ${PORT}`)
    }
    catch (error) {
        throw (error)
    }
})

connect(`${MONGO_URI}`, (err) => {
    if (err) throw (err)
    else console.log('Database connected')
});

