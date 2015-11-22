(function () {
'use strict';

/**
 * provides REST operations for notes
 *
 * @author jakub.hajek
 */
var NoteServiceFactory = function(log, $http, URLS, $q, $uibModal) {
    var self = null,
        path = 'notes';
    /**
     * Service constructor.
     */
    var NoteService = function() {
        self = this;
    };

    var getUrl = function() {
          return URLS.notes + path;
    };

    var getUrlForId = function(itemId) {
          return getUrl(path) + '/' + itemId;
    };

    var notes = [{id:1, title:"first note"},{id:2, title:"second note"}];

        
    NoteService.prototype = {

        //opens "In progress" modal and returns modalInstance
        //caller should taka care about closing the modal
        openModal: function() {
            return $uibModal.open({
                animation: true,
                templateUrl: 'components/shared/progressmodal.html',
                size: 'progress'
            });
        },


        //gets all notes (GET)
        all: function () {
            return $http.get(getUrl());
        },

        //get one note by Id (GET)
        fetch: function (itemId) {
// uncomment to use static results instead of real service call
 //           var defer = $q.defer(); 
 //           defer.resolve(notes);
 //           return defer.promise;
            return $http.get(getUrlForId(itemId));
        },

        //post new note (POST)
        create: function (item) {
            return $http.post(getUrl(), item);
        },

        //updates note by Id (PUT)
        update: function (itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        },

        //deletes note by Id (DELETE)
        destroy: function (itemId) {
            return $http.delete(getUrlForId(itemId));
        }
    };

    return new NoteService();
};

NoteServiceFactory.$inject = ['$log', '$http', 'URLS', '$q', '$uibModal'];
angular.module('tbnotes').factory('NoteService', NoteServiceFactory);

})();