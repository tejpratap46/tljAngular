var app = angular.module(appName);

app.registerCtrl('registerController', ['$scope', function($scope) {
    $scope.login = function() {
        window.location.hash = "#/login"
    };

    $scope.register = function() {
        
    };

    $scope.checkUsername = function(){
        
    };
}]);