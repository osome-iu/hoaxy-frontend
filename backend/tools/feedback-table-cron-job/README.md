# Feedback Table Cron Job

## Set up

1. Create a file named "iuni-twitterapi-keys-and-secrets.json" in this directory and fill it with the following text filling in the `<>` parameters:
```
{
    "IUNI_TWITTERAPI_ACCESS_TOKEN" : "<str>",
    "IUNI_TWITTERAPI_ACCESS_SECRET" : "<str>",
    "IUNI_TWITTERAPI_CONSUMER_KEY" : "<str>",
    "IUNI_TWITTERAPI_CONSUMER_SECRET" : "<str>",
    "DB_HOST_NAME" : "<str>",
    "DB_USER" : "<str>",
    "DB_PASSWORD" : "<str>",
    "DB_NAME" : "<str>",
    "DB_PORT" : <int>
}
```

2. Create a Cron job that executes the `FetchAndUpdateFeedback_ProfilesTimelinesMentions.py` file every 20 minutes i.e. and filling the `<>` parameters

`*/20 * * * * <user> python /<path_to_this_file>/FetchAndUpdateFeedback_ProfilesTimelinesMentions.py`

## Miscellanea

Be careful of the Twitter API rate limits on the profile, timelines, and mentions. Also there will be a `.err` file that will be created and appended to as the script runs which notifies one of the users that the API failed to retrieve the information of.
