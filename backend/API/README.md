# API for Hoaxy-Botometer database

## URL query

Query with user IDs `/api/socres?userIDs=userid1,userid2,userid3`
Query with screen names `/api/socres?usernames=username1,username2,username3`

## "POST" query

A json file with the format:

```json
    {
        "userIDs": "userid1,userid2,userid3"
    }
```

or

```json
    {
        "usernames": "username1,username2,username3"
    }
```

# Return format

```json
    "nonexist_user_id" : null,
    "fresh_user_id" : {
        "fresh" : true,
        "scores" : scores_in_json
    }
    "old_user_id" : {
        "fresh" : false,
        "scores" : scores_in_json
    }
```
