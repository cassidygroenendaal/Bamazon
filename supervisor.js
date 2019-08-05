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
	init             : function() {
		connection.connect((err) => {
			if (err) console.log(err);
			this.supervisorSelect();
		});
	},

	formatCurrency   : function(num) {
		return (
			'$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
		);
	},

	supervisorSelect : function() {
		console.log('');
		inquirer
			.prompt([
				{
					type    : 'list',
					name    : 'action',
					message : 'What would you like to do today?',
					choices : [
						'View Sales by Department',
						'Create New Department',
						'Exit Bamazon'
					]
				}
			])
			.then((res) => {
				switch (res.action) {
					case 'View Sales by Department':
						bamazon.viewSales();
						setTimeout(bamazon.supervisorSelect, 400);
						break;
					case 'Create New Department':
						bamazon.promptDept();
						break;
					case 'Exit Bamazon':
						bamazon.exitBamazon();
						break;
				}
			})
			.catch((err) => console.log(err));
	},

	displayData      : function(res) {
		let formattedData = [];
		res.forEach((item) => {
			let newObj = {
				ID                : item.id,
				Name              : item.name,
				'Over Head Costs' : this.formatCurrency(item.over_head_costs),
				'Product Sales'   : this.formatCurrency(item.sales),
				'Total Profit'    : this.formatCurrency(item.profit)
			};
			formattedData.push(newObj);
		});
		console.log(cTable.getTable(formattedData));
	},

	viewSales        : function() {
		connection.query(
			'SELECT departments.id, departments.name, departments.over_head_costs, SUM(products.sales) `sales`, SUM(products.sales) - departments.over_head_costs `profit`' +
				'FROM departments INNER JOIN products ' +
				'ON departments.id = products.dept ' +
				'GROUP BY departments.id',
			(err, res) => {
				if (err) console.log(err);
				console.log('');
				this.displayData(res);
			}
		);
	},

	promptDept       : function() {
		console.log('');
		inquirer
			.prompt([
				{
					type    : 'input',
					name    : 'name',
					message : "Please enter the departments's name:"
				},
				{
					type     : 'input',
					name     : 'overHead',
					message  :
						"Please enter the departments's over head costs (000.00 format):",
					validate : function(value) {
						var valid = !isNaN(parseFloat(value));
						return valid || 'Please enter a number';
					}
				}
			])
			.then((res) => bamazon.createDept(res))
			.catch((err) => console.log(err));
	},

	createDept       : function(req) {
		connection.query(
			'INSERT INTO departments SET ?',
			{
				name            : req.name,
				over_head_costs : Number(req.overHead).toFixed(2)
			},
			(err, res) => {
				if (err) console.log(err);
				console.log(`\nSuccessfully added ${req.name}!`);
				bamazon.supervisorSelect();
			}
		);
	},

	exitBamazon      : function() {
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
