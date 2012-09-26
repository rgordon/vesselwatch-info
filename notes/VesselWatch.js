//this build is drasticly different, it builds out the page from the JSON with out any C#, which allows me to implement the 15 second AJAX refreshing.
dojo.require("esri.map");

var map, myTiledMapServiceLayer, mySpatialReference, userXmin, userYmin, userXmax, userYmax, selectedVessel = 0;


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
StaticIfListPrePend = ("if (view == 'sea') {lat = 47.565125; lon = -122.480508; zoom = 11;} else if (view == 'edking') {lat = 47.803096; lon = -122.438718; zoom = 12;} else if (view == 'mukcl') {lat = 47.963857; lon = -122.327721; zoom = 13; } else if (view == 'ptdtal') { lat = 47.319040; lon = -122.510890; zoom = 13; } else if (view == 'anasjsid') { lat = 48.535868; lon = -123.013808; zoom = 10; } else if (view == 'ptkey') { lat = 48.135562; lon = -122.714449; zoom = 12; } else if (view == 'fvs') { lat = 47.513625; lon = -122.450820; zoom = 13; }");
//else value (defaulting to seattle view)
StaticIfListPostPend = ("else {lat = 47.565125; lon = -122.480508; zoom = 11;}");

//calling this function the very first time pages loads, then again ever 15 seconds via setInterval(); located in the init(); function.
function getVessels() {
    dojo.xhrGet({
        url: "Vessels.aspx",
        preventCache: 1,
        handleAs: "json",
        error: function() { console.error('Error retrieving vessel data.'); },
        load: function(responseObject, ioArgs) {
            
            //clear boats, labels and any open infoWindows.
            map.graphics.clear();

            //set "last refresh" time stamp from JSON Object.
            var LastRefresh = dojo.byId("mapTimeStamp");
            LastRefresh.innerHTML = ("Last Refresh: " + responseObject.timestamp + "<br><div style='font-size:.8em;'>(vessel data comes every 15 seconds)</div>");

            //clear vessel list if it exists.
            var VesselList = dojo.byId("vesselListDiv");
            VesselList.innerHTML = "";
            DynamicVesselIfList = "";

            //cruise thru JSON Object vessellist
            for (var i = 0; i < responseObject.vessellist.length; i++) {
                //slap in to var
                var myVessel = responseObject.vessellist[i];
                //sets up boat icon or label for placement on map.
                var graphic = CreateMapGraphic(myVessel);
                //place boat icon or label on map.
                map.graphics.add(graphic);

                //add it to list that displays below the esri map, as well as to the "if" statment.
                //list item
                var VesselListItem = CreateVesselListDivContents(myVessel);
                VesselList.innerHTML = (VesselList.innerHTML + VesselListItem);
                //if statement value
                var DynamicVesselIfListItem = CreateVesselIfListItem(myVessel);
                DynamicVesselIfList = (DynamicVesselIfList + DynamicVesselIfListItem);
            }

            //cruise thru JSON Object vessellist
            for (var i = 0; i < responseObject.vessellist.length; i++) {
                //slap in to var
                var myLabel = responseObject.vessellist[i];
                //sets up boat icon or label for placement on map.
                var graphicLabel = CreateMapGraphicLabel(myLabel);
                //place boat icon or label on map.
                map.graphics.add(graphicLabel);
            }

            //assmeble final if statement.
            ViewIfList = StaticIfListPrePend + DynamicVesselIfList + StaticIfListPostPend;
            //alert("VESSEL IF List Available: " + ViewIfList);

            //if statement i built gets called here to set up user view if they are coming in to the app for the initial time.
            function getCenter(view) { eval(ViewIfList); }
            getCenter(global_view);
            //alert("IF List as Used: " + ViewIfList);

            //console.log("Check Point Hit...");

            esriConfig.defaults.map.zoomDuration = 0;
            // this if statement is the only way things will work, other combinations don't paint out the esri zoom control for some reason.
            // the inital loading of the app hits the 'else' statment which zooms and centers the map based on what values were set in the getCenter(); which uses the dynamicly created if.
            if (userXmin) {

            } else {
                //as soon as this else is it, user vars "userXmin" etc are set which allows us to not move the map away from the user's map view.
                map.centerAndZoom(esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat, mySpatialReference)), zoom);
            }
            myTiledMapServiceLayer.show();
            esriConfig.defaults.map.zoomDuration = 300;
        }
    });
}

