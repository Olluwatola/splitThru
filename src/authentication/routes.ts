import express from 'express';
import controllers from './controllers';

const router = express.Router();

router.post('/signup', controllers.signup);
router.post('/login', controllers.login);
router.post('/confirmtoken', controllers.confirmLoginToken);

export default router;
