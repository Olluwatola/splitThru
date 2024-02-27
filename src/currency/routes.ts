import express from 'express';
import controllers from './controllers';

const router = express.Router();

// make it a protected route to admin
router.post('/', controllers.createCurrency);
router.get('/all', controllers.getAllCurrency);

export default router;
