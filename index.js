

const gameData = {
  gameStatus:document.querySelector('#game-status'),
  bombField:document.querySelector('#bomb-field')
}


const view = {
  /**
   * displayFields()
   * 顯示踩地雷的遊戲版圖在畫面上，
   * 輸入的 rows 是指版圖的行列數。
   */displayGameStatus(){
     gameData.gameStatus.innerHTML = `
        <div id="total-bomb">
          <div class="num-count">0</div>
                   
        </div>
        <div id="face"></div>
        <div id="time">
          <div class="num-count">0</div>
          <div class="num-count">0</div>
          <div class="num-count">0</div>
        </div>`
        return
   },
  displayFields(rows) {
    view.displayGameStatus()
    if(rows < 6) rows = 6
    let field = Array.from(Array(Math.pow(rows, 2)).keys())

    gameData.bombField.style.gridTemplateColumns =`${'30px '.repeat(rows)}`
    gameData.bombField.style.gridTemplateRows = `${'30px '.repeat(rows)}`
    
    field.forEach(item => {
      gameData.bombField.innerHTML += `<div class="field undig" data-position='${ (Math.floor(item / rows)) + 1 }-${ (item % rows) + 1 }' data-type='' id=${item}></div>
      `
    })

   },
  /**
   * showFieldContent()
   * 更改單一格子的內容，像是顯示數字、地雷，或是海洋。
   */
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
  renderTime(time) { },

  /**
   * showBoard()
   * 遊戲結束時，或是 debug 時將遊戲的全部格子內容顯示出來。
   */
  showBoard() {
    document.querySelectorAll('.field').forEach(i => {
      i.classList.remove('undig')
      i.classList.add('dig')
      if (i.dataset.type === 'Bomb') {
        i.style.backgroundColor = '#ef0e0e'
        i.innerHTML = '<i class="fas fa-bomb"></i>'
      } else if (i.dataset.type === 'Number') {
        i.innerHTML = `${model.fields[i.id].numOfBomb}`
      }
    })
   }
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
    
    if(numberOfRows < 6) numberOfRows = 6
    model.totalRows = numberOfRows
    model.totalBombs = numberOfMines
    
    view.displayFields(numberOfRows)
    this.setMinesAndFields(numberOfMines)
    this.getFieldData()

    document.querySelectorAll('.field').forEach(item => {
      item.dataset.type = model.fields[item.id].type
      if(item.classList.contains('undig')){
        item.addEventListener('click', controller.dig
        ,{once:1})
      }
      
    })
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
   

  /**
   * getFieldData()
   * 取得單一格子的內容，決定這個格子是海洋還是號碼，
   * 如果是號碼的話，要算出這個號碼是幾號。
   * （計算周圍地雷的數量）
   */
  getFieldData(fieldIdx) {    
    model.setFieldsData(model.totalRows)
   },

  /**
   * dig()
   * 使用者挖格子時要執行的函式，
   * 會根據挖下的格子內容不同，執行不同的動作，
   * 如果是號碼或海洋 => 顯示格子
   * 如果是地雷      => 遊戲結束
   */
  dig(field) {   
    if(field.target.dataset.type === 'Bomb'){
      view.showFieldContent(field.target)
    } else if(field.target.dataset.type === 'Number'){
      view.showFieldContent(field.target)
    } else if (field.target.dataset.type === 'Ocean'){
      field.target.classList.remove('undig')
      field.target.classList.add('dig')
      controller.spreadOcean(field.target)
    }
    
   },

  spreadOcean(field) {
    let [row, col] = [model.fields[field.id].positionOfRows, model.fields[field.id].positionOfCols]
    let arround = []
    document.querySelectorAll('.field').forEach(item =>{
      if(model.getAround(row, col).includes(item.dataset.position)){
        arround.push(item)
      }
    })

    arround.forEach(item =>{
      if(item.dataset.type ==='Ocean' && item.classList.contains('undig')){
        item.classList.remove('undig')
        item.classList.add('dig')
        controller.spreadOcean(item)
      } else if (item.dataset.type === 'Number' && item.classList.contains('undig')){
        item.classList.remove('undig')
        item.classList.add('dig')
        item.innerHTML = `${model.fields[item.id].numOfBomb}`
      }
    })

  }
}

const model = {
  totalRows:0,
  totalBombs:0,

  /**
   * mines
   * 存放地雷的編號（第幾個格子）
   */
  mines: [],
  /**
   * fields
   * 存放格子內容，這裡同學可以自行設計格子的資料型態，
   * 例如：
   * {
   *   type: "number",
   *   number: 1,
   *   isDigged: false
   * }
   */
  fields: [],

  /**
   * isMine()
   * 輸入一個格子編號，並檢查這個編號是否是地雷
   */
  isMine(fieldIdx) {
    return this.mines.includes(fieldIdx)
  },

  setBombsData(numberOfMines){
    let bombNum = 0
    utility.getRandomNumberArray(Math.pow(model.totalRows, 2)).forEach(item => {
      if (bombNum < numberOfMines) {
        model.mines.push(item)
        bombNum++
      }}
    )},
// 給fields data
  initFields(){
    document.querySelectorAll('.field').forEach(item =>{
      let data = {type:'',id:item.id,position:'',positionOfRows:0,positionOfCols:0,isDigged:0,numOfBomb:0}
      model.fields.push(data)
    })
  
  },
  setFieldsData(totalRows){
    model.mines.forEach(item => {
      model.fields[item].type = 'Bomb'
      model.fields[item].numOfBomb = ''
    })

    model.fields.forEach(item=>{
      if(item.type === '') item.type = 'Ocean'
      item.positionOfRows = (Math.floor(item.id / totalRows)) + 1
      item.positionOfCols = (item.id % totalRows) + 1
      item.position =`${item.positionOfRows}-${item.positionOfCols}`
    })
    model.getBombPosition()
  },
// 找出炸彈位置 將炸彈周圍八格塞入numOfBomb
  getBombPosition(){
    // 從model.fields 中 找出"所有"炸彈所在的資料
    let bomb = model.fields.filter(item => model.isMine(Number(item.id)))
    let arr = []
    // 將"所有"炸彈周圍八個position 換成array 塞到arr 裡面
    bomb.forEach(item => {  
      arr.push(...model.getAround(Number(item.positionOfRows),Number(item.positionOfCols)))      
    }) 
    
    model.fields.forEach(item => {
      let bombNum = 0
      // 如果arr 包含item.position 代表周圍有炸彈
      if (arr.includes(item.position)){
        // 每出現一次 代表有一顆炸彈 用filter 跟length 算出有幾顆
        bombNum = arr.filter(i => i === item.position).length
        // 如果numOfBomb = '' 代表本身為炸彈
        if(item.numOfBomb === ''){
          
        } else{
          // 將炸彈數量和type 輸入到model.fileds裡
          item.numOfBomb += bombNum
          item.type = 'Number'
        }
          
      }
    })
    
  },

  // 找出目標位置周圍八個格子的position
  getAround(row, col){
    let arr =[]
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

controller.createGame(10, 10)



