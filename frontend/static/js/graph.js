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
	var spinner_notices = options.spinner_notices || {};
	var twitter = options.twitter || null;
	var getting_bot_scores = options.getting_bot_scores || false;
	var graphAnimation = options.graphAnimation || {playing: false, increment: 0, total_increments: 40};
	var twitterRateLimitReached = options.twitterRateLimitReached;
	var lang = "";

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

    /**
     * Reset all botscore counts to 0
     */
    reset: function(){
			this.total = this.found = this.old = this.unavailable = 0;
    },
    
    /**
     * Figure out the total number of botscores collected
     */
		recompute: function(){
			this.found = this.old = this.unavailable = 0;
			for(var i in botscores)
			{
        if (this.user_list.indexOf(i) > -1) 
        {
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


	var sigmaInstance = null;
	var graph = {};
	var edges = [];
	var user_id_list = [];
	var botscores = {};

	var numSigmaInstancesLaunched = 0;

  /**
   * Update edges on the graph
   * @param  {Object[]} newEdges The edges to be placed on the graph
   * @return {Object[]} The edges that are on the graph at the end of the function
   */
	function UpdateEdges(newEdges){
		edges = newEdges;
		if(edges.length === 0)
		{
			KillGraph();
			return edges;
		}
		return edges;
	}
	var retry_count = 0;

  /**
   * Handles imported bot scores from CSV/JSON
   * @param  {String} importedID The imported ID of the user
   * @param  {Number} importedBotscore The imported botscore of the user
   */
	function setBotScore(importedID, importedBotscore)
	{
		botscores[importedID] = {score: importedBotscore, user_id: importedID};
  }
  
  /**
   * Get bot scores from the cache
   */
	function getBotCacheScores()
    {
		if(graph.nodes === undefined)
		{
			setTimeout(function(){getBotCacheScores();}, 100);
			return false;
		}
		getting_bot_scores.running = true;
		score_stats.user_list.length = 0;
		user_id_list.length = 0;
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

		var botcache_chunk_sizes = configuration.botcache_chunk_sizes;
		start_index = 0;
		end_index = 0;

		var sorted_nodes = graph.nodes.sort(function(gifford, carell){
			if(gifford.orig_size > carell.orig_size)
			{
				return -1;
			}
			else if (gifford.orig_size < carell.orig_size)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		});
    var sorted_user_ids = [];
    
		for(var i in graph.nodes)
		{
			sorted_user_ids.push(graph.nodes[i].id);
    }
    
		for(i=0; i < botcache_chunk_sizes.length; i++)
		{
			var chunk_size = botcache_chunk_sizes[i];
			
			start_index = end_index;
			end_index = end_index + chunk_size;

      var user_id_list_chunk = sorted_user_ids.slice(start_index, end_index);
			if(user_id_list_chunk.length === 0)
			{
				break;
      }
      
			var botcache_request = axios({
				method: 'post',
				url: configuration.botcache_url,
				responseType: "json",
				data: {
					"user_id": user_id_list_chunk.join(",")
				}
			});

			botcache_request
			.then(
				function(response)
				{
					var results = response.data.result;
					for(var i in results)
					{
						var user = results[i];
						if(user)
						{
							var sn = user.user.screen_name;
							var id = user.user.id;
							var score = 0;
							if(lang == 'en' || lang == 'en-gb')
							{	
								score = user.scores.english;
							}
							else
							{
								score = user.scores.universal;
							}
							
							botscores[id] = {score: score, old: !user.fresh, time: new Date(user.timestamp), user_id: user.user.id, screen_name: sn };
							updateNodeColor(id, score);
						}
					}

					score_stats.unavailable = 0;
					score_stats.old = 0;
					score_stats.found = 0;

					var already_computed_account_list = [];
					var stale_scores_to_compute = [];
					var scores_never_computed_to_compute = [];
					var account_list_to_compute = [];

					score_stats.user_list = [];

					for (var i in graph.nodes)
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
			},
			function (error) {
					getting_bot_scores.running = false;
					console.warn('Botometer Scores Request Error: ', error);

					// if it's a network error, retry a maximum of 5 times
					// if it was the expected 502, the second try will probably succeed.
					// if(error.message === "Network Error" && retry_count < 5)
					try {
						if(retry_count < 5)
						{
							retry_count += 1;
							getBotCacheScores();
						}
					}
					catch(e){
						console.warn(e);
					}
				}
			);
		}
		return botcache_request;
	}

	var counter = 0;

  /**
   * Get fresh bot scores, 20 per batch
   */
  function getNewScores()
  {
		getting_bot_scores.running = true;
		counter = 20;
		getBotScoreTimer(score_stats.current_index);
  }

  /**
   * Gets a new botscore every second to avoid quickly hitting the rate limit
   * @param  {Number} index The index for the botscores; avoids repeat score queries
   * @return {Boolean | Function} Returns setTimeout(), or false if no scores left
   */
  function getBotScoreTimer(index)
	{
		if(counter <= 0)
		{
			score_stats.current_index = index;
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

    var id = ""
    var node = ""
    var sn = ""
    var user = ""

    console.log(score_stats.user_list)
    
    if(score_stats.user_list[index] && score_stats.user_list[index] != undefined)
    {
      id = score_stats.user_list[index];
      node = s.graph.nodes(id);
      sn = node.data.screenName;
		  user = {screen_name: sn, user_id: id};
    }
    else
    {
      index++;
      return setTimeout(function(){
        // console.debug("get Another one");
        getBotScoreTimer(index);
      }, 1000);
    }
    
		if(botscores[id])
		{
			user.score = botscores[id].score;
			user.old = botscores[id].old;
		}

		var success = new Promise(function(resolve, reject){
			updateUserBotScore(user).then(resolve, reject).catch( error =>  console.log(error) );
		});
		success.then(function(response){
			if (response === "Error: rate limit reached") {
				twitterRateLimitReached.isReached = true;
			} else {
				// Resuming the rate limit as we have successfully
				// retrieved a bot score
				twitterRateLimitReached.isReached = false;
			}
		}).catch( error =>  console.log(error) );

		// console.debug(user);
		index++;
		return setTimeout(function(){
			// console.debug("get Another one");
			getBotScoreTimer(index);
		}, 1000);
	}

  /**
   * Update an individual, specific user's botscore
   * @param  {Object} user The user to update the botscore for
   * @return {Promise} Successful botscore update (or not)
   */
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
			// if exists and fresh
			if(user.score)
			{
				updateNodeColor(user.user_id, user.score);
				resolve();
			}
			// if score is stale or does not exist
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

  /**
   * If the twitter promise in getNewBotometerScore fails,
   * warn in the console with a detailed error.
   * @param  {Object} error The twitter error
   */
	function twitterResponseFail(error){
		console.error(error&&error.error&&error.error.status);
		console.warn(error);
  }

  /**
   * Get individual scores from Botometer based on user_id
   * @param  {Number} user_id The twitter user's user ID
   * @return {Promise} The botscore of the user
   */
	function getNewBotometerScore(user_id)
	{
		var user = {};
		var node = sigmaInstance.graph.nodes(user_id);
		var screen_name = node.data.screenName;
		botScoreA = new Promise(function(resolve, reject){
			// Bulking user data and mentions promises together as they need
			// To happen sequentially
			var user_data_and_mentions = new Promise(
        function(resolve, reject) {
          var user_data = twitter.getUserDataById(user_id);
          user_data
          .then(
            function(response) {
              user.user = response;
              var user_mentions = twitter.getUserMentions(user.user.screen_name);
              user_mentions
              .then(
                  function(responseMentions) {
                    if (responseMentions.statuses) user.mentions = responseMentions.statuses;
                    else user.mentions = responseMentions;
                    // Both user data and mentions was retrieved, so resolving
                    // user_data_and_mentions promise
                    resolve();
                  },
                  function(error) {
                    twitterResponseFail(error);
                    reject(error);
                  }
              );
            },
            function(error) {
              twitterResponseFail(error);
              reject(error);
            }
          );
        }
			);
      // Can happen asynchronously
      var user_timeline = twitter.getUserTimelineById(user_id);
      user_timeline
      .then(
        function(response) {
          user.timeline = response;
        },
        function(error) {
          twitterResponseFail(error);
        }
      );

			var got_from_twitter = Promise.all([user_data_and_mentions, user_timeline]);
			got_from_twitter.then(function(values){
				var botScore = getBotScore(user, screen_name);
				botScore.then(resolve, reject);
      }, 
      function(error){
				console.warn("Could not get bot score for " + screen_name + ": ", error, error&&error.error&&error.error.status);
				
				if(error&&error.error&&error.error.status == 429)
				{
					twitterRateLimitReached.isReached = true;
				}
				reject(error);
			});
		});
		return botScoreA;
  }

  /**
   * Get the botscore (and maybe fresh screenname) of the user
   * @param  {Object} user_object The user object (containing ID, screenname, etc.)
   * @param  {String} potentially_old_sn The user's screenname
   * @return {Number} The botscore of the user
   */
	function getBotScore(user_object, potentially_old_sn)
	{
		var sn = user_object.user.screen_name;
		var id = user_object.user.id_str;
		//console.debug(user_object);
		var botscore = axios({
			method: 'post',
			url: configuration.botometer_url,
			headers: configuration.botometer_headers,
			responseType: "json",
			data: user_object
		});
		botscore.then(function(response){
			// Storing the consistent account info for this given bot score retrieval
			var newId = response.data.user.id_str;
			var newScore = 0;
			if(lang == 'en' || lang == 'en-gb')
						{	
				newScore = response.data.scores.english;
			}
			else
			{
				console.log("hit universal: " + response.data.scores);
				newScore = response.data.scores.universal;
			}

			if (potentially_old_sn != response.data.user.screen_name) {
				var oldSn = potentially_old_sn;
				var newSn = response.data.user.screen_name;
				var isStale = true;
			} else {
				var oldSn = potentially_old_sn;
				var newSn = 'unchanged';
				var isStale = false;
			}

			var completeAutomationProbability =
				Math.round(response.data.cap.english * 100);

			// Storing consistent account information to the global modal content
			node_modal_content.staleAcctInfo.newId = newId;
			node_modal_content.staleAcctInfo.oldSn = oldSn;
			node_modal_content.staleAcctInfo.newSn = newSn;
			node_modal_content.staleAcctInfo.isStale = isStale;
			node_modal_content.completeAutomationProbability = completeAutomationProbability;

			// Storing consistent account information to a global cache
			botscores[id] = {
				score: newScore,
				old: false,
				time: new Date(),
				user_id: response.data.user.id,
				screen_name: sn,
				completeAutomationProbability:
					completeAutomationProbability,
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
		},
		function(error){
			console.debug("Could not get bot score for " + sn + ": ", error);
		});

    return botscore;
  }

  /**
   * Timer used in refreshGraph() for debouncing
   * @type {Number}
   */
  var updateTimer = 0;

  /**
   * Refresh the graph no more than 30 times per second
   */
  function refreshGraph(){
    clearTimeout(updateTimer);
		updateTimer = setTimeout(function(){
			sigmaInstance.refresh({skipIndexation: true});
    }, 33);
  }

  /**
   * Update an individual node's color
   * @param  {Number} node_id The id of the node
   * @param  {Number} score The botscore of the account for that node
   */
	function updateNodeColor(node_id, score)
	{
    color = getNodeColor(score);
    //change node color on graph based on botscore
    if(sigmaInstance && sigmaInstance.graph)
    {
      var node = sigmaInstance.graph.nodes(node_id);
      if(node)
      {
        sigmaInstance.graph.nodes(node_id).color = color;
        sigmaInstance.graph.nodes(node_id).borderColor = getBorderColor(score);
        refreshGraph();
      }
    }
	}

  /**
   * Set up base colors to allow for calling r, g, b of color  \
   * Helper function for getNodeColor() and getBorderColor()
   * @param  {Number} score The botscore used to get the correct color
   * @return {Object} The color of the node with r, g, b properties
   */
	function getBaseColor(score){
		if(score ===  undefined || score === null)
		{
			return colors.node_colors["fact_checking"];
		}
		if(score === false)
		{
			return {r: 255, g: 255, b: 255};
		}

    // Grey color for scores unable to be found, given value -1
    if(score < 0)
		{
			return {r: 230, g: 230, b: 230};
		}
		score = score * 100;

		var node_colors = colors.node_colors.botscores;

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
	}
  
  /**
   * Used to take a snapshot of the graph
   * @return {Object} The render of the graph
   */
	function getRenderer()
	{
		return sigmaInstance.renderers[0];
	}

  /**
   * Get the node's color based on botscore
   * @param  {Number} score The botscore
   * @return {Object} The color of the node
   */
	function getNodeColor(score)
	{
		var base = getBaseColor(score);
		var color = "rgb("+base.r+", "+base.g+", "+base.b+")"
		return color;
	}

  /**
   * Get the node's border's color
   * @param  {Number} score The botscore
   * @return {Object} The color of the node's border
   */
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

  /**
   * Removes all information from the graph to start over
   */
	function KillGraph()
	{
		if(sigmaInstance)
		{
			sigmaInstance.kill();
			sigmaInstance = null;
		}

		document.getElementById("graph-container").innerHTML = "";
  }
                                         
 // #     # #####  #####    ##   ##### ######     #####  #####    ##   #####  #    #
 // #     # #    # #    #  #  #    #   #         #     # #    #  #  #  #    # #    #
 // #     # #    # #    # #    #   #   #####     #       #    # #    # #    # ######
 // #     # #####  #    # ######   #   #         #  #### #####  ###### #####  #    #
 // #     # #      #    # #    #   #   #         #     # #   #  #    # #      #    #
 //  #####  #      #####  #    #   #   ######     #####  #    # #    # #      #    #

  /**
   * Create the graph
   * @param  {Date} start_time The earliest tweet, leftmost date on graph
   * @param  {Date} end_time   The latest tweet, rightmost date on graph
   */
	function UpdateGraph(start_time, end_time)
	{
		clearTimeout(animationTimeout);
		KillGraph();

		if(!edges || !edges.length)
		{
			throw "Tried to make graph, but there is no data.";
		}

		var emptyGraph = {nodes: [], edges: []},
      node_colors = colors.node_colors,
      edge_colors = {
        "fact_checking": colors.edge_colors.fact_checking,
        "claim": colors.edge_colors.claim,
      },
      nodes = {},
      edgeCount = {};
		
		graph = emptyGraph;

		timespan.start_time = 0;
		timespan.end_time = 0;
    var node_count = 0;
    
    try
    {
      // create nodes[] data structure to hold info.
      for (var i in edges)
      {
        var edge = edges[i],
        from_user_id = edge.from_user_id,
        to_user_id = edge.to_user_id,
        tweet_id = edge.tweet_id,
        tweet_type = edge.tweet_type,
        is_mention = edge.is_mention,
        tweet_created_at = (new Date(edge.tweet_created_at)).getTime();

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

        if (start_time && end_time) 
        {
          timespan.start_time = start_time;
          timespan.end_time = end_time;
        }

        var url_raw = edge.url_raw, title = edge.title;

        // sanity check
        // if -1, dump it since no out edge
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
      }
			// put nodes into sigma
      console.log(nodes, "nodes")

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

      for (var i in nodes)
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
					score = false;
				}
				var color = getNodeColor(score);

				var new_x, new_y;
				// Using x=cos(2pi*fraction), y=sin(2pi*fraction) and the fraction increases
				// deterministically with the node counter, essentially placing the
				// nodes on a circle regardless of node count, this ensures that
				// force atlas will produce the same graph for a given query every time
				new_x = Math.cos(2*Math.PI*(cnt/node_count));
        new_y = Math.sin(2*Math.PI*(cnt/node_count));
        
				graph.nodes.push({
					x: new_x,
					y: new_y,
					// We can also initialize Force Atlas with a randomized graph,
					// but this will make visualizations look different every time
					// x: Math.random() * 10,
					// y: Math.random() * 10,
					orig_size: nodes[i].size,
					size: new_size, // Math.sqrt(Math.sqrt(nodes[i].size*10)),
					label: nodes[i].screenName,
					id: i,
					node_id: cnt,
					color: color,
					data: nodes[i]
				});
				nodes_id[i] = cnt;
				++cnt;
			}

			// We now order and prioritize the scores that need to be computed first
			// First we compute scores that have not ever been computed before
			var neverComputedLength = scores_never_computed_to_compute.length;
      for (var i = 0; i < neverComputedLength; i++)
      {
			  account_list_to_compute.push(scores_never_computed_to_compute[i]);
			}

	    // Then we compute stale scores
	    var staleLength = stale_scores_to_compute.length;
      for (var i = 0; i < staleLength; i++)
      {
			  account_list_to_compute.push(stale_scores_to_compute[i]);
			}

			// Populating bot update list with already updated scores first
			// Update bot update index to the point after this list
			score_stats.current_index = already_computed_account_list.length;
      for (var i = 0; i<score_stats.current_index; i++)
      {
			  score_stats.user_list.push(already_computed_account_list[i])
			}

			// Then we add the bot scores that are stale or never obtained
			toComputeLen = account_list_to_compute.length;
      for (var i = 0; i<toComputeLen; i++)
      {
			  score_stats.user_list.push(account_list_to_compute[i])
			}

			node_count = graph.nodes.length;
			score_stats.total = node_count;

			// put edges into sigma
			var edgeIndex = 0;
			for (var i in nodes)
			{
				for (var j in nodes[i].outgoing)
				{
					graph.edges.push({
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
            color: edge_colors[nodes[i].outgoing[j].type], // Giovanni said use a third color
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
    }
    catch(e)
    {
      console.debug(e);
    }
      
		drawGraph();
    return graph;
	}

 // #     #  ####  ###### #####     #     #  ####  #####    ##   #
 // #     # #      #      #    #    ##   ## #    # #    #  #  #  #
 // #     #  ####  #####  #    #    # # # # #    # #    # #    # #
 // #     #      # #      #####     #  #  # #    # #    # ###### #
 // #     # #    # #      #   #     #     # #    # #    # #    # #
 //  #####   ####  ###### #    #    #     #  ####  #####  #    # ######

  /**
   * Generates the modal that pops up when clicking on a node
   * @param  {Object} e `clickNode` type containing data pertinent to the Twitter account
   */
	function GenerateUserModal(e)
	{
    var node = e.data.node.data;

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
			var fromURL = 'https://twitter.com/intent/user?user_id='+String(i),
				  toURL = 'https://twitter.com/intent/user?user_id='+e.data.node.id;

			for (var j in node.incoming[i].ids)
			{
				var tweetURL = TWEET_URL.replace("%0", i).replace("%1", node.incoming[i].ids[j]);
				if (true != node.incoming[i].is_mentions[j] && false != node.incoming[i].is_mentions[j])
					console.log("GenerateUserModal Parse incoming.is_mentions error!!");

        var tweet_type = "";
        
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
        // Create another conditional branch for no edges
        if(tweet_type == "")
        {
          
        }
        else
        {
          tweets[tweet_type][i] = tweets[tweet_type][i] || {user_url: fromURL, screenName: node.incoming[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
          tweets[tweet_type][i].article_titles.push(node.incoming[i].titles[j]);
          tweets[tweet_type][i].tweet_urls.push(tweetURL);
          tweets[tweet_type][i].article_urls.push(node.incoming[i].url_raws[j]);
          counts[tweet_type + "_count"] ++;
        }
			}
		}

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
				if(tweet_type == "")
        {
          
        }
        else
        {
          tweets[tweet_type][i] = tweets[tweet_type][i] || {user_url: toURL, screenName: node.outgoing[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
          tweets[tweet_type][i].article_titles.push(node.outgoing[i].titles[j]);
          tweets[tweet_type][i].tweet_urls.push(tweetURL);
          tweets[tweet_type][i].article_urls.push(node.outgoing[i].url_raws[j]);
          counts[tweet_type + "_count"] ++;
        }
			}
    }
    
    node_modal_content.has_quoted = tweets.has_quoted;
    node_modal_content.has_quoted_count = counts.has_quoted_count;

    node_modal_content.is_quoted_by = tweets.is_quoted_by;
    node_modal_content.is_quoted_by_count = counts.is_quoted_by_count;
    
    node_modal_content.has_mentioned = tweets.has_mentioned;
    node_modal_content.has_mentioned_count = counts.has_mentioned_count;

    node_modal_content.is_mentioned_by = tweets.is_mentioned_by;
    node_modal_content.is_mentioned_by_count = counts.is_mentioned_by_count;

    node_modal_content.has_retweeted = tweets.has_retweeted;
    node_modal_content.has_retweeted_count = counts.has_retweeted_count;
    
		node_modal_content.is_retweeted_by = tweets.is_retweeted_by;
    node_modal_content.is_retweeted_by_count = counts.is_retweeted_by_count;
	}

 // ######  #####    ##   #    #     #####  #####    ##   #####  #    #
 // #     # #    #  #  #  #    #    #     # #    #  #  #  #    # #    #
 // #     # #    # #    # #    #    #       #    # #    # #    # ######
 // #     # #####  ###### # ## #    #  #### #####  ###### #####  #    #
 // #     # #   #  #    # ##  ##    #     # #   #  #    # #      #    #
 // ######  #    # #    # #    #     #####  #    # #    # #      #    #

  /**
   * Draws the Sigma graph
   */
	function drawGraph() {

		// Used for tracking when to stop sigma rendering as to not stop too soon
		numSigmaInstancesLaunched++;

		sigmaInstance = new sigma({
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

		var jiggle_compensator = Math.floor(Math.sqrt(graph.edges.length)) * 600;
		sigmaInstance.refresh({skipIndexation: true});
		sigmaInstance.startForceAtlas2({
      slowDown: 100,
      gravity: 2
    });

		for(var i in botscores)
		{
			updateNodeColor(i, botscores[i].score);
		}

		spinStop("generateNetwork");

		setTimeout(function () {
      // If more sigma graphs are undergoing this timeout, do not stop
			// the latter graph from a previous graph's timeout, using this
			// mechanism which normalizes the sigma graph to 1, and when that
			// happens, the visualization rendering is stopped with full time
			// to render
      if (numSigmaInstancesLaunched < 2) 
      {
				sigmaInstance.stopForceAtlas2();
				sigmaInstance.camera.goTo({x:0, y:0, ratio:1});
				spinStop("ForceAtlas");
				spinner_notices.graph = "";
				numSigmaInstancesLaunched--;
      } 
      else 
      {
				numSigmaInstancesLaunched--;
			}
		}, 2000 + jiggle_compensator);

    sigmaInstance.bind('clickNode', function (e) {
      var node = e.data.node.data;

      node_modal_content.user_id = e.data.node.id;
      node_modal_content.screenName = node.screenName;

      node_modal_content.staleAcctInfo.openedModalWhileFetchingScores = getting_bot_scores.running;

      var score = false;
      if(botscores[node.id])
      {
        score = botscores[node.id].score;
        score = Math.floor(score * 100);
        node_modal_content.botcolor = score != 0 ? getNodeColor(score/100) : "";
        node_modal_content.botscore = score;
        node_modal_content.timestamp = botscores[node.id].time;

        // Right now these results are not cached so there are instances
        // where the botscores exist but stale account info does not.
        // We provide proper checks here so that model content can be generated
        if(botscores[node.id].hasOwnProperty('staleAcctInfo') && botscores[node.id].hasOwnProperty('completeAutomationProbability'))
        {
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
        }
      }
      else
      {
        node_modal_content.showStaleContent = false;
        node_modal_content.botscore = false;
        node_modal_content.botcolor = "";
      }

      // insert tweets into modal body, grouped by individual to_user_id
      GenerateUserModal(e);

      toggle_node_modal();
    });

		sigmaInstance.bind('clickEdge', function(e){
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

			// show modal header, like User A mentions, quotes, and labels B
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
			toggle_edge_modal();
		});
	}

  /**
   * Zoom in on the graph
   */
  function zoomIn()
  {
		var c = sigmaInstance.camera;
    sigma.misc.animation.camera(c, 
      {ratio: c.ratio / c.settings('zoomingRatio')}, 
      {duration: 200}
    );
		c.goTo({ratio: c.ratio / c.settings('zoomingRatio')});
  }

  /**
   * Zoom out on the graph
   */
  function zoomOut()
  {
		var c = sigmaInstance.camera;
    sigma.misc.animation.camera(c, 
      {ratio: c.ratio * c.settings('zoomingRatio')}, 
      {duration: 200}
    );
		c.goTo({ratio: c.ratio * c.settings('zoomingRatio')});
  }

  /**
   * Draw the graph
   */
  function redraw()
  {
    if(sigmaInstance && sigmaInstance.camera)
    {
      var sigmaCamera = sigmaInstance.camera;
      sigma.misc.animation.camera(sigmaCamera, 
        {ratio: sigmaCamera.ratio}, 
        {} // duration left blank
      );
      sigmaCamera.goTo({ratio: sigmaCamera.ratio});
    }
	}

  ( /**
      * Sigma Node Border Custom Renderer
      * =================================
      * Allows for colored node borders
      * @author  Guillaume Plique (Yomguithereal)
      * @version 0.0.1
      */
    function(undefined) {

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

			context.lineWidth = 0.5;
			context.strokeStyle = node.borderColor || getBorderColor(false)
			context.stroke();
		};
	}).call(this);

 // ####### # #      ##### ###### #####
 // #       # #        #   #      #    #
 // #       # #        #   #####  #    #
 // #####   # #        #   #      #####
 // #       # #        #   #      #   #
 // #       # ######   #   ###### #    #

  /**
   * Filter edges shown based on timestamp window chosen in timeline
   * @param  {Number} filterTimestamp The timestamp that counts as  \
   * `timespan.end_time` during timelapse animation
   */
  function FilterEdges(filterTimestamp)
  {
		filterTimestamp = filterTimestamp || timespan.end_time;
		var unfiltered_nodes = [];

		var edges = sigmaInstance.graph.edges();
		var nodes = sigmaInstance.graph.nodes();

		var edge_colors = {
			"fact_checking": colors.edge_colors.fact_checking,
			"claim": colors.edge_colors.claim,
		};

		var unfiltered_node_edge_counts = {};
		var max_size = 0;
		var min_size = 0;

		for(var i in edges)
		{
			var edge = edges[i];

			if(edge.min_tweet_created_at >= filterTimestamp)
			{
				//filtered
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
			}
		}
		refreshGraph();
	}

  // Animation-related global variables
	graphAnimation.playing = false;
	graphAnimation.paused = false;
	graphAnimation.increment = 0;
  var animationTimeout = 0;

  /**
   * Animates graph from beginning to end (or paused location to end)
   * @param  {Number} timestamp The current timestamp of the animation
   */
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

		var new_timestamp = timestamp + increment;

		animationTimeout = setTimeout(function(){
			graphAnimation.increment += 1;
			AnimateFilter(new_timestamp);
		}, 50);
  }

  /**
   * Start the graph animation (show tweets as they happened)
   */
	function StartAnimation()
	{
		graphAnimation.increment = 1;
		graphAnimation.playing  = true;
		graphAnimation.paused = false;
		AnimateFilter(timespan.start_time);
	}

  /**
   * Stop the graph animation and show all nodes and edges again
   */
  function StopAnimation()
  {
		clearTimeout(animationTimeout);
		// If the timeline has been animated before we want to bring the tick to the end and show all edges
    if (graphAnimation.current_timestamp > timespan.start_time) 
    {
			FilterEdges((new Date()).getTime());
		}

		graphAnimation.playing  = false;
		graphAnimation.paused = false;
  }

  /**
   * Pause the graph animation
   */
  function PauseAnimation()
  {
		clearTimeout(animationTimeout);
		graphAnimation.paused = true;
  }

  /**
   * Resume the graph animation from a paused state
   */
  function UnpauseAnimation()
  {
		graphAnimation.paused = false;
		AnimateFilter(graphAnimation.current_timestamp);
		// console.debug(graphAnimation.current_timestamp);
	}

  /**
   * Filter nodes by botscore (e.g. between 3.0 and 4.0)
   * @param  {Number} max The high end botscore to filter nodes by
   * @param  {Number} min The low end botscore to filter nodes by
   */
  function filterNodesByScore(max, min)
  {
		var nodes = sigmaInstance.graph.nodes();
		for(var node_id in nodes)
		{
			var node = nodes[node_id];
      var score = false;
      
			if(botscores[node.id])
			{
				score = botscores[node.id].score;
      }
      
			if(max)
			{
				if(score !== false && score >= min && score < max)
				{
					updateNodeColor(node.id, score);
				}
				else
				{
					node.color = "rgba(0,0,0,.05)";
					node.borderColor = "rgba(0,0,0,.05)";
				}
			}
			else
			{
				updateNodeColor(node.id, score);
			}
		}
		refreshGraph();
	}
 
 // ######  ###### ##### #    # #####  #    #
 // #     # #        #   #    # #    # ##   #
 // #     # #####    #   #    # #    # # #  #
 // ######  #        #   #    # #####  #  # #
 // #   #   #        #   #    # #   #  #   ##
 // #    #  ######   #    ####  #    # #    #


	returnObj.filter = FilterEdges;
	returnObj.startAnimation = StartAnimation;
	returnObj.stopAnimation = StopAnimation;
	returnObj.pauseAnimation = PauseAnimation;
	returnObj.unpauseAnimation = UnpauseAnimation;

	returnObj.updateEdges = UpdateEdges;
	returnObj.updateGraph = UpdateGraph;
	returnObj.getNewScores = getNewScores;
	returnObj.getBotCacheScores = getBotCacheScores;
	returnObj.getNodeColor = getNodeColor;
	returnObj.updateUserBotScore = updateUserBotScore;
	returnObj.zoomIn = zoomIn;
	returnObj.zoomOut = zoomOut;
  returnObj.redraw = redraw;

  /**
   * Gets the edges of the graph
   * @return The graph's edges
   */
  returnObj.getEdges = function(){ return edges; };

  /**
   * Gets the botscores from the graph
   * @return The graph's botscores
   */
  returnObj.botscores = function(){ return botscores; };
  
  /**
   * Resets the botscores on the graph
   */
  returnObj.resetBotscores = function(){ botscores = {}; };
  
  /**
   * Sets the language to be used on the graph, determining botscores
   * @param  {String} passedLang The language the tweets are in
   */
	returnObj.setLang = function(passedLang){lang = passedLang};

	returnObj.setBotScore = setBotScore;
	returnObj.filterNodesByScore = filterNodesByScore;
  returnObj.score_stats = score_stats;
	returnObj.getRenderer = getRenderer;

	return returnObj;
}
