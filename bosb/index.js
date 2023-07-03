let mainElement = null
let noSleep = null
let game = null

const save = () => {
  localStorage.setItem("game", JSON.stringify(game))
}

const render = () => {
  let html = "<center><div class=\"toppad\">&nbsp;</div>"
  let allReady = true
  let roundNumber = 1
  for (playerIndex = 0; playerIndex < game.players.length; ++playerIndex) {
    let p = game.players[playerIndex]
    if(!p.ready) {
      allReady = false
    }

    roundNumber = Math.max(roundNumber, p.board.length + 1)

    let extraCol = ""
    if(game.board && (playerIndex < game.players.length - 1)) {
      extraCol += " scorecol"
    }

    html += `
      <div class="col${extraCol}">
        <div class="player" onclick="ac();rename(${playerIndex})">${p.name}</div>
        <div class="score">${p.score}</div>
      `
    if (game.board) {
      html += `
        <table class="board">
      `
        // <tr class="bhead"><td>P</td><td>D</td><td>S</td></tr>
      for(boardIndex = 0; boardIndex < p.board.length; ++boardIndex) {
        let b = p.board[boardIndex]
        let deltaColor = "deltaZero"
        if(b.delta > 0) {
          deltaColor = "deltaNonzero"
        }
        html += `
          <tr class="brow"><td class="bplay">${b.tricks}/${b.bid}</td><td class="bdelta"><span class="${deltaColor}">${b.delta}</span></td><td class="bscore">${b.score}</td></tr>
        `
      }
      html += `
        </table>
      `
    } else if (game.state == 'score') {
      let otherClasses = ""
      if(!p.ready) {
        otherClasses += " notready"
      }
      let tricksColor = "tricksRight"
      if(p.bid != p.tricks) {
        tricksColor = "tricksWrong"
      }
      html += `
        <div class="tricks${otherClasses}" onclick="ac();changeTricks(${playerIndex}, 0)"><span class="${tricksColor}">${p.tricks}</span>/${p.bid}</div>
      `
      html += `
        <div class="bidb" onclick="ac();changeTricks(${playerIndex}, 1)">&#x21E7;</div>
        <div class="bidb" onclick="ac();changeTricks(${playerIndex}, -1)">&#x21E9;</div>
      `
    } else {
      let otherClasses = ""
      if(!p.ready) {
        otherClasses += " notready"
      }
      html += `
        <div class="bid${otherClasses}" onclick="ac();changeBid(${playerIndex}, 0)">${p.bid}</div>
      `
      if(game.state == "bid") {
        html += `
          <div class="bidb" onclick="ac();changeBid(${playerIndex}, 1)">&#x21E7;</div>
          <div class="bidb" onclick="ac();changeBid(${playerIndex}, -1)">&#x21E9;</div>
        `
      }
    }
    html += `
      </div>
    `
  }
  html += "</center>"

  if(game.board) {
    html += `<div class="bl">`
    html += `<div class="button" onclick="ac();newGame()">New Game</div>`
    html += `<div class="button" onclick="ac();addPlayer()">Add</div>`
    html += `<div class="button" onclick="ac();removePlayer()">Remove</div>`
    html += `<div class="button" onclick="ac();hardReset()">Hard Reset</div>`
    html += `</div>`
  }

  let topLeftTitle = ""
  if(game.board) {
    topLeftTitle = "Scoreboard"
  } else if(game.state == 'bid') {
    topLeftTitle = `Round ${roundNumber}: Bidding`
  } else if(game.state == 'round') {
    topLeftTitle = `Round ${roundNumber}`
  } else if(game.state == 'score') {
    topLeftTitle = `Round ${roundNumber}: Scoring`
  }
  html += `<div class="tl" onclick="ac();toggleScoreboard()">${topLeftTitle}</div>`

  if (game.state == 'round') {
    html += `<div class="bl" onclick="ac();endRound()">End Round</div>`
  } else if (allReady) {
    if(game.state == 'score') {
      html += `<div class="br" onclick="ac();endScore()">Finish</div>`
    } else if (game.state == 'bid') {
      html += `<div class="br" onclick="ac();endBid()">Finish</div>`
    }
  }

  mainElement.innerHTML = html

  save()
}

const onAnyClick = () => {
  // console.log("onAnyClick")
  if(!noSleep) {
    console.log("NoSleep Enabled.")
    noSleep = new NoSleep()
    noSleep.enable()
  }
}

const rename = (index) => {
  let newName = prompt(`Change name: ${game.players[index].name}`, game.players[index].name)
  if(newName) {
    game.players[index].name = newName
  }
  render()
}

const changeBid = (index, amount) => {
  game.players[index].bid += amount
  if(game.players[index].bid < 0) {
    game.players[index].bid = 0
  }
  game.players[index].ready = true
  game.state = 'bid'
  render()
}

