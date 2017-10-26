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

2. Create a python environment using `conda create` if needed, then create a `.sh` shell script that executes the `FetchAndUpdateFeedback_ProfilesTimelinesMentions.py` script using that given python environment.

3. Create a Cron job that executes the `FetchAndUpdateFeedback_ProfilesTimelinesMentions.sh` file every 20 minutes i.e. and filling the `<>` parameters

`*/20 * * * * <user> /<path_to_this_file>/FetchAndUpdateFeedback_ProfilesTimelinesMentions.sh`

## Miscellanea

Be careful of the Twitter API rate limits on the profile, timelines, and mentions. Also there will be a `.err` file that will be created and appended to as the script runs which notifies one of the users that the API failed to retrieve the information of. Also, if using any local paths in the script, make sure they are changed to absolute paths before executing the cron job as the cron job will not have context of where the "local" files are located.
