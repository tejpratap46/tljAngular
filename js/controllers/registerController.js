var app = angular.module(appName);

app.registerCtrl('registerController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
    $scope.login = function () {
        window.location.hash = "#/login"
    };

    $scope.register = function () {
        if ($scope.username && $scope.name && $scope.email && $scope.password) {
            var data = {
                "username": $scope.username,
                "email": $scope.email,
                "password": $scope.password,
                "name": $scope.name
            };

            $http.post(hostAddress + '/api/user/register', data)
                .then(
                function (response) {
                    // success callback
                    var data = response.data;
                    if (data.Status) {
                        localStorage.setItem(prefUsername, data.Username);
                        localStorage.setItem(prefName, data.Name);
                        localStorage.setItem(prefFollowing, data.Following);
                        localStorage.setItem(prefUserId, data._id);
                        $rootScope.$broadcast('userLoggedIn', {});
                        window.location.hash = "/home";
                    } else {
                        $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
                    }
                },
                function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
        };
    };

    $scope.checkUsername = function ($event) {
        var keyCode = $event.which;
        console.log(keyCode);
        if (keyCode == 32) {
            $event.preventDefault();
        }
    };
}]);