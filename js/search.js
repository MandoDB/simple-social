var socket = io.connect();

function search() {
    var search = document.getElementById('search-input');
    socket.emit('search-user', {
        search: search.value
    });
}

// execute function when user press enter on status input
document.getElementById("search-input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        search();
    }
}, false);

var notify_click = true;
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

socket.on('show-users', function (data) {
    $('#profile-list').empty();
    // show users, array is like this: {username: 'MandoDB', avatar: 'src/avatar/avatar.jpg', fav_num: 0}
    var users = data.users;
    for (var i = 0; i < users.length; i++) {
        $("#profile-list").append('<div class="profile" onclick="window.location.href = \'profile.html?username='+ users[i].username +'\';"><p id="username">' + users[i].username + '</p><p id="fav"><span id="heart" class="material-symbols-outlined">favorite</span>' + users[i].fav_num + '</p><img id="avatar" src="' + users[i].avatar + '"/></div>');
    }
});