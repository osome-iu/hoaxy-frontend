


function disableInput() {
	console.debug("Legacy disableInput called.");
	app.input_disabled = true;
}
function enableInput() {
	console.debug("Legacy enableInput called.");
	app.input_disabled = false;
}


function getFilename(ext){
	var keys = $.map(chartData, function(x){ return x.key }),
	filename = ['Timeline', keys.join('&'), ].join('_') + '.' + ext;
	return filename;
}






var spin_counter = 0;
function spinStop(reset){
	console.debug("Legacy spinStop called. Use app.spinStart() instead.");
	app.spinStop(reset);
}
function spinStart(){
	console.debug("Legacy spinStart called. Use app.spinStart() instead.")
	app.spinStart();
}
