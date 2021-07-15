'use strict'

// Pieces Types
var KING_WHITE = '♔';
var QUEEN_WHITE = '♕';
var ROOK_WHITE = '♖';
var BISHOP_WHITE = '♗';
var KNIGHT_WHITE = '♘';
var PAWN_WHITE = '♙';
var KING_BLACK = '♚';
var QUEEN_BLACK = '♛';
var ROOK_BLACK = '♜';
var BISHOP_BLACK = '♝';
var KNIGHT_BLACK = '♞';
var PAWN_BLACK = '♟';

// The Chess Board
var gBoard;
var gSelectedElCell = null;
var gWhiteKingPos = null
var gBlackKingPos = null
var gIsWhiteTurn = true;

function restartGame() {
    gBoard = buildBoard();
    gIsWhiteTurn = true;
    gWhiteKingPos = {i: 7, j: 4}
    gBlackKingPos = {i: 0, j: 4}
    renderBoard(gBoard);
}

function buildBoard() {
    //build the board 8 * 8
    var board = [];
    for (var i = 0; i < 8; i++) {
        board[i] = [];
        for (var j = 0; j < 8; j++) {
            var piece = ''
            if (i === 1) piece = PAWN_BLACK;
            if (i === 6) piece = PAWN_WHITE;
            board[i][j] = piece;
        }
    }

    board[0][0] = board[0][7] = ROOK_BLACK;
    board[0][1] = board[0][6] = KNIGHT_BLACK;
    board[0][2] = board[0][5] = BISHOP_BLACK;
    board[0][3] = QUEEN_BLACK;
    board[0][4] = KING_BLACK;

    board[7][0] = board[7][7] = ROOK_WHITE;
    board[7][1] = board[7][6] = KNIGHT_WHITE;
    board[7][2] = board[7][5] = BISHOP_WHITE;
    board[7][3] = QUEEN_WHITE;
    board[7][4] = KING_WHITE;
    //console.table(board);
    return board;

}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // figure class name
            var className = ((i + j) % 2 === 0) ? 'white' : 'black';
            var tdId = `cell-${i}-${j}`;

            strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this)">
                            ${cell}
                        </td>`
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}


function cellClicked(elCell) {
    // if the target is marked - move the piece!
    if (elCell.classList.contains('mark') || elCell.classList.contains('hided-mark')) {
        movePiece(gSelectedElCell, elCell);
        cleanBoard();
        return;
    }

    cleanBoard();

    elCell.classList.add('selected');
    gSelectedElCell = elCell;

    // console.log('elCell.id: ', elCell.id);
    var cellCoord = getCellCoord(elCell.id);
    var piece = gBoard[cellCoord.i][cellCoord.j];

    var possibleCoords = [];
    if (gIsWhiteTurn) {
        switch (piece) {
            case ROOK_WHITE:
                possibleCoords = getAllPossibleCoordsRook(cellCoord);
                break;
            case BISHOP_WHITE:
                possibleCoords = getAllPossibleCoordsBishop(cellCoord);
                break;
            case KNIGHT_WHITE:
                possibleCoords = getAllPossibleCoordsKnight(cellCoord);
                break;
            case PAWN_WHITE:
                possibleCoords = getAllPossibleCoordsPawn(cellCoord, piece === PAWN_WHITE);
                break;
            case QUEEN_WHITE:
                possibleCoords = getAllPossibleCoordsQueen(cellCoord);
                break;
            case KING_WHITE:
                possibleCoords = getAllPossibleCoordsKing(cellCoord);
        }
    } else {
        switch (piece) {
            case ROOK_BLACK:
                possibleCoords = getAllPossibleCoordsRook(cellCoord);
                break;
            case BISHOP_BLACK:
                possibleCoords = getAllPossibleCoordsBishop(cellCoord);
                break;
            case KNIGHT_BLACK:
                possibleCoords = getAllPossibleCoordsKnight(cellCoord);
                break;
            case PAWN_BLACK:
                possibleCoords = getAllPossibleCoordsPawn(cellCoord, piece === PAWN_WHITE);
                break
            case QUEEN_BLACK:
                possibleCoords = getAllPossibleCoordsQueen(cellCoord);
                break;
            case KING_BLACK:
                possibleCoords = getAllPossibleCoordsKing(cellCoord);
        }
    }
    markCells(possibleCoords);
}

function movePiece(elFromCell, elToCell) {
    var fromCoord = getCellCoord(elFromCell.id);
    var toCoord = getCellCoord(elToCell.id);
    // update the MODEL
    var piece = gBoard[fromCoord.i][fromCoord.j];
    gBoard[fromCoord.i][fromCoord.j] = '';
    gBoard[toCoord.i][toCoord.j] = isPawnAQueen(toCoord, piece);
    gIsWhiteTurn = !gIsWhiteTurn
    // update the DOM
    elFromCell.innerText = '';
    elToCell.innerText = isPawnAQueen(toCoord, piece);
    // check Checkmate
    if(piece === ((!gIsWhiteTurn) ? KING_WHITE : KING_BLACK)) {
        if(piece === KING_WHITE) gWhiteKingPos = {i: toCoord.i, j: toCoord.j}
        else gBlackKingPos = {i: toCoord.i, j: toCoord.j}
    } else {
        var kingCheck = (!gIsWhiteTurn) ? gBlackKingPos : gWhiteKingPos
        if(getAllPossibleCoordsKing(kingCheck).length === 0 && isCheck(kingCheck).length > 1)
            console.log(`CheckMate!!!!!!!! ${(!gIsWhiteTurn) ? 'White' : 'Black'} Win!`, ) 
        //else if isCheck(kinkcheck) for arr do isCheck on the options to block..... if there is true is not checkmate

    }
}

function markCells(coords) {
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i];
        var elCell = document.querySelector(`#cell-${coord.i}-${coord.j}`);
        if (isEmptyCell(coord)) elCell.classList.add('mark')
        else elCell.classList.add('hided-mark')
    }
}

