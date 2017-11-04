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
						cbk1(true);
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
/*
var v = req.body.ip, space = req.body.space;
if (!v) {
	res.send({error:'Missing ip'});
	return true;
} 

function isIp(ip) {
    var arrIp = ip.split(".");
    if (arrIp.length !== 4) return "Invalid IP";
    for (let oct of arrIp) {
        if ( isNaN(oct) || Number(oct) < 0 || Number(oct) > 255)
            return false;
    }
    return true;
}



for (var i = 0; i < v.length; i++) {
	_f['P_'+i] = (function(i) {
		return function(cbk) {
			if (isIp(v[i])) {
				pkg.request({
					url: 'http://'+v[i]+'/checkip/',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					if (error) {
						cbk(false);
					} else {
						var ips = [];
						try { ips = JSON.parse(body);} catch (e) { }
						if (ips.indexOf(v[i]) != -1) {
							cbk(v[i]);
						} else {
							cbk(false)
						}
					}
				   });
			} else {
				cbk(false);
			}
		}	
	})(i);
}


CP.parallel(
	_f,
	function(data) {
		if (data.status == "success") {
			var ip = '';
			for (var o in data.results) {
				if (data.results[o]) {
					
					ip = data.results[o];
					break;
				}
			}
			if (ip) {
				var connection = mysql.createConnection(cfg0);
				connection.connect();
				var str = 'INSERT INTO `cloud_server` (`node_ip`,`space`,`created`, `updated`) VALUES (' +
				    "'"+ip+"','" + JSON.stringify(space) + "',NOW(), NOW())  " +
				    " ON DUPLICATE KEY UPDATE `updated` = NOW(), `space` = '" + JSON.stringify(space) + "'; ";
				// encodeURIComponent
				connection.query(str, function (error, results, fields) {
					connection.end();
					if (error) {
						res.send({status:'error', value:error.message});
					} else {
						res.send({status:'success', value:ip});
					}
				}); 
			} else {
				res.send({status:'error', value:'No IP Addresss'});
			}	
			
		} else {
			res.send({status:'error', value:JSON.stringify(data)});
		}
	},
	10000
);
*/
