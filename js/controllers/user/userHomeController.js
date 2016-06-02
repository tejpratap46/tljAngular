var app = angular.module(appName);

app.registerCtrl('userHomeController', ['$scope', '$http', '$routeParams', '$window', '$location', function ($scope, $http, $routeParams, $window, $location) {
    $scope.noDataFound = false;

    // Make big poster image half of screen size
    $scope.backdropHeight = $window.innerHeight / 1.3;

    $scope.isLoadingFeed = false;
    $scope.userId = localStorage.getItem(prefUserId);
    $scope.userIdBeingWatched = $routeParams.userId;
    var page = 1;
    var listName = undefined;
    $scope.feed = [];
    var canLoadMore = true;

    if ($routeParams.listName) {
        listName = $routeParams.listName;
    }

    $scope.getUserList = function (listNameProp) {
        page = 1;
        $scope.feed = [];
        $scope.loadFeed = loadFeed(listNameProp);
    }
    
    $scope.loadFeed = loadFeed(listName);
    $scope.loadMore = function () {
        var cachedData = globalCacheStorage.get($location.path());
        if (cachedData && cachedData.page >= page) {
            page = cachedData.page + 1;
            $scope.feed = cachedData.feed;
            $rootScope.$broadcast('checkForScrollPosition', {});
            $scope.loadFeed = loadFeed(listName);
            console.log("calling for cache" + page);
        } else if (!$scope.isLoadingFeed && canLoadMore) {
            console.log("calling load more for : " + page);
            $scope.loadFeed = loadFeed(listName);
        }
    }

    /**
     * Get User Feed
     */
    function loadFeed(listName) {
        $scope.isLoading = true;

        /* Get Movie */

        var limit = 12;
        var data = {
            userid: localStorage.getItem(prefUserId),
            query: {
                User: $scope.userIdBeingWatched,
                ListName: listName
            },
            select: {
                Comments: 0
            },
            sort: {
                CreatedAt: -1
            },
            selectMovieFields: "_id Title Released Year Poster ImdbRating Genres",
            selectUserFields: "_id Name",
            skip: (page++ * limit - limit),
            limit: limit
        };

        $http.post(hostAddress + '/api/list/getQuery', data)
            .then(
            function (response) {
                // success callback
                $scope.isLoadingFeed = false;
                var data = response.data;
                console.log(data);
                if (data.Status) {
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
                    globalCacheStorage.put($location.path(), { page: page - 1, feed: $scope.feed });
                    console.log(globalCacheStorage.get($location.path()));
                    // This means all data has been fetched, No need to ask for more
                    if (feed.length == 0) {
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

    /**
     * Add Comment on post
     */
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
                _id: localStorage.getItem(prefUserId),
                Name: localStorage.getItem(prefName)
            },
            Text: $scope.feed[index].AddComment
        });
        $scope.feed[index].CommentsCount = $scope.feed[index].CommentsCount + 1;
        $scope.feed[index].AddComment = "";

        $http.post(hostAddress + '/api/list/listAddCommentPost', data)
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

    /** Like/Un-Like post */
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
        $http.post(hostAddress + '/api/list/listLikePost', data)
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
    /* End Like/Un-Like Feed */

    $scope.addToWatchlist = function ($index) {
        if ($scope.feed[$index].Movie.addedToWatchlist) {
            $scope.feed[$index].Movie.addedToWatchlist = false;
        } else {
            $scope.feed[$index].Movie.addedToWatchlist = true;
        }
        $scope.addToList = addToList($index, "Watchlist", "");
    };

    $scope.addToWatched = function ($index) {
        if ($scope.feed[$index].Movie.addedToWatched) {
            $scope.feed[$index].Movie.addedToWatched = false;
        } else {
            $scope.feed[$index].Movie.addedToWatched = true;
        }
        $scope.addToList = addToList($index, "Watched", "");
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

        $http.post(hostAddress + '/api/list/listAddMovie', data)
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

    // Get Tokens from user update
    $scope.movieCommentChange = function () {
        var comment = $scope.movieComment;
        var tagslistarr = comment.match(/#\S+/g);
        console.log(tagslistarr);
    }

    // Get Trailer
    $scope.playTrailer = function (index) {
        var movie = $scope.feed[index].Movie;
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

    var lists = ["Watched", "Watchlist", "Liked"];
    $scope.sidebarList = {
        userList: []
    };

    lists.forEach(function (listName) {
        $scope.getMovieInListCount = getMovieInListCount(listName);
    });

    /**
     * Get count of movies in list
     * @param {string} listName : name of list whose size you want
     */
    function getMovieInListCount(listName) {
        var data = {
            "query": {
                "User": $scope.userIdBeingWatched,
                "ListName": listName
            }
        };

        $http.post(hostAddress + '/api/user/userListGetCountQuery', data)
            .then(
            function (response) {
                // success callback
                var responseData = response.data;
                if (listName == "Watched") {
                    $scope.sidebarList.userList.push({
                        glyphicon: "glyphicon glyphicon-ok",
                        name: "Watched",
                        href: "#/user/" + $scope.userIdBeingWatched + "/Watched",
                        count: responseData.Count
                    });
                } else if (listName == "Watchlist") {
                    $scope.sidebarList.userList.push({
                        glyphicon: "glyphicon glyphicon-plus",
                        name: "Watchlist",
                        href: "#/user/" + $scope.userIdBeingWatched + "/Watchlist",
                        count: responseData.Count
                    });
                } else if (listName == "Liked") {
                    $scope.sidebarList.userList.push({
                        glyphicon: "glyphicon glyphicon-heart",
                        name: "Liked",
                        href: "#/user/" + $scope.userIdBeingWatched + "/Liked",
                        count: responseData.Count
                    });
                }
            },
            function (error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

    // Get user data
    $scope.getuserInfo = getuserInfo($scope.userIdBeingWatched);

    /**
     * Get all the required info for user
     * @param {string} forUserId : userid of user whose data you want
     */
    function getuserInfo(forUserId) {
        var data = {
            "userid": localStorage.getItem(prefUserId),
            "forUserId": forUserId,
            "selectUserFields": "_id",
            "selectPeopleFields": "_id"
        };

        $http.post(hostAddress + '/api/user/getInfo', data)
            .then(
            function (response) {
                // success callback
                var responseData = response.data;
                console.log(responseData);
                if (responseData.Status) {
                    $scope.userData = responseData;
                }
            },
            function (error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }

    $scope.followUnfollowUser = function () {
        console.log("Follow clicked");
        var data = {
            "userid": localStorage.getItem(prefUserId),
            "followUserid": $scope.userIdBeingWatched
        };

        $http.post(hostAddress + '/api/user/userFollow', data)
            .then(
            function (response) {
                // success callback
                var responseData = response.data;
                console.log(responseData);
                if (responseData.Status) {
                    $scope.userData.IsFollowing = responseData.IsFollowing;
                    if (responseData.IsFollowing == true) {
                        $scope.userData.FollowerCount += 1;
                    } else {
                        $scope.userData.FollowerCount -= 1;
                    }
                }
            },
            function (error) {
                // failure callback
                $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
            }
            );
    }
}]);