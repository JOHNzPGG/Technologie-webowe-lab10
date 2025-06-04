import jwt from 'jsonwebtoken';
import  TokenModel  from '../schemas/token.schema';
import {config} from '../../config';

class TokenService {
   public async create(user: any) {
       const access = 'auth';
       const userData = {
           userId: user.id,
           name: user.email,
           role: user.role,
           isAdmin: user.isAdmin,
           access: access
       };

       const value = jwt.sign(
           userData,
           config.JwtSecret,
           {
               expiresIn: config.tokenExpiration
           });

       try {
           const result = await new TokenModel({
               userId: user.id,
               type: 'authorization',
               value,
               createDate: new Date().getTime()
           }).save();
           if (result) {
               return result;
           }
       } catch (error) {
           console.error('Wystąpił błąd podczas tworzenia danych:', error);
           throw new Error('Wystąpił błąd podczas tworzenia danych');
       }
   }

   public getToken(token: any) {
       return {token: token.value};
   }

   public async remove(userId: string) {
       try {
           const result = await TokenModel.deleteOne({ userId: userId });
       
           if (result.deletedCount === 0) {
               throw new Error('Wystąpił błąd podczas usuwania danych');
           }
           return result;
       } catch (error) {
           console.error('Error while removing token:', error);
           throw new Error('Error while removing token');
       }
   }

   public async removeExpiredTokens() {
       try {
           const expirationTimeMs = config.tokenExpirationMs;
           const now = Date.now();
           const result = await TokenModel.deleteMany({
               createDate: { $lt: now - expirationTimeMs }
           });
           if (result.deletedCount > 0) {
               console.log(`Usunięto ${result.deletedCount} wygasłych tokenów.`);
           }
           return result;
       } catch (error) {
           console.error('Błąd podczas usuwania wygasłych tokenów:', error);
           throw new Error('Błąd podczas usuwania wygasłych tokenów');
       }
   }

   public async getAllTokens() {
       return await TokenModel.find({});
   }

}

export default TokenService;