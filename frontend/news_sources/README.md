# What is this?

This folder location is used for the Hoaxy Botometer dashboard.  Essentially, the `vue-app.js` code file reads the `/news_sources/top-news-usa.json` location in order to render all of the pre-populated news sources that come from the CRON job that runs intermittently, populating the `.json` file with news sources.  The news are rendered to the Hoaxy-Botomter landing screen dashboard.

# What should I do?

Place a file called `top-news-usa.json` in this location populated with json data regarding news that has the following schema:

```json
{"id": 
	{"headline":"<headline>",
	 "source":"<source>",
	 "url":"<url>"
	},
 "id2": 
  	{...
    },
 "id3": 
    {...
    },
  ...		
 }

```
