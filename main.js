// "use strict";

class Square {
  constructor(context, row, col) {
    this.context = context;
    this.row = row;
    this.col = col;
  };
};

Square.prototype[Symbol.iterator] = function () {
  return {
    next: function () {
      let result = {
        value: this.corner.up(this.row).right(this.col),
        done: this.row > 7
      };
      this.col++;
      if (this.col > 7) {
        this.row++;
        this.col = 0;
      };
      return result;
    },
    corner: new Square(this.context, 0, 0),
    row: 0,
    col: 0
  };
};

Square.prototype.up = function (steps = 1) {
  return new Square(this.context, this.row + steps, this.col);
};

Square.prototype.down = function (steps = 1) {
  return this.up(-steps);
};

Square.prototype.right = function (steps = 1) {
  return new Square(this.context, this.row, this.col + steps);
};

Square.prototype.left = function (steps = 1) {
  return this.right(-steps);
};

Square.prototype.upRight = function (steps = 1) {
  return this.up(steps).right(steps);
};

Square.prototype.upLeft = function (steps = 1) {
  return this.up(steps).left(steps);
};

Square.prototype.downRight = function (steps = 1) {
  return this.down(steps).right(steps);
};

Square.prototype.downLeft = function (steps = 1) {
  return this.down(steps).left(steps);
};

Square.prototype.knightSquares = function () {
  return [
    this.up(2).right(), this.up(2).left(),
    this.down(2).right(), this.down(2).left(),
    this.right(2).up(), this.right(2).down(),
    this.left(2).up(), this.left(2).down()
  ];
};

Square.prototype.kingSquares = function () {
  return [
    this.upLeft(), this.up(), this.upRight(),
    this.left(), this.right(),
    this.downLeft(), this.down(), this.downRight()
  ];
};

Square.prototype.withinBounds = function () {
  return(
    0 <= this.row && this.row <= 7 &&
    0 <= this.col && this.col <= 7
  );
};

Square.prototype.notWithinBounds = function () {
  return !(this.withinBounds());
};

Square.prototype.equals = function (that) {
  // if (!(that instanceof Square)) return false; //produces a bug I can't fix
  // if (this.context !== that.context) {
  //   throw "Squares do not have the same context";
  // };
  if (that === null) return false;
  if (
    Object.keys(that).includes("row") &&
    Object.keys(that).includes("col")) {
    if (this.row === that.row && this.col === that.col) return true;
  };
  return false;
};

Square.prototype.notIncludedIn = function (squares) {
  for (let square of squares) {
    if (this.equals(square)) return false;
  };
  return true;
};

function copyObject(object) {
  let copy = Array.isArray(object) ? [] : {}
  for (let key of Object.keys(object)) {
    if (typeof object[key] === "object" && object[key] !== null) {
      copy[key] = copyObject(object[key]);
    } else {
      copy[key] = object[key];
    };
  };
  return copy;
};

function objectsEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (object1[key] instanceof Square) {
      if (!object1[key].equals(object2[key])) return false;
    } else if (typeof object1[key] === "object" && object1[key] !== null) {
      if (!objectsEqual(object1[key], object2[key])) return false;
    } else {
      if (object1[key] !== object2[key]) return false;
    };
  };
  return true;
};

class Chess {
  constructor() {
    this.board = [
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      ["r", "n", "b", "q", "k", "b", "n", "r"]
    ];

    this.info = {
      turn: "White",
      castle: {
        WhiteKingside: true,
        BlackKingside: true,
        WhiteQueenside: true,
        BlackQueenside: true
      },
      enPassant: null
    };

    this.meta = {
      repeatPositions: [],
      previousPosition: null,
      drawClaimable: false,
      moves50: 0
    };
  };
};

Chess.prototype.createSquare = function (row, col) {
  const temp = new Square(this, row, col)
  return temp;
  // return new Square(this, row, col);
};

Chess.prototype.isPositionSame = function (that) {
  return objectsEqual(
    [this.board, this.info],
    [that.board, that.info]
  );
};

