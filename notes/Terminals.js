dojo.require("dojo._base.html");

function getTerminals() {
    dojo.xhrGet({
        url: "Terminals.ashx",
        preventCache: 1,
        handleAs: "json",
        error: function() { console.error('Error retrieving terminal data.'); },
        load: function (responseObject, ioArgs) {
            dojo.empty("TerminalLegendListDiv");
            var TerminalLegendList = dojo.byId("TerminalLegendListDiv");
            var term_ddlist = dojo.byId("ddlist_terminalAdmin"); 
            var ListContents = "";
            
            for (var i = 0; i < responseObject.LegendItemList.length; i++) {
                var myLegendItem = responseObject.LegendItemList[i];

                var TerminalLegendListItem = CreateLegendListDivContents(myLegendItem, "background-position:3px 1px;");
                ListContents = (ListContents + TerminalLegendListItem);
            }
            TerminalLegendList.innerHTML = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">" + ListContents + "</table>";

            if (term_ddlist != null) {
                //clear dropdown options values because they are being added below...  
                removeAllOptions(term_ddlist);
                addOption(term_ddlist, "For a Terminal...", "0");
                for (var count = 0; count < responseObject.FeedContentList.length; count++) {
                    //add dropdown option values to admin tool for updating terminal cartography...
                    addOption(term_ddlist, responseObject.FeedContentList[count].Terminal.TerminalName, responseObject.FeedContentList[count].Terminal.TerminalID);
                }
            }

            currentTerminalsJson = responseObject.FeedContentList;
            currentTerminalsIcon = responseObject.LegendItemList[0].Icon;
            //Wait until the zoom levels are completely loaded (in getVessels) before plotting the terminals
            setTimeout("RebuildTerminalLayer(map.getLevel())", 500);
        }
    });
}

/**
 * terminals are rebuild when ajax call is made or when user zooms in
 */
function RebuildTerminalLayer(zoomLevel) {
    // clear the terminal layer or we'll get duplicate graphic objects stacked up on top of each other
    terminalLayer.clear();

    // set up terminal icon
    var iconJSON = { "icon": currentTerminalsIcon, "h": 16, "w": 16, "xOffSet": 0, "yOffSet": 0 };

    if ((currentTerminalsJson != null) && (currentTerminalsIcon != null)) {
        // iterate through terminals and create markers
        for (var count = 0; count < currentTerminalsJson.length; count++) {
            var currentTerminal = currentTerminalsJson[count].Terminal;
            var currentCamsForTerminal = currentTerminalsJson[count].FerryCameras;

            var graphic = CreateMapGraphicTerm(currentTerminal, currentCamsForTerminal, iconJSON, zoomLevel);
            terminalLayer.add(graphic);
        }
    }
}

/**
 * creates terminal markers
 */
function CreateMapGraphicTerm(MapMarkerAsJSON, CamArrayAsJSON, iconJSON, zoomLevel) {
    // places vessels and labels with offset from actual lat lon location - if nessecary.                
    var symbol = new esri.symbol.PictureMarkerSymbol(iconJSON.icon, iconJSON.w, iconJSON.h);
    symbol.setOffset(iconJSON.xOffSet, iconJSON.yOffSet);

    // popup content
    var TemplateJSON = CreateInfoTemplateJSONTerm(MapMarkerAsJSON, CamArrayAsJSON);
    var info = new esri.InfoTemplate(TemplateJSON);

    // point location
    var point = null;

    // attempt to find a customized lat long for the given zoom level
    for (var loccount = 0; loccount < MapMarkerAsJSON.GISZoomLocations.length; loccount++) {
        var zoomloc = MapMarkerAsJSON.GISZoomLocations[loccount];
        if (zoomloc.Zm == zoomLevel) point = new esri.geometry.Point(zoomloc.Lon, zoomloc.Lat, mySpatialReference);
    }

    // if no custom lat long for the given zoom level is found, use default values
    if (point == null) point = new esri.geometry.Point(MapMarkerAsJSON.Longitude, MapMarkerAsJSON.Latitude, mySpatialReference);
    point = esri.geometry.geographicToWebMercator(point);

    // set TerminalID into an attribute. I set this value into a global "selectedTerminal" var if the infoWindow is opened - which allows me to keep the infoWindow open upon AJAX refresh.
    var attribute = { "TerminalID": MapMarkerAsJSON.TerminalID, "TerminalName": MapMarkerAsJSON.TerminalName };

    var graphic = new esri.Graphic(point, symbol, attribute, info);
    
    MoveAndUpdateInfoTemplateTerm(MapMarkerAsJSON, CamArrayAsJSON, graphic, TemplateJSON);

    return graphic;
}

