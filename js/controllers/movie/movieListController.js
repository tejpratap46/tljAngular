var app = angular.module(appName);

app.registerCtrl('movieListController', ['$scope', '$http', function($scope, $http) {
    $scope.noDataFound = false;
    
    /* Get Movie */
    var data = {
        "query": {
            "Languages": "English",
            "Released": {
                "$gt": moment().format("YYYY-MM-DD")
            }
        },
        "select":{
            "Title": 1,
            "Released": 1,
            "Poster": 1,
            "ImdbRating": 1,
            "Genres": 1,
            "Runtime":1
        },
        "sort": {
            "Released": 1
        },
        "skip": 0,
        "limit": 10
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
                $scope.movies = [];
                if (data.Status){
                    var movies = data.Movies;
                    movies.forEach(function(object){
                        object.Genres = object.Genres.join(", ");
                        object.Released = moment(object.Released).format('MMMM Do YYYY');
                        $scope.movies.push(object);
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
    /* End Movie */
    
}]);