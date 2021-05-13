$(document).ready(function() {

    $('#submitLogin').click(function() {

        var user = $('#id').val();
        var pass = $('#pword').val();

        if (validator.isEmpty(user)) {
            alert('No user id provided');
        }
        if (validator.isEmpty(pass)) {
            alert('No password provided');
        }

        if(!validator.isEmpty(user) && !validator.isEmpty(pass)) {
            $.post('/', {
                user: user,
                pass: pass
            }, function(result) {
                switch(result.status) {
                    case 20001:
                        {
                            //Employees
                            window.location.href = '/r/ChzIT';
                            break;
                        }
                    case 20002:
                        {
                            //Employees
                            window.location.href = '/r/TacTown';
                            break;
                        }
                    case 20003:
                        {
                            //Employees
                            window.location.href = '/r/SpCity';
                            break;
                        }
                    case 20004:
                        {
                            //Employees
                            window.location.href = '/r/PotAc';
                            break;
                        }
                    case 20005:
                        {
                            //Employees
                            window.location.href = '/r/BenG';
                            break;
                        }
                    case 20006:
                        {
                            //Employees
                            window.location.href = '/r/AlCent';
                            break;
                        }
                    case 101:
                        {
                            //Customers
                            window.location.href = '/u';
                            break;
                        }
                    case 401:
                    case 500:
                        {
                            alert('case 500: ' + result.msg);
                            break;
                            
                        }
                }
            
            })
        }
    });

    $('#submitRegister').click(function() {
        var fName = $('#firstName').val();
        var lName = $('#lastName').val();
        var pword = $('#pword').val();
        var cpword = $('#cpword').val();
        var valid = true;

        if(validator.isEmpty(fName)) {
            valid = false;
            alert('No First Name Provided');
        }

        if(validator.isEmpty(lName)) {
            valid = false;
            alert('No Last Name Provided');
        }

        if(validator.isEmpty(pword)) {
            valid = false;
            alert('No Password Provided');
        }

        if(validator.isEmpty(cpword)) {
            valid = false;
            alert('Passwords do not match');
        }

        if(pword != cpword) {
            valid = false;
            alert('Passwords do not match');
        }

        if(valid) {
            $.post('/newUser_submit', {
                fName: fName,
                lName: lName,
                pword: pword
            }, function(result) {
                switch(result.status) {
                    case 101: {
                        alert('New User Registered \nUserID: ' + result.userID);
                        window.location.href = '/';
                        break;
                    }
                    case 501: {
                        alert('case 501: ' + result.msg);
                        break
                    }
                }
            })
        }
    })

    $('#submitNewCheckout').click(function() {
        var quantity = $('#meal_qty').val();
        var sellingPrice = $('#meal_Price').val();
        var total = quantity * sellingPrice;
        var mealID = $('#meal_ID').val();
        var valid = true;

        if(validator.isEmpty(quantity)) {
            alert('No quantity provided');
            valid = false;
        }

        if (parseInt(quantity) <= 0 || quantity % 1 != 0) {
            alert('quantity must be more than zero and must be a whole number');
            valid = false
        }
       
        if(valid) {
            $.post('/newCheckout_submit', {
                mealID: mealID,
                quantity: quantity,
                sellingPrice: sellingPrice,
                total:total
            }, function(result) {
                switch (result.status) {
                    case 20001: {
                        alert(result.msg);
                        window.location.href = '/u/ChzIT';
                        break;
                    }
                    case 20002: {
                        alert(result.msg);
                        window.location.href = '/u/TacTown';
                        break;
                    }
                    case 20003: {
                        alert(result.msg);
                        window.location.href = '/u/SpCity';
                        break;
                    }
                    case 20004: {
                        alert(result.msg);
                        window.location.href = '/u/PotAc';
                        break;
                    }
                    case 20005: {
                        alert(result.msg);
                        window.location.href = '/u/BenG';
                        break;
                    }
                    case 20006: {
                        alert(result.msg);
                        window.location.href = '/u/AlCent';
                        break;
                    }
                    case 501: {
                        alert('case 501:' + result.msg);
                        break;
                    }
                }
            })
        }
    });

    $('#submitNewOrder').click(function(){
        var total = $('#orderTotal').val();
        var restID = $('#orderRestID').val();
        var valid = true;

        if(validator.isEmpty(total)) {
            valid = false;
            alert('cart is empty');
        }

        if(valid) {
            $.post('/newOrder_submit', {
                total: total,
                restID: restID
            }, function(result){
                switch(result.status) {
                    case 20001: {
                        alert(result.msg);
                        window.location.href = '/u/ChzIT';
                        break;
                    }
                    case 20002: {
                        alert(result.msg);
                        window.location.href = '/u/TacTown';
                        break;
                    }
                    case 20003: {
                        alert(result.msg);
                        window.location.href = '/u/SpCity';
                        break;
                    }
                    case 20004: {
                        alert(result.msg);
                        window.location.href = '/u/PotAc';
                        break;
                    }
                    case 20005: {
                        alert(result.msg);
                        window.location.href = '/u/BenG';
                        break;
                    }
                    case 20006: {
                        alert(result.msg);
                        window.location.href = '/u/AlCent';
                        break;
                    }
                    case 501: {
                        alert('case 501: ' + result.msg);
                        break;
                    }
                }
            })
        }
    });

    $('#submitEditStatus').click(function(){
        var orderID = $('#order_ID').val();
        var total = $('#order_total').val();
        var customer = $('#order_customer').val();
        var restID = $('#order_restID').val();
        var date = $('#order_date').val();
        var oldStatus = $('#orderStatusOld').val();
        var status = $('#order_Status').val();
        var temp = "Delivered";
        var valid = true;

        if(status == 0) {
            valid = false;
            alert('Please Select A Valid Status');
        }

        if(status == 1) {
            status = "Preparing";
        }

        if(status == 2) {
            status = "Cooking";
        }

        if(status == 3) {
            status = "Complete";
        }

        if(status == 4) {
            status = "Delivered";
        }

        if(oldStatus == temp) {
            valid = false;
            alert('Customer already received order, cannot update anymore');
        }
        
        if(valid) {
            $.post('/editStatus_submit', {
                orderID: orderID,
                total: total,
                customer: customer,
                restID: restID,
                date: date,
                status: status
            }, function(result){
                switch(result.status) {
                    case 20001: {
                        alert(result.msg);
                        window.location.href = '/r/ChzIT';
                        break;
                    }
                    case 20002: {
                        alert(result.msg);
                        window.location.href = '/r/TacTown';
                        break;
                    }
                    case 20003: {
                        alert(result.msg);
                        window.location.href = '/r/SpCity';
                        break;
                    }
                    case 20004: {
                        alert(result.msg);
                        window.location.href = '/r/PotAc';
                        break;
                    }
                    case 20005: {
                        alert(result.msg);
                        window.location.href = '/r/BenG';
                        break;
                    }
                    case 20006: {
                        alert(result.msg);
                        window.location.href = '/r/AlCent';
                        break;
                    }
                    case 501: {
                        alert('case 501: ' + result.msg);
                        break;
                    }
                }
            })
        } 
    });

    $('#submitNewComment_customer').click(function(){
        var restID = $('#comment_restID').val();
        var userID = $('#comment_userID').val();
        var comment = $('#comment').val();
        var rating = $('#comment_rating').val();
        var valid = true;

        if(validator.isEmpty(comment)){
            valid = false;
            alert('Please input a comment');
        }

        if(rating == 0){
            valid = false;
            alert('Please select a rating');
        }

        if(valid) {
            $.post('/newComment_submit_customer', {
                restID: restID,
                userID: userID,
                comment: comment,
                rating: rating
            }, function(result) {
                switch(result.status) {
                    case 20001: {
                        alert(result.msg);
                        window.location.href = '/u/comm/ChzIT';
                        break;
                    }
                    case 20002: {
                        alert(result.msg);
                        window.location.href = '/u/comm/TacTown';
                        break;
                    }
                    case 20003: {
                        alert(result.msg);
                        window.location.href = '/u/comm/SpCity';
                        break;
                    }
                    case 20004: {
                        alert(result.msg);
                        window.location.href = '/u/comm/PotAc';
                        break;
                    }
                    case 20005: {
                        alert(result.msg);
                        window.location.href = '/u/comm/BenG';
                        break;
                    }
                    case 20006: {
                        alert(result.msg);
                        window.location.href = '/u/comm/AlCent';
                        break;
                    }
                    case 501: {
                        alert('case 501: ' + result.msg);
                        break;
                    }
                }
            })
        }
    })
    
});