function MoveAndUpdateInfoTemplateTerm(MapMarkerAsJSON, CamArrayAsJSON, graphic, TemplateJSON) {
    if (selectedTerminal == MapMarkerAsJSON.TerminalID) {
        map.infoWindow.coords = map.toScreen(graphic.geometry);
        map.infoWindow.move(map.toScreen(graphic.geometry));                
        map.infoWindow.setContent(TemplateJSON.content);
        map.infoWindow.setTitle(TemplateJSON.title);

        if (selectedTerminalTab == 1) {
            //Wait times - not the default
            var waittimelinkid = "waittimelink" + MapMarkerAsJSON.TerminalID;
            InfoLinkClickedTerm(waittimelinkid, MapMarkerAsJSON.TerminalID);
        }
    }
}

/**
 * builds out the html for the template Title and Contents - when you click a vessel on the map, this displays in the window that pops open.
 */
function CreateInfoTemplateJSONTerm(MapMarkerAsJSON, CamArrayAsJSON) {
    var InfoTemplateContents = CreateInfoTemplateContentsTerm(MapMarkerAsJSON, CamArrayAsJSON);
    var TitleName = MapMarkerAsJSON.TerminalName;
    var InfoTemplateTitle = ("<div id='termPopTitle' class='popTitle'>" + TitleName + "</div>");
    var TemplateJSON = { "title": InfoTemplateTitle, "content": InfoTemplateContents };
    return TemplateJSON;
}

function InfoLinkClickedTerm(linkid, terminalid) {
    // called when the "Cameras" or "Wait Time" links are clicked in the info window popup
    var camlink = 'camlink' + terminalid.toString();
    var camlayer = 'camlayer' + terminalid.toString();
    var waittimelink = 'waittimelink' + terminalid.toString();
    var waittimelayer = 'waittimelayer' + terminalid.toString();
    
    if ((dojo.byId(camlink) != null) && (dojo.byId(camlayer) != null) && (dojo.byId(waittimelink) != null) && (dojo.byId(waittimelayer) != null)) {
        if (linkid == 'camlink' + terminalid.toString()) {
            // the cam link was clicked
            dojo.removeClass(camlink, 'infolink');
            dojo.addClass(camlink, 'infolinkactive');
            dojo.removeClass(camlayer, 'infolayer');
            dojo.addClass(camlayer, 'infolayeractive');
            dojo.removeClass(waittimelink, 'infolinkactive');
            dojo.addClass(waittimelink, 'infolink');
            dojo.removeClass(waittimelayer, 'infolayeractive');
            dojo.addClass(waittimelayer, 'infolayer');
            selectedTerminalTab = 0;                        
        } else {
            // the wait time link was clicked
            dojo.removeClass(camlink, 'infolinkactive');
            dojo.addClass(camlink, 'infolink');
            dojo.removeClass(camlayer, 'infolayeractive');
            dojo.addClass(camlayer, 'infolayer');
            dojo.removeClass(waittimelink, 'infolink');
            dojo.addClass(waittimelink, 'infolinkactive');
            dojo.removeClass(waittimelayer, 'infolayer');
            dojo.addClass(waittimelayer, 'infolayeractive');
            selectedTerminalTab = 1;                        
        }
    }
}

/**
 * builds out the html for the popup terminal content
 */
