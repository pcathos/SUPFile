const mysql = require('mysql');
var databasePool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'MySQL185788688',
				'database':'supfile'

				// 'host':'172.17.0.2',
				// 'user':'root',
				// 'password':'111',
				// 'database':'supfile'
			});

module.exports = databasePool;