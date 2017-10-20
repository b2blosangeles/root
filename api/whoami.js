var v = req.body.ip;
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

var CP = new pkg.crowdProcess();
var _f = {};

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
							cbk('B')
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
			res.send(data.results);
		} else {
			res.send(data.status);
		}
	},
	10000
);
