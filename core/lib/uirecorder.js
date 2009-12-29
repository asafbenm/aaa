// #ifdef __WITH_UIRECORDER
/**
 * Provides a way to record user actions, store them and play them back.
 * @experimental
 */
apf.uirecorder = {
    isPlaying   : false,
    isRecording : false,
    inited      : false,
    
    playActions : {"mousemove":1, "click":1, "keypress":1},
    playList : [],
    initialState: {},
    
    init : function() {
        if (apf.uirecorder.inited)
            return;

        apf.uirecorder.inited = true;

        // record initial state
        for (var amlNode, id, props, i = 0, l = apf.all.length; i < l; i++) {
            amlNode = apf.all[i]; 
            
            // ignore nodes without supportedProperties
            if (!amlNode.$supportedProperties || amlNode.$supportedProperties.length === 0 || !amlNode.ownerDocument) continue;
            
             
            id = apf.xmlToXpath(amlNode); //(amlNode.id || "") + "_" + amlNode.localName + apf.xmlToXpath(amlNode) + "_" + amlNode.serialize(); //uniqueness: id, localName + position in the tree (apf.getXpathFromNode - in lib/xml.js), serialized state (serialize())
            
            props = [];
            // record data (models)
            if (amlNode.data) {
                props.push({
                    name    : "data", 
                    value   : amlNode.data
                });
            }
            for (var j = 0, jl = amlNode.$supportedProperties.length; j < jl; j++) { //width, height, span, columns, ...
                props.push({
                    name    : amlNode.$supportedProperties[j], 
                    value   : amlNode[amlNode.$supportedProperties[j]]
                });
            }
            
            apf.uirecorder.initialState[id] = props;
        }
        
        /* Form events support */
        document.documentElement.onselect = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onchange = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onsubmit = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onreset = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
       
        /* User interface events support */
        document.documentElement.onfocus = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        document.documentElement.onblur = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        /* Mouse events support */
        document.documentElement.onclick = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            apf.uirecorder.captureAction("click", e);
        }
        
        document.documentElement.ondblclick = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmousedown = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmouseup = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmousemove = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            apf.uirecorder.captureAction("mousemove", e);
        }
        
        document.documentElement.onmouseover = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmouseout = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        /* Keyboard events support for all browsers */
        document.documentElement.onkeyup = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            //apf.uirecorder.captureAction("keypress", e, e.keyCode);
        }
        
        document.documentElement.onkeydown = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onkeypress = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        var mEvents = ["DOMSubtreeModified", "DOMNodeInserted", "DOMNodeRemoved", "DOMNodeRemovedFromDocument",
            "DOMNodeInsertedIntoDocument", "DOMAttrModified", "DOMCharacterDataModified", "DOMActivate"];

        /* ============== Mutation Events ============== */
        /* Support for Mutation Events in FF */
        /*if(apf.isGecko) {
            for (var i = 0, l = mEvents.length; i < l; i++) {
                document.addEventListener(mEvents[i], function(e) {
                    if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                        return;

                    e = e || event;

                    apf.uirecorder.actionStack.push([new Date().getTime(), mEvents[i], e.srcElement || e.target, apf.extend({}, e)]);
                }, false);
            }
        }*/
        /* Support for Mutation events in IE */
        /*else if(apf.isIE) {
            for (var i = 0, l = mEvents.length; i < l; i++) {
                document.attachEvent(mEvents[i], function(e) {
                    if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                        return;
    
                    e = e || event;
    
                    apf.uirecorder.actionStack.push([new Date().getTime(), mEvents[i], e.srcElement || e.target, apf.extend({}, e)]);
                });
            }
        }*/

        /* Support for Mouse Scroll event */
        if(document.addEventListener) {
            /* FF */
            document.addEventListener("DOMMouseScroll", function(e) {
                if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                    return;
    
                e = e || event;
            }, false);
        }
        else {
            /* IE */
            document.onmousewheel = function(e) {
                if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                    return;

                e = e || event;
            };
        }
    },

    /**
     * Checks delta value and creates object to simulate mouse scroll
     * 
     * @param {Object} e   event object
     */
    createMouseWheelEvent : function(e) {
        var delta = null;
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
            if (apf.isOpera)
                delta *= -1;
        }
        else if (e.detail)
            delta = -e.detail / 3;

        return {
            type : apf.isGecko ? "DOMMouseScroll" : (apf.isIE ? "mousewheel" : "DOMMouseScroll"),
            delta : delta
        }
    },

    /**
     * Initiate user interface recorder and start recording
     */
    startRecordTime : 0,
    record : function() {
        apf.uirecorder.startRecordTime = new Date().getTime();
        apf.uirecorder.isRecording = true;
        apf.uirecorder.init();
    },
    
    /**
     * Stop recording and start playing
     */
    startPlayTime : 0,
    play : function() {
        apf.uirecorder.startPlayTime = new Date().getTime();
        apf.uirecorder.isRecording = false;
        apf.uirecorder.isPlaying   = true;

        // restore initial state
        /*
        for (var amlNode, id, props, i = 0, l = apf.all.length; i < l; i++) {
            amlNode = apf.all[i];
            
            if (!amlNode.$supportedProperties || amlNode.$supportedProperties.length === 0 || !amlNode.ownerDocument) continue;
            id = apf.xmlToXpath(amlNode)
            //if (apf.uirecorder.initialState.indexOf(id) == -1) continue;
                
            for (var p = 0, pl = apf.uirecorder.initialState[id].length; p < pl; p++) {
                property = apf.uirecorder.initialState[id].name;
                value    = apf.uirecorder.initialState[id].value;
                amlNode[property] = value;
            }
        }
        */
        
        apf.uirecorder.playList = apf.uirecorder.actionList.slice(0);
        apf.uirecorder.playNextFrame();
    },
    
    /**
     * play next action frame
     */
    playNextFrame2 : function() {
        if (!apf.uirecorder.isPlaying) return;
        if (!apf.uirecorder.playList.length) {
            apf.uirecorder.stop();
            return;
        }
        var cursor = document.getElementById("cursor");
        var action = apf.uirecorder.playList.shift();
        
        if (apf.uirecorder.playActions[action.name]) {
            if (action.name == "mousemove") {
                cursor.setAttribute("class", "");
                apf.tween.multi(cursor, {
                   steps: 40,
                   tweens : [
                        {type : "top",  from : action.start.y, to : action.end.y},
                        {type : "left", from : action.start.x, to : action.end.x}
                   ],
                   onfinish : apf.uirecorder.playNextFrame
                });
                return;
            }
            else if (action.name == "click") {
                var cursorType = (action.htmlElement && ((action.htmlElement.nodeName.toLowerCase() === "input" && action.htmlElement.type === "text") || action.htmlElement.nodeName.toLowerCase() === "textarea"))
                    ? "text"
                    : "click";

                setTimeout(function() {
                    //cursor.style.top = action.mouse.y;
                    //cursor.style.left = action.mouse.x;
                    cursor.setAttribute("class", cursorType);
                }, 200);
                setTimeout(function() {
                    //debugger;
                    //dispatch click event;
                    if (action.amlNode) {
                        action.amlNode.dispatchEvent("click", {noCapture: true});
                        if (action.amlNode.onclick)
                            action.amlNode.onclick();
                    }
                    /*
                    for (var element in action.events) {
                        if (typeof action.events[element].length != "object") continue;
                        for (var amlNode, event, i = 0, l = action.events[element].length; i < l; i++) {
                            amlNode     = action.events[element][i].amlNode;
                            eventName   = action.events[element][i].name;
                            
                            if (eventName != "click")
                                amlNode.dispatchEvent(eventName);
                        }
                    }
                    */
                    /*
                    if (action.amlNode)
                        if (action.amlNode.onclick)
                            action.amlNode.onclick();
                        else
                            action.amlNode.dispatchEvent("click");
                    */
                    if (cursorType == "click")
                        cursor.setAttribute("class", "");
                }, 400);
                setTimeout(function() {
                    apf.uirecorder.playNextFrame();
                }, 600);
                return;
            }
            else if (action.name == "keypress") {
                action.htmlElement.value = action.value;
                apf.uirecorder.playNextFrame();
                return;
            }
        }
        else {
            apf.uirecorder.playNextFrame();
            return;
        }
    },
    
    
    /**
     * Stop recording and playing
     */
    stop : function() {
        apf.uirecorder.isRecording = false;
        apf.uirecorder.isPlaying   = false;
    },
    
    /**
     * Stop recording and playing, clear list of recorded actions
     */
    reset : function() {
        apf.uirecorder.isRecording = false;
        apf.uirecorder.isPlaying   = false;
        apf.uirecorder.playStack   = [];
        apf.uirecorder.actionStack = [];
    },
    
    /**
     * Record user action like mouse clicks, movement of keypress 
     */
    actionList      : [],
    captureAction   : function(eventName, e, value) {
        var htmlElement = e.srcElement || e.target;
        var amlNode     = apf.findHost(htmlElement);
        var xmlNode     = apf.xmldb.findXmlNode(htmlElement, amlNode);

        // time in ms when action is executed
        var time        = new Date().getTime() - apf.uirecorder.startRecordTime;
        var actionObj = {
            time        : time,
            name        : eventName,
            htmlElement : htmlElement,
            amlNode     : amlNode,
            xmlNode     : xmlNode,
            event       : apf.extend({}, e),
        }
        apf.uirecorder.actionList.push(actionObj);
    },
    
    
    /**
     * Play next frame in actionList
     */
    playSpeed       : 1, // multiplier compared to normal speed
    playNextFrame   : function() {
        if (!apf.uirecorder.isPlaying) return;
        if (!apf.uirecorder.playList.length) {
            apf.uirecorder.stop();
            return;
        }

        var cursor = document.getElementById("cursor");
        var cursorMsg = document.getElementById("cursorMsg");
        var elapsedTime = 0;
        setInterval(function() {
            elapsedTime = new Date().getTime() - apf.uirecorder.startPlayTime;
            for (var action, i = 0; i < apf.uirecorder.playList.length; i++) {
                action = apf.uirecorder.playList[i];
                if (action.time / apf.uirecorder.playSpeed <= elapsedTime) {
                    if (["click","mousemove"].indexOf(action.name) > -1) {
                        cursor.style.top = action.event.clientY + "px";
                        cursor.style.left = action.event.clientX + "px";
                        cursorMsg.innerHTML = action.name + " (" + action.event.clientX + ", " + action.event.clientY + ")";
                        apf.uirecorder.playList.splice(i, 1);
                    }
                    // if first action isn't executed yet, it's useless to check the other actions
                    else if (i == 0) {
                        break;
                    }
                }
            }
        }, 10);
/*
        //var action = apf.uirecorder.playList.shift();
        //var delay = (action.time - elapsedTime > 0) ? action.time - elapsedTime : 0;
        setTimeout(function() {
            if (["click","mousemove"].indexOf(action.name) > -1) {
                //debugger;
                cursor.style.top = action.event.clientY + "px";
                cursor.style.left = action.event.clientX + "px";
                clearTimeout(this);
            }
        }, delay);
        apf.uirecorder.playNextFrame();
        return;
*/        
        
    },
    
    prevActionObj   : null,
    eventList       : [],
    initDone        : false,
    ignoreEvents    : { "blur":1,"focus":1,"mouseover":1,"mouseout":1,"mousedown":1,"mouseup":1,
                        "DOMFocusOut":1,"DOMFocusIn":1,"movefocus":1,"DOMAttrModified":1,
                        "xforms-focus":1,"xforms-enabled":1,"xforms-disabled":1,"xforms-readwrite":1,"xforms-readonly":1,"xforms-previous":1,
                        "DOMNodeInserted":1,"DOMNodeInsertedIntoDocument":1,"DOMNodeRemoved":1,"DOMNodeRemovedFromDocument":1,
                        "keyup":1,
                        },
    captureEvent    : function(eventName, e) {
        // ignore event from ignoreEvents list
        //if (apf.uirecorder.ignoreEvents[eventName]) return;
return;
        if (e.noCapture) return;
        var htmlElement, amlNode;
        if (e.htmlEvent || e.srcElement || e.target) {
            htmlElement = e.htmlEvent.srcElement || e.htmlEvent.target || e.srcElement || e.target;
            amlNode     = apf.findHost(htmlElement);
        }
        else if (e.amlNode && e.amlNode.$aml) {
            amlNode = e.amlNode;
        }
        else if (e.currentTarget) {
            if (e.currentTarget.localName) {
                if ("actiontracker|model".indexOf(e.currentTarget.localName) == -1)
                    amlNode = (e.currentTarget.ownerDocument) 
                        ? e.currentTarget 
                        : (e.currentTarget.host)
                            ? e.currentTarget.host
                            : null;
                else
                    targetName == e.currentTarget.localName;
            }
            else if (e.currentTarget.all && e.currentTarget.root === true)
                targetName = "apf";
        }
        if (amlNode && !amlNode.ownerDocument) debugger;
        if (amlNode)
            targetName = apf.xmlToXpath(amlNode); //amlNode.id || amlNode.localName + amlNode.$uniqueId.toString();
            
        if (!targetName) debugger;
        
        //var xmlNode     = apf.xmldb.findXmlNode(htmlElement, amlNode);

        var eventObj = {
            name        : eventName,
            amlNode     : amlNode,
            //xmlNode     : xmlNode,
            event       : e
        }
        //if (eventName == "click") debugger;
        //if (htmlElement)    eventObj.htmlElement    = htmlElement;
        if (e.value)        eventObj.value          = value;
        
        if (!targetName) debugger; 

        if (!apf.uirecorder.eventList[targetName]) apf.uirecorder.eventList[targetName] = [];
        // prevent duplicate events
        if (apf.uirecorder.eventList[targetName][apf.uirecorder.eventList[targetName].length-1] != eventName) 
            apf.uirecorder.eventList[targetName].push(eventObj);
    },
    prevMousePos : null,
    
    captureAction2 : function(eventName, e, value) {
            if (eventName == "keypress" || eventName == "click") {
                var htmlElement = e.srcElement || e.target;
                var amlNode     = apf.findHost(htmlElement);
                var xmlNode     = apf.xmldb.findXmlNode(htmlElement, amlNode);
            }
            
            // get mouse positions
            if (e.clientX) {
                var mouse = {
                    clientX : e.clientX,
                    clientY : e.clientY,
                    offsetX : e.offsetX,
                    offsetY : e.offsetY
                };
            }
            
            setTimeout(function() {
                var changed = false;
                
                // loop throught eventList en look for actions
                var interaction = [];
                for (objName in apf.uirecorder.eventList) {
                    //if (objName.indexOf("actiontracker") == 0) debugger;
                    if (typeof apf.uirecorder.eventList[objName] === "object" && apf.uirecorder.eventList[objName].length) {
                        for (var name, i = 0, l = apf.uirecorder.eventList[objName].length; i < l; i++) {
                            name    = apf.uirecorder.eventList[objName][i].name;
                            aml     = apf.uirecorder.eventList[objName][i].amlNode;
                            
                            if (name === "resize") {
                                interaction.push(aml.localName + " '" + objName + "' resized");
                            }
                            else if (name === "close") {
                                interaction.push(aml.localName + " '" + objName + "' closed");
                            }
                            else if (name === "drag") {
                                interaction.push(aml.localName + " '" + objName + "' dragged");
                            }
                            else if (name === "click") {
                                if (aml.localName == "button")
                                    interaction.push(aml.localName + " '" + objName + " (" + aml.caption + ")" + "' pressed");
                                //else
                                    //interaction.push(amlNode.localName + " '" + objName + "' clicked");
                            }
        /*
                            if (apf.uirecorder.eventList[objName].name === "afterstatechange" > -1 && apf.uirecorder.eventList[objName].indexOf("afterstatechange") > -1 && apf.uirecorder.eventList[objName].indexOf("beforestatechange") < apf.uirecorder.eventList[objName].indexOf("afterstatechange")) {
                                interaction.push(amlNode.localName + " '" + objName + "' state changed (but what?)");
                            }
        */
                            else if (name === "prop.visible" && apf.uirecorder.eventList[objName][i].value) { // && amlNode.localName == "page"
                                interaction.push(aml.localName + " '" + aml.caption + "' opened");
                            }
                            else if (name === "updatestart") {
                                interaction.push(aml.localName + " '" + objName + "' updated (updatestart)");
                            }
                            else if (name === "xmlupdate") {
                                
                            }

                            else if (name === "afteradd") {
                                interaction.push("Data added to " + aml.localName + " '" + objName + "' ");
                            }
                            
                            else if (name === "afterstatechange") {
                                interaction.push("Change state of " + aml.localName + " '" + objName + "' to '" + apf.uirecorder.eventList[objName][i].event.to.value + "' ");
                            }
                            // sortcolumn [columnName]
                            // 
                        }
                    }
                }
                    
                var actionObj = {
                    name        : eventName
                }
                
                if (htmlElement)                        actionObj.htmlElement = htmlElement;

                if (apf.uirecorder.eventList)           actionObj.events      = apf.uirecorder.eventList;
                if (value)                              actionObj.value       = (eventName == "keypress") ? String.fromCharCode(value.toString()) : value;
    
                // check previous action object
                if (apf.uirecorder.prevActionObj) {
                    if (eventName == apf.uirecorder.prevActionObj.name && eventName == "keypress") {
                        actionObj.value = htmlElement.value;//apf.uirecorder.actionList[apf.uirecorder.actionList.length-1].value + String.fromCharCode(value.toString());
                        changed = true;
                    }
                }
                
                if (eventName == "keypress") {
                    interaction.push("Change text to '" + htmlElement.value + "' in " + apf.xmlToXpath(amlNode));
                }
                else if (eventName == "click") {
                    actionObj.mouse = {x: mouse.clientX, y: mouse.clientY};
                }
                
                if (interaction.length)                 actionObj.interaction = interaction;
                if (amlNode)                            actionObj.amlNode = amlNode;
                if (xmlNode)                            actionObj.xmlNode = xmlNode;


                if (eventName == "click" && apf.uirecorder.prevMousePos) {
                    apf.uirecorder.actionList.push({
                        name    : "mousemove",
                        start   : {x: apf.uirecorder.prevMousePos.x, y: apf.uirecorder.prevMousePos.y},
                        end     : {x: mouse.clientX, y: mouse.clientY}
                    });
                }


                if (!changed)
                    // add object to actionList
                    apf.uirecorder.actionList.push(actionObj)
                else
                    // overwrite previous object
                    apf.uirecorder.actionList[apf.uirecorder.actionList.length-1] = actionObj;
                   
                
                apf.uirecorder.prevMousePos = {x: mouse.clientX, y: mouse.clientY};
                apf.uirecorder.prevActionObj = actionObj;
    
                // reset eventList
                apf.uirecorder.eventList = [];
            }, 200);
    }
};

