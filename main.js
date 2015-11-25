var browserWindows = require('sdk/windows').browserWindows;
var clearTimeout = require('sdk/timers').clearTimeout;
var setTimeout = require('sdk/timers').setTimeout;
var simplePrefs = require('sdk/simple-prefs');
var viewFor = require('sdk/view/core').viewFor;

var SearchScrub = {

    originalSearchCommand: undefined,

    timeoutId: undefined,

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
                        if (SearchScrub.timeoutId) {
                            clearTimeout(SearchScrub.timeoutId);
                            SearchScrub.timeoutId = undefined;
                        }
                        SearchScrub.timeoutId = setTimeout(function() {_searchbar.value = '';}, _seconds * 1000);
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
