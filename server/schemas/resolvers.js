const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate("books");

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
    },


    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        removeBook: async (parent, { bookId }) => {
            return Book.findOneAndDelete({ _id: bookId });
        },
    },
};

module.exports = resolvers;


// removeBook: async (parent, { bookId }) => {
//     return Book.findOneAndUpdate(
//         { _id: bookId },
//         { $pull: { comments: { _id: commentId } } },
//         { new: true }
