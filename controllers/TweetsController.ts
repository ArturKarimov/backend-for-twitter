import * as express from 'express'
import {UserSchemaType} from "../models/UserModel";
import {TweetModel, TweetSchemaInterface} from "../models/TweetModel";
import {isValidObjectId} from "../utils/isValidObjectId";
import {validationResult} from "express-validator";


class TweetsController {
    async index(_, res: express.Response) {
        try {
            const tweets = await TweetModel.find({}).populate('user').sort({createdAt: -1}).exec()
            return res.json({
                status: 'success',
                data: tweets
            })
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async show(req: express.Request, res: express.Response) {
        try {
            const tweetId = req.params.id

            if (!isValidObjectId(tweetId)) {
                return res.status(400).send()
            }

            const tweet = await TweetModel.findById(tweetId).populate('user').exec()
            if (!tweet) {
                return res.status(404).send()
            }
            return res.json({
                status: 'success',
                data: tweet
            })
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async create(req: express.Request, res: express.Response) {
        try {
            const user = req.user as UserSchemaType
            if (user?._id) {
                const errors = validationResult(req)
                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        status: 'error', messages: errors.array()
                    })
                }
                const data: TweetSchemaInterface = {
                    text: req.body.text,
                    user: user._id
                }

                const tweet = await TweetModel.create(data)
                return res.json({
                    status: 'success',
                    data: await tweet.populate('user')
                })
            }
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async delete(req: express.Request, res: express.Response) {
        const user = req.user as UserSchemaType
        try {
            if (user) {
                const tweetId = req.params.id
                if (!isValidObjectId(tweetId)) {
                    return res.status(400).send()
                }
                const tweet = await TweetModel.findById(tweetId)
                if (tweet) {
                    if (user._id.equals(tweet.user)) {
                        tweet.remove()
                        return res.send()
                    } else {
                        return res.status(403).send()
                    }
                } else {
                    return res.status(400).send()
                }
            }
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async update(req: express.Request, res: express.Response) {
        const user = req.user as UserSchemaType
        try {
            if (user) {
                const tweetId = req.params.id
                if (!isValidObjectId(tweetId)) {
                    return res.status(400).send()
                }
                const tweet = await TweetModel.findById(tweetId)
                if (tweet) {
                    if (user._id.equals(tweet.user)) {
                        const text = req.body.text
                        tweet.text = text
                        tweet.save()
                        return res.send()
                    } else {
                        return res.status(403).send()
                    }
                } else {
                    return res.status(400).send()
                }
            }
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }
}

export const TweetsCtrl = new TweetsController()