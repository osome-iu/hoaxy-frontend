configuration = function(){
	var obj = {}

	var rapidapi_key = "YOURKEY";

	obj.articles_url = "https://api-hoaxy.p.rapidapi.com/articles";
	obj.articles_headers = {
		"X-RapidAPI-Key": rapidapi_key,
		"Accept": "application/json"
	};

	obj.timeline_url =  "https://api-hoaxy.p.rapidapi.com/timeline";
	obj.timeline_headers = {
		"X-RapidAPI-Key": rapidapi_key,
		"Accept": "application/json"
	};

	obj.network_url = "https://api-hoaxy.p.rapidapi.com/network";
	obj.network_headers = {
		"X-RapidAPI-Key": rapidapi_key,
		"Accept": "application/json"
	};

	obj.top_articles_url = 'https://api-hoaxy.p.rapidapi.com/top-articles';
	obj.top_articles_headers = { 'X-RapidAPI-Key': rapidapi_key};

	obj.top_users_url = 'https://api-hoaxy.p.rapidapi.com/top-users';
	obj.top_users_headers = { 'X-RapidAPI-Key': rapidapi_key};

	obj.botometer_url = "https://example.com";
	obj.botometer_headers = {
		"X-RapidAPI-Key": "--KEY--",
		"Accept": "application/json"
	};

	obj.botcache_url = "https://example.com/api/scores";
	obj.feedback_url = "https://example.com/api/feedback";

	obj.twitter_key = "";

	obj.botcache_chunk_sizes = [
		2000
	];


	return obj;
}();
