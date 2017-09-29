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
	var twitter = options.twitter || null;
	var getting_bot_scores = options.getting_bot_scores || false;

	var s = null; //sigma instance
	// getNodeColor(.25);
	var graph = {};
	var edges = [];
	var user_list = [];
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

	function getBotCacheScores()
    {
		// spinStart("getBotCacheScores");
		user_list.length = 0;
		//build list of users found in the edge list
		for(var i in edges)
		{
			var edge = edges[i],
				from_user_screen_name = edge.from_user_screen_name,
				to_user_screen_name = edge.to_user_screen_name;
			if(user_list.indexOf(from_user_screen_name) < 0)
			{
				user_list.push(from_user_screen_name);
			}
			if(user_list.indexOf(to_user_screen_name) < 0)
			{
				user_list.push(to_user_screen_name);
			}
		}

		var botcache_request = axios({
			method: 'post',
			url: configuration.botcache_url,
			responseType: "json",
			data: {
				"screen_name": user_list.join(",")
			}
		});
		botcache_request.then(
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
						var score = user.scores.english;
						botscores[sn] = {score: score, old: !user.fresh};
                        updateNodeColor(sn, score);
					}
				}

				//when we get the cache, go through cache and update botscores:
				//botscore[sn] = {score: xx, old: false/true};

				// spinStop("getBotCacheScores");
			},
			function (error) {
				console.log('Botometer Scores Request Error: ', error);
				spinStop("getBotCacheScores");
			}
		);

		return botcache_request;


	}

	var counter = 0;
	var current_index = 0;
    function getNewScores(){
		getting_bot_scores.running = true;
		counter = 20;
		console.debug(current_index);
		getBotScoreTimer(current_index);
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
			current_index = index;
			console.debug("got some botscores:", botscores);
			getting_bot_scores.running = false;
			return false;
		}
		else
		{
			counter -= 1;
		}

		if(index >= user_list.length)
		{
			console.debug(botscores);
			console.debug("end of list");
			getting_bot_scores.running = false;
			return false;
		}

		var sn = user_list[index];
		var user = {screen_name: sn};
		if(botscores[sn])
		{
			user.score = botscores[sn].score;
			user.old = botscores[sn].old;
		}

		updateUserBotScore(user);
		// console.debug(user);
		index ++;
		return setTimeout(function(){
			// console.debug("get Another one");
			getBotScoreTimer(index);
		}, 1000);
	}

	function updateUserBotScore(user)
	{
		var prom = new Promise(function(resolve, reject){
			// var prom = null;
			//if exists and fresh
			if(user.score)
			{
				updateNodeColor(user.screen_name, user.score);
				resolve();
			}
			//if score is stale or does not exist
			if(!user.score || user.old)
			{
				var botProm = getNewBotometerScore(user.screen_name);
				botProm.then(resolve, function(){
					botscores[user.screen_name] = {
						score: -1,
						old: true
					}
					updateNodeColor(user.screen_name, botscores[user.screen_name].score);
					reject();
				});
			}
		})
		.then(function(response){ return response; }, function(error){ return error; });
		return prom;
	}
	function twitterResponseFail(error){
		console.warn(error);
	}
	function getNewBotometerScore(screen_name)
	{
		var user = {};
		botScoreA = new Promise(function(resolve, reject){
			var user_data = twitter.getUserData(screen_name);
			user_data.then(function(response){
				user.user = response;
			}, function(){})
			.catch(twitterResponseFail);
			var user_timeline = twitter.getUserTimeline(screen_name);
			user_timeline.then(function(response){
				user.timeline = response;
			}, function(){})
			.catch(twitterResponseFail);
			var user_mentions = twitter.getUserMentions(screen_name);
			user_mentions.then(function(response){
				user.mentions = response;
			}, function(){})
			.catch(twitterResponseFail);

			var got_from_twitter = Promise.all([user_data, user_timeline, user_mentions]);
			got_from_twitter.then(function(values){
				var botScore = getBotScore(user);
				botScore.then(resolve, reject);
			}, function(error){
				console.warn("Could not get bot score for " + screen_name + ": ", error);
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
	function getBotScore(user_object)
	{
		var sn = user_object.user.screen_name;
		var botscore = axios({
			method: 'post',
			url: configuration.botometer_url,
			headers: configuration.botometer_headers,
			responseType: "json",
			data: user_object
		});
		botscore.then(function(response){
			botscores[sn] = {
				score: response.data.scores.english,
				old: false
			}
			updateNodeColor(sn, botscores[sn].score);
		},
		function(error){
			console.debug("Could not get bot score for " + sn + ": ", error);

		});
		return botscore;
	}
	function updateNodeColor(screen_name, score)
	{
        // setTimeout(function(){
            color = getNodeColor(score);
    		//change node color on graph based on botscore
            if(s && s.graph)
            {
    			var node = s.graph.nodes(screen_name);
    			// console.debug(screen_name, score,color, node);
    			if(node)
    			{
    	    		s.graph.nodes(screen_name).color = color;
    	    		s.graph.nodes(screen_name).borderColor = getBorderColor(score);
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
		// var node_colors = [
		// 	{red: 109, green: 7, blue: 7} ,
		// 	{red: 168, green: 116, blue: 53} ,
		// 	{red: 178, green: 178, blue: 48} ,
		// 	{red: 166, green: 229, blue: 153} ,
		// 	{red: 216, green: 241, blue: 255},
		// ];
		var node_colors = colors.node_colors.botscores;
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


		score2 = 0
		if(score < 30)
		{
			color1 = node_colors[4];
			color2 = node_colors[3];

			score2 = (score - 0) / (30 - 0);
		}
		else if(score < 50)
		{
			color1 = node_colors[3];
			color2 = node_colors[2];
			score2 = (score - 30) / (50 - 30)
		}
		else if(score < 70)
		{
			color1 = node_colors[2];
			color2 = node_colors[1];
			score2 = (score - 50) / (70 - 50);
		}
		else
		{
			color1 = node_colors[1];
			color2 = node_colors[0];
			score2 = (score - 70) / (100 - 70);
		}

		// if(score < 50)
		// {
		// 	color1 = node_colors[2];
		// 	color2 = node_colors[1];
		//
		// 	score2 = (score - 0) / (50 - 0);
		// }
		// else
		// {
		// 	color1 = node_colors[1];
		// 	color2 = node_colors[0];
		// 	score2 = (score - 50) / (100 - 50)
		// }

		// if(score < 33)
		// {
		// 	color1 = node_colors[3];
		// 	color2 = node_colors[2];
		//
		// 	score2 = (score - 0) / (33 - 0);
		// }
		// else if(score < 66)
		// {
		// 	color1 = node_colors[2];
		// 	color2 = node_colors[1];
		//
		// 	score2 = (score - 33) / (66 - 33);
		// }
		// else
		// {
		// 	color1 = node_colors[1];
		// 	color2 = node_colors[0];
		// 	score2 = (score - 66) / (100 - 66)
		// }
		// console.debug(score, score2);

		score2 = score2;
		var r = Math.floor(color1.red + score2 * (color2.red - color1.red))//.toString(16);
		var g = Math.floor(color1.green + score2 * (color2.green - color1.green))//.toString(16);
		var b = Math.floor(color1.blue + score2 * (color2.blue - color1.blue))//.toString(16);
		// if(r.length < 2) r = "0"+r;
		// if(g.length < 2) g = "0"+g;
		// if(b.length < 2) b = "0"+b;
		// var color = "#"+r+g+b;
		var color = {r: r, g: g, b: b};
		// console.debug(color);
		return color;


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


	function UpdateGraph(start_time, end_time)
	{
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

		var node_count = 0, edge_count=0;
	    try
	    {
			//create nodes[] data structure to hold info.
	        for (var i in edges)
	        {
	            var edge = edges[i],
					from_user_id = edge.from_user_screen_name,
					to_user_id = edge.to_user_screen_name,
					tweet_id = edge.tweet_id,
					tweet_type = edge.tweet_type,
					is_mention = edge.is_mention,
					tweet_created_at = (new Date(edge.tweet_created_at.substring(0, 10))).getTime();

					//filter edges not fall into [start_time, end_time]
					// if (tweet_created_at < start_time || tweet_created_at > end_time)
					// 	continue;

					if(start_time && tweet_created_at < start_time)
						continue;
					if(end_time && tweet_created_at > end_time)
						continue;

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

			//put nodes into sigma
			var nodes_id = {};
			var cnt = 0;
	        for (var i in nodes)// i is index
	        {
				var score = botscores[nodes[i].screenName];
				if(score && score.score)
				{
					score = score.score;
				}
				else
				{
					score = false;
				}
				var color = getNodeColor(score);
	            g.nodes.push({
	                x: Math.random(),
					y: Math.random(),
	                size: Math.sqrt(nodes[i].size*3),
	                label: nodes[i].screenName,
	                id: nodes[i].screenName,
					node_id: cnt,
	                color: color,//nodes[i].color,
	                data: nodes[i]
	            });
				nodes_id[i] = cnt;
				++cnt;
	        }
			node_count = g.nodes.length;

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
							size: Number(nodes[i].outgoing[j].count),
							type: "arrow",
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
			var fromURL = 'https://twitter.com/intent/user?user_id='+i,
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
				toURL = 'https://twitter.com/intent/user?user_id='+i;

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
				defaultNodeType: 'border'
	        }
	    });
		var jiggle_compensator = Math.floor(Math.sqrt(graph.edges.length)) *600;
		s.refresh({skipIndexation: true});
		s.startForceAtlas2({
	        slowDown: 100,
	        gravity: 2
	    });
		console.debug(botscores);
		for(var i in botscores)
		{
			updateNodeColor(i, botscores[i].score);
		}


		spinStart("ForceAtlas");
		setTimeout(function () {
            // getBotCacheScores();

			s.stopForceAtlas2();
			s.camera.goTo({x:0, y:0, ratio:1});
			spinStop("ForceAtlas");
			// spinStop("updateNetwork");
			spinStop("generateNetwork");
		}, 2000 + jiggle_compensator);

	    s.bind('clickNode', function (e) {
			var node = e.data.node.data;
	        //the following /**/ is for twitter user widget.
			// $('#myModalLabel').html('User:  <a target="_blank" href="https://twitter.com/intent/user?user_id='+e.data.node.id+'">@'+ node.screenName +'</a>');
			node_modal_content.user_id = e.data.node.id;
			node_modal_content.screenName = node.screenName;

			var score = false;
			// console.debug(node.screenName, botscores[node.screenName], botscores);
			if(botscores[node.screenName])
			{
				score = botscores[node.screenName].score;
				score = Math.floor(score * 100);
				node_modal_content.botcolor = score != 0 ? getNodeColor(score/100) : "";
				node_modal_content.botscore = score;
			}
			else
			{
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


	;(function(undefined) {

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

			context.lineWidth = node.borderWidth || 1;
			context.strokeStyle = node.borderColor || getBorderColor(false)
			context.stroke();
		};
	}).call(this);




	console.debug("Graph initialized");

	returnObj.updateEdges = UpdateEdges;
	returnObj.updateGraph = UpdateGraph;
	returnObj.getNewScores = getNewScores;
	// returnObj.getBotCacheScores = getBotCacheScores;
	returnObj.getNodeColor = getNodeColor;
	returnObj.updateUserBotScore = updateUserBotScore;
	returnObj.zoomIn = zoomIn;
	returnObj.zoomOut = zoomOut;
	returnObj.getEdges = function(){ return edges; };
	returnObj.botscores = function(){ return botscores; };
	return returnObj;



}
