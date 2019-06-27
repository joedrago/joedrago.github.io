LoopScript
==========

Please visit the homepage for documentation and live demos: http://loopscript.com/

Released under the Boost Software License (Version 1.0).

Installation:
-------------

    npm install -g loopscript

Commandline Usage:
------------------

    Syntax: loopscript [-v] file.loopscript outputFilename [sound name]

            Sound name defaults to the last sound defined in the LoopScript.
            -h,--help         This help output
            -v,--verbose      Verbose output

Module Usage:
-------------

    var loopscript = require("loopscript");

    // Writing to WAV file
    loopscript.render({
        script: "tone tone1",
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
