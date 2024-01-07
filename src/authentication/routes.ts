import express from 'express';
import controllers from './controllers';

const router = express.Router();

router.post('/signup', controllers.signup);

export default router;
