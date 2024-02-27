import jwt, {JwtPayload} from 'jsonwebtoken';

interface IUserModel {
  user_id: string;
}

interface AuthResult {
  user: IUserModel | null;
  jwtDecodedToken: JwtPayload | null;
}

export type {AuthResult as AuthResult};
