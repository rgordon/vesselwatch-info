dojo.require("dojo._base.html");

function getCameras() {
    dojo.xhrGet({
        url: "Cameras.ashx",
        preventCache: 1,
        handleAs: "json",
        error: function() { console.error('Error retrieving camera data.'); },
        load: function(responseObject, ioArgs) {
            var CameraLegendList = dojo.byId("CameraLegendListDiv");
            var ListContents = ""
            CameraLegendList.innerHTML = "";

            for (var i = 0; i < responseObject.LegendItemList.length; i++) {
                var myLegendItem = responseObject.LegendItemList[i];

                var CameraLegendListItem = CreateLegendListDivContents(myLegendItem, "background-position: 3px 3px;");
                ListContents = (ListContents + CameraLegendListItem);
            }
            CameraLegendList.innerHTML = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">" + ListContents + "</table>";

            //Clear the camera layer or we'll get duplicate graphic objects stacked up on top of each other
            ferryCamLayer.clear();

            //Iterate through terminals and create markers
            for (var count = 0; count < responseObject.FeedContentList.length; count++) {
                var currentTerminalID = responseObject.FeedContentList[count].TerminalID;
                var currentCamera = responseObject.FeedContentList[count].FerryCamera;

                //Set up camera icon
                var iconJSON = { "icon": responseObject.LegendItemList[0].Icon, "h": 16, "w": 16, "xOffSet": 0, "yOffSet": 0 };
                var graphic = CreateMapGraphicCam(currentCamera, currentTerminalID, iconJSON);
                ferryCamLayer.add(graphic);
            }
        }
    });
}

//creates camera markers
function CreateMapGraphicCam(MapMarkerAsJSON, currentTerminalID, iconJSON) {
    //places vessels and labels with offset from actual lat lon location - if nessecary.                
    var symbol = new esri.symbol.PictureMarkerSymbol(iconJSON.icon, iconJSON.w, iconJSON.h);
    symbol.setOffset(iconJSON.xOffSet, iconJSON.yOffSet);

    //Popup content
    var TemplateJSON = CreateInfoTemplateJSONCam(MapMarkerAsJSON, currentTerminalID);
    var info = new esri.InfoTemplate(TemplateJSON);

    //Point location
    var point = new esri.geometry.Point(MapMarkerAsJSON.Lon, MapMarkerAsJSON.Lat, mySpatialReference);
    point = esri.geometry.geographicToWebMercator(point);

    //set CameraID into an attribute. I set this value into a global "selectedCamera" var if the infoWindow is opened - which allows me to keep the infoWindow open upon AJAX refresh.
    var attribute = { "CameraID": MapMarkerAsJSON.CamID, "CameraTitle": MapMarkerAsJSON.Title };

    var graphic = new esri.Graphic(point, symbol, attribute, info);

    MoveAndUpdateInfoTemplateCam(MapMarkerAsJSON, graphic, TemplateJSON);

    return graphic;
}

function MoveAndUpdateInfoTemplateCam(MapMarkerAsJSON, graphic, TemplateJSON) {
    if (selectedCamera == MapMarkerAsJSON.CameraID) {
        map.infoWindow.coords = map.toScreen(graphic.geometry);
        map.infoWindow.move(map.toScreen(graphic.geometry));
        map.infoWindow.setContent(TemplateJSON.content);
        map.infoWindow.setTitle(TemplateJSON.title);
    }
}

//builds out the html for the template Title and Contents - when you click a camera on the map, this displays in the window that pops open.
function CreateInfoTemplateJSONCam(MapMarkerAsJSON, currentTerminalID) {
    var InfoTemplateContents = CreateInfoTemplateContentsCam(MapMarkerAsJSON, currentTerminalID);
    var TitleName = MapMarkerAsJSON.Title;
    var courtesyText = "";
    if ((MapMarkerAsJSON.CamOwner != "") && (MapMarkerAsJSON.CamOwner != null) && (MapMarkerAsJSON.OwnerURL != "") && (MapMarkerAsJSON.OwnerURL != null)) {
        courtesyText = " (<a href='" + MapMarkerAsJSON.OwnerURL + "' target='_blank'>" + MapMarkerAsJSON.CamOwner + "</a>)";
    }    
    var InfoTemplateTitle = ("<div id='camPopTitle' class='popTitle'>" + TitleName + courtesyText + "</div>");
    var TemplateJSON = { "title": InfoTemplateTitle, "content": InfoTemplateContents };
    return TemplateJSON;
}

//builds out the html for the popup camera content
function CreateInfoTemplateContentsCam(MapMarkerAsJSON, currentTerminalID) {
    var courtesyImg = "";
    var InfoTemplateContents = "";
    if ((MapMarkerAsJSON.CamOwner != "") && (MapMarkerAsJSON.CamOwner != null) && (MapMarkerAsJSON.OwnerURL != "") && (MapMarkerAsJSON.OwnerURL != null)) {
        InfoTemplateContents = "<div id='camPopContainer'><a href='" + MapMarkerAsJSON.OwnerURL + "' target='_blank'><img style='border: 1px solid #787878; width: 270px;' alt='" + MapMarkerAsJSON.Title + "' src='" + MapMarkerAsJSON.ImgURL + "?" + new Date().getTime() + "' /></a></div>";
    }
    else {
        InfoTemplateContents = "<div id='camPopContainer'><a href='./TerminalDetail.aspx?terminalid=" + currentTerminalID + "#cam" + MapMarkerAsJSON.CamID + "'><img style='border: 1px solid #787878;' src='" + MapMarkerAsJSON.ImgURL + "?" + new Date().getTime() + "' width='270' /></a></div>";
    }
    return InfoTemplateContents;
}