angular.module('starter.controllers', [])
    .filter('datefilter', function() {
        return function(date) {
            if (!date) {
                return '';
            }
            return moment.unix(date).format('DD/MM/YYYYY - h:mm:ss a');
        };
    }).filter('simpleDatefilter', function() {
        return function(date) {
            if (!date) {
                return '';
            }
            return moment.unix(date).format('DD/MM');
        };
    }).controller('LoginCtrl', function($scope, $state, userInfos, BasicHttpAuth, apiCalls, $cordovaOauth) {
        if (userInfos.getUserInfosFromStorage() && localStorage.getItem("authdata")) {
            userInfos.setUserInfosFromStorage();
            $state.go('app.new-entry');
        }
        $scope.loginData = {};

    
    $scope.facebookLogin = function() {
        $cordovaOauth.facebook("1546356315633689", ["dyms76@hotmail.com"]).then(function(result) {
            // results
            console.log(result);
        }, function(error) {
            // error
            console.log(error);
        });
    }

        // Open the login modal
        $scope.subscribe = function() {
            $state.go('subscribe');
        };

        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData.name);
            console.log('Doing login', $scope.loginData.password);

            apiCalls.login({
                name: $scope.loginData.name,
                password: $scope.loginData.password
            }, function(data) {
                console.log(data.name);
                if (!data.name) {
                    $scope.errorLoginMessage = 'No user found. PLease check your infos';
                    $scope.showErrorLogin = true;
                    return;
                }
                userInfos.userInfos = data;
                BasicHttpAuth.setCredentials($scope.loginData.name, $scope.loginData.password);
                localStorage.setItem("userInfos", JSON.stringify(data));
                $state.go('app.new-entry');

            }, function(err) {
                console.log(JSON.stringify(err));
            });
        };

    }).controller('SubscribeCtrl', function($scope, $state, userInfos, BasicHttpAuth, apiCalls, $ionicPopup) {
        $scope.subscriptionData = {};
        // Perform the login action when the user submits the login form
        $scope.doSubscribe = function() {
            var deviceID = localStorage.getItem("deviceId");
            $scope.subscriptionData.deviceId = deviceID;
            console.log(deviceID);
            apiCalls.subscribe($scope.subscriptionData, function(data) {
                console.log('ok');
                userInfos.setLocalStorage(data);
                BasicHttpAuth.setCredentials($scope.subscriptionData.name, $scope.subscriptionData.password);
                $state.go('app.new-entry');

            }, function(err) {
                console.log(err);
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: (err.data) ? (err.data.error || 'An error occured') : 'An error occured'
                });
            });
        };
    })
    .controller('AppCtrl', function($scope, $ionicModal, $state, $timeout, apiCalls, userInfos, $ionicHistory, $ionicPopup, BasicHttpAuth) {

        if (!userInfos.getUserInfosFromStorage() || !localStorage.getItem("authdata")) {
            $state.go('login');
        }

        userInfos.setUserInfosFromStorage();
        var retrievedDeviceId = localStorage.getItem("deviceId");

        console.log('getting device Id ');
        //        console.log(userInfos.getUserInfosFromStorage());
        if (retrievedDeviceId && userInfos.getUserInfosFromStorage()) {
            apiCalls.updateDeviceId({
                param2: userInfos.userInfos.name
            }, {
                deviceId: retrievedDeviceId
            });
        }

        $scope.logOff = function() {
            localStorage.removeItem('userInfos');
            BasicHttpAuth.clearCredentials();
            $state.go('login');
        };
    })

