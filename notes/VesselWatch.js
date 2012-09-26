/**
* For technical VesselWatch questions or comments reguarding this code email Tom Shea: sheat@wsdot.wa.gov
* Builds out the dynamic portions of the VesselWatch webpage using JSON, implements 15 second AJAX refreshing.
*/

dojo.require("esri.map");

var RefreshListIntervals = [];

var map, myTiledMapServiceLayer, layerViewURLVars, mySpatialReference, userLon, userLat, userZ, appurl, userViewURLVars, selectedVessel = 0, selectedTerminal = 0, selectedTerminalTab = 0, selectedCamera = 0, userclickedferry_bool = false, zoomToInitialMapView_bool = false, prev_mmsi = "", terminal_upd_id = null, terminal_upd_txt = "No Terminal Selected";
var currentTerminalsJson, currentTerminalsIcon;
var graphicObject = 0;
var graphicObjectIntersection = false;

var LabelPosition = [
    { "id": 0, "location": "Below" },
    { "id": 1, "location": "Above" },
    { "id": 2, "location": "Left" },
    { "id": 3, "location": "Right" },
    { "id": 4, "location": "BelowLeft" },
    { "id": 5, "location": "BelowRight" },
    { "id": 6, "location": "AboveLeft" },
    { "id": 7, "location": "AboveRight" },
    { "id": 8, "location": "Below" }
];

/**
* Iteration function for anything that needs to walk through a graphics layer
*/
function forEachLayerGraphic(layer, actionFunction, args) {
    var func = (typeof actionFunction == 'function') ? actionFunction : new Function(actionFunction);
    for (i = 0; i < layer.graphics.length; i++)
        func(layer.graphics[i], args);
}

/**
* Find nearby space for new graphics
* @see AreaClear
*/
function clearGraphic(graphic, args) {
    if (graphic.attributes.mmsi == args[0]) graphicObject = graphic;
}

/**
* Detects bumping intersection of graphic objects
*/
function detectIntersection(graphic, args) {
    if (graphic.attributes.mmsi != args[0].attributes.mmsi)
        graphicObjectIntersection = Intersection(graphic, args[0], args[1]);
}

/**
* Detects bumping intersection of labels and offsets them
*/
function preventLabelOverlaps(mmsi) {
    forEachLayerGraphic(vesselLayer, clearGraphic, [mmsi]);
    forEachLayerGraphic(OOSvesselLayer, clearGraphic, [mmsi]);

    return AreaClear(graphicObject);
}

function AreaClear(obj) {
    graphicObjectIntersection = false;
    for (var l = 0; l < LabelPosition.length; l++) {
        var position = LabelPosition[l];
        var offset = LabelTarget(obj, position.location);

        //console.log(position.location);

        while (!graphicObjectIntersection) {
            // vessel layers
            forEachLayerGraphic(vesselLayer, detectIntersection, [obj, offset]);
            forEachLayerGraphic(OOSvesselLayer, detectIntersection, [obj, offset]);

            // label layers
            forEachLayerGraphic(vesselLabelLayer, detectIntersection, [obj, offset]);
            forEachLayerGraphic(OOSvesselLabelLayer, detectIntersection, [obj, offset]);

            break;
        }

        // exit loop because a clear spot was found
        if (!graphicObjectIntersection) break;
    }

    return offset;
}

function LabelTarget(obj, position) {
    var _x, _y;
    //in the esri api, an y axis down offset is negitive and an x axis left offset is negitive
    switch (position) {
        case "Below":
            _x = 0;
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2)) + 2) * -1;
            break;
        case "Above":
            _x = 0;
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2)) + 2);
            break;
        case "Left":
            _x = ((Math.round(obj.attributes.labelw / 2) + Math.round(obj.symbol.width / 2)) + 2) * -1;
            _y = 0;
            break;
        case "Right":
            _x = ((Math.round(obj.attributes.labelw / 2) + Math.round(obj.symbol.width / 2)) + 2);
            _y = 0;
            break;
        case "BelowLeft":
            _x = ((Math.round(obj.attributes.labelw / 2) + Math.round(obj.symbol.width / 2))) * -1;
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2))) * -1;
            break;
        case "BelowRight":
            _x = (Math.round(obj.attributes.labelw / 2) + Math.round(obj.symbol.width / 2));
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2))) * -1;
            break;
        case "AboveLeft":
            _x = ((Math.round(obj.attributes.labelw / 2) + Math.round(obj.symbol.width / 2))) * -1;
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2)));
            break;
        case "AboveRight":
            _x = ((Math.round(obj.attributes.labelw / 2) + Math.round(obj.symbol.width / 2)));
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2)));
            break;
        default: // same as "Below"
            _x = 0;
            _y = ((Math.round(obj.symbol.height / 2) + Math.round(obj.attributes.labelh / 2))) * -1;
            break;
    }
    var offset = { "x": _x, "y": _y };
    return offset;
}

var largeRect = null;
var smallRect = null;

function Intersection(obj1, obj2, offset) {
    var obj1Name = (obj1.attributes.name);
    var obj2Name = (obj2.attributes.name);

    //define width, height & xy offset for each object. obj1 is object being compared too, obj2 is label
    var who1 = { "w": obj1.symbol.width, "h": obj1.symbol.height, "x": obj1.symbol.xoffset, "y": obj1.symbol.yoffset };
    var who2 = { "w": obj2.attributes.labelw, "h": obj2.attributes.labelh, "x": offset.x, "y": offset.y };

    var objA = DefineGraphicAreaInPixels(obj1, who1);
    var objB = DefineGraphicAreaInPixels(obj2, who2);

    var area1 = objA.w * objA.h;
    var area2 = objB.w * objB.h;

    if (area1 > area2) {
        largeRect = { "obj": objA, "name": obj1Name };
        smallRect = { "obj": objB, "name": obj2Name };
    } else {
        largeRect = { "obj": objB, "name": obj2Name };
        smallRect = { "obj": objA, "name": obj1Name };
    }

    if ((largeRect.obj.bottom) <= smallRect.obj.top) return false;
    if ((largeRect.obj.top) >= smallRect.obj.bottom) return false;
    if ((largeRect.obj.right) <= smallRect.obj.left) return false;
    if ((largeRect.obj.left) >= smallRect.obj.right) return false;

    //console.log("Rect Pair OVERLAP");
    //console.log("L Item:    " + largeRect.name + "      top: " + largeRect.obj.top + " left: " + largeRect.obj.left + " bottom: " + largeRect.obj.bottom + " right: " + largeRect.obj.right);
    //console.log("S Item:    " + smallRect.name + "      top: " + smallRect.obj.top + " left: " + smallRect.obj.left + " bottom: " + smallRect.obj.bottom + " right: " + smallRect.obj.right);

    return true;
}

