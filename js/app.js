var app = angular.module(appName, [
   'ngRoute',
   'angular-loading-bar'
]);

app.config(['$routeProvider', '$controllerProvider', 'cfpLoadingBarProvider', function($routeProvider, $controllerProvider, cfpLoadingBarProvider){
    // Angular loading bar config
    cfpLoadingBarProvider.includeSpinner = false;

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

	function loader(arrayPath){
	    return {
	      load: function($q){
                var deferred = $q.defer(),
                map = arrayPath.map(function(path) {
                    return loadScript(path);
                });

                $q.all(map).then(function(r){
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
		controller : 'loginController',
        resolve: loader(['js/controllers/loginController.js'])
	})
	.when('/register', {
		templateUrl: 'html/views/register.html',
		controller : 'registerController',
        resolve: loader(['js/controllers/registerController.js'])
	})
	.when('/movie/view/:id', {
		templateUrl: 'html/views/movie/view.html',
		controller : 'movieViewController',
        resolve: loader(['js/controllers/movie/movieViewController.js'])
	})
	.when('/movie/list/:id?', {
		templateUrl: 'html/views/movie/list.html',
		controller : 'movieListController',
        resolve: loader(['js/controllers/movie/movieListController.js'])
	})
	.otherwise({
		redirectTo: '/'
	});
}]);