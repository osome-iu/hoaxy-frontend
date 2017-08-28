


function disableInput() {
	console.debug("Legacy disableInput called.");
	app.input_disabled = true;
}
function enableInput() {
	console.debug("Legacy enableInput called.");
	app.input_disabled = false;
}


//data structure for the modal display, either display user or tweet id
// var modal_content = {
// 	cooccurrence: {
// 		title: "",
// 		hashtags: []
// 	},
// 	tweet_edge: {
// 		tweet_id: "",
// 		username: "",
// 		edgeType: "",
// 		source: "",
// 		target: "",
// 		title: ""
// 	},
// 	user: {
// 		username: "",
// 		mentioned_by: [],
// 		mentioned: [],
// 		retweeted_by: [],
// 		retweeted: []
// 	}
// };


//Step 0 : Get value from Text Box
var chartData = [];
var chart ;
var s =null; //sigma instance
var hiddenColor = 'blue';

var graph = null;
var edges = null;

original_bottom = 0;

//formatting the date
function dateFormatter(d) {
  return d3.time.format('%x')(new Date(d))
}

function updateChart(){
  if(!!chart.update){
    chart.update();
  }
}

/*
* timelineObj:  {"time": time, "cnt_factcheck": cnt_factcheck, "cnt_fake": cnt_fake}
*/
function getBothSeries(timelineObj)
{
	var factChecking_values = timelineObj.factChecking_values;
	var fake_values = timelineObj.fake_values;
	var factChecking_series = {
		key: 'Fact-checks',
		values: factChecking_values,
		c: colors.edge_colors.fact_checking
	};
	var fake_series = {
		key: 'Claims',
		values: fake_values,
		c:colors.edge_colors.claims
	};
	return {'factChecking_series': factChecking_series, 'fake_series': fake_series};
}

// Handle focus chart date changes
/*
Uses Lodash's debounce: https://lodash.com/docs/#debounce
Without debounce, this event will fire many times before you want
it to. The alternative is to listen for the mouseUp event after
getting the brush event, then fire the updateDateRange function.
*/
var updateDateRange = _.debounce(_updateDateRange, 400);
function _updateDateRange(extent){
  $('#extent-0').text(extent.extent[0]);
  $('#extent-1').text(extent.extent[1]);

  $('#extent-00').text(new Date(extent.extent[0]).toISOString());
  $('#extent-11').text(new Date(extent.extent[1]).toISOString());

  var starting_time = extent.extent[0],
		ending_time = extent.extent[1];

  //only proceed when s.graph is ready
  // if (edges)
  try
  {
	graph = Graph(edges, starting_time, ending_time);
	spinStart();
	drawGraph(graph);
	spinStop();

  }
  catch(e)
  {
	  setTimeout(function(){
		  updateDateRange(extent);
	  }, 500);
  }

}

//Plotting function
function plotData(factChecking_series, fake_series){
  $(".button-container").show();
  chartData.push(fake_series);
  chartData.push(factChecking_series);
  // This adds an event handler to the focus chart
  chart.dispatch.on("brush", updateDateRange);
  d3.select('#chart svg')
    .datum(chartData)
    .call(chart);
}

function retrieveTimeSeriesData(edges)
{
	clearData();
	var timelineObj = timeline(edges);
	var values = getBothSeries(timelineObj);
	plotData(values.factChecking_series, values.fake_series);
}

function getFilename(ext){
	var keys = $.map(chartData, function(x){ return x.key }),
	filename = ['Timeline', keys.join('&'), ].join('_') + '.' + ext;
	return filename;
}

//clear the data function
function clearData() {
  chartData.length = 0;
  updateChart();
}

