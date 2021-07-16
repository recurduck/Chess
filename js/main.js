'use strict'
/*
TODO: 
when someone do a move - check if the king is on check - if so
- get all the route to the threatning 
- filter the cells route by checking if one of them can be reached by the defensive side
    in the filter we need to make sure that by capture the route - the king will not find his self again checked
    if the filter will return us length that is same as before - its checkMate!
*/
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
    gWhiteKingPos = { i: 7, j: 4 }
    gBlackKingPos = { i: 0, j: 4 }
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

    var possibleCoords = getAllPossibleCoords(piece, cellCoord);
    // if (gIsWhiteTurn ? isCheck(gWhiteKingPos) : isCheck(gBlackKingPos)) {
        //console.log(`Your ${gIsWhiteTurn?'white':'black'} King is check!`)
        possibleCoords = possibleCoords.filter(toCoord => !nextStepModal(cellCoord, toCoord))
    // }
    console.log(possibleCoords)
    markCells(possibleCoords);
}

function nextStepModal(fromCoord, toCoord) {
    //return false if in the next step the king is still checked
    var nextStepBoard = JSON.parse(JSON.stringify(gBoard))
    var piece = nextStepBoard[fromCoord.i][fromCoord.j];
    var newWhiteKingPos = gWhiteKingPos;
    var newBlackKingPos = gBlackKingPos;
    // update the NEXT STEP MODEL
    nextStepBoard[fromCoord.i][fromCoord.j] = '';
    nextStepBoard[toCoord.i][toCoord.j] = isPawnAQueen(toCoord, piece);
    if (piece === KING_WHITE) newWhiteKingPos = { i: toCoord.i, j: toCoord.j }
    else if (piece === KING_BLACK) newBlackKingPos = { i: toCoord.i, j: toCoord.j }
    // console.table(nextStepBoard)
    // console.log(!gIsWhiteTurn ? newBlackKingPos : newWhiteKingPos)
    // console.log('next modal king isCheck:', isCheck(!gIsWhiteTurn ? newBlackKingPos : newWhiteKingPos, gIsWhiteTurn, nextStepBoard))
    return isCheck(!gIsWhiteTurn ? newBlackKingPos : newWhiteKingPos, gIsWhiteTurn, nextStepBoard)
}

function movePiece(elFromCell, elToCell) {
    var fromCoord = getCellCoord(elFromCell.id);
    var toCoord = getCellCoord(elToCell.id);
    // update the MODEL
    var piece = gBoard[fromCoord.i][fromCoord.j];
    gBoard[fromCoord.i][fromCoord.j] = '';
    gBoard[toCoord.i][toCoord.j] = isPawnAQueen(toCoord, piece);
    if (piece === KING_WHITE) gWhiteKingPos = { i: toCoord.i, j: toCoord.j }
    else if (piece === KING_BLACK) gBlackKingPos = { i: toCoord.i, j: toCoord.j }
    gIsWhiteTurn = !gIsWhiteTurn
    console.log(gIsWhiteTurn ? 'White turn' : 'Black turn')
    // update the DOM
    elFromCell.innerText = '';
    elToCell.innerText = isPawnAQueen(toCoord, piece);
    isCheckMate(!gIsWhiteTurn ? gBlackKingPos : gWhiteKingPos);
    //////////////////////////////////////////////// check Checkmate
    // if (piece === ((!gIsWhiteTurn) ? KING_WHITE : KING_BLACK)) {
    //     if (piece === KING_WHITE) gWhiteKingPos = { i: toCoord.i, j: toCoord.j }
    //     else gBlackKingPos = { i: toCoord.i, j: toCoord.j }
    // } else {
    //     var kingCheck = (!gIsWhiteTurn) ? gBlackKingPos : gWhiteKingPos
    //     if (getAllPossibleCoordsKing(kingCheck).length === 0 && isCheck(kingCheck).length > 1)
    //         console.log(`CheckMate!!!!!!!! ${(!gIsWhiteTurn) ? 'White' : 'Black'} Win!`,)
    //     else if (getAllPossibleCoordsKing(kingCheck).length === 0 && isCheck(kingCheck).length === 1) {
    //         var optionsToProtect = isCheck(kingCheck);
    //         console.log('optionsToProtect', optionsToProtect)
    //         for (var i = 0; i < optionsToProtect[0].length; i++) {
    //             console.log(canBeProtected(optionsToProtect[0][i]))
    //             // console.log(isCheck(optionsToProtect[0][i], !gIsWhiteTurn))
    //         }
    //     } //for arr do isCheck on the options to block..... if there is true is not checkmate

    // }
}
function isCheckMate(kingPosition) {
    if (getAllPossibleCoordsKing(kingPosition).length === 0 && isCheck(kingPosition).length > 1)
        console.log(`CheckMate!!!!!!!! ${(!gIsWhiteTurn) ? 'White' : 'Black'} Win!`,)
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


function getAllPossibleCoords(piece, cellCoord) {
    var possibleCoords = []
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
                possibleCoords = getAllPossibleCoordsPawn(cellCoord);
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
                possibleCoords = getAllPossibleCoordsPawn(cellCoord);
                break
            case QUEEN_BLACK:
                possibleCoords = getAllPossibleCoordsQueen(cellCoord);
                break;
            case KING_BLACK:
                possibleCoords = getAllPossibleCoordsKing(cellCoord);
        }
    }
    return possibleCoords;
}


