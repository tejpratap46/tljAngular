var app = angular.module(appName);

app.registerCtrl('movieListController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
    $scope.noDataFound = false;

    $scope.movies = [];
    var page = 1;

    $scope.loadMovies = function () {
        var filters = $routeParams.filter.split('|');
        var filterJson = {};
        filters.forEach(function (filter) {
            if (filter.split(':')[1].indexOf("$$$") > 1) {
                var subFilter = filter.split(':')[1];
                var subFilterKey = subFilter.split("$$$")[0];
                var subFilterValue = subFilter.split("$$$")[1];
                filterJson[filter.split(':')[0]] = {};
                filterJson[filter.split(':')[0]][subFilterKey] = subFilterValue;
            } else {
                filterJson[filter.split(':')[0]] = filter.split(':')[1];
            }
        });
        filterJson.Languages = "English";
        console.log(filterJson);
        
        /* Get Movie */

        var data = {
            query: filterJson,
            select: {
                Title: 1,
                Released: 1,
                Poster: 1,
                ImdbRating: 1,
                Genres: 1,
                Runtime: 1
            },
            sort: {
                Released: -1
            },
            skip: (page++ * 10 - 10),
            limit: 10,
            userid: localStorage.getItem(prefUserId)
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/movie/getQuery', data, config)
            .then(
                function (response) {
                    // success callback
                    var data = response.data;
                    console.log(data);
                    if (data.Status) {
                        var movies = data.Movies;
                        movies.forEach(function (object) {
                            object.Genres = object.Genres.join(", ");
                            object.Released = moment(object.Released).format('MMMM Do YYYY');
                            $scope.movies.push(object);
                        });
                    } else {
                        $scope.noDataFound = true;
                    }
                }
                , function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
        /* End Movie */
    }

    $scope.loadMovies();

    $scope.addToWatchlist = function ($index) {
        if ($scope.movies[$index].addedToWatchlist) {
            $scope.movies[$index].addedToWatchlist = false;
        } else {
            $scope.movies[$index].addedToWatchlist = true;
        }
        $scope.addToList = addToList($index, "Watchlist", "");
    };

    $scope.addToWatched = function ($index) {
        if ($scope.movies[$index].addedToWatched) {
            $scope.movies[$index].addedToWatched = false;
        } else {
            $scope.movies[$index].addedToWatched = true;
        }
        $scope.addToList = addToList($index, "Watched", "");
    };

    $scope.addToLiked = function ($index) {
        if ($scope.movies[$index].addedToLiked) {
            $scope.movies[$index].addedToLiked = false;
        } else {
            $scope.movies[$index].addedToLiked = true;
        }
        $scope.addToList = addToList($index, "Liked", "");
    };

    $scope.playTrailer = function ($index) { };

    function addToList(index, listName, caption) {
        var movie = $scope.movies[index];
        var data = {
            "movieid": movie._id
            , "userid": localStorage.getItem(prefUserId)
            , "listName": listName
            , "caption": caption
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listAddMovie', data, config)
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
                }
                , function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
    }

}]);