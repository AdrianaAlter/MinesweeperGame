document.addEventListener("DOMContentLoaded", function(){

  Object.prototype.contains = function(target){
    for (var i = 0; i < this.length; i++){
      if (this[i] == target) {
        return true;
      }
    }
    return false;
  };
  Object.prototype.add = function(newEl){
    this[this.length] = newEl;
  };
  Object.prototype.sample = function(){
    var i = Math.floor(Math.random() * this.length);
    return this[i];
  };
  Object.prototype.idxOf = function(target){
    for (var i = 0; i < this.length; i++){
      if (this[i] == target){
        return i;
      }
    }
  };
  Object.prototype.remove = function(target){
    var result = [];
    for (var i = 0; i < this.length; i++){
      if (this[i] != target){
        result.push(this[i]);
      }
    }
    return result;
  };
  Object.prototype.match = function(obj2){
    for (var i = 0; i < obj2.length; i++){
      if (!this.contains(obj2[i])){
        return false;
      }
    }
    for (var j = 0; j < this.length; j++){
      if (!obj2.contains(this[j])){
        return false;
      }
    }
    return true;
  };

  var minesweeper = document.getElementById("minesweeper");
  var rows = document.getElementsByClassName("row");
  var tiles = document.getElementsByClassName("tile");
  var bombs = document.getElementsByClassName("bomb");
  var flags = document.getElementsByClassName("flagged");
  var doneScreen = document.createElement("div");
  var bonusScreen = document.createElement("div");
  var header = document.createElement("h1");
  var header2 = document.createElement("h2");
  var header2 = document.createElement("h2");
  header2.innerHTML = "Congratulations; you have unlocked bonus content!";
  var button = document.createElement("button");
  var bonusButton = document.createElement("button");
  var flipped = document.getElementsByClassName("flipped");
  button.innerHTML = "Replay";
  bonusButton.innerHTML = "Bonus Content";
  bonusButton.className = "bonus-button";
  var flippedCount = 0;
  var score = 0;
  var explosion = new Audio("sounds/explosionSound.wav");
  var pop = new Audio("sounds/pop.wav");
  var won = new Audio("sounds/won.wav");
  var bonusSound = new Audio("sounds/bonusSound.wav");
  var flagSound = new Audio("sounds/flagSound.wav");
  ANIMALS = [
    "cat1",
    "cat2",
    "dog1",
    "dog2",
    "bear1",
    "bear2",
    "penguin1",
    "penguin2",
    "rabbit1",
    "rabbit2",
    "horse1",
    "horse2"
  ];

  setUp();
  button.addEventListener('click', replay);
  bonusButton.addEventListener('click', bonus);

  function replay(){
    minesweeper.innerHTML = "";
    if (minesweeper.children.contains(doneScreen)){
      minesweeper.removeChild(doneScreen);
    }
    if (minesweeper.children.contains(bonusScreen)){
      minesweeper.removeChild(bonusScreen);
    }
    setUp();
  }

  function setUp() {
    for (var i = 0; i < 9; i++) {
      makeRow();
    }
    placeBombs();
    setValue();
    makeHeader(score);
  }
  function makeRow(){
    var row = document.createElement("ul");
    row.className = "row";
    for (var i = 0; i < 9; i++){
      createTile(row);
    }
    minesweeper.appendChild(row);
  }
  function createTile(row){
    var tile = document.createElement("li");
    tile.className = "tile";
    tile.setAttribute("val", 0);
    createMenu(tile);
    // if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
    //   tile.addEventListener('click', function(){
    //     showMenu(tile);
    //     return;
    //   });
    //   tile.children[0].addEventListener('click', hideMenu);
    // }
    tile.addEventListener('mouseenter', showMenu);
    tile.addEventListener('mouseleave', hideMenu);
    row.appendChild(tile);
  }

  function setValue(){
    for (var i = 0; i < bombs.length; i++){
      var neighbors = findNeighbors(bombs[i]);
      for (var j = 0; j < neighbors.length; j++){
        var tile = rows[neighbors[j][0]].children[neighbors[j][1]];
        if (!tile.classList.contains("bomb")){
          var newVal = parseInt(tile.getAttribute("val")) + 1;
          tile.setAttribute("val", newVal);
        }
      }
    }
  }

  function createMenu(tile){
    var menu = document.createElement("section");
    menu.className = "menu";
    var flagToggle = document.createElement("i");
    flagToggle.className = "fa fa-flag";
    var revealButton = document.createElement("i");
    revealButton.className = "fa fa-unlock-alt";
    flagToggle.addEventListener("click", toggleFlagged);
    revealButton.addEventListener("click", handleShow);
    menu.appendChild(flagToggle);
    menu.appendChild(revealButton);
    tile.appendChild(menu);
  }

  function placeBombs(){
    var menus = document.getElementsByClassName("menu");
    var bombCount = 0;
    while (bombCount < 10){
      var tile = tiles.sample();
      if (!tile.classList.contains("bomb")){
        tile.classList.add("bomb");
        bombCount += 1;
      }
    }
  }

  function handleShow(thisTile){
    if (thisTile.tagName === undefined){
      thisTile = this.parentElement.parentElement;
    }
    if (thisTile.classList.contains("flagged")){
      return;
    }
    if (thisTile.classList.contains("bomb")){
      explosion.play();
      gameLost();
    }
    else {
      pop.play();
      showVal(thisTile);
    }
    checkWon();
  }

  function showVal(tile){
    tile.innerHTML = tile.getAttribute("val");
    tile.classList.add("flipped");
    flippedCount += 1;
    if (tile.getAttribute("val") == "0"){
      var neighbors = findNeighbors(tile);
      for (var i = 0; i < neighbors.length; i++){
        var neighborTile = rows[neighbors[i][0]].children[neighbors[i][1]];
        if (!neighborTile.classList.contains("flipped") && !neighborTile.classList.contains("bomb")){
          handleShow(neighborTile);
        }
      }
    }
  }

  function showBomb(thisTile){
    thisTile.classList.add("bombed");
    var img = document.createElement("i");
    img.className = "fa fa-bomb";
    thisTile.appendChild(img);
  }

  function checkWon(){
    if (flipped.length == 71 && flags.length == 10 && bombs.match(flags)){
      gameWon();
    }
  }

  function findNeighbors(thisTile){
    var rowIdx = rows.idxOf(thisTile.parentElement);
    var colIdx = thisTile.parentElement.children.idxOf(thisTile);
    var allNeighbors = [];
    allNeighbors.push([rowIdx - 1, colIdx]);
    allNeighbors.push([rowIdx + 1, colIdx]);
    allNeighbors.push([rowIdx, colIdx + 1]);
    allNeighbors.push([rowIdx, colIdx - 1]);
    allNeighbors.push([rowIdx - 1, colIdx + 1]);
    allNeighbors.push([rowIdx + 1, colIdx + 1]);
    allNeighbors.push([rowIdx - 1, colIdx - 1]);
    allNeighbors.push([rowIdx + 1, colIdx - 1]);

    var neighbors = [];
    for (var i = 0; i < allNeighbors.length; i++){
      var first = allNeighbors[i][0];
      var last = allNeighbors[i][1];
      if (first >= 0 && first <= 8 && last >= 0 && last <= 8 ){
        neighbors.push(allNeighbors[i]);
      }
    }
    return neighbors;
  }

  function showMenu(){
    if (this.children[0]){
      this.children[0].style.display = "block";
    }
  }
  function hideMenu(){
    if (this.children[0]){
      this.children[0].style.display = "none";
    }
  }

  function toggleFlagged(){
    flagSound.play();
    var thisTile = this.parentElement.parentElement;
    if (thisTile.classList.contains("flagged")){
      thisTile.classList.remove("flagged");
      this.className = "fa fa-flag";
      this.parentElement.children[1].className = "fa fa-unlock-alt";
      this.parentElement.children[1].style.cursor = "pointer";
    }
    else {
      thisTile.classList.add("flagged");
      this.className = "fa fa-flag-o";
      this.parentElement.children[1].className = "fa fa-lock";
      this.parentElement.children[1].style.cursor = "default";
    }
    checkWon();
  }

  function showAllBombs(){
    for (var i = 0; i < bombs.length; i++){
      showBomb(bombs[i]);
    }
  }

  function gameLost(){
    score = 0;
    makeHeader(score);
    header.innerHTML = "KABOOM";
    if (doneScreen.children.contains(header2) && doneScreen.children.contains(bonusButton)){
      doneScreen.removeChild(header2);
      doneScreen.removeChild(bonusButton);
    }
    doneScreen.appendChild(header);
    doneScreen.appendChild(button);
    doneScreen.className = "lost";
    showAllBombs();
    minesweeper.appendChild(doneScreen);
  }
  function gameWon(){
    score += 1;
    makeHeader(score);
    header.innerHTML = "YOU WON!";
    doneScreen.className = "won";
    if (score == 5){
      bonusSound.play();
      doneScreen.removeChild(header);
      doneScreen.appendChild(header2);
      doneScreen.removeChild(button);
      doneScreen.appendChild(bonusButton);
    }
    else {
      won.play();
      if (doneScreen.children.contains(header2) && doneScreen.children.contains(bonusButton)){
        doneScreen.removeChild(header2);
        doneScreen.removeChild(bonusButton);
      }
      doneScreen.appendChild(header);
      doneScreen.appendChild(button);
    }
    showAllBombs();
    minesweeper.appendChild(doneScreen);
  }

  function makeHeader(score) {
    if (document.getElementsByTagName("h2").length > 0) {
      var oldScore = document.getElementsByTagName("h2")[0];
      oldScore.parentElement.removeChild(oldScore);
    }
    var scoreHeader = document.createElement("h2");
    scoreHeader.className = "score-header";
    var newScore = score + 1;
    scoreHeader.innerHTML = "Score: " + score;
    document.body.appendChild(scoreHeader);
  }

  function bonus(){
    score = 0;
    minesweeper.removeChild(doneScreen);
    bonusScreen.className = "bonus";
    bonusScreen.style.backgroundImage = "url('./images/" + ANIMALS.sample() + ".png')";
    bonusScreen.appendChild(button);
    minesweeper.appendChild(bonusScreen);
  }

});
