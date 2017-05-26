function set2Digit(num)
{
	return num > 9 ? ""+num : "0"+num;
}
function GetNetworkParas(url_ids)
{
	var new_url_ids = "[" + url_ids.toString() + "]";

	var include_user_mentions = $("input[name=include_user_mentions]:checked").val();
	var data = {
        "include_user_mentions" : "true",
        "ids" : new_url_ids,
    };
    return data;
}

function GetTimeLineParas(url_ids)
{
	var new_url_ids = "[" + url_ids.toString() + "]";
	var data = {
        "resolution": "D",
        "ids" : new_url_ids, //USED TO BE q_top_hits,
    };
    return data;
}

function GetURLsParas()
{
    var query = $("#query").val(),
	sort_by = $("input[name=sort_by]:checked").val();

	var data = {
        "query": query,
        "sort_by" : sort_by
    };
    return data;
}

function changeURLParams(){

	var query = $("#query").val();
	var sort = $("input[name=sort_by]:checked").val();

	var query_string = "query=" + encodeURIComponent(query) + "&sort=" + sort; // + "&mentions=" + mentions;
	location.hash = query_string;

	return query_string;
}

function loadURLParams(){
	var query_string = location.hash.replace("#", "");
	var params = query_string.split("&");
	var params_object = {};

	for( var i in params)
	{
		var param = params[i].split("=");
		var key = param[0];
		var value = param[1];

		params_object[key] = value;
	}
	if(params_object.query)
	{
		$("#query").val(decodeURIComponent(params_object.query));
	}
	if(params_object.sort === "relevant")
	{
		$("#sort_by_relevant").prop("checked", true);
	}
	else if(params_object.sort === "recent")
	{
		$("#sort_by_recent").prop("checked", true);

	}

	if(params_object.query)
	{
		dontScroll = true;
		$("#submit").trigger("click");
	}

}
