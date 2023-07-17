$('document').ready(function () {
    'use strict';
    $('div.toggle-menu').on('click', function () {
        $('header nav').toggleClass('has-clicked');
        $(this).toggleClass('is-open');
    });
});