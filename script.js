const NUMBER_OF_PIECES_HORIZONTAL = 7;
const NUMBER_OF_PIECES_VERTICAL = 7;
const PUZZLE_HOVER_TINT = '#E93D8F';
const PUZZLE_TIMEOUT = 180; //Time in seconds

//Declare variables
var canvas;
var stage;
var img;
var pieces;
var grid;
var puzzleWidth;
var puzzleHeight;
var pieceWidth;
var pieceHeight;
var currentPiece;
var currentDropPiece;
var mouse;
var horizontalBeginning;
var verticalBeginning;
var clockInterval;

//Declare game preparing functions
function init() {
    img = new Image();
    img.addEventListener('load', onImage, false);
    img.src = "mcym_logo.png";
}

function onImage(e) {
    pieceWidth = Math.floor(img.width / NUMBER_OF_PIECES_HORIZONTAL);
    pieceHeight = Math.floor(img.height / NUMBER_OF_PIECES_VERTICAL);
    puzzleWidth = pieceWidth * NUMBER_OF_PIECES_HORIZONTAL;
    puzzleHeight = pieceHeight * NUMBER_OF_PIECES_VERTICAL;
    setCanvas();
    initPuzzle();
}

function setCanvas() {
    //set main puzzle canvas
    canvas = document.getElementById('ukladanka');
    stage = canvas.getContext('2d');
    var parentHeight = canvas.parentElement.clientHeight;
    var parentStyle = window.getComputedStyle(canvas.parentElement);
    var parentPaddingX = parseFloat(parentStyle.paddingLeft) + parseFloat(parentStyle.paddingRight);
    parentWidth = canvas.parentElement.clientWidth - parentPaddingX;
    canvas.width = parentWidth;
    canvas.height = parentHeight;
    canvas.style.border = "1px solid black";
    horizontalBeginning = canvas.width / 2 - puzzleWidth / 2;
    verticalBeginning = canvas.height / 2 - puzzleHeight / 2;
}



function initPuzzle() {
    console.log('insdie initPuzzle');
    pieces = [];
    grid = [];
    mouse = { x: 0, y: 0 };
    currentPiece = null;
    currentDropPiece = null;
    stage.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, horizontalBeginning, verticalBeginning, puzzleWidth, puzzleHeight);
    buildPieces();
}

function buildPieces() {
    initTheClock();
    var i;
    var piece;
    var gridPiece;
    var xPos = 0;
    var yPos = 0;
    for (i = 0; i < NUMBER_OF_PIECES_HORIZONTAL * NUMBER_OF_PIECES_VERTICAL; i++) {
        piece = {};
        gridPiece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        pieces.push(piece);

        gridPiece.xPos = xPos + horizontalBeginning - 1;
        gridPiece.yPos = yPos + verticalBeginning - 1;
        grid.push(gridPiece);
        xPos += pieceWidth;
        if (xPos >= puzzleWidth) {
            xPos = 0;
            yPos += pieceHeight;
        }
    }
    document.onmousedown = shufflePuzzle;
}

function initTheClock() {
    var clock = document.getElementById('puzzleTimer');
    var time = PUZZLE_TIMEOUT;
    var mins = Math.floor(time / 60);
    var secs = time % 60;
    if (mins < 10)
        mins = "0" + mins;
    if (secs < 10)
        secs = "0" + secs;
    clock.innerHTML = mins + ":" + secs;
}

//declare game mechanics functions

function shufflePuzzle() {
    startTheClock();
    stage.clearRect(0, 0, canvas.width, canvas.height);
    var i;
    var piece;
    var gridPiece;
    for (i = pieces.length - 1; i >= 0; i--) {
        piece = pieces[i];
        gridPiece = grid[i];
        var yPos = Math.floor(Math.random() * (canvas.height - pieceHeight));
        var xPos = Math.floor(Math.random() * (horizontalBeginning - pieceWidth)) + Math.floor(Math.random() * 2) * (horizontalBeginning + puzzleWidth);
        piece.xPos = xPos;
        piece.yPos = yPos;
        // stage.strokeRect(gridPiece.xPos, gridPiece.yPos, pieceWidth, pieceHeight);
        stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, xPos, yPos, pieceWidth, pieceHeight);
        // stage.strokeRect(xPos, yPos, pieceWidth,pieceHeight);
    }
    document.onmousedown = onPuzzleClick;
}

function startTheClock() {
    var clock = document.getElementById('puzzleTimer');
    var time = PUZZLE_TIMEOUT;
    clockInterval = setInterval(function() {
        time--;
        var mins = Math.floor(time / 60);
        var secs = time % 60;
        if (mins < 10)
            mins = "0" + mins;
        if (secs < 10)
            secs = "0" + secs;
        clock.innerHTML = mins + ":" + secs;
        if (time < 0) {
            alert("The time is over! End of the game! You can try again.");
            clock.innerHTML = "0";
            clearInterval(clockInterval);
            init();
        }
    }, 1000)
}



