var viewFor = require('sdk/view/core').viewFor;
var browserWindows = require('sdk/windows').browserWindows;

var SearchScrub = {

    originalSearchCommand: undefined,

    init: function(browserWindow) {
        if (browserWindow) {
            var _chromeWindow = viewFor(browserWindow);
            if (_chromeWindow) {
                var _searchbar = _chromeWindow.document.getElementById('searchbar');
                if (_searchbar && _searchbar.handleSearchCommand) {
                    this.originalSearchCommand = _searchbar.handleSearchCommand;
                    _searchbar.value = '';
                    _searchbar.handleSearchCommand = function() {
                        var _results = SearchScrub.originalSearchCommand.apply(this, arguments);
                        this.value = '';
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
