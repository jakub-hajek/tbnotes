var myApp = angular.module('myApp',[]);
  
angular.module('tbnotes').controller('EditController', ['$scope', 'NoteService', '$state',
     function($scope, NoteService, $state) {
     $scope.note = {};
     $scope.getNote = function(id) {
          if (id === undefined || id === null) {
               return;
          }
     	var modal = NoteService.openModal();
          var promise = NoteService.fetch(id);
     	promise.then(function(data) {
     		$scope.note= data.data;
     	});
     	promise.finally(function() {modal.close();});
     };
     

     $scope.isEdit = function(id) {
          return $state.current.name === 'edit';
     }; 

     $scope.isNew= function(id) {
          return $state.current.name === 'new';
     }; 

     $scope.isDetail = function(id) {
          return $state.current.name === 'detail';
     }; 

     $scope.create = function() {
     	var modal = NoteService.openModal();
     	var promise = NoteService.create($scope.note);
     	promise.then(function(data) {
     		$state.go('notes');
     	});
     	promise.finally(function() {modal.close();});
     };

      $scope.update = function() {
          var modal = NoteService.openModal();
          var promise = NoteService.update($scope.note.id, $scope.note);
          promise.then(function(data) {
               $state.go('notes');
          });
          promise.finally(function() {modal.close();});
     };


     $scope.getNote($state.params.id);
    
}]);