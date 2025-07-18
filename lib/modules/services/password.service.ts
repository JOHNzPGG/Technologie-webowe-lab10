import bcrypt from 'bcrypt';
import PasswordModel from '../schemas/password.schema'


class PasswordService {
   async authorize(userId: string, plainPassword: string): Promise<boolean> {
       try {
           const record = await PasswordModel.findOne({ userId });
           if (!record) return false;


           const isMatch = await bcrypt.compare(plainPassword, record.password);
           return isMatch;
       } catch (error) {
           console.error(`Authorize Error: ${error.message}`);
           return false;
       }
   }

async hashPassword(password: string): Promise<string> {
       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(password, saltRounds);
       console.log('hash', hashedPassword)
       return hashedPassword;
   }

   async createOrUpdate({ userId, password }: { userId: string; password: string }): Promise<void> {
       try {
           const existing = await PasswordModel.findOne({ userId });

           if (existing) {
               existing.password = password;
               await existing.save();
           } else {
               await PasswordModel.create({ userId, password });
           }
       } catch (error) {
           console.error(`CreateOrUpdate Password Error: ${error.message}`);
           throw new Error('Failed to save password');
       }
   }
   
}


export default PasswordService;
