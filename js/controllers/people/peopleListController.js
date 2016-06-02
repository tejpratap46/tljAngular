var app = angular.module(appName);

app.registerCtrl('peopleListController', ['$scope', '$http', '$routeParams', '$location', function ($scope, $http, $routeParams, $location) {
    $scope.noDataFound = false;

    $scope.peoples = [];
    $scope.isLoading = false;
    var page = 1;

    $scope.loadPeople = loadPeople();
    $scope.loadMore = function () {
        var cachedData = globalCacheStorage.get($location.path());
        if (cachedData && cachedData.page >= page) {
            page = cachedData.page + 1;
            $scope.peoples = cachedData.peoples;
            $rootScope.$broadcast('checkForScrollPosition', {});
            $scope.loadPeople = loadPeople();
            console.log("calling for cache" + page);
        } else if ($scope.isLoading == false) {
            $scope.loadPeople = loadPeople();
        }
    }

    function loadPeople() {
        $scope.isLoading = true;

        if ($routeParams.sort) {
            var sortFilter = $routeParams.sort;
            var sortFilterJson = {};
            sortFilterJson[sortFilter.split(':')[0]] = sortFilter.split(':')[1];
        } else {
            var sortFilterJson = { WorkAsActorCount: -1 };
        }
        /* Get People */
        var limit = 20;
        var data = {
            query: {},
            select: {
                __v: 0
            },
            sort: sortFilterJson,
            skip: (page++ * limit - limit),
            limit: limit,
            userid: localStorage.getItem(prefUserId),
            selectMovieFields: "_id Title",
        };

        $http.post(hostAddress + '/api/people/getQuery', data)
            .then(
            function (response) {
                // success callback
                $scope.isLoading = false;
                var data = response.data;
                console.log(data);
                if (data.Status) {
                    data.People.forEach(function (people) {
                        $scope.peoples.push(people);
                    });
                    $scope.peoples.push(data.People);
                    globalCacheStorage.put($location.path(), { page: page - 1, peoples: $scope.peoples });
                    console.log(globalCacheStorage.get($location.path()));
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
        /* End People */
    }

    $scope.followUnfollowPeople = function ($peopleIndex) {

        $scope.isLoading = true;

        var limit = 20;
        var data = {
            followPeopleid: $scope.peoples[$peopleIndex]._id,
            userid: localStorage.getItem(prefUserId)
        };

        $http.post(hostAddress + '/api/people/peopleFollow', data)
            .then(
            function (response) {
                // success callback
                $scope.isLoading = false;
                var data = response.data;
                console.log(data);
                if (data.Status) {
                    $scope.peoples[$peopleIndex].isFollowing = data.IsFollowing;
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
        /* End People */
    }
}]);