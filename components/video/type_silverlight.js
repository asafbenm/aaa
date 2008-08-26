/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 */

// #ifdef __JVIDEO || __INC_ALL
// #define __WITH_PRESENTATION 1
jpf.type_silverlight = {};

/**
 * Component displaying a Silverlight video
 *
 * @classDescription This class creates a new Silverlight video player
 * @return {TypeSilverlight} Returns a new Silverlight video player
 * @type {TypeSilverlight}
 * @constructor
 * @addnode components:video
 *
 * @author      Mike de Boer
 * @version     %I%, %G%
 * @since       1.0
 */
jpf.video.TypeSilverlight = function(id, node, options) {
    this.DEFAULT_PLAYER = "components/video/wmvplayer.xaml";
    this.options = {
        backgroundcolor: '000000',
        windowless:      'false',
        file:            '',
        image:           '',
        backcolor:       '000000',
        frontcolor:      'FFFFFF',
        lightcolor:      'FFFFFF',
        screencolor:     'FFFFFF',
        width:           '320',
        height:          '260',
        logo:            '',
        overstretch:     'true',
        shownavigation:  'false',
        showstop:        'false',
        showdigits:      'true',
        usefullscreen:   'true',
        usemute:         'false',
        autostart:       'true',
        bufferlength:    '3',
        duration:        '0',
        repeat:          'false',
        sender:          '',
        start:           '0',
        volume:          '90',
        link:            '',
        linkfromdisplay: 'false',
        linktarget:      '_self'
    };
    this.options.file = options.src;
    
    for (var itm in this.options) {
        if (options[itm] != undefined) {
            if (itm.indexOf('color') > 0)
                this.options[itm] = options[itm].substr(options[itm].length - 6);
            else
                this.options[itm] = options[itm];
        }
    }
    
    jpf.silverlight_helper.createObjectEx({
        id:            id + "_Player",
        source:        this.DEFAULT_PLAYER,
        parentElement: node,
        properties:    {
            width:                this.options['width'],
            height:               this.options['height'],
            version:              '1.0',
            inplaceInstallPrompt: true,
            isWindowless:         this.options['windowless'],
            background:           '#' + this.options['backgroundcolor']
        },
        events:        {
            onLoad:  this.onLoadHandler,
            onError: jpf.silverlight_helper.default_error_handler
        },
        context:       this
    });
    
    jpf.extend(this, jpf.video.TypeInterface);
};

jpf.video.TypeSilverlight.isSupported = function(){
    return jpf.silverlight_helper.isAvailable('1.0');
};

