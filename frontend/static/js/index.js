


function disableInput() {
	console.debug("Legacy disableInput called.");
	app.input_disabled = true;
}
function enableInput() {
	console.debug("Legacy enableInput called.");
	app.input_disabled = false;
}


//data structure for the modal display, either display user or tweet id
var modal_content = {
	cooccurrence: {
		title: "",
		hashtags: []
	},
	tweet_edge: {
		tweet_id: "",
		username: "",
		edgeType: "",
		source: "",
		target: "",
		title: ""
	},
	user: {
		username: "",
		mentioned_by: [],
		mentioned: [],
		retweeted_by: [],
		retweeted: []
	}
};


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

var TWEET_URL = "https://twitter.com/%0/status/%1";

function GenerateUserModal(e)
{
	var node = e.data.node.data;

	//new incoming edges, could be is_mentioned_by, has_quoted, has_retweeted
	var is_mentioned_by = {}, has_quoted = {}, has_retweeted = {};
	for (var i in node.incoming)
	{
		var fromURL = 'https://twitter.com/intent/user?user_id='+i,
			toURL = 'https://twitter.com/intent/user?user_id='+e.data.node.id;

		for (var j in node.incoming[i].ids)
		{
			var tweetURL = TWEET_URL.replace("%0", i).replace("%1", node.incoming[i].ids[j]);
			if (true != node.incoming[i].is_mentions[j] && false != node.incoming[i].is_mentions[j])
				console.log("GenerateUserModal Parse incoming.is_mentions error!!");

			//if is_mention == true, or "reply"==tweet type, then must be a mention,
			if(true == node.incoming[i].is_mentions[j] || "reply" == node.incoming[i].tweet_types[j])
			{
				is_mentioned_by[i] = is_mentioned_by[i] || {user_url: fromURL, screenName: node.incoming[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				is_mentioned_by[i].article_titles.push(node.incoming[i].titles[j]);
				is_mentioned_by[i].tweet_urls.push(tweetURL);
				is_mentioned_by[i].article_urls.push(node.incoming[i].url_raws[j]);
				continue;
			}

			//else if is_mention = false, switch according to tweet_types
			if ("quote" == node.incoming[i].tweet_types[j])
			{
				has_quoted[i] = has_quoted[i] || {user_url: fromURL, screenName: node.incoming[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				has_quoted[i].article_titles.push(node.incoming[i].titles[j]);
				has_quoted[i].tweet_urls.push(tweetURL);
				has_quoted[i].article_urls.push(node.incoming[i].url_raws[j]);
			}
			else if("retweet" == node.incoming[i].tweet_types[j])
			{
				has_retweeted[i] = has_retweeted[i] || {user_url: fromURL, screenName: node.incoming[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				has_retweeted[i].article_titles.push(node.incoming[i].titles[j]);
				has_retweeted[i].tweet_urls.push(tweetURL);
				has_retweeted[i].article_urls.push(node.incoming[i].url_raws[j]);
			}

		}
	}

	//has_quoted
	if (0 != Object.keys(has_quoted).length)
	{
		$('#myModalBody').append('<h2>has quoted:</h2>');
		for (var user in has_quoted)
		{
			$('#myModalBody').append('<h3>User:  <a target="_blank" href="'+ has_quoted[user].user_url +'">'+ has_quoted[user].screenName + '</h3>');

			for (var j in has_quoted[user].article_titles)//every mention of the user
			{
					//article title
					$("#myModalBody").append("<div class='article_headline'>" + has_quoted[user].article_titles[j] + "</div>");
					//see tweet, see article
					$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ has_quoted[user].tweet_urls[j] + '">tweet</a>' +
					' or  <a target="_blank" href="'+ has_quoted[user].article_urls[j]+ '">article</a></div>');
			}
		}
	}
	else
		$('#myModalBody').append('<h2>has quoted: nobody</h2>');

	//is_mentioned_by
	if (0 != Object.keys(is_mentioned_by).length)
	{
		$('#myModalBody').append('<h2>was mentioned by:</h2>');

		for (var user in is_mentioned_by)
		{
			$('#myModalBody').append('<h3>User:  <a target="_blank" href="'+is_mentioned_by[user].user_url +'">'+ is_mentioned_by[user].screenName + '</h3>');

			for (var j in is_mentioned_by[user].article_titles)//every mention of the user
			{
					//article title
					$("#myModalBody").append("<div class='article_headline'>" + is_mentioned_by[user].article_titles[j] + "</div>");
					//see tweet, see article
					$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ is_mentioned_by[user].tweet_urls[j] + '">tweet</a>' +
					' or  <a target="_blank" href="'+ is_mentioned_by[user].article_urls[j]+ '">article</a></div>');
			}
		}
	}
	else
		$('#myModalBody').append('<h2>was mentioned by: nobody</h2>');

	//has_retweeted
	if (0 != Object.keys(has_retweeted).length)
	{
		$('#myModalBody').append('<h2>has retweeted: </h2>');
		for (var user in has_retweeted)
		{
			$('#myModalBody').append('<h3>User:  <a target="_blank" href="' + has_retweeted[user].user_url +'">'+ has_retweeted[user].screenName + '</h3>');

			for (var j in has_retweeted[user].article_titles)//every mention of the user
			{
					//article title
					$("#myModalBody").append("<div class='article_headline'>" + has_retweeted[user].article_titles[j] + "</div>");
					//see tweet, see article
					$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ has_retweeted[user].tweet_urls[j] + '">tweet</a>' +
					' or  <a target="_blank" href="'+ has_retweeted[user].article_urls[j]+ '">article</a></div>');
			}
		}
	}
	else
	{
		$('#myModalBody').append('<h2>has retweeted: nobody</h2>');
	}
	//new outgoing edges, could be has_mentioned, is_quoted_by, is_retweeted_by
	var has_mentioned = {}, is_quoted_by = {}, is_retweeted_by = {};
	for (var i in node.outgoing)
	{
		var fromURL = 'https://twitter.com/intent/user?user_id='+e.data.node.id,
			toURL = 'https://twitter.com/intent/user?user_id='+i;

		for (var j in node.outgoing[i].ids)
		{
			var tweetURL = TWEET_URL.replace("%0", i).replace("%1", node.outgoing[i].ids[j]);
			if (true != node.outgoing[i].is_mentions[j] && false != node.outgoing[i].is_mentions[j])
				console.log("GenerateUserModal Parse outgoing.is_mentions error!!");

			//if is_mention == true, or "reply"==tweet type, then must be a mention
			if(true == node.outgoing[i].is_mentions[j] || "reply" == node.outgoing[i].tweet_types[j])
			{
				has_mentioned[i] = has_mentioned[i] || {user_url: toURL, screenName: node.outgoing[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				has_mentioned[i].article_titles.push(node.outgoing[i].titles[j]);
				has_mentioned[i].tweet_urls.push(tweetURL);
				has_mentioned[i].article_urls.push(node.outgoing[i].url_raws[j]);
				continue;
			}

			//else if is_mention = false, switch according to tweet_types
			if ("quote" == node.outgoing[i].tweet_types[j])
			{
				is_quoted_by[i] = is_quoted_by[i] || {user_url: toURL, screenName: node.outgoing[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				is_quoted_by[i].article_titles.push(node.outgoing[i].titles[j]);
				is_quoted_by[i].tweet_urls.push(tweetURL);
				is_quoted_by[i].article_urls.push(node.outgoing[i].url_raws[j]);
			}
			else if("retweet" == node.outgoing[i].tweet_types[j])
			{
				is_retweeted_by[i] = is_retweeted_by[i] || {user_url: toURL, screenName: node.outgoing[i].screenName, article_titles: [], tweet_urls: [], article_urls: []};
				is_retweeted_by[i].article_titles.push(node.outgoing[i].titles[j]);
				is_retweeted_by[i].tweet_urls.push(tweetURL);
				is_retweeted_by[i].article_urls.push(node.outgoing[i].url_raws[j]);
			}
		}
	}

	//has_mentioned
	if (0 != Object.keys(has_mentioned).length)
	{
		$('#myModalBody').append('<h2>has mentioned: </h2>');
		for (var user in has_mentioned)
		{
			$('#myModalBody').append('<h3>User:  <a target="_blank" href="' + has_mentioned[user].user_url +'">'+ has_mentioned[user].screenName + '</h3>');

			for (var j in has_mentioned[user].article_titles)//every mention of the user
			{
					//article title
					$("#myModalBody").append("<div class='article_headline'>" + has_mentioned[user].article_titles[j] + "</div>");
					//see tweet, see article
					$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ has_mentioned[user].tweet_urls[j] + '">tweet</a>' +
					' or  <a target="_blank" href="'+ has_mentioned[user].article_urls[j]+ '">article</a></div>');
			}
		}
	}
	else
		$('#myModalBody').append('<h2>has mentioned: nobody</h2>');
	//is_quoted_by
	if (0 != Object.keys(is_quoted_by).length)
	{
		$('#myModalBody').append('<h2>was quoted by: </h2>');
		for (var user in is_quoted_by)
		{
			$('#myModalBody').append('<h3>User:  <a target="_blank" href="'+is_quoted_by[user].user_url +'">'+ is_quoted_by[user].screenName + '</h3>');

			for (var j in is_quoted_by[user].article_titles)//every mention of the user
			{
					//article title
					$("#myModalBody").append("<div class='article_headline'>" + is_quoted_by[user].article_titles[j] + "</div>");
					//see tweet, see article
					$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ is_quoted_by[user].tweet_urls[j] + '">tweet</a>' +
					' or  <a target="_blank" href="'+ is_quoted_by[user].article_urls[j]+ '">article</a></div>');
			}
		}
	}
	else
	{
		$('#myModalBody').append('<h2>was quoted by: nobody</h2>');
	}

	//is_retweeted_by
	if (0 != Object.keys(is_retweeted_by).length)
	{
		$('#myModalBody').append('<h2>was retweeted by: </h2>');
		for (var user in is_retweeted_by)
		{
			$('#myModalBody').append('<h3>User:  <a target="_blank" href="'+is_retweeted_by[user].user_url +'">'+ is_retweeted_by[user].screenName + '</h3>');

			for (var j in is_retweeted_by[user].article_titles)//every mention of the user
			{
					//article title
					$("#myModalBody").append("<div class='article_headline'>" + is_retweeted_by[user].article_titles[j] + "</div>");
					//see tweet, see article
					$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ is_retweeted_by[user].tweet_urls[j] + '">tweet</a>' +
					' or  <a target="_blank" href="'+ is_retweeted_by[user].article_urls[j]+ '">article</a></div>');
			}
		}
	}
	else
	{
		$('#myModalBody').append('<h2>was retweeted by: nobody</h2>');
	}


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
		$('#myModalLabel').html('User:  <a target="_blank" href="https://twitter.com/intent/user?user_id='+e.data.node.id+'">@'+ node.screenName +'</a>');

		$("#myModalBody").html('');
		$("#myModalBody").empty();
		//insert tweets into modal body, grouped by individual to_user_id
		GenerateUserModal(e);
		$("#myModal").off('shown.bs.modal show.bs.modal');
		$("#myModal").on("shown.bs.modal show.bs.modal", function(){
			$(".modal-dialog").scrollTop(0);
		});
		// console.debug($("#myModal"));
		$('#myModal').modal('toggle');

    });

	s.bind('clickEdge', function(e){
		var edge = e.data.edge;

		$('#myModalBody').html('');
		var tweet_types_hashtable = {"mention": 0, "quote": 0, "retweet": 0};
		for (var i =0; i < edge.outgoing_ids.length; ++i)
		{
			var type = edge.tweet_types[i];
			(type == "reply") ? type = "mention" : type;
			(type == "origin") ? type = "mention" : type;


			++tweet_types_hashtable[type];
			//title(plain text)
			$("#myModalBody").append(edge.titles[i]);
			//see tweet, see article
			var tweetURL = TWEET_URL.replace("%0", edge.target).replace("%1", edge.outgoing_ids[i]);
			$("#myModalBody").append('<div class="modal_links">See <a target="_blank" href="'+ tweetURL + '">tweet</a>' +
			' or  <a target="_blank" href="'+ edge.url_raws[i]+ '">article</a></div>');
		}

		//show modal header, like  User A mentions, quotes, and labels B
		var modal_string = '<a target="_blank" href="https://twitter.com/intent/user?user_id='+ edge.source + '">@' + edge.source_screenName +'</a> ';
		var elemNum = 0;
		for (var key in tweet_types_hashtable)
			if (tweet_types_hashtable.hasOwnProperty(key) && tweet_types_hashtable[key] > 0)
			{
				(0 == elemNum++) ? (modal_string += " ") : (modal_string += ", ");
				if("mention" == key)
					modal_string += "mentioned";
				else if ("retweet" == key)
					modal_string += "was retweeted by";
				else if ("quote" == key)
					modal_string += "was quoted by";
			}

		modal_string += ' <a target="_blank" href="https://twitter.com/intent/user?user_id='+ edge.target + '">@' + edge.target_screenName +'</a> ';

		$('#myModalLabel').html(modal_string);

		$("#myModal").off('shown.bs.modal show.bs.modal');
		$("#myModal").on("shown.bs.modal show.bs.modal", function(){
			$(".modal-dialog").scrollTop(0);
		});

		$('#myModal').modal('toggle');

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

	$("#load_more button").on("click", function(){
		original_bottom = $("#visualize").offset().top;
	});

	$("#visualize, #visualize_top").on("click", function(event){
		spinStart();
		//Timeline
		var url_ids = [];
		// $("#graphs").hide();
		app.show_graphs = false;

		if(s)
		{
			s.kill();
			s = null;
			console.debug("Killed Existing Sigma");
		}

		var checked = $("#article_list input:checked");

		if(checked.length > 20)
		{
			alert("You can visualize a maximum of 20 articles.");
			event.preventDefault();
			event.stopPropagation();
			spinStop(true);
			return false;
		}
		var counter = 0;
		checked.each(function(){
			var val = $(this).val();
			url_ids.push(val * 1);
			// console.log(val);
			counter ++;

		});

		var timeline_paras = GetTimeLineParas(url_ids);

		if(counter <= 0)
		{
			alert("Select at least one article to visualize.");
			spinStop();
			spinStop();
			spinStop();
			enableInput();
			return false;
		}

		var timeline_request = $.ajax({
			url: configuration.timeline_url,
            headers: configuration.timeline_headers,
            data: timeline_paras,
            dataType: "json",
		});
		timeline_request.done(function (msg) {
			//nvd3 charts
			// $("#graphs").show();
			app.show_graphs = true;
            retrieveTimeSeriesData(msg.timeline);

			window.scroll(0,$("#graphs").offset().top);
        });
		timeline_request.fail(function (jqXHR, textStatus) {
            alert("Get TimeLine Request failed: " + textStatus);
        });
		timeline_request.complete(function(){
			spinStop();
		})

		//Network
		var paras = GetNetworkParas(url_ids); //p is json object
        var graph_request = $.ajax({
            //type: "GET",
            url: configuration.network_url,
            headers: configuration.network_headers,
            data: paras,
            dataType: "json",
        });

        graph_request.done(function (msg){
			edges = msg.edges.map(function(x){
				y = x;
				y.site_domain = x.domain;
				y.pub_date = x.publish_date;
				y.url_raw = x.canonical_url;
				return y;
			});
		});

        graph_request.fail(function (jqXHR, textStatus) {
            alert("Get Graph Request failed: " + textStatus);
			spinStop();
        });
		graph_request.complete(function(){
			enableInput();
		})
	});

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