function CreateInfoTemplateContentsTerm(MapMarkerAsJSON, CamArrayAsJSON) {
    InfoTemplateContents = "<div id='termPopContainer'>";
    var waittimelinkclass = 'infolinkactive';
    var waittimelayerclass = 'infolayeractive';

    if ((CamArrayAsJSON != null) && (CamArrayAsJSON.length > 0)) {
        waittimelinkclass = 'infolink';
        waittimelayerclass = 'infolayer';
        InfoTemplateContents += "<a onclick='return InfoLinkClickedTerm(this.id, " + MapMarkerAsJSON.TerminalID.toString() + ");' id='camlink" + MapMarkerAsJSON.TerminalID.toString() + "' class='infolinkactive'>Cameras</a> | ";
    }

    if ((MapMarkerAsJSON.WaitTimes != null) && (MapMarkerAsJSON.WaitTimes.length > 0))
        InfoTemplateContents += "<a onclick='return InfoLinkClickedTerm(this.id, " + MapMarkerAsJSON.TerminalID.toString() + ");' id='waittimelink" + MapMarkerAsJSON.TerminalID.toString() + "' class='" + waittimelinkclass + "'>Wait Time</a> | ";

    InfoTemplateContents += "<a class='infolink' href='./TerminalDetail.aspx?terminalid=" + MapMarkerAsJSON.TerminalID + "'>More &raquo;</a>";
    InfoTemplateContents += "<br /><br />";

    if ((CamArrayAsJSON != null) && (CamArrayAsJSON.length > 0)) {
        InfoTemplateContents += "<div id='camlayer" + MapMarkerAsJSON.TerminalID.toString() + "' class='infolayeractive'>";
        // iterate through and show cams for each terminal in the popup
        for (var count = 0; count < CamArrayAsJSON.length; count++) {
            var currentCam = CamArrayAsJSON[count];
                              
            if (count > 0)
                InfoTemplateContents += "<br /><br />";
            if ((currentCam.CamOwner != "") && (currentCam.CamOwner != null) && (currentCam.OwnerURL != "") && (currentCam.OwnerURL != null))
                InfoTemplateContents += "<strong>" + currentCam.Title + " (<a href='" + currentCam.OwnerURL + "' target='_blank'>" + currentCam.CamOwner + "</a>)</strong><a href='" + currentCam.OwnerURL + "' target='_blank'><img width='200' style='border: 1px solid #787878;' alt='" + currentCam.Title + "' src='" + currentCam.ImgURL + "' /></a>";
            else
                InfoTemplateContents += "<strong>" + currentCam.Title + "</strong>" +
                                "<a href='./TerminalDetail.aspx?terminalid=" + MapMarkerAsJSON.TerminalID + "#cam" + currentCam.CamID + "'><img style='border: 1px solid #787878;' src='" + currentCam.ImgURL + "?" + new Date().getTime() + "' width='200' /></a>";
        }
        InfoTemplateContents += "</div>";
    }

    // add wait time info and a link for more info
    if ((MapMarkerAsJSON.WaitTimes != null) && (MapMarkerAsJSON.WaitTimes.length > 0)) {
        InfoTemplateContents += "<div id='waittimelayer" + MapMarkerAsJSON.TerminalID.toString() + "' class='" + waittimelayerclass + "'>";
        for (var waitcount = 0; waitcount < MapMarkerAsJSON.WaitTimes.length; waitcount++) {
            if (waitcount > 0) InfoTemplateContents += "<br /><br />";

            var waititem = MapMarkerAsJSON.WaitTimes[waitcount];
            if ((waititem.RouteName != null) && (waititem.RouteName != '')) InfoTemplateContents += "<strong>" + waititem.RouteName + "</strong> - ";

            InfoTemplateContents += StripHtml(waititem.WaitTimeNotes);
            if ((waititem.WaitTimeLastUpdated != null) && (waititem.WaitTimeLastUpdated != '')) InfoTemplateContents += "<br />[Last Updated: " + wsfFormatDate(waititem.WaitTimeLastUpdated) + "]";
        }
        InfoTemplateContents += "</div>";
    }
    InfoTemplateContents += "</div>";
    return InfoTemplateContents;
}