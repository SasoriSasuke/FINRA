var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var temperature = require('temperature-js');
var convert = require('convert-units');

app.use(express.static('public'));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const temperatureUnitSet = new Set(["Kelvin", "Celsius", "Fahrenheit", "Rankine"]);
const volumeUnitSet = new Set(["liters", "tablespoons", "cubic-inches", "cups", "cubic-feet", "gallons"]);
const volumeUnitMap = new Map([["liters", 'l'], ["tablespoons", 'tsp'], ["cubic-inches", 'in3'], ["cups", 'cup'], ["cubic-feet", 'ft3'], ["gallons", 'gal']]);

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.post('/convert', urlencodedParser, function (req, res) {
   var inputValue = req.body.inputValue;
   var inputUnit = req.body.inputUnit;
   var targetUnit = req.body.targetUnit;
   var response = req.body.response;
   
   var validationResult = validateUnit(inputUnit, targetUnit) && validateValue(inputValue, response);
   
   if(validationResult == false) {
	   res.redirect('/index.html?response=invalid');
   }
   else {
	   var correctResponse;
	   
	   if(temperatureUnitSet.has(inputUnit)) {
		   correctResponse = convertTemperature(parseFloat(inputValue), inputUnit, targetUnit);
	   }
	   else {
		   correctResponse = convertVolume(parseFloat(inputValue), inputUnit, targetUnit);
	   }
	   
	   var roundedCorrectResponse = Math.round(correctResponse * 10) / 10;
	   var roundedResponse = Math.round(parseFloat(response) * 10) / 10;
	   
	   if(roundedCorrectResponse == roundedResponse) {
		   res.redirect('/index.html?response=correct');
	   }
	   else {
		   res.redirect('/index.html?response=incorrect');
	   }
   }
})

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("App listening at http://%s:%s", host, port);
});

function validateValue(inputValue, response) {
	var result = !isNaN(inputValue) && !isNaN(response);
	
	return result;
}

function validateUnit(inputUnit, targetUnit) {
	if(temperatureUnitSet.has(inputUnit)) {
		if(!temperatureUnitSet.has(targetUnit)) {
			return false;
		}
		else {
			return true;
		}
	}
	else if(volumeUnitSet.has(inputUnit)) {
		if(!volumeUnitSet.has(targetUnit)) {
			return false;
		}
		else {
			return true;
		}
	}
	else {
		return false;
	}
}

function convertTemperature(inputValue, inputUnit, targetUnit) {
	var result;
	
	if(inputUnit == "Kelvin") {
		if(targetUnit == "Celsius") {
			result = temperature.kelvinToCelcius(inputValue);
		}
		else if(targetUnit == "Fahrenheit") {
			result = temperature.kelvinToFahrenheit(inputValue);
		}
		else if(targetUnit == "Rankine") {
			result = temperature.kelvinToRankine(inputValue);
		}
		else {
			result = inputValue;
		}
	}
	else if(inputUnit == "Celsius") {
		if(targetUnit == "Kelvin") {
			result = temperature.celciusToKelvin(inputValue);
		}
		else if(targetUnit == "Fahrenheit") {
			result = temperature.celciusToFahrenheit(inputValue);
		}
		else if(targetUnit == "Rankine") {
			result = temperature.celciusToRankine(inputValue);
		}
		else {
			result = inputValue;
		}
	}
	else if(inputUnit == "Fahrenheit") {
		if(targetUnit == "Kelvin") {
			result = temperature.fahrenheitToKelvin(inputValue);
		}
		else if(targetUnit == "Celsius") {
			result = temperature.fahrenheitToCelcius(inputValue);
		}
		else if(targetUnit == "Rankine") {
			result = temperature.fahrenheitToRankine(inputValue);
		}
		else {
			result = inputValue;
		}
	}
	else {
		if(targetUnit == "Kelvin") {
			result = temperature.rankineToKelvin(inputValue);
		}
		else if(targetUnit == "Celsius") {
			result = temperature.rankineToCelcius(inputValue);
		}
		else if(targetUnit == "Fahrenheit") {
			result = temperature.rankineToFahrenheit(inputValue);
		}
		else {
			result = inputValue;
		}
	}
	
	return result;
}

function convertVolume(inputValue, inputUnit, targetUnit) {
	var result;
	
	if(inputUnit == targetUnit) {
		result = inputValue;
	}
	else {
		result = convert(inputValue).from(volumeUnitMap.get(inputUnit)).to(volumeUnitMap.get(targetUnit));
	}
	
	return result;
}