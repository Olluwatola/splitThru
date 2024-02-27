import express from 'express';
import controllers from './controllers';
import authMiddleware from './../authentication/middleware';

const router = express.Router();

router.use(authMiddleware.protect);
router.post('/', controllers.createExpense);

export default router;