.controller('NewEntryCtrl', function($scope, countryList, jobsList, placesList, $state, newDate, apiCalls, userInfos, $ionicLoading, $timeout, $ionicModal, weights, heights, $cordovaGeolocation, $ionicPopup, $cordovaVibration, $cordovaCamera) {
    console.log('newentry loading');
    $scope.countries = countryList;
    $scope.jobsList = jobsList;
    $scope.placesList = placesList;
    $scope.weights = weights;
    $scope.heights = heights;
    $scope.newDate = {
        date: moment().unix(),
        position: {}
    };

    $scope.userInfos = userInfos.userInfos;

    var posOptions = {
        timeout: 10000,
        enableHighAccuracy: true
    };

    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function(position) {
            $scope.newDate.position.lat = position.coords.latitude;
            $scope.newDate.position.long = position.coords.longitude;
            //            var alertPopup = $ionicPopup.alert({
            //                title: 'Error',
            //                template: 'position : ' + $scope.newDate.position.long + ' ' + $scope.newDate.position.lat
            //            });
        }, function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: err
            });
        });

    $scope.takeNewDatePic = function(){
        console.log('taking date pic');
          
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation: true,
            targetWidth: 200,
            targetHeight: 200,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
              $scope.newDate.profilePic =  "data:image/jpeg;base64," + imageData;
        })
   
    }
    
    
    $scope.closeKeyboard = function() {
        cordova.plugins.Keyboard.close();
    };

    $ionicModal.fromTemplateUrl('templates/my-gender-modal.html', {
        scope: $scope,
        animation: 'slide-in-down'
    }).then(function(modal) {

        $scope.modal1 = modal;
    });

    $scope.openModal = function() {
        $cordovaVibration.vibrate(100);
        console.log('opening');
        $scope.characteristic = 'gender';
        $scope.modal1.show();
    };

    $scope.openRatingModal = function() {
        $cordovaVibration.vibrate(100);
        console.log('opening');
        $scope.characteristic = 'rating';
        $scope.modal1.show();
    };

    $scope.openLocationModal = function() {
        $cordovaVibration.vibrate(100);
        console.log('opening');
        $scope.characteristic = 'location';
        $scope.modal1.show();
    };

    $scope.openNationalityModal = function() {
        $cordovaVibration.vibrate(100);
        console.log('opening');
        $scope.characteristic = 'nationality';
        $scope.modal1.show();
    };

    $scope.openJobModal = function() {
        $cordovaVibration.vibrate(100);
        console.log('opening');
        $scope.characteristic = 'job';
        $scope.modal1.show();
    };
    $scope.openDetailsModal = function() {
        console.log('opening');
        $scope.characteristic = 'details';
        $scope.modal1.show();
    };


    $scope.closeModal = function() {
        $scope.modal1.hide();
        console.log($scope.choice);
    };

    $scope.closeDetailsModal = function() {
        if (!$scope.newDate.weight || !$scope.newDate.height) {
            return;
        }
        $scope.modal1.hide();
        console.log($scope.choice);
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal1.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });






    $scope.goToFriendSelection = function() {
        console.log($scope.newDateObject);
        newDate.newDateObject = $scope.newDate;
        $state.go('app.select-friend');
    };

})
    .controller('NewEntrySelectCtrl', function($scope, countryList, jobsList, placesList, $state, userInfos, newDate, apiCalls, $ionicLoading, $ionicHistory) {
        console.log('newentry friend selection loading');
        $scope.newDateObject = newDate.newDateObject;
        $scope.userInfos = userInfos.userInfos;
        $scope.friendsList = $scope.userInfos.friends;

        $scope.selectedFriendsList = [];

        $scope.sendNotificationAndUpdateHistory = function() {


            $ionicLoading.show({
                template: '<i class="icon ion-paper-airplane"></i>  Sending...'
            });


            $scope.newDateObject.friendsShared = _.map(_.where($scope.friendsList, {
                selected: true
            }), function(value) {
                return {
                    name: value.name
                }
            });

            $scope.newDateObject.message = userInfos.userInfos.name + ' just dated a ' + $scope.newDateObject.weight + ' ' + $scope.newDateObject.height + ' ' + $scope.newDateObject.gender + ' ' + $scope.newDateObject.job + ' in a ' + $scope.newDateObject.where + '. He ranked the date ' + $scope.newDateObject.ranking + '/10. Message : ' + $scope.newDateObject.comment;

            apiCalls.updateHistoryUser({
                param2: userInfos.userInfos.name
            }, $scope.newDateObject, function(data) {
                console.log(data);
                if (data) {

                    $ionicLoading.show({
                        template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Done !',
                        duration: 500
                    });
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $state.go('app.charts.stats');
                }

            });

        }
    })

