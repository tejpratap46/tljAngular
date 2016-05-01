var app = angular.module(appName);

app.registerCtrl('peopleListController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
    $scope.noDataFound = false;

    $scope.peoples = [];
    $scope.isLoading = false;
    var page = 1;

    $scope.loadMore = function () {
        if ($scope.isLoading == false) {
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
        var limit = 12;
        var data = {
            query: {},
            select: {
                _id: 0,
                __v: 0
            },
            sort: sortFilterJson,
            skip: (page++ * limit - limit),
            limit: limit,
            userid: localStorage.getItem(prefUserId),
            selectMovieFields: "_id Title",
        };

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http.post(hostAddress + '/api/people/getQuery', data, config)
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