var timeout;
function playFrame() {
    var frame = apf.uirecorder.playStack.shift();

    if(!frame || !apf.uirecorder.isPlaying)
        return;

    var lastTime = frame[0],
        simulate = false,
        src = frame[3],
        prop, e;

    if (apf.isIE) {
        e = document.createEventObject();
        
        for (prop in frame[3]) {
            if (frame[3][prop]) {
                e[prop] = frame[3][prop];
            }
        }

        e.target = frame[2];

        
        switch (src.type) {
            case "mousewheel":
                fireScroll(frame);
                break;
            default:
                //apf.console.info("playing... "+src.type+" - "+src.clientX+" "+src.clientY);
                frame[2].fireEvent(frame[1], e);
                break;
        }
        
    }
    else {
        switch(src.type) {
            case "mousemove":
            case "mouseup":
            case "mousedown":
            case "click":
            case "dblclick":
            case "mouseover":
            case "mouseout":
                e = document.createEvent("MouseEvents");
                e.initMouseEvent(src.type, src.bubbles, src.cancelable, src.view, src.detail, src.screenX,
                    src.screenY, src.clientX, src.clientY, src.ctrlKey, src.altKey,
                    src.shiftKey, src.metaKey, src.button, src.relatedTarget
                );
                /* Little workaround - that values are important for drag&drop (dragdrop.js) */
                apf.event.layerX = src.layerX
                apf.event.layerY = src.layerY
                break;
            case "keyup":
            case "keydown":
            case "keypress":
                e = document.createEvent("KeyboardEvent");
                e.initKeyEvent(src.type, src.bubbles, true, window, 
                    src.ctrlKey, src.altKey, src.shiftKey, src.metaKey, 
                    src.keyCode, src.charCode); 
                break;
            case "select":
            case "change":
            case "submit":
            case "reset":
                e = document.createEvent("HTMLEvents");
                e.initEvent(src.type, src.bubbles, src.cancelable);
                break;
            case "DOMActivate":
            case "resize":
            case "focus":
            case "blur":
                e = document.createEvent("UIEvents");
                e.initUIEvent(src.type, src.bubbles, src.cancelable, e.view, e.detail);
                break;
            /*case "DOMAttrModified":
            case "DOMCharacterDataModified":
            case "DOMNodeInsertedIntoDocument":
            case "DOMNodeRemovedFromDocument":
            case "DOMNodeRemoved":
            case "DOMNodeInserted":
            case "DOMSubtreeModified":
                e = document.createEvent("MutationEvents");
                e.initMutationEvent(src.type, src.bubbles, src.cancelable, src.relatedNode, src.prevValue, src.newValue, src.attrName, src.attrChange);
                break;*/
            case "DOMMouseScroll": //mouse scroll
                fireScroll(frame);
                simulate = true;
                break;
            default:
                apf.console.info("default: " + src.type);
                simulate = true;
                break;
        }

        if (!simulate) {
            frame[2].dispatchEvent(e);
        }
    }

    if (apf.uirecorder.playStack.length && apf.uirecorder.isPlaying) {
        timeout = setTimeout(function() {
            playFrame();
        }, apf.uirecorder.playStack[0][0] - lastTime);
    }
    else {
        apf.uirecorder.stop();
        clearInterval(timeout);
    }
};

function fireScroll(frame) {
    var el = frame[2];

    while (el != document.body && el.scrollHeight == el.offsetHeight) {
        el = el.parentNode || el.parentElement;
    }

    // FF - 39
    // IE - el.offsetHeight / ~(6,7 - 6,8)
    // Chrome - 120
    el.scrollTop = el.scrollTop - (apf.isGecko
        ? 39
        : (apf.isChrome
            ? 120
            : (apf.isIE
                ? Math.round(el.offsetHeight / 6.73)
                : 20))) * frame[3].delta;
}
// #endif