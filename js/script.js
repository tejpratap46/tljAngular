//Toggle Sidebar
$('[data-toggle=offcanvas]').click(function() {
    $(this).find('i').toggleClass('glyphicon-chevron-right glyphicon-chevron-left');
    $('.row-offcanvas').toggleClass('active');
    $('#sidebar').toggleClass('hidden-xs').toggleClass('visible-xs');
    $('#xs-menu').toggleClass('visible-xs').toggleClass('hidden-xs');
});

function checkIfLoggedIn() {
    if (localStorage.getItem(prefUsername)) {
        $('#navbar').show(0);
        $('#sidebar').show(0);
    } else {
        $('#navbar').hide(0);
        $('#sidebar').hide(0);
        window.location.hash="/login";
    }
}

function showToast(message) {
    $('.notification').text(message).show('fast').delay(3000).hide('fast');
}