//Toggle Sidebar
$('[data-toggle=offcanvas]').click(function() {
    $(this).find('i').toggleClass('glyphicon-chevron-right glyphicon-chevron-left');
    $('.row-offcanvas').toggleClass('active');
    $('#sidebar').toggleClass('hidden-xs').toggleClass('visible-xs');
    $('#xs-menu').toggleClass('visible-xs').toggleClass('hidden-xs');
});

function checkIfLoggedIn(params) {
    
}

function showToast(message){
    $('.notification').text(message).show('fast').delay(3000).hide('fast');
}