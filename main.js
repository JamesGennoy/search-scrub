var browserWindows = require('sdk/windows').browserWindows;
var clearTimeout = require('sdk/timers').clearTimeout;
var setTimeout = require('sdk/timers').setTimeout;
var simplePrefs = require('sdk/simple-prefs');
var viewFor = require('sdk/view/core').viewFor;

var SearchScrub = {

    originalSearchCommand: undefined,

    init: function(browserWindow) {
        var _seconds = simplePrefs.prefs.seconds;
        if (isNaN(_seconds)) {
            _seconds = 0;
        }
        if (browserWindow) {
            var _chromeWindow = viewFor(browserWindow);
            if (_chromeWindow) {
                var _searchbar = _chromeWindow.document.getElementById('searchbar');
                if (_searchbar && _searchbar.handleSearchCommand) {
                    this.originalSearchCommand = _searchbar.handleSearchCommand;
                    _searchbar.value = '';
                    _searchbar.handleSearchCommand = function() {
                        var _results = SearchScrub.originalSearchCommand.apply(this, arguments);
                        // Clear out an existing timeout
                        if (browserWindow._searchTimeoutId) {
                            clearTimeout(browserWindow._searchTimeoutId);
                            delete browserWindow._searchTimeoutId;
                        }
                        browserWindow._searchTimeoutId = setTimeout(function() {_searchbar.value = ''; delete browserWindow._searchTimeoutId;}, _seconds * 1000);
                        return _results;
                    };
                }
            }
        }
    },

    remove: function(browserWindow) {
        if (browserWindow) {
            var _chromeWindow = viewFor(browserWindow);
            if (_chromeWindow) {
                var _searchbar = _chromeWindow.document.getElementById('searchbar');
                if (_searchbar && _searchbar.handleSearchCommand) {
                    _searchbar.handleSearchCommand = this.originalSearchCommand;
                }
            }
            // Clear out any existing timeouts
            if (browserWindow._searchTimeoutId) {
                clearTimeout(browserWindow._searchTimeoutId);
                delete browserWindow._searchTimeoutId;
            }
        }
    }
};

simplePrefs.on('', function() {
    // Remove and then re-init on exsting windows
    for(var x = 0; x < browserWindows.length; x++) {
        SearchScrub.remove(browserWindows[x]);
        SearchScrub.init(browserWindows[x]);
    }
});

exports.main = function() {
    // Init on any new window
    browserWindows.on('open', SearchScrub.init);

    // Init on exsiting windows
    for(var x = 0; x < browserWindows.length; x++) {
        SearchScrub.init(browserWindows[x]);
    }
};

exports.onUnload = function() {
    // Remove on exsiting windows
    for(var x = 0; x < browserWindows.length; x++) {
        SearchScrub.remove(browserWindows[x]);
    }
};
