
function getFilename(ext){
	var keys = $.map(chartData, function(x){ return x.key }),
	filename = ['Timeline', keys.join('&'), ].join('_') + '.' + ext;
	return filename;
}

function set2Digit(num)
{
	return num > 9 ? ""+num : "0"+num;
}
