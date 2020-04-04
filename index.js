const gameData = {
  gameStatus: document.querySelector('#game-status'),
  bombField: document.querySelector('#bomb-field'),
  
  btnListener(){
    document.querySelector('#easy').addEventListener('click',()=>{
      gameData.bombField.innerHTML = ''
      model.restart()
      controller.createGame(9, 12)
    },{once:1})
    document.querySelector('#medium').addEventListener('click', () => {
      gameData.bombField.innerHTML = ''
      model.restart()
      controller.createGame(9, 24)
    },{once:1})
    document.querySelector('#hard').addEventListener('click', () => {
      gameData.bombField.innerHTML = ''
      model.restart()
      controller.createGame(12, 50)
    },{once:1})
    document.querySelector('#submit').addEventListener('click', () => {
      let rows = document.querySelector('#game-rows').value
      let bombs = document.querySelector('#game-bombs').value
      if (!isNaN(Number(rows)) & !isNaN(Number(bombs))){
        
        if(Number(bombs) <= 0 || Number(bombs) > Math.pow((rows - 1), 2)){
        alert(`Please enter 1 ~ ${Math.pow((rows - 1), 2)} bombs`)
      } else {
        gameData.bombField.innerHTML = ''
        model.restart()
        controller.createGame(Number(rows), Number(bombs))
      }
      } else{
        alert('Please enter a number')
      }
      
      document.querySelector('#game-rows').value = ''
      document.querySelector('#game-bombs').value = ''
    })
  }
}
const view = {
  //渲染遊戲狀態 
  displayGameStatus() {
    gameData.gameStatus.innerHTML = `
        <div id="total-bomb">
          <div id="bomb-count" class="num-count">0</div>
        </div>
        <div id="face">
        <div id="face-icon">😁</div>
        </div>
        <div id="time">
          <div id="time-count-2" class="num-count">0</div>
          <div id="time-count-3" class="num-count">0</div>
        </div>`
    return
  },
  //  渲染格子
  displayFields(rows) {
    view.displayGameStatus()
    if (rows < 6) rows = 6
    let field = Array.from(Array(Math.pow(rows, 2)).keys())

    gameData.bombField.style.gridTemplateColumns = `${'30px '.repeat(rows)}`
    gameData.bombField.style.gridTemplateRows = `${'30px '.repeat(rows)}`

    field.forEach(item => {
      gameData.bombField.innerHTML += `<div class="field undig" data-position='${(Math.floor(item / rows)) + 1}-${(item % rows) + 1}' data-type='' id=${item}></div>
      `
    })

  },

  // 應該要能 點擊格子remove .undig 插入innerHTML 所以field 要傳什麼才能連結到model
  // 傳入e.target 用e.target.id 找model.fields
  showFieldContent(target) {
    switch (target.dataset.type) {
      case 'Bomb':
        target.classList.remove('undig')
        target.classList.add('dig')
        target.innerHTML = '<i class="fas fa-bomb"></i>'
        alert('Game Over!!')
        view.showBoard()
        break
      case 'Number':
        target.classList.remove('undig')
        target.classList.add('dig')
        target.innerHTML = `${model.fields[target.id].numOfBomb}`
        break

    }


  },

  /**
   * renderTime()
   * 顯示經過的遊戲時間在畫面上。
   */
  renderTime(time) {

    let digiSecond = document.querySelector('#time-count-3')
    let tensSecond = document.querySelector('#time-count-2')
    let newTime = Math.floor((Date.now() - time) / 1000)

    digiSecond.innerText = newTime % 10
    tensSecond.innerText = Math.floor(newTime / 10)


    if (tensSecond.innerText > 99) {
      tensSecond.innerText = 0
    }



  },
  renderBomb(num) {
    document.querySelector('#bomb-count').innerText = num
  },
  renderFace(index) {
    let face = document.querySelector('#face-icon')
    switch (index) {
      case 'Number':
        face.innerText = '\u{1F631}'
        break
      case 'Ocean':
        face.innerText = '😁'
        break
      case 'Bomb':
        face.innerText = '☠'
    }

  },

  // 將所有格子全部點開 炸彈加上紅色背景
  showBoard() {
    document.querySelectorAll('.field').forEach(i => {
      if (i.classList.contains('flag')) {
        i.classList.remove('flag')
        i.innerHTML = ''
      }
      i.classList.remove('undig')
      i.classList.add('dig')
      if (i.dataset.type === 'Bomb') {
        i.style.backgroundColor = '#ef0e0e'
        i.innerHTML = '<i class="fas fa-bomb"></i>'
      } else if (i.dataset.type === 'Number') {
        i.innerHTML = `${model.fields[i.id].numOfBomb}`
      }
    })
  },
  putFlag(index) {
    let bombNum = index
    let flag = '<i class="fas fa-flag"></i>'
    document.querySelectorAll('.field').forEach(i => {
      i.addEventListener('contextmenu', (e) => {
        e.preventDefault()

        if (e.target.classList.contains('undig') && bombNum > 0) {
          if (!e.target.classList.contains('flag')) {
            bombNum--
            view.renderBomb(bombNum)
            e.target.classList.add('flag')
            e.target.classList.remove('undig')
            e.target.innerHTML = flag
          }
        } else if (e.target.classList.contains('flag')) {
          bombNum++
          view.renderBomb(bombNum)
          e.target.classList.remove('flag')
          e.target.classList.add('undig')
          e.target.innerHTML = ''
        } else if (e.target.classList.contains('fa-flag')) {
          bombNum++
          view.renderBomb(bombNum)
          e.target.parentElement.classList.remove('flag')
          e.target.parentElement.classList.add('undig')
          e.target.parentElement.innerHTML = ''
        }
      })
    })
  },
}

