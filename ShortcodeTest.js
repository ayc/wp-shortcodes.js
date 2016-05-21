var Shortcode = require( './Shortcode.js' );
var expect = require('chai').expect;


describe( 'Shortcode', function(){

	var text = "[youtube]hello[/youtube] - [giphy]foo[/giphy] - [instagram href=123]world[/instagram]";

	var tags = {
		youtube: function(){
			return '<youtube href="'+this.contents+'"></youtube>';
		},
		giphy: function(){
			return '<giphy href="'+this.contents+'"></giphy>';
		},
		instagram: function(){
			return '<p>'+this.contents+'</p><a href="'+this.options.href+'">click</a>';
		},
		soundcloud: function(){
			// just have it output a src
			return this.options.src;
		}
	}


	describe( 'parseOptions', function(){

		it( 'can find legit ones', function(done){
			shortcodeObj = new Shortcode(text,tags);
			var options = shortcodeObj.parseOptions("[test hello=world]")
			expect( options.hello ).to.equal( 'world' );
			done();
		});

		it( 'can find nones', function(done){
			shortcodeObj = new Shortcode(text,tags);
			var options = shortcodeObj.parseOptions()
			expect( options ).to.equal( undefined );
			done();
		});

		it( 'can find an undefined option', function(done){
			shortcodeObj = new Shortcode(text,tags);
			var options = shortcodeObj.parseOptions("[test nothingtoseehere]");
			expect( options.nothingtoseehere ).to.equal( null );
			done();
		});

	});


	describe( 'matchTags', function(){

		it('can find 2 tags', function(done){
			shortcodeObj = new Shortcode(text,tags);
			var foundTags = shortcodeObj.matchTags();
			expect( foundTags[0].name ).to.equal( 'youtube' );
			expect( foundTags[1].name ).to.equal( 'giphy' );
			expect( foundTags[2].name ).to.equal( 'instagram' );
			done();
		});

		it( 'can find contents within tags', function(done){
			shortcodeObj = new Shortcode(text,tags);
			var foundTags = shortcodeObj.matchTags();
			expect( foundTags[0].contents ).to.equal( 'hello' );
			expect( foundTags[1].contents ).to.equal( 'foo' );
			expect( foundTags[2].contents ).to.equal( 'world' );
			done();
		});

		it( 'can find options in instagram only', function(done){
			shortcodeObj = new Shortcode(text,tags);
			var foundTags = shortcodeObj.matchTags();
			expect( foundTags[0].options ).to.equal( undefined );
			expect( foundTags[1].options ).to.equal( undefined );
			expect( foundTags[2].options.href ).to.equal( '123' );
			done();
		});

	})


	describe( 'convertMatchesToNodes', function(){

		it('replaces current text with placeholders', function(done){
			shortcodeObj = new Shortcode(text,tags);
			shortcodeObj.matchTags();

			var now = shortcodeObj.now;
			var output = shortcodeObj.convertMatchesToNodes();
			expect( output ).to.equal( "==SHORTCODE.youtube"+now+"_0== - ==SHORTCODE.giphy"+now+"_0== - ==SHORTCODE.instagram"+now+"_0==" );
			done();
		});

		it('replaces current text with more placeholders', function(done){
			shortcodeObj = new Shortcode('[instagram]hello[/instagram] - [instagram href=123]world[/instagram]',tags);
			shortcodeObj.matchTags();

			var now = shortcodeObj.now;
			var output = shortcodeObj.convertMatchesToNodes();
			expect( output ).to.equal( "==SHORTCODE.instagram"+now+"_0== - ==SHORTCODE.instagram"+now+"_1==" );
			done();
		});

	})


	describe( 'replaceNodes', function(){

		it('replaces nodes with defined tags -should test replaceNodes function', function(done){
			shortcodeObj = new Shortcode(text,tags);
			shortcodeObj.matchTags();
			shortcodeObj.convertMatchesToNodes();
			var output = shortcodeObj.replaceNodes();
			expect( output ).to.equal('<youtube href="hello"></youtube> - <giphy href="foo"></giphy> - <p>world</p><a href="123">click</a>');
			done();
		});

		it('is the final functioning function.', function(done){
			shortcodeObj = new Shortcode(text,tags);

			expect( shortcodeObj.get() ).to.equal('<youtube href="hello"></youtube> - <giphy href="foo"></giphy> - <p>world</p><a href="123">click</a>');
			done();
		})

	});

	describe( 'runusage', function(){
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
		it('should output hello world!', function(){
			expect( out ).to.equal('hello world!');
		});

	});


});