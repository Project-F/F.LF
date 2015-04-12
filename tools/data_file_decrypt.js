var fs = require('fs');
var converter = require('./data_file_converter.js');

var args = process.argv.slice(2);
if( args.length==0)
	throw "Usage: nodejs data_file_decrypt.js FILE...";
var key = "odBearBecauseHeIsVeryGoodSiuHungIsAGo";

for( var i=0; i<args.length; i++)
{
	decrypt_file(args[i])
}

function decrypt_file(input_file)
{
	var buffer = fs.readFileSync(input_file, {encoding:'ascii'});
	var output = [];
	for( var i=123; i<buffer.length; i++)
	{
		var b = buffer.charAt(i);
		var B = b.charCodeAt(0) - key.charAt((i-123)%key.length).charCodeAt(0);
		if( B<0)
			B += 128;
		output.push(String.fromCharCode(B));
	}
	output = output.join('');
	output_file = input_file.split('.');
	output_file.pop();
	output_file = output_file.join('.');
	console.log(output_file)
	fs.writeFileSync(output_file+'.txt', output, {encoding:'ascii'});
	fs.writeFileSync(output_file+'.js', converter.convert(output), {encoding:'ascii'});
}

