//Assigning variables to hold node packages
var mysql = require("mysql");
var inquirer = require("inquirer");

//creating a connection to the database
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Mesari500",
	database: "bamazon_db"
});

//connection to the database 
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connection ID: " + connection.threadId );
  start();

});

// function which prompts the user for what action they should take
function start() {
	inquirer
		.prompt({
			type: "list",
			message: "Select an action",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
			name: "selection"
		})
		.then(function(list) {
			switch(list.selection) {
				case "View Products for Sale":
					viewProducts();
					break;
				case "View Low Inventory":
					lowInventory();
					break;
				case "Add to Inventory":
					addToInventory();
					break;
				case "Add New Product":
					addNewProduct();
					break;
			}
		});
}

//this is the function to view products
var viewProducts = function(){
	//connects to the mysql database called products and returns the information from that database
	connection.query('SELECT * FROM products', function(err, res){
		console.log('');
		console.log('Products for Sale')
		console.log('');
		console.log("Item ID  |  Product Name  |  Price  | Quantity")
		console.log("-----------------------------------");

		//this loops through the mysql connection prints the results to the console
		for(var i=0; i<res.length; i++){
				console.log(res[i].item_id+" || "+ res[i].product_name+" || "+res[i].department_name+" || $"+res[i].price+" || "+ res[i].stock_quantity);
		}

		start();
	})
};

//function to view low inventory
function lowInventory() {
	connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err, res) {
        if (err) throw err;
	        console.log("Bamazon's Inventory");
        for(var i = 0; i < res.length; i++) {
	        console.log("Item ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Department: " + res[i].department_name + " | Price: " +  res[i].price + " | Quantity: " + res[i].stock_quantity);
        } 
        start();
   }); 
}

//function to add to inventory
function addToInventory() {
	connection.query('SELECT * FROM products', function(err, res) {
	    if (err) throw err;

		for(var i = 0; i < res.length; i++) {
	        console.log("Item ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Department: " + res[i].department_name + " | Price: " +  res[i].price + " | Quantity: " + res[i].stock_quantity);			
		}

		inquirer.prompt([
		{
			type: "number",
			message: "Which product would you like to add to? (the Product ID)",
			name: "itemNumber"
		},
		{
			type: "number",
			message: "How many more would you like to add?",
			name: "howMany"
		},
		]).then(function (user) {
			var newQuantity = parseInt(res[user.itemNumber - 1].stock_quantity) + parseInt(user.howMany);
			connection.query("UPDATE products SET ? WHERE ?", [{
    			stock_quantity: newQuantity
    		}, {
    			item_id: user.itemNumber
    		}], function(error, results) {
    			if(error) throw error;

	    		console.log("\nYour quantity has been updated!\n");
	    		start();
		    });

		});
	});
}


function addNewProduct() {
	inquirer.prompt([
	{
		type: "input",
		message: "What is the product name?",
		name: "itemName"
	},
	{
		type: "input",
		message: "What department is it in?",
		name: "itemDepartment"
	},
	{
		type: "number",
		message: "What is it's price?",
		name: "itemPrice"
	},
	{
		type: "number",
		message: "How many do we have of this product?",
		name: "itemQuantity"
	},
	]).then(function (user) {
		connection.query("INSERT INTO products SET ?", {
			product_name: user.itemName,
			department_name: user.itemDepartment,
			price: user.itemPrice,
			stock_quantity: user.itemQuantity
		}, function(err, res) {
			if(err) throw err;

			console.log("\nYour product has been added!\n");
			start();
		});
	});
}