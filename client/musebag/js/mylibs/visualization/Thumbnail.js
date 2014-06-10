// jQuery plugin for showing image thumbnails aligned within a div
// Uses the canvas element.

(function( $ ){
	$.fn.thumb = function(methodOrUrl, options) {
		
		var defaults = {
			'autoLoad': true,
			'maintainAspectRatio': true,
			'decorator': null
		};
		options = $.extend( {}, defaults, options );
		
		
		var loadImage = function(obj)
		{
			var data = obj.data('data') ;
				
			if ( inviewport(obj) )
			{
						
				data.image.onload = function() {
					drawImage(obj) ;
				}
				data.image.src = data.url ;
			}
			return obj ;
		}
					
		var drawImage = function(obj)	
		{	
			var dstw2 = obj.width() ;
			var dsth2 = obj.height() ;	
		
			var data = obj.data('data') ;
			
			if ( !data ) return ;
			
			var origw = data.image.width ;	
			var origh = data.image.height ;	
			var ctx = data.ctx ;
		
			var thumbw, thumbh, offx, offy ;	
		
			if ( options.maintainAspectRatio )
			{
				if ( origw > origh )	
				{	
					thumbw = dstw2 ;  	
					thumbh = dsth2*(origh/origw);  	
				}  	
				else if ( origw <= origh )   	
				{  	
					thumbh = dsth2 ;  	
					thumbw = dstw2*(origw/origh);  	
				}  	
				
				offx = (dstw2 - thumbw)/2 ;
				offy = (dsth2 - thumbh)/2 ;
			}
			else
			{
				thumbw = dstw2 ;
				thumbh = dsth2 ;
				offx = 0 ;
				offy = 0 ;
			}
					
			ctx.drawImage(data.image, offx, offy, thumbw, thumbh) ;	
			
			// hack to reuse aspect ratio for tooltip painting
			$(data.ele).attr('orig-width', origw).attr('orig-height', origh) ;
			
			if ( options.decorator )
				options.decorator(ctx, dstw2, dsth2, offx, offy, thumbw, thumbh) ;
		};	
		
		var  belowthefold = function(element) {
	        var fold;
        
    	    if (options.viewport === undefined || options.viewport === window) {
	            fold = $(window).height() + $(window).scrollTop();
	        } else {
            	fold = $(options.viewport).offset().top + $(options.viewport).height();
        	}

	        return fold <= $(element).offset().top ;
    	};
    
        
    	var abovethetop = function(element) {
	        var fold;
        
    	    if (options.viewport === undefined || options.viewport === window) {
            	fold = $(window).scrollTop();
	        } else {
    	        fold = $(options.viewport).offset().top;
    	    }

	        return fold >= $(element).offset().top  + $(element).height();
    	};
    	
    	var rightoffold = function(element) {
	        var fold;

        	if (options.viewport === undefined || options.viewport === window) {
            	fold = $(window).width() + $(window).scrollLeft();
	        } else {
            	fold = $(options.viewport).offset().left + $(options.viewport).width();
        	}

	        return fold <= $(element).offset().left ;
    	};
    	
    	var leftofbegin = function(element) {
	        var fold;
        
        	if (options.viewport === undefined || options.viewport === window) {
            	fold = $(window).scrollLeft();
	        } else {
            	fold = $(options.viewport).offset().left;
        	}

	        return fold >= $(element).offset().left + $(element).width();
    	};
    
	
    	var inviewport = function(element) {
//    	      return !rightoffold(element) && !leftofbegin(element) &&
             return  !belowthefold(element) && !abovethetop(element);
	    };
		
		return this.each( function() {
        
	        var self = this ;
			var $self = $(this) ;
			
			
			if ( methodOrUrl == 'load' )
				loadImage($self) ;
			else
			{
				var w = $self.width() ;
				var h = $self.height() ;
			
				var canvas = $("<canvas/>").appendTo($self).get(0) ;	
				canvas.width = w ;
				canvas.height = h ;
				var ctx = canvas.getContext("2d");	
			
				var image = new Image ;
				$self.data('data', { "image": image, "ctx": ctx, "url": methodOrUrl, "ele": $self }) ;
			
			
				if ( options.autoLoad )
					loadImage($self) ;
					
			}  
			
			par = options.viewport ;
		
			$(par).scroll(function() {
					loadImage($self) ;
			}) ;
		
        }) ; 

	};
})( jQuery );