.controller('HistoryCtrl', function($scope, $stateParams, $state, userInfos, apiCalls) {
    $scope.navTitle = 'History';
    $scope.userInfos = userInfos.userInfos;
    $scope.historyList = $scope.userInfos.history;
    $scope.doRefresh = function() {
        apiCalls.getUserInfos({
            param2: $scope.userInfos.name,
        }, function(data) {
            userInfos.userInfos = data;
            $scope.historyList = userInfos.userInfos.history;
            localStorage.setItem("userInfos", JSON.stringify(data));

            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    $scope.doRefresh();

    $scope.goToDetail = function(historyObject) {
        $state.go('app.historydetail', {
            id: historyObject._id
        });
    }
}).controller('ChartsCtrl', function($scope, $stateParams, $state, userInfos, apiCalls) {
    $scope.navTitle = 'Statistics';
    console.log('ChartsCtrl');
    $scope.userInfos = userInfos.userInfos;
    console.log($scope.userInfos);
    $scope.historyList = $scope.userInfos.history;


    $scope.goToDetail = function(historyObject) {
        $state.go('app.charts.details', {
            id: historyObject._id
        });
    }

    var nationalityList = _.compact(_.pluck($scope.historyList, 'nationality'));


    var dataNat = [];
    var labelNat = [];
    _.each(nationalityList, function(nat) {
        dataNat.push(_.where($scope.historyList, {
            nationality: nat
        }).length);
        labelNat.push(nat);
    });

    console.log(dataNat);
    console.log(labelNat);

    $scope.countries = dataNat;
    $scope.lables1 = labelNat;

    $scope.labelsOverview = labelNat;
    $scope.seriesOverview = ['Nationalities'];
    $scope.dataOverview = [
        dataNat
    ];



    $scope.nationalitiesOptions = {
        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: true,

        // String - Tooltip background colour
        tooltipFillColor: "#07496A",

        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#02A3B0",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 1,

        //The percentage of the chart that we cut out of the middle.
        percentageInnerCutout: 70,

    }

    Chart.defaults.global.colours = [{ // blue
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "#FFF",
        pointColor: "#EDA94E",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,0.8)"
    }, { // light grey
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,0.8)"
    }, { // red
        fillColor: "rgba(247,70,74,0.2)",
        strokeColor: "rgba(247,70,74,1)",
        pointColor: "rgba(247,70,74,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(247,70,74,0.8)"
    }, { // green
        fillColor: "rgba(70,191,189,0.2)",
        strokeColor: "rgba(70,191,189,1)",
        pointColor: "rgba(70,191,189,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(70,191,189,0.8)"
    }, { // yellow
        fillColor: "rgba(253,180,92,0.2)",
        strokeColor: "rgba(253,180,92,1)",
        pointColor: "rgba(253,180,92,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(253,180,92,0.8)"
    }, { // grey
        fillColor: "rgba(148,159,177,0.2)",
        strokeColor: "rgba(148,159,177,1)",
        pointColor: "rgba(148,159,177,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(148,159,177,0.8)"
    }, { // dark grey
        fillColor: "rgba(77,83,96,0.2)",
        strokeColor: "rgba(77,83,96,1)",
        pointColor: "rgba(77,83,96,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(77,83,96,1)"
    }];

    $scope.chartOptions = {
        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: true,

        // String - Tooltip background colour
        tooltipFillColor: "#07496A",
        scaleGridLineColor: "white",

        scaleFontColor: "white",
        scaleLineColor: "#FFF",

        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#FFF",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 1,

        //The percentage of the chart that we cut out of the middle.
        percentageInnerCutout: 70,

    }


    $scope.labels = ['*****', "****", "***", "**", "*"];
    var count = function(item, nb) {
        var nb = _.where(item, {
            ranking: nb
        });
        console.log(nb.length);
        console.log(item);
        return nb.length;
    }

    $scope.data = [count($scope.historyList, "5"), count($scope.historyList, "4"), count($scope.historyList, "3"), count($scope.historyList, "1"), count($scope.historyList, "1")];

    $scope.dataRankingBar = [$scope.data];
    $scope.labelRankinBar = $scope.labels;

    $scope.doRefresh = function() {
        apiCalls.getUserInfos({
            param2: $scope.userInfos.name,
            //            param3: $scope.userInfos.password
        }, function(data) {
            userInfos.userInfos = data;
            $scope.historyList = userInfos.userInfos.history;
            localStorage.setItem("userInfos", JSON.stringify(data));

            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    $scope.doRefresh();
})
    .controller('HistoryDetailsCtrl', function($scope, $stateParams, $state, userInfos, apiCalls) {
        console.log($stateParams.id);
        $scope.userInfos = userInfos.userInfos;
        $scope.userHistoryObject = _.find($scope.userInfos.history, {
            _id: $stateParams.id
        });
    })

.controller('FriendsCtrl', function($scope, $stateParams, userInfos, userInfos, apiCalls, $ionicLoading, $ionicPopup) {

    $scope.data = {
        friendNameToInvite: ''
    };
    $scope.userInfos = userInfos.userInfos;
    $scope.friendsList = $scope.userInfos.friends;
    console.log($scope.friendsList);

    $scope.doRefreshFriendList = function() {
        userInfos.fetchUserInfos().then(function(data) {
            $scope.friendsList = data.friends;
            userInfos.setLocalStorage(data);
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.inviteFriend = function() {
        if (_.contains(_.pluck($scope.friendsList, 'name'), $scope.data.friendNameToInvite)) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: 'Already in your friends list.'
            });
            return;
        }
        var body = {
            name: $scope.data.friendNameToInvite
        };
        apiCalls.addFriend({
            param2: userInfos.userInfos.name
        }, body, function(data) {


            if (data) {
                $ionicLoading.show({
                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Done !',
                    duration: 500
                });
                $scope.data.friendNameToInvite = '';

                $scope.friendsList = data.friends;
                userInfos.setLocalStorage(data);

            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Check your friend name. It doesn\'t exists.'
                });
                alertPopup.then(function(res) {

                });
            }
        }, function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: 'Check your friend name. It doesn\'t exists.'
            });
            alertPopup.then(function(res) {

            });
        });
    }

    $scope.deleteFriend = function(friend) {
        var body = {
            name: friend.name
        };
        apiCalls.deleteFriend({
            param2: userInfos.userInfos.name
        }, body, function(data) {
            if (data.name) {
                $ionicLoading.show({
                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Done !',
                    duration: 500
                });
                $scope.friendsList = data.friends;
                userInfos.setLocalStorage(data);
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Unable to delete friend..'
                });
                alertPopup.then(function(res) {

                });
            }
        }, function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: 'Unable to delete friend.'
            });
            alertPopup.then(function(res) {

            });
        });
    }

}).controller('ContactCtrl', function($scope, $stateParams, userInfos, userInfos, apiCalls, $ionicLoading, $ionicPopup, $cordovaContacts, $cordovaProgress, $cordovaSocialSharing) {
    $ionicLoading.show({
        template: 'Contacts loading...',
        duration: 500
    });
    if (!navigator.contacts) {
        $scope.phoneContacts = [{
            "id": 1,
            "rawId": null,
            "displayName": null,
            "name": {
                "givenName": "Ambre",
                "honorificSuffix": null,
                "formatted": "Ambre Nguyen",
                "middleName": null,
                "familyName": "Nguyen",
                "honorificPrefix": null
            },
            "nickname": null,
            "phoneNumbers": [{
                "value": "+33686763824",
                "pref": false,
                "id": 0,
                "type": "mobile"
            }],
            "emails": [{
                "value": "ambre.nguyen.09@gmail.com",
                "pref": false,
                "id": 0,
                "type": "home"
            }],
            "addresses": null,
            "ims": null,
            "organizations": null,
            "birthday": null,
            "note": null,
            "photos": [{
                "value": "/var/mobile/Containers/Data/Application/53EA5D9D-17BC-49FD-971F-508EF6AF7659/tmp/photo_Ra3eR",
                "type": "url",
                "pref": "false"
            }],
            "categories": null,
            "urls": null
        }, {
            "id": 2,
            "rawId": null,
            "displayName": null,
            "name": {
                "givenName": "Thomas",
                "honorificSuffix": null,
                "formatted": "Thomas Charlihi",
                "middleName": null,
                "familyName": "Charlihi",
                "honorificPrefix": null
            },
            "nickname": null,
            "phoneNumbers": [{
                "value": "+33 6 87 87 16 83",
                "pref": false,
                "id": 0,
                "type": "mobile"
            }, {
                "value": "06 25 89 01 91",
                "pref": false,
                "id": 1,
                "type": "mobile"
            }],
            "emails": null,
            "addresses": null,
            "ims": null,
            "organizations": [{
                "pref": "false",
                "title": null,
                "name": "Vinci Construction | France",
                "department": null,
                "type": null
            }],
            "birthday": null,
            "note": null,
            "photos": [{
                "value": "/var/mobile/Containers/Data/Application/53EA5D9D-17BC-49FD-971F-508EF6AF7659/tmp/photo_vL7m5",
                "type": "url",
                "pref": "false"
            }],
            "categories": null,
            "urls": null
        }, {
            "id": 7,
            "rawId": null,
            "displayName": null,
            "name": {
                "givenName": "Kevin",
                "honorificSuffix": null,
                "formatted": "Kevin Excoffon",
                "middleName": null,
                "familyName": "Excoffon",
                "honorificPrefix": null
            },
            "nickname": null,
            "phoneNumbers": [{
                "value": "+33 6 18 50 64 41",
                "pref": false,
                "id": 0,
                "type": "mobile"
            }],
            "emails": null,
            "addresses": null,
            "ims": null,
            "organizations": [{
                "pref": "false",
                "title": null,
                "name": "Cpe",
                "department": null,
                "type": null
            }],
            "birthday": null,
            "note": null,
            "photos": [{
                "value": "/var/mobile/Containers/Data/Application/53EA5D9D-17BC-49FD-971F-508EF6AF7659/tmp/photo_VtyQp",
                "type": "url",
                "pref": "false"
            }],
            "categories": null,
            "urls": null
        }];
        $ionicLoading.hide();
    }


    var formatContact = function(contacts) {
        $scope.formatedContacts = [];
        _.each(contacts, function(contact) {
            if (!contact.phoneNumbers) {
                return;
            }
            if (contact.phoneNumbers.length > 1) {

                _.each(contact.phoneNumbers, function(phoneNumberObj) {
                    var toPush = angular.copy(contact);
                    console.log(phoneNumberObj.value);
                    toPush.phoneNumber = phoneNumberObj.value;
                    $scope.formatedContacts.push(toPush);
                });
            } else {
                var toPush = contact;
                toPush.phoneNumber = contact.phoneNumbers[0].value;
                $scope.formatedContacts.push(contact);
            }
        });
        console.log($scope.formatedContacts);
    }

    formatContact($scope.phoneContacts);

    $scope.getContacts = function() {
        $scope.phoneContacts = [];

        function onSuccess(contacts) {
            for (var i = 0; i < contacts.length; i++) {
                var contact = contacts[i];
                $scope.phoneContacts.push(contact);
            }
            formatContact($scope.phoneContacts);
            $ionicLoading.hide();
        };

        function onError(contactError) {
            alert(contactError);
            $ionicLoading.hide();
        };
        var options = {};
        options.multiple = true;
        $cordovaContacts.find(options).then(onSuccess, onError);
    };
    if (!$scope.phoneContacts) {
        $scope.getContacts();

    }

    var message = '** Hey ! I am using Recordate! The best Dating tracker ever! Join me ! My username: TESTING_APP **';
    var link = "http://recodate.com/download";

    $scope.sendSms = function() {
        console.log('send sms');
        var selectedContacts = _.where($scope.formatedContacts, {
            selected: true
        });

        console.log(selectedContacts);
        var numbers = _.pluck(selectedContacts, 'phoneNumber').join(',');
        console.log(numbers);
        $cordovaSocialSharing
            .shareViaSMS(message, numbers)
            .then(function(result) {
                $ionicLoading.show({
                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Invitations sent !',
                    duration: 500
                });
            }, function(err) {
                // An error occurred. Show a message to the user
            });
    }

    $scope.fbShare = function() {
        $cordovaSocialSharing
            .shareViaFacebook(message, null, link)
            .then(function(result) {
                $ionicLoading.show({
                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Facebook post succeeded !',
                    duration: 500
                });
            }, function(err) {
                // An error occurred. Show a message to the user
            });
    }
    $scope.twShare = function() {
        $cordovaSocialSharing
            .shareViaTwitter(message, null, link)
            .then(function(result) {
                $ionicLoading.show({
                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Twitter post succeeded !',
                    duration: 500
                });
            }, function(err) {
                // An error occurred. Show a message to the user
            });
    }

}).controller('AcceptCtrl', function($scope, $stateParams, userInfos, apiCalls, $ionicLoading, $ionicPopup, $cordovaContacts, $cordovaProgress, $cordovaGeolocation, $cordovaTouchID) {



    $cordovaTouchID.checkSupport().then(function() {
        // success, TouchID supported
    }, function(error) {
        alert(error); // TouchID not supported
    });

    $cordovaTouchID.authenticate("Test touch Id ! ").then(function() {
        $ionicLoading.show({
            template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Touch id success !',
            duration: 500
        });
    }, function() {
        // error
    });




}).controller('Settings', function($scope, $stateParams, userInfos, apiCalls, $ionicLoading, $ionicPopup, $cordovaContacts, $cordovaProgress, $cordovaGeolocation, BasicHttpAuth, $state, $cordovaDialogs, $cordovaCamera) {
    $scope.userInfos = userInfos.userInfos;
    console.log($scope.userInfos);
    $scope.imSrc = $scope.userInfos.profilePic;
    //    
    //    
    //    apiCalls.updateProfilePic({
    //                param2:  $scope.userInfos.name
    //            }, {
    //                profilePicData: 'blablabla'
    //            }, function(data) {
    //                $ionicLoading.show({
    //                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Done !',
    //                    duration: 500
    //                });
    //            }, function(err) {
    //                $ionicLoading.show({
    //                    template: ' Updating ERROR !',
    //                    duration: 500
    //                });
    //                console.log(err);
    //            });
    //    
    //    
    $scope.takePic = function() {
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation: true,
            targetWidth: 200,
            targetHeight: 200,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imSrc = "data:image/jpeg;base64," + imageData;
            localStorage.setItem('profilePic', $scope.imSrc);
            apiCalls.updateProfilePic({
                param2: $scope.userInfos.name
            }, {
                profilePicData: $scope.imSrc
            }, function(data) {
                userInfos.userInfos = data;
                localStorage.setItem("userInfos", JSON.stringify(data));
                $ionicLoading.show({
                    template: '<i style="color:#7CC38D" class="icon ion-checkmark-round"></i>  Profile pic uploaded !',
                    duration: 1000
                });
            }, function(err) {
                $ionicLoading.show({
                    template: ' Updating ERROR !',
                    duration: 1000
                });
                console.log(err);
            });

        })
    }

    $scope.logOff = function() {
        $cordovaDialogs.confirm('Are you sure?', 'Confirm logging out', ['Cancel', 'OK'])
            .then(function(buttonIndex) {
                // no button = 0, 'OK' = 1, 'Cancel' = 2
                var btnIndex = buttonIndex;
                if (btnIndex === 2) {
                    localStorage.removeItem('userInfos');
                    BasicHttpAuth.clearCredentials();
                    $state.go('login');
                }
                if (btnIndex === 1) {
                    return;
                }
            });




    };
});