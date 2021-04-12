fs = require 'fs'
{execSync} = require 'child_process'

html = """
  <html>
  <style>
      .commands {
          font-family: monospace;
          white-space: pre;
          background-color: #eee;
          padding: 20px;
          margin-bottom: 20px;
      }

      .imagecontainer {
          display: inline-block;

          margin: 20px;
      }

      .header {
        font-family: monospace;
        font-weight: 900;
        font-size: 1.6em;
      }

      .title {
        font-family: monospace;
        font-weight: 900;
        font-size: 1.2em;
      }
  </style>
  <body>
"""

commands = "<div class=\"commands\">"

images = ""
info = "<div class=\"commands\">"
addImage = (filename, command = null) ->
  if command?
    commands += "#{command}\n"
    console.log "Executing: #{command}"
    execSync(command, { stdio: 'inherit' })
  images += """
    <div class="imagecontainer">
    <div class="title">#{filename}</div>
    <img class="image" src="#{filename}">
    </div>
  """
  if filename.match(/avif$/)
    info += execSync("avifdec --info #{filename}") + "\n"

addTransform = (opts) ->
  cmdline = "avifenc img.png"
  filename = "img"
  if opts.irot?
    filename += "_irot#{opts.irot}"
    cmdline += " --irot #{opts.irot}"
  else
    filename += "_irotN"
  if opts.imir?
    filename += "_imir#{opts.imir}"
    cmdline += " --imir #{opts.imir}"
  else
    filename += "_imirN"
  filename += ".avif"
  cmdline += " #{filename}"
  addImage(filename, cmdline)

addImage("img.png")
addTransform {}
for irot in [null, 0, 1, 2, 3]
  addTransform {
    irot: irot
  }
for imir in [null, 0, 1]
  addTransform {
    imir: imir
  }

commands += "</div>"
info += "</div>"
html += """
  <div class="header">Images:</div>
  #{images}
  <div class="header">Commands:</div>
  #{commands}
  <div class="header">Output From avifdec --info:</div>
  #{info}
  </body>
  </html>
"""
fs.writeFileSync("index.html", html)
