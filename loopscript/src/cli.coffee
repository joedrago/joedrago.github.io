fs = require 'fs'

verboseMode = false

syntax = ->
  console.error "Syntax: loopscript [-v] file.loopscript outputFilename [sound name]\n"
  console.error "        Sound name defaults to the last sound defined in the LoopScript."
  console.error "        -h,--help         This help output"
  console.error "        -v,--verbose      Verbose output"
  process.exit(1)

log =
  verbose: (text) ->
    if verboseMode
      console.log text
  error: (text) ->
    console.error "ERROR: " + text

main = ->
  args = require('minimist')(process.argv.slice(2), {
    boolean: ['h', 'v']
    alias:
      help: 'h'
      verbose: 'v'
  })
  if args.help or args._.length < 2 or args._.length > 3
    syntax()

  which = null
  inputFilename = args._[0]
  wavFilename = args._[1]
  if args._.length > 2
    which = args._[2]

  verboseMode = args.v

  log.verbose "Reading #{inputFilename}"
  script = fs.readFileSync inputFilename, { encoding: 'utf-8' }

  loopscript = require "./loopscript"
  loopscript.render {
    script: script
    log: log
    wavFilename: wavFilename
    which: which
    readLocalFiles: true
  }

  log.verbose "Wrote #{wavFilename}"

module.exports =
  main: main
