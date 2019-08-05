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
			this.customerSelect();
		});
	},

	formatCurrency : function(num) {
		return (
			'$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
		);
	},

	customerSelect : function() {
		console.log('');
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
						this.customerShop();
						break;
					case 'Exit Bamazon':
						bamazon.exitBamazon();
						break;
				}
			})
			.catch((err) => console.log(err));
	},

	customerShop   : function() {
		this.displayData();
		setTimeout(function() {
			inquirer
				.prompt([
					{
						type     : 'input',
						name     : 'id',
						message  :
							'Please enter the ID Number of the item you wish to purchase:',
						validate : function(value) {
							var valid = !isNaN(parseFloat(value));
							return valid || 'Please enter a number';
						}
					},
					{
						type     : 'input',
						name     : 'quantity',
						message  : 'How many would you like to purchase?',
						validate : function(value) {
							var valid = !isNaN(parseFloat(value));
							return valid || 'Please enter a number';
						}
					}
				])
				.then((res) => {
					bamazon.checkDatabase(res);
				})
				.catch((err) => console.log(err));
		}, 400);
	},

	displayData    : function() {
		console.log('');
		connection.query('SELECT * FROM products', (err, res) => {
			if (err) console.log(err);
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
		});
	},

	checkDatabase  : function(req) {
		connection.query(
			'SELECT * FROM products WHERE id = ?',
			req.id,
			(err, res) => {
				if (err) console.log(err);
				if (req.quantity > res[0].stock) {
					console.log('');
					console.log("We don't have that many in stock.");
					this.customerShop();
					return;
				}
				this.purchaseItem(req, res[0]);
			}
		);
	},

	purchaseItem   : function(req, item) {
		let newStock = item.stock - req.quantity;
		connection.query(
			'UPDATE products SET ? WHERE ?',
			[
				{ stock: newStock },
				{ id: req.id }
			],
			(err, res) => {
				if (err) console.log(err);
				let totalPrice = item.price * req.quantity;
				console.log('');
				console.log(
					`Your total comes to: ${this.formatCurrency(totalPrice)}.`
				);
				console.log('Thank you for shopping with Bamazon!');
				this.customerSelect();
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
