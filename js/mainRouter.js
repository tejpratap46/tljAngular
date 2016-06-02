var app = angular.module(appName);

app.registerCtrl('mainRouter', ['$scope', function ($scope) {
    if (localStorage.getItem(prefUsername)) {
        window.location.hash = '/home';
    } else {
        if (window.location.hash = '/register') {

        } else {
            window.location.hash = '/login';
        }
    }
}]);