import catchAsync from '../utils/catchAsync';
import {Request, Response, NextFunction} from 'express';
import pool from './../db/db';
import AppError from '../utils/appError';

const addFriend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const addUserID = req.params.id;
    console.log(`this is the me ${req?.currentUser?.id}`);
    //get user
    const client = await pool.connect();

    const query =
      'SELECT id, email, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended FROM users WHERE id = $1';
    const values = [addUserID];

    client.query(query, values, async (error: Error, results) => {
      if (error) {
        return next(error);
      }
      if (results.rows.length === 0) {
        return next(new AppError('user being added does not exist', 401));
      }
      if (results.rows[0].is_deleted) {
        return next(new AppError('user being added does not exist', 401));
      }
      if (results.rows[0].is_suspended) {
        return next(
          new AppError('you cannot add this user at this moment', 401)
        );
      }
      if (req?.currentUser?.id === results.rows[0].id) {
        return next(
          new AppError('you cannot send a friendrequest to yourself', 401)
        );
      }
      // implement blocked user cannot add user
      const blockRelQuery =
        'SELECT blocked_relationship_id, blocker_id, blocked_id FROM blocked_relationships WHERE blocker_id = $1 AND blocked_id = $2;';
      const blockRelValues = [addUserID, req?.currentUser?.id];

      client.query(
        blockRelQuery,
        blockRelValues,
        async (error: Error, results) => {
          if (error) {
            return next(error);
          }
          if (results.rows[0]) {
            new AppError('you cannot add this user', 401);
          }
        }
      );
      //create friend_request row
      try {
        const createRequestQuery =
          "IF EXISTS ( SELECT 1 FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id=$3 AND user2_id = $4) AND friendship_status='active') BEGIN THROW 50001,'Error : Friendship already exists. Cannot send friend request.', 1; END ELSE BEGIN  INSERT INTO friend_requests (sender_id, recipient_id, status, created_at, updated_at) VALUES ($5, $6, 'pending', NOW(), NOW()); END";
        const createRequestValues = [
          req?.currentUser?.id,
          addUserID,
          addUserID,
          req?.currentUser?.id,
          req?.currentUser?.id,
          addUserID,
        ];
        client.query(
          createRequestQuery,
          createRequestValues,
          async (error: Error, results) => {
            if (error) {
              return next(error);
            }
            res.status(200).json({
              message: 'Successfully added user ',
            });
          }
        );
      } catch (error) {
        return next(error);
      }
    });
  }
);

const block = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToBlock = req.params.id;
    //get user
    const client = await pool.connect();

    const query =
      'SELECT id, email, last_name, first_name, date_of_birth, role, is_flagged, is_deleted, is_suspended FROM users WHERE id = $1';
    const values = [userToBlock];

    client.query(query, values, async (error: Error, results) => {
      if (error) {
        return next(error);
      }
      if (results.rows.length === 0) {
        return next(new AppError('user being blocked does not exist', 401));
      }
      if (results.rows[0].is_deleted) {
        return next(new AppError('user being blocked does not exist', 401));
      }
      if (req?.currentUser?.id === results.rows[0].id) {
        return next(new AppError('you cannot block yourself', 401));
      }

      const createRequestQuery =
        'INSERT INTO blocked_relationships (blocker_id, blocked_id, created_at) VALUES ($1, $2, NOW());';
      const createRequestValues = [req?.currentUser?.id, results?.rows[0]?.id];
      client.query(
        createRequestQuery,
        createRequestValues,
        async (error: Error, results) => {
          if (error) {
            return next(error);
          }
          res.status(200).json({
            message: 'Successfully blocked user ',
          });
        }
      );
    });
  }
);

//accept friend
const accept = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query =
      "BEGIN TRANSACTION; WITH variable_master AS ( SELECT sender_id, recipient_id FROM friend_requests WHERE request_id = 10 AND recipient_id = 8 ) INSERT INTO friendships (user1_id, user2_id, friendship_status, created_at, updated_at) SELECT LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM variable_master; UPDATE friend_requests SET status = 'active' WHERE request_id = 8; COMMIT TRANSACTION;";
    const client = await pool.connect();
    client.query(query, async (error: Error, results) => {
      if (error) {
        return next(error);
      }
      console.log(results);
      res.status(200).json({
        message: 'Successfully blocked user ',
      });
    });
  }
);
//unfriend

export default {addFriend, block};