function DefineGraphicAreaInPixels(obj, who) {
    var w = who.w; var h = who.h;  //object width & height
    //object x y offset - in the esri api, the y axis down offset is negitive so I have to account for that.
    var xoffset = who.x;
    if (who.y < 0) {
        var yoffset = Math.abs(who.y);
    } else {
        var yoffset = who.y * -1;
    }
    var objx = (map.toScreen(obj.geometry).x + xoffset); var objy = (map.toScreen(obj.geometry).y + yoffset); //x y center of obj after offset
    var rtx = Math.round(objx + (w / 2)); var rty = Math.round(objy - (h / 2)); //top right x y of object in on screen pixels
    var lbx = Math.round(objx - (w / 2)); var lby = Math.round(objy + (h / 2)); //bottom left x y of object in on screen pixels

    var objAreaDefinition = { "bottom": lby, "left": lbx, "top": rty, "right": rtx, "w": w, "h": h };
    //console.log("Rect:    " + obj.attributes.name + "      top: " + rty + " left: " + lbx + " bottom: " + lby + " right: " + rtx);
    return objAreaDefinition;
}

//      All these vars are needed for AJAX JSON refreshing...instead of handling these 
//      things in C# code behind they need to happen on the client:
//      -timestamp above the map on right side of page
//      -list of vessels below the map on right side of page
//      -javascript IF statement based on global_veiw value (need to that to keep customers zoomed in to a specific vessel as it moves).

var ViewIfList = "";            // -javascript IF statement based on global_veiw - holds finished IF statement
var StaticIfListPrePend = "";   // -javascript IF statement based on global_veiw - holds geographic static portion of IF statment
var DynamicVesselIfList = "";   // -javascript IF statement based on global_veiw - holds vessel "elseif" values (dynamicly generated from JSON)
var StaticIfListPostPend = "";  // -javascript IF statement based on global_veiw - holds else value (defaulting to seattle view)

//	    This is for the if list that i'm dynamicly building. 
//	    in the cases where a customer is zoomed to a vessel and we do an AJAX JSON refresh, 
//	    the vessel would eventually move out of their view. if i re build this "if" 
//	    statement, it can be re run via eval() and i can then pan the map to the right location in
//      these cases so they will pan along and follow the vessel.

//geographic static portion of IF
var StaticIfListPrePend = ("if (view == 'sea') {lat = 47.565125; lon = -122.480508; zoom = 11; viewType=\"static\";} else if (view == 'eh') {lat = 47.620353; lon = -122.514347; zoom = 17; viewType=\"static\";} else if (view == 'sji') {lat = 48.557233; lon = -122.897078; zoom = 12; viewType=\"static\";} else if (view == 'seabi') {lat = 47.600325; lon = -122.437249; zoom = 12; viewType=\"static\";} else if (view == 'edking') {lat = 47.803096; lon = -122.438718; zoom = 12; viewType=\"static\";} else if (view == 'mukcl') {lat = 47.963857; lon = -122.327721; zoom = 13;  viewType=\"static\";} else if (view == 'ptdtal') { lat = 47.319040; lon = -122.510890; zoom = 13;  viewType=\"static\";} else if (view == 'anasjsid') { lat = 48.535868; lon = -123.013808; zoom = 10;  viewType=\"static\";} else if (view == 'ptkey') { lat = 48.135562; lon = -122.714449; zoom = 12;  viewType=\"static\";} else if (view == 'fvs') { lat = 47.513625; lon = -122.450820; zoom = 13;  viewType=\"static\";}");
//else value (defaulting to seattle view)
var StaticIfListPostPend = ("else {lat = 47.565125; lon = -122.480508; zoom = 11; viewType=\"static\";}"); //global_view = \"sea\";

var LastRefresh = null,
    VesselList = null,
    OOSVesselList = null,
    VesselLegendList = null,
    iconJSON = null,
    graphicLabel = null,
    precisionPoint = null;

function drawMap(responseObject, ioArgs) {
    //console.log("\n\n\n\n\n\n\n\n\n\n\n");
    //console.log("Begin getVessels Time: " + new Date().toTimeString());
    //console.log(responseObject.timestamp);
    //console.log("\n\n\n\n\n\n\n\n\n\n\n");

    // clear all graphics from the map layers (boats, labels, and crosshairs) because they need to be rebuilt with each vessel update.
    vesselLayer.clear();
    vesselLabelLayer.clear();
    precisionVesselLayer.clear();

    // clear all graphics from the map layers (OOS boats and labels) because they need to be rebuilt with each vessel update.
    OOSvesselLayer.clear();
    OOSvesselLabelLayer.clear();

    // clear vessel list, OOSvessel list, and if statment if they exists because they need to be rebuilt with each vessel update.
    dojo.empty("vesselListDiv");
    VesselList = dojo.byId("vesselListDiv");

    dojo.empty("OOSPanel");
    OOSVesselList = dojo.byId("OOSPanel");

    // set "last refresh" time stamp from JSON Object.
    dojo.empty("mapTimeStamp");
    LastRefresh = dojo.byId("mapTimeStamp");
    LastRefresh.innerHTML = ("Map Create Time: " + responseObject.timestamp);

    // set url based on envrionment - used to provide users custom bookmark.
    appurl = responseObject.appurl;

    dojo.empty("vesselLegendListDiv");
    VesselLegendList = dojo.byId("vesselLegendListDiv");

    var ListContents = "";

    for (var i = 0; i < responseObject.legenditemlist.length; i++) {
        var myLegendItem = responseObject.legenditemlist[i];

        var VesselLegendListItem = CreateLegendListDivContents(myLegendItem, null);
        ListContents = (ListContents + VesselLegendListItem);
    }
    VesselLegendList.innerHTML = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">" + ListContents + "</table>";
    ListContents = null;

    // cruise thru JSON Object vessellist
    DynamicVesselIfList = '';    
    for (var i = 0; i < responseObject.vessellist.length; i++) {
        // slap in to var
        var myVessel = responseObject.vessellist[i];

        // sets up boat icon for placement on map.
        iconJSON = { "icon": myVessel.icon, "h": myVessel.h, "w": myVessel.w, "xOffSet": myVessel.xOffSet, "yOffSet": myVessel.yOffSet };
        var graphic = CreateMapGraphic(myVessel, iconJSON);

        if (myVessel.inservice == "True") {
            // place boat icon on layer.
            vesselLayer.add(graphic);
        } else {
            // place OOS boat icon on layer.
            OOSvesselLayer.add(graphic);
        }

        // dynamic "if" statement values used for zooming into a vessel so they have to change as the vessel locations change.
        var DynamicVesselIfListItem = CreateVesselIfListItem(myVessel);
        DynamicVesselIfList = (DynamicVesselIfList + DynamicVesselIfListItem);
    }

    // cruise thru JSON Object vessellist
    for (var i = 0; i < responseObject.vessellist.length; i++) {
        //slap in to var
        var myVessel = responseObject.vessellist[i];

        // sets up boat label for placement on map.
        var offset = preventLabelOverlaps(myVessel.mmsi);
        iconJSON = { "icon": myVessel.label.icon, "h": myVessel.label.h, "w": myVessel.label.w, "xOffSet": offset.x, "yOffSet": offset.y }; //Math.round(myVessel.label.yOffSet)

        graphicLabel = CreateMapGraphic(myVessel, iconJSON);

        if (myVessel.inservice == "True") {
            // only need crosshairs for in service vessels
            // doing find and replace because we need to use the smaller mobile vessel icons in the dispay list.
            var iconPath = myVessel.icon.replace("boats", "boats/precision"); //get url to point to the right directory
            iconPath = (iconPath.substr(0, iconPath.lastIndexOf("/") + 1)); //chop off existing file name so we can append the right one just below.

            if (myVessel.headtxt != "Stopped") {
                iconJSON = { "icon": "" + iconPath + "crosshairs-underway.png", "h": 13, "w": 13, "xOffSet": 0, "yOffSet": 0 };
            } else {
                iconJSON = { "icon": "" + iconPath + "crosshairs.png", "h": 13, "w": 13, "xOffSet": 0, "yOffSet": 0 };
            }

            precisionPoint = CreateMapGraphic(myVessel, iconJSON);

            // place boat label on layer.
            vesselLabelLayer.add(graphicLabel);
            //place percision point crossharis on layer.
            precisionVesselLayer.add(precisionPoint);

            precisionPoint = null;
        } else {
            //place OOS boat label on layer.
            OOSvesselLabelLayer.add(graphicLabel);
        }

        graphicLabel = null;

        //add it to list that displays below the esri map.
        //list item
        var VesselListItem = CreateVesselListDivContents(myVessel);
        prev_mmsi = myVessel.mmsi;

        if (myVessel.inservice == "True") {
            VesselList.innerHTML += VesselListItem;
            passingObjects = null;
        } else {
            OOSVesselList.innerHTML += VesselListItem;
            passingObjects = null;
        }

        dojo.destroy(VesselListItem);
    }

    //assmeble final if statement.
    ViewIfList = StaticIfListPrePend + DynamicVesselIfList + StaticIfListPostPend;
    //alert("VESSEL IF List Available: " + ViewIfList);

    esriConfig.defaults.map.zoomDuration = 0;
    if (zoomToInitialMapView_bool == false) {
        //console.log('17: getCenter(' + global_view + '); pre call...');
        getCenter(global_view);
    }

    if (viewType == "dynamic" || zoomToInitialMapView_bool == false) {
        if (zoomToInitialMapView_bool == true) {
            //console.log('15: getCenter(' + global_view + '); pre call...');
            getCenter(global_view);
        }
        //console.log('18: "dyanamic" or "initial app start up" view being set up...');
        if (isNaN(ula) == false && isNaN(ulo) == false && isNaN(z) == false && ula.length > 0 && ulo.length > 0 && z.length > 0) {
            //console.log('19: lalo data present in url...');
            lon = ulo; lat = ula; zoom = z;
            //console.log('20: zoom value set by URL attribute: ' + zoom);
            latlon = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat, mySpatialReference));
        } else {
            //console.log('21: zoom value set by "if": ' + zoom);
            latlon = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat, mySpatialReference));
        }
        map.centerAndZoom(latlon, zoom);
    }

    //preventLabelOverlaps();
    myTiledMapServiceLayer.show();
    esriConfig.defaults.map.zoomDuration = 500;
    esriConfig.defaults.map.zoomRate = 50;
    esriConfig.defaults.map.panDuration = 500;
    esriConfig.defaults.map.panRate = 50;

    //console.log("\n\n\n\n\n\n\n\n\n\n\n");
    //console.log("End getVessels Time: " + new Date().toTimeString());
    //console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
}

