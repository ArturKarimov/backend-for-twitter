import {body} from 'express-validator'

export const registerValidations = [
    body('email', 'Введите email').isEmail().withMessage('Неверный формат почты').isLength({
        min: 10,
        max: 40
    }).withMessage('Допустимая длина 10 - 40 символов'),

    body('fullname', 'Введите имя').isString().isLength({
        min: 2,
        max: 40
    }).withMessage('Допустимая длина 2 - 40 символов'),

    body('username', 'Введите логин').isString().isLength({
        min: 2,
        max: 40
    }).withMessage('Допустимая длина 2 - 40 символов'),

    body('password', 'Введите пароль').isString().isLength({
        min: 6
    }).withMessage('Введите минимум 6 символов')
        .custom((value, {req}) => {
            if (value != req.body.password2) {
                throw new Error('Пароли не совпадают')
            } else {
                return value
            }
        })
]