var app = angular.module(appName);

app.registerCtrl('movieViewController', ['$scope', '$http', '$routeParams', '$window', function ($scope, $http, $routeParams, $window) {

    /* Get Movie */
    var data = {
        "query": {
            "_id": $routeParams.id
        },
        "select": {
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
            "Languages": 1,
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

    // Make big poster image half of screen size
    $scope.backdropHeight = $window.innerHeight / 1.4;

    $http.post(hostAddress + '/api/movie/getOneQuery', data)
        .then(
        function (response) {
            // success callback
            var data = response.data;
            console.log(data);
            if (data.Status) {
                var movies = data.Movies;
                movies.forEach(function (object) {
                    object.Released = moment(object.Released).format('MMMM Do YYYY');
                    object.Languages = object.Languages ? object.Languages.join(", ") : undefined
                });
                $scope.movie = movies[0];
            }
        },
        function (error) {
            // failure callback
            $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
        }
        );

    $scope.addToWatchlist = function () {
        if ($scope.movie.addedToWatchlist) {
            $scope.movie.addedToWatchlist = false;
        } else {
            $scope.movie.addedToWatchlist = true;
        }
        $scope.addToList = addToList("Watchlist", "");
    }

    $scope.addToWatched = function () {
        if ($scope.movie.addedToWatched) {
            $scope.movie.addedToWatched = false;
        } else {
            $scope.movie.addedToWatched = true;
        }
        $scope.addToList = addToList("Watched", "");
    };

    $scope.addToLiked = function () {
        if ($scope.movie.addedToLiked) {
            $scope.movie.addedToLiked = false;
        } else {
            $scope.movie.addedToLiked = true;
        }
        $scope.addToList = addToList("Liked", "");
    };

    $scope.playTrailer = function () {
    };

    function addToList(listName, caption) {
        var movie = $scope.movie;
        var data = {
            "movieid": movie._id,
            "userid": localStorage.getItem(prefUserId),
            "listName": listName,
            "caption": caption
        };

        $http.post(hostAddress + '/api/list/listAddMovie', data)
            .then(
            function (response) {
                // success callback
                var data = response.data;
                if (data.Status) {
                    if (data.MovieAdded) {
                        console.log(data);
                    } else {
                        console.log(data);
                    }
                } else {
                    $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
                }
            },
            function (error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

    // Get Trailer
    $scope.playTrailer = function () {
        var movie = $scope.movie;
        var data = {
            "movieid": movie._id,
            "movieTitle": movie.Title,
            "movieYear": movie.Year
        };

        $http.post(hostAddress + '/api/movie/getTrailer', data)
            .then(
            function (response) {
                // success callback
                var data = response.data;
                if (data.Status) {
                    eModal.iframe(data.URL, movie.Title + ' Trailer');
                } else {
                    $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
                }
            },
            function (error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

    $scope.ratingHint = 'poop!';
    $scope.userMovieRating = 0;

    // User Can Rate Movie
    $scope.setMovieRating = function (value) {
        $scope.userMovieRating = value;
    }

    // Show hint to user on hover
    $scope.hoverMovieRating = function (value) {
        $scope.setUserRatingHint = setUserRatingHint(value);
    }

    function setUserRatingHint(ratingValue) {
        switch (ratingValue) {
            case 0:
                $scope.ratingHint = 'poop!';
                break;
            case 1:
                $scope.ratingHint = 'yek!';
                break;
            case 2:
                $scope.ratingHint = 'huh!';
                break;
            case 3:
                $scope.ratingHint = 'nah!';
                break;
            case 4:
                $scope.ratingHint = 'something!';
                break;
            case 5:
                $scope.ratingHint = '1 time watch!';
                break;
            case 6:
                $scope.ratingHint = 'nice!';
                break;
            case 7:
                $scope.ratingHint = 'good!';
                break;
            case 8:
                $scope.ratingHint = 'great!';
                break;
            case 9:
                $scope.ratingHint = 'awesome!';
                break;
            case 10:
                $scope.ratingHint = 'incredible!';
                break;
            default:
                break;
        }
        console.log(ratingValue);
    }

    $scope.ratingMovieMouseLeave = function () {
        $scope.setUserRatingHint = setUserRatingHint($scope.userMovieRating);
    }
}]);