var app = angular.module(appName);

app.registerCtrl('movieViewController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    
    /* Get Movie */
    var data = {
        "query": {
            "_id": $routeParams.id
        },
        "select":{
            "__v": 0
        },
        "skip": 0,
        "limit": 10
    };

    var config = {
        headers : {
            'Content-Type': 'application/json'
        }
    }

    $http.post(hostAddress + '/api/movie/getQuery', data, config)
    .then(
        function(response){
            // success callback
            try {
                var data = response.data;
                console.log(data);
                if (data.Status){
                    var movies = data.Movies;
                    movies.forEach(function(object){
                        object.Genres = object.Genres.join(", ");
                        object.Released = moment(object.Released).format('MMMM Do YYYY');
                        object.addedToWatchlist = false;
                        object.addedToWatched = false;
                        object.addedToLiked = false;
                    });
                    $scope.movie = movies[0];
                }
            } catch(err) {
                console.log(err);
            } finally {
                $scope.$apply();
            }
        },
        function(error){
            // failure callback
            $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
        }
    );
    
    $scope.addToWatchlist = function(){
        if ($scope.movie.addedToWatchlist){
            $scope.movie.addedToWatchlist = false;
        }else{
            $scope.movie.addedToWatchlist = true;
        }
        $scope.$apply();
    }
    
    $scope.addToWatched = function(){
        if ($scope.movie.addedToWatched){
            $scope.movie.addedToWatched = false;
        }else{
            $scope.movie.addedToWatched = true;
        }
        $scope.$apply();
    };
    
    $scope.addToLiked = function(){
        if ($scope.movie.addedToLiked){
            $scope.movie.addedToLiked = false;
        }else{
            $scope.movie.addedToLiked = true;
        }
        $scope.$apply();
    };
    
    $scope.playTrailer = function(){
    };
    
}]);