// DOM <-> MODAL  
// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function cleanBoard() {
    var elTds = document.querySelectorAll('.mark, .hided-mark, .selected');
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].classList.remove('mark', 'hided-mark', 'selected');
    }
}


function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j
}


function getAllPossibleCoordsPawn(pieceCoord, isWhite) {
    var res = [];
    var diff = (isWhite) ? -1 : 1;
    var nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
    var diago1Coord = { i: pieceCoord.i + diff, j: pieceCoord.j + 1 }
    var diago2Coord = { i: pieceCoord.i + diff, j: pieceCoord.j - 1 }
    if (!isEmptyCell(diago1Coord) && (isWhiteCell(diago1Coord) !== gIsWhiteTurn) && pieceCoord.j + 1 < 8)
        res.push(diago1Coord)
    if (!isEmptyCell(diago2Coord) && (isWhiteCell(diago2Coord) !== gIsWhiteTurn) && pieceCoord.j - 1 > 0)
        res.push(diago2Coord)
    if (isEmptyCell(nextCoord)) res.push(nextCoord);
    else return res;
    if ((pieceCoord.i === 1 && !isWhite) || (pieceCoord.i === 6 && isWhite)) {
        diff *= 2;
        nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
        if (isEmptyCell(nextCoord)) res.push(nextCoord);
    }
    return res;
}


