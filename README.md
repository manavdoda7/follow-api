# follow-api
An API for creating, reading, updating and deleting users. <br>
Users can follow/unfollow each other <br>
Suggestions are shown on the basis of mutuals. Suggestions to follow other users are shown according to the given Algorithm
[Deployed Link](https://follow--api.herokuapp.com/)

## Index
  * [Endpoints](#endpoints)
  * [Run Project Locally](#localSetup)
  * [Dependencies](#depend)
  * [How to use deployed link](#deployed)

## <a name="endpoints"></a>Endpoints
### User Routes
#### /api/users (GET Request)
  * Will Fetch list of all the users who are registered on the database.
  * The list will contain First Name, Last Name, Email ID and Username of all the users.
  * You can pass additional arguments in query to shortlist the users.
  * Response example on status 200 (OK) :<br> ```{
    "success": true,
    "users": [
        {
            "Username": "username1",
            "Email": "email1@email.com",
            "First Name": "Test",
            "Last Name": "User1"
        },
        {
            "Username": "username2",
            "Email": "email2@email.com",
            "First Name": "Test",
            "Last Name": "User2"
        }, ......
    ]
}```
#### /api/users/register (POST Request)
  * A user registration endpoint 
  * Request body example: <br>  ``` {"username": "testusername",
"email": "email@email.com",
"fName":"Test",
"lName":"User",
"password":"1234"} ```  
  * Response example on status 201 (Created):<br> ``` {
    "success": true,
    "message": "User created"
} ```
  * Does not allow users with same username or email ID ( i.e. no duplicate users )
  * Response for above request ( TestUser already exists ) : <br>``` {
    "success": true,
    "error": "Email already exists."
}```

#### /api/users/login (POST Request)
  * Endpoint for User Login
  * Request body example: <br>```{
    "username": "testusername",
    "password": "1234"
}```
  * A token is returned when login is successfull which is valid for 1 hour.
  * Response example on status 200 (OK): <br> ```{
    "success": true,
    "message": "Authenication successfull.",
    "token": "unique_token"
}```
  * Doesn't allow authenication if either username or password is incorrect.
  * Response for above request: <br>'''{
    "success": true,
    "message": "Login failed"
}'''

#### /api/users/username (PATCH Request)
  * Endpoint for modification in user data
  * Requirements: Unique token acquired when logged in and username passed in request params should be same as username of user in token.
  * Request body example:<br> ```{
    "email": "email2@email.com",
    "fName": "Test2",
    "lName": "User2",
    "password": "12345678"
}```
  * Response example on status 200(OK):<br> ```{
    "success": true,
    "message": "All valid entries updated."
}```
  * Doesn't allow action if email already exists in database.
  * Response for above request: <br>```{
    "success": true,
    "error": "The email you are trying to set already exists in DB. Please try again using diffrent email."
}```

#### /api/users (DELETE Request)
  * Endpoint for deleting a user and all its related data permanently from database.
  * Requirements: Unique token acquired when logged in and username passed in request params should be same as username of user in token.
  * Response example on status 202(Accepted):<br>```{
    "success": true,
    "message": "User deleted successfully."
}```
  * Doesn't allow if user is trying to delete without valid token
  * Response for above request: <br>```{
    "success": true,
    "error": "You're not authorized."
}```

### Following Routes

#### /api/following (GET Request)
  * Endpoint for getting the list of all the followings of authenicated user.
  * The list will contain the Username, Email ID, First Name, Last Name of all such users.
  * Requirements: User should be authenicated.
  * Response example on status 200(OK):<br>```{
    "success": true,
    "following": [
        {
            "Username": "username1",
            "Email": "email@email.com",
            "First Name": "Test",
            "Last Name": "User"
        },
        {
            "Username": "username2",
            "Email": "email@email.com",
            "First Name": "Test",
            "Last Name": "User2"
        }, ......
    ]
}```
 
#### /api/following (POST Request)
  * Endpoint for following a new user.
  * Requirements: User should be authenicated.
  * Request body example:<br> ```{
    "username": "manavdoda"
}```
  * Response example on status 201 (Created):<br>```{
    "success": true,
    "message": "Task successfull."
}```
  * Doesn't allow to follow yourself, follow a user which doesn't exist or follow a user whom you already follow. 
  * Response for above request:<br>```{
    "success": true,
    "error": "You can't follow yourself"
}```<br>```{
    "success": true,
    "error": "Username not found."
}```<br>```{
    "success": true,
    "error": "You're already following this user."
}```

#### /api/following/username (DELETE Request)
  * Endpoint for removing a person from following.
  * Requirements: User shold be authenicated.
  * Response example on status 200(OK): <br> ```{
    "success": true,
    "message": "Relationship deleted."
}```
  * Doesn't allow the request if such relationship doesn't exist.
  * Response for above request: <br>```{
    "success": false,
    "error": "You're not following this user."
}```

### Follower Routes 
#### /api/follower (GET Request)
  * Endpoint for getting the list of all the followers of authenicated user.
  * The list will contain the Username, Email ID, First Name, Last Name of all such users.
  * Requirements: User should be authenicated.
  * Response example on status 200(OK):<br>```{
    "success": true,
    "followers": [
        {
            "Username": "username1",
            "Email": "email@email.com",
            "First Name": "Test",
            "Last Name": "User"
        },
        {
            "Username": "username2",
            "Email": "email@email.com",
            "First Name": "Test",
            "Last Name": "User2"
        }, ......
    ]
}```

#### /api/followers/username (DELETE Request)
  * Endpoint for removing a person from followers.
  * Requirements: User shold be authenicated.
  * Response example on status 200(OK): <br> ```{
    "success": true,
    "message": "Relationship deleted."
}```
  * Doesn't allow the request if such relationship doesn't exist.
  * Response for above request: <br>```{
    "success": false,
    "error": "This user is not following you."
}```

### Suggestion Routes
#### /api/suggestions (GET Request)
  * Endpoint to get a list of suggested users whom you can follow.
  * Requirements: User should be authenicated.
  * Response example on status 200 (OK): <br>```{
    "success": true,
    "suggestions": [
        [
            {
                "Username": "username",
                "First Name": "Test",
                "Last Name": "User1"
            }
        ],
        [
            {
                "Username": "Username",
                "First Name": "Test",
                "Last Name": "User2"
            }
        ], ......
    ]
}```
   
### NOTE: Every end point has request data validator and throws an appropirate error for bad requests


## <a name="localSetup"></a>Run project locally 
 * Create a fork and clone the fork to your local system: ``` git clone https://github.com/manavdoda7/follow-api.git ```
 * Run : ``` cd follow-api/ ```
 * Run : ``` npm install ```
 * Create a new ```.env``` file with the following data: <br>

```PORT=3000```<br>
```DB=<YOUR_DB_HOST>```(localhost for local database)<br>
```DB_USER=<NAME_OF_DB_USER>```(root for local user generally)<br>
```DB_PASSWORD=<YOUR_DB_PASSWORD>```(NULL if you haven't configured for local user) <br>
```DB_DATABASE=<DATABASE_NAME>``` (Create a new database) <br>
```JWT_SECRET=<YOUR_SECRET>``` (You can assign any secret key)
 * Start the express server using initial terminal: ``` npm start ```
 * Check Api status on ``` http://localhost:3000/ ``` 
 * Base URL : ``` http://localhost:3000/ ```
 * The above guide assumes node.js, mysql server are installed on your machine

## <a name="depend"></a>Dependencies 
#### "express"
#### "bcrypt": For hashing the passwords during registration and changing user data.
#### "dotenv": For configuring environment variables.
#### "jsonwebtoken": For generating and verifying token during the sessions.
#### "mysql2": For connecting to the MySQL database.
 
## <a name="deployed"></a>To use deployed link for making requests: 
 * Use the base url and append the above given endpoints
 * Example: https://follow--api.herokuapp.com/api/users
