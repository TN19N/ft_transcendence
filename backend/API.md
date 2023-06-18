# API Documentation:

## Authentication:
* GET   /api/auth/login - Login The User.
* GET   /api/auth/logout - Logout The User.
* POST  /api/auth/2fa {code: string} - authenticate the user with 2fa code.

## User:
* POST  /api/user/turnOn2fa - Turn on 2fa for the user.
* POST  /api/user/turnOff2fa - Turn off 2fa for the user.
* POST  /api/user/enable2fa {code: string} - Enable 2fa for the user.
* POST  /api/user/avatar {form-data: {avatar: file.png}} - Upload avatar for the user.
* GET   /api/user/avatar?userId - Get avatar for the user with the userId.
* GET   /api/user?userId - Get user with the userId.
* GET   /api/user/profile?userId - Get user profile with the userId.

// Note: userId is optional, if not provided, it will return the current user.

* GET    /api/user/preferences - Get user preferences.
* POST   /api/user/profile {UserProfileDto} - Update user profile.
* POST   /api/user/friend?friendId - send friend request to the user with the friendId.
* GET    /api/user/friends - Get all friends for the current user.
* GET    /api/user/friendRequests/received - Get all friend requests for the current user.
* GET    /api/user/friendRequests/sent - Get all friend requests sent by the current user.
* POST   /api/user/acceptFriendRequest?friendRequestId - Accept friend request with the friendRequestId.
* GET    /api/user/search?query - Search for users by query (match the query with the beginning of the user name).

## testing:
* POST   /api/user/delete - delete ALL 🤣.
* POST   /api/user/add - add random user 😱.
* GET    /api/user/switch?userId - switch user 😈.