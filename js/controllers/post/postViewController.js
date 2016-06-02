var app = angular.module(appName);

app.registerCtrl('postViewController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $scope.noDataFound = false;

    $scope.loadPost = loadPost();

    function loadPost(params) {
        /* Get User Feed, must be rich */
        var data = {
            userid: localStorage.getItem(prefUserId),
            query: {
                _id: $routeParams.postId
            },
            select: {
                __v: 0
            },
            sort: {
                UpdatedAt: -1
            },
            selectMovieFields: "_id Title Released Year Poster ImdbRating Genres",
            selectUserFields: "_id Name",
            skip: 0,
            limit: 10
        };

        $http.post(hostAddress + '/api/list/getQuery', data)
            .then(
            function(response) {
                // success callback
                var data = response.data;
                if (data.Status) {
                    $scope.post = {};
                    var feed = data.Feed;
                    console.log(feed);
                    feed.forEach(function(object) {
                        // we are accepting single result
                        object.UpdatedAtFromNow = moment(object.UpdatedAt).fromNow();
                        object.UpdatedAt = moment(object.UpdatedAt).format('MMMM Do YYYY, h:mm a');
                        object.Movie.Genres = object.Movie.Genres.join(", ");
                        object.Movie.Released = moment(object.Movie.Released).format('MMMM Do YYYY');
                        if (object.LikedBy.indexOf(localStorage.getItem(prefUserId)) >= 0) {
                            object.IsLiked = true;
                            console.log("Liked");
                        } else {
                            object.IsLiked = false;
                            console.log("Not-liked");
                        }
                        $scope.post = object;
                    });
                } else {
                    $scope.noDataFound = true;
                }
            },
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
        /* End User Feed */
    }

    /* Add Comment on post */
    $scope.addComment = function() {
        var post = $scope.post;
        if (post.AddComment.length == 0) {
            return;
        }
        var data = {
            "postid": post._id,
            "userid": localStorage.getItem(prefUserId),
            "text": post.AddComment
        };
        if ($scope.post.Comments) {
            // All Ok Do Nothing
        } else {
            $scope.post.Comments = [];
        }
        $scope.post.Comments.push({
            User: {
                _id: localStorage.getItem(prefUserId),
                Name: localStorage.getItem(prefName)
            },
            Text: $scope.post.AddComment
        });
        $scope.post.CommentsCount = $scope.post.CommentsCount + 1;
        $scope.post.AddComment = "";

        $http.post(hostAddress + '/api/list/listAddCommentPost', data)
            .then(
            function(response) {
                // success callback
                var data = response.data;
                console.log(data);
                if (data.Status) {
                    // hey, comment has been added.
                } else {
                    $scope.noDataFound = true;
                }
            },
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }
    /* End Add Comment */

    /* Like/Un-Like post */
    $scope.likePost = function() {
        var post = $scope.post;
        // reflect like changes here
        if (post.IsLiked) {
            $scope.post.IsLiked = false;
            $scope.post.LikesCount = $scope.post.LikesCount - 1;
        } else {
            $scope.post.IsLiked = true;
            $scope.post.LikesCount = $scope.post.LikesCount + 1;
        }
        var data = {
            "postid": post._id,
            "userid": localStorage.getItem(prefUserId),
        };

        $http.post(hostAddress + '/api/list/listLikePost', data)
            .then(
            function(response) {
                // success callback
                var data = response.data;
                if (data.Status) {
                    if (data.LikedPost) {
                        // liked post
                    } else {
                        // unliked post
                    }
                    return;
                } else {
                    $scope.noDataFound = true;
                }
            },
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }
    /* Like/Un-Like Feed */

    $scope.addToWatchlist = function() {
        if ($scope.post.Movie.addedToWatchlist) {
            $scope.post.Movie.addedToWatchlist = false;
        } else {
            $scope.post.Movie.addedToWatchlist = true;
        }
        $scope.addToList = addToList("Watchlist", "");
    };

    $scope.addToWatched = function() {
        if ($scope.post.Movie.addedToWatched) {
            $scope.post.Movie.addedToWatched = false;
        } else {
            $scope.post.Movie.addedToWatched = true;
        }
        $scope.addToList = addToList("Watched", "");
    };

    $scope.addToLiked = function() {
        if ($scope.post.Movie.addedToLiked) {
            $scope.post.Movie.addedToLiked = false;
        } else {
            $scope.post.Movie.addedToLiked = true;
        }
        $scope.addToList = addToList("Liked", "");
    };

    $scope.playTrailer = function($index) { };

    function addToList(listName, caption) {
        var post = $scope.post;
        var data = {
            "movieid": post.Movie._id,
            "userid": localStorage.getItem(prefUserId),
            "listName": listName,
            "caption": caption
        };

        $http.post(hostAddress + '/api/list/listAddMovie', data)
            .then(
            function(response) {
                // success callback
                var data = response.data;
                if (data.Status) {
                    if (data.MovieAdded) {
                        $scope.feed[index].IsLiked = true;
                        $scope.feed[index].LikesCount = $scope.feed[index].LikesCount + 1;
                    } else {
                        $scope.feed[index].IsLiked = false;
                        $scope.feed[index].LikesCount = $scope.feed[index].LikesCount - 1;
                    }
                } else {
                    $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
                }
            },
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

    // Get Trailer
    $scope.playTrailer = function() {
        var post = $scope.post;
        var data = {
            "movieid": post.Movie._id,
            "movieTitle": post.Movie.Title,
            "movieYear": post.Movie.Year
        };

        $http.post(hostAddress + '/api/movie/getTrailer', data)
            .then(
            function(response) {
                // success callback
                var data = response.data;
                if (data.Status) {
                    eModal.iframe(data.URL, post.Movie.Title + ' Trailer');
                } else {
                    $('.notification').text(data.Error).show('fast').delay(3000).hide('fast');
                }
            },
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

}]);