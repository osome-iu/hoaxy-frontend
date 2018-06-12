function HoaxyGraph(options)
{

    //background: linear-gradient(to bottom, rgb(44,123,182) 0%,rgb(171,217,233) 30%,rgb(255,255,191) 50%,rgb(253,174,97) 70%,rgb(215,25,28) 100%);

	var returnObj = {};

	var spinStart = options.spinStart || function(){ console.log("HoaxyGraph.spinStart is undefined."); };
	var spinStop = options.spinStop || function(){ console.log("HoaxyGraph.spinStop is undefined."); };
	var toggle_edge_modal = options.toggle_edge_modal || function(){ console.log("HoaxyGraph.toggle_edge_modal is undefined."); };
	var toggle_node_modal = options.toggle_node_modal || function(){ console.log("HoaxyGraph.toggle_node_modal is undefined."); };
	var node_modal_content = options.node_modal_content || {};
	var edge_modal_content = options.edge_modal_content || {};
	var twitter_account_info = options.twitter_account_info || {};
	var spinner_notices = options.spinner_notices || {};
	var twitter = options.twitter || null;
	var getting_bot_scores = options.getting_bot_scores || false;
	var graphAnimation = options.graphAnimation || {playing: false, increment: 0, total_increments: 40};
	var twitterRateLimitReached = options.twitterRateLimitReached;

	var timespan = {
		start_time: 0, end_time: 0
	};

	var score_stats = {
		user_list: [],
		current_index: 0,
		total: 0,
		found: 0,
		old: 0,
		unavailable: 0,

		reset: function(){
			this.total = this.found = this.old = this.unavailable = 0;
		},
		recompute: function(){
			this.found = this.old = this.unavailable = 0;
			for(var i in botscores)
			{
				if (this.user_list.indexOf(i) > -1) {
					var score = botscores[i];
					if(score.score === -1)
					{
						this.unavailable += 1;
					}
					else if(score.old === true)
					{
						this.old += 1;
						this.found += 1;
					}
					else
					{
						this.found += 1;
					}
				}
			}
			this.total = this.user_list.length;
		}

	};


	var s = null; //sigma instance
	// getNodeColor(.25);
	var graph = {};
	var edges = [];
	var user_id_list = [];
	var botscores = {};

	function UpdateEdges(new_edges){
		edges = new_edges;
		console.debug("Edges updated.");
		var g = this;
		if(edges.length === 0)
		{
			KillGraph();
			return edges;
		}
		try{
			// twitter.me().then(function(response){
			// 	twitter_account_info = response;
			// 	if(twitter_account_info.id)
			// 	{
					score_stats.reset();
					botscores = {};
					getBotCacheScores();

					// var prom = this.graph.getBotCacheScores();
					// var v = this;
					// var func = function(){
					// 	v.graph.updateGraph(starting_time, ending_time);
					// 	v.show_zoom_buttons = true;
					// 	v.scrollToElement("graphs");
					// };
					// prom.then();

			// 	}
			// });
		} catch(e){
			console.debug("Not signed into twitter.");
		}
		return edges;
	}
	var retry_count = 0;
	function getBotCacheScores()
    {
		getting_bot_scores.running = true;
		// spinStart("getBotCacheScores");
		score_stats.user_list.length = 0;
		user_id_list.length = 0;
		// user_list = [];
		//build list of users found in the edge list
		// console.table(edges[0]);
		for(var i in edges)
		{
			var edge = edges[i],
				from_user_screen_name = edge.from_user_screen_name,
				to_user_screen_name = edge.to_user_screen_name
				from_user_id = edge.from_user_id,
				to_user_id = edge.to_user_id;
			if(score_stats.user_list.indexOf(from_user_id) < 0)
			{
				score_stats.user_list.push(from_user_id);
			}
			if(score_stats.user_list.indexOf(to_user_id) < 0)
			{
				score_stats.user_list.push(to_user_id);
			}
			if(user_id_list.indexOf(from_user_id) < 0)
			{
				user_id_list.push(from_user_id);
			}
			if(user_id_list.indexOf(to_user_id) < 0)
			{
				user_id_list.push(to_user_id);
			}
		}

		var botcache_request = axios({
			method: 'post',
			url: configuration.botcache_url,
			responseType: "json",
			data: {
				"user_id": user_id_list.join(",")
			}
		});
		botcache_request
		.then(
			function(response){
				spinStop("getBotCacheScores");
				console.debug("Got botcache: ", response.data);
                var results = response.data.result;
				for(var i in results)
				{
					var user = results[i];
					if(user)
					{
						var sn = user.user.screen_name;
						var id = user.user.id
						var score = user.scores.english;
						botscores[id] = {score: score, old: !user.fresh, time: new Date(user.timestamp), user_id: user.user.id, screen_name: sn };
                        updateNodeColor(id, score);

					}
				}
				//score_stats.recompute();

				score_stats.unavailable = 0;
				score_stats.old = 0;
				score_stats.found = 0;

				var already_computed_account_list = [];
				var stale_scores_to_compute = [];
				var scores_never_computed_to_compute = [];
				var account_list_to_compute = [];

				score_stats.user_list = [];

				for (var i in graph.nodes)// i is index
				{
					var score = botscores[graph.nodes[i].id];
					if(score && score.score)
			    {
						if(score.score === -1)
				    {
							scores_never_computed_to_compute.push(graph.nodes[i].id);
							score_stats.unavailable += 1;
						}
						else if(score.old === true)
				    {
							stale_scores_to_compute.push(graph.nodes[i].id);
							// account_list_to_compute.push(nodes[i].id);
							score_stats.old += 1;
							score_stats.found += 1;
				    }
						else
				    {
							already_computed_account_list.push(graph.nodes[i].id);
							score_stats.found += 1;
				    }
						score = score.score;
			    }
					else
			    {
						scores_never_computed_to_compute.push(graph.nodes[i].id);
						// account_list_to_compute.push(nodes[i].id);
						score = false;
			    }
		    }

				// We now order and prioritize the scores that need to be computed first
				// First we compute scores that have not ever been computed before
				var neverComputedLength = scores_never_computed_to_compute.length;
				for (var i = 0; i < neverComputedLength; i++) {
				    account_list_to_compute.push(scores_never_computed_to_compute[i]);
				}

				// Then we compute stale scores
				var staleLength = stale_scores_to_compute.length;
				for (var i = 0; i < staleLength; i++) {
				    account_list_to_compute.push(stale_scores_to_compute[i]);
				}

				// Populating bot update list with already updated scores first
				// Update bot update index to the point after this list
				score_stats.current_index = already_computed_account_list.length;
				for (var i = 0; i<score_stats.current_index; i++){
				    score_stats.user_list.push(already_computed_account_list[i])
				}

				// Then we add the bot scores that are stale or never obtained
				toComputeLen = account_list_to_compute.length;
				for (var i = 0; i<toComputeLen; i++){
				    score_stats.user_list.push(account_list_to_compute[i])
				}

				score_stats.total = graph.nodes.length;
				getting_bot_scores.running = false;

				//when we get the cache, go through cache and update botscores:
				//botscore[sn] = {score: xx, old: false/true};

				// spinStop("getBotCacheScores");
		})
		.catch(
			function (error) {
				getting_bot_scores.running = false;
				console.warn('Botometer Scores Request Error: ', error);

				// if it's a network error, retry a maximum of 5 times
				// if it was the expected 502, the second try will probably succeed.
				if(error.message === "Network Error" && retry_count < 5)
				{
					retry_count += 1;
					console.info("Retry bot score cache request #", retry_count);
					getBotCacheScores();
				}

				spinStop("getBotCacheScores");
			}
		);

		return botcache_request;


	}

	var counter = 0;

  function getNewScores(){
		getting_bot_scores.running = true;
		counter = 20;
		console.debug(score_stats.current_index);
		getBotScoreTimer(score_stats.current_index);
  }

	//space out the requests so that we don't hit the rate limit so quickly
	function getBotScoreTimer(index){
		// if(index > 20)
		// {
		// 	console.debug(botscores);
		// 	return false;
		// }
		if(counter <= 0)
		{
			score_stats.current_index = index;
			console.debug("got some botscores:", botscores);
			getting_bot_scores.running = false;
			return false;
		}
		else
		{
			counter -= 1;
		}

		if(index >= score_stats.user_list.length)
		{
			console.debug(botscores);
			console.debug("end of list");
			getting_bot_scores.running = false;
			return false;
		}

		var id = score_stats.user_list[index];
		var node = s.graph.nodes(id);
		var sn = node.data.screenName;
		var user = {screen_name: sn, user_id: id};
		if(botscores[id])
		{
			user.score = botscores[id].score;
			user.old = botscores[id].old;
		}

		var success = new Promise(function(resolve, reject){
			updateUserBotScore(user).then(resolve, reject);
		});
		success.then(function(response){
			if (response === "Error: rate limit reached") {
				twitterRateLimitReached.isReached = true;
			} else {
				// Resuming the rate limit as we have successfully
				// retrieved a bot score
				twitterRateLimitReached.isReached = false;
			}
		});

		// console.debug(user);
		index++;
		return setTimeout(function(){
			// console.debug("get Another one");
			getBotScoreTimer(index);
		}, 1000);
	}

	function updateUserBotScore(user)
	{
		function initiateBotScoreCouldNotBeRetrieved() {
			botscores[user.user_id] = {
				score: -1,
				old: true
			}
			updateNodeColor(user.user_id, botscores[user.user_id].score);
			score_stats.recompute();
		}

		var prom = new Promise(function(resolve, reject){
			// var prom = null;
			//if exists and fresh
			if(user.score)
			{
				updateNodeColor(user.user_id, user.score);
				resolve();
			}
			//if score is stale or does not exist
			if(!user.score || user.old)
			{
				var botProm = getNewBotometerScore(user.user_id);
				botProm.then(function(response){
					score_stats.recompute();
					resolve(response);
				}, function(error){
					// If Twitter returns a status code of 429 (rate limit reached)
					// we reject and let the handlers handle it
					// Different error catching mechansisms have the second error obj
					// So we check for it so it doesn't fail in error catching mechanism
					if (error.error) {
						if (error.error.status == 429) {
							reject('Error: rate limit reached');
							// Otherwise we could not retrieve the score, so something
							// happened to the account, thus we turn the node gray
						} else {
							// Request failed for another reason besides a 429 status code
							initiateBotScoreCouldNotBeRetrieved();
							reject();
						}
					} else {
						// Request failed for another reason besides a 429 status code
						initiateBotScoreCouldNotBeRetrieved();
						reject();
					}
				});
			}
		})
		.then(function(response){ return response; }, function(error){ return error; });
		return prom;
	}
	function twitterResponseFail(error){
		console.warn(error);
	}
	function getNewBotometerScore(user_id)
	{
		var user = {};
		var node = s.graph.nodes(user_id);
		var screen_name = node.data.screenName;
		botScoreA = new Promise(function(resolve, reject){
			var user_data = twitter.getUserDataById(user_id);
			user_data.then(function(response){
				user.user = response;
				if (screen_name != user.user.screen_name) {
					node_modal_content.staleAcctInfo.newId = user_id;
					node_modal_content.staleAcctInfo.oldSn = screen_name;
					node_modal_content.staleAcctInfo.newSn = user.user.screen_name;
					node_modal_content.staleAcctInfo.isStale = true;
				} else {
					node_modal_content.staleAcctInfo.oldSn = screen_name;
					node_modal_content.staleAcctInfo.newSn = 'unchanged';
					node_modal_content.staleAcctInfo.isStale = false;
				}
			}, function(){})
			.catch(twitterResponseFail);
			var user_timeline = twitter.getUserTimelineById(user_id);
			user_timeline.then(function(response){
				user.timeline = response;
			}, function(){})
			.catch(twitterResponseFail);
			var user_mentions = twitter.getUserMentionsById(user_id);
			user_mentions.then(function(response){
                if(response.statuses)
                    user.mentions = response.statuses;
                else
                    user.mentions = response;
			}, function(){})
			.catch(twitterResponseFail);

			var got_from_twitter = Promise.all([user_data, user_timeline, user_mentions]);
			got_from_twitter.then(function(values){
				var botScore = getBotScore(user, screen_name);
				botScore.then(resolve, reject);
			}, function(error){
				console.warn("Could not get bot score for " + screen_name + ": ", error);
				// score_stats.recompute();
				// botscores[screen_name] = {
				// 	score: -1,
				// 	old: true
				// }
				// console.debug(botscores[screen_name]);
				// updateNodeColor(screen_name, botscores[screen_name].score);
				reject(error);
			});
		}, twitterResponseFail)
		return botScoreA;
	}
	function getBotScore(user_object, potentially_old_sn)
	{
		var sn = user_object.user.screen_name;
		var id = user_object.user.id_str;
		console.debug(user_object);
		var botscore = axios({
			method: 'post',
			url: configuration.botometer_url,
			headers: configuration.botometer_headers,
			responseType: "json",
			data: user_object
		});
		botscore.then(function(response){
			// score_stats.recompute();

			var newId = response.data.user.id_str;
			if (potentially_old_sn != response.data.user.screen_name) {
				var oldSn = potentially_old_sn;
				var newSn = response.data.user.screen_name;
				var isStale = true;
			} else {
				var oldSn = potentially_old_sn;
				var newSn = 'unchanged';
				var isStale = false;
			}

			botscores[id] = {
				score: response.data.scores.english,
				old: false,
				time: new Date(),
				user_id: response.data.user.id,
				screen_name: sn,
				completeAutomationProbability:
					Math.floor(response.data.cap.english * 100),
				staleAcctInfo:
				{
					isStale: isStale,
					newId: newId,
					oldSn: oldSn,
					newSn: newSn
				}
			}

			node_modal_content.showStaleContent = true;
			updateNodeColor(id, botscores[id].score);

			// Updating user that was retrieved for showing opened modal content
			// getting_bot_scores.accountJustRetrieved = response.data.user.id_str;

		},
		function(error){
			console.debug("Could not get bot score for " + sn + ": ", error);


		});
		return botscore;
	}
	function updateNodeColor(node_id, score)
	{
        // setTimeout(function(){
            color = getNodeColor(score);
    		//change node color on graph based on botscore
            if(s && s.graph)
            {
    			var node = s.graph.nodes(node_id);
    			// console.debug(screen_name, score,color, node);
    			if(node)
    			{
    	    		s.graph.nodes(node_id).color = color;
    	    		s.graph.nodes(node_id).borderColor = getBorderColor(score);
					refreshGraph();
    			}
            }
        // },500);
	}


	var refreshGraph_debounce_timer = 0;
    function refreshGraph(){
        clearTimeout(refreshGraph_debounce_timer);
		refreshGraph_debounce_timer = setTimeout(function(){
			s.refresh({skipIndexation: true});
		}, 100);
    }

	function getBaseColor(score){
		if(score ===  undefined || score === null)
		{
			return colors.node_colors["fact_checking"];
		}
		if(score === false)
		{
			return {r: 255, g: 255, b: 255};
		}

		if(score < 0)
		{
			return {r: 230, g: 230, b: 230};
		}
		var score2 = score;
		score = score * 100;
		var color1 = { red: 0, green: 255, blue: 0};
		var color2 = { red: 102, green: 0, blue: 0};
		// var node_colors = [
		// 	{red: 215, green: 25, blue: 28} , //"#d7191c",
		// 	{red: 253, green: 174, blue: 97} , //"#fdae61",
		// 	{red: 255, green: 255, blue: 191} , //"#ffffbf",
		// 	{red: 171, green: 221, blue: 164} , //"#abdda4",
		// 	{red: 43, green: 131, blue: 186} //"#2b83ba",
		// ];
		var node_colors = colors.node_colors.botscores;
		// var node_colors = colors.node_colors.botscores;
		// var node_colors = [
		// 	{red: 255, green: 0, blue: 0} ,
		// 	{red: 255, green: 128, blue: 200} ,
		// 	{red: 0, green: 0, blue: 255},
		// ];
		// var node_colors = [
		// 	{red: 85, green: 0, blue: 0} ,
		// 	{red: 170, green: 221, blue: 0} ,
		// 	{red: 136, green: 136, blue: 255}
		// ];

		// var node_colors = [
		// 	{red: 127, green: 0, blue: 0} ,
		// 	{red: 164, green: 173, blue: 0} ,
		// 	{red: 157, green: 162, blue: 224} ,
		// 	{red: 175, green: 255, blue: 187}
		// ];



		score2 = 0;
		var color = {};

		if(score < 20)
		{
			color = node_colors[4];
		}
		else if(score < 40)
		{
			color = node_colors[3];
		}
		else if(score < 60)
		{
			color = node_colors[2];
		}
		else if(score < 80)
		{
			color = node_colors[1];
		}
		else
		{
			color = node_colors[0];
		}

		color.r = color.red;
		color.g = color.green;
		color.b = color.blue;

		return color;


        //
		// // score2 = 0
		// if(score < 15)
		// {
		// 	color1 = node_colors[2];
		// 	color2 = node_colors[2];
        //
		// 	score2 = 0; //(score - 0) / (20 - 0);
		// }
		// else if(score >= 15 && score < 50)
		// {
		// 	color1 = node_colors[2];
		// 	color2 = node_colors[1];
		// 	score2 = (score - 15) / (50 - 15)
		// }
		// else if(score >= 50 && score < 85)
		// {
		// 	color1 = node_colors[1];
		// 	color2 = node_colors[0];
		// 	score2 = (score - 50) / (85 - 50);
		// }
		// else
		// {
		// 	color1 = node_colors[0];
		// 	color2 = node_colors[0];
		// 	score2 = 0; //(score - 80) / (100 - 80);
		// }
        //
		// // if(score < 50)
		// // {
		// // 	color1 = node_colors[2];
		// // 	color2 = node_colors[1];
		// //
		// // 	score2 = (score - 0) / (50 - 0);
		// // }
		// // else
		// // {
		// // 	color1 = node_colors[1];
		// // 	color2 = node_colors[0];
		// // 	score2 = (score - 50) / (100 - 50)
		// // }
        //
		// // if(score < 33)
		// // {
		// // 	color1 = node_colors[3];
		// // 	color2 = node_colors[2];
		// //
		// // 	score2 = (score - 0) / (33 - 0);
		// // }
		// // else if(score < 66)
		// // {
		// // 	color1 = node_colors[2];
		// // 	color2 = node_colors[1];
		// //
		// // 	score2 = (score - 33) / (66 - 33);
		// // }
		// // else
		// // {
		// // 	color1 = node_colors[1];
		// // 	color2 = node_colors[0];
		// // 	score2 = (score - 66) / (100 - 66)
		// // }
		// // console.debug(score, score2);
        //
		// score2 = score2;
		// var r = Math.floor(color1.red + score2 * (color2.red - color1.red))//.toString(16);
		// var g = Math.floor(color1.green + score2 * (color2.green - color1.green))//.toString(16);
		// var b = Math.floor(color1.blue + score2 * (color2.blue - color1.blue))//.toString(16);
		// // if(r.length < 2) r = "0"+r;
		// // if(g.length < 2) g = "0"+g;
		// // if(b.length < 2) b = "0"+b;
		// // var color = "#"+r+g+b;
		// var color = {r: r, g: g, b: b};
		// // console.debug(color);
		// return color;


	}
	//Used for taking snapshot of graph
	function getRenderer()
	{
		return s.renderers[0];
	}

	function getNodeColor(score)
	{
		var base = getBaseColor(score);
		var color = "rgb("+base.r+", "+base.g+", "+base.b+")"
		return color;
	}

	function getBorderColor(score)
	{


		var darken = 120;
		if(score === false)
		{
			darken = 50;
		}
		var base = getBaseColor(score);
		base.r = base.r - darken;
		if(base.r < 0) base.r = 0;
		base.g = base.g - darken;
		if(base.g < 0) base.g = 0;
		base.b = base.b - darken;
		if(base.b < 0) base.b = 0;

		var color = "rgb("+base.r+", "+base.g+", "+base.b+")"
		return color;

	}



	function KillGraph()
	{
		if(s)
		{
			s.kill();
			s = null;
			// console.debug("Killed Existing Sigma");
		}

		document.getElementById("graph-container").innerHTML = "";
	}
 //
 // #     #                                       #####
 // #     # #####  #####    ##   ##### ######    #     # #####    ##   #####  #    #
 // #     # #    # #    #  #  #    #   #         #       #    #  #  #  #    # #    #
 // #     # #    # #    # #    #   #   #####     #  #### #    # #    # #    # ######
 // #     # #####  #    # ######   #   #         #     # #####  ###### #####  #    #
 // #     # #      #    # #    #   #   #         #     # #   #  #    # #      #    #
 //  #####  #      #####  #    #   #   ######     #####  #    # #    # #      #    #

	function UpdateGraph(start_time, end_time)
	{
		clearTimeout(animationTimeout);

		// spinStart("updateNetwork");
		console.debug("Updating Graph");
		KillGraph();

		// console.debug(edges);
		if(!edges || !edges.length)
		{
			throw "Tried to make graph, but there is no data.";
		}

		var TWEET_URL = "https://twitter.com/%0/status/%1";
	    var g = {nodes: [], edges: []},

		//set all nodes color to grey (#BDBDBD); 11/02/2016
	    node_colors = colors.node_colors,
		edge_colors = {
			"fact_checking": colors.edge_colors.fact_checking,
			"claim": colors.edge_colors.claim,
		},
	    nodes = {},
		count,
	    edgeCount = {};
		timespan.start_time = 0;
		timespan.end_time = 0;
		var node_count = 0, edge_count=0;
	    try
	    {
			//create nodes[] data structure to hold info.
	        for (var i in edges)
	        {

	            var edge = edges[i],
					// from_user_id = edge.from_user_screen_name,
					// to_user_id = edge.to_user_screen_name,
					from_user_id = edge.from_user_id,
					to_user_id = edge.to_user_id,
					tweet_id = edge.tweet_id,
					tweet_type = edge.tweet_type,
					is_mention = edge.is_mention,
					// tweet_created_at = (new Date(edge.tweet_created_at.substring(0, 10))).getTime();
					tweet_created_at = (new Date(edge.tweet_created_at)).getTime();
// console.debug(edge);

					//filter edges not fall into [start_time, end_time]
					// if (tweet_created_at < start_time || tweet_created_at > end_time)
					// 	continue;

					if(start_time && tweet_created_at < start_time)
					{
						continue;
					}
					if(end_time && tweet_created_at > end_time)
					{
						continue;
					}

					if(!timespan.start_time || tweet_created_at < timespan.start_time)
					{
						timespan.start_time = tweet_created_at;
					}
					if(!timespan.end_time || tweet_created_at > timespan.end_time)
					{
						timespan.end_time = tweet_created_at;
					}

					if (start_time && end_time) {
					       // console.log('BOTH TIMES EXIST');
					       timespan.start_time = start_time;
					       timespan.end_time = end_time;
					}

					var url_raw = edge.url_raw, title = edge.title;

				//sanity check
	            //if -1, dump it since no  out edge
	            if (-1 == to_user_id)
	                continue;
				nodes[from_user_id] = nodes[from_user_id] || {id:"", size:1, color: "", incomingCount: 0, outgoingCount: 0, screenName:"", incoming: {}, outgoing: {}, edges: []};
				nodes[from_user_id].id = from_user_id;
	            nodes[from_user_id].size++;
				nodes[from_user_id].color = node_colors[edge.site_type];
				nodes[from_user_id].screenName = edge.from_user_screen_name;
				nodes[from_user_id].edges.push("e" + i);

				nodes[from_user_id].outgoing[to_user_id] = nodes[from_user_id].outgoing[to_user_id] || {type:"", fact_checking: 0, claim: 0, screenName:"", count: 0, min_tweet_created_at: (new Date()).getTime(), max_tweet_created_at: 0, is_mentions: [], tweet_types: [], ids: [], url_raws:[], titles:[]};
				nodes[from_user_id].outgoing[to_user_id][edge.site_type] ++;
				nodes[from_user_id].outgoing[to_user_id].type = (nodes[from_user_id].outgoing[to_user_id].fact_checking > nodes[from_user_id].outgoing[to_user_id].claim ? "fact_checking" : "claim");

				nodes[from_user_id].outgoing[to_user_id].screenName = edge.to_user_screen_name;
				nodes[from_user_id].outgoing[to_user_id].count ++;

				nodes[from_user_id].outgoing[to_user_id].min_tweet_created_at = Math.min(tweet_created_at, nodes[from_user_id].outgoing[to_user_id].min_tweet_created_at);
				nodes[from_user_id].outgoing[to_user_id].max_tweet_created_at = Math.max(tweet_created_at, nodes[from_user_id].outgoing[to_user_id].max_tweet_created_at);

				nodes[from_user_id].outgoing[to_user_id].is_mentions.push(is_mention);
				nodes[from_user_id].outgoing[to_user_id].tweet_types.push(tweet_type);
				nodes[from_user_id].outgoing[to_user_id].ids.push(tweet_id);
				nodes[from_user_id].outgoing[to_user_id].url_raws.push(url_raw);
				nodes[from_user_id].outgoing[to_user_id].titles.push(title);
				nodes[from_user_id].outgoingCount ++;


				nodes[to_user_id] = nodes[to_user_id] || {id:"", size:1, color: "", incomingCount: 0, outgoingCount: 0, screenName:"", incoming: {}, outgoing: {}, edges: []};
				nodes[to_user_id].id = to_user_id;
				nodes[to_user_id].color = node_colors[edge.site_type];
				nodes[to_user_id].screenName = edge.to_user_screen_name;
				nodes[to_user_id].edges.push("e"+i);

				nodes[to_user_id].incoming[from_user_id] = nodes[to_user_id].incoming[from_user_id] || {type:"", fact_checking: 0, claim: 0,screenName:"", count: 0, is_mentions: [], tweet_types: [], ids:[], url_raws:[], titles:[]};
				nodes[to_user_id].incoming[from_user_id][edge.site_type] ++;
				nodes[to_user_id].incoming[from_user_id].type = (nodes[to_user_id].incoming[from_user_id].fact_checking > nodes[to_user_id].incoming[from_user_id].claim ? "fact_checking" : "claim");

				nodes[to_user_id].incoming[from_user_id].screenName = edge.from_user_screen_name;
				nodes[to_user_id].incoming[from_user_id].count ++;

				nodes[to_user_id].incoming[from_user_id].is_mentions.push(is_mention);
				nodes[to_user_id].incoming[from_user_id].tweet_types.push(tweet_type);
				nodes[to_user_id].incoming[from_user_id].ids.push(tweet_id);
				nodes[to_user_id].incoming[from_user_id].url_raws.push(url_raw);
				nodes[to_user_id].incoming[from_user_id].titles.push(title);
				nodes[to_user_id].incomingCount ++;

				edgeCount[from_user_id + " " + to_user_id] = edgeCount[from_user_id + " " + to_user_id]  || 0;
				edgeCount[from_user_id + " " + to_user_id] += 1;

				count = edgeCount[from_user_id + " " + to_user_id];
	        }
			// console.debug(nodes);
			//put nodes into sigma

            var max_size = 0;
            var min_size = 0;
			var node_count = 0;
            for(var i in nodes)
            {
				node_count ++;
                if(nodes[i].size > max_size)
                {
                    max_size = nodes[i].size;
                }
                if(nodes[i].size < min_size)
                {
                    min_size = nodes[i].size;
                }
            }


			// g.nodes.push({
			//
			// 	x: 0,
			// 	y: 0,
			// 	size: 10, //Math.sqrt(Math.sqrt(nodes[i].size*10)),
			// 	id: "fake_node", //nodes[i].screenName,
			// 	node_id: "fake_node",
			// 	color: "#ffffff",//nodes[i].color,
			// });

			var nodes_id = {};
			var cnt = 0;

			score_stats.unavailable = 0;
			score_stats.old = 0;
			score_stats.found = 0;

			var already_computed_account_list = [];
			var stale_scores_to_compute = [];
			var scores_never_computed_to_compute = [];
			var account_list_to_compute = [];

			score_stats.user_list = [];

      for (var i in nodes)// i is index
      {
        var percent = Math.sqrt(nodes[i].size) / Math.sqrt(max_size);
        var new_size = (percent * 1000) + 1;
				if(new_size < 300)
				{
					new_size = 300;
				}
				var score = botscores[nodes[i].id];

				if(score && score.score)
				{
					if(score.score === -1)
					{
						scores_never_computed_to_compute.push(nodes[i].id);
						score_stats.unavailable += 1;
					}
					else if(score.old === true)
					{
						stale_scores_to_compute.push(nodes[i].id);
						//account_list_to_compute.push(nodes[i].id);
						score_stats.old += 1;
						score_stats.found += 1;
					}
					else
					{
						already_computed_account_list.push(nodes[i].id);
						score_stats.found += 1;
					}
					score = score.score;
				}
				else
				{
					scores_never_computed_to_compute.push(nodes[i].id);
					//account_list_to_compute.push(nodes[i].id);
					score = false;
				}
				var color = getNodeColor(score);

				var new_x, new_y;
				// Using x=cos(2pi*fraction), y=sin(2pi*fraction) and the fraction increases
				// Deterministically with the node counter, essentially placing the
				// Nodes on a circle regardless of node count, this ensures that
				// Force atlas will produce the same graph for a given query every time
				new_x = Math.cos(2*Math.PI*(cnt/node_count));
				new_y = Math.sin(2*Math.PI*(cnt/node_count));
// console.debug(i);
				g.nodes.push({
					x: new_x,
					y: new_y,
					// We can also initialize Force Atlas with a randomized graph
					// But this will make visualizations look different every time
					// x: Math.random() * 10,
					// y: Math.random() * 10,
					orig_size: nodes[i].size,
					size: new_size, //Math.sqrt(Math.sqrt(nodes[i].size*10)),
					label: nodes[i].screenName,
					id: i, //nodes[i].screenName,
					node_id: cnt,
					color: color,//nodes[i].color,
					data: nodes[i]
				});
				nodes_id[i] = cnt;
				++cnt;
			}

			// We now order and prioritize the scores that need to be computed first
			// First we compute scores that have not ever been computed before
			var neverComputedLength = scores_never_computed_to_compute.length;
			for (var i = 0; i < neverComputedLength; i++) {
			    account_list_to_compute.push(scores_never_computed_to_compute[i]);
			}

	    // Then we compute stale scores
	    var staleLength = stale_scores_to_compute.length;
			for (var i = 0; i < staleLength; i++) {
			    account_list_to_compute.push(stale_scores_to_compute[i]);
			}

			// Populating bot update list with already updated scores first
			// Update bot update index to the point after this list
			score_stats.current_index = already_computed_account_list.length;
			for (var i = 0; i<score_stats.current_index; i++){
			    score_stats.user_list.push(already_computed_account_list[i])
			}

			// Then we add the bot scores that are stale or never obtained
			toComputeLen = account_list_to_compute.length;
			for (var i = 0; i<toComputeLen; i++){
			    score_stats.user_list.push(account_list_to_compute[i])
			}

			node_count = g.nodes.length;
			score_stats.total = node_count;

			//put edges into sigma
			var edgeIndex = 0;
			for (var i in nodes)
			{
				for (var j in nodes[i].outgoing)
				{
					g.edges.push({
							id: "e" + edgeIndex,
							source: i,
							target: j,

							source_screenName: nodes[i].screenName,
							target_screenName: nodes[j].screenName,

							from_node_id: nodes_id[i],
							to_node_id: nodes_id[j],
							size: (Number(nodes[i].outgoing[j].count)),
							type: "arrow",
							edge_type: nodes[i].outgoing[j].type,
							color: edge_colors[nodes[i].outgoing[j].type],//Giovanni said use a third color
							count: edgeIndex,
							min_tweet_created_at: nodes[i].outgoing[j].min_tweet_created_at,
							max_tweet_created_at: nodes[i].outgoing[j].max_tweet_created_at,
							outgoing_ids: nodes[i].outgoing[j].ids,
							incoming_ids: nodes[j].incoming[i].ids,
							url_raws: nodes[i].outgoing[j].url_raws,
							titles: nodes[i].outgoing[j].titles,
							tweet_types: nodes[i].outgoing[j].tweet_types
						});
					++edgeIndex;
				}
			}


			edge_count = g.edges.length;
	    }
	    catch(e)
	    {
	        console.debug(e);
	    }

		graph = g;
		drawGraph();
	    return graph;
	}

 // #     #                         #     #
 // #     #  ####  ###### #####     ##   ##  ####  #####    ##   #
 // #     # #      #      #    #    # # # # #    # #    #  #  #  #
 // #     #  ####  #####  #    #    #  #  # #    # #    # #    # #
 // #     #      # #      #####     #     # #    # #    # ###### #
 // #     # #    # #      #   #     #     # #    # #    # #    # #
 //  #####   ####  ###### #    #    #     #  ####  #####  #    # ######

	function GenerateUserModal(e)
	{
		var node = e.data.node.data;

		//new incoming edges, could be is_mentioned_by, has_quoted, has_retweeted
		var tweets = {
			is_mentioned_by: {},
			has_quoted: {},
			has_retweeted: {},
			has_mentioned: {},
			is_quoted_by: {},
			is_retweeted_by: {}
		};
		var counts = {
			is_mentioned_by_count:0,
			has_quoted_count:0,
			has_retweeted_count:0,
			has_mentioned_count:0,
			is_quoted_by_count:0,
			is_retweeted_by_count:0
		};

		for (var i in node.incoming)
		{
			var fromURL = 'https://twitter.com/intent/user?user_id='+String(i), //i,
				toURL = 'https://twitter.com/intent/user?user_id='+e.data.node.id;

			for (var j in node.incoming[i].ids)
			{
				var tweetURL = TWEET_URL.replace("%0", i).replace("%1", node.incoming[i].ids[j]);
				if (true != node.incoming[i].is_mentions[j] && false != node.incoming[i].is_mentions[j])
					console.log("GenerateUserModal Parse incoming.is_mentions error!!");
				var tweet_type = "";
				//if is_mention == true, or "reply"==tweet type, then must be a mention,
				if(true == node.incoming[i].is_mentions[j] || "reply" == node.incoming[i].tweet_types[j])
				{
					tweet_type = "is_mentioned_by";
				}
				else if ("quote" == node.incoming[i].tweet_types[j])
				{
					tweet_type = "has_quoted";
				}
				else if("retweet" == node.incoming[i].tweet_types[j])
				{
					tweet_type = "has_retweeted";
				}
				tweets[tweet_type][i] = tweets[tweet_type][i] || {user_url: fromURL, screenName: node.incoming[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				tweets[tweet_type][i].article_titles.push(node.incoming[i].titles[j]);
				tweets[tweet_type][i].tweet_urls.push(tweetURL);
				tweets[tweet_type][i].article_urls.push(node.incoming[i].url_raws[j]);
				counts[tweet_type + "_count"] ++;

			}
		}

		//new outgoing edges, could be has_mentioned, is_quoted_by, is_retweeted_by
		for (var i in node.outgoing)
		{
			var fromURL = 'https://twitter.com/intent/user?user_id='+e.data.node.id,
				toURL = 'https://twitter.com/intent/user?user_id='+String(i);

			for (var j in node.outgoing[i].ids)
			{
				var tweetURL = TWEET_URL.replace("%0", i).replace("%1", node.outgoing[i].ids[j]);
				if (true != node.outgoing[i].is_mentions[j] && false != node.outgoing[i].is_mentions[j])
					console.log("GenerateUserModal Parse outgoing.is_mentions error!!");
				var tweet_type = "";
				//if is_mention == true, or "reply"==tweet type, then must be a mention
				if(true == node.outgoing[i].is_mentions[j] || "reply" == node.outgoing[i].tweet_types[j])
				{
					tweet_type = "has_mentioned";
				}
				else if ("quote" == node.outgoing[i].tweet_types[j])
				{
					tweet_type = "is_quoted_by";
				}
				else if("retweet" == node.outgoing[i].tweet_types[j])
				{
					tweet_type = "is_retweeted_by";
				}
				tweets[tweet_type][i] = tweets[tweet_type][i] || {user_url: toURL, screenName: node.outgoing[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				tweets[tweet_type][i].article_titles.push(node.outgoing[i].titles[j]);
				tweets[tweet_type][i].tweet_urls.push(tweetURL);
				tweets[tweet_type][i].article_urls.push(node.outgoing[i].url_raws[j]);
				counts[tweet_type + "_count"] ++;
			}
		}
		node_modal_content.is_mentioned_by = tweets.is_mentioned_by;
		node_modal_content.has_quoted = tweets.has_quoted;
		node_modal_content.has_retweeted = tweets.has_retweeted;
		node_modal_content.has_mentioned = tweets.has_mentioned;

		node_modal_content.is_quoted_by = tweets.is_quoted_by;
		node_modal_content.is_retweeted_by = tweets.is_retweeted_by;

		node_modal_content.is_mentioned_by_count = counts.is_mentioned_by_count;
		node_modal_content.has_quoted_count = counts.has_quoted_count;
		node_modal_content.has_retweeted_count = counts.has_retweeted_count;
		node_modal_content.has_mentioned_count = counts.has_mentioned_count;
		node_modal_content.is_quoted_by_count = counts.is_quoted_by_count;
		node_modal_content.is_retweeted_by_count = counts.is_retweeted_by_count;


	}


 // ######                           #####
 // #     # #####    ##   #    #    #     # #####    ##   #####  #    #
 // #     # #    #  #  #  #    #    #       #    #  #  #  #    # #    #
 // #     # #    # #    # #    #    #  #### #    # #    # #    # ######
 // #     # #####  ###### # ## #    #     # #####  ###### #####  #    #
 // #     # #   #  #    # ##  ##    #     # #   #  #    # #      #    #
 // ######  #    # #    # #    #     #####  #    # #    # #      #    #

	function drawGraph() {



		// console.log("Drawing Sigma");
		// $('#graph-container').empty();

		s = new sigma({
			graph:graph,
	        container: 'graph-container',
	        renderer: {
	            // IMPORTANT:
	            // This works only with the canvas renderer, so the
	            // renderer type set as "canvas" is necessary here.
	            container: document.getElementById('graph-container'),
	            type: 'canvas'
	        },
	        settings: {
				autoRescale: true,
				scalingMode: "inside",
	            edgeHoverExtremities: true,
	            borderSize: 1,
	            minArrowSize: 6,
	            labelThreshold: 8,
	            enableEdgeHovering: true,
	            edgeHoverSizeRatio: 2,
	            singleHover: true,
				rescaleIgnoreSize: true,
				defaultNodeType: 'border',
                zoomingRatio: 1.2
	        }
	    });
		var jiggle_compensator = Math.floor(Math.sqrt(graph.edges.length)) *600;
		s.refresh({skipIndexation: true});
		s.startForceAtlas2({
	        slowDown: 100,
	        gravity: 2
	    });
		// console.debug(botscores);
		for(var i in botscores)
		{
			updateNodeColor(i, botscores[i].score);
		}

		// var that = this;
		// spinStart("ForceAtlas");

		spinStop("generateNetwork");
		setTimeout(function () {
            // getBotCacheScores();

			s.stopForceAtlas2();
			s.camera.goTo({x:0, y:0, ratio:1});
			spinStop("ForceAtlas");
			// spinStop("updateNetwork");
			spinner_notices.graph = "";

			// FilterEdges();

		}, 2000 + jiggle_compensator);

	    s.bind('clickNode', function (e) {
			var node = e.data.node.data;


			// console.debug(e.data);
	        //the following /**/ is for twitter user widget.
			// $('#myModalLabel').html('User:  <a target="_blank" href="https://twitter.com/intent/user?user_id='+e.data.node.id+'">@'+ node.screenName +'</a>');
			node_modal_content.user_id = e.data.node.id;
			node_modal_content.screenName = node.screenName;

			node_modal_content.staleAcctInfo.openedModalWhileFetchingScores = getting_bot_scores.running;

			var score = false;
			// console.debug(node.screenName, botscores[node.screenName], botscores);
			console.debug(node);
			if(botscores[node.id])
			{
				var bs = botscores[node.id];
				// console.debug(bs);
				score = botscores[node.id].score;
				score = Math.floor(score * 100);
				node_modal_content.botcolor = score != 0 ? getNodeColor(score/100) : "";
				node_modal_content.botscore = score;
				node_modal_content.timestamp = botscores[node.id].time;

				node_modal_content.staleAcctInfo.isStale = botscores[node.id].staleAcctInfo.isStale;
				node_modal_content.staleAcctInfo.newId = botscores[node.id].staleAcctInfo.newId;
				node_modal_content.staleAcctInfo.oldSn = botscores[node.id].staleAcctInfo.oldSn;
				node_modal_content.staleAcctInfo.newSn = botscores[node.id].staleAcctInfo.newSn;

				// updating the CAP score
				node_modal_content.completeAutomationProbability = botscores[node.id].completeAutomationProbability;
				node_modal_content.showStaleContent = true;
			}
			else
			{
				node_modal_content.showStaleContent = false;
				node_modal_content.botscore = false;
				node_modal_content.botcolor = "";
			}

			//insert tweets into modal body, grouped by individual to_user_id
			GenerateUserModal(e);

			//
			// $("#nodeModal").off('shown.bs.modal show.bs.modal');
			// $("#nodeModal").on("shown.bs.modal show.bs.modal", function(){
			// 	$(".modal-dialog").scrollTop(0);
			// });
			// // console.debug($("#myModal"));
			// $('#nodeModal').modal('toggle');
			toggle_node_modal();

	    });

		s.bind('clickEdge', function(e){
			var edge = e.data.edge;
			edge_modal_content.edge = edge;
			var tweet_urls = {};

			var tweet_types_hashtable = {"mention": 0, "quote": 0, "retweet": 0};
			for (var i =0; i < edge.outgoing_ids.length; ++i)
			{
				var type = edge.tweet_types[i];
				(type == "reply") ? type = "mention" : type;
				(type == "origin") ? type = "mention" : type;
				++tweet_types_hashtable[type];
				tweet_urls[edge.outgoing_ids[i]] = TWEET_URL.replace("%0", edge.target).replace("%1", edge.outgoing_ids[i]);
			}

			edge_modal_content.tweet_urls = tweet_urls;

			//show modal header, like  User A mentions, quotes, and labels B
			var label_string = "";
			var elemNum = 0;
			for (var key in tweet_types_hashtable)
			{
				if (tweet_types_hashtable.hasOwnProperty(key) && tweet_types_hashtable[key] > 0)
				{
					(0 == elemNum++) ? (label_string += " ") : (label_string += ", ");
					if("mention" == key)
						label_string += "mentioned";
					else if ("retweet" == key)
						label_string += "was retweeted by";
					else if ("quote" == key)
						label_string += "was quoted by";
				}
			}

			edge_modal_content.label_string = label_string;
			// $("#edgeModal").off('shown.bs.modal show.bs.modal');
			// $("#edgeModal").on("shown.bs.modal show.bs.modal", function(){
			// 	$(".modal-dialog").scrollTop(0);
			// });
			//
			// $('#edgeModal').modal('toggle');
			toggle_edge_modal();

		});
	}

	function zoomIn(){
		var c = s.camera;
		// Zoom in - animation :
		sigma.misc.animation.camera(c, {
			ratio: c.ratio / c.settings('zoomingRatio')
		}, {
			duration: 200
		});
		c.goTo({
			ratio: c.ratio / c.settings('zoomingRatio')
		});
	}
	function zoomOut(){
		var c = s.camera;
		// Zoom out - animation :
		sigma.misc.animation.camera(c, {
			ratio: c.ratio * c.settings('zoomingRatio')
		}, {
			duration: 200
		});
		c.goTo({
			ratio: c.ratio * c.settings('zoomingRatio')
		});
	}
	function redraw(){
        if(s && s.camera)
        {
    		var c = s.camera;
    		// Zoom out - animation :
    		sigma.misc.animation.camera(c, {
    			ratio: c.ratio
    		}, {});
    		c.goTo({
    			ratio: c.ratio
    		});
        }
	}


	(function(undefined) {

		/**
		* Sigma Node Border Custom Renderer
		* ==================================
		*
		* The aim of this simple node renderer is to enable the user to display
		* colored node borders.
		*
		* Author: Guillaume Plique (Yomguithereal)
		* Version: 0.0.1
		*/

		sigma.canvas.nodes.border = function(node, context, settings) {
			var prefix = settings('prefix') || '';

			context.fillStyle = node.color || settings('defaultNodeColor');
			context.beginPath();
			context.arc(
				node[prefix + 'x'],
				node[prefix + 'y'],
				node[prefix + 'size'],
				0,
				Math.PI * 2,
				true
			);

			context.closePath();
			context.fill();

			context.lineWidth = 0.5; //node.borderWidth || .5;
			context.strokeStyle = node.borderColor || getBorderColor(false)
			context.stroke();
		};
	}).call(this);


 // #######
 // #       # #      ##### ###### #####
 // #       # #        #   #      #    #
 // #####   # #        #   #####  #    #
 // #       # #        #   #      #####
 // #       # #        #   #      #   #
 // #       # ######   #   ###### #    #

	function FilterEdges(filterTimestamp){

		// if(!filterTimestamp)
		// {
		// 	var filterDate = new Date();
		// 	filterTimestamp = filterDate.getTime();
		// }
		filterTimestamp = filterTimestamp || timespan.end_time;
		var count = 0;
		var filtered_count = 0;
		var unfiltered_nodes = [];

		var edges = s.graph.edges();
		var nodes = s.graph.nodes();

		var edge_colors = {
			"fact_checking": colors.edge_colors.fact_checking,
			"claim": colors.edge_colors.claim,
		};





		// g.nodes.push({
		//
		// 	x: 0,
		// 	y: 0,
		// 	size: 10, //Math.sqrt(Math.sqrt(nodes[i].size*10)),
		// 	id: "fake_node", //nodes[i].screenName,
		// 	node_id: "fake_node",
		// 	color: "#ffffff",//nodes[i].color,
		// });

		// var nodes_id = {};
		// var cnt = 0;
		// for (var i in nodes)// i is index
		// {
		// 	var percent = Math.sqrt(nodes[i].size) / Math.sqrt(max_size);
		// 	var new_size = (percent * 1000) + 1;
		// 	if(new_size < 300)
		// 	{
		// 		new_size = 300;
		// 	}
		// 	var score = botscores[nodes[i].screenName];
		// 	if(score && score.score)
		// 	{
		// 		score = score.score;
		// 	}
		// 	else
		// 	{
		// 		score = false;
		// 	}
		// 	var color = getNodeColor(score);
        //
		// 	node_count = node_count / 2;
		// 	var new_x, new_y;

		var unfiltered_node_edge_counts = {};
		var max_size = 0;
		var min_size = 0;
		var node_count = 0;

		for(var i in edges)
		{
			var edge = edges[i];

			count ++;
			if(edge.min_tweet_created_at >= filterTimestamp)
			{
				//filtered
				filtered_count ++;
				edge.color =  "rgba(0,0,0,.05)";
			}
			else
			{
				//not filtered
				unfiltered_node_edge_counts[edge.target] = unfiltered_node_edge_counts[edge.target] || 0;
				unfiltered_node_edge_counts[edge.source] = unfiltered_node_edge_counts[edge.source] || 0;

				unfiltered_node_edge_counts[edge.target] += 1;
				unfiltered_node_edge_counts[edge.source] += 1;

				edge.color = edge_colors[edge.edge_type];
				unfiltered_nodes.push(edge.target);
				unfiltered_nodes.push(edge.source);

			}
		}

		for(var i in unfiltered_node_edge_counts)
		{
			node_count ++;
			if(unfiltered_node_edge_counts[i] > max_size)
			{
				max_size = unfiltered_node_edge_counts[i];
			}
			if(unfiltered_node_edge_counts[i] < min_size)
			{
				min_size = unfiltered_node_edge_counts[i];
			}
		}

		for(var i in nodes)
		{
			var node = nodes[i];



			if(unfiltered_nodes.indexOf(node.id) === -1)
			{
				//filtered

				node.color = "rgba(0,0,0,.05)";
				node.borderColor = "rgba(0,0,0,.05)";

				var percent = Math.sqrt(min_size) / Math.sqrt(max_size);
				var new_size = (percent * 1000) + 1;
				if(new_size < 300)
				{
					new_size = 300;
				}

				node.size = new_size;
			}
			else
			{
				//not filtered

				var percent = Math.sqrt(unfiltered_node_edge_counts[node.id]) / Math.sqrt(max_size);
				var new_size = (percent * 1000) + 1;
				if(new_size < 300)
				{
					new_size = 300;
				}

				node.size = new_size;

				score = false;
				if(botscores[node.id])
				{
					score = botscores[node.id].score;
				}
				updateNodeColor(node.id, score);
				// console.debug(node.id, botscores[node.id]);
			}
		}
		// console.debug("filter", filterTimestamp);
		refreshGraph();
	}

	graphAnimation.playing = false;
	graphAnimation.paused = false;
	graphAnimation.increment = 0;
	var animationTimeout = 0;
	function AnimateFilter(timestamp)
	{
		graphAnimation.current_timestamp = timestamp;
		FilterEdges(timestamp);

		//Stop animating if it's past the end_time of the graph.
		if(timestamp > timespan.end_time || graphAnimation.increment > graphAnimation.total_increments)
		{
			FilterEdges((new Date()).getTime());
			graphAnimation.increment = 0;
			graphAnimation.playing = false;
			return false;
		}

		var increment = (timespan.end_time - timespan.start_time) / graphAnimation.total_increments;
		// if(increment < 86400000)
		// {
		// 	increment = 86400000; //min resolution is one day.
		// }

		var new_timestamp = timestamp + increment; //(86400 * 1000); //decrement one day

		animationTimeout = setTimeout(function(){
			graphAnimation.increment += 1;
			AnimateFilter(new_timestamp);
		}, 120);
	}
	function StartAnimation()
	{
		console.debug(timespan);
		graphAnimation.increment = 1;
		graphAnimation.playing  = true;
		graphAnimation.paused = false;
		AnimateFilter(timespan.start_time);
		console.debug(graphAnimation.current_timestamp);
	}

	function StopAnimation(){
		clearTimeout(animationTimeout);
		// If the timeline has been animated before we want to bring the tick to the end and show all edges
		if (graphAnimation.current_timestamp > timespan.start_time) {
			FilterEdges((new Date()).getTime());
		}

		graphAnimation.playing  = false;
		graphAnimation.paused = false;
		console.debug(graphAnimation.current_timestamp);
	}
	function PauseAnimation(){
		clearTimeout(animationTimeout);
		graphAnimation.paused = true;
		console.debug(graphAnimation.current_timestamp);
		console.debug("PAUSE");
	}
	function UnpauseAnimation(){
		graphAnimation.paused = false;
		AnimateFilter(graphAnimation.current_timestamp);
		console.debug(graphAnimation.current_timestamp);
	}


 // ######
 // #     # ###### ##### #    # #####  #    #
 // #     # #        #   #    # #    # ##   #
 // ######  #####    #   #    # #    # # #  #
 // #   #   #        #   #    # #####  #  # #
 // #    #  #        #   #    # #   #  #   ##
 // #     # ######   #    ####  #    # #    #


	console.debug("Graph initialized");

	returnObj.filter = FilterEdges;
	returnObj.startAnimation = StartAnimation;
	returnObj.stopAnimation = StopAnimation;
	returnObj.pauseAnimation = PauseAnimation;
	returnObj.unpauseAnimation = UnpauseAnimation;

	returnObj.updateEdges = UpdateEdges;
	returnObj.updateGraph = UpdateGraph;
	returnObj.getNewScores = getNewScores;
	// returnObj.getBotCacheScores = getBotCacheScores;
	returnObj.getNodeColor = getNodeColor;
	returnObj.updateUserBotScore = updateUserBotScore;
	returnObj.zoomIn = zoomIn;
	returnObj.zoomOut = zoomOut;
	returnObj.redraw = redraw;
	returnObj.getEdges = function(){ return edges; };
	returnObj.botscores = function(){ return botscores; };

	returnObj.score_stats = score_stats;
	//Used for taking snapshot of graph
	returnObj.getRenderer = getRenderer;

	return returnObj;




}
