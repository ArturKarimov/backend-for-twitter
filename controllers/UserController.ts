import * as express from 'express'
import {UserModel, UserSchemaType} from "../models/UserModel";
import {validationResult} from "express-validator";
import {generateMD5} from "../utils/generateHash";
import {sendEmail} from "../utils/sendEmail";
import {isValidObjectId} from "../utils/isValidObjectId";

const jwt = require('jsonwebtoken')

class UserController {
    async index(_, res: express.Response) {
        try {
            const users = await UserModel.find({}).exec()
            return res.json({
                status: 'success',
                data: users
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
            const userId = req.params.id

            if (!isValidObjectId(userId)) {
                return res.status(400).send()
            }

            const user = await UserModel.findById(userId).exec()
            if (!user) {
                return res.status(404).send()
            }
            return res.json({
                status: 'success',
                data: user
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
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error', messages: errors.array()
                })
            }
            const data = {
                email: req.body.email,
                username: req.body.username,
                fullname: req.body.fullname,
                password: generateMD5(req.body.password + process.env.SECRET_KEY),
                confirmHash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
            }

            const user = await UserModel.create(data)

            res.status(201).json({
                status: 'success',
                data: user
            })

            sendEmail({
                emailFrom: process.env.EMAIL_FROM,
                emailTo: data.email,
                subject: "Подтверждения почты для Twitter Clone",
                html: `Для того, чтобы подтвердить почту, перейдите
               <a href="http://localhost:${process.env.PORT || 5555}/auth/verify?hash=${data.confirmHash}">по этой ссылке</a>`,
            }, (err) => {
                if (err) {
                    return res.json({
                        status: 'error',
                        message: err
                    })
                }
            })
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async verify(req: express.Request, res: express.Response): Promise<void> {
        try {
            const hash = req.query.hash
            if (!hash) {
                res.status(400).send()
                return
            }
            const user = await UserModel.findOne({confirmHash: hash}).exec()

            if (user) {
                user.confirmed = true
                user.save()

                res.json({
                    status: 'success'
                })
            } else {
                res.status(404).json({status: 'error', message: 'Пользователь не найден'})
            }
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async afterLogin(req: express.Request, res: express.Response) {
        try {
            const user = req.user ? (req.user as UserSchemaType).toJSON() : undefined
            return res.json({
                status: 'success',
                data: {
                    ...user,
                    token: jwt.sign({data: req.user}, process.env.SECRET_KEY, {expiresIn: '30d'})
                }
            })
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }

    async getUserInfo(req: express.Request, res: express.Response) {
        try {
            const user = req.user ? (req.user as UserSchemaType).toJSON() : undefined
            return res.json({
                status: 'success',
                data: user
            })
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                message: e
            })
        }
    }
}

export const UserCtrl = new UserController()