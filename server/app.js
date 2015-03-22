var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var request = require('request');
var fs = require('fs');
var mongoose = require('mongoose-q')(require('mongoose'));
var agent = require('./agent/_header');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var q = require('q');
var passport = require('passport')
var BasicStrategy = require('passport-http').BasicStrategy;
var bodyParser = require('body-parser');
var _ = require("underscore");


// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json 
app.use(bodyParser.json())

var envConfig = require('./env');
console.log(envConfig.mongo);

mongoose.connect(envConfig.mongo);
//mongoose.connect('mongodb://ec2-user@54.77.86.119:27017/users');


server.listen(8080);

var userSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    surname: String,
    deviceId: String,
    password: String,
    email: String,
    history: [{
        date: 0,
        ranking: String,
        comment: String,
        where: String,
        job: String,
        nationality: String,
        height: String,
        weight: String,
        age: String,
        gender: String,
        message: String,
        friendsShared: [{
            deviceId: String,
            name: String
        }]
    }],
    friends: [{
        deviceId: String,
        accepted: String,
        name: String,
        cKey: {
            type: String,
            unique: true
        }
    }]
});


userSchema.pre('save', function(next) {
    var user = this;
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) {
                next(err);
            } else {
                user.password = hash;
                console.log(user);
                next();
            }
        })
    });
});

userSchema.methods.comparePassword = function(candidatePassword) {
    console.log('candidate ' + candidatePassword);

    console.log('current ' + this.password);
    var defered = q.defer();
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) {
            console.log('NOT SAME');
            defered.reject(err);
        } else {
            console.log('SAME ' + isMatch);
            if (isMatch) {
                defered.resolve(isMatch);
            } else {
                defered.reject(isMatch);
            }

        }
    });
    return defered.promise;
};


var User = mongoose.model('users', userSchema);


passport.use(new BasicStrategy(
    function(userid, password, done) {
        console.log(userid, password);
        User.findOne({
            name: userid
        }, function(err, user) {

            console.log(user);
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            var userToSend = user;
            user.comparePassword(password)
                .then(function(user) {
                    console.log('RETURNING USER');
                    console.log(userToSend);
                    return done(null, userToSend);
                })
                .catch(function(err) {
                    console.log(err);
                    done(null, false, new Error('Incorrect password.'));
                })
        });
    }
));


app.use(passport.initialize());



var doUserMatching = function(authUser, queryUser) {
    if (authUser !== queryUser) {
        return false;
    } else {
        return true;
    }
}


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////*** LOGIN USER                   ///////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.post('/login', function(req, res) {
    console.log(req.body);
    User.findOneQ({
        name: req.body.name
    })
        .then(function(user) {
            console.log(user)
            if (!user) {
                return res.send(400, {
                    status: 'ERROR',
                    error: 'No user found.'
                });
            } else {
                user.comparePassword(req.body.password)
                    .then(function() {
                        res.json(user)
                    })
                    .catch(function(err) {
                        return res.send(400, {
                            status: 'ERROR',
                            error: 'Unable to compare passwords.'
                        });
                    })
            }
        })
        .fail(function(err) {
            return res.send(400, {
                status: 'ERROR',
                error: err
            });
        })
});


////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////*** RETRIEVE USER                ///////////////////////
////////////////////////////////////////////////////////////////////////////////////

app.get('/users/:user', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var username = req.params.user;
    if (!doUserMatching(req.params.user, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });

    }
    console.log(req.user.name);
    User.findOneQ({
        name: req.params.user
    }).then(function(users) {
        res.json(users);
    })
        .fail(function(err) {
            res.send(400, {
                status: 'ERROR',
                error: 'User not found.'
            });
        })
        .done()
});



////////////////////////////////////////////////////////////////////////////////////
////////////////////////*** SUBSCRIBE NEW USER /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

app.post('/users', function(req, res) {
    console.log(req.body);
    var user = new User(req.body);
    user.saveQ()
        .then(function(user) {
            res.json(user);
        })
        .fail(function(err) {
            console.log(err.code)
            if (err.code === 11000) {
                res.status(400).send({
                    status: 'ERROR',
                    error: 'User already exists.'
                });
            } else {
                res.status(400).send({
                    status: 'ERROR',
                    error: 'Unable to insert.'
                });
            }
        });
});


/////// ////////////////////////////////////////////////////////////////////////////
//////////////////////////// *** RETRIEVE USER HISTORY        ///////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.get('/history/:user', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var username = req.params.user;
    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }
    User.findOneQ({
        name: username
    }, {
        history: 1
    })
        .then(function(userHistory) {
            console.log(userHistory)
            res.json(userHistory);
        })
        .fail(function(err) {
            res.status(400).send({
                status: 'ERROR',
                error: 'User not found.'
            });
        });
});

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// *** SEARCH USER                 ////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.get('/users/:user/search/:userQuery', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var username = req.params.user;
    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }
    User.findOneQ({
        name: req.params.userQuery
    })
        .then(function(user) {

            res.json(user);
        })
        .fail(function(err) {
            res.status(400).send({
                status: 'ERROR',
                error: 'User not found.'
            });
        });

});


////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// *** GET FRIENDS                 ///////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.get('/users/:user/friends', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var username = req.params.user;
    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }
    User.findOneQ({
        name: username
    }, {
        friends: 1
    })
        .then(function(userHistory) {
            console.log(userHistory)
            res.json(userHistory);
        })
        .fail(function(err) {
            res.status(400).send({
                status: 'ERROR',
                error: 'User not found.'
            });
        });
});

