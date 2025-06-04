import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import { authorizeRoles } from '../middlewares/role.middleware';
import { config } from '../config';

class UserController implements Controller {
   public path = '/api/user';
   public router = Router();
   private userService = new UserService();
   private passwordService = new PasswordService();
   private tokenService = new TokenService();

   constructor() {
       this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.post(`${this.path}/create`, this.createNewOrUpdate);
       this.router.post(`${this.path}/auth`, this.authenticate);
       this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
       this.router.get(`${this.path}/all`, auth, authorizeRoles('admin'), this.getAllUsers);
       this.router.get(`${this.path}/tokens-life`, auth, authorizeRoles('admin'), this.getTokensLife);
   }

   private authenticate = async (request: Request, response: Response, next: NextFunction) => {
   const { login, password } = request.body;


   try {
       const user = await this.userService.getByEmailOrName(login);
       if (!user) {
           return response.status(401).json({ error: 'Unauthorized' });
       }


       const isAuthorized = await this.passwordService.authorize(user._id, password);
       if (!isAuthorized) {
           return response.status(401).json({ error: 'Unauthorized' });
       }


       const token = await this.tokenService.create(user);
       response.status(200).json(this.tokenService.getToken(token));
   } catch (error) {
       console.error(`Validation Error: ${error.message}`);
       response.status(401).json({ error: 'Unauthorized' });
   }
};


private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
   const userData = request.body;
   console.log('userData', userData)
   try {
       const user = await this.userService.createNewOrUpdate(userData);
       if (userData.password) {
           const hashedPassword = await this.passwordService.hashPassword(userData.password)
           await this.passwordService.createOrUpdate({
               userId: user._id,
               password: hashedPassword
           });
       }
       response.status(200).json(user);
   } catch (error) {
       console.error(`Validation Error: ${error.message}`);
       response.status(400).json({error: 'Bad request', value: error.message});
   }


};


private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
   const {userId} = request.params;


   try {
       const result = await this.tokenService.remove(userId);
       console.log('aaa', result)
       response.status(200).json(result);
   } catch (error) {
       console.error(`Validation Error: ${error.message}`);
       response.status(401).json({error: 'Unauthorized'});
   }
};

private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        const { login } = request.body;
        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user || !user.email) {
                return response.status(404).json({ error: 'User not found' });
            }

            const newPassword = Math.random().toString(36).slice(-8);

            const hashedPassword = await this.passwordService.hashPassword(newPassword);
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });

            await this.userService.sendResetEmail(user.email, newPassword);

            response.status(200).json({ message: 'New password sent to your email.' });
        } catch (error) {
            console.error(`Reset Password Error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    };

    private getAllUsers = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAll();
            response.status(200).json(users);
        } catch (error) {
            console.error(`Get All Users Error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    };

    private getTokensLife = async (request: Request, response: Response) => {
        try {
            const expirationTimeMs = config.tokenExpirationMs;

            const tokens = await this.tokenService.getAllTokens();
            const now = Date.now();

            const tokensWithLife = tokens.map((token: any) => {
                const expiresIn = Math.max(0, token.createDate + expirationTimeMs - now);
                return {
                    userId: token.userId,
                    token: token.value,
                    expiresInMs: expiresIn,
                    expiresInSec: Math.floor(expiresIn / 1000)
                };
            });

            response.status(200).json(tokensWithLife);
        } catch (error) {
            response.status(500).json({ error: 'Internal server error' });
        }
    };

}

export default UserController;