var myApp = angular.module('myApp',[]);
  
angular.module('tbnotes').controller('NotesController', ['$scope', 'NoteService','$state', function($scope, NoteService, $state) {

     $scope.notes = [];
     $scope.refreshNotes = function() {
     	var modal = NoteService.openModal();
     	var	promise = NoteService.all();
     	promise.then(function(data) {
     		$scope.notes = data.data;
     	});
     	promise.finally(function() {modal.close();});
     };

    $scope.delete = function(id) {
          var modal = NoteService.openModal();
          var promise = NoteService.destroy(id);
          promise.finally(function() {
          	modal.close();
          	$scope.refreshNotes();
          });
     };

     $scope.refreshNotes();

}]);