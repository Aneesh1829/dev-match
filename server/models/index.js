const User = require('./User');
const Problem = require('./Problem');
const Submission = require('./Submission');
const Friendship = require('./Friendship');
const Follow = require('./Follow');
const Message = require('./Message');
const Post = require('./Post');
const PostLike = require('./PostLike');
const Comment = require('./Comment');

// User -> Submissions
User.hasMany(Submission, { foreignKey: 'user_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Problem -> Submissions
Problem.hasMany(Submission, { foreignKey: 'problem_id', as: 'submissions' });
Submission.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

// Friendships
User.hasMany(Friendship, { foreignKey: 'requester_id', as: 'sentRequests' });
User.hasMany(Friendship, { foreignKey: 'recipient_id', as: 'receivedRequests' });
Friendship.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

// Follows
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'following' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'followers' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'followedUser' });

// Messages
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// Posts
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Problem.hasMany(Post, { foreignKey: 'problem_id', as: 'posts' });
Post.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

// Post Likes
User.hasMany(PostLike, { foreignKey: 'user_id', as: 'likes' });
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes' });
PostLike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PostLike.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

module.exports = {
  User,
  Problem,
  Submission,
  Friendship,
  Follow,
  Message,
  Post,
  PostLike,
  Comment,
};