/**
* called the very first time pages loads, then again every 15 seconds via setInterval(); located in the init(); function.
*/
function getVessels() {
    //console.log("getVessels()");
    dojo.xhrGet({
        url: "Vessels.ashx",
        preventCache: 1,
        handleAs: "json",
        error: function () { console.error('Error retrieving vessel data.'); },
        load: drawMap
    });
}

/**
* tiny but improtant function - "if" statement I built gets called here to set up user's view when they come into the app for the initial time - and if the view type is "dynamic" as in the case of the vessels, this gets called every 15 seconds after it's rebuild from the new JSON.
*/
function getCenter(view) {
    //console.log("getCenter()");
    //console.log('13: getCenter(' + view + '); called...');
    userclickedferry_bool = true;
    eval(ViewIfList);
}

/**
* links in the interface for the "VesselWatch Map Views" and "VesselTrack Views" call this.
*/
function goToCenterPointLocation(view) {
    //console.log("goToCenterPointLocation()");
    global_view = view;
    //console.log('16: getCenter(' + global_view + '); pre call...');
    getCenter(view);
    map.centerAndZoom(esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat, mySpatialReference)), zoom);
}

function init() {
    //console.log("init()");
    mySpatialReference = new esri.SpatialReference({ wkid: 4326 });
    myDefaultExtent = esri.geometry.geographicToWebMercator(new esri.geometry.Extent(-123.543898, 48.297977, -122.486464, 48.765405, mySpatialReference));
    map = new esri.Map("mapDiv", { extent: myDefaultExtent });

    // read and set the selected refresh index from the cookie if cookie is available
    var tempr = readCookie("RefreshIndex");
    var selObj = dojo.byId("ddlist_r");
    if (tempr && selObj) {
        r = tempr;
        selObj.options[r].selected = true;
    }
    else {
        // Defaults to 15 second refresh rate
        r = 6;
    }

    dojo.connect(map, "onLoad", function (map) {
        map.disableScrollWheelZoom();

        // create Layers for terminals, cams, vessels, etc...
        CreateMapLayers();

        // set layers are set to proper order on map here.
        SetMapLayerOrder();

        getVessels();
        getTerminals();
        getCameras();

        var layerRefreshListAsJSON = eval('(' + selObj.options[r].value + ')');
        for (var i = 0; i < layerRefreshListAsJSON.layerRefreshList.length; i++) {
            var item = layerRefreshListAsJSON.layerRefreshList[i];
            RefreshListIntervals.push(setInterval("" + eval("item.myFunction") + "()", item.myRefreshRate));
        }

        // mouse click hover events
        dojo.connect(ferryCamLayer, "onClick", MoveInfoWindow);
        dojo.connect(ferryCamLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(ferryCamLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(terminalLayer, "onClick", MoveInfoWindow);
        dojo.connect(terminalLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(terminalLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(vesselLayer, "onClick", MoveInfoWindow);
        dojo.connect(vesselLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(vesselLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(precisionVesselLayer, "onClick", MoveInfoWindow);
        dojo.connect(precisionVesselLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(precisionVesselLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(vesselLabelLayer, "onClick", MoveInfoWindow);
        dojo.connect(vesselLabelLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(vesselLabelLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(OOSvesselLayer, "onClick", MoveInfoWindow);
        dojo.connect(OOSvesselLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(OOSvesselLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(OOSvesselLabelLayer, "onClick", MoveInfoWindow);
        dojo.connect(OOSvesselLabelLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(OOSvesselLabelLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(terminalLayer, "onClick", MoveInfoWindow);
        dojo.connect(terminalLayer, "onMouseOver", function (evt) { map.setMapCursor("pointer") });
        dojo.connect(terminalLayer, "onMouseOut", function (evt) { map.setMapCursor("default") });

        dojo.connect(map.infoWindow, "onHide", HideInfoWindow);
        dojo.connect(map, "onClick", projectToWebMercator);

        // fires on the very first time the map loads, and the everytime the users pans or zooms.
        dojo.connect(map, "onExtentChange", showExtent);
        // fires after each map zoom level change.
        dojo.connect(map, "onZoomEnd", adjustTerminalsZoomEnd);

        // twiddle with map layers based on what is in URL on initial http request.
        InitialMapLayerSetup();
        ShowUserLink('layer');
    });

    myTiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
    myTiledMapServiceLayer.hide();
    map.addLayer(myTiledMapServiceLayer);
}

function adjustTerminalsZoomEnd(extent, zoomFactor, anchor, level) {
    RebuildTerminalLayer(level);
}

function HideInfoWindow() {
    selectedTerminalTab = 0;
}

function MoveInfoWindow(evt) {
    //console.log("MoveInfoWindow()");
    //sets the vessel id into this global so we can use it to keep the popup displayed after ajax refresh.
    if (evt.graphic.attributes.mmsi != null) {
        //If the graphic is a vessel note the vessel selected
        selectedVessel = evt.graphic.attributes.mmsi;
        selectedTerminal = 0;
        selectedCamera = 0;
    }
    else if (evt.graphic.attributes.TerminalID != null) {
        selectedVessel = 0;
        selectedTerminal = evt.graphic.attributes.TerminalID;
        selectedCamera = 0;
    }
    else if (evt.graphic.attributes.CameraID != null) {
        selectedVessel = 0;
        selectedTerminal = 0;
        selectedCamera = evt.graphic.attributes.CameraID;
    }

    if (evt.graphic.geometry.type == "point" && evt.graphic.infoTemplate != null) {
        map.infoWindow.coords = map.toScreen(evt.graphic.geometry);
        map.infoWindow.move(map.toScreen(evt.graphic.geometry));

        if (evt.graphic.attributes.TerminalID != null) {
            //Height needs to be taller to show cameras properly
            map.infoWindow.resize(240, 230);
        }
        else if (evt.graphic.attributes.CameraID != null) {
            map.infoWindow.resize(290, 240);
        }
        else if (evt.graphic.attributes.mmsi != null) {
            map.infoWindow.resize(290, 165);
        }
    }
}

// sets vars to hold users view, if they haven't panned or zoomed, then these vars will contain the extents from one of our predefined or zoom to vessel views.
// this makes it so subsequent AJAX calls to the JSON don't reset the map from where the user sets it.
function showExtent(ext) {
    //console.log("showExtent()");
    //console.log('14: showExtent() called...user panned, zoomed, or clicked a pre defined view link...');
    var center = esri.geometry.webMercatorToGeographic(ext.getCenter());

    userLon = Math.round(center.x * 1000000) / 1000000;
    userLat = Math.round(center.y * 1000000) / 1000000;
    userZ = map.getLevel();

    var pointA = new esri.geometry.Point(ext.xmin, ext.ymin, mySpatialReference);
    var pointB = new esri.geometry.Point(ext.xmax, ext.ymax, mySpatialReference);

    laMin = Math.round(esri.geometry.webMercatorToGeographic(pointA).x * 1000000) / 1000000;
    loMin = Math.round(esri.geometry.webMercatorToGeographic(pointA).y * 1000000) / 1000000;
    laMax = Math.round(esri.geometry.webMercatorToGeographic(pointB).x * 1000000) / 1000000;
    loMax = Math.round(esri.geometry.webMercatorToGeographic(pointB).y * 1000000) / 1000000;

    var upperLeft = { "id": 1, "lat": loMin, "lon": laMin };
    var lowerLeft = "";
    var upperRight = "";
    var lowerRight = { "id": 2, "lat": loMax, "lon": laMax };

    userXmin = ext.xmin;
    userYmin = ext.ymin;
    userXmax = ext.xmax;
    userYmax = ext.ymax;

    //adjust custom bookmark base on map view...
    ShowUserLink('view');
}

//build "view" config part of user's URL
function ViewLinkBuilder() {
    //console.log("ViewLinkBuilder()");
    userViewURLVars = "";
    //console.log('12: checking if user clicked one of the defined vessel or area views...');
    if (userclickedferry_bool) {
        global_view = global_view.replace(/\s/g, "");
        if (global_view.length != 0) {
            //console.log('1: set userViewURLVars to global_view value: ' + global_view + '...');
            userViewURLVars = ("view=" + global_view);
        } else {
            //console.log('2: set userViewURLVars to user lat lon...');
            userViewURLVars = ("ula=" + userLat + "&ulo=" + userLon);
            //console.log('3: clear URL vars ulo, ula, and z...');
            ulo = ""; ula = ""; z = "";
            //console.log('4: clearing zoom value...');
            zoom = "";
        }
        userclickedferry_bool = false;
    } else {
        //console.log('5: set userViewURLVars to user lat lon...');
        userViewURLVars = ("ula=" + userLat + "&ulo=" + userLon);
        //console.log('6: set viewType to static...');
        viewType = "static";
        //console.log('7: clearing zoom value...');
        zoom = "";
    }
    //console.log('11: checking if zoom != userZ...');
    if (zoom != userZ) {
        //console.log('8: zoom changed by user to: ' + userZ + '...');
        userViewURLVars = (userViewURLVars + "&z=" + userZ);
    }
    //console.log('10: checking if viewType is "static"...');
    if (viewType == "static") {
        //console.log('9: clearing static type global_view...');
        global_view = "";
    }
    zoomToInitialMapView_bool = true;
}

/**
* display user's custom link
*/
function ShowUserLink(caller) {
    //console.log("ShowUserLink()");
    if (caller == "view") {
        //build "view" config part of user's URL
        //adjust custom bookmark base on map view...only wan to call this one if the caller is because of a view change...
        ViewLinkBuilder();
    }
    if (caller == "layer") {
        //builds "layer" config part of user's URL    
        LayerLinkBuilder();
        var preURL = (appurl + "/?");
        var link = (preURL + userViewURLVars + layerViewURLVars);
    }

    dojo.empty("onExtentChangeInfo");
    dojo.byId("onExtentChangeInfo").innerHTML = ("<a href=default.aspx?" + userViewURLVars + layerViewURLVars + " style='text-decoration: none; color: #00705D;'><strong>Map Bookmark</strong> <img src='images/link.png'/> default.aspx?" + userViewURLVars + layerViewURLVars + "</a><br>");
    //be sure userViewURLVars is defined
    if (userViewURLVars) {
        var doMobileViewURL = userViewURLVars.indexOf("view");
        if (viewType == "static" && doMobileViewURL == 0) {
            dojo.byId("onExtentChangeInfo").innerHTML += "<a href='../mvw/?" + userViewURLVars + "&size=L' style='text-decoration: none; color: #00705D;'><strong>Mobile Map Link</strong> <img src='images/link.png'/> ../mvw/?" + userViewURLVars + "&size=L</a>";
        } else {
            dojo.byId("onExtentChangeInfo").innerHTML += "<a href='../mvw/?bbox=" + laMin + "," + loMin + "," + laMax + "," + loMax + "&size=L' style='text-decoration: none; color: #00705D;'><strong>Mobile Map Link</strong> <img src='images/link.png'/> ../mvw/?bbox=" + laMin + "," + loMin + "," + laMax + "," + loMax + "&size=L</a>";
        }
    }

}

/**
* builds out the html for the template Title and Contents - when you click a vessel on the map, this displays in the window that pops open.
*/
function CreateInfoTemplateJSON(MapMarkerAsJSON) {
    //console.log("CreateInfoTemplateJSON()");    
    var InfoTemplateContents = CreateInfoTemplateContents(MapMarkerAsJSON);
    var TitleName = MapMarkerAsJSON.name;
    //var TitleDate = (Left(MapMarkerAsJSON.datetime, 10)).replace(/\s/g, "");
    var TitleDate = MapMarkerAsJSON.datetime;
    var TitleIcon = MapMarkerAsJSON.label.icon;
    var InfoTemplateTitle = ("<div id='vslPopTitle' class='popTitle'><div>" + TitleDate + "</div>" + TitleName + " </div>"); //<img src='" + TitleIcon + "' border='0' />" + 

    var TemplateJSON = { "title": InfoTemplateTitle, "content": InfoTemplateContents };
    //console.log(TemplateJSON);
    return TemplateJSON;
}

function MoveAndUpdateInfoTemplate(MapMarkerAsJSON, graphic, TemplateJSON) {
    // if infoWindow was open...move it to new location, and update the contents.
    if (selectedVessel == MapMarkerAsJSON.mmsi) {
        //console.log("MoveAndUpdateInfoTemplate()");
        map.infoWindow.coords = map.toScreen(graphic.geometry);
        map.infoWindow.move(map.toScreen(graphic.geometry));

        map.infoWindow.setContent(TemplateJSON.content);
        map.infoWindow.setTitle(TemplateJSON.title);
    }
}

//creates a boats marker, 3 character vessel label marker, tiny percision corsshair marker.
function CreateMapGraphic(MapMarkerAsJSON, iconJSON) {
    //console.log("CreateMapGraphic()");
    var symbol = new esri.symbol.PictureMarkerSymbol(iconJSON.icon, iconJSON.w, iconJSON.h);

    // places vessels and labels with offset from actual lat lon location - if nessecary.
    symbol.setOffset(iconJSON.xOffSet, iconJSON.yOffSet);

    var TemplateJSON = CreateInfoTemplateJSON(MapMarkerAsJSON);
    var info = new esri.InfoTemplate(TemplateJSON);

    var point = new esri.geometry.Point(MapMarkerAsJSON.lon, MapMarkerAsJSON.lat, mySpatialReference);

    // set vesselID into an attribute. I set this value into a global "selectedVessel" var if the infoWindow is opened - which allows me to keep the infoWindow open upon AJAX refresh.
    var attribute = { "mmsi": MapMarkerAsJSON.mmsi, "name": MapMarkerAsJSON.name, "inservice": MapMarkerAsJSON.inservice, "label": MapMarkerAsJSON.label.icon, "labelw": MapMarkerAsJSON.label.w, "labelh": MapMarkerAsJSON.label.h };

    point = esri.geometry.geographicToWebMercator(point);

    var graphic = new esri.Graphic(point, symbol, attribute, info);
    MoveAndUpdateInfoTemplate(MapMarkerAsJSON, graphic, TemplateJSON);

    return graphic;
}

function CreateMapLayers() {
    //console.log("CreateMapLayers()");
    
    // VESSELS - vessels currently in service.
    vesselLayer = new esri.layers.GraphicsLayer();
    map.addLayer(vesselLayer);
    
    // VESSEL CROSSHAIRS - tiny crosshairs shows pin point location - handy for trouble shooting and verifying alignment of new vessel icons.
    precisionVesselLayer = new esri.layers.GraphicsLayer();
    map.addLayer(precisionVesselLayer);
    
    // VESSEL LABELS - 3 character labels for each vessel.
    vesselLabelLayer = new esri.layers.GraphicsLayer();
    map.addLayer(vesselLabelLayer);
    
    // OOS VESSELS - shows layup vessels for internal staff.
    OOSvesselLayer = new esri.layers.GraphicsLayer();
    map.addLayer(OOSvesselLayer);
    
    // OOS VESSEL LABELS - labels for vessels in layup.
    OOSvesselLabelLayer = new esri.layers.GraphicsLayer();
    map.addLayer(OOSvesselLabelLayer);
    
    // FERRY CAMS - not yet in use - will show WSF related traffic & terminal cams
    ferryCamLayer = new esri.layers.GraphicsLayer();
    map.addLayer(ferryCamLayer);
    
    // TERMINALS - not yet in use - will dipslay termianl locations & names.
    terminalLayer = new esri.layers.GraphicsLayer();
    map.addLayer(terminalLayer);
    
    // ORTHO PHOTO LAYER
    OrthoPhotoLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer");
    map.addLayer(OrthoPhotoLayer);
    OrthoPhotoLayer.setOpacity(0.50);
    
    // JULIE's LAYER
    juliesLayer = new esri.layers.GraphicsLayer();
    
    // ArcGISTiledMapServiceLayer("http://hqolymgis11t/ArcGIS/rest/services/CGIS/TESTVesselWatch/MapServer");
    map.addLayer(juliesLayer);
    juliesLayer.setOpacity(0.75);
    
    // WSDOT TRAFFIC FLOW LAYER
    flowLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://www.wsdot.wa.gov/ArcGIS/rest/services/TrafficSegments_2D/MapServer");
    flowLayer.setDisableClientCaching(true);
    map.addLayer(flowLayer);
    flowLayer.setOpacity(0.80);
}

/**
* all layers are set to proper order on map here.
*/
function SetMapLayerOrder() {
    //console.log("SetMapLayerOrder()");

    map.reorderLayer(terminalLayer, 1);
    map.reorderLayer(ferryCamLayer, 2);
    map.reorderLayer(juliesLayer, 3);
    map.reorderLayer(OrthoPhotoLayer, 4);

    map.reorderLayer(flowLayer, 5);
    map.reorderLayer(vesselLayer, 8);
    map.reorderLayer(precisionVesselLayer, 9);
    map.reorderLayer(vesselLabelLayer, 10);

    map.reorderLayer(OOSvesselLayer, 6);
    map.reorderLayer(OOSvesselLabelLayer, 7);

    ferryCamLayer.hide();
    precisionVesselLayer.hide();
    OOSvesselLayer.hide();
    OOSvesselLabelLayer.hide();
    OrthoPhotoLayer.hide();
    juliesLayer.hide();
    flowLayer.hide();
}

/**
* map layers are turned on/off here if the url value in the http request is dictates.
*/
function InitialMapLayerSetup() {
    //console.log("InitialMapLayerSetup()");    
    if (p == 1) { ToggleLayer({ "layerList": [{ "layer": "precisionVesselLayer"}] }, "ckbox_p", "p"); }
    if (v == 0) { ToggleLayer({ "layerList": [{ "layer": "vesselLayer"}] }, "ckbox_v", "v"); }
    if (l == 0) { ToggleLayer({ "layerList": [{ "layer": "vesselLabelLayer"}] }, "ckbox_l", "l"); }
    if (c == 1) { ToggleLayer({ "layerList": [{ "layer": "ferryCamLayer"}] }, "ckbox_c", "c"); }
    if (t == 0) { ToggleLayer({ "layerList": [{ "layer": "terminalLayer"}] }, "ckbox_t", "t"); }
    if (o == 1) { ToggleLayer({ "layerList": [{ "layer": "OrthoPhotoLayer"}] }, "ckbox_o", "o"); }
    if (f == 1) { ToggleLayer({ "layerList": [{ "layer": "flowLayer"}] }, "ckbox_f", "f"); }
    if (j == 1) { ToggleLayer({ "layerList": [{ "layer": "juliesLayer"}] }, "ckbox_j", "j"); }
    if (OOSv == 1) {
        ToggleLayer({ "layerList": [{ "layer": "OOSvesselLayer" }, { "layer": "OOSvesselLabelLayer"}] }, "ckbox_OOSv", "OOSv");
        ToggleElementDisplay("OOSvesselListTable");
    }
    if (r != 6) {
        ddList_SelectOption("ddlist_r", r);
        refreshChange(r);
    }
}

/**
* builds "layer" config part of the user's URL vars - also holds refresh rate.
*/
function LayerLinkBuilder() {
    //console.log("LayerLinkBuilder()");
    if (p == 1) { var p_urlvar = ("&p=" + p); } else { var p_urlvar = ""; } //crosshairs
    if (v == 0) { var v_urlvar = ("&v=" + v); } else { var v_urlvar = ""; } //vessels
    if (l == 0) { var l_urlvar = ("&l=" + l); } else { var l_urlvar = ""; } //labels
    if (c == 1) { var c_urlvar = ("&c=" + c); } else { var c_urlvar = ""; } //cameras
    if (t == 0) { var t_urlvar = ("&t=" + t); } else { var t_urlvar = ""; } //terminals
    if (o == 1) { var o_urlvar = ("&o=" + o); } else { var o_urlvar = ""; } //ortho photo
    if (f == 0) { var f_urlvar = ("&f=" + f); } else { var f_urlvar = ""; } //traffic flow layer
    if (j == 1) { var j_urlvar = ("&j=" + j); } else { var j_urlvar = ""; } //julie's work (routelines & terminals)
    if (OOSv == 1) { var OOSv_urlvar = ("&OOSv=" + OOSv); } else { var OOSv_urlvar = ""; } //vessels in layup
    if (r != 6) { var r_urlvar = ("&r=" + r); } else { var r_urlvar = ""; } //refresh rate
    layerViewURLVars = (p_urlvar + v_urlvar + l_urlvar + c_urlvar + t_urlvar + OOSv_urlvar + r_urlvar + o_urlvar + f_urlvar + j_urlvar);
}

/**
* map layers are toggled on or off here - by check boxes on the left nav, or when the page is loaded and the InitialMapLayerSetup function is called.
*/
function ToggleLayer(layerListAsJSON, ckbox, urlvar, updURLvars) {
    //console.log("ToggleLayer()");

    // pull value from the checkbox form element
    var ckboxValue = dojo.byId(ckbox).value;

    //console.log("ckbox: " + ckbox);
    //console.log("urlvar: " + urlvar);

    // loop thru layerList JSON - using JSON makes it so I can control many layers with one checkbox.
    for (var i = 0; i < layerListAsJSON.layerList.length; i++) {
        var myLayer = layerListAsJSON.layerList[i];
        myLayer.layer = eval(myLayer.layer);
        //console.log("layer: " + myLayer.layer);
        if (ckboxValue == 0) {
            //console.log("layer set to show");
            myLayer.layer.show();
        } else {
            //console.log("layer set to hide");
            myLayer.layer.hide();
        }
    }

    // update checkbox values in the left nav & url values to the opposite of what was submitted.
    if (ckboxValue == 0) {
        //console.log("check box set to 1");
        dojo.byId(ckbox).value = 1;
        dojo.byId(ckbox).checked = true;
        urlvar = 1;
    } else {
        //console.log("check box set to 0");
        dojo.byId(ckbox).value = 0;
        dojo.byId(ckbox).checked = false;
        urlvar = 0;
    }

    // adjust custom bookmark url vars base on layer adjustment. (I only do this when I call from a check box)
    if (updURLvars) ShowUserLink('layer');
}

/**
* called when the map's interval refresh rate is changed
*/
function refreshChange(index, updURLvars) {
    // garbage collection - no more mem leaks in IE
    dojo.query("imagedata").forEach(dojo.destroy);
    dojo.query("rect").forEach(dojo.destroy);

    var selObj = dojo.byId("ddlist_r");
    r = index; // update global value

    // creates a cookie to remember refresh settings for half a year
    createCookie("RefreshIndex", r, 180);

    for (var interval in RefreshListIntervals) clearInterval(interval);
    RefreshListIntervals = [];

    var layerRefreshListAsJSON = eval('(' + selObj.options[index].value + ')');
    for (var i = 0; i < layerRefreshListAsJSON.layerRefreshList.length; i++) {
        var item = layerRefreshListAsJSON.layerRefreshList[i];
        RefreshListIntervals.push(setInterval("" + eval("item.myFunction") + "()", item.myRefreshRate));
    }

    // if called from dropdown item, update url vars for bookmark and call getVessels to update screen
    if (updURLvars) {
        getVessels();
        getTerminals();
        getCameras();
        ShowUserLink('layer');
    }
}

function refreshVessels() {
    getVessels();
}
function refreshTerminals() {
    getTerminals();
}
function refreshCameras() {
    getCameras();
}
function refreshTraffic() {
    flowLayer.refresh();
}

// builds out the html for the template contents.
function CreateInfoTemplateContents(MapMarkerAsJSON) {
    // console.log("CreateInfoTemplateContents()");
    var nxtDep = MapMarkerAsJSON.nextdep;
    var actDep = MapMarkerAsJSON.leftdock;
    var leftdockAMPM = MapMarkerAsJSON.leftdockAMPM;
    var nextdepAMPM = MapMarkerAsJSON.nextdepAMPM;
    var addstyle = "";
    var eta = MapMarkerAsJSON.eta;

    if (eta.length > 0)
    { eta = eta + " *"; }

    if (actDep.length == 0)
    { actDep = "--:--"; }

    // if the vessel is at the dock, and there is no departure time, then it is probaly tied up for the night, or till the next service day, or in layup if it isn't in service.
    if (nxtDep.length < 1 && MapMarkerAsJSON.headtxt == "Stopped") {
        if (MapMarkerAsJSON.inservice == "True") nxtDep = "<i>docked</i>";
        else nxtDep = "<i>layup</i>";
    }

    if (nxtDep.length == 0) nxtDep = "--:--";

    if (it == 0) var addstyle = " style=\"display: none;\"";

    // adjust eta display
    if (eta == "Calculating") {
        if (MapMarkerAsJSON.headtxt == "Stopped") eta = "<em>At Dock</em> *";
        else eta = " <img src=\"../images/vesselwatch/calculatingiiii.gif\" style=\"top: 3px;\"> *";
    }

    // bold PM time values
    if (leftdockAMPM == "PM") actDep = "<strong>" + actDep + "</strong>";

    if (nextdepAMPM == "PM") nxtDep = "<strong>" + nxtDep + "</strong>";

    InfoTemplateContents = (
        "<div id='vslPopContainer'>" +
        "<div class='vslPopModRow'><div>" + MapMarkerAsJSON.route + "</div><b>Route:</b></div>" +
        "<div><table cellpadding='0' cellspacing='0' border='0' width='100%'><tr><td><b>Sched Depart:</b>&nbsp;" + nxtDep + "</td><td align='right'><b>Actual Depart&dagger;:</b>&nbsp;" + actDep + "<td></tr></table></div>" +
        "<div class='vslPopModRow'><div> " + eta + "</div><b>Est. Arrival:</b></div>" +
        "<div><div class='vslPopLat'" + addstyle + ">" + MapMarkerAsJSON.lat + " *</div><b>Latitude:</b></div>" +
        "<div class='vslPopModRow'><div class='vslPopLon'" + addstyle + ">" + MapMarkerAsJSON.lon + " *</div><b>Longitude:</b></div>" +
        "<div><div>" + MapMarkerAsJSON.head + "&deg; " + MapMarkerAsJSON.headtxt + "</div><b>Heading:</b></div>" +
        "<div class='vslPopModRow'><div>" + MapMarkerAsJSON.speed + " knots</div><b>Speed:</b></div>" +
        "<div><a href='VesselDetail.aspx?vessel_id=" + MapMarkerAsJSON.vesselID + "'>" + MapMarkerAsJSON.name + " Webpage</a></div>" +
        "</div>"
    );

    return InfoTemplateContents;
}

//builds out vessel list items that display below the map from JSON.
duplicateRowOccured = 0;
function CreateVesselListDivContents(VesselAsJSON) {
    //console.log("CreateVesselListDivContents()");
    //sweep out the spaces from vessel names for use in the url, and in the dynamicly generated javascript if statement.
    var vvesselName = VesselAsJSON.name.replace(/\s/g, "");
    //doing find and replace because we need to use the smaller mobile vessel icons in the dispay list.
    var viconPath = VesselAsJSON.icon.replace("boats", "boats/mobile");
    var faded = viconPath.indexOf("faded");
    var vroute = VesselAsJSON.route;
    if (VesselAsJSON.inservice == "False" && vroute == "") {
        var vroute = "Layup"
    } else if (vroute.length == 0) {
        var vroute = "N/A"
    }
    var vspeed = VesselAsJSON.speed;
    if (vspeed == 0) {
        var vspeed = ("0.0");
    }

    var viconPath = viconPath.replace("lightgreen1_", "lightgreen1_s_");
    //addstyle is only given a value for out of service vessels, it makes the vessel name links are gray.
    var vaddstyle = "";
    var vaddstyle2 = "";

    var vdatetime = VesselAsJSON.datetime;
    var vlastdock = VesselAsJSON.lastdock;
    var vlabelIcon = VesselAsJSON.label.icon;
    var vname = VesselAsJSON.name;
    var vpos = VesselAsJSON.pos;
    if (vpos.length == 0) {
        vpos = "&nbsp;";
    }
    //build out vessel list item - which ends up in either "vesselListDiv" or "OOSPanel" depending on its inservice value.

    var eta = VesselAsJSON.eta;
    var leftdock = VesselAsJSON.leftdock;
    var nextdep = VesselAsJSON.nextdep;
    var etaAMPM = VesselAsJSON.etaAMPM;
    var leftdockAMPM = VesselAsJSON.leftdockAMPM;
    var nextdepAMPM = VesselAsJSON.nextdepAMPM;
    var aterm = VesselAsJSON.aterm;
    var departDelayed = VesselAsJSON.departDelayed;

    var ATERMaddstyle = "";
    if (aterm == "Fetching...") {
        aterm = "<em>Fetching...</em>";
        ATERMaddstyle = "color: #9a9a9a;";
    }

    if (aterm == "") {
        aterm = "N/A";
    }
    if (nextdep == "") {
        nextdep = "N/A";
    }

    var ETAaddstyle = "";
    if (eta == "Calculating") {
        if (VesselAsJSON.headtxt == "Stopped") {
            eta = "<em>At Dock</em>";
            ETAaddstyle = "color: #9a9a9a;";
        } else {
            eta = " <img src=\"../images/vesselwatch/calculatingiiii.gif\" style=\"top: 3px;\">"
        }
    }

    //if eta value is empty in JSON feed - external customers see these values.
    if (eta == "") {
        if (VesselAsJSON.headtxt == "Stopped") {
            eta = "<em>At Dock</em>";
            ETAaddstyle = "color: #9a9a9a;";
        } else {
            eta = "<em>Underway</em>"
            ETAaddstyle = "color: #9a9a9a;";
        }
    }

    if (etaAMPM == "PM") {
        eta = "<strong>" + eta + "</strong>";
    }

    var DTaddstyle = "";
    if (leftdock == "") {
        leftdock = "--:--";
        DTaddstyle = "color: #9a9a9a;";
    }
    if (leftdockAMPM == "PM") {
        leftdock = "<strong>" + leftdock + "</strong>";
    }
    if (nextdepAMPM == "PM") {
        nextdep = "<strong>" + nextdep + "</strong>";
    }
    if (departDelayed == "Y") {
        var vaddstyle = "color: #d7054a;";
    }
    if (VesselAsJSON.old == 1) {
        var vaddstyle = "color: #9a9a9a;";
        var oldIcon = "images/frown.png";
        var vaddstyle2 = "padding-right:15px;background-image:url('" + oldIcon + "');background-repeat:no-repeat;background-position:right;";
    }
    if (VesselAsJSON.inservice == "False") {
        var rowType = "OOSvslLstRow";
    } else {
        var rowType = "INSvslLstRow";
    }

    if (prev_mmsi == VesselAsJSON.mmsi) {
        var VesselListItem = (
        "<div class=\"vslLstRow " + rowType + "\">" +
            "<div class=\"vslLstDate\">&nbsp;</div>" +
            "<div class=\"vslLstPos\">&nbsp;</div>" +
            "<div class=\"vslLstRoute\" style=\"text-transform:lowercase;" + vaddstyle + "\">" + vroute + "</div>" +
            "<div class=\"vslLstETA\">&nbsp;</div>" +
            "<div class=\"vslLstDepart\">&nbsp;</div>" +
            "<div class=\"vslLstSchedDepart\">&nbsp;</div>" +
            "<div class=\"vslLstAterm\">&nbsp;</div>" +
            "<div class=\"vslLstLastdock\">&nbsp;</div>" +
            "<div class=\"vslListVesselIcon\">&nbsp;</div>" +
            "<div class=\"vslLstSpeed\">&nbsp;</div>" +
            "<div class=\"vslLstLabel\">&nbsp;</div>" +
            "<div>&nbsp;</div>" +
        "</div>"
        );
    } else {
        var VesselListItem = (
        "<div class=\"vslLstRow " + rowType + "\">" +
            "<div class=\"vslLstDate\" style=\"" + vaddstyle + "\">" + vdatetime + "</div>" + //vdatetime 
            "<div class=\"vslLstPos\">" + vpos + "</div>" +
            "<div class=\"vslLstRoute\" style=\"text-transform:lowercase;" + vaddstyle + "\">" + vroute + "</div>" +
            "<div class=\"vslLstETA\" style=\"" + vaddstyle + ETAaddstyle + "\">" + eta + "</div>" +
            "<div class=\"vslLstDepart\" style=\"" + vaddstyle + DTaddstyle + "\">" + leftdock + "</div>" +
            "<div class=\"vslLstSchedDepart\" style=\"" + vaddstyle + "\">" + nextdep + "</div>" +
            "<div class=\"vslLstAterm\" style=\"" + vaddstyle + ATERMaddstyle + "\">" + aterm + "</div>" +
            "<div class=\"vslLstLastdock\" style=\"" + vaddstyle + "\">" + vlastdock + "</div>" +
            "<div class=\"vslListVesselIcon\" style=\"background-image:url('" + viconPath + "');\"></div>" +
            "<div class=\"vslLstSpeed\" style=\"" + vaddstyle + "\">" + vspeed + "</div>" +
            "<div class=\"vslLstLabel\"><a href=\"javascript:goToCenterPointLocation('" + vvesselName + "');\"><img class=\"vslLstLabelImg\" src=\"" + vlabelIcon + "\" border=\"0\" /></a></div>" +
            "<div style=\"\"><a href=\"javascript:goToCenterPointLocation('" + vvesselName + "');\" style=\"font-size: .9em;" + vaddstyle + vaddstyle2 + "\">" + vname + "</a></div>" +
        "</div>"
        );
    }

    return VesselListItem;
}

function CreateLegendListDivContents(LegendItemAsJSON, iconStyle) {
    //console.log("CreateLegendListDivContents()");

    var string = LegendItemAsJSON.string != null ? LegendItemAsJSON.string : LegendItemAsJSON.String;
    var icon = LegendItemAsJSON.icon != null ? LegendItemAsJSON.icon : LegendItemAsJSON.Icon;
    var description = LegendItemAsJSON.description != null ? LegendItemAsJSON.description : LegendItemAsJSON.Description;
    var iconStyle = iconStyle != null ? iconStyle : "";

    if (string == "") {
        VesselLegendListItem = (
        "<tr class=\"vslLegendRow\">" +
            "<td class=\"vslLegendIcon\" style=\"valign:top;" + iconStyle + "\" align=\"center\"><img src=\"" + icon + "\"></td>" +
            "<td class=\"vslLegendDesc\">" + description + "</td>" +
        "</tr>"
        );
    } else {
        VesselLegendListItem = (
        "<tr class=\"vslLegendRow\">" +
            "<td class=\"vslLegendString\" style=\"color:#494949; text-align:center; font-size:.9em;\"><b>" + string + "</b></td>" +
            "<td class=\"vslLegendDesc\">" + description + "</td>" +
        "</tr>"
        );
    }
    return VesselLegendListItem;
}

//builds out else if values for vessel locations from JSON
function CreateVesselIfListItem(VesselAsJSON) {
    //console.log("CreateVesselIfListItem()");
    var DynamicVesselIfListItem = "";
    var vesselNameFromJSON = VesselAsJSON.name
    var vesselName = vesselNameFromJSON.replace(/\s/g, "");
    DynamicVesselIfListItem = ("else if (view=='" + vesselName + "'){lat=" + VesselAsJSON.lat + "; lon=" + VesselAsJSON.lon + "; zoom=14; viewType=\"dynamic\";}");
    //console.log(DynamicVesselIfListItem);
    return DynamicVesselIfListItem;
}

dojo.addOnLoad(init);

//generic functions
function Left(str, n) {
    //console.log("Left()");
    if (n <= 0)
        return "";
    else if (n > String(str).length)
        return str;
    else
        return String(str).substring(0, n);
}

function ddList_SelectOption(select, index) {
    var selObj = dojo.byId(select);
    selObj.selectedIndex = index;
}

function ToggleElementDisplay(objID) {
    //console.log("ToggleElementDisplay()");
    var obj = document.getElementById(objID);
    if (obj.style.display == "none") {
        obj.style.display = "inline";
    } else {
        obj.style.display = "none";
    }
}

function ToggleHDView(objID) {
    //console.log("ToggleHDView()");
    var obj = document.getElementById(objID);
    //console.log(obj.style.width);
    //console.log(obj.style.height);
    obj.style.width = (document.documentElement.clientWidth - 2 + "px");
    obj.style.height = (document.documentElement.clientHeight - 2 + "px");
    //console.log(obj.style.width);
    //console.log(obj.style.height);
    //    if (obj.style.display == "none") {
    //        obj.style.display = "inline";
    //    } else {
    //        obj.style.display = "none";
    //    }
}

symbol = new esri.symbol.PictureMarkerSymbol('images/terminalicon16.png', 16, 16);
function projectToWebMercator(evt) {
    map.graphics.clear();
    var point = evt.mapPoint;
    var graphic = new esri.Graphic(point, symbol);
    var outSR = mySpatialReference;
    if (terminal_upd_id > 0) {
        map.graphics.add(graphic);

        var la = Math.round(esri.geometry.webMercatorToGeographic(point).y * 1000000) / 1000000;
        var lo = Math.round(esri.geometry.webMercatorToGeographic(point).x * 1000000) / 1000000;
        var zid = userZ;
        var tid = terminal_upd_id;
        var submit_button = "<input type='button' value='Update Database' onclick='updateTermDisplayLocation(" + la + "," + lo + "," + zid + "," + tid + ");' />";

        graphic.setInfoTemplate(new esri.InfoTemplate(terminal_upd_txt,
          "&nbsp;latitude: " + la +
          "<br/>&nbsp;longitude: " + lo +
          "<br/>&nbsp;zoom level: " + zid +
          "<br/>&nbsp;terminal id: " + tid +
          "<br/>" + submit_button +
          "<div id=\"term_update_status\" style=\"font-weight: bold; color:green; font-size:.9em;\"></div>"));
        map.infoWindow
          .setTitle(graphic.getTitle())
          .setContent(graphic.getContent())
          .show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
    }
}

function terminalToChange(obj, idx) {
    terminal_upd_id = obj.options[idx].value;
    terminal_upd_txt = obj.options[idx].text;
}

function updateTermDisplayLocation(la, lo, zid, tid) {

    var httpRequest = ("cartographyupdate.ashx?lat=" + la + "&lon=" + lo + "&tid=" + tid + "&zid=" + zid);

    dojo.xhrGet({
        url: httpRequest,
        preventCache: 1,
        handleAs: "json",
        error: function () { console.error('Error running cartography update.') },
        load: function (responseObject, ioArgs) {
            dojo.empty("term_update_status");
            var statusDiv = dojo.byId("term_update_status");
            statusDiv.innerHTML = ("&nbsp;" + responseObject.term_name + " update sucessful!");
        }
    });
}

