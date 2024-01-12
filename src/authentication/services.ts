import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {JWT_SECRET, JWT_EXPIRES_IN} from './../config/envConfig';

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  return hashedPassword;
};

const createJWT = (id: number) => {
  //signtoken

  return jwt.sign({id}, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export default {hashPassword, createJWT};
