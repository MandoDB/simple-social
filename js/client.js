// input / button

var socket = io.connect();
var Username = document.getElementById("username");
var Password = document.getElementById("password");
var ConfirmPassword = document.getElementById("confirm-password");
var Terms = document.getElementById("terms");

var Error = document.getElementById("error");

function SignUp() {
        socket.emit('signup', {
            username: Username.value,
            password: Password.value,
            confirmPassword: ConfirmPassword.value,
            terms: Terms.checked,

        });
}

socket.on('signup-error', function (data) {
    Error.innerHTML = data.error;
});
socket.on('token', function (data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
});
socket.on("wait-create", function (data) {
    document.querySelector(".wait-create").style.display = "block";
});
socket.on("create-success", function (data) {
    document.querySelector(".wait-create").style.display = "none";
    window.location.href = "profile.html";
});

// show password
var ShowPassword = document.getElementById("show-password");
ShowPassword.addEventListener("click", function () {
    if (Password.type == "password" || ConfirmPassword.type == "password") {
        Password.type = "text";
        ConfirmPassword.type = "text";
    } else {
        Password.type = "password";
        ConfirmPassword.type = "password";
    } 
});


window.onload(function () {
    if(localStorage.getItem('token') != null) {
        window.location.href = "profile.html";
    }
})
