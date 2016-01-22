
var lat=52.2910937;
var lon=5.606251;
var zoom=15;

var map; //complex object of type OpenLayers.Map

var style = {
	fillColor: '#000',
	fillOpacity: 0.1,
	strokeWidth: 0
}; 
//Initialise the 'map' object

function init(watch, vlon, vlat) {
	
	if (window.localStorage["useOfflineMaps"]=="true"){

		if (window.localStorage["versionCodeMaps"]){
			alert(window.localStorage["versionCodeMaps"]);
			 $.ajax({
			        url: 'http://brandweer.showittome.nl/php/checkMapsVersion.php',
			        type: 'get',
			        async: false,
			        success: function(data) {
				        alert(data);
		                if (window.localStorage["versionCodeMaps"] < data){
			             	$(".downloadMaps").show();
		                }
			        }
			});	
		}else{
			$(".downloadMaps").show();
		}
	}
	
	//alert(window.localStorage["capCodes"]);
	var toSplit = window.localStorage["capCodes"];
	var capSplit = toSplit.split(",");
	//alert(capSplit.length);
	for(i=0; i<capSplit.length; i+=1)
	{
		if(capSplit[i] != "")
		{
			//alert(i + '>>' + capSplit[i]);
			var field = '#' + capSplit[i];
			//alert(field);
			$(field).prop('checked', true);
		}	
	}
	
		if(window.localStorage["useOfflineMaps"] == "true"){
			 $(".cbOfflineMaps").prop('checked', true);
		}
	
	updateIncident();
	
	OpenLayers.Util.onImageLoadError = function(){
		 this.src = "noImage.png";
	};
	map = new OpenLayers.Map ("map", {
		controls:[
			new OpenLayers.Control.Navigation(),
			//new OpenLayers.Control.PanZoomBar(),
			//new OpenLayers.Control.Permalink(),
			//new OpenLayers.Control.ScaleLine({geodesic: true}),
			//new OpenLayers.Control.Permalink('permalink')
			//new OpenLayers.Control.MousePosition(),                    
			//new OpenLayers.Control.Attribution()
			],
		//maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
		maxResolution: 156543.0339,
		numZoomLevels: 19,
		units: 'm',
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		
	} );
	

	//var newLayer = new OpenLayers.Layer.OSM("Local Tiles", "tiles/${z}/${x}/${y}.png", {numZoomLevels: 19, alpha: true, isBaseLayer: true});
	var newLayer = new OpenLayers.Layer.OSM();
	map.addLayer(newLayer);
	
	var inciSet = "nee";
	if((vlon != '0') && (vlat != '0'))
	{
		inciSet = "ja";
		//alert("GO TO INCIDENT >>  " + vlon + " <> " + vlat);
		vlon = parseFloat(vlon);
		vlat = parseFloat(vlat);
		var vlonLat = new OpenLayers.LonLat(vlon, vlat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
		map.setCenter (vlonLat, zoom);
	}
	if( ! map.getCenter() ){
		//alert("toch nog hier" + lon + "," +  lat);
		var lonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
		map.setCenter (lonLat, zoom);
	}
	

	epsg4326 =  new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
	projectTo = map.getProjectionObject(); //The map projection (Spherical Mercator)
	var vectorLayer = new OpenLayers.Layer.Vector("Overlay");
	var vectorLayerMarkers = new OpenLayers.Layer.Vector("Overlay");
	
	
	// Define an array. This could be done in a seperate js file.
	// This tidy formatted section could even be generated by a server-side script (jsonp)
	var markers;
	
	 $.ajax({
	        url: 'json/markers.json',
	        type: 'get',
	        async: false,
	        success: function(html) {
	                markers = html;
	        }
	});

	//Loop through the markers array
	for (var i=0; i<markers.length; i++) {
	  console.log(i);
	  
	   var lonX = markers[i][2];
	   var latX = markers[i][1];
	   var iconType = markers[i][3];
	   var descriptionMarker;
	   
		if (iconType==4){
			descriptionMarker = '<img src="images/putten/' + markers[i][0] + '.JPG" style="width:100%">';
			
			var feature = new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point( lonX, latX ).transform(epsg4326, projectTo),
					{description: descriptionMarker} ,
					{externalGraphic: 'images/markers/marker_' + iconType + '.png', graphicHeight: 16, graphicWidth: 16, graphicXOffset:-8, graphicYOffset:-8  }
				);    
				
			vectorLayerMarkers.addFeatures(feature);
		}else{
		   descriptionMarker = "marker number " + markers[i][0];
		   
			var feature = new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point( lonX, latX ).transform(epsg4326, projectTo),
					{description: descriptionMarker} ,
					{externalGraphic: 'images/markers/marker_' + iconType + '.png', graphicHeight: 16, graphicWidth: 16, graphicXOffset:-8, graphicYOffset:-8  }
				);    
				
			vectorLayer.addFeatures(feature);
		}
	}             
	
	map.addLayer(vectorLayer);
	map.addLayer(vectorLayerMarkers);
	

	var controls = {
      selector: new OpenLayers.Control.SelectFeature(vectorLayerMarkers, { onSelect: createPopup, onUnselect: destroyPopup })
    };

    function createPopup(feature) {
	    
	  if(feature.attributes.description.search("src") > 0)
	  {
		  feature.popup = new OpenLayers.Popup.FramedCloud("pop",
			  feature.geometry.getBounds().getCenterLonLat(),
			  null,
			  '<div class="markerContent">'+feature.attributes.description+'</div>',
			  null,
			  true,
			  function() { controls['selector'].unselectAll(); }
		  );
		  //feature.popup.closeOnMove = true;
		  map.addPopup(feature.popup);
	  }
    }

    function destroyPopup(feature) {
      feature.popup.destroy();
      feature.popup = null;
    }
    
    map.addControl(controls['selector']);
    controls['selector'].activate();
	
	/* INCI MARKER */

	var feature = new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point( window.localStorage["pLng"], window.localStorage["pLat"] ).transform(epsg4326, projectTo),
			{description: "inci marker"} ,
			{externalGraphic: 'images/markers/marker_inci.png', graphicHeight: 32, graphicWidth: 32, graphicXOffset:-16, graphicYOffset:-16  }
		);             
	vectorLayer.addFeatures(feature);
	map.addLayer(vectorLayer);
	
	
	
		//GEO LOCATION
		var vector = new OpenLayers.Layer.Vector('vector');
		map.addLayer(vector);
		
		
		var pulsate = function(feature) {
			var point = feature.geometry.getCentroid(),
				bounds = feature.geometry.getBounds(),
				radius = Math.abs((bounds.right - bounds.left)/2),
				count = 0,
				grow = 'up';

			var resize = function(){
				if (count>16) {
					clearInterval(window.resizeInterval);
				}
				var interval = radius * 0.03;
				var ratio = interval/radius;
				switch(count) {
					case 4:
					case 12:
						grow = 'down'; break;
					case 8:
						grow = 'up'; break;
				}
				if (grow!=='up') {
					ratio = - Math.abs(ratio);
				}
				feature.geometry.resize(1+ratio, point);
				vector.drawFeature(feature);
				count++;
			};
			window.resizeInterval = window.setInterval(resize, 50, point, radius);
		};

		
		
		

			//alert("geo");
			var BindVar = false;
			if(inciSet == "nee")
			{
				BindVar = true;
			}
			var geolocate = new OpenLayers.Control.Geolocate({
				bind: BindVar,
				geolocationOptions: {
					enableHighAccuracy: true,
					maximumAge: 0,
					timeout: 7000
				}
			});
			map.addControl(geolocate);
			
			var firstGeolocation = true;
			geolocate.events.register("locationupdated",geolocate,function(e) {
				vector.removeAllFeatures();
				
				var circle = new OpenLayers.Feature.Vector(
					OpenLayers.Geometry.Polygon.createRegularPolygon(
						new OpenLayers.Geometry.Point(e.point.x, e.point.y),
						e.position.coords.accuracy/2,
						40,
						0
					),
					{},
					style
				);
				
				vector.addFeatures([
					new OpenLayers.Feature.Vector(
						e.point,
						{},
						{
							graphicName: 'triangle',
							strokeColor: '#FFF',
							strokeWidth: 2,
							width: '30px;',
							fillOpacity: 1,
							fillColor: 	'#f00',
							pointRadius: 10
						}
					),
					circle
				]);
				
			
			if (firstGeolocation) {
				pulsate(circle);
				firstGeolocation = false;
				this.bind = BindVar;
			}
				
			});
			geolocate.events.register("locationfailed",this,function() {
				OpenLayers.Console.log('Location detection failed');
			});
			if(watch == 'on')
			{
				geolocate.watch = true;
			}
			else
			{
				geolocate.watch = false;
			}
			
			firstGeolocation = true;
			geolocate.activate();
		
}

