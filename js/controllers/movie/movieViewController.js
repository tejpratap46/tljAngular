var app = angular.module(appName);

app.registerCtrl('movieViewController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    
    /* Get Movie */
    var data = {
        "query": {
            "_id": $routeParams.id
        },
        "select":{
            "CreatedAt": 1,
            "UpdatedAt": 1,
            "Title": 1,
            "Year": 1,
            "Rated": 1,
            "Released": 1,
            "Runtime": 1,
            "Genres": 1,
            "Directors": 1,
            "Writers": 1,
            "Actors": 1,
            "Plot": 1,
            "Languages":1,
            "Countries": 1,
            "Awards": 1,
            "Poster": 1,
            "Metascore": 1,
            "DVD": 1,
            "BoxOffice": 1,
            "Production": 1,
            "Website": 1,
            "ImdbRating": 1,
            "ImdbVotes": 1,
            "ImdbID": 1,
            "TomatoMeter": 1,
            "TomatoRating": 1,
            "TomatoReviews": 1,
            "TomatoFresh": 1,
            "TomatoRotten": 1,
            "TomatoConsensus": 1,
            "TomatoUserMeter": 1,
            "TomatoUserRating": 1,
            "TomatoUserReviews": 1,
            "ListedBy": 1
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
                console.log(data);
                if (data.Status){
                    var movies = data.Movies;
                    movies.forEach(function(object){
                        object.Genres = object.Genres.join(", ");
                        object.Released = moment(object.Released).format('MMMM Do YYYY');
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
        $scope.addToList = addToList("Watchlist", "");
        $scope.$apply();
    }
    
    $scope.addToWatched = function(){
        if ($scope.movie.addedToWatched){
            $scope.movie.addedToWatched = false;
        }else{
            $scope.movie.addedToWatched = true;
        }
        $scope.addToList = addToList("Watched", "");
        $scope.$apply();
    };
    
    $scope.addToLiked = function(){
        if ($scope.movie.addedToLiked){
            $scope.movie.addedToLiked = false;
        }else{
            $scope.movie.addedToLiked = true;
        }
        $scope.addToList = addToList("Liked", "");
        $scope.$apply();
    };
    
    $scope.playTrailer = function(){
    };
    
    function addToList(listName, caption){
        var movie = $scope.movie;
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