function getAllPossibleCoordsRook(pieceCoord) {
    var res = [];
    for (var i = pieceCoord.i - 1; i >= 0; i--) {
        var coord = { i, j: pieceCoord.j };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    for (var i = pieceCoord.i + 1; i < 8; i++) {
        var coord = { i, j: pieceCoord.j };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    for (var j = pieceCoord.j - 1; j >= 0; j--) {
        var coord = { i: pieceCoord.i, j };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    for (var j = pieceCoord.j + 1; j < 8; j++) {
        var coord = { i: pieceCoord.i, j };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    return res;
}


function getAllPossibleCoordsBishop(pieceCoord) {
    var res = [];
    var i = pieceCoord.i - 1;
    for (var idx = pieceCoord.j + 1; i >= 0 && idx < 8; idx++) {
        var coord = { i: i--, j: idx };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    i = pieceCoord.i - 1;
    for (var idx = pieceCoord.j - 1; i >= 0 && idx >= 0; idx--) {
        var coord = { i: i--, j: idx };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    i = pieceCoord.i + 1;
    for (var idx = pieceCoord.j + 1; i < 8 && idx < 8; idx++) {
        var coord = { i: i++, j: idx };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    i = pieceCoord.i + 1;
    for (var idx = pieceCoord.j - 1; i < 8 && idx >= 0; idx--) {
        var coord = { i: i++, j: idx };
        if (!isEmptyCell(coord)) {
            if (isWhiteCell(coord) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    return res;
}


function getAllPossibleCoordsKnight(pieceCoord) {
    var res = [];
    for (var i = pieceCoord.i - 2; i <= pieceCoord.i + 2; i++) {
        if (i === pieceCoord.i) continue;
        if (i < 0 || i >= 8) continue;
        for (var j = pieceCoord.j - 2; j <= pieceCoord.j + 2; j++) {
            if (i === pieceCoord.i && j === pieceCoord.j) continue;
            if (j < 0 || j >= 8) continue;
            var coord = { i: i, j: j };
            if (!isEmptyCell(coord) && isWhiteCell(coord) === gIsWhiteTurn) continue;
            if ((Math.abs(pieceCoord.i - i) + Math.abs(pieceCoord.j - j)) === 3) res.push(coord);
        }
    }
    return res;
}


function getAllPossibleCoordsKing(pieceCoord) {
    var res = [];
    for (var i = pieceCoord.i - 1; i <= pieceCoord.i + 1; i++) {
        if (i < 0 || i >= 8) continue;
        for (var j = pieceCoord.j - 1; j <= pieceCoord.j + 1; j++) {
            if (i === pieceCoord.i && j === pieceCoord.j) continue;
            if (j < 0 || j >= 8) continue;
            var coord = { i: i, j: j };
            if (!isEmptyCell(coord) && isWhiteCell(coord) === gIsWhiteTurn) continue;
            if (isCheck(coord)) continue;
            res.push(coord);
        }
    }
    return res;
}


function getAllPossibleCoordsQueen(pieceCoord) {
    return getAllPossibleCoordsRook(pieceCoord).concat(getAllPossibleCoordsBishop(pieceCoord))
}


function isCheck(pieceCoord) {
    if(kingIsAround(pieceCoord) || pawnIsAround(pieceCoord)) return true;
    var threatning = []
    var res = getAllPossibleCoordsRook(pieceCoord)
    for (var i = 0; i < res.length; i++) {
        var possibleCoords = { i: res[i].i, j: res[i].j }
        if ((isBlackRook(possibleCoords) || isWhiteRook(possibleCoords) ||
            isBlackQueen(possibleCoords) || isWhiteQueen(possibleCoords)) && !isWhiteCell(possibleCoords) === gIsWhiteTurn) {
                threatning.push(res);
                break;
                //return true;
            }
    }
    res = getAllPossibleCoordsBishop(pieceCoord)
    for (var i = 0; i < res.length; i++) {
        var possibleCoords = { i: res[i].i, j: res[i].j }
        if ((isBlackBishop(possibleCoords) || isWhiteBishop(possibleCoords) ||
            isBlackQueen(possibleCoords) || isWhiteQueen(possibleCoords)) && !isWhiteCell(possibleCoords) === gIsWhiteTurn){
                threatning.push(res);
                break;
                //return true;
            }
    }
    res = getAllPossibleCoordsKnight(pieceCoord)
    for (var i = 0; i < res.length; i++) {
        var possibleCoords = { i: res[i].i, j: res[i].j }
        if ((isBlackKnight(possibleCoords) || isWhiteKnight(possibleCoords)) && !isWhiteCell(possibleCoords) === gIsWhiteTurn){
            threatning.push(res);
            break;
            //return true;
        }
    }
    return (threatning.length) ? threatning : false
}


function pawnIsAround(coord) {
    if(coord.i < 1 || coord.i > 6) return false
    var pawnCoord = { i: (gIsWhiteTurn) ? coord.i - 1 : coord.i + 1, j: coord.j };
    if(pawnCoord.j > 0) 
        if(gBoard[pawnCoord.i][pawnCoord.j - 1] === ((gIsWhiteTurn) ? PAWN_BLACK : PAWN_WHITE)) return true
    if(pawnCoord.j < 7)
        if(gBoard[pawnCoord.i][pawnCoord.j + 1] === ((gIsWhiteTurn) ? PAWN_BLACK : PAWN_WHITE)) return true
    return false
}


function kingIsAround(coord) {
    for (var i = coord.i - 1; i <= coord.i + 1; i++) {
        if (i < 0 || i >= 8) continue;
        for (var j = coord.j - 1; j <= coord.j + 1; j++) {
            if (i === coord.i && j === coord.j) continue;
            if (j < 0 || j >= 8) continue;
            var aroundCoord = { i: i, j: j };
            if (!isEmptyCell(aroundCoord) && isWhiteCell(aroundCoord) === gIsWhiteTurn) continue;
            if(gBoard[i][j] === ((gIsWhiteTurn) ? KING_BLACK : KING_WHITE)) return true
        }
    }
    return false
}


function isEmptyCell(coord) {
    return gBoard[coord.i][coord.j] === ''
}


function isPawnAQueen(coord, piece) {
    if (piece === PAWN_BLACK && coord.i === 7) return QUEEN_BLACK
    else if (piece === PAWN_WHITE && coord.i === 0) return QUEEN_WHITE
    else return piece
}


function isWhiteCell(coord) {
    return isWhiteRook(coord) || isWhiteKing(coord) || isWhiteQueen(coord) || isWhiteBishop(coord) || isWhiteKnight(coord) || isWhitePawn(coord)
}


function isWhiteKing(coord) {
    return gBoard[coord.i][coord.j] === KING_WHITE;
}


function isBlackKing(coord) {
    return gBoard[coord.i][coord.j] === KING_BLACK;
}


function isWhiteQueen(coord) {
    return gBoard[coord.i][coord.j] === QUEEN_WHITE;
}


function isBlackQueen(coord) {
    return gBoard[coord.i][coord.j] === QUEEN_BLACK;
}


function isWhiteRook(coord) {
    return gBoard[coord.i][coord.j] === ROOK_WHITE;
}


function isBlackRook(coord) {
    return gBoard[coord.i][coord.j] === ROOK_BLACK;
}


function isWhiteBishop(coord) {
    return gBoard[coord.i][coord.j] === BISHOP_WHITE;
}


function isBlackBishop(coord) {
    return gBoard[coord.i][coord.j] === BISHOP_BLACK;
}


function isWhiteKnight(coord) {
    return gBoard[coord.i][coord.j] === KNIGHT_WHITE;
}


function isBlackKnight(coord) {
    return gBoard[coord.i][coord.j] === KNIGHT_BLACK;
}


function isWhitePawn(coord) {
    return gBoard[coord.i][coord.j] === PAWN_WHITE;
}


function isBlackPawn(coord) {
    return gBoard[coord.i][coord.j] === PAWN_BLACK;
}