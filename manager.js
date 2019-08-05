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
						setTimeout(bamazon.managerSelect, 400);
						break;
					case 'View Low Inventory':
						bamazon.viewLow();
						setTimeout(bamazon.managerSelect, 400);
						break;
					case 'Restock Inventory':
						bamazon.viewAll();
						setTimeout(bamazon.restock, 400);
						break;
					case 'Add New Product':
						bamazon.promptNewItem();
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
	},

	restock        : function() {
		inquirer
			.prompt([
				{
					type     : 'input',
					name     : 'id',
					message  :
						'Enter the ID of the product you would like to restock:',
					validate : function(value) {
						var valid = !isNaN(parseFloat(value));
						return valid || 'Please enter a number';
					}
				},
				{
					type     : 'input',
					name     : 'quantity',
					message  : 'How many are you adding to the existing stock?',
					validate : function(value) {
						var valid = !isNaN(parseFloat(value));
						return valid || 'Please enter a number';
					}
				}
			])
			.then((res) => {
				bamazon.updateStock(res);
			})
			.catch((err) => console.log(err));
	},

	updateStock    : function(req) {
		connection.query(
			'SELECT * FROM products WHERE id = ?',
			req.id,
			(err, res) => {
				if (err) console.log(err);
				let newStock = res[0].stock + parseFloat(req.quantity);
				connection.query(
					'UPDATE products SET ? WHERE ?',
					[
						{ stock: newStock },
						{ id: req.id }
					],
					(err, res2) => {
						if (err) console.log(err);
						console.log(`\nSuccessfully restocked ${res[0].name}!`);
						bamazon.managerSelect();
					}
				);
			}
		);
	},

	promptNewItem  : function() {
		console.log('');
		inquirer
			.prompt([
				{
					type    : 'input',
					name    : 'name',
					message : "Please enter the product's name:"
				},
				{
					type    : 'input',
					name    : 'dept',
					message : "Please enter the product's department:"
				},
				{
					type     : 'input',
					name     : 'price',
					message  :
						"Please enter the product's price (000.00 format):",
					validate : function(value) {
						var valid = !isNaN(parseFloat(value));
						return valid || 'Please enter a number';
					}
				},
				{
					type     : 'input',
					name     : 'stock',
					message  : 'How many are you stocking:',
					validate : function(value) {
						var valid = !isNaN(parseFloat(value));
						return valid || 'Please enter a number';
					}
				}
			])
			.then((res) => bamazon.addNewItem(res))
			.catch((err) => console.log(err));
	},

	addNewItem     : function(req) {
		connection.query(
			'INSERT INTO products SET ?',
			{
				name  : req.name,
				dept  : req.dept,
				price : Number(req.price).toFixed(2),
				stock : req.stock
			},
			(err, res) => {
				if (err) console.log(err);
				console.log(`\nSuccessfully added ${req.name}!`);
				bamazon.managerSelect();
			}
		);
	},

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
