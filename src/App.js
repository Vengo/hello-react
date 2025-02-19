import { useState } from 'react';
import './styles.css';
import './constants.css';

// Get the root element of the document
// const root = document.documentElement;
// Get the value of the CSS variable

const rowCount = 3;
const colCount = 3;

const letters="abcdefghijklmnopqrstuvwxyz"

function Square({ rowIndex, colIndex, boardState, onSquareClick, subBoardId, indexInSubBoard, isAvailable, moveVisits}) {
  const squareIndex = rowIndex * rowCount + colIndex;
  
  let squareType = isAvailable ? 'square' : 'blocked';
  let squareColor = ((squareIndex+subBoardId)%2==0) ? 'light' : 'dark';
  let squareClass = ' '+squareType+'--'+squareColor;
  let boardIndex = subBoardId*9+indexInSubBoard
  const squares = boardState.squares;
  let displayVisitCount = squares[boardIndex] === null;
  let useVisitFormat = displayVisitCount ? " visit-count" : "";
  return (<div className="square">
      <button className={"square "+squareClass} onClick={() => onSquareClick(subBoardId,indexInSubBoard)} overallindex={boardIndex} id={letters[colIndex] + (rowCount -rowIndex).toString()} >
        {squares[boardIndex]}
      </button>
      {isAvailable ? <div className={useVisitFormat}>{moveVisits[boardIndex]}</div> :""}
    </div>
  );
}

function SubBoard({boardState, handleClick, subBoardId, isAvailable, moveVisits }) {
  const squares = boardState.squares;

  const winner = calculateSubBoardWinner(boardState, subBoardId);
  
  const gameSquares = new Array(rowCount*colCount).fill().map((_, squareIndex) => {
    return <Square key={squareIndex} rowIndex={Math.floor(squareIndex/colCount)} colIndex={squareIndex%colCount} 
      boardState={boardState} onSquareClick={handleClick} subBoardId={subBoardId} indexInSubBoard={squareIndex}
      isAvailable={isAvailable} moveVisits={moveVisits}/>
  });
  
  return (
    <>
      <div className="sub-board" key={subBoardId}> {gameSquares}</div>
    </>
  );
}

function GridBoard({ xIsNext, boardState, handlePlayHistory, moveVisits }) {

  function handleSquareClick(subBoardId, indexInSubBoard) {
    const i = subBoardId*9+indexInSubBoard;
    const currentSquares = boardState.squares;
    const blocked = (boardState.nextBoard != null) && (boardState.nextBoard!=subBoardId)
    if (calculateSubBoardWinner(boardState,subBoardId) || currentSquares[i] || blocked) {
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

  
  const subBoards = new Array(rowCount*colCount).fill().map((_, subBoardId) => {
    const isAvailable = (calculateSubBoardWinner(boardState, subBoardId)==null) &&
    ((boardState.nextBoard === null) || (boardState.nextBoard === subBoardId)); 
    return <SubBoard key={subBoardId} xIsNext={xIsNext} boardState={boardState} handleClick={handleSquareClick}  
    subBoardId={subBoardId} isAvailable={isAvailable} moveVisits={moveVisits}/>
      
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

  let moveVisits = new Array(81).fill(0);
  moveVisits[41] = 900;

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
  
  return (
    <div className="game">
      <div>
        <GridBoard xIsNext={xIsNext} boardState={currentGameState} handlePlayHistory={handlePlayHistory} 
        moveVisits={moveVisits}/>
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
