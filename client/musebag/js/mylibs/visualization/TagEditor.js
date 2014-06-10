TagEditor = function(ele, tags, allTags, callBack) {	
	this.ele = ele ;
	this.tags = tags ;
	this.allTags = allTags ;
	this.callBack = callBack ;
	
	this.create() ;
};	

var p = TagEditor.prototype;	

p.create = function()
{
/*
  if(this.allTags.length < 1) {
    this.ele.append('<p>No filter tags</p>');
  } else {
    for(var t = 0; t < this.allTags.length; t++)
    {
      var tag = this.allTags[t];
      var that = this;
      
      var tagBox = $('<span/>', { "class": "tag", "data-rank" : tag.relevance, text: tag.name }).appendTo(this.ele);
      
      tagBox.toggle(function() {
        that.tags.push($(this).text());
        $(this).addClass('selected');
        if(typeof that.callBack === 'function') {
          that.callBack(that.tags);
        }
      }, function() {
        that.tags.splice(that.tags.indexOf(tag.name),1);
        $(this).removeClass('selected');
        if(typeof that.callBack === 'function') {
          that.callBack(that.tags);
        }
      });
    }
  }
  */
  //Original version
	
	var tagsDiv = $('<div/>', { "class": "tags-container" }).appendTo(this.ele) ;
	
	this.tagsContainer = tagsDiv ;
	
	var that = this ;
	
	for( var tag in this.tags )
	{
		this.appendTagBox(tag, tagsDiv) ;
	}
	
	var addTagDiv = $('<div/>').appendTo(tagsDiv) ;
	var tagInput = $('<input/>', { "class": "add-tag-input",  value:"add a tag",  autocomplete: "off" }).appendTo(addTagDiv) ;
	
	tagInput.autocomplete({
			source: this.allTags
		});
	
	this.tagsInput = addTagDiv ;
	
	$(tagInput).keydown(function(event) {
		if (event.keyCode == '13') {
		
			that.addTag($(this).attr("value")) ;
			$(this).attr("value", "") ;
			if ( that.callBack ) that.callBack() ;
			event.preventDefault();
		}
		
	
   }) ;
   
   $(tagInput).focus(function(event) {
		$(this).attr("value", "") ;
	}) ;
	
/*
	var tagsClear = $('<div/>', { "class": "tags-clear" }).appendTo(addTagDiv) ;
		
	var tagsButtons = $('<div/>', { "class": "tags-dialog-button-box", css: { margin-top: "10px"} }).appendTo(this.ele) ;
	
	var tagsButtonOk = $('<a/>', { text: "Ok"}).appendTo(tagsButtons).button().click(function() { that.dialog}) ;
	var tagsButtonCancel = $('<a/>', { text: "Cancel"}).appendTo(tagsButtons).button() ;
*/	

} ;

p.appendTagBox = function(tag, tagsDiv)
{
	var tagBox = $('<span/>', { "class": "tag", "tag": tag, text: tag + "  " }) ;
	
	if ( tagsDiv ) tagBox.appendTo(tagsDiv) ;
	else  {
		var sel = $('.tag', this.tagsContainer).last() ;
		if ( sel.length == 1 ) tagBox.insertAfter(sel) ;
		else tagBox.insertBefore(this.tagsInput) ;
	}
	var deleteTag = $('<a/>', { "title": "remove tag", href: "javascript:void(0);", text: "x" }).appendTo(tagBox) ;
	
	var that = this ;	
	$(deleteTag).click(function() {
		var box = $(this).parent() ;
		var tag = box.attr("tag") ;
	//	if ( that.tags[tag] == 0 ) that.tags[tag] = 1 ;
	//	else delete that.tags[tag] ;
		
		that.tags[tag] = 1 ;
		
		$('.add-tag-input', that.tagsContainer).attr("value", "add a tag") ;
		
		box.remove() ;
		
		that.callBack() ;
		
		return false ;
	}) ;	
};

p.addTag = function(tag)
{
	if ( !this.tags.hasOwnProperty(tag) || this.tags[tag] == 1 )
	{
		this.appendTagBox(tag) ;
		
		this.tags[tag] = 2 ;
	}
};
	