Chess.prototype.copy = function () {
  const copy = new Chess();
  copy.board = copyObject(this.board);
  copy.info = copyObject(this.info);
  return copy;
};

Square.prototype.piece = function () {
  return this.context.board[this.row][this.col];
};

Square.prototype.isKing = function() {
  const piece = this.piece();
  return piece === "K" || piece === "k";
 };
Square.prototype.isQueen = function() {
  const piece = this.piece();
  return piece === "Q" || piece === "q";
 };
Square.prototype.isRook = function() {
  const piece = this.piece();
  return piece === "R" || piece === "r";
 };
Square.prototype.isBishop = function() {
  const piece = this.piece();
  return piece === "B" || piece === "b";
 };
Square.prototype.isKnight = function() {
  const piece = this.piece();
  return piece === "N" || piece === "n";
 };
Square.prototype.isPawn = function() {
  const piece = this.piece();
  return piece === "P" || piece === "p";
 };

Square.prototype.empty = function () {
  return this.piece() === 0;
};

Square.prototype.notEmpty = function () {
  return !(this.empty());
};

function emptyMultiple(squares) {
  for (let square of squares) {
    if (square.notEmpty()) return false;
  };
  return true;
};

Square.prototype.addPiece = function (piece) {
  this.context.board[this.row][this.col] = piece;
};

Square.prototype.removePiece = function () {
  this.context.board[this.row][this.col] = 0;
};

Square.prototype.colour = function () {
  const piece = this.piece();
  if("KQRBNP".includes(piece)) return "White";
  if("kqrnbp".includes(piece)) return "Black";
  return 0;
};

Square.prototype.oppositeColour = function () {
  const colour = this.colour();
  if (colour === "White") return "Black";
  if (colour === "Black") return "White";
  return 0;
};

Square.prototype.getMoves = function () {
  if (this.isKing()) return this.movesKing.call(this);
  if (this.isQueen()) return this.movesQueen.call(this);
  if (this.isRook()) return this.movesRook.call(this);
  if (this.isBishop()) return this.movesBishop.call(this);
  if (this.isKnight()) return this.movesKnight.call(this);
  if (this.isPawn()) return this.movesPawn.call(this);
};

Chess.prototype.allLegalMoves = function () {
  const moves = [];
  for (let square of new Square(this)) {
    if (square.empty()) continue;
    for (move of square.moves()) {
      moves.push(
        {
          from: square,
          to: move
        }
      );
    };
  };
  return moves;
};


Square.prototype.moves = function () {
  const allMoves = this.getMoves();
  if (allMoves === undefined) {
    console.log(this);
  };
  return allMoves.filter(move => this.context.isMoveLegal(this, move));
  // return this.getMoves().filter(move => this.context.isMoveLegal(this, move));
};

Square.prototype.attackLines = function (directions, attackingColour, piece) {
  piece = attackingColour === "White" ? piece.toUpperCase() : piece;
  const queen = attackingColour === "White" ? "Q" : "q";
  for (let direction of directions) {
    for (let steps = 1; steps <= 7; steps++) {
      let newSquare = this[direction](steps);
      if (newSquare.notWithinBounds()) break;
      if (newSquare.notEmpty()) {
        if (`${queen}${piece}`.includes(newSquare.piece())) {
          return true
        };
        break;
      };
    };
  };
  return false;
};

Square.prototype.attacked = function (attackingColour) {
  // this function is more efficient than just checking each pieces
  // potential moves and seeing if square is included in them

  // check for queens, rooks and bishops
  if (
    this.attackLines(
      ["up", "down", "right", "left"], attackingColour, "r"
    ) ||
    this.attackLines(
      ["upRight", "upLeft", "downRight", "downLeft"], attackingColour, "b"
    )
  ) {
    if (this.context === chess) {
      // console.log("Queen, Rook or Bishop");
    };
    return true;
  };

  // check for knights
  for (let knightSquare of
    this.knightSquares().filter(square => square.withinBounds())) {
    if (knightSquare.colour() === attackingColour && knightSquare.isKnight()) {
      if (this.context === chess) {
        // console.log("Knight");
      };
      return true;
    };
  };

  // check for the king
  for (let kingSquare of
    this.kingSquares().filter(square => square.withinBounds())) {
    if (kingSquare.colour() === attackingColour && kingSquare.isKing()) {
      if (this.context === chess) {
        // console.log("King");
      };
      return true;
    };
  };

  // check for pawn
  if (this.context === chess) {
  }
  let pawnDirection = attackingColour === "White" ? "down" : "up";
  // is ^^ right?? Or is it '? "up" : "down";'?
  for (let pawnSquare of [
    this[pawnDirection]().left(),
    this[pawnDirection]().right()
  ].filter(square => square.withinBounds())) {
    if (pawnSquare.colour() === attackingColour && pawnSquare.isPawn()) {
      if (this.context === chess) {
        // console.log("Pawn");
      };
      return true;
    };
  };

  return false;
};

function attackedMutiple (attackingColour, squares) {
  for (let square of squares) {
    if (square.safe()) return false;
  };
  return true;
};

Square.prototype.safe = function (attackingColour) {
  return !(square.attacked(attackingColour));
};

function safeMultiple(squares, attackingColour){
  for (let square of squares) {
    if (square.attacked(attackingColour)) return false;
  };
  return true;
};

Chess.prototype.isItCheck = function (kingSquare = null) {
  const colour = this.info.turn;
  if (kingSquare === null) {
    for (let square of new Square(this)) {
      if (square.isKing() && square.colour() === colour) {
        kingSquare = square;
        break;
      };
    };
  };
  // see if he's attacked
  const oppositeColour = kingSquare.oppositeColour()
  return kingSquare.attacked(oppositeColour);
};

Chess.prototype.isItCheckmate = function () {
  if (!this.isItCheck()) return false;
  const moves = this.allLegalMoves();
  for (let move of moves) {
    let copy = this.copy();
    copy.makeMove(
      copy.createSquare(move.from.row, move.from.col),
      copy.createSquare(move.to.row, move.to.col)
    );
    if(!copy.isItCheck()) return false;
  };
  return true;
};


Square.prototype.movesLines = function (directions) {
  const moves = [];
  const oppositeColour = this.oppositeColour();
  for (let direction of directions) {
    for (let steps = 1; steps <= 7; steps++) {
      let newSquare = this[direction](steps);
      if (newSquare.notWithinBounds()) break;
      if (newSquare.empty()) moves.push(newSquare)
      else {
        if (newSquare.colour() === oppositeColour) moves.push(newSquare);
        break;
      };
    };
  };
  return moves;
},

Square.prototype.movesRook = function () {
  return this.movesLines(["up", "down", "right", "left"]);
},

Square.prototype.movesBishop = function () {
  return this.movesLines(["upRight", "upLeft", "downRight", "downLeft"]);
},

Square.prototype.movesQueen = function () {
  return this.movesRook().concat(
         this.movesBishop());
},

Square.prototype.movesKing = function () {
  const colour = this.colour();
  const oppositeColour = this.oppositeColour();

  // normal moves
  const moves =
  this.kingSquares()
  .filter(square => square.withinBounds())
  .filter(square => {
    return square.empty() || square.colour() === oppositeColour;
  });

  // castling

  // castling is not allowed if the king is in check
  if (!this.context.isItCheck()) {
    // check if the player has the right to castle on the kingside
    if (this.context.info.castle[`${colour}Kingside`]) {
      let squares = [this.right(), this.right(2)];

      // check if the appropriate squares are safe and empty
      if (emptyMultiple(squares) && safeMultiple(squares, oppositeColour)) {

        // add the castling move
        moves.push(this.right(2));
      };
    };

    // check if the player has the right to castle on the queenside
    if (this.context.info.castle[`${colour}Queenside`]) {
      let squares = [this.left(), this.left(2)];

      // check if the appropriate squares are safe and empty
      if (
        emptyMultiple(squares.concat(this.left(3))) &&
        safeMultiple(squares, oppositeColour
        )) {

        // add the castling move
        moves.push(this.left(2));
      };
    };
  };
  return moves;
},

Square.prototype.movesKnight = function () {
  const colour = this.colour();
  return this.knightSquares()
    .filter(square => square.withinBounds())
    .filter(square => square.empty() || colour === square.oppositeColour());
},

Square.prototype.movesPawn = function () {
  const moves = [];
  const direction = this.colour() === "White" ? "up": "down";
  const oppDir = direction === "up" ? "down": "up";
  const oppositeColour = this.oppositeColour();
  const promotionPieces = this.colour() === "White" ? "QRBN" : "qrbn";

  // add normal pawn move
  // const normalMove = this[direction]();
  // if (normalMove.empty()) moves.push(normalMove);
  if (this[direction]().empty()) moves.push(this[direction]());

  // if the pawn is on it's starting row and
  // there isn't a piece in front of it add two steps forward to moves
  if (
    (this.row === 1 || this.row === 6) &&
    this[direction](2).withinBounds() &&
    this[direction]().empty() &&
    this[direction](2).empty()
  ) {
    moves.push(this[direction](2));
  };

  // add diagonal squares if there is a piece to capture
  // or if there is an en passant possibility
  for (let attackSquare of [
    this[direction]().right(),
    this[direction]().left()
  ]){
    if (attackSquare.withinBounds()) {
      if (
        attackSquare.colour() === oppositeColour ||
        attackSquare.equals(this.context.info.enPassant)
      ) {
        moves.push(attackSquare);
      };
    };
  };
  // for each move check if it's a promotion move
  const movesInclPromotions = [];
  for (move of moves) {
    if (move.row === 0 || move.row === 7) {
      for (piece of promotionPieces) {
        let promotionMove = new Square(move.context, move.row, move.col);
        promotionMove["promotion"] = piece;
        movesInclPromotions.push(promotionMove);
      };
    }
    else movesInclPromotions.push(move);
  };
  return movesInclPromotions;
};

Chess.prototype.move = function (from, to) {
  if (!(this.isMoveLegal(from, to))) return false;
  // save previous position for undo feature
  this.meta.previousPosition = this.copy();
  this.makeMove(from, to);
  this.changeInfo(from, to);
  this.isGameOver(from, to);
  return true; // for testing purposes, might be perminent
};

Chess.prototype.isMoveLegal = function (from, to) {
  // check if the piece moving is of the right colour
  if (this.info.turn !== from.colour()) {
    // console.log("this.info.turn !== from.colour()");
    // console.log("Not their turn");
    return false;
  };
  // check if the piece is able to move in the desired way
  if (to.notIncludedIn(from.getMoves())) {
    // console.log("Doesn't move like that");
    return false;
  };
  // check if the move puts the moving player in check
  const copY = this.copy();
  copY.makeMove(
    copY.createSquare(from.row, from.col),
    copY.createSquare(to.row, to.col)
  );
  if (copY.isItCheck()) {
    // console.log("copy.isItCheck()");
    // console.log("It's check");
    return false;
  };
  // otherwise the move is legal
  return true;
};

Chess.prototype.makeMove = function (from, to) {
  to.addPiece(from.piece());
  from.removePiece();
  // if it's castling (if the king moved two spaces horizontally)
  if (to.isKing() && Math.abs(to.col - from.col) === 2) {
    // if it's on the right side
    if (to.col === 6) {
      // move rook next to the king
      to.left().addPiece(to.right().piece());
      to.right().removePiece();
    // else on the left side
    } else {
      // move rook next to the king
      to.right().addPiece(to.left(2).piece())
      to.left(2).removePiece();
    };
  };
  // en passant
  if (to.isPawn() && to.equals(this.info.enPassant)) {
    this.createSquare(from.row, to.col).removePiece();
  };
  if (to.isPawn() && (to.row === 7 || to.row === 0)) {
    // to.removePiece(); // implied in to.addPiece
    to.addPiece(to.promotion);
  };
};

Chess.prototype.changeInfo = function (from, to) {
  // makeMove is executed before this function
  // this function needs information about the position before the makeMove
  // function was executed and therefore uses meta.previousPosition
  this.info.turn = this.info.turn === "White" ? "Black": "White";
  const previous = this.meta.previousPosition;
  const fromPrevious = new Square(previous, from.row, from.col);
  const toPrevious = new Square(previous, to.row, to.col);
  const corners = {
    WhiteQueenside: new Square(this, 0, 0),
    WhiteKingside: new Square(this, 0, 7),
    BlackQueenside: new Square(this, 7, 0),
    BlackKingside: new Square(this, 7, 7)
  };
  // check each corner
  for (let side in corners) {
    // if a piece has moved from or to the corner
    if (from.equals(corners[side]) || to.equals(corners[side])) {
      // then check is no longer possible on the `${side}` of the board
      this.info.castle[side] = false;
    };
  };
  // if the king moved
  if (fromPrevious.isKing()) {
    // then castling is no longer possible for that player
    if (previous.info.turn === "White") {
      this.info.castle.WhiteKingside = false;
      this.info.castle.WhiteQueenside = false;
    } else {
      this.info.castle.BlackKingside = false;
      this.info.castle.BlackQueenside = false;
    };
  };
  // old en passant possibilities are errased
  this.info.enPassant = null;
  // if the piece that moved is a pawn
  if (fromPrevious.isPawn()) {
    // and it moved two squares, add the appropriate enPassant possibilities
    if (to.equals(from.up(2))) {
      this.info.enPassant = from.up();
      // in order to avoid a recursion error remove context from square
      this.info.enPassant.context = null;
    };
    if (to.equals(from.down(2))) {
      this.info.enPassant = from.down();
      // in order to avoid a recursion error remove context form square
      this.info.enPassant.context = null;
    };
  };
  // check if 50-move count should be reset
  // if a pawn is moved or if a piece is taken
  if (fromPrevious.isPawn() || toPrevious.notEmpty()) {
    // reset the count;
    this.meta.moves50 = 0;
  };
  // increase move count
  this.meta.moves50 += 0.5;

  // 3-fold repetition
  // if the move is a pawn move or a capture
  if (fromPrevious.isPawn() || toPrevious.notEmpty()) {
    this.meta.repeatPositions = [];
  };
  this.meta.repeatPositions.push({
    board: previous.board,
    info: previous.info
  });

  // if move50 count is >= 50 or the position has repeated 3 times
  // a draw may be claimed
  this.meta.drawClaimable =
  this.meta.move50 >= 50 || this.isIt3FoldRepetition();
};

Chess.prototype.isIt3FoldRepetition = function () {
  let occurances = 0;
  for (let position of this.meta.repeatPositions) {
    if (this.isPositionSame(position)) occurances++;
  };
  return occurances >= 3;
};

Chess.prototype.isGameOver = function () {
  // check if it's check
  if (this.isItCheck()) {
    // if so check if it's checkmate
    if (this.isItCheckmate()) {
      return true;
    };
  } else { // if it's not check
    // check if it's stalemate
    // get list of moves
    const moves = this.allLegalMoves();
    // if there are no legal moves, it is stalemate and the game is over
    if (moves.length === 0) return true;
  };
  // check if there is insufficient material left
  const kingsBishopsKnights = [];
  for (let square of new Square(this)) {
    if (square.empty()) continue;
    // if there is a pawn, rook or queen there is sufficient material left
    if (square.isPawn() || square.isRook() || square.isQueen()) break;
    kingsBishopsKnights.push(square.piece());
  };
  if (kingsBishopsKnights.length < 4) return true;
  if (
    kingsBishopsKnights.length === 4 &&
    kingsBishopsKnights.includes("B") &&
    kingsBishopsKnights.includes("b")
  ) {
    // return true if the bishops are on the same colour
    // find the squares the bishops are on
    bishopSquares = [];
    for (let square of new Square(this)) {
      if (square.isBishop()) {
        bishopSquares.push(square);
      };
    };
    // check if they are on the same colour square
    // and if so there is insufficient material left
    if (
      (bishopSquares[0].row + bishopSquares[0].col) % 2 ===
      (bishopSquares[1].row + bishopSquares[1].col) % 2
    ) {
      return true;
    };
  };
  return false;
};

const chess = new Chess();
