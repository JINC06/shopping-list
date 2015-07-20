"use strict";

angular.module('myApp', [])

	.constant('MAX_LENGTH', 50)

	.constant('MIN_LENGTH', 2)

	.factory('helperFactory', function(){

		return {

			filterFieldArrayByDone: function(thisArray, thisField, thisValue){

				var arrayToReturn = [];

				for(var i = 0; i < thisArray.length; i++){

					if(thisArray[i].done == thisValue){

						arrayToReturn.push(thisArray[i][thisField]);

					}

				}

				return arrayToReturn;

			}

		};})

	.controller('ShoppingListController', function($scope, $http, $log, helperFactory, MAX_LENGTH, MIN_LENGTH){

		var urlInsert = '/mod/insert.php';
		var urlSelect = '/mod/select.php';
		var urlUpdate = '/mod/update.php';
		var urlRemove = '/mod/remove.php';

		$scope.types = [];
		$scope.items = [];

		$scope.item = '';
		$scope.qty = '';
		$scope.types = '';

		$scope.howManyCharactersNeeded = function(){
			// onion  2 - 5    -3
			var characters = (MIN_LENGTH - $scope.item.length);
			
			return (characters > 0) ? characters : 0;

		};

		$scope.howManyCharactersRemaining = function() {

			var characters = (MAX_LENGTH - $scope.item.length);

			return (characters > 0) ? characters : 0;

		};


		$scope.howManyCharactersOver = function(){

			var characters = (MAX_LENGTH - $scope.item.length);

			return (characters < 0) ? Math.abs(characters) : 0;

		};

		$scope.mininumCharactersMet = function() {

			return ($scope.howManyCharactersNeeded() == 0);

		};

		$scope.anyCharactersOver = function() {

			return ($scope.howManyCharactersOver() > 0);

		};

		$scope.isNumberOfCharactersWithinRange = function() {

			return (
				$scope.mininumCharactersMet() &&
				!$scope.anyCharactersOver()
			);

		};

		$scope.goodToGo = function() {

			return (
				$scope.isNumberOfCharactersWithinRange() &&
				$scope.qty > 0 &&
				$scope.type > 0
			);

		};

		$scope.clear = function() {

            $scope.item = '';
            $scope.qty = '';

        };

        function _recordAddedSuccessfully(data) {

            return (
                data &&
                !data.error &&
                data.item
            );

        }

        $scope.insert = function() {

        	if ($scope.goodToGo()) {

        		var thisData = "item=" + $scope.item;
                thisData += "&qty=" + $scope.qty;
                thisData += "&type=" + $scope.type;

        		$http({

                    method : 'POST',
                    url : urlInsert,
                    data : thisData,
                    headers : {'Content-Type' : 'application/x-www-form-urlencoded'}

                })
                    .success(function(data) {

                        if (_recordAddedSuccessfully(data)) {

                            $scope.items.push({

                                id : data.item.id,
                                item : data.item.item,
                                qty : data.item.qty,
                                type : data.item.type,
                                type_name : data.item.type_name,
                                done : data.item.done

                            });

                            $scope.clear();

                        }

                    })
                    .error(function(data, status, headers, config) {

                        throw new Error('Something went wrong with inserting record');

                    });

        	}

        };


        $scope.select = function() {

            $http.get(urlSelect)
                .success(function(data) {

                    if (data.items) {

                        $scope.items = data.items;

                    }

                    if (data.types) {

                        $scope.types = data.types;

                        $scope.type = $scope.types[0].id;

                    }

                })
                .error(function(data, status, headers, config) {

                    throw new Error('Something wend wrong with selectin records');

                });

        };


        $scope.select();





	});