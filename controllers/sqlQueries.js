let createUserTable = "create table if not exists user" +
                        "(username varchar(40) primary key," +
                        "email varchar(60)," +
                        "fName varchar(40)," +
                        "lName varchar(40)," +
                        "password varchar(150));"
let createFollowTable = "create table if not exists follow" +
                        "(followed varchar(40)," + //If i follow someone i am followedBy and the other person is follows
                        "followedBy varchar(40)," +
                        "foreign key(followed) references user(username) on delete cascade," +
                        "foreign key(followedBy) references user(username) on delete cascade," +
                        "primary key(followed, followedBy));"

module.exports = {createUserTable, createFollowTable}