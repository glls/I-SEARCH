/**
UIIFace - Unified Interaction Interface
Copyright (c) 2011, Jonas Etzold, Fulda University of Applied Sciences (HSF)

Interaction Component of I-SEARCH (http://www.isearch-project.eu)
All rights reserved.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define("mylibs/uiiface", ["libs/modernizr.min","libs/wami-2.0"], function(){

  var UIIFace = {};

  (function(UIIFace){

    /** Helper function */
    UIIFace.namespace = function(ns_string) {
      var parts  = ns_string.split('.'),
      parent = UIIFace,
      i;

      //strip redundant leading global
      if(parts[0] === 'UIIFace') {
        parts = parts.slice(1);
      }    

      for(i = 0; i < parts.length; i += 1) {
        //create a property if it doesn't exist
        if(typeof parent[parts[i]] === 'undefined') {
          parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
      }
      return parent;
    };	

    // Namespaces for sub components of UIIFace 
    UIIFace.namespace('UIIFace.InteractionManager');
    UIIFace.namespace('UIIFace.GestureInterpreter');
    UIIFace.namespace('UIIFace.SpeechInterpreter');
    UIIFace.namespace('UIIFace.Tools');

    /** Tools for use within UIIFace */
    UIIFace.Tools.isEmpty = function(value) {
      if(value) {
        return false;
      } 		
      return true;
    };

    UIIFace.Tools.hasModality = function(modality) {
      if( modalities[modality] !== undefined ) {
        return modalities[modality];
      }
      return false;
    };
    
    UIIFace.Tools.distance = function(x1,x2,y1,y2) {
      return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
    };

    /** General properties of UIIFace */
    //Supported custom events
    var eventList = ['move','click','over',
                     'drag','drop','select',
                     'pan','scale','rotate',
                     'hold','swipe','delete',
                     'add','submit','text',
                     'reset','search','sketch'];	
    //Array for storing available touch events if applicable 
    var touchEvents = new Array(3);

    //Pen collection for multitouch sketch event
    var epoints = new Array();

    //Options object for general configuration of UIIFace
    var uiiOptions = {
        gestureHint: false
    };

    //Input modality features
    var modalities = new Array();

    /** Command Mapper */
    UIIFace.CommandMapper = function() {
      //Soon to be filled
    };

    /** Basic Interpreter */
    UIIFace.BasicInterpreter = (function() {
      
      return {
        
      };
      
    })();
    
    /** Speech Interpreter */
    UIIFace.SpeechInterpreter = (function () {
      //Speech recognition object
      var speechApp = {};
      var securityCount = 0;

      var initBasicEngine = function() {
        
        //Define the speech event functions
        var onUiiSpeechReady = function() { 
        };

        //On speech recognition result
        var onUiiSpeechRecognition = function(result) {
          console.log(result);
          //command not finished
          if (result.partial()) {
            if(result.get("command")) {
              console.log("command: " + result.get("command"));
            }
            if(result.get("media")) {
              console.log("media: " + result.get("media"));
            }
            if(result.get("item")) {
              console.log("item: " + result.get("item"));
            }
            if(result.get("target")) {
              console.log("target: " + result.get("target"));
            }
            if(result.get("direction")) {
              console.log("direction: " + result.get("direction"));
            }
          //command is finished  
          } else {
            console.log("command FINISHED!");
          }
        };

        //called when an error occurs
        var onUiiSpeechError = function(type, message) {
          console.log("Speech error: type  = " + type + ", message = " + message);  
        };

        //called when your WAMI session times out due to inactivity.
        var onUiiSpeechTimeout = function() {
          console.log("Speech timed out. Hit reload to start over");
        };

        var onUiiSpeechSecurity = function() {
          var security = speechApp.settings(Wami.settings.MICROPHONE);  
          if (!security.granted() || !security.remembered()) {
            if(securityCount < 2) {
              securityCount++;
              security.show('speechInterface');
            } else {
              //Seems like an error or no microphone event, so skip speech recognition
              $('#speechInterface').remove();
              securityCount = 0;
            }
          } else {
            features['speech'] = true;
          }
        };
        
        /*'move','click','over',
        'dragenter','drop','dragleave',
          'select','pan','scale',
          'rotate','hold','swipe',
          'delete','add','submit',
          'text','reset','search',
          'sketch'*/
        var jsgf = '#JSGF V1.0;\n' +
        'grammar uiiface;\n' +
        'public <top> = (<command> [and])+ ;\n' +
        '<command>    = <search> | <add> | <scale> | <zoom> | <select> | <click> | <delete> | <next> | <previous> | <pan> | <abort> ;\n' +
        '<abort>      = (abort | break | restart) {[command=exit]} ;\n' +
        '<search>     = (search | find | go) {[command=search]} ;\n' +
        '<add>        = (add | attach | insert) {[command=add]} (<media> | <item>) [to <target>] ;\n' +
        '<next>       = (next | move forward | go on) {[command=next]} [<target>] ;\n' +
        '<previous>   = (previous | last | (move | go) (back | backwards)) {[command=previous]} <target> ;\n' +
        '<scale>      = (scale {[command=scale]} <direction> | make <item> bigger {[command=scale]} {[direction=in]} | make <item> smaller {[command=scale]} {[direction=out]}) ;\n' +
        '<zoom>       = zoom {[command=zoom]} [<direction>] (<item> | <target>)* ;\n' +
        '<select>     = (select | choose) {[command=select]} (<next> | <previous> | <item> | <target>) ;\n' +
        '<click>      = (click | open) {[command=click]} (<next> | <previous> | <item> | <target>) ;\n' +
        '<delete>     = (delete | erase | clear) {[command=delete]} (<next> | <previous> | <item> | <target>) ;\n' +
        '<pan>        = (pan {[command=pan]} (<direction>)+) ;\n' +
        '<direction>  = (up | top)+      {[direction=up]}\n' +
        '             | (down | bottom)+ {[direction=down]}\n' +
        '             | left          {[direction=left]}\n' +
        '             | right         {[direction=right]}\n' +
        '             | in            {[direction=in]}\n' +
        '             | out           {[direction=out]} ;\n' +
        '<media>      = image         {[media=image]}\n' +
        '             | photo         {[media=image]}\n' +
        '             | painting      {[media=image]}\n' +
        '             | audio         {[media=audio]}\n' +
        '             | sound         {[media=audio]}\n' +
        '             | song          {[media=audio]}\n' +
        '             | three d       {[media=model]}\n' +
        '             | model         {[media=model]}\n' +
        '             | sketch        {[media=sketch]}\n' +
        '             | geolocation   {[media=geo]}\n' +
        '             | [my] position {[media=geo]}\n' +
        '             | [my] location {[media=geo]}\n' +
        '             | emotion       {[media=emotion]}\n' +
        '             | feeling       {[media=feeling]}\n' +
        '             | text          {[media=text]}\n' +
        '             | phrase        {[media=text]}\n' +
        '             | tag           {[media=text]} ;\n' +
        '<item>       = [item] (one   {[item=1]}\n' +
        '             | two           {[item=2]}\n' +
        '             | three         {[item=3]}\n' +
        '             | four          {[item=4]}\n' +
        '             | five          {[item=5]}\n' +
        '             | six           {[item=6]}\n' +
        '             | seven         {[item=7]}\n' +
        '             | eight         {[item=8]}\n' +
        '             | nine          {[item=9]}\n' +
        '             | ten           {[item=10]}\n' +
        '             | this          {[item=this]}\n' +
        '             | here          {[item=this]}\n' +
        '             | [to] current  {[item=this]})* ;\n';
        '<target>     = row           {[target=row]}\n' +
        '             | column        {[target=column]}\n' +
        '             | slide         {[target=slide]}\n' +
        '             | query         {[target=query]}\n' +
        '             | selection     {[target=selection]}\n' +
        '             | page          {[target=page]} ;\n';
        
        
        var grammar = {
            language    : "en-us", 
            grammar     : jsgf,
            incremental : true,
            aggregate   : true
        };

        var options = {
            guiID : 'speechInterface',
            devKey : '319b4feb366fd7b643f72f0627839f67',
            grammar : grammar,
            onReady : onUiiSpeechReady,
            onRecognition : onUiiSpeechRecognition,
            onError : onUiiSpeechError,
            onTimeout : onUiiSpeechTimeout,
            onSecurity : onUiiSpeechSecurity
        };
  
        console.log('hallo, im wami :-)');
        //Get the party started
        speechApp = new Wami.App(options);


      }; //End basic engine function

      var initChromeEngine = function() {
        console.log('hello, im chrome :-)');
        $('<input type="text" x-webkit-speech />').appendTo('speechInterface');
      };

      return {
        //Public interface for SpeechInterpreter
        start : function(mode) {
          $('<div id="speechInterface"></div>').appendTo('body');
          if(mode === 'chrome') {
            console.log('Start Chrome speech recognition..');
            initChromeEngine();
          } else {
            console.log('Start basic speech recognition..');
            initBasicEngine();
          }
        }
      };
    })();

    /** Gesture Interpreter 
     * 
     * This work is mainly an adaption of Moousture by Zohaib Sibt-e-Hassan.
     * It is partly enhanced by an approach developed in my master thesis.
     *  
     */
    UIIFace.GestureInterpreter = function (element) {
      var element = element;

      /** Internal class for mouse or touch probe */
      var Probe = function(target) {
        this.pos = {x:-1, y:-1};

        // private event tracking callback function
        var _track = function(e)
        {
          this.pos.x = e.pageX;
          this.pos.y = e.pageY;
          e.stopPropagation();
        };

        $(target).bind('mousemove' + (touchEvents['move'] !== undefined ? ' ' + touchEvents['move'] : ''), $.proxy(_track,this));
      };

      Probe.prototype = {
          probe: function ()
          {
            pos = { };
            $.extend(pos,this.pos);
            return pos;
          }
      };

      /** Internal recorder class */
      var Recorder = function(options) {
        /*
         * @options: containing minSteps, maxSteps, matcher (more open for further compatibility).
         * initialize the callbacks table and gesture combinations table.
         */
        this.options = { 
            matcher: null,
            maxSteps: 8,
            minSteps: 4
        };
        if(!UIIFace.Tools.isEmpty(options)) {
          this.options = options;
        }
        this.movLog = [];

      };

      Recorder.prototype = {		
          // onStable is called once by the Monitor when mouse becomes stable .i.e. no changes in mouse position are occuring
          // @position: current mouse position
          onStable: function(position){
            if( this.movLog.length < this.options.minSteps ){
              this.movLog.length = 0;
              return;
            }

            if(this.options.matcher && this.options.matcher.match) {
              this.options.matcher.match(this.movLog);
            }
            if(uiiOptions.gestureHint === true) {
              $('.gestureHint').hide();
            }

            this.movLog.length = 0;
          },
          // onUnstable is called by the Monitor first time when the mouse starts movement
          // @position: current mouse position
          onUnstable: function(position){
            this.movLog.length = 0;
            this.movLog.push(position);

            if(uiiOptions.gestureHint === true) {
              $('.gestureHint').show().css('top',position.y+30).css('left',position.x+25);
            }
            //console.log('start');
          },
          // onMove is called by the Monitor when mouse was found moving last time as well
          // @position: current mouse position
          onMove: function(position){
            if(this.movLog.length > this.options.maxSteps) {
              return;
            };  
            this.movLog.push(position);
            if(uiiOptions.gestureHint === true) {
              $('.gestureHint').show().css('top',position.y+30).css('left',position.x+25);
            }
          }
      };

      /** Internal class monitor */
      var Monitor = function(delay, tHold) {
        /*
         *	@delay: delay between probes in ms lower mean more sensitive
         *	@tHold: threshold of mouse displacement to be ignored while in stable state ( in pixels )
         */
        this.prev = {x:0, y:0};
        this.delay = UIIFace.Tools.isEmpty(delay) ? 20 : delay;
        this.thresh = UIIFace.Tools.isEmpty(tHold) ? 1 : tHold;
        this.wasStable = false;
      };

      Monitor.prototype = {
          /*
           *	periodic function to probe the mouse movement
           */
          monitor: function() {
            pos = this.prober.probe();

            if ( Math.abs(pos.x - this.prev.x) < this.thresh && Math.abs( pos.y - this.prev.y ) < this.thresh )
            {
              if( !this.wasStable ) {
                this.cbObject.onStable(pos);
              }
              this.wasStable = true;
            }
            else
            {
              if( this.wasStable ) {
                this.cbObject.onUnstable(pos);
              } else {
                this.cbObject.onMove(pos);
              }
              this.wasStable = false;
            }

            this.prev = pos;
          },
          /*
           *	prober: an Object containing method probe returning an object with {x, y} for position parameters
           *	eventObj: an eventObject containing callback functions - onStable, - onMove and - onUnstable
           */
          start: function(prober, eventObj){
            if( this.timer )
              this.stop();
            this.prober = prober;
            this.cbObject = eventObj;

            var that = this;
            this.timer = setInterval($.proxy(this.monitor,this), this.delay );
          },
          /*
           * Stop and delete timer probing
           */
          stop: function(){
            clearTimeout(this.timer);
            clearInterval(this.timer);
            delete this.timer;
          }
      };

      /** Internal class GestureMatcher */
      var GestureMatcher = function() {
        this.mCallbacks = [];
        this.mGestures  = [];
      };

      GestureMatcher.prototype = {
          /*
           * Generates angle directions...
           * @input : track array
           * @output: directions array
           * 0 - Rightwards ( 3'O clock hour arm )
           * 1 - Bottom Rightwards
           * 2 - Bottomwards
           * 3 - Bottom Left
           * 4 - Left
           * 5 - Left Topwards
           * 6 - Upwards,
           * 7 - Right Upwards 
           */
          angelize : function(track){
            ret = [];

            for( i = 1; i< track.length - 1; i++ )
              ret.push( this.getAngles( track[i], track[i+1] ) );
            return ret;
          },
          /*
           * Gets angle and length of mouse movement vector...
           * @input: two points
           * @output:  angle in radians
           */
          getAngles : function(oldP, newP){
            diffx=newP.x-oldP.x;
            diffy=newP.y-oldP.y;
            a = Math.atan2(diffy,diffx) + Math.PI/8;

            if( a < 0 ) a = a + (2 * Math.PI);

            a = Math.floor( a /(2*Math.PI)*360 ) / 45;
            return Math.floor( a );
          },
          /*
           * Associate the given Gesture combination with callback
           */
          addGesture : function(gesture, callback){
            this.mCallbacks.push(callback);
            this.mGestures.push(gesture);
          },
          /*
           * match is called after the mouse went through unstable -> moving -> stable stages
           * @track contains array of {x,y} objects
           * Key function
           * - vectorize track
           */
          match : function(track){

            a = this.angelize(track);

            if( this.onMatch )
              this.onMatch(a);
          },
          /*
           * Fixes applied for:
           * > 1x1 matrix
           * > previously it returned original distance+1 as distance 
           * > [0][0] onwards moves were judged as well
           * > [undefined] targets handled
           */
          levenDistance : function(v1, v2){
            d = [];

            for( i=0; i < v1.length; i++)
              d[i] = [];

            if (v1[0] != v2[0])
              d[0][0] = 1;
            else
              d[0][0] = 0;

            for( i=1; i < v1.length; i++)
              d[i][0] = d[i-1][0] + 1;

            for( j=1; j < v2.length; j++)
              d[0][j] = d[0][j-1] + 1;

            for( i=1; i < v1.length; i++)
            {
              for( j=1; j < v2.length; j++)
              {
                cost = 0;
                if (v1[i] != v2[j])
                  cost = 1;

                d[i][j] = d[i-1][j] + 1;
                if ( d[i][j] > d[i][j-1]+1 ) d[i][j] = d[i][j-1] + 1;
                if ( d[i][j] > d[i-1][j-1]+cost ) d[i][j] = d[i-1][j-1] + cost;
              }
            }

            return UIIFace.Tools.isEmpty(d[v1.length-1][v2.length-1]) ? 0 : d[v1.length-1][v2.length-1];
          },
          nPairReduce : function(arr, n){
            var prev = null;
            var ret = [];

            n = UIIFace.Tools.isEmpty(n) ? 1 : n;

            for(var i=0; i<arr.length-n+1; i++){
              var tmp = arr.slice(i, i+n);
              var ins = true;

              for(var j=1; j<tmp.length; j++){
                if(arr[i] != tmp[j]){
                  ins = false;
                }
              }

              if(ins && prev!=arr[i]){
                ret.push(arr[i]);
                prev = arr[i];
              }
            }

            return ret;
          },
          onMatch : function (mov){

            mov = this.nPairReduce(mov,2);
            cbLen = this.mCallbacks.length;

            //fix applied for [ undefined ] moves
            if( cbLen < 1 || mov[0] === undefined)
              return ;

            minIndex = 0;
            minDist = this.levenDistance(mov, this.mGestures[0]);

            for(p=1; p<cbLen; p++)
            {				
              nwDist = this.levenDistance(mov, this.mGestures[p]);

              if( nwDist < minDist ){
                minDist = nwDist;
                minIndex = p;
              }
            }

            this.mCallbacks[minIndex](minDist/mov.length);
          }
      };

      var gMatcher = new GestureMatcher();
      var probe    = new Probe(element);
      var recorder = {};
      var monitor  = {};

      return {
        //Public interface for GestureInterpreter
        addGesture : function(gesture,callback) {
          gMatcher.addGesture(gesture, callback);
        },
        start : function() {
          recorder = new Recorder({maxSteps: 50, minSteps: 8, matcher: gMatcher});
          monitor  = new Monitor(30, 2);

          monitor.start(probe, recorder);
        },
        stop : function() {
          monitor.stop();
        }
      };

    };

    /** Interaction Manager and trigger */
    UIIFace.InteractionManager = function(element) {
      
      return {
        //Public interface for InteractionManager
        init : function() {
          console.log('Init InteractionManager');
        }
      };
    };
    UIIFace.InteractionManager.sketch = function(e) {
      e.preventDefault();
      //Fallback for mouse events
      e.streamId = e.originalEvent.streamId || 0;
      //Fallback for mobile touch events
      if(e.originalEvent.touches) {
        
      }
      //console.log(e.type);
      //console.log(e.streamId);
      var target = e.target || e.srcElement;

      switch(e.type) {
      case touchEvents['down']:
      case 'mousedown':
        // Create epoints if necessary
        if(!epoints[e.streamId]) {
          //console.log('add pen for id ' + e.streamId);
          epoints[e.streamId] = { 
              size: 3,
              color: '40,0,0',
              oldX : 0,
              oldY : 0,
              x    : parseFloat((e.pageX - $(target).offset().left).toFixed(2)),
              y    : parseFloat((e.pageY - $(target).offset().top).toFixed(2))
          };
        }  
        break;
      case touchEvents['move']:
      case 'mousemove':
        //Attach pen information to event and trigger sketch event 
        if(typeof(epoints) !== undefined && e.streamId in epoints) {
          //console.log('moving with id ' + e.streamId);	
          epoints[e.streamId].oldX = epoints[e.streamId].x;
          epoints[e.streamId].oldY = epoints[e.streamId].y;

          epoints[e.streamId].x = parseFloat((e.pageX - $(target).offset().left).toFixed(2));
          epoints[e.streamId].y = parseFloat((e.pageY - $(target).offset().top).toFixed(2));

          $(target).trigger('sketch', epoints[e.streamId]);
        }
        break;
      case touchEvents['up']:
      case 'mouseup':
        //Remove pen
        //console.log('sketch end');
        if(epoints[e.streamId]) {
          epoints.splice(e.streamId,1);
        }
        break;
      case 'mouseout':
        //Reset all epoints
        epoints = new Array();
        break;
      }

      e.stopPropagation(); 
    };
    
    UIIFace.InteractionManager.scale = function(e) {
      e.preventDefault();

      //Fallback for mouse events
      e.streamId = !e.originalEvent.streamId ? 1 : e.originalEvent.streamId;
      
      var target = e.target || e.srcElement;
      
      switch(e.type) {
      case touchEvents['down']:
      case 'mousedown':
        // Create epoints if necessary
        if(!epoints[e.streamId]) {
          //console.log('add pen for id ' + e.streamId);
          epoints[e.streamId] = {
              x    : parseFloat(e.clientX.toFixed(2)),
              y    : parseFloat(e.clientY.toFixed(2))
          };
        }  
        break;
      case touchEvents['move']:
      case 'mousemove':
        //Emulate a mouse scale option
        if(epoints.length < 2) {
          var offset = $(target).offset();
          epoints[0] = {
              x    : $(target).offset().left + ($(target).width() / 2),
              y    : $(target).offset().top  + ($(target).height() / 2)
          };
        }
        
        if(epoints.length == 2) {
          console.log('scale mousemove');
          console.log(epoints);
          if (typeof(epoints) !== undefined && epoints[0] == e.streamId) { //point 1
            epoints[0].x = e.clientX;
            epoints[0].y = e.clientY;
  
          } else if (typeof(epoints) !== undefined && epoints[1] == e.streamId) { // point 2
            var diagonal = dist(epoints[0].x, e.clientX, epoints[0].y, e.clientY);
            var sidesize = diagonal / Math.sqrt(2);
            
            $(target).trigger('scale', {
              target: target,
              left  : ((e.clientX < epoints[0].x) ? e.clientX : epoints[0].x),
              top   : ((e.clientY < epoints[0].y) ? e.clientY : epoints[0].y),
              width : sidesize,
              height: sidesize
            });
          }
        }
        break;
      case touchEvents['up']:
      case 'mouseup':
        //Reset all epoints
        console.log('scale mouseup');
        epoints = new Array();
        break;
      case 'mouseout':
        //Reset all epoints
        console.log('scale mouseout');
        epoints = new Array();
        break;
      }
      
      e.stopPropagation(); 
    };
    
    UIIFace.InteractionManager.rotate = function(e) {
      e.preventDefault();

      //Fallback for mouse events
      e.streamId = !e.originalEvent.streamId ? 1 : e.originalEvent.streamId;

      var target = e.target || e.srcElement;
      
      switch(e.type) {
      case touchEvents['down']:
      case 'mousedown':
        // Create epoints if necessary
        if(!epoints[e.streamId]) {
          //console.log('add pen for id ' + e.streamId);
          epoints[e.streamId] = {
              x    : parseFloat(e.clientX.toFixed(2)),
              y    : parseFloat(e.clientY.toFixed(2))
          };
        }  
        break;
      case touchEvents['move']:
      case 'mousemove':
        //Emulate a mouse scale option
        if(epoints.length < 2) {
          var offset = $(target).offset();
          epoints[0] = {
              x    : $(target).offset().left + ($(target).width() / 2),
              y    : $(target).offset().top  + ($(target).height() / 2)
          };
        }
        
        if (typeof(epoints) !== undefined && epoints[0] == e.streamId) { //point 1
          epoints[0].x = e.clientX;
          epoints[0].y = e.clientY;

        } else if (typeof(epoints) !== undefined && epoints[1] == e.streamId) { // point 2
          var diagonal = dist(epoints[0].x, e.clientX, epoints[0].y, e.clientY);
          var sidesize = diagonal / Math.sqrt(2);
          
          $(target).trigger('scale', {
            target: target,
            left  : ((e.clientX < epoints[0].x) ? e.clientX : epoints[0].x),
            top   : ((e.clientY < epoints[0].y) ? e.clientY : epoints[0].y),
            width : sidesize,
            height: sidesize
          });
        } 
        break;
      case touchEvents['up']:
      case 'mouseup':
        //Reset all epoints
        epoints = new Array();
        break;
      }
      
      e.stopPropagation(); 
    };
    
    UIIFace.WebSocketConnector = function(url,port,listenType) {
      var url  = url || 'localhost';
      var port = port || 8732;
      var listenType = listenType || 'wsdl';
      
    };
    
    UIIFace.WebSocketConnector.prototype.queryWsdlService = function(operation,params) {
      
      var operation = operation || 'SkeletonPosition';
      var params = params || { user: 1, joint: 'LeftHand' };
      
      var queryResult = function(request, status) {
        console.log(request.responseXML);
        /*$(xmlHttpRequest.responseXML)
          .find('SkeletonPosition')
          .each(function() {
            //var name = $(this).find('Name').text();
        });*/
        
      };
      
      var soapMessage =
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
        <soap:Body> \
        <' + operation + ' xmlns="http://localhost/"> \\';
        
        for(var prop in params) {
          if(params.hasOwnProperty(prop)) {
            soapMessage += '<' + prop + '>' + params[prop] + '</' + prop + '> \\';
          }
        }  
        
      soapMessage +=   
        '</' + operation + '> \
        </soap:Body> \
        </soap:Envelope>';

      $.ajax({
        url: productServiceUrl,
        type: "POST",
        dataType: "xml",
        data: soapMessage,
        complete: queryResult,
        contentType: "text/xml; charset=\"utf-8\""
      });

      return false;
    };
    
    UIIFace.WebSocketConnector.prototype.startListen = function() {
      
    };
    
    UIIFace.WebSocketConnector.prototype.stopListen = function() {
      
    };

    /** Main public functions */
    UIIFace.initialize = function(options) {
      
      window.UIIFace = this;
      
      uiiOptions = options;
      
      //Basic input modalities mouse and keyborad is always there
      modalities['basic'] = true;

      //Test for touch events
      if (Modernizr.touch){

        var isMozilla = Modernizr.mq('all and (-moz-touch-enabled)');

        if(isMozilla) {
          //If it's a mozilla browser with touch, assign the specialised touch events
          touchEvents['down'] = 'MozTouchDown';
          touchEvents['move'] = 'MozTouchMove';
          touchEvents['up']   = 'MozTouchUp'; 
        } else {
          //Assign the basic touch events (all mobile devices I guess)
          touchEvents['down'] = 'touchstart'; 
          touchEvents['move'] = 'touchmove'; 
          touchEvents['up']   = 'touchend'; 
        }
        modalities['touch'] = true;
      }
      
      //Test for speech recognition
      Modernizr.addTest('speechinput', function(){
        var elem = document.createElement('input'); 
        return 'speech' in elem || 'onwebkitspeechchange' in elem; 
      });
      
      if (Modernizr.speechinput){
        //Add chrome speech api
        //UIIFace.SpeechInterpreter.start('chrome');
        modalities['speech'] = true;
      } else {
        //Add open source speech api
        //UIIFace.SpeechInterpreter.start('basic');
        modalities['speech'] = true;
        //Test if we have an active microphone
        /*$.proxy(Wami.utils.testMicrophone('cofind',function() {
          if (arguments[0] === "microphone_found") {
            console.log('microphone found');
          }  else {
            console.log('no microphone found');
          }
        }),UIIFace);*/
      }

    };

    UIIFace.registerEvent = function(aElement, event, callback, options) {

      var element = '#' + aElement;
      // TODO: Move this to command mapper, and only call event register function from here!  
      if($.inArray(event,eventList) > -1) {

        //just bind basic browser events needed to create custom events available to I-SEARCH GUI
        switch(event) {
        case 'sketch': 
          if($(element).is('canvas')) {
            $(element).bind('mousedown' + (touchEvents['down'] !== undefined ? ' ' + touchEvents['down'] : ''),UIIFace.InteractionManager.sketch);
            $(element).bind('mousemove' + (touchEvents['move'] !== undefined ? ' ' + touchEvents['move'] : ''),UIIFace.InteractionManager.sketch);
            $(element).bind('mouseup' + (touchEvents['up'] !== undefined ? ' ' + touchEvents['up'] : ''),UIIFace.InteractionManager.sketch);
            $(element).bind('mouseout',UIIFace.InteractionManager.sketch);
          } else { 
            throw 'A sketch event can only be bound to canvas elements.'; 
          }
          break;
        case 'delete':
          var gi = new UIIFace.GestureInterpreter(element);
          //gi.addGesture([3,2,1,0,7,6,5,4],callback);
          gi.addGesture([4,0,4,0],callback);
          gi.start();
          break;
        case 'drag':
          break;
        case 'drop':
          $(element).bind('dragenter', function(e){ $(element).addClass("over"); e.stopPropagation(); e.preventDefault();});
          $(element).bind('dragover' , function(e){ e.stopPropagation(); e.preventDefault();},false);
          $(element).bind('dragleave', function(e){ $(element).removeClass("over"); e.stopPropagation(); e.preventDefault();});
          break;
        case 'scale': 
          $(element).bind('mousedown' + (touchEvents['down'] !== undefined ? ' ' + touchEvents['down'] : ''),UIIFace.InteractionManager.scale);
          $(element).bind('mousemove' + (touchEvents['move'] !== undefined ? ' ' + touchEvents['move'] : ''),UIIFace.InteractionManager.scale);
          $(element).bind('mouseup' + (touchEvents['up'] !== undefined ? ' ' + touchEvents['up'] : ''),UIIFace.InteractionManager.scale);
          break;  
        case 'rotate': 
          break;
        }
        //Always register the custom event to the element, as we will trigger
        //that event in the specialized handler functions
        if(!$(element).data('events')[event]) {
          $(element).bind(event,callback);
        }
        //a clickTarget is defined which means, that the user wants the given
        //event alternativly triggered on the element provided within clickTarget
        if(!UIIFace.Tools.isEmpty(options) && !UIIFace.Tools.isEmpty(options.clickTarget)) {
          $(clickTarget).bind('click',callback);
        }
         
      }
    };

  })(UIIFace);

  return {
    initialize: UIIFace.initialize,
    registerEvent: UIIFace.registerEvent,
    hasFeature: UIIFace.Tools.hasFeature
  };
});