////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// *** Update DeviceId              ///////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.post('/users/:username/device/update', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var username = req.params.username;
    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }
    var body = req.body;

    if (!body.deviceId) {
        return res.send({
            status: "WARNING",
            message: 'No deviceId sent'
        });
    }
    User.updateQ({
        name: username
    }, {
        deviceId: body.deviceId
    })
        .then(function() {
            res.json({
                status: "SUCCESS",
                message: "deviceId updated"
            })
        })
        .fail(function(err) {
            res.status(500).send({
                status: 'ERROR',
                error: 'Unable to update deviceId'
            });
        });
});

////////////////////////////////////////////////////////////////////////////////////
///////////////////////////**** ADD A FRIEND              //////////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.post('/users/:username/friends/add', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var username = req.params.username;
    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }
    var body = req.body;
    if (!body.name) {
        return res.status(500).send({
            status: 'ERROR',
            error: 'No friend Id sent'
        });
    }

    User.findOneQ({
        name: username
    }, {
        friends: 1
    })
        .then(function(user) {
            if (_.contains(_.pluck(user.friends, 'name'), body.name)) {
                console.log("Friend exists ! " + user.friends);
                return res.status(500).send({
                    status: 'ERROR',
                    error: 'Already friend!'
                });
            }
        });


    User.findOneQ({
        name: body.name
    })
        .then(function(user) {
            if (!user) {
                return res.status(400).send({
                    status: 'ERROR',
                    error: 'User not found.'
                });
            }
            User.updateQ({
                name: username
            }, {
                $push: {
                    friends: {
                        cKey: username + body.name,
                        name: body.name,
                        accepted: false
                    }
                }
            }).then(function(user) {
                User.findOneQ({
                    name: username
                })
                    .then(function(user) {
                        res.json(user);
                    });

            }).fail(function(err) {
                return res.status(500).send({
                    status: 'ERROR',
                    error: err
                });
            });
        })
        .fail(function(err) {
            return res.status(500).send({
                status: 'ERROR',
                error: err
            });
        });
});

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// **** DELETE A FRIEND              ///////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.post('/users/:username/friends/delete', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var body = req.body;
    var username = req.params.username;
    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }
    User.updateQ({
        name: username
    }, {
        $pull: {
            friends: {
                name: body.name
            }
        }
    }, {
        upsert: false,
        multi: false
    }).then(function(user) {
        User.findOneQ({
            name: username
        })
            .then(function(user) {
                if (!user) {
                    es.send(400, {
                        status: 'ERROR',
                        error: 'The user was not found.'
                    });
                }
                res.json(user);
            });

    }).fail(function(err) {
        res.status(500).send({
            status: 'ERROR',
            error: err
        });
    });
});

var notifyToList = function(friendsList, message) {
    friendsList.forEach(function(friend) {
        console.log(friend);
        console.log(message);
        if (friend.name && message) {
            User.findOneQ({
                name: friend.name
            })
                .then(function(foundFriend) {
                    if (!foundFriend) {
                        return;
                    }
                    console.log("Notifying : " + foundFriend.deviceId.toString());
                    agent.createMessage().device(foundFriend.deviceId.toString()).alert(message).badge(1).send();
                });
        }
    });
}



////////////////////////////////////////////////////////////////////////////////////
/////////////////////////*** UPDATE USER HISTORY ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.post('/users/:username/history', passport.authenticate('basic', {
    session: false
}), function(req, res) {
    var body = req.body;
    var username = req.params.username;

    if (!doUserMatching(username, req.user.name)) {
        return res.send(400, {
            status: 'ERROR',
            error: 'Header and UserId not matching.'
        });
    }


    if (body.friendsShared.length) {
        notifyToList(body.friendsShared, body.message);
    }

    User.updateQ({
        name: username
    }, {
        $push: {
            history: body
        }
    }, {
        upsert: false,
        multi: false
    }).then(function(user) {
        User.findOneQ({
            name: username
        })
            .then(function(user) {
                if (!user) {
                    es.send(400, {
                        status: 'ERROR',
                        error: 'The user was not found.'
                    });
                }
                res.json(user);
            });

    }).fail(function(err) {
        res.status(500).send({
            status: 'ERROR',
            error: err
        });
    });
});

////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////SEND NOTIFICATION TO APPLE APN///////////////////////
////////////////////////////////////////////////////////////////////////////////////
app.post('/notification/', function(req, res) {
    var data = '';
    if (req.method === 'POST') {
        req.on('data', function(chunk) {
            data += chunk;
        });
        req.on('end', function() {
            var jsonData = JSON.parse(data);
            console.log("json data ok");
            console.log(jsonData.deviceId);
            if (jsonData.deviceId && jsonData.message) {
                console.log(jsonData.deviceId.toString());
                agent.createMessage().device(jsonData.deviceId.toString()).alert(jsonData.message).badge(1).send();
                return res.send(jsonData.deviceId);
            } else {
                //            agent.createMessage().device("<acc929df 77f116c5 2a608935 e871139e 32692856 d77734a6 446b9ed4 455ddbc1>").alert('Farid: Une francaise notée 9/10. Lieux AEROPORT OCTEVILLE').badge(3).send();
                //            return res.send("notification send");
            }
        })
    }
});