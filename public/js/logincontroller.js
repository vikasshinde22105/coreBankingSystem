var app = angular.module('myApp', []);
    app.controller('customersCtrl', function($scope,$window,$http,$sce) {
        $scope.add_status=function(){
          
        $scope.showError = false;
		$scope.userLoggedin=false;
        var usernametmp = $scope.username;
        var passwordtmp = $scope.password;
        console.log($scope.username);
        var loginCredential = {
          username: usernametmp,
          password: passwordtmp
        };
      
        var config = {
          headers : {
              'Content-Type':'application/json'
          }
        }
        $http.post('/api/customer_detail', loginCredential, config).success(function (data) {
          console.log(data);
         
              if(data.success){
                console.log("Login");
                $scope.showError = false;
				$scope.userLoggedin=true;
                $window.location.href = '/index.html';
              }
              else{
                console.log("Failed");
                $scope.showError = true;
				$scope.userLoggedin=false;
                //$('#errorblock').css('display','block');
              }				
            
            
           
           
          //}
        });
      };
    });