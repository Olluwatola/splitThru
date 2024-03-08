import {NextFunction} from 'express';

// const confirmIsFriendsWith = async (
//   idOfUser: number,
//   arrayOfUserIds: number[]
// ): Promise<boolean> => {
//   try {
//     for (const userId of arrayOfUserIds) {
//       const checkFriendshipQuery =
//         "SELECT COUNT(*) FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) AND friendship_status = 'active'";
//       const checkFriendshipValues = [idOfUser, userId];
//       const result = await client.query(
//         checkFriendshipQuery,
//         checkFriendshipValues
//       );

//       const count = parseInt(result.rows[0].count);

//       if (count === 0) {
//         return false; // If any user is not friends, return false
//       }
//     }

//     return true; // All users are friends
//   } catch (error) {
//     console.error('Error confirming friendships:', error);
//     return false;
//   }
// };

const confirmIsFriendsWith = async (
  client,
  idOfUser: string,
  arrayOfUserIds: string[],
  next: NextFunction
): Promise<void | Boolean> => {
  try {
    for (const userId of arrayOfUserIds) {
      const checkFriendshipQuery =
        "SELECT COUNT(*) FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) AND friendship_status = 'active'";
      const checkFriendshipValues = [idOfUser, userId];
      const result = await client.query(
        checkFriendshipQuery,
        checkFriendshipValues
      );

      const count = parseInt(result.rows[0].count);

      if (count === 0) {
        return false; // If any user is not friends, return false
      }
    }

    return true; // All users are friends
  } catch (error) {
    return next(error);
  }
};

export default {confirmIsFriendsWith};
