/**
 * achoi@hearst.com
 * inspired by: https://github.com/nicinabox/shortcode.js
 * but sans dom
 */
var Shortcode = function(text, tags) {
    if (!text) return;

    this.text = text;
    this.tags = tags;
    this.now = Date.now(); // used to generate a non-orthogonal key

    this.matches = [];
    this.regex = '\\[{name}(\\s[\\s\\S]*?)?\\]' +
        '(?:((?!\\s*?(?:\\[{name}|\\[\\/(?!{name})))[\\s\\S]*?)' +
        '(\\[\/{name}\\]))?';
};

Shortcode.prototype.get = function() {
    this.matchTags();
    this.convertMatchesToNodes();
    return this.replaceNodes();
};

Shortcode.prototype.matchTags = function() {
    var html = this.text;
    var instances;
    var match;
    var re;
    var contents;
    var regex;
    var tag;
    var options;

    for (var key in this.tags) {
        re = this.template(this.regex, {
            name: key
        });
        instances = html.match(new RegExp(re, 'g')) || [];

        for (var i = 0, len = instances.length; i < len; i++) {
            match = instances[i].match(new RegExp(re));
            contents = match[3] ? '' : undefined;
            tag = match[0];
            regex = this.escapeTagRegExp(tag);
            options = this.parseOptions(instances[i]);

            if (match[2]) {
                contents = match[2].trim();
                tag = tag.replace(contents, '').replace(/\n\s*/g, '');
                regex = this.escapeTagRegExp(tag).replace('\\]\\[', '\\]([\\s\\S]*?)\\[');
            }

            var instanceId = key + this.now + '_' + i;

            this.matches.push({
                name: key,
                tag: tag,
                source: instances[i],
                regex: regex,
                options: options,
                contents: contents,
                id: instanceId, // every instance has a unique idenitifer
                placeholderToken: '==SHORTCODE.' + instanceId + '=='
            });
        }
    }
    return this.matches;
};

/**
 * Convert the Matches to replaceable elements
 */
Shortcode.prototype.convertMatchesToNodes = function() {
    var html = this.text;
    var replacer;

    for (var i = 0, len = this.matches.length; i < len; i++) {
        var match = this.matches[i];
        html = html.replace(match.source, match.placeholderToken);
    }
    this.text = html;
    return this.text;
};

/**
 * replaceNodes
 */
Shortcode.prototype.replaceNodes = function() {
    var self = this;
    var match;
    var result;
    var done;
    var fn;

    var replacer = function(result) {
        var re = new RegExp(replaceToken, 'g');
        self.text = self.text.replace(re, result);
    };

    for (var i = 0, len = this.matches.length; i < len; i++) {
        match = this.matches[i];
        var replaceToken = match.placeholderToken;

        fn = this.tags[match.name].bind(match);
        done = replacer.bind(match);
        result = fn(done);

        if (result !== undefined) {
            done(result);
        }

    }

    return this.text;
};

Shortcode.prototype.parseOptions = function(instanceString) {

    if (instanceString) {
        // first, strip brackets

        var openingTag = instanceString.match(/\[[a-zA-Z](.*?[^?])?\]/); // http://stackoverflow.com/a/8038932

        // lets get the opening tag only
        var options;

        if (openingTag){
            var openingTagText = openingTag[0];

            if (openingTagText){
                // robustificate this in order to handle special characters
                // that broke the previous regexp

                // this thing does two passes to get all attrnames
                // this is necessary to capture attributes that contain no value
                // why bother? because that's how it was received
                var attrNames = openingTagText.match(/(\s(\-?\:?[a-zA-Z0-9._]*))/g);

                if (!attrNames){
                    // none found? GTFO
                    return;
                }
                options = {};
                for( var j = 0; j < attrNames.length; j++) {
                    if (!attrNames[i] || true) {
                        var singleAttrName = attrNames[j].trim();
                        options[singleAttrName] = null; // preappoint the attribute
                    }
                }

                //http://stackoverflow.com/a/2482127
                var attrList = openingTagText.match(/([\w\-.:]+)\s*=\s*("[^"]*"|'[^']*'|[\w\-.:]+)/g);

                if (attrList) {

                    for (var i = 0; i < attrList.length; i++) {
                        // time ti interate thru the list...
                        var attrSplit = attrList[i].split(/\=(.+)?/);

                        var prop = attrSplit[0];
                        var value = attrSplit[1];
                        if (value){
                            value = value.replace(/^"(.*)"$/, '$1');
                        }
                        options[prop] = value;
                    }
                    return options;
                }
            }

        }
        return options;
    }

};

Shortcode.prototype.escapeTagRegExp = function(regex) {
    return regex.replace(/[\[\]\/]/g, '\\$&');
};

Shortcode.prototype.template = function(s, d) {
    for (var p in d) {
        s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
    }
    return s;
};

module.exports = Shortcode;