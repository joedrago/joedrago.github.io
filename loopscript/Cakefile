# -------------------------------------------------------------------------------
# Modules

# Assumed to be in src/XXXXX.coffee, @is also the require() string
modules = [
  'loopscript'
  'riffwave'
  'freq'
  'examples'
  'beatmaker'
]

pages = [
  'index'
  'play'
  'learn'
  'source'
]

pageTitles =
  index: "Home"
  play: "Play"
  learn: "Learn"
  source: "Source"

# -------------------------------------------------------------------------------
# Build scripts

browserify = require 'browserify'
fs         = require 'fs'
util       = require 'util'
watch      = require 'node-watch'
http       = require 'http'
{spawn}    = require 'child_process'

coffeeName = 'coffee'
if process.platform == 'win32'
  coffeeName += '.cmd'

generateJSBundle = (cb) ->
  name = "loopscript"
  outputDir = "js/"
  b = browserify {
    basedir: outputDir
    extensions: ['coffee']
  }
  b.transform 'coffeeify'
  for module in modules
    b.require('../src/' + module + '.coffee', { expose: "./#{module}" })
  outputFilename = "#{outputDir}#{name}.js"
  bundlePipe = b.bundle({ debug: true })
    .on 'error', (err) ->
      util.log "Error #{err}"
    bundlePipe
      .pipe(require('mold-source-map').transformSourcesRelativeTo(outputDir))
      .pipe(fs.createWriteStream(outputFilename))
      .on 'finish', ->
        util.log "Generated #{outputFilename}"
        cb() if cb?

generateJSLib = (callback) ->
  coffee = spawn coffeeName, ['-c', '-o', 'cli', 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    util.log "Generated CLI lib dir"
    callback?() if code is 0

wrapClass = (token, cls) ->
  return "<span class=\"#{cls}\">#{token}</span>"

wrapToken = (token) ->
  if token.match(/^(tone|loop|track|sample|section)$/)
    return wrapClass(token, 'keyword')
  if token.match(/^(->|;)$/)
    return wrapClass(token, 'operator')
  if token.match(/^(pattern|adsr|reverb|bpm|freq|duration|src|octave|note|volume|clip|srcnote|srcoctave|wave)$/)
    return wrapClass(token, 'command')
  if token.match(/^[\\.a-lA-LxX]{16}$/)
    return wrapClass(token, 'pattern')
  return token

genPrettyExampleCode = (text) ->
  lines = text.split(/\n/);
  pretty = ""
  for line in lines
    commentMatches = line.match(/([^#]*)(#.*)?$/)
    pieces = commentMatches[1].split(/[ ]/g)
    for piece in pieces
      pretty += wrapToken(piece) + " "
    if typeof commentMatches[2] == 'string'
      if commentMatches[2].length > 0
        pretty += "<span class=\"comment\">#{commentMatches[2]}</span>"
    pretty += "\n"
  return pretty

generateHTML = (cb) ->
  header = fs.readFileSync("html/header.html", 'utf-8')
  footer = fs.readFileSync("html/footer.html", 'utf-8')
  for file in pages
    srcText = fs.readFileSync("html/#{file}.src.html", 'utf-8')
    lines = srcText.split('\n')
    dstText = ""
    exampleIndex = 0
    while (line = lines.shift()) != undefined
      line = line.replace(/(\r\n|\n|\r)/gm,"") # strip newlines
      if matches = line.match(/^EXAMPLE\s+(.+)/)
        exampleCode = ""
        exampleIndex++
        while line = lines.shift()
          line = line.replace(/(\r\n|\n|\r)/gm,"") # strip newlines
          if line != 'END'
            exampleCode += line + "\n"
          else
            exampleCode = exampleCode.replace(/\n+$/, "");
            exampleTitle = matches[1]
            exampleCodeSingleLine = exampleCode
            exampleCodeSingleLine = exampleCodeSingleLine.replace(/\n/g, "\\n")
            exampleCodeSingleLine = exampleCodeSingleLine.replace(/"/g, "\\\"")
            prettyExampleCode = genPrettyExampleCode(exampleCode)
            line = """
<div id="exOuter#{exampleIndex}" class="exOuter">
<div id="exTitle#{exampleIndex}" class="exTitle">
#{exampleTitle}
</div>
<div id="exCode#{exampleIndex}" class="exCode well">#{prettyExampleCode}</div>
<div id="exPlayerActions#{exampleIndex}" class="exPlayerActions">
[<a class=\"listenclick\" onclick="useExampleCode#{exampleIndex}(true); return false">Listen Here</a>]
[<a href="#" onclick="useExampleCode#{exampleIndex}(false)">Listen in Playground</a>]
</div>
<div id="exPlayer#{exampleIndex}" class="exPlayer">
</div>
<script>
function useExampleCode#{exampleIndex}(doRender) {
  var exampleCode#{exampleIndex} = "#{exampleCodeSingleLine}";
  if(doRender) {
    render(exampleCode#{exampleIndex}, '#exPlayer#{exampleIndex}', false, false);
  } else {
    var encodedScript = LZString.compressToBase64(exampleCode#{exampleIndex});
    window.location = "play.html?s=" + encodedScript;
  }
}
</script>
</div>
"""
            break;
      dstText += line + "\n"

    interpedHeader = header
    for name in pages
      activeClass = ""
      if name == file
        activeClass = "class=\"active\""
      interpedHeader = interpedHeader.replace("!#{name}!", activeClass)
    interpedHeader = interpedHeader.replace("!title!", pageTitles[file])
    fs.writeFileSync("#{file}.html", interpedHeader + dstText + footer)
    util.log "Generated #{file}.html"
  cb() if cb?

buildEverything = (cb) ->
  generateJSBundle ->
    generateHTML ->
      generateJSLib ->
        cb() if cb

task 'build', 'build html', (options) ->
  buildEverything ->
    util.log "Build complete."

option '-p', '--port [PORT]', 'Dev server port'

task 'server', 'Run server and watch for changed source files to automatically rebuild', (options) ->
  buildEverything ->
    util.log "Watching for changes in src"

    options.port ?= 9000
    util.log "Starting server at http://localhost:#{options.port}/"

    nodeStatic = require 'node-static'
    file = new nodeStatic.Server '.'
    httpServer = http.createServer (request, response) ->
      request.addListener 'end', ->
        file.serve(request, response);
      .resume()
    httpServer.listen options.port

    watch ['src', 'html'], (filename) ->
      util.log "Source code #{filename} changed, regenerating bundle..."
      buildEverything()