const controller = {
  /**
   * createGame()
   * 根據參數決定遊戲版圖的行列數，以及地雷的數量，
   * 一定要做的事情有：
   *   1. 顯示遊戲畫面
   *   2. 遊戲計時
   *   3. 埋地雷
   *   4. 綁定事件監聽器到格子上
   */
  createGame(numberOfRows, numberOfMines) {
    gameData.btnListener()
    if (numberOfRows < 6) numberOfRows = 6
    model.totalRows = numberOfRows
    model.totalBombs = numberOfMines
    view.displayFields(numberOfRows)
    view.renderBomb(model.totalBombs)
    controller.debug()
    view.putFlag(model.totalBombs)
    // 設定type 綁定監聽
    // 第一次點擊之後 才產生model.fields資料 然後設定type
    document.querySelectorAll('.field').forEach(item => {
      if (item.classList.contains('undig')) {
        item.addEventListener('click', controller.dig
        )
      }
    })

    document.querySelector('#face-icon').addEventListener('click', () => {
      gameData.bombField.innerHTML = ''
      model.restart()
      controller.createGame(model.totalRows, model.totalBombs)
      

    })


    // 可以任何地方插旗
    // 拔其後一樣可以按
    // 已經打開的地方不能插旗
    // 插旗後炸彈--

  },

  /**
   * setMinesAndFields()
   * 設定格子的內容，以及產生地雷的編號。
   */
  setMinesAndFields(numberOfMines) {
    model.initFields()
    // set model.mines
    model.setBombsData(numberOfMines)
    // display bombs icon

  },

  // 輸入model資料
  getFieldData() {
    model.setFieldsData(model.totalRows)
  },

  // 依照 type 決定渲染的樣子
  dig(field) {
  // 第一次點擊之後才帶入model.fields資料
    if(model.firstClickId === 0){
      // 將第一次點擊的id紀錄
      model.firstClickId = field.target.id 
      controller.setMinesAndFields(model.totalBombs)
      controller.getFieldData()
      document.querySelectorAll('.field').forEach(item=>{
        item.dataset.type = model.fields[item.id].type
      })
    }

    if (field.target.dataset.type === 'Bomb' && field.target.classList.contains('undig')) {
      view.renderFace(field.target.dataset.type)
      view.showFieldContent(field.target)
      clearInterval(model.clock)
    } else if (field.target.dataset.type === 'Number' && field.target.classList.contains('undig')) {
      model.totalNumber++

      controller.gameFinish(model.totalNumber, model.totalOcean, model.totalRows, model.totalBombs)

      view.renderFace(field.target.dataset.type)
      view.showFieldContent(field.target)

    } else if (field.target.dataset.type === 'Ocean' && field.target.classList.contains('undig')) {
      model.totalOcean++

      controller.gameFinish(model.totalNumber, model.totalOcean, model.totalRows, model.totalBombs)

      field.target.classList.remove('undig')
      field.target.classList.add('dig')
      view.renderFace(field.target.dataset.type)
      controller.spreadOcean(field.target)
    }
    if (field.target.dataset.type === 'Number' || field.target.dataset.type === 'Ocean') {
      if (model.time === 0) {
        model.time = Date.now()
        model.clock = setInterval(() => {
          view.renderTime(model.time)
        }, 200)

      }

    }

  },
  //  如果點擊海洋 展開附近海洋
  spreadOcean(field) {
    let [row, col] = [model.fields[field.id].positionOfRows, model.fields[field.id].positionOfCols]
    let arround = []
    // 找出目標周圍八個位置的節點
    document.querySelectorAll('.field').forEach(item => {
      if (model.getAround(row, col).includes(item.dataset.position)) {
        arround.push(item)
      }
    })
    // 檢查八個節點
    arround.forEach(item => {
      // 如果是ocean 而且"還沒點開 " 將item點開 並帶入spreadocean 再去找他周圍8個
      if (item.classList.contains('undig') && !item.classList.contains('flag')) {
        if (item.dataset.type === 'Ocean') {
          model.totalOcean++
          item.classList.remove('undig')
          item.classList.add('dig')
          controller.spreadOcean(item)
          // 如果是number 點開輸入數字
        } else if (item.dataset.type === 'Number') {
          model.totalNumber++
          item.classList.remove('undig')
          item.classList.add('dig')
          item.innerHTML = `${model.fields[item.id].numOfBomb}`
        }
      }

    })

  },
  debug() {
    document.querySelector('#debug-button').addEventListener('click', () => {
      document.querySelectorAll('.field').forEach(i => {
        if (i.classList.contains('flag')) {
          i.classList.remove('flag')
          i.innerHTML = ''
        }
        i.classList.remove('undig')
        i.classList.add('dig')
        if (i.dataset.type === 'Bomb') {
          i.innerHTML = '<i class="fas fa-bomb"></i>'
        } else if (i.dataset.type === 'Number') {
          i.innerHTML = `${model.fields[i.id].numOfBomb}`
        }
      })
    })
  },
  gameFinish(num, ocean, row, bomb) {
    if (num + ocean === Math.pow(row, 2) - bomb) {
      clearInterval(model.clock)
      alert('Finish')
    }
  }
}

