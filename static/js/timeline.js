function timeline(data)
{
	if(!data)
	{
		return {"time": null, "factChecking_values": [], "fake_values": []};

	}
	var time = data.claim.timestamp,
		volume_factchecking = data.fact_checking.volume, volume_fake = data.claim.volume,
		factChecking_values = [], fake_values = [];

	for (var i in volume_fake)
	{
		factChecking_values.push({x: new Date(time[i]),
			y: volume_factchecking[i]});
		fake_values.push({x: new Date(time[i]),
			y: volume_fake[i]});
	}

	return {"time": time, "factChecking_values": factChecking_values, "fake_values": fake_values};
}
