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
            var keys = JSON.parse(localStorage.getItem(tokenCacheKey)),
            provider = JSON.parse(localStorage.getItem(providerCacheKey));
            if(keys && provider){
                // console.log('Creating token from localStorage:', keys);
                // console.log('OAuth provider from localStorage:', provider);
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
        // console.debug(token);
        _token = token;
        axios.get(OAUTH_API + '/providers/twitter?extend=true')
        .then(function(provider){
            // console.debug(provider, token);
            localStorage.setItem(tokenCacheKey, JSON.stringify(token));
            localStorage.setItem(providerCacheKey, JSON.stringify(provider));
        }, function(error){
            console.debug(error);
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
                    // console.log('Verified credentials:', myUserData);
                    resolve(token);
                }, function(){
                    return getToken(true);
                });
            } else {
                OAuth.popup('twitter').done(function(result){
                    // console.log('OAuth result:', result);
                    cacheToken(result);
                    resolve(result);
                    verifyMe(result);
                }).fail(function(error){
                    // console.warn("OAuth ERROR:", error);
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
                // console.log('GET ', url, params);
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

    obj.getUserMentions = function(screenName){
        return apiCall('GET', '/1.1/search/tweets.json', {q: '@'+screenName, count:100},
        "Twitter was unable to retrieve mentions of this user, is there a typo?")
    }

    obj.getUserDataById = function(user_id){
        return apiCall('GET', '/1.1/users/show.json', {user_id: user_id},
        "Twitter was unable to retrieve information for this user, is there a typo?")
    }

    obj.getUserTimelineById = function(user_id){
        return apiCall('GET', '/1.1/statuses/user_timeline.json', {user_id: user_id, count:200},
        "Twitter was unable to retrieve a timeline for this user, is there a typo?")
    }

    obj.getFollowers = function(screenName, count){
        return getNeighbors('followers', screenName, count);
    }

    obj.getFollowing = function(screenName, count){
        return getNeighbors('friends', screenName, count);
    }

    obj.getUserLanguage = function(lang){
        return apiCall('GET', '/1.1/search/tweets.json', lang)
    }

    obj.getTweets = function(query, max_id, result_type, lang){
      if (!lang || lang == '')
      {
        return apiCall('GET', '/1.1/search/tweets.json', {q: query, max_id: max_id, result_type: result_type, count: 100, include_entities: 1},
        "Twitter was unable to retrieve mentions of this user, is there a typo?");
      }

      return apiCall('GET', '/1.1/search/tweets.json', {q: query, max_id: max_id, result_type: result_type, lang: lang, count: 100, include_entities: 1},
      "Twitter was unable to retrieve mentions of this user, is there a typo?");
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
