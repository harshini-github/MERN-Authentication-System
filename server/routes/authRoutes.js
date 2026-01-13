import express from 'express'
import {register} from '../controllers/authController.js';
import {login} from '../controllers/authController.js';
import {logout} from '../controllers/authController.js';
const authRouter = express.Router();
//will send the data through route
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
export default authRouter;