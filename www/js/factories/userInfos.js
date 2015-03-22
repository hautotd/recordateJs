angular.module('starter.userInfos', [])

.factory('userInfos', function(apiCalls) {
    var userInfos = {};
    var self = this;
    
    var setLocalStorage = function(data){
        localStorage.setItem("userInfos", JSON.stringify(data));
        this.setUserInfosFromStorage();
    }
    
    var setUserInfosFromStorage = function(){
        this.userInfos = JSON.parse(localStorage.getItem('userInfos'));
    }
    
    var getUserInfosFromStorage = function(){
        var userInfosFromLocalStorage = localStorage.getItem('userInfos');
        return userInfosFromLocalStorage;
    }
    
    var fetchUserInfos = function(){
         return apiCalls.getUserInfos({
                param2: this.userInfos.name
            }).$promise;
    }
    
    return {
        userInfos: userInfos,
        getUserInfosFromStorage: getUserInfosFromStorage,
        setUserInfosFromStorage: setUserInfosFromStorage,
        fetchUserInfos : fetchUserInfos,
        setLocalStorage: setLocalStorage
    };
});