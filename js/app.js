var app = angular.module(appName, [
    'ngRoute',
    'angular-loading-bar',
    'infinite-scroll',
    'ngColorThis'
]);

app.config(['$routeProvider', '$controllerProvider', 'cfpLoadingBarProvider', '$locationProvider', function ($routeProvider, $controllerProvider, cfpLoadingBarProvider, $locationProvider) {
    // Angular loading bar config
    cfpLoadingBarProvider.includeSpinner = false;

    // defined in script.js
    checkIfLoggedIn();
    // code to lazy load controllers, used from : http://stackoverflow.com/questions/25168593/angularjs-lazy-loading-controllers-and-content/28199498#28199498
    app.registerCtrl = $controllerProvider.register;

    function loadScript(path) {
        var result = $.Deferred(),
            script = document.createElement("script");
        script.async = "async";
        script.type = "text/javascript";
        script.src = path;
        script.onload = script.onreadystatechange = function (_, isAbort) {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                if (isAbort)
                    result.reject();
                else
                    result.resolve();
            }
        };
        script.onerror = function () { result.reject(); };
        document.querySelector("head").appendChild(script);
        return result.promise();
    }

    function loader(arrayPath) {
        return {
            load: function ($q) {
                var deferred = $q.defer(),
                    map = arrayPath.map(function (path) {
                        return loadScript(path);
                    });

                $q.all(map).then(function (r) {
                    deferred.resolve();
                });
                return deferred.promise;
            }
        };
    }

    $routeProvider
        .when('/', {
            templateUrl: 'html/mainRouter.html',
            controller: 'mainRouter',
            resolve: loader(['js/mainRouter.js'])
        })
        .when('/home', {
            templateUrl: 'html/views/home.html',
            controller: 'homeController',
            resolve: loader(['js/controllers/homeController.js'])
        })
        .when('/login', {
            templateUrl: 'html/views/login.html',
            controller: 'loginController',
            resolve: loader(['js/controllers/loginController.js'])
        })
        .when('/register', {
            templateUrl: 'html/views/register.html',
            controller: 'registerController',
            resolve: loader(['js/controllers/registerController.js'])
        })
        .when('/movie/view/:id', {
            templateUrl: 'html/views/movie/view.html',
            controller: 'movieViewController',
            resolve: loader(['js/controllers/movie/movieViewController.js'])
        })
        .when('/movie/list/:query/:sort?', {
            templateUrl: 'html/views/movie/list.html',
            controller: 'movieListController',
            resolve: loader(['js/controllers/movie/movieListController.js'])
        })
        .when('/user/:userId/post/:postId', {
            templateUrl: 'html/views/post/view.html',
            controller: 'postViewController',
            resolve: loader(['js/controllers/post/postViewController.js'])
        })
        .when('/people/list/:query?/:sort?', {
            templateUrl: 'html/views/people/list.html',
            controller: 'peopleListController',
            resolve: loader(['js/controllers/people/peopleListController.js'])
        })
        .otherwise({
            redirectTo: '/'
        });
        
        // Router without '#', update base url in index.html
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
}]);

app.directive('tljFocusMe', function ($timeout) {
    return {
        scope: { trigger: '=tljFocusMe' },
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === true) {
                    //console.log('trigger',value);
                    //$timeout(function() {
                    element[0].focus();
                    scope.trigger = false;
                    //});
                }
            });
        }
    };
});

app.directive('ngError', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        compile: function ($element, attr) {
            var fn = $parse(attr['ngError']);
            return function (scope, element, attr) {
                element.on('error', function (event) {
                    scope.$apply(function () {
                        fn(scope, { $event: event });
                    });
                });
            };
        }
    };
}]);

app.filter('randomColor', function () {
    return function (string) {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };
});

// URL: http://jsfiddle.net/manishpatil/2fahpk7s/
app.directive('starRating', function () {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template:
        "<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"http://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"http://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;

            $scope.isolatedClick = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope.rating = $scope._rating = param;
                $scope.hoverValue = 0;
                $scope.click({
                    param: param
                });
            };

            $scope.isolatedMouseHover = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = 0;
                $scope.hoverValue = param;
                $scope.mouseHover({
                    param: param
                });
            };

            $scope.isolatedMouseLeave = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = $scope.rating;
                $scope.hoverValue = 0;
                $scope.mouseLeave({
                    param: param
                });
            };
        }
    };
});