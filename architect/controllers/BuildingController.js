/* Start: BuildingController.js */
app.controller('BuildingController', ['$scope', '$compile', 'GMapService', 'AnyplaceService', 'AnyplaceAPIService', function ($scope, $compile, GMapService, AnyplaceService, AnyplaceAPIService) {

  $scope.myMarkers = {};
  $scope.myMarkerId = 0;

  $scope.gmapService = GMapService;
  $scope.anyService = AnyplaceService;
  $scope.anyAPI = AnyplaceAPIService;

  $scope.myBuildings = [];

  $scope.myBuildingsHashT = {};

  $scope.crudTabSelected = 1;
  $scope.markerGroup = L.layerGroup().addTo($scope.gmapService.gmap);
  
  $scope.setCrudTabSelected = function (n) {
    $scope.crudTabSelected = n;

    if (!$scope.anyService.getBuilding()) {
      _err("No building is selected.");
      return;
    }

    var b = $scope.myBuildingsHashT[$scope.anyService.getBuildingId()];
    if (!b) {
      return;
    }

    var m = b.marker;
    if (!m) {
      return;
    }

    // edit building
    if (n === 2) {
      m.dragging.enable();
    } else {
      m.dragging.disable();;
    }

  };
  $scope.isCrudTabSelected = function (n) {
    return $scope.crudTabSelected === n;
  };

  $scope.$on("loggedIn", function (event, mass) {
    //_suc('Successfully logged in.');
    $scope.fetchAllBuildings();
  });

  $scope.$on("loggedOff", function (event, mass) {
    _clearBuildingMarkersAndModels();
    $scope.myMarkers = {};
    $scope.myMarkerId = 0;
    $scope.myBuildings = [];
    $scope.myBuildingsHashT = {};
  });

  $scope.$watch('anyService.selectedBuilding', function (newVal, oldVal) {
    if (newVal && newVal.coordinates_lat && newVal.coordinates_lon) {
      // Pan map to selected building
      // $scope.gmapService.gmap.panTo(_latLngFromBuilding(newVal));
      // $scope.gmapService.gmap.setZoom(19);

      $scope.gmapService.gmap.setView(_latLngFromBuilding(newVal), 19);

      if (typeof(Storage) !== "undefined" && localStorage) {
        localStorage.setItem("lastBuilding", newVal.buid);
      }       
    }
  });

  var _clearBuildingMarkersAndModels = function () {
    for (var b in $scope.myBuildingsHashT) {
      if ($scope.myBuildingsHashT.hasOwnProperty(b)) {
        $scope.markerGroup.removeLayer($scope.myBuildingsHashT[b].marker._leaflet_id);
        delete $scope.myBuildingsHashT[b];
      }
    }
  };

  var _err = function (msg) {
    $scope.anyService.addAlert('danger', msg);
  };

  var _suc = function (msg) {
    $scope.anyService.addAlert('success', msg);
  };

  var _warn = function (msg) {
    $scope.anyService.addAlert('warning', msg);
  };

  var _latLngFromBuilding = function (b) {
    if (b && b.coordinates_lat && b.coordinates_lon) {
      return L.latLng(parseFloat(b.coordinates_lat),
        parseFloat(b.coordinates_lon));
    }
    return undefined;
  };

  $scope.fetchAllBuildings = function () {
    var jsonReq = {};
    jsonReq.username = $scope.creds.username;
    jsonReq.password = $scope.creds.password;
    jsonReq.owner_id = $scope.owner_id;

    if (!jsonReq.owner_id) {
      _err("Could nor authorize user. Please refresh.");
      return;
    }

    var promise = $scope.anyAPI.allBuildings(jsonReq);
    promise.then(
      function (resp) {
        // on success
        var data = resp.data;
        //var bs = JSON.parse( data.buildings );
        $scope.myBuildings = data.buildings;

        // var infowindow = new google.maps.InfoWindow({
        //     content: '-',
        //     maxWidth: 500
        // });

        var localStoredBuildingIndex = -1;
        var localStoredBuildingId = undefined;
        if (typeof(Storage) !== "undefined" && localStorage && localStorage.getItem('lastBuilding')) {
          localStoredBuildingId = localStorage.getItem('lastBuilding');
        }

        for (var i = 0; i < $scope.myBuildings.length; i++) {

          var b = $scope.myBuildings[i];

          if (localStoredBuildingId && localStoredBuildingId === b.buid) {
            localStoredBuildingIndex = i;
          }

          if (b.is_published === 'true' || b.is_published == true) {
            b.is_published = true;
          } else {
            b.is_published = false;
          }
          var myIcon = L.icon({
            iconUrl: 'build/images/building-icon.png',
            iconSize: [54, 54]
          });

          var marker = L.marker([b.coordinates_lat,b.coordinates_lon],{icon: myIcon});


          // var marker = new google.maps.Marker({
          //     position: _latLngFromBuilding(b),
          //     map: GMapService.gmap,
          //     icon: new google.maps.MarkerImage(
          //         'build/images/building-icon.png',
          //         null, /* size is determined at runtime */
          //         null, /* origin is 0,0 */
          //         null, /* anchor is bottom center of the scaled image */
          //         new google.maps.Size(54, 54)),
          //     draggable: false
          // });

          var htmlContent = '<div class="infowindow-scroll-fix">'
            + '<h5 style="margin: 0">Building:</h5>'
            + '<span>' + b.name + '</span>'
            + '<h5 style="margin: 8px 0 0 0">Description:</h5>'
            + '<span>' + b.description + '</span>'
            + '</div>';
          var tpl = $compile(htmlContent)($scope);        
          marker.building = b;
          marker.addTo($scope.markerGroup).bindPopup(tpl[0]);
          // marker.infoContent = htmlContent;
          

          $scope.myBuildingsHashT[b.buid] = {
            marker: marker,
            model: b
          };

          // google.maps.event.addListener(marker, 'click', function () {
          //     infowindow.setContent(this.infoContent);
          //     infowindow.open(GMapService.gmap, this);
          //     var self = this;
          //     $scope.$apply(function () {
          //         $scope.anyService.selectedBuilding = self.building;
          //     });
          // });

          marker.on('click', function () {
              // infowindow.setContent(this.infoContent);
              // infowindow.open(GMapService.gmap, this);
              var self = this;
              $scope.$apply(function () {
                $scope.anyService.selectedBuilding = self.building;
              });
          });
        }

        // using the latest building form localStorage
        if (localStoredBuildingIndex >= 0) {
          $scope.anyService.selectedBuilding = $scope.myBuildings[localStoredBuildingIndex];
        } else if ($scope.myBuildings[0]) {
          $scope.anyService.selectedBuilding = $scope.myBuildings[0];
        }

        // _suc('Successfully fetched buildings.');
      },
      function (resp) {
        // on error
        var data = resp.data;
        _err('Something went wrong while fetching buildings.');
      }
    );
  };

  $scope.addNewBuilding = function (id) {

    if ($scope.myMarkers[id] && $scope.myMarkers[id].marker) {

      var building = $scope.myMarkers[id].model;

      // set owner id
      building.owner_id = $scope.owner_id;

      if (!building.owner_id) {
        _err("Could not authorize user. Please refresh.");
        return;
      }

      building.coordinates_lat = String($scope.myMarkers[id].marker._latlng.lat);
      building.coordinates_lon = String($scope.myMarkers[id].marker._latlng.lng);

      if (building.coordinates_lat === undefined || building.coordinates_lat === null) {
        _err("Invalid building latitude.");
        return;
      }

      if (building.coordinates_lon === undefined || building.coordinates_lon === null) {
        _err("Invalid building longitude.");
        return;
      }

      if (building.is_published === true) {
        building.is_published = "true";
      } else {
        building.is_published = "false";
      }

      if (!building.description) {
        building.description = "-";
      }

      if (building.owner_id && building.name && building.description && building.is_published && building.url && building.address) {

        var promise = $scope.anyAPI.addBuilding(building);

        promise.then(
          function (resp) {
            // on success
            var data = resp.data;
            console.log("new buid: " + data.buid);
            building.buid = data.buid;

            if (building.is_published === 'true' || building.is_published == true) {
              building.is_published = true;
            } else {
              building.is_published = false;
            }

            // insert the newly created building inside the loadedBuildings
            $scope.myBuildings.push(building);

            $scope.anyService.selectedBuilding = $scope.myBuildings[$scope.myBuildings.length - 1];

            $scope.myMarkers[id].marker.dragging.disable();

            $scope.myBuildingsHashT[building.buid] = {
              marker: $scope.myMarkers[id].marker,
              model: building
            };

            // if ($scope.myMarkers[id].infowindow) {
            //     $scope.myMarkers[id].infowindow.setContent($scope.myMarkers[id].marker.tpl2[0]);
            //     $scope.myMarkers[id].infowindow.close();
            // }

            _suc("Building added successfully.");

          },
          function (resp) {
            // on error
            var data = resp.data;
            _err("Something went wrong while adding the building. " + data.message);
          }
        );


      } else {
        _err("Some required fields are missing.");
      }
    }
  };

  $scope.deleteBuilding = function () {

    var b = $scope.anyService.getBuilding();

    var reqObj = $scope.creds;

    if (!$scope.owner_id) {
      _err("Could not identify user. Please refresh and sign in again.");
      return;
    }

    reqObj.owner_id = $scope.owner_id;

    if (!b || !b.buid) {
      _err("No building selected for deletion.");
      return;
    }

    reqObj.buid = b.buid;

    var promise = $scope.anyAPI.deleteBuilding(reqObj);
    promise.then(
      function (resp) {
        // on success
        var data = resp.data;

        console.log("building deleted: ", b);

        // delete the building from the loadedBuildings
        // $scope.myBuildingsHashT[b.buid].marker.setMap(null);
        $scope.markerGroup.removeLayer($scope.myBuildingsHashT[b.buid].marker._leaflet_id);
        delete $scope.myBuildingsHashT[b.buid];

        var bs = $scope.myBuildings;
        var sz = bs.length;
        for (var i = 0; i < sz; i++) {
          if (bs[i].buid == b.buid) {
            bs.splice(i, 1);
            break;
          }
        }

        // update the selected building
        if ($scope.myBuildings && $scope.myBuildings.length > 0) {
          $scope.anyService.selectedBuilding = $scope.myBuildings[0];
        }

        $scope.setCrudTabSelected(1);

        _suc("Successfully deleted building.");
      },
      function (resp) {
        // on error
        var data = resp.data;
        _err("Something went wrong. It's likely that everything related to the building is deleted but please refresh to make sure or try again.");
      }
    );

  };

  $scope.updateBuilding = function () {
    var b = $scope.anyService.getBuilding();

    if (LPUtils.isNullOrUndefined(b) || LPUtils.isNullOrUndefined(b.buid)) {
      _err("No building selected found.");
      return;
    }

    var reqObj = {};

    // from controlBarController
    reqObj = $scope.creds;
    if (!$scope.owner_id) {
      _err("Could not identify user. Please refresh and sign in again.");
      return;
    }

    reqObj.owner_id = $scope.owner_id;

    reqObj.buid = b.buid;

    if (b.description) {
      reqObj.description = b.description;
    }

    if (b.name) {
      reqObj.name = b.name;
    }

    if (b.is_published === true || b.is_published == "true") {
      reqObj.is_published = "true";
    } else {
      reqObj.is_published = "false";
    }

    if (b.bucode) {
      reqObj.bucode = b.bucode;
    }

    var marker = $scope.myBuildingsHashT[b.buid].marker;
    if (marker) {
      var latLng = marker._latlng;
      if (latLng && latLng.lat && latLng.lng) {
        reqObj.coordinates_lat = String(latLng.lat);
        reqObj.coordinates_lon = String(latLng.lng);
      }
    }

    var promise = $scope.anyAPI.updateBuilding(reqObj);
    promise.then(
      function (resp) {
        // on success
        var data = resp.data;

        if (b.is_published === 'true' || b.is_published == true) {
          b.is_published = true;
        } else {
          b.is_published = false;
        }

        _suc("Successfully updated building.")
      },
      function (resp) {
        // on error
        var data = resp.data;
        _err("Something went wrong while updating building. " + data.message);
      }
    );

  };

  // var overlay = new google.maps.OverlayView();
  // overlay.draw = function () {
  // };
  // overlay.setMap(GMapService.gmap);
  $(".draggable-building").draggable({
    helper: 'clone',
    stop: function (e) {
      var point = L.point(e.pageX, e.pageY);
      var ll = $scope.gmapService.gmap.containerPointToLatLng(point);
      $scope.placeMarker(ll);
    }
  });
  

  $scope.placeMarker = function (location) {

    var prevMarker = $scope.myMarkers[$scope.myMarkerId - 1];
    /* Needs testing?*/
    // if (prevMarker && prevMarker.marker && prevMarker.marker.getMap() && prevMarker.marker.getDraggable()) {
    if (prevMarker && prevMarker.marker && prevMarker.marker.dragging.enabled()) {
      $scope.$apply(_warn("There is a building pending, please add 1 at a time."));
      console.log('there is a building pending, please add 1 at a time');
      return;
    }

    // var marker = new google.maps.Marker({
    //     position: location,
    //     map: GMapService.gmap,
    //     icon: 'build/images/building-icon.png',
    //     draggable: true
    // });
    var myIcon = L.icon({
      iconUrl: 'build/images/building-icon.png',
      iconSize: [55, 55]
    });
    var marker = L.marker([location.lat,location.lng],{draggable: true,icon: myIcon});
    $scope.$apply(function () {
      marker.myId = $scope.myMarkerId;
      $scope.myMarkers[marker.myId] = {};
      $scope.myMarkers[marker.myId].model = {
        description: "",
        name: undefined,
        is_published: true,
        address: "-",
        url: "-",
        bucode: ""
      };
      $scope.myMarkers[marker.myId].marker = marker;
      // $scope.myMarkers[marker.myId].infowindow = infowindow;
      $scope.myMarkerId++;
    });

    var htmlContent = '<form name="buildingForm" class="infowindow-scroll-fix">'
      + '<fieldset class="form-group">'
      + '<input ng-model="myMarkers[' + marker.myId + '].model.bucode" id="building-code" type="text" class="form-control" placeholder="Building Code (Optional)"/>'
      + '</fieldset>'
      + '<fieldset class="form-group">'
      + '<input ng-model="myMarkers[' + marker.myId + '].model.name" id="building-name" type="text" class="form-control" placeholder="Building Name *"/>'
      + '</fieldset>'
      + '<fieldset class="form-group">'
      + '<textarea ng-model="myMarkers[' + marker.myId + '].model.description" id="building-description" type="text" class="form-control" placeholder="Building Description (Optional)"></textarea>'
      + '</fieldset>'
      + '<fieldset class="form-group">'
      + '<input ng-model="myMarkers[' + marker.myId + '].model.is_published" id="building-published" type="checkbox"><span> Make building public to view.</span>'
      + '</fieldset>'
      + '<div style="text-align: center;">'
      + '<fieldset class="form-group" style="display: inline-block; width: 75%;">'
      + '<button type="submit" class="btn btn-success add-any-button" ng-click="addNewBuilding(' + marker.myId + ')">'
      + '<span class="glyphicon glyphicon-plus"></span> Add'
      + '</button>'
      + '</fieldset>'
      + '<fieldset class="form-group" style="display: inline-block;width: 23%;">'
      + '<button type="button" class="btn btn-danger add-any-button" style="margin-left:2px" ng-click="deleteTempBuilding(' + marker.myId + ')"><span class="glyphicon glyphicon-remove"></span>'
      + '</button>'
      + '</fieldset>'
      + '</div>'
      + '</form>';

    var htmlContent2 = '<div class="infowindow-scroll-fix">'
      + '<h5 style="margin: 0">Building:</h5>'
      + '<span>{{myMarkers[' + marker.myId + '].model.name}}</span>'
      + '<h5 style="margin: 8px 0 0 0">Description:</h5>'
      + '<span>{{myMarkers[' + marker.myId + '].model.description}}</span>'
      + '</div>';


    
    var tpl = $compile(htmlContent)($scope);        
    marker.tpl2 = $compile(htmlContent2)($scope);
    marker.addTo($scope.markerGroup).bindPopup(tpl[0]).openPopup();
    console.log("for debugging");
    // var infowindow = new google.maps.InfoWindow({
    //     content: '-',
    //     maxWidth: 500
    // });


    // var tpl = $compile(htmlContent)($scope);
    // marker.tpl2 = $compile(htmlContent2)($scope);

    // infowindow.setContent(tpl[0]);
    // infowindow.open(GMapService.gmap, marker);

    // google.maps.event.addListener(marker, 'click', function () {
    //     if (!infowindow.getMap()) {
    //         infowindow.open(GMapService.gmap, marker);
    //     }
    // });
  };

  $scope.deleteTempBuilding = function (id) {
    var myMarker = $scope.myMarkers[id];
    if (myMarker && myMarker.marker) {
      // myMarker.marker.setMap(null);
      $scope.markerGroup.removeLayer(myMarker.marker._leaflet_id);
    }
  };

  /**
   * building {
   *  name:
   *  description:
   *  coordinates_lat:
   *  coordinates_lon:
   *  floors: [
   *      0: {
   *          pois: [
   *              name:
   *              description:
   *              pois_type:
   *              is_building_entrance:
   *              coordinates_lat:
   *              coordinates_lon:
   *          ]
   *      }
   *  ];
   * }
   */
  $scope.exportBuildingToJson = function () {
    var result = {
      building: {
        floors: []
      }
    };

    var building = $scope.anyService.selectedBuilding;
    if (LPUtils.isNullOrUndefined(building)) {
      _err('No building selected');
      return;
    }

    result.building.name = building.name;
    result.building.description = building.description;
    result.building.coordinates_lat = building.coordinates_lat;
    result.building.coordinates_lon = building.coordinates_lon;

    var jsonReq = AnyplaceService.jsonReq;
    jsonReq.buid = building.buid;

    var count = 0;

    var promise = AnyplaceAPIService.allBuildingFloors(jsonReq);
    promise.then(
      function (resp) {
        var floors = resp.data.floors;

        var resFloors = [];

        if (floors) {
          for (var i = 0; i < floors.length; i++) {

            (function (jreq) {
              var promise = AnyplaceAPIService.retrievePoisByBuildingFloor(jreq);
              promise.then(
                function (resp) {
                  var data = resp.data;

                  var poisArray = data.pois;

                  if (poisArray) {

                    var flPois = [];

                    var fNo = poisArray[0].floor_number;

                    for (var j = 0; j < poisArray.length; j++) {
                      var sPoi = poisArray[j];

                      if (sPoi.pois_type == "None") {
                        continue;
                      }

                      var tmp = {
                        name: sPoi.name,
                        description: sPoi.description,
                        pois_type: sPoi.pois_type,
                        coordinates_lat: sPoi.coordinates_lat,
                        coordinates_lon: sPoi.coordinates_lon
                      };

                      if (sPoi.is_building_entrance) {
                        tmp.is_building_entrance = 'true';
                      }

                      flPois.push(tmp);
                    }

                    resFloors.push(
                      {
                        floor_number: fNo,
                        pois: flPois
                      }
                    );

                    count++;
                    if (count === floors.length) {
                      result.building.floors = resFloors;

                      _suc('Successfully exported ' + building.name + ' to JSON.');

                      var blob = new Blob([JSON.stringify(result, null, 4)], {type: "text/plain;charset=utf-8"});
                      saveAs(blob, building.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-") + ".txt");
                    }

                  }
                },
                function (resp) {
                  var data = resp.data;
                  console.log(data.message);
                });
            }({
              buid: building.buid,
              floor_number: floors[i].floor_number
            }));
          }
        }
      },
      function (resp) {
        _err(resp.data.message);
        console.log(resp.data.message);
      }
    );
  };

}]);
/* End: BuildingController.js */