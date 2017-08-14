configuration = function(){
	var obj = {}

	var mashape_key = "YOURKEY";

	obj.articles_url = "https://api-hoaxy.p.mashape.com/articles";
	obj.articles_headers = {
		"X-Mashape-Key": mashape_key,
		"Accept": "application/json"
	};

	obj.timeline_url =  "https://api-hoaxy.p.mashape.com/timeline";
	obj.timeline_headers = {
		"X-Mashape-Key": mashape_key,
		"Accept": "application/json"
	};

	obj.network_url = "https://api-hoaxy.p.mashape.com/network";
	obj.network_headers = {
		"X-Mashape-Key": mashape_key,
		"Accept": "application/json"
	};

	obj.top_articles_url = 'https://api-hoaxy.p.mashape.com/top-articles';
	obj.top_articles_headers = { 'X-Mashape-Key': mashape_key};

	obj.top_users_url = 'https://api-hoaxy.p.mashape.com/top-users';
	obj.top_users_headers = { 'X-Mashape-Key': mashape_key};


	return obj;
}();
