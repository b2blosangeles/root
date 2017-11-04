var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var cfg0 = require(env.site_path + '/api/cfg/db.json');

var CP = new pkg.crowdProcess();
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
	var CP1 = new pkg.crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				pkg.request({
					url: 'http://'+ ip +'/checkip/',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					if (error) {
						cbk1(false);
					} else {
						var v = [];
						try { v = JSON.parse(body); } catch(e) {}
						if (v.indexOf(ip) == -1) cbk1(true);
						else {							
							v[v.length+1] = new Date().getTime();
							var connection = mysql.createConnection(cfg0);
							connection.connect();
							var str = "UPDATE `cloud_node` SET `audit` = '" + JSON.stringify(v) + 
							    "' WHERE node_ip = '" + ip + "'";
							onnection.query(str, function (error, results, fields) {
								connection.end();
								if (error) {
									cbk(false);
								} else {
									cbk(false);
								}
							}); 
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
		res.send(data.results);
	}, 3000
);	
 
return true;
