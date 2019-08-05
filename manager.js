//=================================================
// CONFIGS
//-------------------------------------------------

require('dotenv').config();
const mysql = require('mysql'),
	cTable = require('console.table'),
	inquirer = require('inquirer');

const connection = mysql.createConnection({
	host     : process.env.DB_HOST,
	port     : process.env.DB_PORT,
	user     : process.env.DB_USER,
	password : process.env.DB_PASS,
	database : process.env.DB_NAME
});

//=================================================
// BAMAZON
//-------------------------------------------------

const bamazon = {
	init           : function() {
		connection.connect((err) => {
			if (err) console.log(err);
			this.managerSelect();
		});
	},

	formatCurrency : function(num) {
		return (
			'$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
		);
	},

	managerSelect  : function() {
		console.log('');
		inquirer
			.prompt([
				{
					type    : 'list',
					name    : 'action',
					message : 'What would you like to do today?',
					choices : [
						'View All Products',
						'View Low Inventory',
						'Restock Inventory',
						'Add New Product',
						'Exit Bamazon'
					]
				}
			])
			.then((res) => {
				switch (res.action) {
					case 'View All Products':
						bamazon.viewAll();
						break;
					case 'View Low Inventory':
						bamazon.viewLow();
						break;
					case 'Restock Inventory':
						bamazon.restock();
						break;
					case 'Add New Product':
						bamazon.addNew();
						break;
					case 'Exit Bamazon':
						bamazon.exitBamazon();
						break;
				}
			})
			.catch((err) => console.log(err));
	},

	displayData    : function(res) {
		let formattedData = [];
		res.forEach((item) => {
			let newObj = {
				ID         : item.id,
				Name       : item.name,
				Price      : this.formatCurrency(item.price),
				'In Stock' : item.stock
			};
			formattedData.push(newObj);
		});
		console.log(cTable.getTable(formattedData));
	},

	viewAll        : function() {
		console.log('');
		connection.query('SELECT * FROM products', (err, res) => {
			if (err) console.log(err);
			this.displayData(res);
		});
		setTimeout(this.managerSelect, 400);
	},

	viewLow        : function() {
		console.log('');
		connection.query(
			'SELECT * FROM products WHERE stock < 5 ',
			(err, res) => {
				if (err) console.log(err);
				this.displayData(res);
			}
		);
		setTimeout(this.managerSelect, 400);
	},

	restock        : function() {},

	addNew         : function() {},

	exitBamazon    : function() {
		console.log('');
		console.log('Exiting Bamazon...');
		connection.end();
		console.log('It is now safe to close the program.');
	}
};

//=================================================
// INIT
//-------------------------------------------------

bamazon.init();
