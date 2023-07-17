const express = require("express");
const sqlite3 = require('better-sqlite3');
const {
    QuickDB
} = require('quick.db');
var TokenGenerator = require('token-generator')({
    salt: 'your-salt-string',
    timestampMap: 'abcdefghij'
});
const bcrypt = require('bcrypt');
const fs = require('fs');
const { isReadable } = require("stream");
const db = new QuickDB();
const app = express();
server = require('http').createServer(app),
    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/index.html");
    });

var server = server.listen(5000, function () {
    console.log("Server is running on http://localhost:5000");
});

//static stylesheets
app.use(express.static(__dirname + "/"));

var io = require('socket.io')(server);

io.on('connection', function (socket) {
    var codeCharacter = ["{", "}", "[", "]", "-", "*", "/", "|", "~", "@", "`", "\"", "'", "\\", ">", "<"];
    socket.on('signup', async function (data) {
        // check if username or password contains code character
        for (var i = 0; i < codeCharacter.length; i++) {
            if (data.username.includes(codeCharacter[i]) || data.password.includes(codeCharacter[i])) {
                socket.emit('signup-error', {
                    error: "Username or Password contains code character (" + codeCharacter + ")"
                });
                return;
            }
        }
        // check if username or password is empty
        if (data.username == "" || data.password == "") {
            socket.emit('signup-error', {
                error: "Username or Password is empty"
            });
            return;
        }
        // check if username or password is too long
        if (data.username.length > 20 || data.password.length > 20) {
            socket.emit('signup-error', {
                error: "Username or Password is too long (max 20 characters)"
            });
            return;
        }
        // check if username or password is too short
        if (data.username.length < 4 || data.password.length < 4) {
            socket.emit('signup-error', {
                error: "Username or Password is too short (min 4 characters)"
            });
            return;
        }
        // check if username is already exist
        if (await db.has(data.username) == true) {
            socket.emit('signup-error', {
                error: "Username is already exist"
            });
            return;
        }
        // check if password is same as confirm password
        if (data.password != data.confirmPassword) {
            socket.emit('signup-error', {
                error: "Password and Confirm Password must be same"
            });
            return;
        }

        // check if terms and conditions is checked
        if (data.terms == false) {
            socket.emit('signup-error', {
                error: "You must agree to the terms and conditions"
            });
            return;
        }

        // if all check is passed, signup
        db.set(data.username, {
            "password": bcrypt.hashSync(data.password, 10),
            "avatar": "src/avatar/avatar.jpg",
            "token": TokenGenerator.generate(),
            "username": data.username,
            "status": "No status yet",
            "favnum": 0,
            "favlist": []
        });
        socket.emit('wait-create');

        setTimeout(async function () {
            var info = await db.get(data.username);
            socket.emit('token', {
                token: info.token,
                username: info.username
            });
            socket.emit("create-success")
        }, 5000);
    });

    socket.on('auth', async function (auth) {
        var userAuth = auth.username || null;
        var passAuth = auth.token || null;


        if (userAuth == null || passAuth == null) return socket.emit('auth-error')
        if (await db.has(userAuth) == true) {
            var client = await db.get(userAuth);
            var token = client.token || null;
            if (token == passAuth) {
                socket.emit('auth-success', {
                    username: userAuth,
                    avatar: client.avatar,
                    favnum: client.favnum
                });
            } else {
                socket.emit('auth-error');
            }
        } else {
            socket.emit('auth-error');
        }
    })

    socket.on('login', async function (data) {
        // check if username or password contains code character
        for (var i = 0; i < codeCharacter.length; i++) {
            if (data.username.includes(codeCharacter[i]) || data.password.includes(codeCharacter[i])) {
                socket.emit('login-error', {
                    error: "Username or Password contains code character (" + codeCharacter + ")"
                });
                return;
            }
        }
        // check if username or password is empty
        if (data.username == "" || data.password == "") {
            socket.emit('login-error', {
                error: "Username or Password is empty"
            });
            return;
        }
        // check if username is already exist
        if (await db.has(data.username) == true) {
            var client = await db.get(data.username);
            var password = client.password || null;
            if (password == null) {
                socket.emit('login-error', {
                    error: "Password or Username is incorrect"
                });
                return;
            } else {

                if (bcrypt.compareSync(data.password, password)) {
                    socket.emit('login-success', {
                        username: data.username,
                        avatar: client.avatar,
                        remember: data.remember,
                        token: client.token
                    });
                } else {
                    socket.emit('login-error', {
                        error: "Password or Username is incorrect"
                    });
                }
            }
        } else {
            socket.emit('login-error', {
                error: "Password or Username is incorrect"
            });
        }

    })

    socket.on('ask-image', async function (data) {
        if (data.image == "") {
            socket.emit('notification', {
                notif: "Image is empty"
            });
            return;
        }

        //max size is 250Ko
        if (data.image.length > 250000) {
            socket.emit('notification', {
                notif: "Image is too large"
            });
            return;
        }
        if (data.image.includes("data:image/jpeg;base64,") == false && data.image.includes("data:image/png;base64,") == false && data.image.includes("data:image/jpg;base64,") == false) {
            socket.emit('notification', {
                notif: "Your image need to be in jpg, png or jpeg format"
            });
            return;
        }

        if (await db.has(data.username) == true) {

            var image = data.image.split("base64,")[1];
            var imageName = data.username + "-" + Date.now() + ".jpg";
            fs.writeFileSync("./src/avatar/" + imageName, image, "base64");
            // delete old image
            var oldImage = await db.get(data.username);
            if (oldImage.avatar != "src/avatar/avatar.jpg") {
                fs.unlinkSync(oldImage.avatar);
            }
            db.set(`${data.username}.avatar`, `src/avatar/${imageName}`);
            socket.emit('notification', {
                notif: "Your avatar has been changed"
            });
            socket.emit("change-avatar", {
                avatar: "src/avatar/" + imageName
            });
        } else {
            socket.emit('notification', {
                notif: "An error has occurred with your account"
            });
        }
    });

    socket.on('change-status', async function (data) {

        for (var i = 0; i < codeCharacter.length; i++) {
            if (data.status.includes(codeCharacter[i])) {
                socket.emit('notification', {
                    notif: "Status contains code character (" + codeCharacter + ")"
                });
                return;
            }
        }

        if (await db.has(data.username) == true) {
            if (data.token == await db.get(`${data.username}.token`)) {
                db.set(`${data.username}.status`, data.status);
                socket.emit('notification', {
                    notif: "Your status has been changed"
                });
            } else {
                socket.emit('notification', {
                    notif: "An error has occurred with your account"
                });
            }
        } else {
            socket.emit('notification', {
                notif: "An error has occurred with your account"
            });
        }
    });
    socket.on('sync-status-emit', async function (data) {
        if (await db.has(data.username) == true) {
            if (data.token == await db.get(`${data.username}.token`)) {
                socket.emit('sync-status', {
                    status: await db.get(`${data.username}.status`)
                });
            } else {
                socket.emit('notification', {
                    notif: "An error has occurred with your account"
                });
            }
        } else {
            socket.emit('notification', {
                notif: "An error has occurred with your account"
            });
        }
    });


    socket.on('add-fav', async function (data) {
        if (data.username == data.receiver) return socket.emit('notification', {
            notif: "You can't add yourself as a favorite"
        });
        if (await db.has(data.username) === true) {
            if (await db.get(`${data.username}.token`) === data.token) {
                // check if user is already in favorite
                var favList = await db.get(`${data.receiver}.favlist`);
                if (favList.includes(data.username)) {
                    socket.emit('remove-fav');
                    await db.sub(`${data.receiver}.favnum`, 1);
                    db.pull(`${data.receiver}.favlist`, data.username);
                } else {
                    await db.add(`${data.receiver}.favnum`, 1);
                    db.push(`${data.receiver}.favlist`, data.username);
                    socket.emit('confirm-fav');
                    socket.emit('notification', {
                        notif: "Your add favorite this user"
                    });
                }
            } else {
                socket.emit('notification', {
                    notif: "An error has occurred with your account"
                });
            }
        } else {
            socket.emit('notification', {
                notif: "An error has occurred with your account"
            });
        }
    });

    socket.on('search-user', async function (data) {
        var users = [];
        var users_ = await db.all();
        // db.all is like [{id: 'username'}, {id: 'username'}, ...]
        for (var i = 0; i < users_.length; i++) {
            var user = users_[i];
            if (user.id != data.username) {
                if (user.id.includes(data.search)) {
                    users.push(user.id);
                }
            }
        }
        // get avatar in folder src/avatar
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var avatar = await db.get(user);
            if (avatar.avatar == "src/avatar.jpg") {
                users[i] = {
                    username: user,
                    avatar: "src/avatar.jpg"
                }
            } else {
                users[i] = {
                    username: user,
                    avatar: avatar.avatar
                }
            }
        }

        // get fav_num
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            users[i].fav_num = await db.get(user.username + ".favnum");
        }
        socket.emit('show-users', {
            users: users,
        });
    });

    socket.on('get-profile', async function (data) {
        
        if (await db.has(data.username) == true) {
            var profile = await db.get(`${data.username}`);

            var hasfav = false;
            var favlist = await db.get(`${data.username}.favlist`)
            if(favlist.includes(data.author)) hasfav = true; 

            socket.emit('param-profile', {
                avatar: profile.avatar,
                status: profile.status,
                favnum: profile.favnum,
                username: profile.username,
                hasfav: hasfav
            });
        } else {
            socket.emit('notification', {
                notif: "An error has occurred with your account"
            });
        }
    });

});