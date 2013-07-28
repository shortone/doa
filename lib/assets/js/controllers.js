
App.controller('WatchesController', [ '$scope', '$http', 'i18n', function($scope, $http, i18n) {

  _.extend($scope, {

    newInterval: 86400,

    addWatch: function() {
      
      $http.post('/api/watches', {
        name: $scope.newName,
        interval: parseInt($scope.newInterval, 10)
      }).success(function(watch) {
        delete $scope.newName;
        $scope.watches.push(watch);
      });
    },

    watchClimateText: function() {

      var count = this.countWatches();

      var climate;
      if (!count.total) {
        climate = 'nothing';
      } else if (count.down && count.down == count.total) {
        climate = 'allDown';
      } else if (count.down) {
        climate = 'someDown';
      } else if (count['new'] == count.total) {
        climate = 'allNew';
      } else {
        climate = 'noneDown';
      }

      return i18n.t('climate.' + climate);
    },

    watchNumbersText: function() {
      return _.map(_.omit(this.countWatches(), 'total'), function(n, status) {
        return i18n.t('climate.' + status + 'Count', { n: n });
      }).join(', ');
    },

    countWatches: function() {

      var count = _.inject($scope.watches, function(memo, watch) {
        memo[watch.status] = (memo[watch.status] || 0) + 1;
        return memo;
      }, {});

      count.total = _.inject(count, function(memo, n) { return memo + n; }, 0);

      return count;
    }
  });
} ]);

App.controller('WatchController', [ '$scope', '$http', 'i18n', function($scope, $http, i18n) {

  _.extend($scope, {

    ui : {},

    destroy: function() {
      $scope.ui.busy = true;
      $http['delete']('/api/watches/' + $scope.watch.token).success(function() {
        $scope.watches.splice($scope.$index, 1);
      });
    },

    actionText: function() {
      return $scope.ui.status == 'editing' ? i18n.t('common.save') : this.statusText();
    },

    statusText: function() {

      var options = {};
      if ($scope.watch.lastPingedAt) {
        options.time = moment(new Date($scope.watch.lastPingedAt)).fromNow(true);
      }

      return i18n.t('status.' + $scope.watch.status, options);
    },

    toggleEdit: function() {
      if ($scope.ui.status != 'editing') {
        $scope.ui.status = 'editing';
        $scope.originalWatch = _.clone($scope.watch);
      } else {
        delete $scope.ui.status;
        _.extend($scope.watch, $scope.originalWatch);
        delete $scope.originalWatch;
      }
    },

    save: function() {
      $scope.ui.busy = true;
      $http.put('/api/watches/' + $scope.watch.token, $scope.watch).success(function() {
        delete $scope.ui.status;
        delete $scope.originalWatch;
        delete $scope.ui.busy;
      });
    },
  
    toggleDetails: function() {
      $scope.ui.detailed = !$scope.ui.detailed;
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
