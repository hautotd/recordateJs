angular.module('starter.apiCalls', [])

.factory('apiCalls', function($resource) {
    return $resource('http://54.77.86.119:8080/:param1/:param2/:param3/:param4/:param5/:param6/:param7/:param8/:param9', {}, {
//    return $resource('http://localhost:8080/:param1/:param2/:param3/:param4/:param5/:param6/:param7/:param8/:param9', {}, {
        getUserInfos: {
            method: 'GET',
            params: {
                param1: 'users'
            }
        },
        login: {
            method: 'POST',
            params: {
                param1: 'login'
            }
        },
        subscribe: {
            method: 'POST',
            params: {
                param1: 'users'
            }
        },
        deleteFriend: {
            method: 'POST',
            params: {
                param1: 'users',
                param3: 'friends',
                param4: 'delete'
            }
        },
        addFriend: {
            method: 'POST',
            params: {
                param1: 'users',
                param3: 'friends',
                param4: 'add'
            }
        },
        sendNotification: {
            method: 'POST',
            params: {
                param1: 'notification'
            }
        },
        updateHistoryUser: {
            method: 'POST',
            params: {
                param1: 'users',
                param3: 'history'
            }
        },
        updateDeviceId: {
            method: 'POST',
            params: {
                param1: 'users',
                param3: 'device',
                param4: 'update'
            }
        },
        updateProfilePic: {
            method: 'POST',
            params: {
                param1: 'users',
                param3: 'profilePic'
            }
        }

    });
});