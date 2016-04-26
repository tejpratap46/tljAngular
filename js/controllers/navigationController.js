var app = angular.module(appName);

app.controller('navigationController', ['$scope', '$http', '$route', function ($scope, $http, $route) {

    $scope.$on('userLoggedIn', function (event, data) {
        console.log('navigationController userLoggedIn');
        $scope.checkIfLoggedIn = checkIfLoggedIn();
    });

    $scope.checkIfLoggedIn = checkIfLoggedIn();

    $scope.xsSearchBoxVisible = false;

    $scope.showXsSearchBox = function () {
        $scope.xsSearchBoxVisible = !$scope.xsSearchBoxVisible;
    }

    function checkIfLoggedIn() {
        if (localStorage.getItem(prefUsername)) {
            $scope.loggedIn = true;
            $scope.userid = localStorage.getItem(prefUserId);
            $scope.username = localStorage.getItem(prefName);
            $('#navbar').show(0);
        } else {
            $scope.loggedIn = false;
            $scope.userid = undefined;
            $('#navbar').hide(0);
        }
    }

    // Listen to route changes, and show and hide patient search bar accordingly
    $scope.$on('$routeChangeStart', function (scope, next, current) {
        console.log(JSON.stringify(next));
        if (next.$$route.controller == "movieViewController") {
            $scope.isTranslucentNavbar = true;
        } else {
            $scope.isTranslucentNavbar = false;
        }
        console.log($scope.isTranslucentNavbar);
    });

    $scope.searchBoxPlaceholder = "Search Movie";

    $scope.searchBoxBlur = function () {
        $scope.searchBoxPlaceholder = "Search Movie";
        setTimeout(function () {
            $('.search-results').hide('fast');
        }, 100);
    }

    $scope.searchBoxClick = function () {
        $scope.searchBoxPlaceholder = "Search By Movie Name, Actor Name, Director Name";
        $('.search-results').show('fast');
    }

    var timeoutHandler;
    $scope.searchMovie = function () {
        if (timeoutHandler) {
            clearTimeout(timeoutHandler);
        }
        timeoutHandler = setTimeout(function () {
            console.log("Quering server");
            $scope.autocompleteSearch = autocompleteSearch();
        }, 500);
    }

    function autocompleteSearch() {
        if ($scope.searchData.length > 0) {
            $('.search-results').show('fast');

            var data = {
                query: {
                    Title: $scope.searchData
                },
                select: {
                    Title: 1,
                    Year: 1,
                    Genres: 1,
                    ImdbRating: 1,
                    ImdbID: 1,
                    ListedIn: 1
                },
                sort: {
                    Released: -1
                },
                skip: 0,
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
                    if (data.Status) {
                        $scope.searchResults = data.Movies;
                    } else {
                        showToast(data.Error);
                    }
                },
                function (error) {
                    // failure callback
                    $('.notification').text('Oops! something went wrong').show('fast').delay(3000).hide('fast');
                }
                );

        } else {
            $('.search-results').hide('fast');
        }
    }

    var selectedIndex = -1;
    $scope.searchKeydown = function ($event) {
        console.log($event.keyCode);
        if ($event.keyCode == 38) {
            var iterator = 0;
            $event.preventDefault();
            if (selectedIndex == -1) {
                selectedIndex = $scope.searchResults.length - 1;
            } else {
                selectedIndex--;
            }
            $scope.searchResults.forEach(function (result) {
                if (iterator == selectedIndex) {
                    result.isSelected = true;
                } else {
                    result.isSelected = false;
                }
                iterator++;
            });
        } else if ($event.keyCode == 40) {
            var iterator = 0;
            $event.preventDefault();
            if (selectedIndex == $scope.searchResults.length - 1) {
                selectedIndex = -1;
            } else {
                selectedIndex++;
            }
            $scope.searchResults.forEach(function (result) {
                if (iterator == selectedIndex) {
                    result.isSelected = true;
                } else {
                    result.isSelected = false;
                }
                iterator++;
            });
        } else if ($event.keyCode == 13) {
            $event.preventDefault();
            if (selectedIndex >= 0) {
                window.location.hash = '/movie/view/' + $scope.searchResults[selectedIndex]._id;
                $('.search-results').hide('fast');
            }
        }
    }
}]);