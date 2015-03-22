app.service('BasicHttpAuth', ['Base64', '$http', function (Base64, $http) {
    // initialize to whatever is in the cookie, if anything
    $http.defaults.headers.common['Authorization'] = 'Basic ' +  localStorage.getItem("authdata"); 
//    $localStorage.authdata;

    return {
        setCredentials: function (username, password) {
            var encoded = Base64.encode(username + ':' + password);
            $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
//            $localStorage.authdata = encoded;
            localStorage.setItem("authdata", JSON.stringify(encoded));
        },
        clearCredentials: function () {
            document.execCommand("ClearAuthenticationCache");
            localStorage.removeAll();
//            delete $localStorage.authdata;
//            delete $localStorage.user;
            $http.defaults.headers.common.Authorization = 'Basic ';
        }
    };
}]);