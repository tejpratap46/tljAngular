var app = angular.module(appName);

app.registerCtrl('postViewController', ['$scope', '$http', '$window', '$routeParams', function($scope, $http, $window, $routeParams) {
    $scope.noDataFound = false;

    angular.element($window).bind("scroll", function() {
        var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        var body = document.body, html = document.documentElement;
        var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        var windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight - 100) {
            $scope.loadPost = loadPost();
        }
    });

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
            selectMovieFields: "_id Title Released Poster ImdbRating Genres",
            selectUserFields: "_id Name",
            skip: 0,
            limit: 10
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/getQuery', data, config)
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

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listAddCommentPost', data, config)
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

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listLikePost', data, config)
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

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listAddMovie', data, config)
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
            "movieid": post.Movie._id
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/movie/getTrailer', data, config)
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