var app = angular.module(appName);

app.registerCtrl('movieListController', ['$scope', '$http', function($scope, $http) {
    $scope.noDataFound = false;
    
    /* Get Movie */
    var data = {
        "query": {
            "Languages": "English",
            "Released": {
                "$gt": moment().format("YYYY-MM-DD")
            }
        },
        "select":{
            "Title": 1,
            "Released": 1,
            "Poster": 1,
            "ImdbRating": 1,
            "Genres": 1,
            "Runtime":1
        },
        "sort": {
            "Released": 1
        },
        "skip": 0,
        "limit": 10,
        "userid": localStorage.getItem(prefUserId)
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
                $scope.movies = [];
                console.log(data);
                if (data.Status){
                    var movies = data.Movies;
                    movies.forEach(function(object){
                        object.Genres = object.Genres.join(", ");
                        object.Released = moment(object.Released).format('MMMM Do YYYY');
                        $scope.movies.push(object);
                    });
                }else{
                    $scope.noDataFound = true;
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
    /* End Movie */
    
    $scope.addToWatchlist = function($index){
        if ($scope.movies[$index].addedToWatchlist){
            $scope.movies[$index].addedToWatchlist = false;
        }else{
            $scope.movies[$index].addedToWatchlist = true;
        }
        $scope.addToList = addToList($index, "Watchlist", "");
        $scope.$apply();
    };
    
    $scope.addToWatched = function($index){
        if ($scope.movies[$index].addedToWatched){
            $scope.movies[$index].addedToWatched = false;
        }else{
            $scope.movies[$index].addedToWatched = true;
        }
        $scope.addToList = addToList($index, "Watched", "");
        $scope.$apply();
    };
    
    $scope.addToLiked = function($index){
        if ($scope.movies[$index].addedToLiked){
            $scope.movies[$index].addedToLiked = false;
        }else{
            $scope.movies[$index].addedToLiked = true;
        }
        $scope.addToList = addToList($index, "Liked", "");
        $scope.$apply();
    };
    
    $scope.playTrailer = function($index){
    };
    
    function addToList(index, listName, caption){
        var movie = $scope.movies[index];
        var data = {
            "movieid": movie._id,
            "userid": localStorage.getItem(prefUserId),
            "listName": listName,
            "caption": caption
        };

        var config = {
            headers : {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listAddMovie', data, config)
        .then(
            function(response){
                // success callback
                try {
                    var data = response.data;
                    if (data.Status){
                        if (data.MovieAdded){
                            console.log(data);
                        }else{
                            console.log(data);
                        }
                    }else{
                        $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
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
    }
    
}]);