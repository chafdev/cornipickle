/********************************************************************
  Code auto-generated by Cornipickle. DO NOT EDIT!
 *********************************************************************/

var CornipickleProbe = function()
{
	/**
	 * An array of DOM attributes to include. Results in a smaller
	 * JSON by reporting only attributes that appear in the properties
	 * to evaluate.
	 */
	this.m_attributesToInclude = [/*%%ATTRIBUTE_LIST%%*/];

	/**
	 * An array of tag names attributes to include. Results in a smaller
	 * JSON by reporting only tags that appear in the properties
	 * to evaluate.
	 */
	this.m_tagsToInclude = [/*%%TAG_LIST%%*/];

	/**
	 * Sets the attributes to include in the JSON
	 * @param list An array of DOM attribute names
	 */
	this.setAttributesToInclude = function(list)
	{
		this.m_attributesToInclude = list;
	};

	/**
	 * Sets the tag names to include in the JSON
	 * @param list An array of tag names
	 */
	this.setTagNamesToInclude = function(list)
	{
		this.m_tagsToInclude = list;
	};
	
	/**
	 * Map from unique IDs to element references
	 */
	this.m_idMap = {};

	/**
	 * Serializes the contents of the page. This method recursively
	 * traverses the DOM and produces a JSON structure of some of
	 * its elements' properties
	 * @param n The DOM node to analyze
	 * @param path The path from the root of the DOM, expressed as
	 *   an array of tag names
	 * @param force_inclusion Set to true to force the inclusion of
	 *   n in the result, irrelevant of whether the node should be
	 *   included according to the normal criteria
	 */
	this.serializePageContents = function(n, path, event)
	{
		var current_path = path;
		current_path.push(n.tagName);
		var out = {};
		if (this.includeInResult(n, path) === CornipickleProbe.INCLUDE || n === event.target)
		{
			if (n.tagName)
			{
				// Gives the element a unique ID, if it doesn't have one
				this.registerNewElement(n);
				var pos = cumulativeOffset(n);
				out.tagname = n.tagName.toLowerCase();
				out.cornipickleid = n.cornipickleid;
				out = this.addIfDefined(out, "class", n.className);
				out = this.addIfDefined(out, "id", n.id);
				out = this.addIfDefined(out, "height", n.clientHeight);
				out = this.addIfDefined(out, "width", n.clientWidth);
				out = this.addIfDefined(out, "border", CornipickleProbe.formatBorderString(n));
				out = this.addIfDefined(out, "top", pos.top);
				out = this.addIfDefined(out, "left", pos.left);
				out = this.addIfDefined(out, "bottom", add_dimensions([pos.top, n.clientHeight]));
				out = this.addIfDefined(out, "right", add_dimensions([pos.left,  n.clientWidth]));
				if (n === event.target)
				{
					out.event = this.serializeEvent(event);
				}
				if (n.tagName === "INPUT")
				{
					// Form fields require special treatment
					if (n.type === "text") // Textbox
					{
						// We create a single text child with the box's contents
						out.children = [{
							"tagname" : "CDATA",
							"text" : n.value
						}];
						return out; // No need to recurse
					}
				}
				else if (n.tagName === "BUTTON")
				{
					// We create a single text child with the button's text
					out.children = [{
						"tagname" : "CDATA",
						"text" : n.innerHTML
					}];
					return out; // No need to recurse
				}
			}
			else
			{
				out.tagname = "CDATA";
				out.text = n.nodeValue;
				return out;
			}
		}
		if (this.includeInResult(n, path) !== CornipickleProbe.DONT_INCLUDE_RECURSIVE)
		{
			var in_children = [];
			for (var i = 0; i < n.childNodes.length; i++)
			{
				var child = n.childNodes[i];
				var new_child = this.serializePageContents(child, current_path, event);
				if (!is_empty(new_child))
				{
					in_children.push(new_child);
				}
			}
			if (in_children.length > 0)
			{
				out.children = in_children;
			}
		}
		return out;
	};

	this.addIfDefined = function(out, property_name, property)
	{
		// First check if this attribute must be included in the report
		if (array_contains(this.m_attributesToInclude, property_name))
		{
			// Yes, now check if it is defined 
			if (property !== undefined && property !== "")
			{
				out[property_name] = property;
			}
		}
		return out;
	};

	this.includeInResult = function(n, path)
	{
		if (n.className && n.className.contains("nocornipickle")) // This is the probe itself
		{
			return CornipickleProbe.DONT_INCLUDE_RECURSIVE;
		}
		if (!n.tagName) // This is a text node
		{
			if (n.nodeValue.trim() === "")
			{
				// Don't include nodes containing only whitespace
				return CornipickleProbe.DONT_INCLUDE_RECURSIVE;
			}
			else
			{
				return CornipickleProbe.INCLUDE;
			}
		}
		for (var i = 0; i < this.m_tagsToInclude.length; i++)
		{
			var part = this.m_tagsToInclude[i];
			if (this.matchesSelector(part, n))
			{
				return CornipickleProbe.INCLUDE;
			}
		}
		return CornipickleProbe.DONT_INCLUDE;
	};
	
	/**
	 * Checks whether an element's tag, class and ID name match the
     * CSS selector element.
	 */
	this.matchesSelector = function(selector, n)
	{
		var pat = new RegExp("([\\w\\d]+){0,1}(\\.([\\w\\d]+)){0,1}(#([\\w\\d]+)){0,1}");
		var mat = pat.exec(selector);
		var tag_name = mat[1];
		var class_name = mat[3];
		var id_name = mat[5];
		if (tag_name !== undefined)
		{
			if (!n.tagName || n.tagName.toLowerCase() !== tag_name.toLowerCase())
			{
				return false;
			}
		}
		if (class_name !== undefined)
		{
			if (!n.className)
			{
				return false;
			}
			var class_parts = n.className.split(" ");
			if (!array_contains(class_parts, class_name))
			{
				return false;
			}
		}
		if (id_name !== undefined)
		{
			if (!n.id || n.id !== id_name)
			{
				return false;
			}
		}
		return true;
	};

	this.serializeWindow = function(page_contents)
	{
		return {
			"tagname" : "window",
			"width" : window.innerWidth,
			"height" : window.innerHeight,
			"children" : [ page_contents ]
		};
	};

	this.serializeEvent = function(event)
	{
		//var out = {};
		//out.type = event.type;
		//return out;
		// At the moment, we only return a string with the event's name
		// Eventually, this will be replaced with a more complex structure
		return event.type;
	};

	this.handleEvent = function(event)
	{
		console.log("Click");
		CornipickleProbe.updateTransmitIcon(true);
		// Un-highlight previously highlighted elements
		CornipickleProbe.unHighlightElements();
		// Serialize page contents
		var json = cp_probe.serializePageContents(document.body, [], event);
		json = cp_probe.serializeWindow(json);
		var json_url = encodeURIComponent(JSON.stringify(json, escape_json_string));
		var url = "http://%%SERVER_NAME%%/image?rand=" + Math.round(Math.random() * 1000);
		document.getElementById("cp-image").src = url + "&contents=" + json_url;
		window.setTimeout(CornipickleProbe.handleResponse, CornipickleProbe.refreshDelay);
	};
	
	this.registerNewElement = function(n)
	{
		if (n.cornipickleid !== undefined)
		{
			return;
		}
		n.cornipickleid = CornipickleProbe.elementCounter;
		this.m_idMap[CornipickleProbe.elementCounter] = {
			"element" : n,
			"style" : {}
		};
		CornipickleProbe.elementCounter++;
	};
};

