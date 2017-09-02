//Assigning variables to hold node packages
var mysql = require("mysql");
var inquirer = require("inquirer");

//global variables
var query;

//creating a connection to the database
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon_db"
});

//connection to the database 
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connection ID: " + connection.threadId );
  displayItems();
});

//function to display the inventory 
function displayItems(){
	query = "SELECT * FROM products ";
	connection.query(query, function(err, res) {
		if (err) throw err;
		console.log("Item ID  |  Product Name  |  Price  | Quantity")
		console.log("-----------------------------------");
		for (var i = 0; i < res.length; i++) {
			console.log(res[i].item_id + "|" + res[i].product_name + "|" + "$"+res[i].price + "|" + res[i].stock_quantity);
		}
		console.log("-----------------------------------\n");
		
		start();
	});
	
}

// function which prompts the user for what action they should take
function start() {
	inquirer
		.prompt([{
			name: "itemId",
			type: "input",
			message: "What is the ID number of the item you would like to buy?",
			validate: function(value) {
				if (isNaN(value) === false) {
					return true;
				}
				return false;
			}
		},
		{
			name: "itemQuantity",
			type: "input",
			message: "How many would you like to buy?",
			validate: function(value) {
				if (isNaN(value) === false) {
					return true;
				}
				return false;
			}
		}])
		.then(function(answer) {
			query = "SELECT * FROM products Where ?";
			connection.query(query, {item_id: answer.itemId}, function(err, res) {
				if (res[0].stock_quantity < answer.itemQuantity) {
					console.log("The selected product is low inventory or out of stock");
				} else {
					console.log("You're Total Cost is $" + (res[0].price * answer.itemQuantity));
					var inventoryCount = res[0].stock_quantity - answer.itemQuantity;
					// console.log(inventoryCount);
					query =
					connection.query("UPDATE products SET ? WHERE ?", 
					[	{
						stock_quantity: inventoryCount
						},
						{
						item_id: answer.itemId
						}
					], 
					function(err, res) {
						console.log(res.affectedRows + " products updated\n");
					});

						connection.end();

						// logs the actual query being run
						console.log(query.sql);
					}
				
			});
	});

}