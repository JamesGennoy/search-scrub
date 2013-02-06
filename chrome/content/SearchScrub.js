var SearchScrub = {
	
	prefs: null,
	mysearch: null,
	seconds: 0,
	wait: 0,
	originalSearchCommand: null,
	
	observe: function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		switch(data) {
			case "seconds":
				var _oldWait = this.wait;
				this.seconds = this.prefs.getIntPref("seconds");
				this.wait = 1;
				if (this.seconds > 0) {
					this.wait = this.seconds * 1000;
				}
				var _oldSearchCommand = this.originalSearchCommand;
				var _waitTime = this.wait; 
				this.mysearch.handleSearchCommand = function(){
					_oldSearchCommand.apply(this);
		    		setTimeout(function(){document.getElementById("searchbar").value = "";}, _waitTime);
		    	};
				break;
		}
	},
		
	init : function () {
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch("extensions.searchscrub.");
	    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.prefs.addObserver("", this, false);
		this.seconds = this.prefs.getIntPref("seconds");
		this.wait = 1;
		if (this.seconds > 0) {
			this.wait = this.seconds * 1000;
		}
		this.mysearch = document.getElementById("searchbar");
	    if(this.mysearch)
	    {
	    	this.originalSearchCommand = this.mysearch.handleSearchCommand;
	    	var _oldSearchCommand = this.originalSearchCommand;
	    	var _waitTime = this.wait; 
	    	this.mysearch.handleSearchCommand = function(){
	    		_oldSearchCommand.apply(this);
	    		setTimeout(function(){document.getElementById("searchbar").value = "";}, _waitTime);
	    	};
	    }
	}
	
	
}

window.addEventListener("load", function(e) { SearchScrub.init(); }, false);
