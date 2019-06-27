# ------------------------------------------------------------
# An approximation of the beat from Drake's "The Motto"

bpm 100
section # to share ADSR
  adsr 0.005 0.05 0.7 0.05
  tone bass1 -> octave 1
  tone bass2 -> octave 2

sample clap  -> src ../samples/clap.wav
sample snare -> src ../samples/snare.wav
sample hihat -> src ../samples/hihat.wav

loop loop1
  pattern hihat ..x.......x.......x.......x.....
  pattern clap  ....x.......x.......x.......x...
  pattern snare ......x...x...x.x...............
  pattern bass1 Bbbbbb..........................
  pattern bass2 ......HhhhhhDddddd....HhhhJj.Jj.

track song
  pattern loop1 xxxx
