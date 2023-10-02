const jwt = require('jsonwebtoken');
const { ValidationError, AuthorizationError } = require('custom-error-handlers/error');
const adminModel = require('../models/adminModel');
const staffModel = require('../models/staffModel');

//!Is Login
exports.isLogin = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            throw new ValidationError('You are not logged in')
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        req.headers.email = decoded.email
        req.headers.id = decoded.id
        req.headers.role = decoded.role


        next()
    } catch (error) {
        next(error);
    }
};

//!Is Admin
exports.isAdmin = async (req, res, next) => {
    try {
        const user = await adminModel.findOne({ _id: req.headers.id });

        if (user.role !== 'admin') {
            throw new ValidationError('You are not Admin')
        }

        next()
    } catch (error) {
        next(error);
    }
};

//!Is Staff
exports.isStaff = async (req, res, next) => {
    try {
        const user = await staffModel.findById({ _id: req.headers.id });

        if (user.role !== 'staff') {
            throw new ValidationError('You are not Staff')
        }
        next()
    } catch (error) {
        next(error);
    }
};

/**
 * permission giving middleware
 *
 * @param   {string|string[]}  role  the role you want to give access
 *
 */
exports.giveAccessTo = (role) => (req, res, next) => {

    try{
        //if role is string
        if(typeof role === 'string'){
            //match with user role
            if(role === req.headers.role){
                //give access to the user
                next();
            }else{
                //throw an error
                throw new AuthorizationError('permission denied')
            }

        //if role is an Array
        }else if(role instanceof Array){
            //match with user role
            if(role.includes(req.headers.role)){
                //give access to the user
                next();
            }else{
                //throw an error
                throw new AuthorizationError('permission denied')
            }

        //if no role passed
        }else{
            throw new AuthorizationError('something went wrong')
        }

    }catch(e){
        //pass error to the error handler
        next(e);
    }
}