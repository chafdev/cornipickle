/********************************************************************
  Code auto-generated by Cornipickle. DO NOT EDIT!
 *********************************************************************/

/* This code found on http://stackoverflow.com/questions/1480133/how-can-i-get-an-objects-absolute-position-on-the-page-in-javascript
   ----------------- */



/* ----------------- */

var CornipickleProbe = function()
{
	/**
	 * Serializes the contents of the page. This method recursively
	 * traverses the DOM and produces a JSON structure of some of
	 * its elements' properties
	 * @param n The DOM node to analyze
	 * @param path The path from the root of the DOM, expressed as
	 *   an array of tag names 
	 */
	this.serializePageContents = function(n, path)
	{
		var current_path = path;
		current_path.push(n.tagName);
		var out = {};
		if (this.includeInResult(n, path) === CornipickleProbe.INCLUDE)
		{
			if (n.tagName)
			{
				var pos = cumulativeOffset(n);
				out.tagname = n.tagName.toLowerCase();
				out = this.addIfDefined(out, "class", n.className);
				out = this.addIfDefined(out, "id", n.id);
				out = this.addIfDefined(out, "height", n.clientHeight);
				out = this.addIfDefined(out, "width", n.clientWidth);
				out = this.addIfDefined(out, "border", CornipickleProbe.formatBorderString(n));
				out = this.addIfDefined(out, "top", pos.top);
				out = this.addIfDefined(out, "left", pos.left);
				out = this.addIfDefined(out, "bottom", this.addDimensions([pos.top, n.clientHeight]));
				out = this.addIfDefined(out, "right", this.addDimensions([pos.left,  n.clientWidth]));
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
				var new_child = this.serializePageContents(child, current_path);
				// We check if we received the empty object by looking for tagname
				if (new_child.tagname)
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
	
	this.addDimensions = function(dimensions)
	{
		var sum = 0;
		for (var d in dimensions)
		{
			sum += this.removeUnits(d);
		}
		return sum;
	};

	this.removeUnits = function(s)
	{
		if (typeof s == "string" || s instanceof String)
		{
			s = s.replace("px", "");
		}
		return Number(s);
	};

	this.addIfDefined = function(out, property_name, property)
	{
		if (property !== undefined && property !== "")
		{
			out[property_name] = property;
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
		}
		return CornipickleProbe.INCLUDE;
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
		out = {};
		// TODO
		return out;
	};

	this.handleEvent = function()
	{
		console.log("Click");
		CornipickleProbe.updateTransmitIcon(true);
		// Serialize page contents
		var json = cp_probe.serializePageContents(document.body, []);
		json = cp_probe.serializeWindow(json);
		var json_url = encodeURIComponent(JSON.stringify(json, function(key, value) { return value; }));
		var url = "http://%%SERVER_NAME%%/image?rand=" + Math.round(Math.random() * 1000);
		document.getElementById("cp-image").src = url + "&contents=" + json_url;
		window.setTimeout(CornipickleProbe.handleResponse, 1500);
		// The timeout here is 1.5 sec. If set too low, the witness
		// processes the cookie before the server has had the time to update it
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
	CornipickleProbe.updateTransmitIcon(false);
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

window.onload = function()
{
	cp_probe = new CornipickleProbe();
	var cp_witness_div = document.createElement("div");
	cp_witness_div.id = "cp-witness";
	document.body.appendChild(cp_witness_div);
	document.getElementById("cp-witness").innerHTML = "%%WITNESS_CODE%%";
	//document.getElementById("cp-witness").onclick = cp_probe.handleEvent;
	document.body.onmouseup = function() {
		// Wait .25 sec, so that the browser has time to process the click
		window.setTimeout(cp_probe.handleEvent, 0.25);
	};
	// Call the probe a first time at startup
	//window.setTimeout(cp_probe.handleEvent, 0.25);
};