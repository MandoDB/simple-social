var socket = io.connect();
var RememberMe = document.getElementById("remember-me");
var UsernameLogin = document.getElementById("username-login");
var PasswordLogin = document.getElementById("password-login");

// paragraph error
var ErrorLogin = document.getElementById("error-login");

socket.on('login-success', function (data) {
    var token = data.token;
    if(data.remember == true) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', data.username);
    } else if(data.remember == false) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('username', data.username);
    } else {
        ErrorLogin.innerHTML = "An error has occurred";
    }
    window.location.href = "profile.html";
});

socket.on('login-error', function (data) {
    ErrorLogin.innerHTML = data.error;
});

function Login() {
    console.log("test")
    socket.emit('login', {
        username: UsernameLogin.value,
        password: PasswordLogin.value,
        remember: RememberMe.checked,
    });
}

var ShowPassword = document.getElementById("show-password");
ShowPassword.addEventListener("click", function () {
    if (PasswordLogin.type == "password") {
        PasswordLogin.type = "text";
    } else {
        PasswordLogin.type = "password";
    } 
});
