define("mylibs/visualization/GeoVis", 
	[	
	    "mylibs/visualization/ThumbRendererFactory",
		"order!js/mylibs/visualization/gmap.js",	
		"order!js/mylibs/visualization/Thumbnail.js",
		"order!js/mylibs/visualization/ThumbContainer.js"
  	  
	], function(rf){
  
  
	GeoVis = function( searchResults, containerDiv, options, ctx ) {
		this.searchResults = searchResults ;
		this.ctx = ctx ;
		this.containerDiv = containerDiv ;
		this.thumbOptions = options.thumbOptions ;
		
		if (options.thumbRenderer )
			this.thumbRenderer = rf.create(options.thumbRenderer) ;
		else
			this.thumbRenderer = rf.create("default") ;

		this.thumbOptions = options.thumbOptions ;
		
		this.createLayout() ;

		this.populate() ;
	};

	var p = GeoVis.prototype;   

	p.searchResults = null ;
	p.thumbOptions = null ;

	p.containerDiv = null ;
	p.onClick = null ;

	p.createLayout = function()  {
		
		$(this.containerDiv).empty() ;
		
		this.resultsInnerDiv = $('<div>', { id: "geo-results", css: { width: "100%", position: "absolute", top: 0, height: $(this.containerDiv).height()  }}).appendTo(this.containerDiv) ;
		
	};
	
	p.populate = function(modalities)  {
  	
		var _this = this ;

		var markerImages = [];	
		var markerImages2 = [];	

		var n = this.searchResults.docs.length ;
		
		for( var i=n-1 ; i>=0 ; i-- )	
		{	
			var data = this.searchResults.docs[i] ;	
			
			if ( data.filtered ) continue ;
			if ( ThumbContainer.modalFilter(data, this.ctx.filterBar.modalities()) === true ) continue ;

			if ( data.hasOwnProperty("rw") && data.rw )
			{
				if ( data.rw.hasOwnProperty("pos") )
				{
					var lat = data.rw.pos.coords.lat ;
					var lon = data.rw.pos.coords.lon ;
					var thumb = ThumbContainer.selectThumbUrl(data, this.ctx.filterBar.modalities()) ;
					var tooltip = ThumbContainer.selectTooltipText(data) ;
				
				
					markerImages.push({ "lat": lat, "lon": lon, "icon": thumb, "tooltip": tooltip, data: { doc: data }}) ;	
					markerImages2.push({ "lat": lat, "lon": lon, "tooltip": tooltip, "score": i/n, data: { doc: data }}) ;	
				}
			}
		}	
	
		var mainMap = new GoogleMap(this.resultsInnerDiv.get(0), this.thumbRenderer, this.ctx.filterBar.modalities(),
			{ onSimilar: this.thumbOptions.findSimilarCallback, 
				docPreview: this.thumbOptions.documentPreview, onClick: this.thumbOptions.onClick
			}, [ 	
				{ type: 'markers', data: markerImages, name: 'Images',	
						minzoom: 12, maxzoom: 24},
				{ type: 'markers', data: markerImages2, name: 'Placemarks',	
						minzoom: 0, maxzoom: 11}						
				]) ;
		
		
	};

	return {
		create: function(searchResults, containerDiv, options, ctx) {
					return new GeoVis(searchResults, containerDiv, options, ctx);
			}
	};
});
