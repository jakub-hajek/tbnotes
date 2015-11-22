angular.module('tbnotes', ['tbnotes.templates', 'ui.router', 'pascalprecht.translate', 'ui.bootstrap', 'sticky'])
.constant('URLS', {
            notes: '/proxy/private-9aad-note10.apiary-mock.com/'
 })
.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/notes');
        $stateProvider
            .state('notes', {
                url: '/notes',
                templateUrl: 'components/notes/notelist.html'
            })
            .state('edit', {
                url: '/edit/:id',
                templateUrl: 'components/notes/editnote.html'
            })
            .state('new', {
                url: '/new',
                templateUrl: 'components/notes/editnote.html'
            })
            .state('detail', {
                url: '/detail/:id',
                templateUrl: 'components/notes/editnote.html'
            });

  }])
  .config(['$translateProvider', function ($translateProvider) {
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json' 
            });
            $translateProvider.preferredLanguage('cs');
  }])
.controller('MainController', ['$scope' , '$translate', function($scope, $translate) {
     $scope.selectedLanguage = 'cs';
     $scope.setLanguage = function(lang) {
        $translate.use(lang);
        $scope.selectedLanguage = lang;
     };

    $scope.getLangStyle = function(lang) {
        return $scope.selectedLanguage === lang ? {"font-weight": "bold"} : {"font-weight": "normal"};
    };

}]);
  
