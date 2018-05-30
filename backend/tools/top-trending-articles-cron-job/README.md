# Retrieve Top Trending News Cron Job

## Scope

Only the python file and the README file is present in the repo.  For security reasons, the rest of the pertinent files are located on the server on which this is deployed.

## Description

We use the News API (top news from the USA endpoint) which is accessed via a REST endpint in the `get-latestarticles-newsapi-tojson.py` file.  This file is called by the `.sh` file.  The `.sh` file is called from a cron job which can be accessed and edited by using `contab -e` on this server.  Finally, the News API key is stored and retrieved in the `keys-and-passwords.json` file.

## Flow

The CRON job runs every 6 hours and the top trending articles are placed in a `.json` format file in the `top-news-results` folder.  From there, the results are retrieved and pulled back in the Hoaxy site.

## News

Here we use the `top-headlines` endpoint from the US by specifying `en` as a parameter.  This endpoint retrieves the top 20 trending articles at the time of the query in the US.  We retrieve the headline, source, and url of each of the articles and place them in the `.json` file.


## More Information about the News API

Please see [News API](https://newsapi.org/) and [News API Privacy Policy](https://newsapi.org/privacy).