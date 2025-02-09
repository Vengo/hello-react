import { useState } from 'react';
import './styles.css';
import './constants.css';

// Get the root element of the document
// const root = document.documentElement;
// Get the value of the CSS variable

const rowCount = 3;
const colCount = 3;

const letters="abcdefghijklmnopqrstuvwxyz"

function Square({ rowIndex, colIndex, boardState, onSquareClick, subBoardId, indexInSubBoard, isAvailable}) {
  const squareIndex = rowIndex * rowCount + colIndex;
  
  let squareType = isAvailable ? 'square' : 'blocked';
  let squareColor = ((squareIndex+subBoardId)%2==0) ? 'light' : 'dark';
  let squareClass = ' '+squareType+'--'+squareColor;
  const squares = boardState.squares;
  return (<div className={"square "+squareClass} subBoardId={subBoardId} indexInSubBoard={indexInSubBoard}>
    <button className={"square "+squareClass} onClick={() => onSquareClick(subBoardId,indexInSubBoard)} id={letters[colIndex] + (rowCount -rowIndex).toString()} >
      {/* {squares[squareIndex]} */}
      {squares[subBoardId*9+indexInSubBoard]}
    </button>
  </div>
  );
}

function SubBoard({boardState, handleClick, subBoardId, isAvailable }) {
  const squares = boardState.squares;

  const winner = calculateSubBoardWinner(boardState, subBoardId);
  // let status;
  // if (winner) {
  //   status = 'Winner: ' + winner;
  // } else {
  //   status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  // }

  
  const gameSquares = new Array(rowCount*colCount).fill().map((_, squareIndex) => {
    return <Square key={squareIndex} rowIndex={Math.floor(squareIndex/colCount)} colIndex={squareIndex%colCount} 
      boardState={boardState} onSquareClick={handleClick} subBoardId={subBoardId} indexInSubBoard={squareIndex}
      isAvailable={isAvailable}/>
  });

  console.log("SubBoard: current game state is:");
  console.log(boardState);
  return (
    <>
      <div className="sub-board" key={subBoardId}> {gameSquares}</div>
    </>
  );
}

function GridBoard({ xIsNext, boardState, handlePlayHistory }) {

  function handleSquareClick(subBoardId, indexInSubBoard) {
    const i = subBoardId*9+indexInSubBoard;
    const currentSquares = boardState.squares;
    if (calculateSubBoardWinner(boardState,subBoardId) || currentSquares[i]) {
      return;
    }
    
    const nextSquares = currentSquares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    const maybeNextSubBoardId = i%9;
    const maybeNextBoardState = new BoardState(!xIsNext, nextSquares, maybeNextSubBoardId);
    const subBoardWinCheck = calculateSubBoardWinner(maybeNextBoardState,maybeNextSubBoardId);
    if (!subBoardWinCheck) {
      handlePlayHistory(maybeNextBoardState);
    } else {
      handlePlayHistory(new BoardState(!xIsNext, nextSquares, null))
    }
  }

  const winner = calculateSubBoardWinner(boardState);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const nextSubBoard = (boardState.nextBoard === null)? "any" : boardState.nextBoard;

  console.log("GridBoard: current game state is:");
  console.log(boardState);
  const subBoards = new Array(rowCount*colCount).fill().map((_, subBoardId) => {
    const isAvailable = (calculateSubBoardWinner(boardState, subBoardId)==null) &&
    ((boardState.nextBoard === null) || (boardState.nextBoard === subBoardId)); 
    return <SubBoard key={subBoardId} xIsNext={xIsNext} boardState={boardState} handleClick={handleSquareClick}  
    subBoardId={subBoardId} isAvailable={isAvailable}/>
      
  });

  return (
    <>
      <div className="status">{status} to play</div>
      <div className="grid-game-board"> {subBoards}</div>
    </>
  );
}

class BoardState {
  constructor(xIsNext=true, squares=Array(81).fill(null), nextBoard=null) {
    this.xIsNext = xIsNext;
    this.squares = squares;
    this.nextBoard = nextBoard;
  }
}

export default function Game() {
  const [history, setHistory] = useState([new BoardState()]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentGameState = history[currentMove];

  function handlePlayHistory(nextGameState) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextGameState];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  console.log("Game: current game state is:");
  console.log(currentGameState);
  return (
    <div className="game">
      <div>
        <GridBoard xIsNext={xIsNext} boardState={currentGameState} handlePlayHistory={handlePlayHistory} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateSubBoardWinner(boardState, subBoardId) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  console.log("checking board"+subBoardId+": "+JSON.stringify(boardState));
  const squares = boardState.squares;
  const offSet = subBoardId*9;
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a+offSet] && 
      squares[a+offSet] === squares[b+offSet] && 
      squares[a+offSet] === squares[c+offSet]) {
      return squares[a];
    }
  }
  if (squares.slice(offSet,offSet+9).every( (x) => x!=null)) {return "c"}


  return null;
}
