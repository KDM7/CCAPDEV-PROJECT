const fs = require('fs');
const handlebars = require('handlebars');

const userModel = require('../model/usersdb');
const restaurantModel = require('../model/restaurantsdb');
const mealModel = require('../model/mealsdb');
const employeeModel = require('../model/employeesdb');
const orderModel = require('../model/ordersdb');
const checkoutModel = require('../model/checkoutsdb');
const commentModel = require('../model/commentsdb');

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

function Employee(userID, restID, shifts) {
    this.userID = userID;
    this.restID = restID;
    this.shifts = shifts;
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

function Comment(commentID, userID, restID, comment, rating) {
  this.commentID = commentID;
  this.userID = userID;
  this.restID = restID;
  this.comment = comment;
  this.rating = rating;
}

async function getMinMaxUserID(sortby, offset){
  var highestID = await userModel.aggregate([{
    '$sort': {
        'userID': sortby
          }
      }, {
          '$limit': 1
      }, {
          '$project': {
              'userID': 1
          }
      }]);
  return highestID[0].userID + offset;
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

async function getMinMaxCommentID(sortby, offset){
  var highestID = await commentModel.aggregate([
    {
      '$sort': {
        'commentID': sortby
      }
    }, {
      '$limit': 1
    }, {
      '$project': {
        'commentID': 1
      }
    }
  ]);
  return highestID[0].commentID + offset;
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

    getChzComments: async function (req, res) {
      try{
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20001
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20001
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]); 

        res.render('u_ChzIT_comment', {
          title: 'Cheeze IT Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getSpcComments: async function (req, res) {
      try{
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20003
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20003
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]); 

        res.render('u_SpCity_comment', {
          title: 'Spice City Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getTacComments: async function (req, res) {
      try{
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20002
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20002
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]); 

        res.render('u_TacTown_comment', {
          title: 'Taco Town Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getPotComments: async function (req, res) {
      try{
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20004
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20004
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]); 

        res.render('u_PotAc_comment', {
          title: 'Potato Academy Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    
    getBenComments: async function (req, res) {
      try{
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20005
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20005
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]); 

        res.render('u_BenG_comment', {
          title: 'Bens Grill Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getAlmuComments: async function (req, res) {
      try{
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20006
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20006
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]); 

        res.render('u_AlCent_comment', {
          title: 'Almusal Central Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },
    

    getNewCommentChz: async function (req, res) {
      try{
        var user = req.session.logUser.userID;
        var match = await restaurantModel.aggregate([
          {
            '$match': {
              'restID': 20001
            }
          }, {
            '$addFields': {
              'userID': user
            }
          }
        ]);
        
        res.render('u_comment_1', {
          title: 'New Comment',
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getNewCommentSpc: async function (req, res) {
      try{
        var user = req.session.logUser.userID;
        var match = await restaurantModel.aggregate([
          {
            '$match': {
              'restID': 20003
            }
          }, {
            '$addFields': {
              'userID': user
            }
          }
        ]);
        
        res.render('u_comment_1', {
          title: 'New Comment',
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getNewCommentTac: async function (req, res) {
      try{
        var user = req.session.logUser.userID;
        var match = await restaurantModel.aggregate([
          {
            '$match': {
              'restID': 20002
            }
          }, {
            '$addFields': {
              'userID': user
            }
          }
        ]);
        
        res.render('u_comment_1', {
          title: 'New Comment',
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getNewCommentPot: async function (req, res) {
      try{
        var user = req.session.logUser.userID;
        var match = await restaurantModel.aggregate([
          {
            '$match': {
              'restID': 20004
            }
          }, {
            '$addFields': {
              'userID': user
            }
          }
        ]);
        
        res.render('u_comment_1', {
          title: 'New Comment',
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getNewCommentBen: async function (req, res) {
      try{
        var user = req.session.logUser.userID;
        var match = await restaurantModel.aggregate([
          {
            '$match': {
              'restID': 20005
            }
          }, {
            '$addFields': {
              'userID': user
            }
          }
        ]);
        
        res.render('u_comment_1', {
          title: 'New Comment',
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getNewCommentAlmu: async function (req, res) {
      try{
        var user = req.session.logUser.userID;
        var match = await restaurantModel.aggregate([
          {
            '$match': {
              'restID': 20006
            }
          }, {
            '$addFields': {
              'userID': user
            }
          }
        ]);
        
        res.render('u_comment_1', {
          title: 'New Comment',
          rest: JSON.parse(JSON.stringify(match))
        });
      } catch(e) {
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

            res.render('r_SpCity', {
                title: 'Spicy City Orders',
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

        res.render('r_order_Spc', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getRTacOrders: async function (req, res) {
      try {
          var result = await orderModel.aggregate([
              {
                '$match': {
                  'restID': 20002
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

            res.render('r_TacTown', {
                title: 'Spicy City Orders',
                orders: JSON.parse(JSON.stringify(result))
            });
      } catch(e) {
          console.log(e);
      }
    },

    getOneRTacOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('r_order_Tac', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getRPotOrders: async function (req, res) {
      try {
          var result = await orderModel.aggregate([
              {
                '$match': {
                  'restID': 20004
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

            res.render('r_PotAc', {
                title: 'Spicy City Orders',
                orders: JSON.parse(JSON.stringify(result))
            });
      } catch(e) {
          console.log(e);
      }
    },

    getOneRPotOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('r_order_Pot', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getRBenOrders: async function (req, res) {
      try {
          var result = await orderModel.aggregate([
              {
                '$match': {
                  'restID': 20005
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

            res.render('r_BenG', {
                title: 'Spicy City Orders',
                orders: JSON.parse(JSON.stringify(result))
            });
      } catch(e) {
          console.log(e);
      }
    },

    getOneRBenOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('r_order_Ben', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getRAlmuOrders: async function (req, res) {
      try {
          var result = await orderModel.aggregate([
              {
                '$match': {
                  'restID': 20006
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

            res.render('r_AlCent', {
                title: 'Spicy City Orders',
                orders: JSON.parse(JSON.stringify(result))
            });
      } catch(e) {
          console.log(e);
      }
    },

    getOneRAlmuOrder: async function (req, res) {
      try {
        var orderID = req.params.orderID;
        var meal = await checkoutModel.find({
          orderID:orderID
        });
        var order = await orderModel.findOne({
          orderID:orderID
        });

        res.render('r_order_Almu', {
          title: 'Customer Orders',
          meals: JSON.parse(JSON.stringify(meal)),
          orders: JSON.parse(JSON.stringify(order))
        });
      } catch(e) {
        console.log(e);
      }
    },

    getRChzEmployees: async function (req, res) {
      try {
        var result = await employeeModel.aggregate([
          {
            '$match': {
              'restID': 20001
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'userID': 1, 
              'shifts': 1, 
              'e_firstName': '$user.firstName', 
              'e_lastName': '$user.lastName'
            }
          }
        ]);

        res.render('r_ChzIT_emp', {
          title: 'Cheeze IT Employees',
          users: JSON.parse(JSON.stringify(result))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRSpcEmployees: async function (req, res) {
      try {
        var result = await employeeModel.aggregate([
          {
            '$match': {
              'restID': 20003
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'userID': 1, 
              'shifts': 1, 
              'e_firstName': '$user.firstName', 
              'e_lastName': '$user.lastName'
            }
          }
        ]);

        res.render('r_SpCity_emp', {
          title: 'Spice City Employees',
          users: JSON.parse(JSON.stringify(result))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRTacEmployees: async function (req, res) {
      try {
        var result = await employeeModel.aggregate([
          {
            '$match': {
              'restID': 20002
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'userID': 1, 
              'shifts': 1, 
              'e_firstName': '$user.firstName', 
              'e_lastName': '$user.lastName'
            }
          }
        ]);

        res.render('r_TacTown_emp', {
          title: 'Taco Town Employees',
          users: JSON.parse(JSON.stringify(result))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRPotEmployees: async function (req, res) {
      try {
        var result = await employeeModel.aggregate([
          {
            '$match': {
              'restID': 20004
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'userID': 1, 
              'shifts': 1, 
              'e_firstName': '$user.firstName', 
              'e_lastName': '$user.lastName'
            }
          }
        ]);

        res.render('r_PotAc_emp', {
          title: 'Potato Academy Employees',
          users: JSON.parse(JSON.stringify(result))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRBenEmployees: async function (req, res) {
      try {
        var result = await employeeModel.aggregate([
          {
            '$match': {
              'restID': 20005
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'userID': 1, 
              'shifts': 1, 
              'e_firstName': '$user.firstName', 
              'e_lastName': '$user.lastName'
            }
          }
        ]);

        res.render('r_BenG_emp', {
          title: 'Bens Grill Employees',
          users: JSON.parse(JSON.stringify(result))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRAlmuEmployees: async function (req, res) {
      try {
        var result = await employeeModel.aggregate([
          {
            '$match': {
              'restID': 20006
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'userID': 1, 
              'shifts': 1, 
              'e_firstName': '$user.firstName', 
              'e_lastName': '$user.lastName'
            }
          }
        ]);

        res.render('r_AlCent_emp', {
          title: 'Almusal Central Employees',
          users: JSON.parse(JSON.stringify(result))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRChzComments: async function (req, res) {
      try {
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20001
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20001
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('r_ChzIT_comment', {
          title: 'Cheeze IT Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRSpcComments: async function (req, res) {
      try {
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20003
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20003
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('r_SpCity_comment', {
          title: 'Spice City Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRTacComments: async function (req, res) {
      try {
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20002
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20002
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('r_TacTown_comment', {
          title: 'Taco Town Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRPotComments: async function (req, res) {
      try {
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20004
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20004
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('r_PotAc_comment', {
          title: 'Potato Academy Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRBenComments: async function (req, res) {
      try {
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20005
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20005
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('r_BenG_comment', {
          title: 'Bens Grill Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        })
      } catch(e) {
        console.log(e);
      }
    },

    getRAlmuComments: async function (req, res) {
      try {
        var matches = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20006
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'userID', 
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
              'commentID': 1, 
              'userID': 1, 
              'restID': 1, 
              'comment': 1, 
              'rating': 1, 
              'u_firstName': '$user.firstName', 
              'u_lastName': '$user.lastName'
            }
          }
        ]);

        var match = await commentModel.aggregate([
          {
            '$match': {
              'restID': 20006
            }
          }, {
            '$group': {
              '_id': '$restID', 
              'restID': {
                '$first': '$restID'
              }
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
              '__id': 1, 
              'restID': 1, 
              'restName': '$restaurant.restName'
            }
          }
        ]);

        res.render('r_AlCent_comment', {
          title: 'Almusal Central Comments',
          comments: JSON.parse(JSON.stringify(matches)),
          rest: JSON.parse(JSON.stringify(match))
        })
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
          if (match.password == pass) {
            if(match.restID == 20001){
              req.session.logUser = match;
              req.session.type = 'ChzIT';
              res.send({
                status: match.restID
              });
            } else if (match.restID == 20002){
              req.session.logUser = match;
              req.session.type = 'TacTown';
              res.send({
                status: match.restID
              });
            } else if (match.restID == 20003){
              req.session.logUser = match;
              req.session.type = 'SpCity';
              res.send({
                status: match.restID
              });
            } else if (match.restID == 20004){
              req.session.logUser = match;
              req.session.type = 'PotAc';
              res.send({
                status: match.restID
              });
            } else if (match.restID == 20005){
              req.session.logUser = match;
              req.session.type = 'BenG';
              res.send({
                status: match.restID
              });
            } else if (match.restID == 20006){
              req.session.logUser = match;
              req.session.type = 'AlCent';
              res.send({
                status: match.restID
              });
            } else {
              req.session.logUser = match;
              req.session.type = 'Customer';
              res.send({
                status: 101
              });
            }
          } else {
            res.send({status: 401, msg: 'Password Incorrect'});
          }
        }
        else {
          res.send({status: 401, msg: 'User Not Found'});
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
    },

    postNewCommentCustomer: async function (req, res) {
      if(req.session.logUser) {
        var {
          restID,
          userID,
          comment,
          rating
        } = req.body
        var commentID = await getMinMaxCommentID(-1, 1);

        var comment = new Comment(commentID, userID, restID, comment, rating);
        var newComment = new commentModel(comment);

        newComment.recordNewComment();

        res.send({
          status: parseInt(restID),
          msg: 'New Comment Posted'
        })

      } else {
        res.send({
          status: 501, msg:'User not logged in'
        });
      }
    },

    getRegister: async function (req, res) {
      res.render('register', {
        title: 'Register'
      });
    },

    postNewUser: async function (req, res) {
      try {
        var {
          fName,
          lName,
          pword
        } = req.body
        var userID = await getMinMaxUserID(-1, 1);
        console.log(userID);
        console.log(fName);
        console.log(lName);
        console.log(pword);

        var user = new User(userID, pword, lName, fName);
        var newUser = new userModel(user);

        newUser.recordNewUser();

        res.send({
          status: 101,
          userID: parseInt(userID)
        });

      } catch(e) {
        console.log(e);
        res.send({
          status: 501, msg:'error'
        });
      }
    }
}
module.exports = indexFunctions;

