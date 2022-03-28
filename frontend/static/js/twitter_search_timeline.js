function TwitterSearchTimeline(settings){
	var updateDateRangeCallback = settings.updateDateRangeCallback;
	var graphAnimation = settings.graphAnimation;

	var returnObj = {};
	var chart = null;
	var lastData = null;
	var chartData = [];
	var chartDataWithTweetRates = {};

	chart = nv.models.lineWithFocusChart()
		.showLegend(false)
		.useInteractiveGuideline(true);

	// Including interactive tooltips that contain the time period date
  // Along with the new tweets on that time period
	chart.interactiveLayer.tooltip.contentGenerator(function(chartData) {
			var currentTimeStepIndex;
			// In Twitter case, we convert data from: MM/DD/YYYY HH:MM (AM/PM)
			// and extract all components to create a date
			var fullRawDate = chartData.value;
			var dateSplits = fullRawDate.split(' ');
			var monthDayYear = dateSplits[0].split('/');
			var month = monthDayYear[0];
			var day = monthDayYear[1];
			var year = monthDayYear[2];
			var hoursMinutesSeconds = dateSplits[1].split(':');
			var hours = hoursMinutesSeconds[0];
			var minutes = hoursMinutesSeconds[1];

			// Twitter format is now only hours and minutes:

			//var seconds = hoursMinutesSeconds[2];

			// We subtract 1 from month because Date takes 0 indexed months
			var currentTimeStepDate = new Date(parseInt(year), parseInt(month)-1,
				parseInt(day), parseInt(hours), parseInt(minutes)).getTime();
			// Finding the date match from the chartDataWithTweetRates object
			// We tried to directly use indexes before but indexes get changed
			// Due to the way D3js handles tooltips/charts
			for (dateRateIx in chartDataWithTweetRates[0].values) {
				var dateRateMatchWithSeconds =
					new Date(chartDataWithTweetRates[0].values[dateRateIx].x);

        // setting seconds to 0 to match Twitter format that now only includes HH:MM
				var dateRateMatch = dateRateMatchWithSeconds.setSeconds(0)

				if (currentTimeStepDate === dateRateMatch) {
					currentTimeStepIndex = dateRateIx;
				}
			}
			// Returning formatted and styled tooltip
			return "<div><b>" + String(chartData.value)
												+ "</b></div>"
												+ "<div style='display:flex;\
																			 justify-content:left;\
																			 align-items:center;'>\
													    <div style='display:inline-block;\
																					margin:5px;\
																					width:10px;\
																					height:10px;\
																					background-color:"
																					+ String(colors.edge_colors.claim)
																					+ ";'>\
															</div>\
															<div>New Tweets: "
															+ String(chartDataWithTweetRates[0].values[currentTimeStepIndex].y)
															+ "</div>\
						  						</div>";
	});

	chart.margin({right: 70, bottom: 80})

	chart.xAxis
		.tickFormat(dateFormatter)
		.ticks(5)
		.staggerLabels(true);
	chart.x2Axis
		.tickFormat(dateFormatter)
		.staggerLabels(true)
		.ticks(5);

	// chart.focus.margin({bottom: 50});
	// chart.xAxis
	// 	.tickValues(function(x){
	// 		console.debug(x);
	// 	});
	// chart.xAxis.rotateLabels(-45);

	chart.forceY([0])
	chart.yAxis.axisLabel("Cumulative Tweets");

	chart.color([colors.edge_colors.claim, "#00ff00"]); //color match with those of nodes

  /**
   * Redraw the timeline
   */
	function redraw(){
		if(chart)
		{
			chart.dispatch.on("brush", null);
			// chart.x2Axis.margin({bottom: 100});
			d3.select('#chart svg')
			.call(chart);
			chart.dispatch.on("brush", updateDateRange);

			d3.selectAll('#chart svg .nv-axisMax-x text')
			.attr("transform", "translate(0, 12)");
			d3.select('#chart svg .nvd3 > g')
			.attr("transform", "translate(0, -10)");
		}
  }
  /**
   * Initialize the timeline
   */
	function removeUpdateDateRangeCallback(){
		chart.dispatch.on("brush", null);
	}

  /**
   * Formats the date using d3.time
   * @param  {String} d The date to be formatted
   * @return {String} The formatted time
   */
	function dateFormatter(d) {
		// return d3.time.format('%m/%d/%Y %H:%M:%S %p')(new Date(d))
		var date = new Date(d);
		var formattedDate = d3.time.format('%x %H:%M')(date);
		return formattedDate;
	}

  /**
   * Shows how many new tweets of a particular type occurred at a point in time
   * @param  {Object} chartData The data that the timeline was drawn with
   */
	function calculateTweetRates(chartData) {
		// Deep copy of the chart data as any shallow copy will mess up
		// The timeline itself, we only use this new copy for the
		// Computed tooltips
		chartDataWithTweetRates = JSON.parse(JSON.stringify(chartData));

		var previousTimestepTweets = 0;
		var numTimeIncrements = chartDataWithTweetRates[0].values.length;

		for (var i = 0; i < numTimeIncrements; i++) {
			var currentTweets = chartDataWithTweetRates[0].values[i].y;
		  chartDataWithTweetRates[0].values[i].y = currentTweets - previousTimestepTweets;
			previousTimestepTweets = currentTweets;
		}
	}

	var debounce_timer = 0;
	var updateDateRange = function(extent){
		clearTimeout(debounce_timer);
		debounce_timer = setTimeout(function(){
			_updateDateRange(extent);
		}, 200);
	};

  /**
   * Updates the date range if the user selected a different one
   * @param  {Object} extent The timeframe selection by the user
   */
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
		calculateTweetRates(chartData);

		// This adds an event handler to the focus chart
		try {
			d3.select('#chart svg')
			.datum(chartData)
			.call(chart);

			
			d3.selectAll('#chart svg .nv-axisMax-x text')
			.attr("transform", "translate(0, 12)");
			d3.select('#chart svg .nvd3 > g')
			.attr("transform", "translate(0, -10)");
		}
		catch(e){
			console.debug(e);
		}
	}

  /**
   * Updates the range of dates on graph \
   * Seen outside twitter_search_timeline as updateDateRange() \
   * (May be deprecated)
   */
	function triggerUpdateRange(){
		try{
			d3.select('#chart svg')
			.datum(chartData)
			.call(chart);

			
			d3.selectAll('#chart svg .nv-axisMax-x text')
			.attr("transform", "translate(0, 12)");
			d3.select('#chart svg .nvd3 > g')
			.attr("transform", "translate(0, -10)");
		}
		catch(e){
			console.debug("Error in triggerUpdataRange.", e);
		}
	}

  /**
   * Update timestamp based on the graph's timestamp
   */
	function UpdateTimestamp(){
		if(graphAnimation.current_timestamp)
		{
			chartData[1] = {
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
			delete chartData[1];
		}

		chart.dispatch.on("brush", null);
		d3.select('#chart svg')
		.datum(chartData)
		.call(chart);
		
		d3.selectAll('#chart svg .nv-axisMax-x text')
		.attr("transform", "translate(0, 12)");
		d3.select('#chart svg .nvd3 > g')
		.attr("transform", "translate(0, -10)");
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
