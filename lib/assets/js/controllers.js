
App.controller('WatchesController', [ '$scope', '$http', function($scope, $http) {

  $scope.newInterval = '86400';

  $scope.addWatch = function() {
    
    $http({
      url: '/api/watches',
      method: 'POST',
      data: {
        name: $scope.newName,
        interval: parseInt($scope.newInterval, 10)
      }
    }).success(function(watch) {
      $scope.newName = null;
      $scope.watches.push(watch);
    }).error(function() {
      console.log('ERROR!');
      console.log(Array.prototype.slice.call(arguments));
    });;
  };

} ]);

App.controller('WatchController', [ '$scope', function($scope) {

  $scope.status = $scope.editing ? 'editing' : $scope.watch.status;

} ]);