function updateIncident()
{
	//alert(window.localStorage["capCodes"]);
	$.ajax({
		type: 'POST',
		url: 'http://brandweer.showittome.nl/php/php_p2000_getLatest.php', 
		data: {capcodes: window.localStorage["capCodes"]},
		async: false,
		success: function(returnData)
		{
			if(window.localStorage["laatsteMelding"] != returnData)
			{
				window.localStorage["laatsteMelding"] = returnData;
			}
		},
		error: function(returnData){
		//	gotoURLString = 's2.html';
		}
	});
	var p2000_data = window.localStorage["laatsteMelding"].split("{}");
	window.localStorage["pLng"] = p2000_data[0];
	window.localStorage["pLat"] = p2000_data[1];
	var p2000Txt = p2000_data[2];
	$(".lastReport").html( p2000Txt);
}
$(document).ready(function()
{
	$(".cb").on("click", function()
	{
		$(this).triggerClass("cbClick")	
	});
	if(!window.localStorage["capCodes"])
	{
		$("#popupSettings").show();
	}
	updateIncident();
	setInterval(updateIncident, 60000);
	$(".saveSettings").on("click", function()
	{
		
		window.localStorage["capCodes"] = '';
		$(".cb").each(function()
		{
		
			if( $(this).prop("checked") == true)
			{
				
				window.localStorage["capCodes"] += '' + $(this).val() + ',';
			}		
		});	
		
		if( $(".cbOfflineMaps").prop("checked") == true){
			window.localStorage["useOfflineMaps"] = "true"
		}else{
			window.localStorage["useOfflineMaps"] = "false"
		}
				
		$("#map").html('');
		$(".track").show();
		$(".track2").hide();
		init('off', 0, 0);
		$("#popupSettings").hide();
	});
	$(".downloadMaps").on("click", function()
	{
		//Download ZIP
        var that = this,
        App = new DownloadApp(),
        fileName = "latest.zip",
        uri = encodeURI("http://brandweer.showittome.nl/files/maps_" + window.localStorage["versionCodeMaps"] + ".zip"),
        folderName = "content";
        console.log("load button clicked");
        document.getElementById("statusPlace").innerHTML += "<br/>Loading: " + uri;
        App.load(uri, folderName, fileName,
                /*progress*/function(percentage) { document.getElementById("statusPlace").innerHTML = "<br/>" + percentage + "%"; },
                /*success*/function(entry) { document.getElementById("statusPlace").innerHTML = "<br/>Zip saved to: " + entry.toURL(); },
                /*fail*/function() { document.getElementById("statusPlace").innerHTML = "<br/>Failed load zip: " + that.uri; }
        );
		
		 $.ajax({
		        url: 'http://brandweer.showittome.nl/php/checkMapsVersion.php',
		        type: 'get',
		        async: false,
		        success: function(html) {
	               // window.localStorage["versionCodeMaps"] = html;
		        }
		});	
	});
		$(".downloadMapsGebruiken").on("click", function()
	{
	            var that = this,
                    App = new DownloadApp(),
                    fileName = "latest.zip",
                    folderName = "content";
            console.log("zip button clicked");
            App.unzip(folderName, fileName, function() {}, function(progressEvent) { alert(Math.round((progressEvent.loaded / progressEvent.total) * 100)) });
	});
	$(".lastReport").on("click", function()
	{
		if(window.localStorage["pLng"] != "")
		{
			//alert("melding" + p2000Lat + " " + p2000Lng);
			$("#map").html('');
			$(".track").show();
			$(".track2").hide();
			init('off', window.localStorage["pLng"], window.localStorage["pLat"])
		}else{
			navigator.notification.alert("Locatie niet beschikbaar.", function(){  }, "Melding", "OK");
		}
	});
	$(".refresh").on("click", function()
	{
		$("#map").html('');
		$(".track").show();
		$(".track2").hide();
		init('off', 0, 0);
	});
	$(".track").on("click", function()
	{
		$("#map").html('');
		$(".track").hide();
		$(".track2").show();
		init('on',0,0);
	});
	$(".track2").on("click", function()
	{
		$("#map").html('');
		$(".track2").hide();
		$(".track").show();
		init('off',0,0);
	});
	
});
