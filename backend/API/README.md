# API for Hoaxy-Botometer database

## URL query

Query with user IDs

`/api/socres?user_id=userid1,userid2,userid3`

Query with screen names

`/api/socres?screen_name=username1,username2,username3`

Or query with user IDs and screen names at the same time:

`/api/socres?user_id=userid1,userid2,userid3&screen_name=username1,username2,username3`

Examples:

`http://127.0.0.1:5000/api/scores?user_id=269880075,269880076`

`http://127.0.0.1:5000/api/scores?screen_name=yadizdf,jondoe`

`http://127.0.0.1:5000/api/scores?user_id=269880075,269880076&screen_name=yadizdf,jondoe`

## "POST" method

Use `POST` method when meet the URL length limit.

Include a json file in the request body with the following format:

```json
    {
        "user_id": "269880075,269880076"
    }
```

Or

```json
    {
        "user_id":  ["269880075" , "269880076"]
    }
```



Or

```json
    {
        "screen_name": "username1,username2,username3"
    }
```

```json
    {
        "screen_name": ["username1", "username2", "username3"]
    }
```

Or

```json
    {
        "user_id": ["269880075" , "269880076"],
        "screen_name": "username1,username2,username3"
    }
```

# API Response

For queries no matches are found in the database, an "empty" record will be returned where all the fields are `NULL` except `user_id` or `screen_name`.

Duplicated records are possible.

```json
[
    {
        "categories": {
            "content": 0.64,
            "friend": 0.57,
            "network": 0.8,
            "sentiment": 0.51,
            "temporal": 0.37,
            "user": 0.53
        },
        "fresh": false,
        "scores": {
            "english": 0.65,
            "universal": 0.52
        },
        "timestamp": "Sun, 10 Sep 2017 04:40:04 GMT",
        "user": {
            "id": 269880075,
            "screen_name": "blond_leo"
        }
    },
    {
        "categories": {
            "content": null,
            "friend": null,
            "network": null,
            "sentiment": null,
            "temporal": null,
            "user": null
        },
        "fresh": null,
        "scores": {
            "english": null,
            "universal": null
        },
        "timestamp": null,
        "user": {
            "id": 269880076,
            "screen_name": null
        }
    },
    {
        "categories": {
            "content": 0.35,
            "friend": 0.19,
            "network": 0.6,
            "sentiment": 0.23,
            "temporal": 0.22,
            "user": 0
        },
        "fresh": false,
        "scores": {
            "english": 0.21,
            "universal": 0.21
        },
        "timestamp": "Sun, 10 Sep 2017 04:40:07 GMT",
        "user": {
            "id": 156433910,
            "screen_name": "yadizdf"
        }
    },
    {
        "categories": {
            "content": null,
            "friend": null,
            "network": null,
            "sentiment": null,
            "temporal": null,
            "user": null
        },
        "fresh": null,
        "scores": {
            "english": null,
            "universal": null
        },
        "timestamp": null,
        "user": {
            "id": null,
            "screen_name": "jondoe"
        }
    }
]
```
