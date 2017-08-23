function Graph(data, start_time, end_time)
{
	if(!data)
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
        for (var i in data)
        {
            var edge = data[i],
				from_user_id = edge.from_user_id,
				to_user_id = edge.to_user_id,
				tweet_id = edge.tweet_id,
				tweet_type = edge.tweet_type,
				is_mention = edge.is_mention,
				tweet_created_at = (new Date(edge.tweet_created_at.substring(0, 10))).getTime();

				//filter edges not fall into [start_time, end_time]
				if (tweet_created_at < start_time || tweet_created_at > end_time)
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

	//console.log("into graph function");
    return g;
}
