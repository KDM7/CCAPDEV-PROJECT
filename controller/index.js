const fs = require('fs');
const handlebars = require('handlebars');

const userModel = require('../model/usersdb');
const restaurantModel = require('../model/restaurantsdb');
const mealModel = require('../model/mealsdb');
const employeeModel = require('../model/employeesdb');
const orderModel = require('../model/ordersdb');
const checkoutModel = require('../model/checkoutsdb');

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

function Order(orderID, status, date, customer, restID, total) {
    this.orderID = orderID;
    this.status = status;
    this.date = date;
    this.customer = customer;
    this.restID = restID;
    this.total = total;
}

function Checkout(checkID, mealID, orderID, userID, restID,  qty, total) {
    this.checkID = checkID;
    this.mealID = mealID;
    this.orderID = orderID;
    this.userID = userID;
    this.restID = restID;
    this.qty = qty;
    this.total = total;
}

async function getMinMaxCheckoutID(sortby, offset){
  var highestID = await checkoutModel.aggregate([{
    '$sort': {
        'checkID': sortby
          }
      }, {
          '$limit': 1
      }, {
          '$project': {
              'checkID': 1
          }
      }]);
  return highestID[0].checkID + offset;
}

async function getMinMaxOrderID(sortby, offset){
  var highestID = await orderModel.aggregate([
    {
      '$sort': {
        'orderID': sortby
      }
    }, {
      '$limit': 1
    }, {
      '$project': {
        'orderID': 1
      }
    }
  ]);
  return highestID[0].orderID + offset;
}

async function getRestID(mealID){
  var restMeal = await mealModel.aggregate([
      {
          '$match': {
              'mealID': mealID
          }
      }
    ]);
  return restMeal[0].restID;
}

async function getOrderDate(orderID) {
  var orderDate = await orderModel.aggregate([
    {
      '$match': {
        'orderID': orderID
      }
    }, {
      '$project': {
        'date': 1
      }
    }
  ]);
  return orderDate[0].date;
}

async function findUser(userID) {
  var user = await userModel.aggregate([
    {
      '$match': {
        'userID': userID
      }
    }, {
      '$lookup': {
        'from': 'employees', 
        'localField': 'userID', 
        'foreignField': 'userID', 
        'as': 'restaurant'
      }
    }, {
      '$unwind': {
        'path': '$restaurant', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$project': {
        'userID': 1, 
        'password': 1, 
        'firstName': 1, 
        'lastName': 1, 
        'restID': '$restaurant.restID'
      }
    }
  ]);
  return user[0];
}

