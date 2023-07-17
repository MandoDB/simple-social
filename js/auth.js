window.onload = function() {
    socket.emit('auth', {
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username'),
    })
}

var socket = io.connect();
var avatar = document.getElementById("avatar");
var username = document.getElementById("username");

socket.on('auth-success', function (data) {
    avatar.src = data.avatar;
    username.innerHTML = data.username;
});

socket.on("auth-error", function (data) {
    window.location.href = "index.html";
});