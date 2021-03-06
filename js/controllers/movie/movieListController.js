var app = angular.module(appName);

app.registerCtrl('movieListController', ['$scope', '$http', '$routeParams', '$location', function ($scope, $http, $routeParams, $location) {
    $scope.noDataFound = false;

    $scope.movies = [];
    $scope.isLoading = false;
    var page = 1;
    var canLoadMore = true;
    
    $scope.loadMovies = loadMovies();
    $scope.loadMore = function () {
        var cachedData = globalCacheStorage.get($location.path());
        if (cachedData && cachedData.page >= page) {
            page = cachedData.page + 1;
            $scope.movies = cachedData.movies;
            $rootScope.$broadcast('checkForScrollPosition', {});
            console.log("calling for cache" + page);
        } else if ($scope.isLoading == false && canLoadMore) {
            $scope.loadMovies = loadMovies();
        }
    }

    function loadMovies() {
        $scope.isLoading = true;

        var queryFilters = $routeParams.query.split('|');
        var queryFilterJson = {};
        queryFilters.forEach(function (query) {
            if (query.split(':')[1].indexOf("$$$") > 1) {
                var subFilter = query.split(':')[1];
                var subFilterKey = subFilter.split("$$$")[0];
                var subFilterValue = subFilter.split("$$$")[1];
                queryFilterJson[query.split(':')[0]] = {};
                queryFilterJson[query.split(':')[0]][subFilterKey] = subFilterValue;
            } else {
                queryFilterJson[query.split(':')[0]] = query.split(':')[1];
            }
        });
        queryFilterJson.Languages = "English";
        if ($routeParams.sort) {
            var sortFilter = $routeParams.sort;
            var sortFilterJson = {};
            sortFilterJson[sortFilter.split(':')[0]] = sortFilter.split(':')[1];
        } else {
            var sortFilterJson = { Released: -1 };
        }

        /* Get Movie */

        var limit = 12;
        var data = {
            query: queryFilterJson,
            select: {
                Title: 1,
                Released: 1,
                Year: 1,
                Poster: 1,
                ImdbRating: 1,
                Genres: 1,
                Runtime: 1
            },
            sort: sortFilterJson,
            skip: (page++ * limit - limit),
            limit: limit,
            userid: localStorage.getItem(prefUserId)
        };

        $http.post(hostAddress + '/api/movie/getQuery', data)
            .then(
            function (response) {
                // success callback
                $scope.isLoading = false;
                var data = response.data;
                console.log(data);
                if (data.Status) {
                    var movies = data.Movies;
                    movies.forEach(function (object) {
                        object.Released = moment(object.Released).format('MMMM Do YYYY');
                        $scope.movies.push(object);
                    });
                    globalCacheStorage.put($location.path(), { page: page - 1, movies: $scope.movies });
                    console.log(globalCacheStorage.get($location.path()));
                    if (movies.length == 0) {
                        canLoadMore = false;
                    }
                } else {
                    $scope.noDataFound = true;
                }
            }
            , function (error) {
                // failure callback
                $scope.isLoading = false;
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
        /* End Movie */
    }

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

    function addToList(index, listName, caption) {
        var movie = $scope.movies[index];
        var data = {
            "movieid": movie._id
            , "userid": localStorage.getItem(prefUserId)
            , "listName": listName
            , "caption": caption
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
            }
            , function (error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

    // Get Trailer
    $scope.playTrailer = function (index) {
        var movie = $scope.movies[index];
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

}]);