function resizeSigma(c)
{
	$("#zoom-in").show();
	$("#zoom-out").show();
	app.show_zoom_buttons = true;

	// Zoom out - single frame :
	$("#zoom-out").bind("click",function(){
		c.goTo({
			ratio: c.ratio * c.settings('zoomingRatio')
		});
	});

	// Zoom in - single frame :
	$("#zoom-in").bind("click",function(){
		c.goTo({
			ratio: c.ratio / c.settings('zoomingRatio')
		});
	});

	// Zoom out - animation :
	sigma.misc.animation.camera(c, {
	  ratio: c.ratio * c.settings('zoomingRatio')
	}, {
	  duration: 200
	});

	// Zoom in - animation :
	sigma.misc.animation.camera(c, {
	  ratio: c.ratio / c.settings('zoomingRatio')
	}, {
	  duration: 200
	});
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

	// var is_mentioned_by = {}, has_quoted = {}, has_retweeted = {};
	// var is_mentioned_by_count = 0, has_quoted_count = 0, has_retweeted_count = 0;
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
	// var has_mentioned = {}, is_quoted_by = {}, is_retweeted_by = {};
	// var has_mentioned_count = 0, is_quoted_by_count = 0, is_retweeted_by_count = 0;
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
	app.node_modal_content.is_mentioned_by = tweets.is_mentioned_by;
	app.node_modal_content.has_quoted = tweets.has_quoted;
	app.node_modal_content.has_retweeted = tweets.has_retweeted;
	app.node_modal_content.has_mentioned = tweets.has_mentioned;
	app.node_modal_content.is_quoted_by = tweets.is_quoted_by;
	app.node_modal_content.is_retweeted_by = tweets.is_retweeted_by;

	app.node_modal_content.is_mentioned_by_count = counts.is_mentioned_by_count;
	app.node_modal_content.has_quoted_count = counts.has_quoted_count;
	app.node_modal_content.has_retweeted_count = counts.has_retweeted_count;
	app.node_modal_content.has_mentioned_count = counts.has_mentioned_count;
	app.node_modal_content.is_quoted_by_count = counts.is_quoted_by_count;
	app.node_modal_content.is_retweeted_by_count = counts.is_retweeted_by_count;

}

function drawGraph(graph) {

	if(s)
	{
		s.kill();
		s = null;
		console.debug("Killed Existing Sigma");
	}

	console.log("Drawing Sigma");
	$('#graph-container').empty();

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
	setTimeout(function () {
		s.stopForceAtlas2();
		s.camera.goTo({x:0, y:0, ratio:1});
		spinStop();
	}, 2000 + jiggle_compensator);

    s.bind('clickNode', function (e) {
		var node = e.data.node.data;
        //the following /**/ is for twitter user widget.
		// $('#myModalLabel').html('User:  <a target="_blank" href="https://twitter.com/intent/user?user_id='+e.data.node.id+'">@'+ node.screenName +'</a>');
		app.node_modal_content.user_id = e.data.node.id;
		app.node_modal_content.screenName = node.screenName;

		//insert tweets into modal body, grouped by individual to_user_id
		GenerateUserModal(e);


		$("#nodeModal").off('shown.bs.modal show.bs.modal');
		$("#nodeModal").on("shown.bs.modal show.bs.modal", function(){
			$(".modal-dialog").scrollTop(0);
		});
		// console.debug($("#myModal"));
		$('#nodeModal').modal('toggle');

    });

	s.bind('clickEdge', function(e){
		var edge = e.data.edge;
		app.edge_modal_content.edge = edge;
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

		app.edge_modal_content.tweet_urls = tweet_urls;

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

		app.edge_modal_content.label_string = label_string;

		$("#edgeModal").off('shown.bs.modal show.bs.modal');
		$("#edgeModal").on("shown.bs.modal show.bs.modal", function(){
			$(".modal-dialog").scrollTop(0);
		});

		$('#edgeModal').modal('toggle');

	});

	resizeSigma(s.camera);

	window.scroll(0,$("#graphs").offset().top);
}


$(document).ready(function () {

    chart = nv.models.lineWithFocusChart()
		.showLegend(false)
        .useInteractiveGuideline(true);

	chart.margin({right: 50, bottom: 50});

	chart.xAxis
		.tickFormat(dateFormatter);
	chart.x2Axis
		.tickFormat(dateFormatter);
	chart.forceY([0])
	chart.yAxis.axisLabel("Tweets");

	chart.color([colors.edge_colors.claim, colors.edge_colors.fact_checking]); //color match with those of nodes

});


var spin_counter = 0;
function spinStop(reset){
	console.debug("Legacy spinStop called. Use app.spinStart() instead.");
	app.spinStop(reset);
}
function spinStart(){
	console.debug("Legacy spinStart called. Use app.spinStart() instead.")
	app.spinStart();
}


function populateQuery(query)
{
	$("#query").val(query);
}
