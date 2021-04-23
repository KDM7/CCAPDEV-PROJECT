const fs = require('fs');
const handlebars = require('handlebars');

const userModel = require('../model/usersdb');
const restaurantModel = require('../model/restaurantsdb');
const mealModel = require('../model/mealsdb');
const employeeModel = require('../model/employeesdb');

const bcrypt = require('bcrypt');
const e = require('express');

function User(userID, password, lastName, firstName) {
    this.userID = userID;
    this.password = password;
    this.lastName = lastName;
    this.firstName = firstName;
}

function Restaurant(restID, restName, restAdress, wrkHrs) {
    this.restID = restID;
    this.restName = restName;
    this.restAdress = restAdress;
    this.wrkHrs = wrkHrs;
}

function Meal(mealID, mealName, mealDesc, mealPrice, restID) {
    this.mealID = mealID;
    this.mealName = mealName;
    this.mealDesc = mealDesc;
    this.mealPrice = mealPrice;
    this.restID = restID;
}

function Employee(userID, restID) {
    this.userID = userID;
    this.restID = restID;
}