angular.module('starter.newDate', [])

.factory('newDate', function($resource) {
    var newDateObject = {};
     
    return {
        newDateObject: newDateObject
    };
});