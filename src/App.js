import { useState } from 'react';

// Get the root element of the document
// const root = document.documentElement;
// Get the value of the CSS variable

const rowCount = 3;
const colCount = 3;

const letters="abcdefghijklmnopqrstuvwxyz"

function Square({ rowIndex, colIndex, squares, onSquareClick, subBoardId }) {
  const squareIndex = rowIndex * rowCount + colIndex;
  
  return (
    <button className="square" onClick={() => onSquareClick(subBoardId*9+squareIndex)} id={letters[colIndex] + (rowCount -rowIndex).toString()} >
      {/* {squares[squareIndex]} */}
      {squares[subBoardId*9+squareIndex]}
    </button>
  );
}

function SubBoard({ xIsNext, squares, onPlay, subBoardId }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
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
    return <li key={squareIndex} >
    <div className='square'>
      <Square key={squareIndex} rowIndex={Math.floor(squareIndex/colCount)} colIndex={squareIndex%colCount} 
      squares={squares} onSquareClick={handleClick} subBoardId={subBoardId} squareIndex={squareIndex}/>
      </div>

    </li>
  });

  return (
    <>
      <div className="sub-board"> {gameSquares}</div>
    </>
  );
}

function GridBoard({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
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

  const gameSquares = new Array(rowCount*colCount).fill().map((_, subBoardId) => {
    return <li key={subBoardId} >
    <div className='sub-board'>
      <SubBoard key={subBoardId} xIsNext={xIsNext} squares={squares} onPlay={onPlay}  subBoardId={subBoardId}/>
      </div>

    </li>
  });

  return (
    <>
      <div className="status">{status}</div>
      <div className="grid-game-board"> {gameSquares}</div>
      
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(81).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
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
        <GridBoard xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
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
  // for (let i = 0; i < lines.length; i++) {
  //   const [a, b, c] = lines[i];
  //   if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
  //     return squares[a];
  //   }
  // }
  return null;
}
