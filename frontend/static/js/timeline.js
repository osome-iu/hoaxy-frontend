function HoaxyTimeline(settings){
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

	chart.color([colors.edge_colors.claim, colors.edge_colors.fact_checking, "#00ff00"]); //color match with those of nodes
	var chartData = [];

	function redraw(){
		if(chart)
		{
			chart.dispatch.on("brush", null);
			d3.select('#chart svg')
			.call(chart);
			chart.dispatch.on("brush", updateDateRange);
			// chart.interactiveLayer.dispatch.on("elementClick", function(e){ console.debug(new Date(e.pointXValue)) });
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
			// console.debug("timeline");
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
		lastData = data;
		// var min_time = new Date().getTime();
		var max_time = 0;
		if(!data)
		{
			return {"time": null, "factChecking_values": [], "fake_values": []};
		}
		time = data.claim.timestamp,
		volume_factchecking = data.fact_checking.volume, volume_fake = data.claim.volume,
		factChecking_values = [], fake_values = [];


		for (var i in volume_fake)
		{
			var ts = new Date(time[i]).getTime();
			if(volume_factchecking[i] > max)
			{
				max = volume_factchecking[i];
			}
			if(volume_fake[i] > max)
			{
				max = volume_fake[i];
			}
			// if(ts < min_time)
			// {
			// 	min_time = ts;
			// }
			if(ts > max_time)
			{
				max_time = ts;
			}
			// console.debug(time[i], max_time);

			factChecking_values.push({x: new Date(time[i]), y: volume_factchecking[i]});
			fake_values.push({x: new Date(time[i]), y: volume_fake[i]});
		}

// console.debug("Max:", max);
// console.debug("Time:", min_time, min_time + Math.floor((max_time - min_time)/2), max_time);

		chartData.length = 0;
		if(!!chart.update){
			chart.update();
		}

		var factChecking_series = {
			key: 'Fact-checks',
			values: factChecking_values,
			c: colors.edge_colors.fact_checking
		};
		var fake_series = {
			key: 'Claims',
			values: fake_values,
			c:colors.edge_colors.claim
		};

		// app.show_zoom_buttons = true;

		chartData.push(fake_series);
		chartData.push(factChecking_series);
		// console.debug(factChecking_series);

		// chartData.push({
		// 	key: 'Time',
		// 	values: [
		// 		{ x: new Date(max_time), y: 0},
		// 		{ x: new Date(max_time), y: max}
		// 	],
		// 	// c: "#00ff00"
        //
		// });

		// This adds an event handler to the focus chart
		try {
			// chart.dispatch.on("brush", updateDateRange);
			d3.select('#chart svg')
			.datum(chartData)
			.call(chart);
		}
		catch(e){
			console.debug(e);
		}

		// console.log(chart);
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
				// disabled: true
				// c: "#00ff00"

			};

			// chartData[2].values = [
			// 		{ x: new Date(graphAnimation.current_timestamp), y: 0},
			// 		{ x: new Date(graphAnimation.current_timestamp), y: max}
			// 	];
		}
		else
		{
			delete chartData[2];
		}
		// console.debug(chartData);
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
	// returnObj.getLastData = function(){ return lastData };
	return returnObj;
}
