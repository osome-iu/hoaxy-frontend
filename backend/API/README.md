# API for Hoaxy-Botometer database

## URL query

Query with user IDs `/api/socres?userIDs=userid1,userid2,userid3`
Query with screen names `/api/socres?usernames=username1,username2,username3`

Examples:

`http://127.0.0.1:5000/api/scores?user_id=269880075,269880076`

`http://127.0.0.1:5000/api/scores?screen_name=yadizdf,jondoe`

## "POST" query

A json file with the format:

```json
    {
        "user_id": "userid1,userid2,userid3"
    }
```

or

```json
    {
        "screen_name": "username1,username2,username3"
    }
```

# Return format

## For queries with user_id

```json
{
    "100000000": {
        "categories": {
            "content": 0.64,
            "friend": 0.57,
            "network": 0.8,
            "sentiment": 0.51,
            "temporal": 0.37,
            "user": 0.53
        },
        "fresh": true,
        "scores": {
            "english": 0.65,
            "universal": 0.52
        },
        "timestamp": "Sun, 10 Sep 2017 04:40:04 GMT"
    },
    "100000000": null
}
```

## For queries with screen_name

```json
{
    "no_exsiting_user": null,
    "abcde": {
        "categories": {
            "content": 0.35,
            "friend": 0.19,
            "network": 0.6,
            "sentiment": 0.23,
            "temporal": 0.22,
            "user": 0
        },
        "fresh": true,
        "scores": {
            "english": 0.21,
            "universal": 0.21
        },
        "timestamp": "Sun, 10 Sep 2017 04:40:07 GMT"
    }
}
```
