interface currentUser {
  id: string;
}

declare namespace Express {
  export interface Request {
    currentUser?: currentUser;
    getUserResult?: string;
  }
}
