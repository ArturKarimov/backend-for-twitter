import {UserModel, UserSchemaType} from "../models/UserModel";
import {Strategy as LocalStrategy} from 'passport-local'
import {generateMD5} from "../utils/generateHash";
const passport = require('passport')
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;




passport.use(new LocalStrategy(
    async (username, password, done): Promise<void> => {
        try {
            const user = await UserModel.findOne({$or: [{email: username}, {username}]}).exec()
            if (!user) {
                return done(null, false)
            }
            if (user.password === generateMD5(password + process.env.SECRET_KEY)) {
                done(null, user)
            } else {
                done(null, false)
            }

        } catch (e) {
            done(e, false)
        }
    }))

passport.use(
    new JWTstrategy(
        {
            secretOrKey: process.env.SECRET_KEY,
            jwtFromRequest: ExtractJWT.fromHeader('token')
        },
        async (payload: {data: UserSchemaType}, done) => {
            try {
                const user = await UserModel.findById(payload.data._id).exec()
                if (user) {
                    return done(null, user)
                }
                done(null, false)
            } catch (error) {
                done(error, false);
            }
        }
    )
);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    UserModel.findById(id, function(err, user) {
        done(err, user);
    });
});

export default passport