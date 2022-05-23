import express, { Request, Response } from 'express'
import { connect } from 'mongoose'
import cors from 'cors'
import user from './routes/user.routes'
import item from './routes/item.routes'
import collection from './routes/collection.routes'
import session, { Store } from 'express-session'
import MongoStore from 'connect-mongo'
import { IuserSchema } from './interfaces/users.interfaces'
import 'dotenv/config'


const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.DATABASE_URL

const allowedOrigins = ["http://localhost:3000", "https://project-collection001.herokuapp.com", "https://cheery-biscuit-41d74b.netlify.app"];
const options: cors.CorsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 200
}

app.use(cors(options))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

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
    store: sessionStore,
    secret: 'This is my secret',
    rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: true,
        // httpOnly: false,
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
            privilage: 'guest'
        }
    }
    next()
})

app.get('/', (req: Request, res: Response, next) => {
    res.send("Hello")
    next();
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

