import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';

type Board = Array<'X' | 'O' | null>;

export function TicTacToe({ roomId }: { roomId: string }) {
  const { socket } = useSocket();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (evt: any) => {
      if (evt.type !== 'tictactoe' || evt.roomId !== roomId) return;
      if (evt.action === 'move') {
        setBoard(evt.board);
        setTurn(evt.turn);
        setWinner(evt.winner || null);
      }
    };
    socket.on('game:event', handler);
    return () => { socket.off('game:event', handler); };
  }, [socket, roomId]);

  function calcWinner(b: Board): 'X' | 'O' | 'Draw' | null {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const [a,b2,c] of lines) {
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
    }
    if (b.every(Boolean)) return 'Draw';
    return null;
  }

  function move(i: number) {
    if (winner || board[i] || !socket) return;
    const next = board.slice();
    next[i] = turn;
    const w = calcWinner(next);
    const nextTurn = turn === 'X' ? 'O' : 'X';
    setBoard(next);
    setTurn(nextTurn);
    setWinner(w);
    socket.emit('game:event', { roomId, event: { type: 'tictactoe', roomId, action: 'move', board: next, turn: nextTurn, winner: w } });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 w-48">
        {board.map((cell, i) => (
          <button key={i} onClick={() => move(i)} className="aspect-square text-2xl font-bold border rounded flex items-center justify-center">
            {cell}
          </button>
        ))}
      </div>
      <div className="text-sm">
        {winner ? (winner === 'Draw' ? 'Draw!' : `${winner} wins!`) : `Turn: ${turn}`}
      </div>
    </div>
  );
}


