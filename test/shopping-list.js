describe('helperFactory test', function(){
	var helperFactory = null,
		items = [
	        { id : 1, item : 'Apples', qty : 1, type : 2, done : 1 },
	        { id : 2, item : 'Bread', qty : 1, type : 1, done : 1 },
	        { id : 3, item : 'Bananas', qty : 2, type : 2, done : 0 },
	        { id : 4, item : 'Pears', qty : 1, type : 2, done : 0 }
	    ],
	    thisItems = [];

	beforeEach(function() {

        module('myApp');

        inject(function(_helperFactory_) {

            helperFactory = _helperFactory_;

        });

    });

    it('should filter array and return records that are completed (done)', function() {

        thisItems = helperFactory.filterFieldArrayByDone(items, 'id', 1);

        expect(thisItems.length).toEqual(2);

    });

});

describe('ShoppingListController helper methods test', function() {

    var $scope,
        helperFactory,
        ShoppingListController;


    beforeEach(function() {

        module('myApp');

        inject(function($rootScope, _helperFactory_, $controller) {

            $scope = $rootScope.$new();

            helperFactory = _helperFactory_;

            ShoppingListController = $controller('ShoppingListController', {

                $scope : $scope,
                helperFactory : helperFactory

            });

        });

    });


    it('should return 0 for 2 characters', function() {

        $scope.item = '12';

        expect($scope.howManyMoreCharactersNeeded()).toEqual(0);

    });


    it('should return 40 for 10 characters', function() {

        $scope.item = '1234567890';

        expect($scope.howManyCharactersRemaining()).toEqual(40);

    });


    it('should return 10 for 60 characters', function() {

        $scope.item = '123456789012345678901234567890123456789012345678901234567890';

        expect($scope.howManyCharactersOver()).toEqual(10);

    });


    it('should return true for 2 or more characters - false otherwise', function() {

        $scope.item = '1';

        expect($scope.minimumCharactersMet()).toBeFalsy();

        $scope.item = '12';

        expect($scope.minimumCharactersMet()).toBeTruthy();

    });



    it('should return true for a number of characters between 2 and 50 - false otherwise', function() {

        $scope.item = '12';

        expect($scope.isNumberOfCharactersWithinRange()).toBeTruthy();

        $scope.item = '12345678901234567890123456789012345678901234567890';

        expect($scope.isNumberOfCharactersWithinRange()).toBeTruthy();

        $scope.item = '1';

        expect($scope.isNumberOfCharactersWithinRange()).toBeFalsy();

        $scope.item = '123456789012345678901234567890123456789012345678901';

        expect($scope.isNumberOfCharactersWithinRange()).toBeFalsy();

    });


    it ('should return true for number of characters more than 50 - false otherwise', function() {

        $scope.item = '123456789012345678901234567890123456789012345678901';

        expect($scope.anyCharactersOver()).toBeTruthy();

        $scope.item = '12345678901234567890123456789012345678901234567890';

        expect($scope.anyCharactersOver()).toBeFalsy();

    });


    it('should return true if all properties are properly filled in', function() {

        $scope.item = 'Bananas';
        $scope.qty = 1;
        $scope.type = 2;

        expect($scope.goodToGo()).toBeTruthy();

    });


    it('should clear the item, qty and type properties', function() {

        $scope.item = 'Bananas';
        $scope.qty = 1;
        $scope.type = 2;

        $scope.clear();

        expect($scope.item).toBe('');
        expect($scope.qty).toBe('');
        expect($scope.type).toBe(2);

    });


});


describe('ShoppingListController $http methods test', function() {

    var $scope,
        $http,
        $httpBackend,
        $log,
        helperFactory,
        ShoppingListController;


    beforeEach(function() {

        module('myApp');

        inject(function($rootScope, _$http_, _$httpBackend_, _$log_, _helperFactory_, $controller) {

            $scope = $rootScope.$new();
            $http = _$http_;
            $httpBackend = _$httpBackend_;
            $log = _$log_;
            helperFactory = _helperFactory_;

            $httpBackend.whenGET('mod/select.php').respond({
                items : [
                    { id : 1, item : 'Apples', qty : 1, type : 2, done : 0 },
                    { id : 2, item : 'Bread', qty : 1, type : 1, done : 1 }
                ],
                types : [
                    { id : 1, name : 'Qty' },
                    { id : 2, name : 'Kg' }
                ]
            });

            ShoppingListController = $controller('ShoppingListController', {
                $scope: $scope,
                $http: $http,
                $log: $log,
                helperFactory: helperFactory
            });

        });


    });


    afterEach(function() {

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

    });


    it('should get all items', function() {

        $httpBackend.flush();

        expect($scope.items.length).toBe(2);
        expect($scope.types.length).toBe(2);

    });

    it('should add new item and clear the properties', function() {

        $httpBackend.flush();

        $scope.item = 'Bananas';
        $scope.qty = 2;
        $scope.type = 2;

        $httpBackend
            .expectPOST('mod/insert.php')
            .respond(
                {
                    error : false,
                    item : {
                        id : 3,
                        item : 'Bananas',
                        qty : 2,
                        type : 2,
                        type_name : 'Kg',
                        done : 0,
                        date : '2014-10-01 18:18:13'
                    }
                }
            );

        $scope.insert();

        $httpBackend.flush();

        expect($scope.items.length).toBe(3);

        expect($scope.items[2].id).toBe(3);
        expect($scope.items[2].item).toBe('Bananas');
        expect($scope.items[2].qty).toBe(2);
        expect($scope.items[2].type).toBe(2);

        expect($scope.item).toBe('');
        expect($scope.qty).toBe('');
        expect($scope.type).toBe(2);


    });

    it('should update record and return json { error : false }', function() {

        $httpBackend.flush();

        $httpBackend
            .expectPOST('mod/update.php')
            .respond({ error : false });

        $scope.update({ id : 1, done : 1 });

        $httpBackend.flush();

        expect($log.info.logs).toContain([{ error : false }]);


    });


    it('should remove record and filter items to only include { done : 0 }', function() {


        $httpBackend.flush();

        $httpBackend
            .expectPOST('mod/remove.php')
            .respond({ error : false });

        $scope.remove();

        $httpBackend.flush();

        expect($scope.items.length).toBe(1);
        expect($scope.items[0].item).toContain('Apples');


    });

});