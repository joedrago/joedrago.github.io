fs = require "fs"

class FastBase64

  constructor: ->
    @chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    @encLookup = []
    for i in [0...4096]
      @encLookup[i] = @chars[i >> 6] + @chars[i & 0x3F]

  encode: (src) ->
    len = src.length
    dst = ''
    i = 0
    while (len > 2)
      n = (src[i] << 16) | (src[i+1]<<8) | src[i+2]
      dst+= this.encLookup[n >> 12] + this.encLookup[n & 0xFFF]
      len-= 3
      i+= 3
    if (len > 0)
      n1= (src[i] & 0xFC) >> 2
      n2= (src[i] & 0x03) << 4
      if (len > 1)
        n2 |= (src[++i] & 0xF0) >> 4
      dst+= this.chars[n1]
      dst+= this.chars[n2]
      if (len == 2)
        n3= (src[i++] & 0x0F) << 2
        n3 |= (src[i] & 0xC0) >> 6
        dst+= this.chars[n3]
      if (len == 1)
        dst+= '='
      dst+= '='

    return dst

class RIFFWAVE
  constructor: (@sampleRate, @data) ->
    @wav = []     # Array containing the generated wave file
    @header =                               # OFFS SIZE NOTES
      chunkId      : [0x52,0x49,0x46,0x46], # 0    4  "RIFF" = 0x52494646
      chunkSize    : 0,                     # 4    4  36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
      format       : [0x57,0x41,0x56,0x45], # 8    4  "WAVE" = 0x57415645
      subChunk1Id  : [0x66,0x6d,0x74,0x20], # 12   4  "fmt " = 0x666d7420
      subChunk1Size: 16,                    # 16   4  16 for PCM
      audioFormat  : 1,                     # 20   2  PCM = 1
      numChannels  : 1,                     # 22   2  Mono = 1, Stereo = 2...
      sampleRate   : @sampleRate,           # 24   4  8000, 44100...
      byteRate     : 0,                     # 28   4  SampleRate*NumChannels*BitsPerSample/8
      blockAlign   : 0,                     # 32   2  NumChannels*BitsPerSample/8
      bitsPerSample: 16,                    # 34   2  8 bits = 8, 16 bits = 16
      subChunk2Id  : [0x64,0x61,0x74,0x61], # 36   4  "data" = 0x64617461
      subChunk2Size: 0                      # 40   4  data size = NumSamples*NumChannels*BitsPerSample/8

    @generate()

  u32ToArray: (i) ->
    return [i&0xFF, (i>>8)&0xFF, (i>>16)&0xFF, (i>>24)&0xFF]

  u16ToArray: (i) ->
    return [i&0xFF, (i>>8)&0xFF]

  split16bitArray: (data) ->
    r = []
    j = 0
    len = data.length
    for i in [0...len]
      r[j++] = data[i] & 0xFF
      r[j++] = (data[i]>>8) & 0xFF

    return r

  generate: ->
    @header.blockAlign = (@header.numChannels * @header.bitsPerSample) >> 3
    @header.byteRate = @header.blockAlign * @sampleRate
    @header.subChunk2Size = @data.length * (@header.bitsPerSample >> 3)
    @header.chunkSize = 36 + @header.subChunk2Size

    if @header.bitsPerSample == 16
      @data = @split16bitArray(@data)

    @wav = @header.chunkId.concat(
      @u32ToArray(@header.chunkSize),
      @header.format,
      @header.subChunk1Id,
      @u32ToArray(@header.subChunk1Size),
      @u16ToArray(@header.audioFormat),
      @u16ToArray(@header.numChannels),
      @u32ToArray(@header.sampleRate),
      @u32ToArray(@header.byteRate),
      @u16ToArray(@header.blockAlign),
      @u16ToArray(@header.bitsPerSample),
      @header.subChunk2Id,
      @u32ToArray(@header.subChunk2Size),
      @data
    )
    fb = new FastBase64
    @base64Data = fb.encode(@wav)
    @dataURI = 'data:audio/wav;base64,' + @base64Data

  raw: ->
    return new Buffer(@base64Data, "base64")

writeWAV = (filename, sampleRate, samples) ->
  wave = new RIFFWAVE sampleRate, samples
  fs.writeFileSync(filename, wave.raw())
  return true

makeDataURI = (sampleRate, samples) ->
  wave = new RIFFWAVE sampleRate, samples
  return wave.dataURI

b64toBlob = (b64Data, contentType, sliceSize) ->
  contentType = contentType || ''
  sliceSize = sliceSize || 512

  byteCharacters = atob(b64Data)
  byteArrays = []

  for offset in [0...byteCharacters.length] by sliceSize
    slice = byteCharacters.slice(offset, offset + sliceSize)

    byteNumbers = new Array(slice.length)
    for i in [0...slice.length]
      byteNumbers[i] = slice.charCodeAt(i)

    byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)

  blob = new Blob(byteArrays, {type: contentType})
  return blob

makeBlobUrl = (sampleRate, samples) ->
  wave = new RIFFWAVE sampleRate, samples
  blob = b64toBlob(wave.base64Data, "audio/wav")
  return URL.createObjectURL(blob)

module.exports =
  RIFFWAVE: RIFFWAVE
  writeWAV: writeWAV
  makeDataURI: makeDataURI
  makeBlobUrl: makeBlobUrl
