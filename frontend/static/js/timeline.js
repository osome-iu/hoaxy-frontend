function HoaxyTimeline(updateDateRangeCallback){

	var returnObj = {};
	chart = null;
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

	function dateFormatter(d) {
		return d3.time.format('%x')(new Date(d))
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
			updateDateRangeCallback(edges, starting_time, ending_time);
		}
		catch(e)
		{
			setTimeout(function(){
				updateDateRange(extent);
			}, 500);
		}

	}

	var Update = function(edges){
		if(!edges)
		{
			return {"time": null, "factChecking_values": [], "fake_values": []};
		}
		time = edges.claim.timestamp,
		volume_factchecking = edges.fact_checking.volume, volume_fake = edges.claim.volume,
		factChecking_values = [], fake_values = [];


		for (var i in volume_fake)
		{
			factChecking_values.push({x: new Date(time[i]), y: volume_factchecking[i]});
			fake_values.push({x: new Date(time[i]), y: volume_fake[i]});
		}

		var chartData = [];

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

		app.show_zoom_buttons = true;

		chartData.push(fake_series);
		chartData.push(factChecking_series);

		// This adds an event handler to the focus chart
		try {
			chart.dispatch.on("brush", updateDateRange);
			d3.select('#chart svg')
			.datum(chartData)
			.call(chart);
		}
		catch(e){
			console.debug(e);
		}
	}

	returnObj.update = Update;
	returnObj.chart = chart;
	return returnObj;
}
