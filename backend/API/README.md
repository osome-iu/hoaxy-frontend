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

Use `POST` method when the URL length limit is met.

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

Or

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

The following request contains 2 records that are in the database and 2 records that are not.

```json
{
	"screen_name": "yadizdf,jondoe",
	"user_id": ["269880075" , "269880076"]
}
```

The response json will contain the statuses of the queried user records.

```json
{
    "statuses": {
        "hit": 2,
        "miss": 2
    },
    "result": [
        {
            "categories": {
                "content": 0.62,
                "friend": 0.79,
                "network": 0.84,
                "sentiment": 0.25,
                "temporal": 0.74,
                "user": 0.55
            },
            "fresh": false,
            "scores": {
                "english": 0.67,
                "universal": 0.55
            },
            "timestamp": "Sun, 16 Apr 2017 22:58:32 GMT",
            "user": {
                "id": "269880075",
                "screen_name": "blond_leo"
            }
        },
        {
            "categories": {
                "content": 0.25,
                "friend": 0.41,
                "network": 0.63,
                "sentiment": 0.41,
                "temporal": 0.36,
                "user": 0.01
            },
            "fresh": false,
            "scores": {
                "english": 0.17,
                "universal": null
            },
            "timestamp": "Sun, 01 Jan 2017 14:58:48 GMT",
            "user": {
                "id": "156433910",
                "screen_name": "yadizdf"
            }
        }
    ]
}
```
