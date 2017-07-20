var AnyplaceAPI = {};

AnyplaceAPI.FULL_SERVER = "http://anyplace.rayzit.com/anyplace";

/**
 * MAPPING API
 */
AnyplaceAPI.Mapping = {};
AnyplaceAPI.Navigation = {};
AnyplaceAPI.Other = {};

AnyplaceAPI.Other.GOOGLE_URL_SHORTNER_URL = "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDLSYNnIC93KfPnMYRL-7xI7yXjOhgulk8";

AnyplaceAPI.Mapping.BUILDING_ONE = "/mapping/building/get";
AnyplaceAPI.Mapping.BUILDING_ONE_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.BUILDING_ONE;

AnyplaceAPI.Mapping.BUILDING_ALL = "/mapping/building/all";
AnyplaceAPI.Mapping.BUILDING_ALL_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.BUILDING_ALL;

AnyplaceAPI.Mapping.FLOOR_ALL = "/mapping/floor/all";
AnyplaceAPI.Mapping.FLOOR_ALL_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.FLOOR_ALL;
AnyplaceAPI.Mapping.FLOOR_PLAN_DOWNLOAD = "/floorplans64/";
AnyplaceAPI.Mapping.FLOOR_PLAN_DOWNLOAD_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.FLOOR_PLAN_DOWNLOAD;

AnyplaceAPI.Mapping.POIS_ALL_FLOOR = "/mapping/pois/all_floor";
AnyplaceAPI.Mapping.POIS_ALL_FLOOR_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.POIS_ALL_FLOOR;

AnyplaceAPI.Mapping.POIS_ALL_BUILDING = "/mapping/pois/all_building";
AnyplaceAPI.Mapping.POIS_ALL_BUILDING_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.POIS_ALL_BUILDING;

AnyplaceAPI.Mapping.CONNECTION_ALL_FLOOR = "/mapping/connection/all_floor";
AnyplaceAPI.Mapping.CONNECTION_ALL_FLOOR_URL = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Mapping.CONNECTION_ALL_FLOOR;

AnyplaceAPI.Navigation.POIS_ROUTE = "/navigation/route";
AnyplaceAPI.Navigation.POIS_ROUTE = AnyplaceAPI.FULL_SERVER + AnyplaceAPI.Navigation.POIS_ROUTE;

app.factory('AnyplaceAPIService', ['$http', '$q', 'formDataObject', function ($http, $q, formDataObject) {

    $http.defaults.useXDomain = true;
    delete $http.defaults.headers.common['X-Requested-With'];

    var apiService = {};

    /**************************************************
     * BUILDING FUNCTIONS
     */
    apiService.allBuildings = function (json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.BUILDING_ALL_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });

    };

    apiService.getOneBuilding = function (json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.BUILDING_ONE_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });

    };

    /****************************************************
     * FLOOR FUNCTIONS
     */

    apiService.allBuildingFloors = function (json_req) {
        //alert( "make the request: " + json_req );
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.FLOOR_ALL_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });

    };

    apiService.downloadFloorPlan = function (json_req, buid, floor_number) {
        //alert( "make the request: " + json_req );
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.FLOOR_PLAN_DOWNLOAD_URL + buid + "/" + floor_number,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });
    };

    /******************************************************
     * POIS FUNCTIONS
     */
    apiService.retrievePoisByBuildingFloor = function (json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.POIS_ALL_FLOOR_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });
    }

    apiService.retrievePoisByBuilding = function (json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.POIS_ALL_BUILDING_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });
    }


    /****************************************************
     * CONNECTION FUNCTIONS
     */
    apiService.retrieveConnectionsByBuildingFloor = function (json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Mapping.CONNECTION_ALL_FLOOR_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });
    };


    /**
     * POIS ROUTES
     */
    apiService.retrieveRouteFromPoiToPoi = function (json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Navigation.POIS_ROUTE,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });
    };

    apiService.googleUrlShortener = function(json_req) {
        return $http({
            method: "POST",
            url: AnyplaceAPI.Other.GOOGLE_URL_SHORTNER_URL,
            data: json_req
        }).
            success(function (data, status) {
                return data;
            }).
            error(function (data, status) {
                return data;
            });
    };

    // we return apiService controller in order to be able to use it in ng-click
    return apiService;
}]);