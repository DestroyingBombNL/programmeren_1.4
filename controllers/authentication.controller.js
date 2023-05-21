const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
});

require('dotenv').config();

const router = express.Router();
router.use(bodyParser.json());

let database = require('../database');
const Joi = require('joi');

const loginUserSchema = Joi.object({
emailAdress: Joi.string().pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).required(),
password: Joi.string().min(6).required(),
});

const validateLoginFields = (data) => {
    const { error, value } = loginUserSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
};

const jwt = require('jsonwebtoken');

module.exports = {
    login(req, res, next) {
        database.loginUser(req.body.emailAdress, req.body.password, (err, userInformation) => {
            let message = 'User successfully logged in';
            if (err) {
                return next({
                    status: 404,
                    message: 'User does not exist',
                    data: {},
                });
            } else {
                res.status(200).json({
                    status: 200,
                    message: message,
                    data: {...userInformation.user, token: 'Bearer ' + token}
                });
                logger.info('Status Code 200 - ' + message);
            }
        });
    },

    /**
     * Validatie functie voor /api/login,
     * valideert of de vereiste body aanwezig is.
     */
    validateLogin(req, res, next) {
        // Verify that we receive the expected input
        try {
            validateLoginFields(req.body);
            next();
        } catch (err) {
            return next({
                status: 400,
                message: err.message,
                data: {},
            });
        }
    },

    validateToken(req, res, next, callback) {
        const authHeader = req.headers.authorization;
        console.log(typeof authHeader);
        if (typeof authHeader === 'undefined' || authHeader.length < 150) {
            let err = {
                status: 401,
                message: 'Authorization header missing!',
                data: {}
            }
            callback(err, null);
            return;
        } else {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
                if (err) {
                    return next({
                        code: 403,
                        message: 'No access',
                        data: {},
                    });
                }
                logger.info(`Id of the user is valid`);
                callback(null, payload.userId);
                return;
            });
        }
    }
};