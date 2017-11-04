var path = require('path'), env = {root_path:path.join(__dirname, '../..')};
env.site_path = env.root_path + '/site';

var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var cfg0 = require(env.site_path + '/api/cfg/db.json');
var crowdProcess =  require(env.root_path + '/package/crowdProcess/crowdProcess');
var request = require(env.root_path + '/package/request/node_modules/request');	

var CP = new crowdProcess();
var _f = {};

_f['D1'] = function(cbk) {
	var str = "SELECT * FROM `cloud_node`";
	var connection = mysql.createConnection(cfg0);
	connection.connect();
	connection.query(str, function (error, results, fields) {
		connection.end();
		if (error) {
			cbk(false);
			CP.exit = 1;
		} else {
			cbk(results);
		}
	});	
}
_f['D2'] = function(cbk) {
	var CP1 = new crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				request({
					url: 'http://'+ ip +'/checkip/',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					var changeStatus = function(mark, cbk) {
						var a = [], audit = [], score = 0;
						try { if (recs[i].audit) a = JSON.parse(recs[i].audit); } catch(e) {}
		
						if (mark) audit[audit.length] = 1;
						else audit[audit.length] = 0;

						for (var j=0; j< a.length; j++) {
							if (j < 5) audit[audit.length] = a[j];
							else break;
						}
						for (var j=0; j < audit.length; j++) {
							if (audit[j]) score += Math.floor(Math.pow(10 - (j * 2), 8) * 0.00001);
						} 
						var connection = mysql.createConnection(cfg0);
						connection.connect();
						var str = "UPDATE `cloud_node` SET `audit` = '" + JSON.stringify(audit) + 
						    "', `score` = '" + score + "' WHERE `node_ip` = '" + ip + "'";
						connection.query(str, function (error, results, fields) {
							connection.end();
							if (error) {
								cbk(true);
							} else {
								cbk(true);
							}
						});						
					}
					
					if (error) {
						changeStatus(true, cbk1);
					} else {
						var v = [];
						try { v = JSON.parse(body); } catch(e) {}
						if (v.indexOf(ip) !== -1) changeStatus(false, cbk1);
						else {
							changeStatus(true, cbk1);
						}	
					}
				   });	
			}
		})(i);
	}
	
	CP1.parallel(
		_f1,
		function(data) {
			cbk(data);
		}, 2000
	);	
}
CP.serial(
	_f,
	function(data) {
		process.stdout.write(JSON.stringify(data.results));
	}, 3000
);	
 
return true;