const changeTricks = (index, amount) => {
  game.players[index].tricks += amount
  if(game.players[index].tricks < 0) {
    game.players[index].tricks = 0
  }
  game.players[index].ready = true
  render()
}

const endBid = () => {
  game.state = "round"
  render()
}

const endRound = () => {
  for (playerIndex = 0; playerIndex < game.players.length; ++playerIndex) {
    let = p = game.players[playerIndex]
    p.ready = false
    p.tricks = p.bid
  }
  game.state = "score"
  render()
}

const endScore = () => {
  let defaultBid = 3
  if(game.players.length > 4) {
    defaultBid = 2
  }
  for (playerIndex = 0; playerIndex < game.players.length; ++playerIndex) {
    let = p = game.players[playerIndex]

    let e = {}
    e.bid = p.bid
    e.tricks = p.tricks
    e.delta = Math.abs(e.tricks - e.bid)
    e.score = p.score + scoreFromDelta(e.delta)
    p.board.push(e)
    p.score = e.score

    p.ready = false
    p.bid = defaultBid
    p.tricks = p.bid
  }
  game.state = "bid"
  render()
}

const scoreFromDelta = (delta) => {
  delta = Math.abs(delta)
  let score = 0
  let inc = 1
  while(delta > 0) {
    score += inc
    ++inc
    --delta
  }
  return score
}

const toggleScoreboard = () => {
  game.board = !game.board
  render()
}

const inGame = () => {
  if(!game) {
    return false
  }

  for (playerIndex = 0; playerIndex < game.players.length; ++playerIndex) {
    let = p = game.players[playerIndex]
    if(p.board.length > 0) {
      return true
    }
  }
  return false
}

const newGame = () => {
  if(!game || (game.players.length < 3)) {
    return
  }
  if(inGame()) {
    if(!confirm("Are you sure you want to start a new game?")) {
      return
    }
  }

  let defaultBid = 3
  if(game.players.length > 4) {
    defaultBid = 2
  }
  for (playerIndex = 0; playerIndex < game.players.length; ++playerIndex) {
    let = p = game.players[playerIndex]
    p.ready = false
    p.bid = defaultBid
    p.tricks = 0
    p.score = 0
    p.board = []
  }
  game.board = false
  game.state = 'bid'
  render()
}

const addPlayer = () => {
  if(game.players.length >= 5) {
    return
  }
  if(inGame()) {
    if(!confirm("Are you sure you want to add a player?")) {
      return
    }
  }

  let defaultBid = 3
  if(game.players.length > 4) {
    defaultBid = 2
  }
  game.players.push({
    name: "Player",
    ready: false,
    bid: defaultBid,
    tricks: 0,
    score: 0,
    board: []
  })

  // let b = game.players[game.players.length-1].board
  // let lastScore = 0
  // for(i = 0; i < 8; ++i) {
  //   let e = {}
  //   e.bid = Math.floor(Math.random() * 8)
  //   e.tricks = Math.floor(Math.random() * (e.bid + 2))
  //   e.delta = Math.abs(e.tricks - e.bid)
  //   e.score = lastScore + scoreFromDelta(e.delta)
  //   lastScore = e.score
  //   b.push(e)
  // }
  // game.players[game.players.length-1].score = lastScore

  render()
}

const removePlayer = () => {
  if(game.players.length < 1) {
    return
  }
  if(inGame()) {
    if(!confirm("Are you sure you want to remove a player?")) {
      return
    }
  }

  game.players.pop()
  render()
}

const hardReset = () => {
  if(game) {
    if(!confirm("Are you sure you want to hard reset?")) {
      return
    }
  }

  game = {
    board: true,
    state: "bid",
    players: []
  }
  for(i = 0; i < 4; ++i) {
    addPlayer()
  }
  render()
}

const init = () => {
  mainElement = document.getElementById('main')
  window.newGame = newGame
  window.addPlayer = addPlayer
  window.removePlayer = removePlayer
  window.hardReset = hardReset
  window.ac = onAnyClick
  window.rename = rename
  window.changeBid = changeBid
  window.changeTricks = changeTricks
  window.endBid = endBid
  window.endRound = endRound
  window.endScore = endScore
  window.toggleScoreboard = toggleScoreboard

  let loadedGame = localStorage.getItem("game")
  if(loadedGame) {
    try {
      let parsedGame = JSON.parse(loadedGame)
      if(parsedGame && parsedGame.state && parsedGame.players) {
        game = parsedGame
        console.log("Successfully loaded game from localStorage.")
      }
    } catch(e) {
    }
  }

  if(!game) {
    hardReset()
  }

  render()
}

window.onload = (event) => {
  init()
}
