define("mylibs/visualization/TimeVis", 
	[	
	    "mylibs/visualization/ThumbRendererFactory",
 		"libs/timeline_2.3.0/timeline_js/timeline-api", 
		"order!js/mylibs/visualization/Thumbnail.js",
		"order!js/mylibs/visualization/ThumbContainer.js"
  	  
	], function(rf){
  
  
	TimeVis = function( searchResults, containerDiv, options, ctx ) {
		this.searchResults = searchResults ;
		this.ctx = ctx ;
		this.containerDiv = containerDiv ;
		this.thumbOptions = options.thumbOptions ;
		
		if (options.thumbRenderer )
			this.thumbRenderer = rf.create(options.thumbRenderer) ;
		else
			this.thumbRenderer = rf.create("default") ;

		// hack to deal with initialisation
		Timeline.DateTime = SimileAjax.DateTime ;
		

		ThumbContainer.extentTimeLine(this.thumbRenderer, ctx, { onSimilar: options.thumbOptions.findSimilarCallback, 
			docPreview: options.thumbOptions.documentPreview, onClick: options.thumbOptions.onClick})	;
			
		this.createLayout() ;

		this.populate() ;
	};

var p = TimeVis.prototype;   

p.searchResults = null ;
p.thumbOptions = null ;

p.containerDiv = null ;
p.onClick = null ;

p.createLayout = function()  {
		
	$(this.containerDiv).empty() ;
		
	this.resultsInnerDiv = $('<div>', { id: "timeline-results", 
		css: { width: "100%", position: "absolute", top: 0, height: $(this.containerDiv).height()  }})
		.appendTo(this.containerDiv) ;
		
};
	
p.populate = function(modalities)  {
  	
	var eventSource = new Timeline.DefaultEventSource();
	
	var theme = Timeline.ClassicTheme.create();
	theme.mouseWheel = 'default' ;
	theme.autoWidth = false ;
	
	var event_data = { "dateTimeFormat": "iso8601", events: [] } ;
	
	var mindate = new Date(), maxdate = new Date() ;
	
	var n = this.searchResults.docs.length ;
	
	for( var i=0 ; i<n ; i++ )	
	{	
		var data = this.searchResults.docs[i] ;	
			
		if ( data.filtered ) continue ;
		if ( ThumbContainer.modalFilter(data, this.ctx.filterBar.modalities()) === true ) continue ;

		if ( data.hasOwnProperty("rw") && data.rw )
		{
			if ( data.rw.hasOwnProperty("time") )
			{
				// title ?
				var d = new Date(data.rw.time.dateTime) ;
				
				if ( d < mindate ) mindate = d ;
				if ( d > maxdate ) maxdate = d ;
				
				function ISODateString(d) {
					function pad(n){
						return n<10 ? '0'+n : n;
					}
					return d.getUTCFullYear()+'-'
					+ pad(d.getUTCMonth()+1)+'-'
					+ pad(d.getUTCDate());
				}
				var dateStr = ISODateString(d) ;
			
				var event = { 
					id:  data.id, 
					start: data.rw.time.dateTime,
					icon:  ThumbContainer.selectThumbUrl(data, this.ctx.filterBar.modalities()),
					data: { doc: data }
					//	title: ThumbContainer.selectTooltipText(data.doc)
				} ;
				
				event_data.events.push(event) ;
			}
		}
		
	}
		
		
	var cDate = new Date(parseInt((mindate.getTime() + maxdate.getTime())/2)) ;
  
	var bandInfos = [
		Timeline.createBandInfo({
			date:           mindate,
			width:          "90%", 
			intervalUnit:   Timeline.DateTime.MONTH, 
			intervalPixels: 100,
			eventSource:    eventSource,
			theme:          theme,
            eventPainter:   Timeline.CompactEventPainter,
            eventPainterParams: {
                iconLabelGap:     5,
                labelRightMargin: 20,
                        
                iconWidth:        64, // These are for per-event custom icons
                iconHeight:       64,
                       
                stackConcurrentPreciseInstantEvents: {
                    limit: 5,
                    iconWidth:              64,
                    iconHeight:             64
                }
			
            },
	
			zoomIndex:      0,
			zoomSteps:      new Array(
			//	{pixelsPerInterval: 280,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval: 140,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval:  70,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval:  35,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval: 400,  unit: Timeline.DateTime.DAY},
			//	{pixelsPerInterval: 200,  unit: Timeline.DateTime.DAY},
			//	{pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
			//	{pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.MONTH}
				,
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.YEAR},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.YEAR},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.YEAR}				// DEFAULT zoomIndex
			)
		})
		,
		Timeline.createBandInfo({
			date:           mindate,
			width:          "10%", 
			intervalUnit:   Timeline.DateTime.YEAR, 
			intervalPixels: 200,
			showEventText:  false, 
			trackHeight:    0.5,
			trackGap:       0.2,
			eventSource:    eventSource,
			overview:       true
		})
	];
	bandInfos[1].syncWith = 0;
	bandInfos[1].highlight = true;
  
	var tl = Timeline.create(this.resultsInnerDiv.get(0), bandInfos);
		
	eventSource.loadJSON(event_data, document.location.href); 
		
};

	return {
		create: function(searchResults, containerDiv, options, ctx) {
				return new TimeVis(searchResults, containerDiv, options, ctx);
		}
	};
});
