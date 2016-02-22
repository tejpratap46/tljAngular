var app = angular.module(appName);

app.controller('navigationController',['$scope', '$sce', '$http', function ($scope, $sce, $http) {
    
    $scope.$on('userLoggedIn', function (event, data) {
        console.log('navigationController userLoggedIn');
        $scope.checkIfLoggedIn = checkIfLoggedIn();
    });
    
    $scope.checkIfLoggedIn = checkIfLoggedIn();
    
    function checkIfLoggedIn(){
        if(localStorage.getItem(prefUsername)){
            $scope.userMenu = $sce.trustAsHtml("<li><a href='#/user'>" + localStorage.getItem(prefName) + "<span class='caret'></span></a></li><li><a href='#/login'>Logout</a></li>");
            $scope.loggedIn = true;
            $('#navbar').show(0);
        }else{
            $scope.userMenu = $sce.trustAsHtml("<li><a href='#/login' class='bold'>Login</a></li>");
            $scope.loggedIn = false;
            $('#navbar').hide(0);
        }
    }
    
    $scope.searchBoxPlaceholder = "Search Movie";
    
    $scope.searchBoxBlur = function(){
        $scope.searchBoxPlaceholder = "Search Movie";
        setTimeout(function(){
            $('.dropdown-menu').hide('fast');
        },100);
    }
    
    $scope.searchBoxClick = function(){
        $scope.searchBoxPlaceholder = "Search By Movie Name, Actor Name, Director Name";
        $('.dropdown-menu').show('fast');
    }
    
    $scope.searchMovie = function(){
        if($scope.searchData.length > 0){
            $('.dropdown-menu').show('fast');
            
            var data = {
                
            };

            var config = {
                headers : {
                    'Content-Type': 'application/json'
                }
            }

            $http.post(hostAddress + '/managepatientsweb', data, config)
            .then(
            function(response){
                // success callback
                try{
                }catch (err){
                    console.log(err);
                }finally{
                    $scope.$apply();
                }
            },
            function(error){
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
            
        }else{
            $('.dropdown-menu').hide('fast');
        }
    }
}]);