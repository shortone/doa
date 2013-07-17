
App.controller('WatchesController', [ '$scope', '$http', function($scope, $http) {

  _.extend($scope, {
    newInterval: '86400'
  });

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
    });
  };

} ]);

App.controller('WatchController', [ '$scope', 'i18n', function($scope, i18n) {

  _.extend($scope, {
  
    toggleDetails: function() {
      $scope.details = !$scope.details;
    },

    lastPingedAt : function() {
      var lastPingedAt = $scope.watch.lastPingedAt;
      if (!lastPingedAt) {
        return i18n.t('pingInstructions');
      } else {
        return i18n.t('lastPing', {
          time: moment(new Date(lastPingedAt)).format('dddd, MMMM Do YYYY, HH:mm:ss')
        });
      }
    }
  });
} ]);
