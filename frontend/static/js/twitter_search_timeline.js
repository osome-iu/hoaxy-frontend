function TwitterSearchTimeline(settings){
	var updateDateRangeCallback = settings.updateDateRangeCallback;
	var graphAnimation = settings.graphAnimation;

	var returnObj = {};
	var chart = null;
	var lastData = null;

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

	chart.color([colors.edge_colors.claim, "#00ff00"]); //color match with those of nodes
	var chartData = [];

	function redraw(){
		if(chart)
		{
			chart.dispatch.on("brush", null);
			d3.select('#chart svg')
			.call(chart);
			chart.dispatch.on("brush", updateDateRange);
		}
	}
	function removeUpdateDateRangeCallback(){
		chart.dispatch.on("brush", null);
	}

	function dateFormatter(d) {
		return d3.time.format('%x')(new Date(d))
	}

	var debounce_timer = 0;
	var updateDateRange = function(extent){
		clearTimeout(debounce_timer);
		debounce_timer = setTimeout(function(){
			_updateDateRange(extent);
		}, 200);
	};

	function _updateDateRange(extent){
		if(document.getElementById("extent-0"))
		document.getElementById("extent-0").innerHTML = extent.extent[0];
		if(document.getElementById("extent-1"))
		document.getElementById("extent-1").innerHTML = extent.extent[1];

		if(document.getElementById("extent-00"))
		document.getElementById("extent-00").innerHTML = new Date(extent.extent[0]).toISOString();
		if(document.getElementById("extent-11"))
		document.getElementById("extent-11").innerHTML = new Date(extent.extent[1]).toISOString();

		var starting_time = extent.extent[0],
		ending_time = extent.extent[1];

		//only proceed when s.graph is ready
		// if (edges)
		try
		{
			updateDateRangeCallback(starting_time, ending_time);
		}
		catch(e)
		{
			if(e === "Tried to make graph, but there is no data.")
			{
				console.info(e, "This is not an error.");
			}
			else
			{
				console.warn(e);
			}

			setTimeout(function(){
				updateDateRange(extent);
			}, 500);
		}

	}

	var max = 0;
	var Update = function(data){
		max = 0;
		lastData = data;
		var max_time = 0;
		if(!data)
		{
			return {"time": null, "tweet_values": []};
		}
		time = data.claim.timestamp,
		volume_tweets = data.claim.volume,
		tweet_values = [];

		for (var i in volume_tweets)
		{
			var ts = new Date(time[i]).getTime();

			if(volume_tweets[i] > max)
			{
				max = volume_tweets[i];
			}

			if(ts > max_time)
			{
				max_time = ts;
			}

			tweet_values.push({x: new Date(time[i]), y: volume_tweets[i]});
		}

		chartData.length = 0;
		if(!!chart.update){
			chart.update();
		}

		var tweet_series = {
			key: 'Tweets',
			values: tweet_values,
			c:colors.edge_colors.claim
		};

		chartData.push(tweet_series);

		// This adds an event handler to the focus chart
		try {
			d3.select('#chart svg')
			.datum(chartData)
			.call(chart);
		}
		catch(e){
			console.debug(e);
		}
	}

	function triggerUpdateRange(){
		try{
			d3.select('#chart svg')
			.datum(chartData)
			.call(chart);
		}
		catch(e){
			console.debug("Error in triggerUpdataRange.", e);
		}
	}

	function UpdateTimestamp(){
		if(graphAnimation.current_timestamp)
		{

			chartData[2] = {
				key: 'Time',
				values: [
					{ x: new Date(graphAnimation.current_timestamp), y: 0},
					{ x: new Date(graphAnimation.current_timestamp), y: max}
				],
				disableTooltip: true

			};

		}
		else
		{
			delete chartData[2];
		}
		chart.dispatch.on("brush", null);
		d3.select('#chart svg')
		.datum(chartData)
		.call(chart);
		chart.dispatch.on("brush", updateDateRange);

	}

	returnObj.removeUpdateDateRangeCallback = removeUpdateDateRangeCallback;
	returnObj.update = Update;
	returnObj.chart = chart;
	returnObj.redraw = redraw;
	returnObj.updateDateRange = triggerUpdateRange;
	returnObj.updateTimestamp = UpdateTimestamp;
	return returnObj;
}