function getAllPossibleCoordsPawn(pieceCoord, against = gIsWhiteTurn, board = gBoard) {
    var res = [];
    var isWhite = board[pieceCoord.i][pieceCoord.j] === PAWN_WHITE
    var diff = (isWhite) ? -1 : 1;
    var nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
    var diago1Coord = { i: pieceCoord.i + diff, j: pieceCoord.j + 1 }
    var diago2Coord = { i: pieceCoord.i + diff, j: pieceCoord.j - 1 }
    if (!isEmptyCell(diago1Coord, board) && (isWhitePiece(diago1Coord, board) !== against) && pieceCoord.j + 1 < 8)
        res.push(diago1Coord)
    if (!isEmptyCell(diago2Coord, board) && (isWhitePiece(diago2Coord, board) !== against) && pieceCoord.j - 1 >= 0)
        res.push(diago2Coord)
    if (isEmptyCell(nextCoord, board)) res.push(nextCoord);
    else return res;
    if ((pieceCoord.i === 1 && !isWhite) || (pieceCoord.i === 6 && isWhite)) {
        diff *= 2;
        nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
        if (isEmptyCell(nextCoord, board)) res.push(nextCoord);
    }
    return res;
}


function getAllPossibleCoordsRook(pieceCoord, board = gBoard) {
    var res = [];
    for (var i = pieceCoord.i - 1; i >= 0; i--) {
        var coord = { i, j: pieceCoord.j };
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    for (var i = pieceCoord.i + 1; i < 8; i++) {
        var coord = { i, j: pieceCoord.j };
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    for (var j = pieceCoord.j - 1; j >= 0; j--) {
        var coord = { i: pieceCoord.i, j };
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    for (var j = pieceCoord.j + 1; j < 8; j++) {
        var coord = { i: pieceCoord.i, j };
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    return res;
}


function getAllPossibleCoordsBishop(pieceCoord, board = gBoard) {
    var res = [];
    var i = pieceCoord.i - 1;
    for (var idx = pieceCoord.j + 1; i >= 0 && idx < 8; idx++) {
        var coord = { i: i--, j: idx };
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
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
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
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
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
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
        if (!isEmptyCell(coord, board)) {
            if (isWhitePiece(coord, board) === gIsWhiteTurn) break;
            else {
                res.push(coord);
                break;
            }
        }
        res.push(coord);
    }
    return res;
}


function getAllPossibleCoordsKnight(pieceCoord, board = gBoard) {
    var res = [];
    for (var i = pieceCoord.i - 2; i <= pieceCoord.i + 2; i++) {
        if (i === pieceCoord.i) continue;
        if (i < 0 || i >= 8) continue;
        for (var j = pieceCoord.j - 2; j <= pieceCoord.j + 2; j++) {
            if (i === pieceCoord.i && j === pieceCoord.j) continue;
            if (j < 0 || j >= 8) continue;
            var coord = { i: i, j: j };
            if (!isEmptyCell(coord, board) && isWhitePiece(coord, board) === gIsWhiteTurn) continue;
            if ((Math.abs(pieceCoord.i - i) + Math.abs(pieceCoord.j - j)) === 3) res.push(coord);
        }
    }
    return res;
}


function getAllPossibleCoordsKing(pieceCoord, board = gBoard) {
    var res = [];
    for (var i = pieceCoord.i - 1; i <= pieceCoord.i + 1; i++) {
        if (i < 0 || i >= 8) continue;
        for (var j = pieceCoord.j - 1; j <= pieceCoord.j + 1; j++) {
            if (i === pieceCoord.i && j === pieceCoord.j) continue;
            if (j < 0 || j >= 8) continue;
            var coord = { i: i, j: j };
            if (!isEmptyCell(coord, board) && isWhitePiece(coord, board) === gIsWhiteTurn) continue;
            if (isCheck(coord)) continue;
            res.push(coord);
        }
    }
    return res;
}


function getAllPossibleCoordsQueen(pieceCoord) {
    return getAllPossibleCoordsRook(pieceCoord).concat(getAllPossibleCoordsBishop(pieceCoord))
}


function isCheck(pieceCoord, against = gIsWhiteTurn, board = gBoard) {
    // debugger
    var threatningPieces = []
    if (kingIsAround(pieceCoord, against, board)) threatningPieces.push(...kingIsAround(pieceCoord, against, board))
    if (pawnIsAround(pieceCoord, against, board)) threatningPieces.push(...pawnIsAround(pieceCoord, against, board));
    var res = getAllPossibleCoordsRook(pieceCoord, board)
    for (var i = 0; i < res.length; i++) {
        var possibleCoords = { i: res[i].i, j: res[i].j }
        if ((isBlackRook(possibleCoords, board) || isWhiteRook(possibleCoords, board) ||
            isBlackQueen(possibleCoords, board) || isWhiteQueen(possibleCoords, board)) && !isWhitePiece(possibleCoords, board) === against) {
            threatningPieces.push(possibleCoords);
        }
    }
    res = getAllPossibleCoordsBishop(pieceCoord, board)
    for (var i = 0; i < res.length; i++) {
        var possibleCoords = { i: res[i].i, j: res[i].j }
        if ((isBlackBishop(possibleCoords, board) || isWhiteBishop(possibleCoords, board) ||
            isBlackQueen(possibleCoords, board) || isWhiteQueen(possibleCoords, board)) && !isWhitePiece(possibleCoords, board) === against) {
            threatningPieces.push(possibleCoords);
        }
    }
    res = getAllPossibleCoordsKnight(pieceCoord, board)
    for (var i = 0; i < res.length; i++) {
        var possibleCoords = { i: res[i].i, j: res[i].j }
        if ((isBlackKnight(possibleCoords, board) || isWhiteKnight(possibleCoords, board)) && !isWhitePiece(possibleCoords, board) === against) {
            threatningPieces.push(possibleCoords);
        }
    }
    if (threatningPieces.length) console.log(`Check on ${against ? 'white' : 'black'}, threatning:`, threatningPieces);
    return (threatningPieces.length) ? threatningPieces : false
}


function pawnIsAround(coord, against = gIsWhiteTurn, board = gBoard) {
    var res = []
    var pawnCoord = { i: (against) ? coord.i - 1 : coord.i + 1, j: coord.j };
    if (against !== gIsWhiteTurn) {
        for (var j = - 1; j <= 1; j++) {
            var currPawn = { i: pawnCoord.i, j: pawnCoord.j + j }
            if (!isEmptyCell(currPawn, board) && (!against ? isWhitePawn(currPawn, board) : isBlackPawn(currPawn, board))) {
                var option = [...getAllPossibleCoordsPawn(currPawn, !against, board)].find(obj => obj.i === coord.i && obj.j === coord.j);
                if (option) res.push(currPawn)
            }
        }
    } else {
        if (coord.i < 1 || coord.i > 6) return false
        if (pawnCoord.j > 0)
            if (board[pawnCoord.i][pawnCoord.j - 1] === ((against) ? PAWN_BLACK : PAWN_WHITE)) res.push({ i: pawnCoord.i, j: pawnCoord.j - 1 })
        if (pawnCoord.j < 7)
            if (board[pawnCoord.i][pawnCoord.j + 1] === ((against) ? PAWN_BLACK : PAWN_WHITE)) res.push({ i: pawnCoord.i, j: pawnCoord.j + 1 })
    }
    return res.length ? res : false;
}


function kingIsAround(coord, against = gIsWhiteTurn, board = gBoard) {
    var res = []
    for (var i = coord.i - 1; i <= coord.i + 1; i++) {
        if (i < 0 || i >= 8) continue;
        for (var j = coord.j - 1; j <= coord.j + 1; j++) {
            if (i === coord.i && j === coord.j) continue;
            if (j < 0 || j >= 8) continue;
            var aroundCoord = { i: i, j: j };
            if (!isEmptyCell(aroundCoord, board) && isWhitePiece(aroundCoord, board) === against) continue;
            if (board[i][j] === ((against) ? KING_BLACK : KING_WHITE)) res.push(aroundCoord)
        }
    }
    return res.length ? res : false
}


function isEmptyCell(coord, board = gBoard) {
    return board[coord.i][coord.j] === ''
}


function isPawnAQueen(coord, piece) {
    if (piece === PAWN_BLACK && coord.i === 7) return QUEEN_BLACK
    else if (piece === PAWN_WHITE && coord.i === 0) return QUEEN_WHITE
    else return piece
}


function isWhitePiece(coord, board = gBoard) {
    return isWhiteRook(coord, board) || isWhiteKing(coord, board) || isWhiteQueen(coord, board) || isWhiteBishop(coord, board) || isWhiteKnight(coord, board) || isWhitePawn(coord, board)
}


function isWhiteKing(coord, board = gBoard) {
    return board[coord.i][coord.j] === KING_WHITE;
}


function isBlackKing(coord, board = gBoard) {
    return board[coord.i][coord.j] === KING_BLACK;
}


function isWhiteQueen(coord, board = gBoard) {
    return board[coord.i][coord.j] === QUEEN_WHITE;
}


function isBlackQueen(coord, board = gBoard) {
    return board[coord.i][coord.j] === QUEEN_BLACK;
}


function isWhiteRook(coord, board = gBoard) {
    return board[coord.i][coord.j] === ROOK_WHITE;
}


function isBlackRook(coord, board = gBoard) {
    return board[coord.i][coord.j] === ROOK_BLACK;
}


function isWhiteBishop(coord, board = gBoard) {
    return board[coord.i][coord.j] === BISHOP_WHITE;
}


function isBlackBishop(coord, board = gBoard) {
    return board[coord.i][coord.j] === BISHOP_BLACK;
}


function isWhiteKnight(coord, board = gBoard) {
    return board[coord.i][coord.j] === KNIGHT_WHITE;
}


function isBlackKnight(coord, board = gBoard) {
    return board[coord.i][coord.j] === KNIGHT_BLACK;
}


function isWhitePawn(coord, board = gBoard) {
    return board[coord.i][coord.j] === PAWN_WHITE;
}


function isBlackPawn(coord, board = gBoard) {
    return board[coord.i][coord.j] === PAWN_BLACK;
}