CornipickleProbe.INCLUDE = 0;
CornipickleProbe.DONT_INCLUDE = 1;
CornipickleProbe.DONT_INCLUDE_RECURSIVE = 2;

/**
 * Produces a browser-dependent XmlHttpRequest object
 */
CornipickleProbe.getXhr = function()
{
	var XHRobject = null;
	if (window.XMLHttpRequest)
	{
		//Native XMLHttpRequest
		XHRobject = new XMLHttpRequest();
	}
	else if (window.ActiveXObject)
	{
		//ActiveX XMLHttpRequest (for some Internet Explorer versions)
		XHRobject = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return XHRobject;
};

CornipickleProbe.updateTransmitIcon = function(active)
{
	var icon = document.getElementById("bp_witness_transmit");
	if (typeof icon === 'undefined' || icon === null)
	{
		return;
	}
	if (active === true)
	{
		icon.style.opacity = 1;
	}
	else
	{
		icon.style.opacity = 0.3;
	}
};

/* Obtained from http://stackoverflow.com/a/25078870 */
CornipickleProbe.getStyle = function(elem, prop)
{
	var res = null;
	if (elem.currentStyle)
	{
		res = elem.currentStyle.margin;
	}
	else if (window.getComputedStyle)
	{
		if (window.getComputedStyle.getPropertyValue)
		{
			res = window.getComputedStyle(elem, null).getPropertyValue(prop);
		}
		else
		{
			res = window.getComputedStyle(elem)[prop];
		}
	}
	return res;
};

CornipickleProbe.handleResponse = function()
{
	// Decode 
	var cookie_string = CornipickleProbe.getCookie("cornipickle");
	// eval is evil, but we can't assume JSON.parse is available
	eval("var response = " + decodeURI(cookie_string)); // jshint ignore:line
	if (response["global-verdict"] === "TRUE")
	{
		document.getElementById("bp_witness").style.backgroundColor = "green";
	}
	else if (response["global-verdict"] === "FALSE")
	{
		document.getElementById("bp_witness").style.backgroundColor = "red";
	}
	else
	{
		document.getElementById("bp_witness").style.backgroundColor = "white";
	}
	// Highlight elements, if any
	for (var i = 0; i < response["highlight-ids"].length; i++)
	{
		var list_of_ids = response["highlight-ids"][i];
		for (var j = 0; j < list_of_ids.length; j++)
		{
			var el_id = list_of_ids[j];
			CornipickleProbe.highlightElement(el_id);
		}
	}
	CornipickleProbe.updateTransmitIcon(false);
};

CornipickleProbe.unHighlightElements = function()
{
	document.getElementById("cp-highlight").innerHTML = "";
};

/**
 * Highlights an element that violates a property
 */
CornipickleProbe.highlightElement = function(id)
{
	var el = cp_probe.m_idMap[id].element;
	var offset = cumulativeOffset(el);
	var in_html = document.getElementById("cp-highlight").innerHTML;
	in_html += "<div class=\"cp-highlight-zone\" style=\"pointer-events:none;position:absolute;border:4px solid red;left:" + add_dimensions([offset.left, "-4px"]) + "px;top:" + add_dimensions([offset.top, "-4px"]) + "px;width:" + add_dimensions([el.offsetWidth, "4px"]) + "px;height:" + add_dimensions([el.offsetHeight, "4px"]) + "px\"></div>";
	document.getElementById("cp-highlight").innerHTML = in_html;
};

/**
 * Creates a style string for an element's border.
 * Caveat emptor: only reads the properties for the top border!
 */
CornipickleProbe.formatBorderString = function(elem)
{
	var s_top_style = CornipickleProbe.getStyle(elem, "border-top-style");
	var s_top_colour = CornipickleProbe.getStyle(elem, "border-top-color");
	var s_top_width = CornipickleProbe.getStyle(elem, "border-top-width");
	var out = s_top_style + " " + s_top_colour + " " + s_top_width;
	return out.trim();
};

/**
 * The delay in ms before the probe refreshes its status,
 * after a JSON has been sent to the server. If set too low, the witness
 * processes the cookie before the server has had the time to update it
 */
CornipickleProbe.refreshDelay = 500;

/**
 * A global counter to give a unique ID to every element
 * encountered and reported back to the server
 */
CornipickleProbe.elementCounter = 0;

/**
 * Retrieves the value of a cookie in a cookie string.
 * Found from <a href="http://stackoverflow.com/a/22852843">Stack Overflow</a>
 * @param c_name The cookie's name
 * @return The cookie's value
 */
CornipickleProbe.getCookie = function(c_name)
{
	var c_value = " " + document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1)
	{
		c_value = null;
	}
	else
	{
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1)
		{
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
};

/**
 * Computes the absolute coordinates of an element
 * with respect to the document
 * @param element The element to get the position
 * @return A JSON structure giving the cumulative top and left
 *   properties
 */
var cumulativeOffset = function(element)
{
	var top = 0, left = 0;
	do
	{
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
};

/**
 * Checks if an array contains an element
 * @param a The array
 * @param obj The element
 * @return True or false
 */
var array_contains = function(a, obj)
{
	for (var i = 0; i < a.length; i++)
	{
		if (a[i] === obj)
		{
			return true;
		}
	}
	return false;
};

/**
 * Checks if an object is empty
 */
var is_empty = function(object)
{
	for (var i in object)
	{
		return false;
	}
	return true;
};

var escape_json_string = function(key, value)
{
	if (typeof value === "string" || value instanceof String)
	{
		// Escape some characters left of by encodeURI
		value = value.replace(/&/g, "%26");
		value = value.replace(/=/g, "%3D");
	}
	return value;
};

var add_dimensions = function(dimensions)
{
	var sum = 0;
	for (var i = 0; i < dimensions.length; i++)
	{
		var d = dimensions[i];
		sum += remove_units(d);
	}
	return sum;
};

var remove_units = function(s)
{
	if (typeof s == "string" || s instanceof String)
	{
		s = s.replace("px", "");
	}
	return Number(s);
};


window.onload = function()
{
	cp_probe = new CornipickleProbe();
	var cp_witness_div = document.createElement("div");
	cp_witness_div.id = "cp-witness";
	document.body.appendChild(cp_witness_div);
	document.getElementById("cp-witness").innerHTML = "%%WITNESS_CODE%%";
	//document.getElementById("cp-witness").onclick = cp_probe.handleEvent;
	document.body.onmouseup = function(event) {
		// Wait .25 sec, so that the browser has time to process the click
		window.setTimeout(function() {
			cp_probe.handleEvent(event);
		}, 0.25);
	};
	// Call the probe a first time at startup
	//window.setTimeout(cp_probe.handleEvent, 0.25);
};