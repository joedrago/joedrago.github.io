// This example shows how you can use the loopscript module in your own node app.

var fs = require("fs");
var loopscript = require("..");
var script = fs.readFileSync("input.ls", { encoding: 'utf-8' });
loopscript.render({
    script: script,
    wavFilename: "output.wav",
    readLocalFiles: true,
    log: {
        verbose: function(text) {
            console.log(text);
        },
        error: function(text) {
            console.error("ERROR: " + text);
        }
    }
});
