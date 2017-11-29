var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var config = require(env.config_path + '/config.json');
var cfg_db = config.db;

var CP = new pkg.crowdProcess();
var _f = {};

_f['D1'] = function(cbk) {
	var str = "SELECT * FROM `cloud_node`";
	var connection = mysql.createConnection(cfg_db);
	connection.connect();
	connection.query(str, function (error, results, fields) {
		connection.end();
		if (error) {
			cbk(false);
		} else {
			cbk(results);
		}
	});	
}

CP.parallel(
	_f,
	function(data) {
		res.send(data);
	},
	10000
);

