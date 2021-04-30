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
                        window.location.href = '/u/ChzIT';
                        break;
                    }
                    case 20003: {
                        alert(result.msg);
                        window.location.href = '/u/ChzIT';
                        break;
                    }
                    case 20004: {
                        alert(result.msg);
                        window.location.href = '/u/ChzIT';
                        break;
                    }
                    case 20005: {
                        alert(result.msg);
                        window.location.href = '/u/ChzIT';
                        break;
                    }
                    case 20006: {
                        alert(result.msg);
                        window.location.href = '/u/ChzIT';
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
    
});