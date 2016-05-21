# wp-shortcodes.js [![Build Status](https://travis-ci.org/ayc/wp-shortcodes.js.svg?branch=master)](https://travis-ci.org/ayc/wp-shortcodes.js)
Render WP style shortcodes with your own custom rules

Inspired by [shortcode.js](https://github.com/nicinabox/shortcode.js)

## Usage

```javascript
var text = "[first name=hello] [second]world![/second]";

var tags = {
	first: function(){
		return this.options.name;
	},
	second: function(){
		return this.contents;
	}
}

var out = new Shortcode(text, tags).get();
console.log(out); // hello world!
```

## How to Test

Tests are run with mocha/chai

```bash
>npm test
```