var app = angular.module(appName, [
    'ngRoute',
    'angular-loading-bar',
    'infinite-scroll',
]);

app.config(['$routeProvider', '$controllerProvider', 'cfpLoadingBarProvider', function ($routeProvider, $controllerProvider, cfpLoadingBarProvider) {
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
        .otherwise({
            redirectTo: '/'
        });
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

// Colors filter
// function encodeHex(s) {
//     s = s.substring(1, 7);
//     if (s.length < 6) {
//         s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
//     }
//     return encodeRGB(
//         parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16));
// }

// function encodeRGB(r, g, b) {
//     return encode_triplet(0, r, g) + encode_triplet(b, 255, 255);
// }

// function encode_triplet(e1, e2, e3) {
//     var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
//     enc1 = e1 >> 2;
//     enc2 = ((e1 & 3) << 4) | (e2 >> 4);
//     enc3 = ((e2 & 15) << 2) | (e3 >> 6);
//     enc4 = e3 & 63;
//     return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
// }


// function generatePixel(color) {
//     return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
// }

// // scripts are loaded in a closure in jsFiddle
// // so make function global
// window["generateHex"] = function generateHex() {
//     var image = document.getElementById("image");
//     var hexInput = document.getElementById("hex");
//     var dataOutput = document.getElementById("output");
//     var hex = hexInput.value;
//     var color = encodeHex(hex);
//     var data = generatePixel(color);
//     dataOutput.value = data;
//     image.src = data;
// }

// generateHex();