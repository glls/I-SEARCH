define("mylibs/visualization/TagManager", [], function() {

    var index, docs, queryId, filterTagUrl, sortedTagList = [], tagServerUrl ;
			
    var init = function(results_, options) {
		
        docs = results_.docs;
        queryId = results_.queryId;

        if ( options.tagServerUrl ) {
            tagServerUrl = options.tagServerUrl ;
        }
		
        filterTagUrl = options.filterTagUrl ||	tagServerUrl || 'ptag/filterTags/'  ;
        if ( tagServerUrl ) filterTagUrl += "&a=all" ;
	
        filterTagUrl = options.filterTagUrl;
        storeItemUrl = options.storeTagUrl ;
					
    //load() ;
    };

    var load = function(callback)	{
	
        var data = [] ;
		
        for(var i=0 ; i< docs.length ; i++ )
        {
            var doc = docs[i] ;
            data.push(doc.id) ;
        }

//otan pas gia edit
        $.ajax({
            //type: filterTagUrl == 'ptag/filterTags' ? 'GET' : 'POST',
            type: 'POST',
            url: filterTagUrl, 
            data: {
                "tags":	JSON.stringify(data)
            },
            success: function(data) {
                console.log('got filter tags:');
                console.dir(data);
			  
                if(!data || data.length < 1) {
                    return;
                }
                sortedTags = data;
                if(typeof callback === 'function') {
                    callback(sortedTags);
                }        
            },
            error: function(jqXHR, error, object) {
                console.error("Error during filterTag request: " + error);
            },
            dataType: 'json'
        });
		
    } ;
	
    var toggleRelevance = function(doc)
    {
        if ( tagServerUrl )
        {
            var docid = doc.id ;
	
            var data = {
                "id": docid, 
                "rel": (doc.relevant ? 'yes' : 'no')
            } ;
		
            $.ajax({
                type: 'GET',
                url: tagServerUrl + '&a=rel',
                data: data
            });
        }
        else
        {
            doc.tags.filter(function(val) {
                return !val ? false : true;
            });

            var data = {
                "queryId" : queryId,  
                "item" : {  
                    "id"   : doc.coid,
                    "tags" : doc.tags
                }
            };
    
            if(doc.relevant) {
                $.ajax({
                    type: "POST",
                    url:  storeItemUrl,
                    data: JSON.stringify(data),
                    contentType : "application/json; charset=utf-8",
                    dataType : "json",
                    success: function(data) {
                        console.log('Item stored, since it was marked relevant.');
                    },
                    error: function(jqXHR, error, object) {
                        console.log("Error:");
                        console.log(error);
                    }
                });
            } else {
                $.ajax({
                    type: "DELETE",
                    url:  storeItemUrl,
                    data: JSON.stringify(data),
                    contentType : "application/json; charset=utf-8",
                    dataType : "json",
                    success: function(data) {
                        console.log('Item removed, since it was marked irrelevant.');
                    },
                    error: function(jqXHR, error, object) {
                        console.log("Error:");
                        console.log(error);
                    }
                });
            }

        }
    };

	
    var store = function(doc)
    {
        var tags = doc.tags ;
        var docid = doc.id ;
		
        var data = {
            "id": docid, 
            "tags": JSON.stringify(tags)
        } ;
		
        $.ajax({
            type: 'POST',
            url: storeItemUrl,
            data: data
        });
    };
	
    // this is to download the list of tag assignements. Currently we do this be sending the content
    // to a server script that mirrors it.
	
    var download = function()
    {
        //removed
    };
	
    var clear = function() {
		
        localStorage.clear() ;
        for(var i=0 ; i<docs.length ; i++ )
        {
            docs[i].tags = [] ;
        }
    };
	
    return { 
        docs: docs,
        init: init,
        load: load,
        tags: sortedTagList,
        store: store,
        clear: clear,
        toggleRelevance: toggleRelevance
    } ;

}) ;