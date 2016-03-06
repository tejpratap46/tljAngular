var app = angular.module(appName);

app.registerCtrl('homeController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.noDataFound = false;

    angular.element($window).bind("scroll", function () {
        var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        var body = document.body, html = document.documentElement;
        var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight - 100) {
            $scope.loadFeed = loadFeed();
        }
    });

    $scope.loadFeed = loadFeed();

    function loadFeed(params) {
        /* Get User Feed, must be rich */
        var data = {
            "userid": localStorage.getItem(prefUserId),
            "select": {
                "Comments": 0
            },
            "selectMovieFields": "_id Title Released Poster ImdbRating Genres",
            "selectUserFields": "_id Name",
            "sort": {
                "CreatedAt": -1
            },
            "skip": 0,
            "limit": 10
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/user/userFeed', data, config)
            .then(
                function (response) {
                    // success callback
                    var data = response.data;
                    if (data.Status) {
                        $scope.feed = [];
                        var feed = data.Feed;
                        feed.forEach(function (object) {
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
                            $scope.feed.push(object);
                        });
                    } else {
                        $scope.noDataFound = true;
                    }
                },
                function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
        /* End User Feed */
    }

    /* Add Comment on post */
    $scope.addComment = function (index) {
        var post = $scope.feed[index];
        if (post.AddComment.length == 0) {
            return;
        }
        var data = {
            "postid": post._id,
            "userid": localStorage.getItem(prefUserId),
            "text": post.AddComment
        };
        if ($scope.feed[index].Comments) {
            // All Ok Do Nothing
        } else {
            $scope.feed[index].Comments = [];
        }
        $scope.feed[index].Comments.push({
            User: {
                Name: localStorage.getItem(prefName)
            },
            Text: $scope.feed[index].AddComment
        });
        $scope.feed[index].CommentsCount = $scope.feed[index].CommentsCount + 1;
        $scope.feed[index].AddComment = "";

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listAddCommentPost', data, config)
            .then(
                function (response) {
                    // success callback
                    var data = response.data;
                    console.log(data);
                    if (data.Status) {
                        // hey, comment has been added.
                    } else {
                        $scope.noDataFound = true;
                    }
                },
                function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
    }
    /* End Add Comment */

    /* Like/Un-Like post */
    $scope.likePost = function (index) {
        var post = $scope.feed[index];
        // reflect like changes here
        if (post.IsLiked) {
            $scope.feed[index].IsLiked = false;
            $scope.feed[index].LikesCount = $scope.feed[index].LikesCount - 1;
        } else {
            $scope.feed[index].IsLiked = true;
            $scope.feed[index].LikesCount = $scope.feed[index].LikesCount + 1;
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
                function (response) {
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
                function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
    }
    /* Like/Un-Like Feed */

    $scope.addToWatchlist = function ($index) {
        if ($scope.feed[$index].Movie.addedToWatchlist) {
            $scope.feed[$index].Movie.addedToWatchlist = false;
        } else {
            $scope.feed[$index].Movie.addedToWatchlist = true;
        }
        $scope.addToList = addToList($index, "Liked", "");
    };

    $scope.addToWatched = function ($index) {
        if ($scope.feed[$index].Movie.addedToWatched) {
            $scope.feed[$index].Movie.addedToWatched = false;
        } else {
            $scope.feed[$index].Movie.addedToWatched = true;
        }
        $scope.addToList = addToList($index, "Liked", "");
    };

    $scope.addToLiked = function ($index) {
        if ($scope.feed[$index].Movie.addedToLiked) {
            $scope.feed[$index].Movie.addedToLiked = false;
        } else {
            $scope.feed[$index].Movie.addedToLiked = true;
        }
        $scope.addToList = addToList($index, "Liked", "");
    };

    $scope.playTrailer = function ($index) { };

    function addToList(index, listName, caption) {
        var post = $scope.feed[index];
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
                function (response) {
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
                function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );
    }

}]);