module.exports =

  first: """
# ------------------------------------------------------------
# Your first LoopScript. Click "Compile" below to start!

tone note1
  duration 250
  octave 4
  note C

tone bass1
  duration 250
  octave 1
  note B

loop loop1
  pattern note1 x.......x.......
  pattern bass1 ....x.......x...

"""

  notes: """
# ------------------------------------------------------------
# Note overrides!

# H-L are the black keys:
#     H I   J K L
#    C D E F G A B

# Try setting the duration to 100
tone note1
  adsr 0.005 0.05 0.7 0.05
  duration 250

# Samples can have their notes overridden too!
sample ding
  src samples/ding_e.wav
  srcnote e

loop loop1
  pattern note1 b.a.g.a.b.b.b...

loop loop2
  pattern ding b.a.g.a.b.b.b...

track song
  pattern loop1 x
  pattern loop2 .x

"""

  motto: """
# ------------------------------------------------------------
# An approximation of the beat from Drake's "The Motto"

bpm 100
section # to share ADSR
  adsr 0.005 0.05 0.7 0.05
  tone bass1 -> octave 1
  tone bass2 -> octave 2

sample clap  -> src samples/clap.wav
sample snare -> src samples/snare.wav
sample hihat -> src samples/hihat.wav

loop loop1
  pattern hihat ..x.......x.......x.......x.....
  pattern clap  ....x.......x.......x.......x...
  pattern snare ......x...x...x.x...............
  pattern bass1 Bbbbbb..........................
  pattern bass2 ......HhhhhhDddddd....HhhhJj.Jj.

track song
  pattern loop1 xxxx

"""

  length: """
# ------------------------------------------------------------
# Showing off various note lengths using caps and lowercase
# Also shows what ADSR can do!

tone note1
  adsr 0.005 0.05 0.7 0.05

tone note2
  # Note: Only the first tone has ADSR

# If you use any letters other than "x" on a tone pattern, you override its
# note with the note listed. Also, if you use any capital letters in a pattern,
# you override the length of that note with the number of matching lowercase
# letters following it.

loop loop1
  pattern note1 GgggggggFfffff..AaaaBbb.Cc..D...

loop loop2
  pattern note2 GgggggggFfffff..AaaaBbb.Cc..D...

track song
  pattern loop1 x.
  pattern loop2 .x

"""

  chocobo: """
# ------------------------------------------------------------
# The Chocobo Theme (first part only)

bpm 125

section Tone (in a section to share ADSR)
  adsr 0.005 0.05 0.7 0.05
  tone chocobo1
    octave 5
  tone chocobo2
    octave 4

loop loop1
 pattern chocobo1 Dddd......Dd..........................................D.E.Ffffff...
 pattern chocobo2 ....BbGgEe..BbGgBb..Gg..Bbbbbb.AaGgGAG.F.Gggggg.F.GgGB.............

track song
  pattern loop1 xx
"""

  kick: """
# ------------------------------------------------------------
# Bass kick (mixing a simple kick with a sustained bass sine)
# Try changing 'freq' to anywhere in 55-80, and/or 'duration'

tone note1
  adsr 0.005 0.05 0.7 0.05
  freq 60
  duration 1500

sample kick
  src samples/kick3.wav

track BassKick
  pattern note1 x
  pattern kick  x

"""

  kickpattern: """
# ------------------------------------------------------------
# Simple kick pattern

bpm 90

tone note1
  adsr 0.005 0.05 0.7 0.05
  octave 1
  duration 1500

sample kick
  src samples/kick3.wav

sample clap
  src samples/clap.wav

loop loop1
  pattern clap  ....x.......x...
  pattern note1 b.b...b.b.b.....
  pattern kick  x.x...x.x.x.....

track derp
  pattern loop1 xxxx

"""

  wiggle: """
# ------------------------------------------------------------
# A silly approximation of Jason Derulo's Wiggle

bpm 82

tone bass
  adsr 0.005 0.05 0.7 0.05
  duration 1500
  octave 2

sample kick
  src samples/kick3.wav

sample snap
  volume 0.5
  src samples/snap.wav

loop loop1
  pattern snap ....x.......x...
  pattern kick x..x..x.........
  pattern bass a..f..e.........

track wiggle
  pattern loop1 xxxx
"""

  gambino3005: """
# ------------------------------------------------------------
# Childish Gambino - 3005 (intro)

bpm 83

sample z1   -> src samples/3005_zap1.wav
sample z2   -> src samples/3005_zap2.wav
sample z3   -> src samples/3005_zap3.wav
sample rim  -> src samples/3005_rim.wav
sample kick -> src samples/kick3.wav

tone bass
  adsr 0.005 0.05 0.9 0.5
  duration 1500
  freq 55
  volume 1.2

loop zaploop
  pattern z1 x..x..x.........................
  pattern z2 ........x..x..x.........x..x..x.
  pattern z3 ................x..x..x.........

loop rimloop
  pattern rim ....x..x.x..x.......x..x.x..x...

loop bassloop
  pattern kick x.....x...x.....x.....x...x.....
  pattern bass x.....x...x.....x.....x...x.....

track 3005
  pattern zaploop  xxxxxxxxxx
  pattern rimloop  ..xx..xxxx
  pattern bassloop ....xxxxxx

"""