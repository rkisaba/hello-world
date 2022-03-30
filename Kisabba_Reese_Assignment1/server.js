// importing required nodes for express
var express = require('express');
var app = express();

// importing and assigning json with product information to variable
var data = require("./products_data.json");
var products_array = data.products_array;

// importing parser and querystring to package data for requests
var myParser = require("body-parser");
const queryString = require('querystring');

app.use(myParser.urlencoded({ extended: true })); // From lab 13

// function -- validates whether inputted values are within quantity available range
function validateStock(cust_qty, stock){
   if (cust_qty > stock){
      return false;
   }
}

// Routing 
app.use(myParser.urlencoded({extended : true}));
app.post("/purchase", function(request, response) {
   let POST = request.body; // assigning req body to var
   
   // validating that all quantities recieved are valid 
   if (typeof POST['purchase_submit'] != 'undefined') { // validating quantities, and valid quantities
      var hasValidQuantities = true;
      var hasQuantities = false;
      var inStock = true;

      // loops through every value and makes sure that values are valid -- has quantities, are valid quantities, and are in stock
      for (i = 0; i < data.length; i++){
         qty = POST[`quantity${i}`];
         hasQuantities = hasQuantities || qty > 0;
         hasValidQuantities = hasValidQuantities && isNonNegInt(qty);
         inStock = validateStock(qty, data[i]['quantity_available']) && isNonNegInt(qty);
      }

      // package the req.body into a queryString
      const stringified = queryString.stringify(POST); // convert req body to a querystring

      // if all requirements are met, redirect to invoice, if not , send back to store with errors
      if (hasQuantities && hasValidQuantities && inStock) {
            response.redirect("./invoice.html" + stringified); // send to invoice with req body
      } else {
         response.redirect("./store.html" + stringified); // send back to store
      }
   }
   console.log(request.body);
})

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));

// function -- validates whether inputted values are acceptable, if not, sends errors
function isNonNegInt(q, return_errors = false) {
   errors = []; //Assumes there are no errors at first
   if (q == '') q = 0; //Handle inputs as if they are 0
   if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); //Check string is a number value
   else if (q < 0) errors.push('<font color="red">Negative value!</font>'); //Check if it is non-neg
   else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); //Check that it is an integer
   return return_errors ? errors : (errors.length == 0);
}