jpf.video.TypeSilverlight.prototype = {
    /**
     * Play and/ or resume a video that has been loaded already
     * 
     * @type {Object}
     */
    play: function() {
        if (this.state == 'buffering' || this.state == 'playing') {
            if (this.options['duration'] == 0) 
                this.stop();
            else 
                this.pause();
        }
        else {
            this.video.Visibility   = 'Visible';
            this.preview.Visibility = 'Collapsed';
            if (this.state == "closed")
                this.video.Source = this.options['file'];
            else
                this.video.play();
        }
        return this;
    },
    
    /**
     * Toggle the pause state of the video.
     *
     * @type {Object}
     */
    pause: function() {
        if (!this.video) return;
        this.video.pause();
        return this;
        //this.dispatchEvent({
        //    type        : 'change',
        //    playheadTime: Math.round(this.video.Position.Seconds * 10) / 10
        //});
    },
    
    /**
     * Stop playback of the video.
     * 
     * @type {Object}
     */
    stop: function() {
        if (!this.video) return;
        this.stopPlayPoll();
        this.video.Visibility   = 'Collapsed';
        this.preview.Visibility = 'Visible';
        this.pause().seek(0);
        this.video.Source = 'null';
        return this;
    },
    
    /**
     * Seek the video to a specific position.
     *
     * @param {Number} iTo The number of seconds to seek the playhead to.
     * @type {Object}
     */
    seek: function(iTo) {
        if (!this.video) return;
        this.stopPlayPoll();
        if (iTo < 2)
            iTo = 0;
        else if (iTo > this.options['duration'] - 4)
            iTo = this.options['duration'] - 4;
        if (!isNaN(iTo))
            this.video.Position = this.spanstring(iTo);
        if (this.state == 'buffering' || this.state == 'playing')
            this.play();
        else
            this.pause();
        return this;
    },
    
    /**
     * Set the volume of the video to a specific range (0 - 100)
     * 
     * @param {Number} iVolume
     * @type {Object}
     */
    setVolume: function(iVolume) {
        if (!this.video) return;
        this.video.Volume = iVolume / 100;
        return this;
    },
    
    /**
     * Retrieve the total playtime of the video, in seconds.
     * 
     * @type {Number}
     */
    getTotalTime: function() {
        if (!this.video) return 0;
        return this.options['duration'] || 0;
    },
    
    /**
     * Format a number of seconds to a format the player groks:
     * HH:MM:SS
     * 
     * @param {Number} stp In seconds
     * @type {String}
     */
    spanstring: function(stp) {
        var hrs = Math.floor(stp / 3600);
        var min = Math.floor(stp % 3600 / 60);
        var sec = Math.round(stp % 60 * 10) / 10;
        var str = hrs + ':' + min + ':' + sec;
        return str;
    },
    
    /**
     * Fired when the XAML player object has loaded its resources (including
     * the video file inside the <MediaElement> object and is ready to play.
     * Captures the reference to the player object.
     * 
     * @param {String} pId
     * @param {Object} o      Context of the player ('this')
     * @param {Object} sender XAML Player object instance
     * @type {void}
     */
    onLoadHandler: function(pId, o, sender) {
        // 'o = this' in this case, sent back to us from the Silverlight helper script
        
        o.options['sender'] = sender;
        o.video   = o.options['sender'].findName("VideoWindow");
        o.preview = o.options['sender'].findName("PlaceholderImage");
        var str = {
            'true' : 'UniformToFill',
            'false': 'Uniform',
            'fit'  : 'Fill',
            'none' : 'None'
        }
        o.state = o.video.CurrentState.toLowerCase();
        o.pollTimer;
        o.video.Stretch   = str[o.options['overstretch']];
        o.preview.Stretch = str[o.options['overstretch']];
        
        o.display               = sender.findName("PlayerDisplay");
        o.display.Visibility    = "Visible";
        
        o.video.BufferingTime = o.spanstring(o.options['bufferlength']);
        o.video.AutoPlay      = true;
        
        o.video.AddEventListener("CurrentStateChanged", function() {
            o.handleState('CurrentStateChanged');
        });
        o.video.AddEventListener("MediaEnded", function() {
            o.handleState('MediaEnded');
        });
        o.video.AddEventListener("BufferingProgressChanged", function() {
            o.dispatchEvent('progress', {
                bytesLoaded: Math.round(o.video.BufferingProgress * 100),
                bytesTotal : 0 //TODO: what is the var of this one??
            });
        });
        o.video.AddEventListener("DownloadProgressChanged", function() {}); //FIXME: not used yet!
        if (o.options['image'] != '')
            o.preview.Source = o.options['image'];
            
        o.resizePlayer();
            
        o.dispatchEvent({ type: 'ready' });
        
        if (o.options['usemute'] == 'true')
            o.setVolume(0);
        else
            o.setVolume(o.options['volume']);
        if (o.options['autostart'] == 'true')
            o.play();
        else
            o.pause();
    },
    
    /**
     * Process a 'CurrentStateChanged' event when the player fired it or a
     * 'MediaEnded' event when the video stopped playing.
     * 
     * @param {Object} sEvent Name of the event that was fired (either 'CurrentStateChanged' or 'MediaEnded')
     * @type void
     */
    handleState: function(sEvent) {
        var state = this.video.CurrentState.toLowerCase();
        jpf.status('handleState: ' + this.state + ' --> ' + state);
        
        if (sEvent == "MediaEnded") {
            this.stopPlayPoll();
            this.dispatchEvent({
                type        : 'change',
                playheadTime: Math.round(this.video.Position.Seconds * 10) / 10
            });
            if (this.options['repeat'] == 'true') {
                this.seek(0).play();
            } else {
                this.state              = 'completed';
                this.video.Visibility   = 'Collapsed';
                this.preview.Visibility = 'Visible';
                this.seek(0).pause().dispatchEvent({ type: 'complete' });
            }
        }
        //CurrentStateChanged:
        else if (state != this.state) {
            this.state = state;
            this.options['duration'] = Math.round(this.video.NaturalDuration.Seconds * 10) / 10;
            if (state != "playing" && state != "buffering" && state != "opening") {
                this.dispatchEvent({type: 'stateChange', state: 'paused'})
                  .stopPlayPoll();
            }
            else {
                this.dispatchEvent({type: 'stateChange', state: 'playing'})
                  .startPlayPoll();
            }
        }
    },
    
    /**
     * Start the polling mechanism that checks for progress in playtime of the
     * video.
     * 
     * @type {Object}
     */
    startPlayPoll: function() {
        clearTimeout(this.pollTimer);
        var _self = this;
        this.pollTimer = setTimeout(function() {
            _self.dispatchEvent({
                type        : 'change',
                playheadTime: Math.round(_self.video.Position.Seconds * 10) / 10
            }).startPlayPoll();
        }, 1000);
        return this;
    },
    
    /**
     * Stop the polling mechanism, started by startPlayPoll().
     * 
     * @type {Object}
     */
    stopPlayPoll: function() {
        clearTimeout(this.pollTimer);
        return this;
    },
    
    /**
     * Resize the dimensions of the player object to the ones specified by the
     * <VIDEO> tag width and height properties. The video will be scaled/ stretched
     * accordingly
     * 
     * @type {Object}
     */
    resizePlayer: function() {
        var oSender  = this.options['sender']
        var oContent = oSender.getHost().content;
        var width    = oContent.actualWidth;
        var height   = oContent.actualHeight;
        
        this.stretchElement('PlayerDisplay', width, height)
          .stretchElement('VideoWindow', width,height)
          .stretchElement('PlaceholderImage', width, height)
          .centerElement('BufferIcon', width, height)
		  .centerElement('BufferText', width, height)
		this.display.findName('OverlayCanvas')['Canvas.Left'] = width -
			this.display.findName('OverlayCanvas').Width - 10;
		this.display.Visibility = "Visible";
        
        return this;
    },
    
    /**
     * Position a XAML element in the center of the canvas it is a member of 
     * 
     * @param {String} sName   Name or ID of the element 
     * @param {Number} iWidth  Current width of the canvas
     * @param {Number} iHeight Current height of the canvas
     * @type {Object}
     */
    centerElement: function(sName, iWidth, iHeight) {
		var elm = this.options['sender'].findName(sName);
		elm['Canvas.Left'] = Math.round(iWidth  / 2 - elm.Width  / 2);
		elm['Canvas.Top']  = Math.round(iHeight / 2 - elm.Height / 2);
        return this;
	},

    /**
     * Set the dimensions of a XAML element to be the same of the canvas it is
     * a member of.
     * 
     * @param {Object} sName   Name or ID of the element 
     * @param {Number} iWidth  Current width of the canvas
     * @param {Number} iHeight Current height of the canvas. Optional.
     * @type {Object}
     */
	stretchElement: function(sName, iWidth, iHeight) {
		var elm = this.options['sender'].findName(sName);
		elm.Width = iWidth;
		if (iHeight != undefined)
            elm.Height = iHeight;
        return this;
	}
};
// #endif
