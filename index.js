const request = require('request');
// TODO: look ports constently until app open and then call opened event...also more reliable timeout of version reqeuests.
var spot = function(config) {
	if(!config) {
		throw new Error('Config with csrf required');
	}
	this.token = config.token || null
	this.csrf = config.csrf;
	this.events = {};
	this.port = config.port || null 
	this.portList = [4370,4371,4372,4373,4374,4375,4376,4377,4378,4379,4380,4381,4382,4383,4384,4385,4386,4387,4388,4389];
	this.statusCheck()
}
spot.prototype.statusCheck = function() {
	var url = `http://127.0.0.1:{PORT}/remote/status.json?csrf=${this.csrf}&oauth={TOKEN}&returnon=login%2Clogout%2Cplay%2Cpause%2Cerror%2Cap&returnafter=5&cors=&ref=`
	var _this = this;
	this.makeRequestWithToken({url:url,method:'get'})
		.then(res => {
			if(_this.events['change']) {
				_this.events['change'](JSON.parse(res));
			}
			if(_this.events['closed'] && JSON.parse(res).online === false) {
				_this.events['closed']('Client Closed!');
			}
			_this.statusCheck()	
		})
		.catch(e => {
			throw new Error(e);
		})
}
spot.prototype.on = function(name,func) {
	this.events[name] = func;
}
spot.prototype.getToken = function() {
	var _this = this
	return new Promise((resolve,reject) => {
		request({
			url: 'https://open.spotify.com/token',
			method: 'GET',
			headers: {
				//needs to be set or returns a fake token
				'User-Agent':"plznofake"
			}
		},(err,body,res) => {
			if(!err && res) {
				_this.token = JSON.parse(res).t;
				resolve(JSON.parse(res).t)
			} else {
				return reject(err)
			}
		})
	})
};
function checkPort(port) {
	return new Promise((resolve,reject) => {
		request({
			url:`http://127.0.0.1:${port}/service/version.json?service=remote&cors=&ref=`,
			method:'GET'
		},(err,body,res) => {
			return res ? reject(port) : resolve(null)
		})	
	})
}
spot.prototype.getPort = function() {
	var _this = this;
	return new Promise((resolve,reject) => {
	Promise.all(this.portList.map(x => checkPort(x)))
	.then(reject)
	.catch(port => {
		_this.port = port 
		return resolve(port)
	})
	})
}
spot.prototype.makeRequestWithToken = function(reqObj) {
	return new Promise((resolve,reject) => {
		_this = this;
		var promiseArr = []
		if(!this.token) {
			promiseArr.push(this.getToken())
		}
		if(!this.port) {
			promiseArr.push(this.getPort())
		}
			Promise.all(promiseArr)
			.then(res => {
				var strWithToken = reqObj.url.replace("{TOKEN}",_this.token)
				var strWithPort = strWithToken.replace("{PORT}",_this.port)
				reqObj.url = strWithPort;
				request(reqObj,(err,body,res) => {
					return err ? reject(err) : resolve(res)
				})
			})
	})
}
spot.prototype.pause = function(bool) {
		var url = `http://127.0.0.1:{PORT}/remote/pause.json?csrf=${this.csrf}&oauth={TOKEN}&context=&pause=${bool}&cors=&ref=`
		return this.makeRequestWithToken({
			url:url,
			method:'GET'
		})	
}
spot.prototype.play = function(songUri) {
		var song = encodeURIComponent(songUri)
		var url = `http://127.0.0.1:{PORT}/remote/play.json?csrf=${this.csrf}&oauth={TOKEN}&context=&uri=${song}&cors=&ref=`
		return this.makeRequestWithToken({
			url:url,
			method:'GET'
	})
}
module.exports = spot;