function addAgfaScope($scope, $http, item) {
    $scope.starTogglTask = function (item) {
        if (typeof $scope.projectDict[item.categories[0].label] == 'undefined') {
            $scope.addProjectStartTask($scope, $http, item);
        } else {
            var req = {
                method: 'POST',
                url: 'https://www.toggl.com/api/v8/time_entries/start',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + $scope.TOGGLAPISECRET
                },
                data: {
                    "time_entry": {
                        "description": item.subject,
                        "pid": $scope.projectDict[item.categories[0].label],
                        "created_with": "outlook janban.van.dame"
                    }
                }
            };

            $http(req).then(function (response) {
                $.toaster({ message: 'Timer Started: ' + response.data.data.description, priority: 'success' });
                $("#currentTask").text('Current task: ' + response.data.data.description);
            });
        }
    };

    $scope.populateDictFromWS = function ($scope, $http) {
        $scope.projectDict = new Object();
        var mereq = {
            method: 'GET',
            url: 'https://www.toggl.com/api/v8/workspaces/' + $scope.toggleWSID + '/projects',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + $scope.TOGGLAPISECRET
            }
        };

        $http(mereq).then(function (response) {
            var projects = response.data;
            var projectDict = new Object();

            for (var i = 0; i < projects.length; i++) {
                projectDict[projects[i].name] = projects[i].id;
            }

            $scope.projectDict = projectDict;
        });
    }

    $scope.populateProjectDict = function ($http, $scope) {
        $http({
            method: 'GET',
            url: 'https://www.toggl.com/api/v8/me',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + $scope.TOGGLAPISECRET
            }
        }).then(function (response) {
            var data = response.data.data;

            for (var i = 0; i < data.workspaces.length; i++) {
                if (data.workspaces[i].name == $scope.config.TOGGLDEFWORKSPACE) {
                    $scope.toggleWSID = data.workspaces[i].id;
                    $scope.populateDictFromWS($scope, $http);
                }
            }
        });
    }

    $scope.addProjectStartTask = function ($scope, $http, item, handler) {
        var mereq = {
            method: 'POST',
            url: 'https://www.toggl.com/api/v8/projects',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + $scope.TOGGLAPISECRET
            },
            data: {
                "project": {
                    "name": item.categories[0].label,
                    "wid": $scope.toggleWSID
                }
            }
        };

        $http(mereq).then(function (response) {
            $.toaster({ message: 'Adding project ' + response.data.data.name, priority: 'warning' });
           
            $scope.projectDict[response.data.data.name] = response.data.data.id;
            $scope.starTogglTask(item);
        });
    }

    $scope.addProject = function ($scope, $http, item, handler) {
        var mereq = {
            method: 'POST',
            url: 'https://www.toggl.com/api/v8/projects',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + $scope.TOGGLAPISECRET
            },
            data: {
                "project": {
                    "name": item.categories[0].label,
                    "wid": $scope.toggleWSID
                }
            }
        };

        $http(mereq).then(function (response) {
            alert('Adding project ' + response.data.data.name );
            populateProjectDict($http, $scope);
        });
    }
}