var app = angular.module(appName);

app.registerCtrl('homeController', ['$scope', '$http', function($scope, $http) {
    $scope.noDataFound = false;
    
    /* Get User Feed, must be rich */
    var data = {
        "userid": localStorage.getItem(prefUserId),
        "select": {
            "Comments": 0
        },
        "selectMovieFields" : "_id Title Released Poster ImdbRating Genres",
        "selectUserFields" : "_id Name",
        "sort": {
            "CreatedAt": -1
        },
        "skip": 0,
        "limit": 10
    };

    var config = {
        headers : {
            'Content-Type': 'application/json'
        }
    }

    $http.post(hostAddress + '/api/user/userFeed', data, config)
    .then(
        function(response){
            // success callback
            try {
                var data = response.data;
                if (data.Status){
                    $scope.feed = [];
                    var feed = data.Feed;
                    feed.forEach(function(object){
                        object.UpdatedAtFromNow = moment(object.UpdatedAt).fromNow();
                        object.UpdatedAt = moment(object.UpdatedAt).format('MMMM Do YYYY, h:mm a');
                        object.Movie.Genres = object.Movie.Genres.join(", ");
                        object.Movie.Released = moment(object.Movie.Released).format('MMMM Do YYYY');
                        object.Movie.addedToWatchlist = false;
                        object.Movie.addedToWatched = false;
                        object.Movie.addedToLiked = false;
                        if (object.LikedBy.indexOf(localStorage.getItem(prefUserId)) >= 0){
                            object.IsLiked = true;
                            console.log("Liked");
                        }else{
                            object.IsLiked = false;
                            console.log("Not-liked");
                        }
                        $scope.feed.push(object);
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
    /* End User Feed */
    
    /* Add Comment on post */
    $scope.addComment = function(index){
        console.log('add comment called');
        var post = $scope.feed[index];
        var data = {
            "postid": post._id,
            "userid": localStorage.getItem(prefUserId),
            "text": post.AddComment
        };

        var config = {
            headers : {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listAddCommentPost', data, config)
        .then(
            function(response){
                // success callback
                try {
                    var data = response.data;
                    if (data.Status){
                        if ($scope.feed[index].Comments){
                            // All Ok Do Nothing
                        }else{
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
    }
    /* End Add Comment */
    
    /* Like/Un-Like post */
    $scope.likePost = function(index){
        console.log('like post called');
        var post = $scope.feed[index];
        var data = {
            "postid": post._id,
            "userid": localStorage.getItem(prefUserId),
        };

        var config = {
            headers : {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/list/listLikePost', data, config)
        .then(
            function(response){
                // success callback
                try {
                    var data = response.data;
                    if (data.Status){
                        if (data.LikedPost){
                            $scope.feed[index].IsLiked = true;
                            $scope.feed[index].LikesCount = $scope.feed[index].LikesCount + 1;
                        }else{
                            $scope.feed[index].IsLiked = false;
                            $scope.feed[index].LikesCount = $scope.feed[index].LikesCount - 1;
                        }
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
    }
    /* Like/Un-Like Feed */
    
    $scope.addToWatchlist = function($index){
        if ($scope.feed[$index].Movie.addedToWatchlist){
            $scope.feed[$index].Movie.addedToWatchlist = false;
        }else{
            $scope.feed[$index].Movie.addedToWatchlist = true;
        }
        $scope.$apply();
    };
    
    $scope.addToWatched = function($index){
        if ($scope.feed[$index].Movie.addedToWatched){
            $scope.feed[$index].Movie.addedToWatched = false;
        }else{
            $scope.feed[$index].Movie.addedToWatched = true;
        }
        $scope.$apply();
    };
    
    $scope.addToLiked = function($index){
        if ($scope.feed[$index].Movie.addedToLiked){
            $scope.feed[$index].Movie.addedToLiked = false;
        }else{
            $scope.feed[$index].Movie.addedToLiked = true;
        }
        $scope.$apply();
    };
    
    $scope.playTrailer = function($index){
    };
    
}]);