function init() {

    mySpatialReference = new esri.SpatialReference({ wkid: 4326 });
    var initExtent = new esri.geometry.Extent(-125.231, 45.022, -116.536, 49.597, mySpatialReference);
    map = new esri.Map("mapDiv");

    dojo.connect(map, "onLoad", function(map) {
        getVessels();
        setInterval(getVessels, 15000);

        dojo.connect(map.graphics, "onClick", function(evt) {
            //sets the vessel id into this global so we can use it to keep the popup displayed after ajax refresh.
            selectedVessel = evt.graphic.attributes.mmsi;
            if (evt.graphic.geometry.type == "point") {
                map.infoWindow.coords = map.toScreen(evt.graphic.geometry);
                map.infoWindow.move(map.toScreen(evt.graphic.geometry));
            }
        });

        dojo.connect(map.graphics, "onMouseOver", function(evt) {
            map.setMapCursor("hand")
        });

        dojo.connect(map.graphics, "onMouseOut", function(evt) {
            map.setMapCursor("default")
        });

        //this fires on the very first time the map loads, and the everytime the users pans or zooms. 
        dojo.connect(map, "onExtentChange", showExtent);

    });

    myTiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
    myTiledMapServiceLayer.hide();
    map.addLayer(myTiledMapServiceLayer);
}

//sets vars to hold users view, if they haven't panned or zoomed, then these vars will contain the extents from one of our predefined or zoom to vessel views.
//this makes it so subsequent AJAX calls to the JSON don't reset the map from where the user sets it.
function showExtent(ext) {

    userXmin = ext.xmin;
    userYmin = ext.ymin;
    userXmax = ext.xmax;
    userYmax = ext.ymax;

    //display extents for testing....
    //dojo.byId("onExtentChangeInfo").innerHTML = "XMin: " + userXmin + " YMin: " + userYmin + " XMax: " + userXmax + " YMax: " + userYmax + "<br>";
}

//shell functions...need to dump these...
function initialize() { }
function GUnload() { }

//this add the boats to the map.
function CreateMapGraphic(MapMarkerAsJSON) {
    var symbol = new esri.symbol.PictureMarkerSymbol(MapMarkerAsJSON.icon, MapMarkerAsJSON.w, MapMarkerAsJSON.h);
    //placing vessels and labels requried offset from actual lat lon location.
    symbol.setOffset(MapMarkerAsJSON.xOffSet, MapMarkerAsJSON.yOffSet);

    //builds out the html for the template contents
    var InfoTemplateContents = CreateInfoTemplateContents(MapMarkerAsJSON);
    var TitleName = MapMarkerAsJSON.name;
    var TitleIcon = MapMarkerAsJSON.label.icon;
    var InfoTemplateTitle = ("<img style=\"z-index: 1; left: 0px; top: 3px; float: right; position: relative;\" src=\"" + TitleIcon + "\" border=\"0\" />" + TitleName);
  
    var info = new esri.InfoTemplate({ title: InfoTemplateTitle, content: InfoTemplateContents });
    
    var point = new esri.geometry.Point(MapMarkerAsJSON.lon, MapMarkerAsJSON.lat, mySpatialReference);
    //setting the vesselID into an attribute. i set this value into my global selectedVessel var if the infoWindow is opened - which allows me to keep the infoWindow open upon AJAX refresh.
    var attribute = { "mmsi": MapMarkerAsJSON.mmsi};

    point = esri.geometry.geographicToWebMercator(point);
    
    var graphic = new esri.Graphic(point, symbol, attribute, info);
    graphic.setSymbol(symbol);

    //if infoWindow was open...move it to new location, and update the contents.
    if (selectedVessel == MapMarkerAsJSON.mmsi) {        
        map.infoWindow.coords = map.toScreen(graphic.geometry);
        map.infoWindow.move(map.toScreen(graphic.geometry));
        map.infoWindow.setContent(InfoTemplateContents);
    }

    return graphic;
}

