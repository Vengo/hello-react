import { useState } from 'react';
import './styles.css';
import './constants.css';

// Get the root element of the document
// const root = document.documentElement;
// Get the value of the CSS variable

const rowCount = 3;
const colCount = 3;

const letters="abcdefghijklmnopqrstuvwxyz"

function Square({ rowIndex, colIndex, squares, onSquareClick, subBoardId }) {
  const squareIndex = rowIndex * rowCount + colIndex;
  
  let squareColor = ((squareIndex+subBoardId)%2==0) ? ' square--light' : ' square--dark';

  return (<div>
    <button className={"square "+squareColor} onClick={() => onSquareClick(subBoardId,squareIndex)} id={letters[colIndex] + (rowCount -rowIndex).toString()} >
      {/* {squares[squareIndex]} */}
      {squares[subBoardId*9+squareIndex]}
    </button>
  </div>
  );
}

function SubBoard({ xIsNext, boardState, onPlay, subBoardId }) {
  const squares = boardState.squares
  function handleClick(subBoardId, squareIndex) {
    const i = subBoardId*9+squareIndex; // Calculate the index in the main squares array
    if (calculateWinner(boardState) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  
  const gameSquares = new Array(rowCount*colCount).fill().map((_, squareIndex) => {
    return <Square key={squareIndex} rowIndex={Math.floor(squareIndex/colCount)} colIndex={squareIndex%colCount} 
      squares={squares} onSquareClick={handleClick} subBoardId={subBoardId} squareIndex={squareIndex}/>
  });

  return (
    <>
      <div className="sub-board"> {gameSquares}</div>
    </>
  );
}

function GridBoard({ xIsNext, boardState, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(boardState) || squares[i]) {
      return;
    }
    const currentSquares = boardState.squares;
    const nextSquares = currentSquares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    const nextBoardState = BoardState(nextSquares, !xIsNext,i%9);
    onPlay(nextBoardState);
  }

  const winner = calculateWinner(boardState);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const subBoards = new Array(rowCount*colCount).fill().map((_, subBoardId) => {
    return       <SubBoard key={subBoardId} xIsNext={xIsNext} boardState={boardState} onPlay={onPlay}  subBoardId={subBoardId}/>
      
  });

  return (
    <>
      <div className="status">{status}</div>
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

  function handlePlay(nextGameState) {
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
        <GridBoard xIsNext={xIsNext} boardState={currentGameState} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(boardState, subBoardId) {
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

  return null;
}
