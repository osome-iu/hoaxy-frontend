var Twitter = function(initialize_key){
    var obj = {};

    /* OAUTH API shouldn't have a trailing slash */
    var OAUTH_URL = 'https://oauth.truthy.indiana.edu',
    OAUTH_API = OAUTH_URL + '/api';

    var tokenCacheKey = 'oauth_twitter_token',
    providerCacheKey = 'oauth_twitter_provider',
    _token, _me;

    OAuth.initialize(initialize_key);
    OAuth.setOAuthdURL(OAUTH_URL);

    function getCachedToken(){
        if(!_token){
            var keys = localStorage.getItem(tokenCacheKey),
            provider = localStorage.getItem(providerCacheKey);
            if(keys && provider){
                console.log('Creating token from localStorage:', keys);
                console.log('OAuth provider from localStorage:', provider);
                /* Should probably test that the key is good first, e.g. with me() */
                try {
                    _token = OAuth.create('twitter', keys, provider);
                } catch (e) {
                    console.warn(e);
                    localStorage.removeItem(tokenCacheKey, providerCacheKey);
                }
            }
        }
        return _token
    }

    function cacheToken(token){
        _token = token;
        axios.get(OAUTH_API + '/providers/twitter?extend=true')
        .then(function(provider){
            localStorage.setItem(tokenCacheKey, token);
            localStorage.setItem(providerCacheKey, provider);
        });
    }

    function verifyMe(token){
        if(!_me){
            // var dfd = $q.defer();
            // _me = dfd.promise;

            _me = new Promise(function(resolve, reject){

                //console.log('Verifying user credentials with token:', token)
                return token.get('/1.1/account/verify_credentials.json', {data: {
                    'include_email': false,
                    'include_entities': false,
                    'skip_status': true
                }}).then(
                    // function(myUserData){ dfd.resolve(myUserData) },
                    function(myUserData){ resolve(myUserData); },
                    // function(error){ dfd.reject(error) }
                    function(error){ reject(error) }
                );
            });
        }
        return _me
    }

    function getToken(force_refresh){
        // var dfd = $q.defer(),
        var dfd = new Promise(function(resolve, reject){
            token = !force_refresh && getCachedToken();


            if(token){
                verifyMe(token).then(function(myUserData){
                    console.log('Verified credentials:', myUserData);
                    resolve(token);
                }, function(){
                    return getToken(true);
                });
            } else {
                OAuth.popup('twitter').done(function(result){
                    console.log('OAuth result:', result);
                    cacheToken(result);
                    resolve(result);
                    verifyMe(result);
                }).fail(function(error){
                    console.warn("OAuth ERROR:", error);
                    reject(error);
                });

            }
        });

        // return dfd.promise
        return dfd;
    }

    function apiCall(method, url, params, errMsg){
        // var dfd = $q.defer();
        var dfd = new Promise(function(resolve, reject){
            method = method.toLowerCase();

            getToken().then(function(token){
                console.log('GET ', url, params);
                token[method](url, {data: params}).done(function(response){
                    resolve(response)
                }).fail(function(error){
                    /*
                    *  var errMsg = params.errMsg || "We were unable to complete your" +
                    *                                "request. Try again later.";
                    */
                    reject({error: error, message: errMsg});
                })
            },  function(error){
                reject({error: error})
            })
        });
        return dfd;
    }

    var followerCursor = {}, friendCursor = {};
    function getNeighbors(relationship, screenName, count){
        var dfd = new Promise(function(resolve, reject){
            var cursorObj = relationship.startsWith('follower') ? followerCursor : friendCursor,
            cursor = cursorObj[screenName],
            params = {
                screen_name: screenName,
                count: count,
                cursor: cursor,
                skip_status: true
            };

            var endpoint;
            if (relationship.startsWith('follower')){
                endpoint = '/1.1/followers/list.json';
            } else if (relationship.startsWith('friend') ||
            relationship.startsWith('following')){
                endpoint = '/1.1/friends/list.json';
            } else {
                throw 'relationship type must be "followers" or "friends"'
            }

            apiCall('GET', endpoint, params,
            "Twitter was unable to retrieve followers of this user. Is there a typo?")
            .then(function(response){
                followerCursor[screenName] = response.next_cursor;
                resolve(response.users)
            });
        });
        return dfd;
    }

    obj.getUserData = function(screenName){
        return apiCall('GET', '/1.1/users/show.json', {screen_name: screenName},
        "Twitter was unable to retrieve information for this user, is there a typo?")
    }

    obj.getUserTimeline = function(screenName){
        return apiCall('GET', '/1.1/statuses/user_timeline.json', {screen_name: screenName, count:200},
        "Twitter was unable to retrieve a timeline for this user, is there a typo?")
    }

    obj.getUserMentions = function(screenName){
        return apiCall('GET', '/1.1/search/tweets.json', {q: '@'+screenName, count:100},
        "Twitter was unable to retrieve mentions of this user, is there a typo?")
    }

    obj.getFollowers = function(screenName, count){
        return getNeighbors('followers', screenName, count);
    }

    obj.getFollowing = function(screenName, count){
        return getNeighbors('friends', screenName, count);
    }

    obj.blockUser = function(userId){
        return apiCall('POST', '/1.1/blocks/create.json', {
            user_id: userId
            , include_entities: false
            , skip_status: true
        })
    }

    obj.unblockUser = function(userId){
        return apiCall('POST', '/1.1/blocks/destroy.json', {
            user_id: userId
            , include_entities: false
            , skip_status: true
        })
    }

    obj.followUser = function(userId){
        return apiCall('POST', '/1.1/friendships/create.json', {user_id:userId})
    }

    obj.unfollowUser = function(userId){
        return apiCall('POST', '/1.1/friendships/destroy.json', {user_id:userId})
    }

    obj.me = function(){return _me};

    obj.verifyMe = function(){
        var dfd = new Promise(function(resolve, reject){
            getToken().then(function(token){
                verifyMe(token).then(resolve, reject);
            }, reject);
        });
        return dfd
    };

    obj.logOut = function(){
        _token = undefined;
        _me = undefined;
        localStorage.removeItem(tokenCacheKey);
    }


    return obj;
}
