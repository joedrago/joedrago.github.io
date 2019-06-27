
# -------------------------------------------------------------------------------
# polyfill for window.performance.now() from https://gist.github.com/paulirish/5438650
do ->
  # prepare base perf object
  if typeof window.performance=='undefined'
    window.performance = {}
  if not window.performance.now
    # console.log "polyfilling window.performance.now()"
    nowOffset = +new Date()
    if performance.timing and performance.timing
      nowOffset = performance.timing.navigationStart
    window.performance.now = ->
      now = +new Date()
      return now - nowOffset

# -------------------------------------------------------------------------------
# BeatMaker

class BeatMaker
  constructor: ->
    @reset()

  setInputText: (text) ->
    $("#beatinput").val(text)

  setOutputText: (text) ->
    $("#beatoutput").html(text)

  error: (text) ->
    @setInputText(" ERROR: #{text}")

  reset: (note) ->
    @keyDownCount = 0
    @keyDownTime = {}
    @recording = false
    @notes = []
    note ?= ""
    @setInputText("#{note} Click here and hit use A-Z keys to make a new beat (please loop the full pattern exactly twice)")

  updateRecording: ->
    return if not @recording
    now = window.performance.now()
    if now > (@lastKeyEvent + 2000)
      $("#beatinput").val(" Recording (#{Math.floor(4000 - (now - @lastKeyEvent))} ms left...)...")
    else
      $("#beatinput").val(" Recording...")

  startRecording: ->
    @recording = true
    @updateRecording()

  stopRecording: ->
    recordedNotes = @notes
    @reset(" Recording finished.")
    @generate(recordedNotes)

  keyDown: (key, ts) ->
    return if @keyDownTime.hasOwnProperty(key)
    @lastKeyEvent = window.performance.now()
    if not @recording
      @startRecording()

    # console.log("DOWN: #{key} (#{ts})")
    @keyDownTime[key] = ts
    @keyDownCount++

  keyUp: (key, ts) ->
    return if not @recording
    @lastKeyEvent = window.performance.now()
    # console.log("UP  : #{key} (#{ts})")
    @notes.push {
      key: key
      start: @keyDownTime[key]
      end: ts
    }
    delete @keyDownTime[key]
    @keyDownCount--

  tick: ->
    return if not @recording
    @updateRecording()
    return if @keyDownCount > 0
    now = window.performance.now()
    if now > (@lastKeyEvent + 4000)
      @stopRecording()

  generate: (notes) ->

    notes.sort (a, b) ->
      a.start - b.start

    if (notes.length % 2) != 0
      @error "Odd count of notes! Please loop your beat exactly twice."
      return

    beat = ""

    beatStart = notes[0].start
    noteCount = notes.length >> 1
    beatTime = notes[noteCount].start - beatStart
    beat += "# #{noteCount} notes, total time #{beatTime} seconds\n"

    baseBPM = Math.floor(120000 / beatTime)
    while (baseBPM > 60)
      baseBPM >>= 1
    beat += "# BPM guesses: #{baseBPM}, #{baseBPM * 2}, #{baseBPM * 4}\n"

    beat += "\n# Here is your beat at various levels of granularity:\n"

    keyNotes = {}
    for noteIndex in [0...noteCount]
      note = notes[noteIndex]
      if not keyNotes.hasOwnProperty(note.key)
        keyNotes[note.key] = []
      keyNotes[note.key].push {
        start: note.start - beatStart
        length: note.end - note.start
      }

    pieceCount = 8
    pieceTime = 0
    for loopCount in [0...3]
      pieceCount <<= 1
      console.log "trying to fit in #{pieceCount} pieces"

      beat += "\nloop pattern#{pieceCount}\n"

      pieceTime = beatTime / pieceCount
      for key, notes of keyNotes
        console.log "* fitting key #{key}"
        pieceSeen = []
        for i in [0...pieceCount]
          pieceSeen[i] = false

        for note in notes
          pieceIndex = Math.floor((note.start + (pieceTime / 2)) / pieceTime)
          console.log "piece index for #{note.start} is #{pieceIndex}"
          if pieceSeen[pieceIndex]
            console.log "already saw index #{pieceIndex} for key #{key}, doubling pieceCount"
            loopCount = 0
            continue

      for key, notes of keyNotes
        console.log "* rendering key #{key}"
        pieces = []
        for i in [0...pieceCount]
          pieces[i] = "."

        for note in notes
          pieceIndex = Math.floor((note.start + (pieceTime / 2)) / pieceTime)
          console.log "piece index for #{note.start} is #{pieceIndex}"
          pieces[pieceIndex] = "x"

        beat += "  pattern #{key} " + pieces.join("") + "\n"

    console.log keyNotes

    @setOutputText(beat)

# -------------------------------------------------------------------------------
# main

main = ->
  beatmaker = new BeatMaker

  $('#beatinput').keydown (event) ->
    keyCode = parseInt(event.keyCode)
    if (keyCode < 65) or (keyCode > 90)
      return

    key = String.fromCharCode(event.keyCode)
    now = window.performance.now()
    beatmaker.keyDown(key, now)

  $('#beatinput').keyup (event) ->
    keyCode = parseInt(event.keyCode)
    if (keyCode < 65) or (keyCode > 90)
      return

    key = String.fromCharCode(event.keyCode)
    now = window.performance.now()
    beatmaker.keyUp(key, now)

  setInterval( ->
    beatmaker.tick()
  , 250);

main()
module.exports =
  lel: "playz"