//this add the labels to the map.
function CreateMapGraphicLabel(MapMarkerAsJSON) {
    var symbol = new esri.symbol.PictureMarkerSymbol(MapMarkerAsJSON.label.icon, MapMarkerAsJSON.label.w, MapMarkerAsJSON.label.h);
    //placing vessels and labels requried offset from actual lat lon location.
    symbol.setOffset(MapMarkerAsJSON.label.xOffSet, MapMarkerAsJSON.label.yOffSet);

    var point = new esri.geometry.Point(MapMarkerAsJSON.lon, MapMarkerAsJSON.lat, mySpatialReference);
    //setting the vesselID into an attribute. i set this value into my global selectedVessel var if the infoWindow is opened - which allows me to keep the infoWindow open upon AJAX refresh.
    var attribute = { "mmsi": MapMarkerAsJSON.mmsi };

    point = esri.geometry.geographicToWebMercator(point);

    var graphicLabel = new esri.Graphic(point, symbol, attribute, null);
    graphicLabel.setSymbol(symbol);

    return graphicLabel;
}

//builds out the html for the template contents
function CreateInfoTemplateContents(MapMarkerAsJSON) {
    //background-image:url(images/wsf_logo_black.png); background-repeat:no-repeat; background-position: right bottom;'
    InfoTemplateContents = (
    "<div style='line-height:15px; font-size:.9em; padding:1px;'><div style='background-color:#EEEEEE;'><div style='margin-left: 1px; float: right;'>" + MapMarkerAsJSON.datetime +
    "</div><b>Datetime:</b></div><div><div style='margin-left: 1px; float: right;'>" + MapMarkerAsJSON.lat +
    "</div><b>Latitude:</b></div><div style='background-color:#EEEEEE;'><div style='margin-left: 1px; float: right;'>" + MapMarkerAsJSON.lon +
    "</div><b>Longitude:</b></div><div><div style='margin-left: 1px; float: right;'>" + MapMarkerAsJSON.head + "&deg; " + MapMarkerAsJSON.headtxt +
    "</div><b>Heading:</b></div><div style='background-color:#EEEEEE;'><div style='margin-left: 1px; float: right;'>" + MapMarkerAsJSON.speed +
    "</div><b>Speed:</b></div><div><div style='margin-left: 1px; float: right;'>" + MapMarkerAsJSON.nextdep +
    "</div><b>Next Departure:</b></div><div><a href='../your_wsf/our_fleet/index.cfm?vessel_id=" + MapMarkerAsJSON.vesselID + "' target='_blank'>" + MapMarkerAsJSON.name + " Webpage</a></div></div>"
    );
    return InfoTemplateContents;
}
//builds out vessel list items that display below the map from JSON.
function CreateVesselListDivContents(VesselAsJSON) {
    var VesselListItem = "";
    VesselListItem = ("<div style='margin-bottom: 3px; padding:0px; width:325px;'><div style='float:right;'>" + VesselAsJSON.datetime + "</div><div style='float:left; margin-right: 8px;'><a href='?view=" + VesselAsJSON.name + "'><img style='z-index: 1; left: 0px; top: 2px; position: relative;' src='" + VesselAsJSON.label.icon + "' border='0' /></a></div><div><a href='?view=" + VesselAsJSON.name + "'>" + VesselAsJSON.name + "</a></div></div>");
    return VesselListItem;
}
//builds out else if values for vessel locations from JSON
function CreateVesselIfListItem(VesselAsJSON) {
    var DynamicVesselIfListItem = "";
    DynamicVesselIfListItem = ("else if (view == '" + VesselAsJSON.name + "') { lat = " + VesselAsJSON.lat + ";   lon = " + VesselAsJSON.lon + ";     zoom = 14; }");
    return DynamicVesselIfListItem;
}

dojo.addOnLoad(init);