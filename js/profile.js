window.onload = function () {
    // check if url contain params ?username=username
    if (window.location.href.indexOf("?username=") != -1) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const username = urlParams.get('username')
        if(username != localStorage.getItem('username') || sessionStorage.getItem('username') || username == ""){
        socket.emit('get-profile', {
            username: username,
            author: localStorage.getItem('username') || sessionStorage.getItem('username'),
        });
        } else {
            window.location.href = 'profile.html';
        }
    } else {
        socket.emit('auth', {
            token: localStorage.getItem('token') || sessionStorage.getItem('token'),
            username: localStorage.getItem('username') || sessionStorage.getItem('username'),
        })
    
        var Heart = document.getElementById('icon-heart');
        if (localStorage.username != UsernameEl.innerHTML || sessionStorage.getItem('username') != UsernameEl.innerHTML) {
            Heart.innerHTML = "favorite";
        }
        socket.emit('sync-status-emit', {
            username: localStorage.getItem('username') || sessionStorage.getItem('username'),
            token: localStorage.getItem('token') || sessionStorage.getItem('token')
        })
    }

    
}

var socket = io.connect();
var avatar = document.getElementById("avatar");
var username = document.getElementById("username");
var Heart = document.getElementById('icon-heart');
var fav_num = document.getElementById("favnum");
socket.on('auth-success', function (data) {
    avatar.src = data.avatar;
    username.innerHTML = data.username;
    fav_num.innerHTML = data.favnum;
});

socket.on("auth-error", function (data) {
    window.location.href = "signup.html";
});

function Disconnect() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    window.location.href = "signup.html";
}

// ask image from user
function askImage() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg", "image/jpg";
    input.onchange = function () {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            socket.emit('ask-image', {
                image: e.target.result,
                username: localStorage.getItem('username') || sessionStorage.getItem('username')
            });
        }
        reader.readAsDataURL(file);
    }
    input.click();
}

socket.on('notification', function (data) {
    notification(data.notif);
})

var notify_click = true;

// our function that we are going to call:
function notification($param) {
    if (notify_click === true) {
        notify_click = false;
        $('#notification').append('<p>' + $param + '</p>');

        $('#notification').animate({
            top: 45
        }, 300)
        setTimeout(
            function () {
                $('#notification').animate({
                    top: 20
                }, 200);
            }, 270);

        setTimeout(
            function () {
                $('#loading-bar').animate({
                    left: "-100%"
                }, 2000);
            }, 580);

        setTimeout(
            function () {
                $('#notification').animate({
                    top: -200
                }, 300);
            }, 2600);

        setTimeout(
            function () {
                $('#loading-bar').animate({
                    left: 0
                }, 0);


                $("#notification *:not('.loadbar')").remove();
                notify_click = true;
            }, 2900);
    }
}

socket.on('change-avatar', function (data) {
    avatar.src = data.avatar;
})

var FavNum = document.getElementById("favnum");
var UsernameEl = document.getElementById("username");

function AddFav(user) {
    if (localStorage.username != UsernameEl.innerHTML || sessionStorage.getItem('username')) {
        socket.emit('add-fav', {
            username: localStorage.getItem('username') || sessionStorage.getItem('username'),
            token: localStorage.getItem('token') || sessionStorage.getItem('token'),
            receiver: user
        });
    } else {
        notification("You can't add your own favorites!");
    }
}

socket.on('remove-fav', function() {
    FavNum.innerHTML = parseInt(FavNum.innerHTML) - 1;
    Heart.innerHTML = "heart_plus"
})

socket.on('confirm-fav', function () {
    FavNum.innerHTML = parseInt(FavNum.innerHTML) + 1;
    Heart.innerHTML = "favorite"
});

function ChangeStatus() {
    var Status = document.getElementById("status-input");
    var Bio = document.getElementById("bio-text");
    if (Status.value == "") return notification("The status can't be empty.");
    socket.emit('change-status', {
        status: Status.value,
        username: localStorage.getItem('username') || sessionStorage.getItem('username'),
        token: localStorage.getItem('token') || sessionStorage.getItem('token')
    });
    Bio.innerHTML = Status.value;
    Status.value = "";
    Status.focus();
}

// execute function when user press enter on status input
document.getElementById("status-input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        ChangeStatus();
    }
}, false);


socket.on('sync-status', function (data) {
    var Bio = document.getElementById("bio-text");
    Bio.innerHTML = data.status;
})

socket.on('param-profile', function(data) {
    var Username = document.getElementById("username");
    var Bio = document.getElementById("bio-text");
    var FavNum = document.getElementById("favnum");
    var Fav = document.getElementById("icon-heart");
    var Avatar = document.getElementById("avatar");
    var DivFav = document.getElementById("fav-cont");
    var StringUsername = toString(data.username);
    DivFav.setAttribute('onclick', `AddFav('${data.username}')`);
    Username.innerHTML = data.username;
    Bio.innerHTML = data.status;
    FavNum.innerHTML = data.favnum;
    Avatar.src = data.avatar;
    if (data.username == localStorage.getItem('username') || sessionStorage.getItem('username')) {
        Fav.innerHTML = "favorite";
    }
    if(data.hasfav == true) {
        Fav.innerHTML = "favorite";
    } else {
        Fav.innerHTML = "heart_plus";
    }
})