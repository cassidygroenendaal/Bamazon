//=================================================
// CONFIGS
//-------------------------------------------------

require('dotenv').config();
const mysql = require('mysql'),
	inquirer = require('inquirer');

const pool = mysql.createPool({
	connectionLimit : 10,
	host            : process.env.DB_HOST,
	port            : process.env.DB_PORT,
	user            : process.env.DB_USER,
	password        : process.env.DB_PASS,
	database        : process.env.DB_NAME
});

//=================================================
// BAMAZON
//-------------------------------------------------

const bamazon = {
	init           : function() {
		inquirer
			.prompt([
				{
					type    : 'list',
					name    : 'action',
					message : 'What would you like to do today?',
					choices : [
						'Browse Items',
						'Exit Bamazon'
					]
				}
			])
			.then((res) => {
				switch (res.action) {
					case 'Browse Items':
						bamazon.customerSelect();
						break;
					case 'Exit Bamazon':
						bamazon.exitBamazon();
						break;
				}
			})
			.catch((err) => console.log(err));
	},

	customerSelect : function() {
		this.displayData();
		setTimeout(function() {
			console.log('');
			inquirer
				.prompt([
					{
						type    : 'input',
						name    : 'id',
						message :
							'Please enter the ID Number of the item you wish to purchase:'
					},
					{
						type    : 'input',
						name    : 'quantity',
						message : 'How many would you like to purchase?'
					}
				])
				.then((res) => {
					bamazon.checkDatabase(res);
				})
				.catch((err) => console.log(err));
		}, 100);
	},

	displayData    : function() {
		pool.getConnection((err, connection) => {
			if (err) console.log(err);
			connection.query('SELECT * FROM products', (err, res) => {
				connection.release();
				if (err) console.log(err);
				res.forEach((item) =>
					console.log(`${item.id}: ${item.name}, $${item.price}`)
				);
			});
		});
	},

	checkDatabase  : function(req) {
		pool.getConnection((err, connection) => {
			if (err) console.log(err);
			connection.query(
				'SELECT * FROM products WHERE id = ?',
				req.id,
				(err, res) => {
					connection.release();
					if (err) console.log(err);
					console.log(res);
				}
			);
		});
	},

	exitProcess    : function() {
		console.log('Exiting Current Task...');
	},
	exitBamazon    : function() {
		console.log('Exiting Bamazon...');
		pool.end();
		console.log('It is now safe to close the program.');
	}
};

//=================================================
// INIT
//-------------------------------------------------

bamazon.init();
