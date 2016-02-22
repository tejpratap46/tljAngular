var app = angular.module(appName);

app.registerCtrl('loginController', ['$rootScope', '$scope', '$http', '$sce', function($rootScope, $scope, $http, $sce) {
    
    localStorage.removeItem(prefUsername);
    localStorage.removeItem(prefName);
    localStorage.removeItem(prefFollowing);
    localStorage.removeItem(prefUserId);
    $rootScope.$broadcast('userLoggedIn', {});
    
    $scope.login = function() {
        if ($scope.email && $scope.password) {
            var data = {
                "username": $scope.email,
                "password": $scope.password
            };
            
            var config = {
                headers : {
                    'Content-Type': 'application/json'
                }
            }

            $http.post(hostAddress + '/api/user/login', data, config)
            .then(
            function(response){
                // success callback
                var data = response.data;
                if (data.Status){
                    localStorage.setItem(prefUsername, data.Username);
                    localStorage.setItem(prefName, data.Name);
                    localStorage.setItem(prefFollowing, data.Following);
                    localStorage.setItem(prefUserId, data._id);
                    $rootScope.$broadcast('userLoggedIn', {});
                    window.location.hash = "/home";
                }else{
                    $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
                }
            },
            function(error){
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
        };
	};

    $scope.register = function() {
        window.location.hash = "/register";
    };
}]);