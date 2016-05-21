# wp-shortcodes.js
Render WP style shortcodes with your own custom rules

Inspired by [shortcode.js](https://github.com/nicinabox/shortcode.js)

## Usage

```
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