


function disableInput() {
	$('#loader').show(); //loading sign appear
	$("#query, input[name=include_user_mentions], input[name=sort_by]").prop('disabled', true);
}
function enableInput() {
	$('#loader').hide(); //loading sign disappear
	$("#query, input[name=include_user_mentions], input[name=sort_by]").prop('disabled', false);

}

var colors = {
	node_colors : {
	"fact_checking" : 'darkblue',
	"claim" : 'darkblue'},
	edge_colors : {
	"fact_checking" : 'green',
	"fact_checking_dark" : 'green',
	"claim" : 'orange',
	"claim_dark" : 'orange'
}
};


//opts 可从网站在线制作
var opts = {
    lines: 15, // 花瓣数目
    length: 10, // 花瓣长度
    width: 5, // 花瓣宽度
    radius: 20, // 花瓣距中心半径
    corners: 1, // 花瓣圆滑度 (0-1)
    rotate: 0, // 花瓣旋转角度
    direction: 1, // 花瓣旋转方向 1: 顺时针, -1: 逆时针
    color: '#0275D8', // 花瓣颜色
    speed: 1, // 花瓣旋转速度
    trail: 20, // 花瓣旋转时的拖影(百分比)
    shadow: false, // 花瓣是否显示阴影
    hwaccel: false, //spinner 是否启用硬件加速及高速旋转
    className: 'spinner', // spinner css 样式名称
    zIndex: 2e9, // spinner的z轴 (默认是2000000000)
    top: '50%', // spinner 相对父容器Top定位 单位 px
    left: '50%', // spinner 相对父容器Left定位 单位 px
    position: 'absolute', // Element positioning
};


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



	function makeArticleItem(url)
	{

		var string_element = "";
		var element_class = url.site_type;
		if(element_class !== "fact_checking")
		element_class = "claim";

		string_element += '<li class="rounded ' + element_class + '">';
		string_element += '	<label>';
		string_element += '		<input type="checkbox" id="' + url.url_id + '" value="' + url.url_id + '" />';


		var pub_date = new Date(url.pub_date);
		var dateline = $.datepicker.formatDate('M d, yy', pub_date);
		var id = Math.floor(Math.random() * 100000);

		string_element += '			<span class="article_title"><a href="' + url.url_raw + '" target="_blank">' + url.title + '</a></span>';
		string_element += '			<span class=""><span class="article_domain">From <a href="http://' + url.site_domain + '" target="_blank">' + url.site_domain + '</a></span>';
		string_element += '			<span class="article_date">on ' + dateline + '</span></span>';
		string_element += '			<span class="article_stats"><span><b>' + url.number_of_tweets + '</b> Tweets</span></span>';
		string_element += '			<div class="clearfix"></div>';
		string_element += '	</label>';
		string_element += '</li>';

		var f = function (id){
		}(id);

		return string_element;
	}
	var max_articles = 20;
	var articles_loaded = 0;
	var all_urls = null;
	dontScroll = false;

	function addArticles(){
		var starting_index = articles_loaded;
		for(var i = starting_index, x = all_urls.length; i < (max_articles + starting_index) && i < x; i++ )
		{
			var url = all_urls[i];

			var string_element = makeArticleItem(url);

			$("#article_list").append(string_element);
			articles_loaded ++;
		}
		// console.debug(articles_loaded);
		if(articles_loaded >= 100)
		{
			$("#load_more .text-muted").html("Your query has found too many matches for us to load. Please narrow down your query and try again to get more articles.");
			$("#load_more button").addClass("disabled").prop("disabled", true);
		}
		else if(articles_loaded >= all_urls.length && all_urls.length < 100)
		{
			$("#load_more .text-muted").html("We couldn't find any more articles for this query.");
			$("#load_more button").addClass("disabled").prop("disabled", true);
		}
		else
		{
			$("#load_more .text-muted").empty();
			$("#load_more button").removeClass("disabled").prop("disabled", false);
		}
	}

	$("#load_more button").on("click", function(){
		addArticles();

		original_bottom = $("#visualize").offset().top;
	});

    $("#form form").submit(function (e) {

		articles_loaded = 0;

		e.preventDefault();
		e.stopPropagation();

		disableInput();
		spinStart();
		$("#articles, #graphs").hide();
		$("#select_all").prop("checked", false);

		if(!$("#query").val())
		{
			alert("You must input a claim.");
			spinStop();
			spinStop();
			spinStop();
			enableInput();
			return false;
		}
		//URLS
		var urls_paras = GetURLsParas();
		changeURLParams();

		var urls_request = $.ajax({
			url: configuration.articles_url,
            headers: configuration.articles_headers,
            data: urls_paras,
            dataType: "json",
		});
		urls_request.done(function (msg) {
			// console.debug(msg);
			var urls_model = msg;

			if(!msg.articles || !msg.articles.length)
			{
				alert("Your query did not return any results.");
				return false;
			}

			urls_model.urls = msg.articles.map(function(x){
				y = x;
				y.site_domain = x.domain;
				y.url_id = x.id;
				y.pub_date = x.publish_date;
				y.url_raw = x.canonical_url;
				return y;
			});
			// console.debug(urls_model);
			all_urls = null;
			all_urls = urls_model.urls;

			$("#article_list").empty();
			// console.log(urls_model.urls);
			// for( var i in urls_model.urls)


			addArticles();


			$("#articles").show();
			var visualize_top = $("#visualize_top");
			var visualize_bottom = $("#visualize");

			if(!dontScroll)
			{
				window.scroll(0,$("#articles").offset().top);
			}
			else
			{
				dontScroll = false;
			}
		});
		urls_request.fail(function (jqXHR, textStatus) {
            alert("Get URLs Request failed: " + textStatus);
			console.log('ERROR', textStatus);
        });
		urls_request.complete(function(){
			spinStop(true);
			enableInput();
		});



	});



	$("#visualize, #visualize_top").on("click", function(event){
		spinStart();
		//Timeline
		var url_ids = [];
		$("#graphs").hide();

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
			$("#graphs").show();
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

			$("#graph_error").remove();
            if(msg.error)
            {
				edges = null;
				$("#zoom-in").hide();
				$("#zoom-out").hide();
                console.debug("Not enough data.  Could not create graph.");
				$("#graph-container").prepend("<div id='graph_error'>There was not enough data to generate a network graph.  Try selecting more popular articles to visualize.</div>");
                spinStop();
				return false;
            }

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



	spinStop();

	$("#articles, #graphs").hide();
	loadURLParams();
});

var spin_timer = null;

var spin_counter = 0;
function spinStop(reset){
	spin_counter --;
	if(reset === true)
	{
		spin_counter = 0;
	}

	if(spin_counter <= 0)
	{
		spinner = undefined;
		$("#spinner").hide();
		clearTimeout(spin_timer);
		spin_timer = null;
	}

}
function spinStart(){
	spin_counter = 2;
	$("#spinner").show();
	var target = document.getElementById('spinner');
	spinner = new Spinner(opts).spin(target);
	//timeout after 90 seconds so we're not stuck in an endless spinning loop.
	if(spin_timer)
	{
		clearTimeout(spin_timer);
		spin_timer = null;
	}
	spin_timer = setTimeout(function(){
		alert("The app is taking too long to respond.  Please try again later.");
		spinStop(true);
		enableInput();
	}, 90000);
}


function populateQuery(query)
{
	$("#query").val(query);
}