function onPuzzleClick(e) {

    //takes cursor position
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;

    currentPiece = checkPieceClicked();
    if (currentPiece != null) {
        stage.clearRect(currentPiece.xPos, currentPiece.yPos, pieceWidth, pieceHeight);
        stage.save();
        stage.globalAlpha = .9;
        stage.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
        stage.restore();
        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDropped;
    }
}

function checkPieceClicked() {
    var i;
    var piece;
    for (i = 0; i < pieces.length; i++) {
        piece = pieces[i];
        if (mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)) {
            //not hit
        } else {
            return piece;
        }
    }
    return null;
}

function updatePuzzle(e) {

    //określanie pozycji kursora
    currentDropPiece = null;
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;

    //Podsiwetlanie kafelka, rysowanie kafelków nieprzeciąganych od nowa
    stage.clearRect(0, 0, canvas.width, canvas.height);
    var i;
    var piece;
    var gridPiece;
    for (i = pieces.length - 1; i >= 0; i--) {
        piece = pieces[i];
        var pieceOperations = true;
        if (piece == currentPiece)
            pieceOperations = false;

        if (pieceOperations) {
            stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
            // stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        }
        if (currentDropPiece == null) {
            if ((mouse.x > piece.xPos && mouse.x < (piece.xPos + pieceWidth)) && (mouse.y > piece.yPos && mouse.y < (piece.yPos + pieceHeight)) && pieceOperations) {
                currentDropPiece = piece;
                currentDropPiece.origin = "pieces";
                stage.save();
                stage.globalAlpha = .4;
                stage.fillStyle = PUZZLE_HOVER_TINT;
                stage.fillRect(currentDropPiece.xPos, currentDropPiece.yPos, pieceWidth, pieceHeight);
                stage.restore();

            }
        }
    }
    for (i = pieces.length - 1; i >= 0; i--) {
        gridPiece = grid[i];
        stage.strokeRect(gridPiece.xPos, gridPiece.yPos, pieceWidth, pieceHeight);
        if ((currentDropPiece == null) && (mouse.x > gridPiece.xPos && mouse.x < (gridPiece.xPos + pieceWidth)) && (mouse.y > gridPiece.yPos && mouse.y < (gridPiece.yPos + pieceHeight))) {
            currentDropPiece = gridPiece;
            currentDropPiece.origin = "grid";
            stage.save();
            stage.globalAlpha = .4;
            stage.fillStyle = PUZZLE_HOVER_TINT;
            stage.fillRect(currentDropPiece.xPos, currentDropPiece.yPos, pieceWidth, pieceHeight);
            stage.restore();
        }
    }

    if (pieceOperations) {
        //rysowanie kafelka przeciąganego
        stage.save();
        stage.globalAlpha = .6;
        stage.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
        stage.restore();
        // stage.strokeRect(mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    }
}

function pieceDropped(e) {
    document.onmousemove = null;
    document.onmouseup = null;
    if (currentDropPiece != null) {
        var tmp = { xPos: currentDropPiece.xPos, yPos: currentDropPiece.yPos };
        if (currentDropPiece.origin == "pieces") {
            currentDropPiece.xPos = currentPiece.xPos;
            currentDropPiece.yPos = currentPiece.yPos;
        }
        currentPiece.xPos = tmp.xPos;
        currentPiece.yPos = tmp.yPos;
    } else {
        currentPiece.xPos = mouse.x - pieceWidth / 2;
        currentPiece.yPos = mouse.y - pieceHeight / 2;
    }
    resetPuzzleAndCheckWin();
}

function resetPuzzleAndCheckWin() {
    stage.clearRect(0, 0, canvas.width, canvas.height);
    var gameWin = true;
    var i;
    var piece;
    for (i = pieces.length - 1; i >= 0; i--) {
        piece = pieces[i];
        gridPiece = grid[i];
        // console.log(piece.sx + horizontalBeginning - 1 + " " + gridPiece.xPos);
        // console.log(piece.sy + verticalBeginning - 1 + " " + gridPiece.yPos);
        stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        // stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        // stage.strokeRect(gridPiece.xPos, gridPiece.yPos, pieceWidth, pieceHeight);
        if (piece.xPos != gridPiece.xPos || piece.yPos != gridPiece.yPos) {
            gameWin = false;
            // console.log("piece: " + piece.xPos + ", grid: " + gridPiece.xPos);
        }
    }
    if (gameWin) {
        alert('wygrana! Możesz spróbować od nowa!');
        clearInterval(clockInterval);
        init();
    }
}

// window.onbeforeunload = function() {
//     alert("Dude, are you sure you want to leave? Think of the kittens!");
// }
