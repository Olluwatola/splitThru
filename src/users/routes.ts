import express from 'express';
import controllers from './controllers';
import authMiddleware from './../authentication/middleware';

const router = express.Router();

//unfriend user
//accept friend request
//get all friend request

// probably implement notifs for friend request

// make it a protected route to admin
router.use(authMiddleware.protect);

router.post('/addfriend/:id', controllers.addFriend);
router.post('/block/:id', controllers.block);

export default router;
