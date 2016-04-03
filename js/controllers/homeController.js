var app = angular.module(appName);

app.registerCtrl('homeController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.noDataFound = false;
    $scope.isLoadingFeed = false;
    $scope.user = { username: localStorage.getItem(prefName) };

    $scope.sidebarList = {
        userList: [],
        movieList: [
            {
                title: "Home",
                href: "#home",
                glyphicon: "glyphicon glyphicon-home"
            }, {
                title: "Top",
                href: "#/movie/list/Releasing",
                glyphicon: "glyphicon glyphicon-list-alt"
            }, {
                title: "Featured",
                href: "#featured",
                glyphicon: "glyphicon glyphicon-list"
            }, {
                title: "Popular",
                href: "#/movie/list/Releasing",
                glyphicon: "glyphicon glyphicon-fire"
            }, {
                title: "Upcoming",
                href: "#/movie/list/Released:$gt$$$" + moment(new Date()).format('YYYY-MM-DD') + "/Released:1",
                glyphicon: "glyphicon glyphicon-plane"
            }, {
                title: "Released",
                href: "#/movie/list/Released:$lte$$$" + moment(new Date()).format('YYYY-MM-DD') + "/Released:-1",
                glyphicon: "glyphicon glyphicon-flag"
            }
        ]
    };

    var page = 1;
    $scope.feed = [];

    $scope.loadMore = function() {
        if (!$scope.isLoadingFeed) {
            console.log("calling load moew for : " + page);
            $scope.loadFeed = loadFeed();
        }
    }

    /**
     * Get User Feed, must be rich
     */
    function loadFeed() {
        $scope.isLoadingFeed = true;
        var limit = 10;
        var data = {
            userid: localStorage.getItem(prefUserId),
            select: {
                Comments: 0
            },
            selectMovieFields: "_id Title Released Year Poster ImdbRating Genres",
            selectUserFields: "_id Name",
            sort: {
                CreatedAt: -1
            },
            skip: page++ * limit - limit,
            limit: limit
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/user/userFeed', data, config)
            .then(
            function(response) {
                // success callback
                $scope.isLoadingFeed = false;
                var data = response.data;
                console.log(data);
                if (data.Status) {
                    var feed = data.Feed;
                    feed.forEach(function(object) {
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
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
        /* End User Feed */
    }

    /**
     * Add Comment on post
     */
    $scope.addComment = function(index) {
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
                _id: localStorage.getItem(prefUserId),
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

    /** Like/Un-Like post */
    $scope.likePost = function(index) {
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
    /* End Like/Un-Like Feed */

    $scope.addToWatchlist = function($index) {
        if ($scope.feed[$index].Movie.addedToWatchlist) {
            $scope.feed[$index].Movie.addedToWatchlist = false;
        } else {
            $scope.feed[$index].Movie.addedToWatchlist = true;
        }
        $scope.addToList = addToList($index, "Watchlist", "");
    };

    $scope.addToWatched = function($index) {
        if ($scope.feed[$index].Movie.addedToWatched) {
            $scope.feed[$index].Movie.addedToWatched = false;
        } else {
            $scope.feed[$index].Movie.addedToWatched = true;
        }
        $scope.addToList = addToList($index, "Watched", "");
    };

    $scope.addToLiked = function($index) {
        if ($scope.feed[$index].Movie.addedToLiked) {
            $scope.feed[$index].Movie.addedToLiked = false;
        } else {
            $scope.feed[$index].Movie.addedToLiked = true;
        }
        $scope.addToList = addToList($index, "Liked", "");
    };

    $scope.playTrailer = function($index) { };

    /**
     * Geral function to add movie to  a list
     * 
     * @param {number} index: index of post in feed.
     * @param {string} listName: name of list in which you want to add that movie.
     * @param {string} caption: extra text or comment for that post.
     */
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

    // Get Tokens from user update
    $scope.movieCommentChange = function() {
        var comment = $scope.movieComment;
        var tagslistarr = comment.match(/#\S+/g);
        console.log(tagslistarr);
    }

    // Get Trailer
    $scope.playTrailer = function(index) {
        var movie = $scope.feed[index].Movie;
        var data = {
            "movieid": movie._id,
            "movieTitle": movie.Title,
            "movieYear": movie.Year
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
                    eModal.iframe(data.URL, movie.Title + ' Trailer');
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

    var lists = ["Watched", "Watchlist", "Liked"];

    lists.forEach(function(listName) {
        $scope.getMovieInListCount = getMovieInListCount(listName);
    });

    function getMovieInListCount(listName) {
        var data = {
            "query": {
                "User": localStorage.getItem(prefUserId),
                "ListName": listName
            }
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/user/userListGetCountQuery', data, config)
            .then(
            function(response) {
                // success callback
                var responseData = response.data;
                if (listName == "Watched") {
                    $scope.sidebarList.userList.push({
                        glyphicon: "glyphicon glyphicon-ok",
                        name: "Watched",
                        count: responseData.Count
                    });
                    $scope.user.WatchedCount = responseData.Count;
                } else if (listName == "Watchlist") {
                    $scope.sidebarList.userList.push({
                        glyphicon: "glyphicon glyphicon-plus",
                        name: "Watchlist",
                        count: responseData.Count
                    });
                } else if (listName == "Liked") {
                    $scope.sidebarList.userList.push({
                        glyphicon: "glyphicon glyphicon-heart",
                        name: "Liked",
                        count: responseData.Count
                    });
                }
            },
            function(error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }
}]);