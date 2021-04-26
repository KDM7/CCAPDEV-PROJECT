const fs = require('fs');
const handlebars = require('handlebars');

const userModel = require('../model/usersdb');
const restaurantModel = require('../model/restaurantsdb');
const mealModel = require('../model/mealsdb');
const employeeModel = require('../model/employeesdb');
const orderModel = require('../model/ordersdb');

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

function Order(orderID, status, date, customer, restID, total, finish) {
    this.orderID = orderID;
    this.status = status;
    this.date = date;
    this.customer = customer;
    this.restID = restID;
    this.total = total;
    this.finish = finish;
}

const indexFunctions = {

    getLogin: async function(req, res) {
        res.render('login', {
            title: 'Login'
        });
    },
    
    getChzMenu: async function (req, res) {
        try {
            var matches = await mealModel.aggregate([
                {
                  '$match': {
                    'restID': 20001
                  }
                }
              ]);
            res.render('u_ChzIT', {
                title: 'Cheeze IT Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch (e) {
            console.log(e);
        }
    },

    getSpcMenu: async function (req, res) {
        try {
            var matches = await mealModel.aggregate([
                {
                  '$match': {
                    'restID': 20003
                  }
                }
              ]);
            res.render('u_SpCity', {
                title: 'Spicy City Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch (e) {
            console.log(e);
        }
    },

    getTacMenu: async function (req, res) {
        try {
            var matches = await mealModel.aggregate([
                {
                  '$match': {
                    'restID': 20002
                  }
                }
              ]);
            res.render('u_TacTown', {
                title: 'Taco Town Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch (e) {
            console.log(e);
        }
    },

    getPotMenu: async function (req, res) {
        try {
            var matches = await mealModel.aggregate([
                {
                  '$match': {
                    'restID': 20004
                  }
                }
              ]);
            res.render('u_PotAc', {
                title: 'Potato Academy Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch(e) {
            console.log(e);
        }
    },

    getBenMenu: async function (req, res) {
        try {
            var matches = await mealModel.aggregate([
                {
                  '$match': {
                    'restID': 20005
                  }
                }
              ]);
            res.render('u_BenG', {
                title: 'Bens Grill Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch(e) {
            console.log(e);
        }
    },

    getAlmuMenu: async function (req, res) {
        try {
            var matches = await mealModel.aggregate([
                {
                  '$match': {
                    'restID': 20006
                  }
                }
              ]);
            res.render('u_BenG', {
                title: 'Almusal Central Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch(e) {
            console.log(e);
        }
    },

    getChzOrders: async function (req, res) {
        try {
            var result = await orderModel.aggregate([
                {
                  '$match': {
                    'restID': 20001, 
                    'finish': true
                  }
                }, {
                  '$lookup': {
                    'from': 'users', 
                    'localField': 'customer', 
                    'foreignField': 'userID', 
                    'as': 'user'
                  }
                }, {
                  '$unwind': {
                    'path': '$user', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, {
                  '$project': {
                    'orderID': 1, 
                    'status': 1, 
                    'date': 1, 
                    'total': 1, 
                    'c_firstName': '$user.firstName', 
                    'c_lastName': '$user.lastName'
                  }
                }
              ]);

              res.render('r_ChzIT', {
                  title: 'Cheeze IT Orders',
                  orders: JSON.parse(JSON.stringify(result))
              });
        } catch(e) {
            console.log(e);
        }
    },

    getChzC1: async function (req, res) {
      try {
        res.render('u_mealOrder_C1', {
          title: 'Cheeze IT Ordering'});
      } catch(e) {
        console.log(e);
      }
    }
}
module.exports = indexFunctions;