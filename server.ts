import {TweetsCtrl} from "./controllers/TweetsController";

require('dotenv').config()
require('./core/db')
const cors = require('cors')
import * as express from 'express'
import {UserCtrl} from "./controllers/UserController";
import {registerValidations} from "./validations/register";
import passport from './core/passport'
import {createTweetValidations} from "./validations/createTweet";

const app = express()

app.use(express.json())
app.use(passport.initialize())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.get('/users', UserCtrl.index)
app.get('/users/me', passport.authenticate('jwt', {session: false}), UserCtrl.getUserInfo)
app.get('/users/:id', UserCtrl.show)

app.get('/tweets', TweetsCtrl.index)
app.get('/tweets/:id', TweetsCtrl.show)
app.delete('/tweets/:id', passport.authenticate('jwt'), TweetsCtrl.delete)
app.post('/tweets', passport.authenticate('jwt'), createTweetValidations, TweetsCtrl.create)
app.patch('/tweets/:id', passport.authenticate('jwt'), createTweetValidations, TweetsCtrl.update)

app.post('/auth/register', registerValidations, UserCtrl.create)
app.get('/auth/verify', registerValidations, UserCtrl.verify)
app.post('/auth/login', passport.authenticate('local'), UserCtrl.afterLogin)
// app.patch('/users', UserCtrl.update)
// app.delete('/users', UserCtrl.delete)

app.listen(process.env.PORT || 5555, () => {
    console.log(`Server is running on PORT ${process.env.PORT || 5555}!`)
})