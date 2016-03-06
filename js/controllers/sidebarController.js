var app = angular.module(appName);

app.controller('sidebarController', ['$scope', '$sce', '$http', function($scope, $sce, $http) {

    $scope.mainOptions = [{
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
        glyphicon: "glyphicon glyphicon-paperclip"
    }, {
        title: "Popular",
        href: "#/movie/list/Releasing",
        glyphicon: "glyphicon glyphicon-paperclip"
    }, {
        title: "Releasing",
        href: "#/movie/list/Released:$lte$$$" + moment(new Date()).format('YYYY-MM-DD'),
        glyphicon: "glyphicon glyphicon-thumbs-up"
    }]

    $scope.$on('userLoggedIn', function(event, data) {
        console.log('sidebarController userLoggedIn');
        $scope.checkIfLoggedIn = checkIfLoggedIn();
    });

    $scope.checkIfLoggedIn = checkIfLoggedIn();
    $scope.getGenre = getGenre();

    function checkIfLoggedIn() {
        if (localStorage.getItem(prefUsername)) {
            $('#sidebar').show(0);
        } else {
            $('#sidebar').hide(0);
        }
    }

    function getGenre() {
        var data = {
            "query": "Genres"
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/movie/movieGetDistinctQuery', data, config)
            .then(
                function(response) {
                    // success callback
                    var data = response.data;
                    $scope.genres = [];
                    if (data.Status) {
                        var genres = data.Genres;
                        genres.forEach(function(name) {
                            $scope.genres.push({
                                title: name,
                                href: "#/movie/list/Genres:" + name,
                                glyphicon: "glyphicon glyphicon-star"
                            });
                        });
                    }
                },
                function(error) {
                    // failure callback
                    console.log("Error : " + error.message);
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
            );
    }
}]);