const indexFunctions = {

    getLogin: async function(req, res) {
        res.render('login', {
            title: 'Login'
        });
    },

    getRestaurants: async function(req, res) {
      res.render('u_Restaurants',{
        title: 'Restaurants'
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
            res.render('u_AlCent', {
                title: 'Almusal Central Menu',
                meals: JSON.parse(JSON.stringify(matches))
            });
        } catch(e) {
            console.log(e);
        }
    },

    getRChzOrders: async function (req, res) {
        try {
            var result = await orderModel.aggregate([
                {
                  '$match': {
                    'restID': 20001
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

    getOneRChzOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('r_order_Chz', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getRSpcOrders: async function (req, res) {
      try {
          var result = await orderModel.aggregate([
              {
                '$match': {
                  'restID': 20003
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

    getOneRSpcOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('r_order_1', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOneChzMeal: async function (req, res) {
      try {
        var mealID = req.params.mealID;
        var match = await mealModel.findOne({
          mealID: mealID
      });
        res.render('u_mealOrder_1', {
          title: 'Cheeze IT Ordering',
          meal: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOneSpcMeal: async function (req, res) {
      try {
        var mealID = req.params.mealID;
        var match = await mealModel.findOne({
          mealID: mealID
      });
        res.render('u_mealOrder_1', {
          title: 'Spicy City Ordering',
          meal: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOneTacMeal: async function (req, res) {
      try {
        var mealID = req.params.mealID;
        var match = await mealModel.findOne({
          mealID: mealID
      });
        res.render('u_mealOrder_1', {
          title: 'Taco Town Ordering',
          meal: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOnePotMeal: async function (req, res) {
      try {
        var mealID = req.params.mealID;
        var match = await mealModel.findOne({
          mealID: mealID
      });
        res.render('u_mealOrder_1', {
          title: 'Potato Academy Ordering',
          meal: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOneBenMeal: async function (req, res) {
      try {
        var mealID = req.params.mealID;
        var match = await mealModel.findOne({
          mealID: mealID
      });
        res.render('u_mealOrder_1', {
          title: 'Bens Grill Ordering',
          meal: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOneAlmuMeal: async function (req, res) {
      try {
        var mealID = req.params.mealID;
        var match = await mealModel.findOne({
          mealID: mealID
        });
        res.render('u_mealOrder_1', {
          title: 'Almusal Central Ordering',
          meal: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },


    getChzCart: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var meals = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20001, 
              'orderID': null
            }
          }, {
            '$lookup': {
              'from': 'meals', 
              'localField': 'mealID', 
              'foreignField': 'mealID', 
              'as': 'meal'
            }
          }, {
            '$unwind': {
              'path': '$meal', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'checkID': 1, 
              'mealID': 1, 
              'orderID': 1, 
              'userID': 1, 
              'restID': 1, 
              'qty': 1, 
              'total': 1, 
              'mealName': '$meal.mealName'
            }
          }
        ]);
        var total = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20001, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$orderID', 
              'total': {
                '$sum': '$total'
              }
            }
          }
        ]);
        var restID = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20001, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
            }
          }
        ]);

        res.render('u_meal_cart', {
          title: 'Cheeze IT Cart',
          meal: JSON.parse(JSON.stringify(meals)),
          order: JSON.parse(JSON.stringify(total)),
          restaurant: JSON.parse(JSON.stringify(restID))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getSpcCart: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var meals = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20003, 
              'orderID': null
            }
          }, {
            '$lookup': {
              'from': 'meals', 
              'localField': 'mealID', 
              'foreignField': 'mealID', 
              'as': 'meal'
            }
          }, {
            '$unwind': {
              'path': '$meal', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'checkID': 1, 
              'mealID': 1, 
              'orderID': 1, 
              'userID': 1, 
              'restID': 1, 
              'qty': 1, 
              'total': 1, 
              'mealName': '$meal.mealName'
            }
          }
        ]);
        var total = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20003, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$orderID', 
              'total': {
                '$sum': '$total'
              }
            }
          }
        ]);
        var restID = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20003, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
            }
          }
        ]);

        res.render('u_meal_cart', {
          title: 'Spice City Cart',
          meal: JSON.parse(JSON.stringify(meals)),
          order: JSON.parse(JSON.stringify(total)),
          restaurant: JSON.parse(JSON.stringify(restID))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getTacCart: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var meals = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20002, 
              'orderID': null
            }
          }, {
            '$lookup': {
              'from': 'meals', 
              'localField': 'mealID', 
              'foreignField': 'mealID', 
              'as': 'meal'
            }
          }, {
            '$unwind': {
              'path': '$meal', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'checkID': 1, 
              'mealID': 1, 
              'orderID': 1, 
              'userID': 1, 
              'restID': 1, 
              'qty': 1, 
              'total': 1, 
              'mealName': '$meal.mealName'
            }
          }
        ]);
        var total = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20002, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$orderID', 
              'total': {
                '$sum': '$total'
              }
            }
          }
        ]);
        var restID = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20002, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
            }
          }
        ]);

        res.render('u_meal_cart', {
          title: 'Cheeze IT Cart',
          meal: JSON.parse(JSON.stringify(meals)),
          order: JSON.parse(JSON.stringify(total)),
          restaurant: JSON.parse(JSON.stringify(restID))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getPotCart: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var meals = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20004, 
              'orderID': null
            }
          }, {
            '$lookup': {
              'from': 'meals', 
              'localField': 'mealID', 
              'foreignField': 'mealID', 
              'as': 'meal'
            }
          }, {
            '$unwind': {
              'path': '$meal', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'checkID': 1, 
              'mealID': 1, 
              'orderID': 1, 
              'userID': 1, 
              'restID': 1, 
              'qty': 1, 
              'total': 1, 
              'mealName': '$meal.mealName'
            }
          }
        ]);
        var total = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20004, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$orderID', 
              'total': {
                '$sum': '$total'
              }
            }
          }
        ]);
        var restID = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20004, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
            }
          }
        ]);

        res.render('u_meal_cart', {
          title: 'Cheeze IT Cart',
          meal: JSON.parse(JSON.stringify(meals)),
          order: JSON.parse(JSON.stringify(total)),
          restaurant: JSON.parse(JSON.stringify(restID))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getBenCart: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var meals = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20005, 
              'orderID': null
            }
          }, {
            '$lookup': {
              'from': 'meals', 
              'localField': 'mealID', 
              'foreignField': 'mealID', 
              'as': 'meal'
            }
          }, {
            '$unwind': {
              'path': '$meal', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'checkID': 1, 
              'mealID': 1, 
              'orderID': 1, 
              'userID': 1, 
              'restID': 1, 
              'qty': 1, 
              'total': 1, 
              'mealName': '$meal.mealName'
            }
          }
        ]);
        var total = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20005, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$orderID', 
              'total': {
                '$sum': '$total'
              }
            }
          }
        ]);
        var restID = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20005, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
            }
          }
        ]);

        res.render('u_meal_cart', {
          title: 'Cheeze IT Cart',
          meal: JSON.parse(JSON.stringify(meals)),
          order: JSON.parse(JSON.stringify(total)),
          restaurant: JSON.parse(JSON.stringify(restID))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getAlmuCart: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var meals = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20006, 
              'orderID': null
            }
          }, {
            '$lookup': {
              'from': 'meals', 
              'localField': 'mealID', 
              'foreignField': 'mealID', 
              'as': 'meal'
            }
          }, {
            '$unwind': {
              'path': '$meal', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'checkID': 1, 
              'mealID': 1, 
              'orderID': 1, 
              'userID': 1, 
              'restID': 1, 
              'qty': 1, 
              'total': 1, 
              'mealName': '$meal.mealName'
            }
          }
        ]);
        var total = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20006, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$orderID', 
              'total': {
                '$sum': '$total'
              }
            }
          }
        ]);
        var restID = await checkoutModel.aggregate([
          {
            '$match': {
              'userID': user, 
              'restID': 20006, 
              'orderID': null
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
            }
          }
        ]);

        res.render('u_meal_cart', {
          title: 'Cheeze IT Cart',
          meal: JSON.parse(JSON.stringify(meals)),
          order: JSON.parse(JSON.stringify(total)),
          restaurant: JSON.parse(JSON.stringify(restID))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getCustomerOrders: async function (req, res) {
      try {
        var user = req.session.logUser.userID;
        var orders = await orderModel.aggregate([
          {
            '$match': {
              'customer': user
            }
          }, {
            '$lookup': {
              'from': 'restaurants', 
              'localField': 'restID', 
              'foreignField': 'restID', 
              'as': 'restaurant'
            }
          }, {
            '$unwind': {
              'path': '$restaurant', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'orderID': 1, 
              'status': 1, 
              'date': 1, 
              'total': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('u_orderlist', {
          title: 'Customer Orders',
          order: JSON.parse(JSON.stringify(orders))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getOneCustomerOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('u_order_1', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },


    postLogin: async function (req, res) {
      var {
        user,
        pass
      } = req.body;
      try {
        var match = await findUser(parseInt(user));
        if (match) {
          if(match.restID == 20001){
            req.session.logUser = match;
            req.session.type = 'ChzIT';
            res.send({
              status: match.restID
            });
          }
          else {
            req.session.logUser = match;
            req.session.type = 'Customer';
            res.send({
              status: 101
            });
          }
        }
        else {
          res.send({status: 401, msg: 'Incorrect credentials'});
        }
      }catch(e){
        res.send({status: 500, msg: e});
      }
    },


    postNewCheckout: async function (req, res) {
      if(req.session.logUser) {
        var {
          mealID,
          quantity,
          sellingPrice,
          total
        } = req.body;
        var orderID = null;
        var checkID = await getMinMaxCheckoutID(-1, 1);
        var restID = await getRestID(mealID);
        var userID = req.session.logUser.userID;
        
        var checkout = new Checkout(checkID, mealID, orderID, userID, restID, quantity, total);
        var newCheckout = new checkoutModel(checkout);
        
        newCheckout.recordNewCheckout();
        
        res.send({
          status: restID,
          msg: 'Meal added to Cart'
        });
      }
      else {
        res.send({
          status: 501, msg:'User not logged in'
        });
      }
    },

    postNewOrder: async function (req, res) {
      if(req.session.logUser) {
        var {
          total,
          restID
        } = req.body;
        var date = new Date();
        var orderID = await getMinMaxOrderID(-1, 1);
        var customer = req.session.logUser.userID;
        var status = "Preparing";

        var order = new Order(orderID, status, date, customer, restID, total);
        var newOrder = new orderModel(order);

        newOrder.recordNewOrder();

        var result = await checkoutModel.updateMany({
          orderID: null
        }, {
          orderID: orderID
        });

        res.send({
          status: parseInt(restID),
          msg: 'New order recorded'
        });
      }
      else {
        res.send({
          status: 501, msg:'User not logged in'
        });
      }
    },

    postEditStatus: async function (req, res) {
      if(req.session.logUser) {
        var {
          orderID,
          total,
          customer,
          restID,
          date,
          status
        } = req.body;

        var order = new Order(orderID, status, date, customer, restID, total);
        var editOrder = new orderModel(order);

        var result = await editOrder.recordEditOrder();

        res.send({
          status: parseInt(restID),
          msg: 'Order Status Updated'
        })
      }
      else {
        res.send({
          status: 501, msg:'User not logged in'
        });
      }
    }
}
module.exports = indexFunctions;

