// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'ngResource', 'starter.controllers', 'starter.apiCalls', 'starter.userInfos', 'starter.countryvalues', 'starter.newDate', 'chart.js', 'starter.Base64'])

.run(function($ionicPlatform, $cordovaPush, $rootScope, apiCalls, userInfos) {
console.log('*** DEVICE READY ***');

    var iosConfig = {
        "badge": true,
        "sound": true,
        "alert": true,
    };
    document.addEventListener("deviceready", function() {
        console.log('*** DEVICE READY ***');
        $cordovaPush.register(iosConfig).then(function(result) {
            // Success -- send deviceToken to server, and store for future use
             console.log('*** DEVICE INFOS ***' + result);
            alert("Registration succeed: " + result);
            apiCalls.updateDeviceId({
                param2: userInfos.userInfos.name
            }, {
                deviceId: result
            });
        }, function(err) {
            alert("Registration error: " + err)
        });


        $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
            if (notification.alert) {
                navigator.notification.alert(notification.alert);
            }

            if (notification.sound) {
                var snd = new Media(event.sound);
                snd.play();
            }

            if (notification.badge) {
                $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
                    // Success!
                }, function(err) {
                    // An error occurred. Show a message to the user
                });
            }
        });

        // WARNING! dangerous to unregister (results in loss of tokenID)
//        $cordovaPush.unregister(options).then(function(result) {
//            // Success!
//        }, function(err) {
//            // Error
//        });

    }, false);

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        
         console.log('*** IONIC READY ***');
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
            //            StatusBar.hide();
        }
    });
})
    .service('BasicHttpAuth', ['Base64', '$http',
        function(Base64, $http) {
            // initialize to whatever is in the cookie, if anything
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorage.getItem("authdata");
            //    $localStorage.authdata;

            return {
                setCredentials: function(username, password) {
                    var encoded = Base64.encode(username + ':' + password);
                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    //            $localStorage.authdata = encoded;
                    localStorage.setItem("authdata", JSON.stringify(encoded));
                },
                clearCredentials: function() {
                    document.execCommand("ClearAuthenticationCache");
                    localStorage.removeItem('authdata');
                    localStorage.removeItem('userInfos');

                    //            delete $localStorage.authdata;
                    //            delete $localStorage.user;
                    $http.defaults.headers.common.Authorization = 'Basic ';
                }
            };
        }
    ])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            }).state('subscribe', {
                url: '/subscribe',
                templateUrl: 'templates/subscribe.html',
                controller: 'SubscribeCtrl'
            })
            .state('app', {
                url: "/app",
                cache: false,
                //        abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

        //        .state('app.friends', {
        //            url: "/friends",
        //            cache: false,
        //            views: {
        //                'menuContent': {
        //                    templateUrl: "templates/friends.html",
        //                    controller: 'FriendsCtrl'
        //                }
        //            }
        //        })

        .state('app.history', {
            url: "/history",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/history.html",
                    controller: 'HistoryCtrl'
                }
            }
        }).state('app.charts', {
            url: "/charts",
            abstract: true,
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/charts-tabs-menu.html"
                }
            }

        })

        .state('app.charts.stats', {
            url: "/stats",
            cache: false,
            views: {
                'charts-stats': {
                    templateUrl: 'templates/charts-stats.html',
                    controller: 'ChartsCtrl'
                }
            }
        }).state('app.charts.list', {
            url: "/list",
            cache: false,
            views: {
                'charts-list': {
                    templateUrl: 'templates/charts-list.html',
                    controller: 'ChartsCtrl'
                }
            }
        }).state('app.charts.details', {
            url: "/:id/details",
            cache: false,
            views: {
                'charts-list': {
                    templateUrl: 'templates/history-details.html',
                    controller: 'HistoryDetailsCtrl'
                }
            }
        }).state('app.charts.world', {
            url: "/world",
            cache: false,
            views: {
                'charts-world': {
                    templateUrl: 'templates/charts-world.html',
                    controller: 'ChartsCtrl'
                }
            }
        })


        .state('app.friends', {
            url: "/friends",
            abstract: true,
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/friends-tabs-menu.html"
                }
            }

        })

        .state('app.friends.add', {
            url: "/add",
            cache: false,
            views: {
                'friends-add': {
                    templateUrl: "templates/friends.html",
                    controller: 'FriendsCtrl'
                }
            }
        }).state('app.friends.contacts', {
            url: "/contacts",
            cache: false,
            views: {
                'friends-contacts': {
                    templateUrl: 'templates/friends-contacts.html',
                    controller: 'ContactCtrl'
                }
            }
        }).state('app.friends.accept', {
            url: "/accept",
            cache: false,
            views: {
                'friends-accept': {
                    templateUrl: 'templates/friends-accept.html',
                    controller: 'AcceptCtrl'
                }
            }
        })

        .state('app.new-entry', {
            url: "/newEntry",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/new-entry.html",
                    controller: 'NewEntryCtrl'
                }
            }
        })
            .state('app.select-friend', {
                url: "/newEntry/friend-select",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/friend-select.html",
                        controller: 'NewEntrySelectCtrl'
                    }
                }
            }).state('app.settings', {
                url: "/settings",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html",
                        controller: 'Settings'
                    }
                }
            })

        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });