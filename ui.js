// "use strict";

function fullNamePiece(piece) {
  if (piece === 0) return 0
  switch (piece.toUpperCase()) {
    case "K": return "king";
    case "Q": return "queen";
    case "R": return "rook";
    case "B": return "bishop";
    case "N": return "knight";
    case "P": return "pawn";
  };
};

Chess.prototype.refresh = function () {

  for (let square of new Square(this)) {

    let piece = fullNamePiece(square.piece())
    let colour = square.colour();
    let squareLocation = document.getElementById(
      `row${square.row}`)
      .children[square.col];
    if (square.notEmpty()) {
      // add image to square
      squareLocation.innerHTML =
      `<img src='images//${piece}${colour}.svg' alt='${colour} ${piece}'>`;

      //add event listener to image
      addDragDropEventListeners(squareLocation, square);

    } else {
      squareLocation.innerHTML = "";
    };
  };
};

function addDragDropEventListeners(squareLocation, square) {
  const chess = square.context;
  const image = squareLocation.children[0];
  image.addEventListener('mousedown', function (e) {
    e.preventDefault();
    let mouseDown = true;
    image.style.cursor = "grabbing";
    startX = e.pageX;
    startY = e.pageY;
    // add class "select" to image square and higlight square
    image.classList.add("select");
    squareLocation.classList.add("highlight");

    // center image to pointer
    let imageRect = image.getBoundingClientRect();
    let centerX = imageRect.left + (imageRect.width  / 2);
    let centerY = imageRect.top  + (imageRect.height / 2);
    let moveX = e.clientX - centerX;
    let moveY = e.clientY - centerY;
    image.style.left = `${moveX}px`;
    image.style.top = `${moveY}px`;

    // highlight all potential moves
    const potentialMoves = square.moves();
    for (move of potentialMoves) {
      let moveLocation = document.getElementById(
      `row${move.row}`)
      .children[move.col];
      moveLocation.classList.add("highlight");
    };

    window.addEventListener('mousemove', function (e){
      if (mouseDown){
        // move image by however much mouse has been moved
        let movedX = e.pageX - startX;
        let movedY = e.pageY - startY;
        image.style.left = `${moveX + movedX}px`;
        image.style.top = `${moveY + movedY}px`;
      };
    });

    image.addEventListener('mouseup', function (e) {
      mouseDown = false;

      let table = document.body.children[0];
      let tableRect = table.getBoundingClientRect();

      // locate pointer
      let pointerX = e.pageX - tableRect.left;
      let pointerY = e.pageY - tableRect.top;

      // calculate which square the pointer is on
      let squareWidth = tableRect.width / 8;
      let squareHeight = tableRect.height / 8;

      let col = Math.floor(pointerX / squareWidth);
      let row = 7 - Math.floor(pointerY / squareHeight);

      // piece is moving to square "to"
      let to = new Square(chess, row, col);

      // Check if the user is promoting a pawn
      if (square.isPawn()) {
        let prColour = square.colour()
        let promotionTable = document
        .getElementsByClassName(`promotion ${prColour}`)[0];
        if (
          row === 7 && prColour === "White" ||
          row === 0 && prColour === "Black"
        ) {
          let moveLeft = tableRect.left + col * squareWidth - 1.5 * squareWidth;
          promotionTable.style.left = `${moveLeft}px`;
          let moveTop = tableRect.top + squareHeight / 2;
          if (prColour === "Black") moveTop += 6 * squareHeight;
          promotionTable.style.top = `${moveTop}px`;
          promotionTable.classList.add("promotion-on");

          let prTableLoc = document
          .getElementsByClassName("promotion-on")[0]
          let prSquaresLoc = prTableLoc
          .children[0].children[0].children;
          for (prSquare of prSquaresLoc) {
            let prMouseDown = false;
            let prTableRect;
            let colProm;
            let promotionPiece;
            prSquare.addEventListener('mousedown', function(e){
              e.preventDefault();
              prMouseDown = true;

              // get location of promotion table
              prTableRect = prTableLoc.getBoundingClientRect();

              // get location of pointer relative to promotion table
              let pointerXprom = e.pageX - prTableRect.left;
              let pointerYprom = e.pageY - prTableRect.top;

              // calculate which square the pointer is on
              // square width is still the same
              colProm = Math.floor(pointerXprom / squareWidth);
              if (prColour === "White") {
                promotionPiece = ["Q", "R", "B", "N"][colProm];
              }
              else {
                promotionPiece = ["q", "r", "b", "n"][colProm];
              };
            });
            prSquare.addEventListener('mouseup', function(e){
              if (prMouseDown) {
                prMouseDown = false;

                let pointerXprom = e.pageX - prTableRect.left;
                let pointerYprom = e.pageY - prTableRect.top;
                // if the pointer hasn't moved away from the square
                if (colProm === Math.floor(pointerXprom / squareWidth)) {
                  promotionTable.classList.remove("promotion-on");
                  to["promotion"] = promotionPiece;
                  moveAndBackToNormal();
                }; // mouseup if if
              } // mouseup if
            }); // mouseup
          } // for
        } // if white
        else {
          moveAndBackToNormal();
        }
      }
      else {
        moveAndBackToNormal();
      }
      // get everything back to normal
      function moveAndBackToNormal() {
        chess.move(square, to);
        image.classList.remove("select");
        squareLocation.classList.remove("highlight");
        for (move of potentialMoves) {
          let squareLocation = document.getElementById(
            `row${move.row}`)
            .children[move.col];
            squareLocation.classList.remove("highlight");
          };
          chess.refresh();
      };
    })
  })
};

chess.refresh();
