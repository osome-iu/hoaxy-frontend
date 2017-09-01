function HoaxyGraph(options)
{
	var returnObj = {};

	var spinStart = options.spinStart || function(){ console.log("HoaxyGraph.spinStart is undefined."); };
	var spinStop = options.spinStop || function(){ console.log("HoaxyGraph.spinStop is undefined."); };
	var toggle_edge_modal = options.toggle_edge_modal || function(){ console.log("HoaxyGraph.toggle_edge_modal is undefined."); };
	var toggle_node_modal = options.toggle_node_modal || function(){ console.log("HoaxyGraph.toggle_node_modal is undefined."); };
	var node_modal_content = options.node_modal_content || {};
	var edge_modal_content = options.edge_modal_content || {};
	var twitter_account_info = options.twitter_account_info || {};

	var s = null; //sigma instance

	var graph = {};
	var edges = [];
	var user_list = [];
	var botscores = {};

	function UpdateEdges(new_edges){
		edges = new_edges;
		console.debug("Edges updated.");

		if(twitter_account_info.token)
		{
			getBotCacheScores();
		}
		return edges;
	}

	function getBotCacheScores(user_list){
		this.spinStart("getBotCacheScores");
		//build list of users found in the edge list
		for(var i in edges)
		{
			var edge = edges[i],
				from_user_id = edge.from_user_id,
				to_user_id = edge.to_user_id;
			user_list.length = 0;
			if(user_list.indexOf(from_user_id) < 0)
			{
				user_list.push(from_user_id);
			{
			if(user_list.indexOf(to_user_id) < 0)
			{
				user_list.push(to_user_id);
			}
		}
		var botcache_request = axios.get(configuration.botcache_url, {
			data: {
				"user_ids" : user_list
			}
		});
		botcache_request.then(
			function(response){
				spinStop("getBotCacheScores");
				for(var i in response.data.scores)
				{
					var user = response.data.scores[i];
					updateUserBotScore(user);
				}
			},
			function (error) {
				console.log('Botometer Scores Request Error: ', error.response.statusText);
				spinStop("getBotCacheScores");
			}
		);
		return botcache_request;
	}
	function updateUserBotScore(user)
	{
		//if exists and fresh
		if(user.score)
		{
			botscores[user.user_id] = user.score;
			updateNodeColor(user.user_id, user.score);
		}
		//if score is stale or does not exist
		if(!user.score || user.old)
		{
			getNewBotometerScore(user.user_id);
		}
	}

	function getNewBotometerScore(user_id)
	{
		var twitter_timeline_request = axios.get(configuration.twitter_search_url, {
			data: {
				"user_id" : user_id
			}
		});
		twitter_timeline_request.then(function(response){
			var botometer_request = axios.get(configuration.botometer_url, {
				data: {
					timeline: response.data.timeline
				}
			});
			botometer_request.then(function(response){
				botscores[user_id] = response.data.score;
				updateNodeColor(user_id, response.data.score);
			}, function(error){

			});
		}, function(error){

		});


	}
	function updateNodeColor(user.user_id, user.score)
	{
		//change node color on graph based on botscore
	}


	function UpdateGraph(start_time, end_time)
	{
		// spinStart("updateNetwork");
		console.debug("Updating Graph");
		console.debug(edges);
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
					from_user_id = edge.from_user_id,
					to_user_id = edge.to_user_id,
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
	            g.nodes.push({
	                x: Math.random(),
					y: Math.random(),
	                size: nodes[i].size,
	                label: nodes[i].screenName,
	                id: i,
					node_id: cnt,
	                color: nodes[i].color,
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

		if(s)
		{
			s.kill();
			s = null;
			// console.debug("Killed Existing Sigma");
		}

		// console.log("Drawing Sigma");
		// $('#graph-container').empty();
		document.getElementById("graph-container").innerHTML = "";

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
	            borderSize: 2,
	            minArrowSize: 6,
	            labelThreshold: 8,
	            enableEdgeHovering: true,
	            edgeHoverSizeRatio: 2,
	            singleHover: true,
				rescaleIgnoreSize: true
	        }
	    });
		var jiggle_compensator = Math.floor(Math.sqrt(graph.edges.length)) *600;
		s.refresh({skipIndexation: true});
		s.startForceAtlas2({
	        slowDown: 100,
	        gravity: 2
	    });
		spinStart("ForceAtlas");
		setTimeout(function () {
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


	console.debug("Graph initialized");

	returnObj.updateEdges = UpdateEdges;
	returnObj.updateGraph = UpdateGraph;
	returnObj.zoomIn = zoomIn;
	returnObj.zoomOut = zoomOut;
	returnObj.getEdges = function(){ return edges; };
	return returnObj;



}
