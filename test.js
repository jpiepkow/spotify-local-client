var Spot = require('./index.js')
var spot_local = new Spot({
	csrf:''
	// will get oauth csrf token and port running automatically
})
spot_local.on('change',function(res) {
	console.log(res)	
})
spot_local.on('closed',function(res) {
	console.log(res)
})
spot_local.on('open',function(res) {
	console.log(res)
}
spot_local.play(`spotify:track:0LTZD4vTsp0EN1wXatc9IR`)
spot_local.pause(true)
spot_local.pause(false)