const model = {
  totalRows: 0,
  totalBombs: 0,
  totalOcean: 0,
  totalNumber: 0,
  firstClickId: 0,
  time: 0,
  clock: '',
  mines: [],
  fields: [],
  restart() {
    model.totalOcean = 0
    model.totalNumber = 0
    model.firstClickId = 0
    model.time = 0
    clearInterval(model.clock)
    model.clock = ''
    model.mines = []
    model.fields = []
  },

  // 檢查參數是否為炸彈
  isMine(fieldIdx) {
    return this.mines.includes(fieldIdx)
  },
  // 用隨機洗牌產生炸彈的id
  setBombsData(numberOfMines) {
    let bombNum = 0
    const firstclick = model.firstClickId
    utility.getRandomNumberArray(Math.pow(model.totalRows, 2)).forEach(item => {
      // 如果等於第一次點擊的id 跳過
      if (Number(firstclick) === item){
        
      } else{
        if (bombNum < numberOfMines) {
        model.mines.push(item)
        bombNum++
        }
      }      
    }
    )
  },
  // 初始化fields data 的原型
  initFields() {
    document.querySelectorAll('.field').forEach(item => {
      let data = { type: '', id: item.id, position: '', positionOfRows: 0, positionOfCols: 0, isDigged: 0, numOfBomb: 0 }
      model.fields.push(data)
    })
  },
  // 輸入model.fields 資料
  setFieldsData(totalRows) {
    // 先輸入炸彈type 將numOfBomb 改成''
    model.mines.forEach(item => {
      model.fields[item].type = 'Bomb'
      model.fields[item].numOfBomb = ''
    })
    // 輸入其他資料
    model.fields.forEach(item => {
      // 如果type 不是炸彈 先改為ocean 等輸入numOfBomb 再改
      if (item.type === '') item.type = 'Ocean'
      // 用id算出位置
      item.positionOfRows = (Math.floor(item.id / totalRows)) + 1
      item.positionOfCols = (item.id % totalRows) + 1
      item.position = `${item.positionOfRows}-${item.positionOfCols}`
    })
    model.getBombPosition()
  },
  // 找出炸彈位置 將炸彈周圍八格塞入numOfBomb
  getBombPosition() {
    // 從model.fields 中 找出"所有"炸彈所在的資料
    let bomb = model.fields.filter(item => model.isMine(Number(item.id)))
    let arr = []
    // 將"所有"炸彈周圍八個position 換成array 塞到arr 裡面
    bomb.forEach(item => {
      arr.push(...model.getAround(Number(item.positionOfRows), Number(item.positionOfCols)))
    })

    model.fields.forEach(item => {
      let bombNum = 0
      // 如果arr 包含item.position 代表周圍有炸彈
      if (arr.includes(item.position)) {
        // 每出現一次 代表有一顆炸彈 用filter 跟length 算出有幾顆
        bombNum = arr.filter(i => i === item.position).length
        // 如果numOfBomb = '' 代表本身為炸彈
        if (item.numOfBomb === '') {

        } else {
          // 將炸彈數量和type 輸入到model.fileds裡
          item.numOfBomb += bombNum
          item.type = 'Number'
        }

      }
    })

  },

  // 找出目標位置周圍八個格子的position
  getAround(row, col) {
    let arr = []
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (i === row && j === col) {

        } else {
          if (i > 0 && i <= model.totalRows) {
            if (j > 0 && j <= model.totalRows) {
              arr.push(`${i}-${j}`)
            }
          }
          // 變成 i-j 再從fied foreach找定位 +1
        }
      }
    }
    return arr
  }
}

const utility = {

  getRandomNumberArray(count) {
    const number = [...Array(count).keys()]
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  }
}

controller.createGame(9, 12)



