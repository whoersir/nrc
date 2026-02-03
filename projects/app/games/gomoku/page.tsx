'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Users, 
  Trophy,
  Circle,
  X,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { GameLeaderboard } from '@/components/GameLeaderboard';
import { GameOverDialog } from '@/components/GameOverDialog';
import { SupabaseAuth } from '@/lib/supabase-auth';
import { AuthGuard } from '@/components/AuthGuard';

type Player = 'black' | 'white' | null;
type Board = Player[][];
type GameMode = 'pvp' | 'pve';
type Difficulty = 'easy' | 'medium' | 'hard';

const BOARD_SIZE = 15;

function GomokuGame() {
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [winner, setWinner] = useState<Player>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [winningLine, setWinningLine] = useState<[number, number][]>([]);
  const [scores, setScores] = useState({ black: 0, white: 0, draw: 0 });
  const [user, setUser] = useState<any>(null);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [playTime, setPlayTime] = useState<number>(0);

  // 获取当前用户
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await SupabaseAuth.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Check for winner
  const checkWinner = useCallback((board: Board, row: number, col: number, player: Player): [number, number][] | null => {
    const directions = [
      [[0, 1], [0, -1]],   // Horizontal
      [[1, 0], [-1, 0]],   // Vertical
      [[1, 1], [-1, -1]],  // Diagonal \
      [[1, -1], [-1, 1]],  // Diagonal /
    ];

    for (const [dir1, dir2] of directions) {
      const line: [number, number][] = [[row, col]];
      
      // Check positive direction
      let r = row + dir1[0];
      let c = col + dir1[1];
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        line.push([r, c]);
        r += dir1[0];
        c += dir1[1];
      }
      
      // Check negative direction
      r = row + dir2[0];
      c = col + dir2[1];
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        line.push([r, c]);
        r += dir2[0];
        c += dir2[1];
      }
      
      if (line.length >= 5) {
        return line;
      }
    }
    
    return null;
  }, []);

  // Check if board is full
  const isBoardFull = useCallback((board: Board): boolean => {
    return board.every(row => row.every(cell => cell !== null));
  }, []);

  // AI move (simple strategy)
  const getAIMove = useCallback((board: Board): [number, number] | null => {
    const emptyCells: [number, number][] = [];
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === null) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    // Simple AI: try to win, then block opponent, then random
    for (const [i, j] of emptyCells) {
      const testBoard = board.map(row => [...row]);
      testBoard[i][j] = 'white';
      if (checkWinner(testBoard, i, j, 'white')) {
        return [i, j];
      }
    }
    
    for (const [i, j] of emptyCells) {
      const testBoard = board.map(row => [...row]);
      testBoard[i][j] = 'black';
      if (checkWinner(testBoard, i, j, 'black')) {
        return [i, j];
      }
    }
    
    // Try to play near existing pieces
    const playedCells: [number, number][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] !== null) {
          playedCells.push([i, j]);
        }
      }
    }
    
    if (playedCells.length > 0) {
      const [centerRow, centerCol] = playedCells[Math.floor(Math.random() * playedCells.length)];
      const neighbors: [number, number][] = [];
      
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = centerRow + di;
          const nj = centerCol + dj;
          if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] === null) {
            neighbors.push([ni, nj]);
          }
        }
      }
      
      if (neighbors.length > 0) {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
      }
    }
    
    // Play center on first move
    if (emptyCells.length === BOARD_SIZE * BOARD_SIZE) {
      return [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)];
    }
    
    // Random move
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }, [checkWinner]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (!gameStarted || board[row][col] !== null || winner) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const winLine = checkWinner(newBoard, row, col, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningLine(winLine);
      setScores(prev => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + 1
      }));
      const finalPlayTime = Math.floor((Date.now() - gameStartTime) / 1000);
      setPlayTime(finalPlayTime);
      setTimeout(() => setShowGameOverDialog(true), 500);
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner('draw');
      setScores(prev => ({ ...prev, draw: prev.draw + 1 }));
      const finalPlayTime = Math.floor((Date.now() - gameStartTime) / 1000);
      setPlayTime(finalPlayTime);
      setTimeout(() => setShowGameOverDialog(true), 500);
      return;
    }

    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  }, [board, currentPlayer, winner, gameStarted, checkWinner, isBoardFull, gameStartTime]);

  // AI turn
  useEffect(() => {
    if (gameMode === 'pve' && currentPlayer === 'white' && gameStarted && !winner) {
      const timer = setTimeout(() => {
        const move = getAIMove(board);
        if (move) {
          handleCellClick(move[0], move[1]);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, gameStarted, winner, board, getAIMove, handleCellClick]);

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentPlayer('black');
    setWinner(null);
    setWinningLine([]);
    setGameStarted(true);
    setShowGameOverDialog(false);
    setGameStartTime(Date.now());
    setPlayTime(0);
  };

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameStarted(true);
    setGameStartTime(Date.now());
    resetGame();
  };

  const handleRestart = () => {
    setShowGameOverDialog(false);
    setLeaderboardRefresh(prev => prev + 1);
    resetGame();
  };

  // 计算游戏结果分数：胜利=1，平局=0.5，失败=0
  const getGameScore = () => {
    if (!winner) return 0;
    if (winner === 'draw') return 0.5;
    // 人机对战时，玩家执黑
    if (gameMode === 'pve') {
      return winner === 'black' ? 1 : 0;
    }
    // 双人对战时，记录当前获胜方
    return 1;
  };

  if (!gameStarted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Mode Selection */}
          <div className="lg:col-span-2">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl mb-4">
                <Circle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">五子棋</h1>
              <p className="text-muted-foreground">经典策略棋类游戏，五子连珠即为胜利</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  选择游戏模式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-6 flex flex-col items-start gap-2"
                  onClick={() => startGame('pvp')}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">双人对战</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    与朋友轮流下棋，在同一设备上进行对战
                  </p>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-auto p-6 flex flex-col items-start gap-2"
                  onClick={() => startGame('pve')}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">人机对战</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    与 AI 对战，挑战不同难度的电脑对手（玩家执黑）
                  </p>
                </Button>
              </CardContent>
            </Card>

            <div className="text-center">
              <Link href="/games">
                <Button variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  返回游戏中心
                </Button>
              </Link>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <GameLeaderboard 
              gameId="gomoku" 
              userId={user?.id}
              refreshTrigger={leaderboardRefresh}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/games">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">五子棋</h1>
                <p className="text-sm text-muted-foreground">
                  {gameMode === 'pvp' ? '双人对战' : '人机对战'} | 
                  <span className={currentPlayer === 'black' ? 'text-black font-medium' : 'text-gray-400'}>
                    {' '}黑棋 {scores.black}
                  </span>
                  {' - '}
                  <span className={currentPlayer === 'white' ? 'text-white font-medium drop-shadow' : 'text-gray-400'}>
                    白棋 {scores.white}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={currentPlayer === 'black' ? 'default' : 'secondary'}>
                黑棋
              </Badge>
              <Badge variant={currentPlayer === 'white' ? 'default' : 'secondary'} className="bg-white text-black border">
                白棋
              </Badge>
            </div>
          </div>

          {/* Game Board */}
          <Card className="p-4 mb-4">
            <div 
              className="relative mx-auto"
              style={{
                width: BOARD_SIZE * 28,
                height: BOARD_SIZE * 28,
              }}
            >
              {/* Grid Background */}
              <div 
                className="absolute inset-0 bg-amber-100 rounded-lg"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #d4a574 1px, transparent 1px),
                    linear-gradient(to bottom, #d4a574 1px, transparent 1px)
                  `,
                  backgroundSize: '28px 28px',
                }}
              />
              
              {/* Cells */}
              {board.map((row, i) => (
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    className="absolute w-7 h-7 flex items-center justify-center focus:outline-none"
                    style={{
                      left: j * 28,
                      top: i * 28,
                    }}
                    onClick={() => handleCellClick(i, j)}
                    disabled={!!cell || !!winner || (gameMode === 'pve' && currentPlayer === 'white')}
                  >
                    {cell && (
                      <div
                        className={`w-6 h-6 rounded-full shadow-md transition-all duration-300 ${
                          cell === 'black' 
                            ? 'bg-black' 
                            : 'bg-white border-2 border-gray-300'
                        } ${
                          winningLine.some(([r, c]) => r === i && c === j)
                            ? 'ring-2 ring-red-500 ring-offset-1 animate-pulse'
                            : ''
                        }`}
                      />
                    )}
                  </button>
                ))
              ))}

              {/* Star Points */}
              {[3, 7, 11].map(i => 
                [3, 7, 11].map(j => (
                  <div
                    key={`star-${i}-${j}`}
                    className="absolute w-2 h-2 bg-gray-600 rounded-full"
                    style={{
                      left: j * 28 + 10,
                      top: i * 28 + 10,
                    }}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Status */}
          <Card className="mb-4">
            <CardContent className="p-4">
              {winner ? (
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {winner === 'draw' ? (
                      <span className="text-muted-foreground">平局！</span>
                    ) : (
                      <span className={winner === 'black' ? 'text-black' : 'text-gray-600'}>
                        {winner === 'black' ? '黑棋' : '白棋'} 获胜！
                      </span>
                    )}
                  </div>
                  <Button onClick={resetGame} className="mt-2">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    再来一局
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${currentPlayer === 'black' ? 'bg-black' : 'bg-white border-2 border-gray-300'}`} />
                    <span className="font-medium">
                      {currentPlayer === 'black' ? '黑棋' : '白棋'} 回合
                    </span>
                    {gameMode === 'pve' && currentPlayer === 'white' && (
                      <span className="text-sm text-muted-foreground">(AI 思考中...)</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={resetGame}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重新开始
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>点击棋盘交叉点下棋 | 先连成五子者获胜</p>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="lg:col-span-1">
          <GameLeaderboard 
            gameId="gomoku" 
            userId={user?.id}
            refreshTrigger={leaderboardRefresh}
          />
        </div>
      </div>

      {/* Game Over Dialog */}
      {user && (
        <GameOverDialog
          isOpen={showGameOverDialog}
          onClose={() => setShowGameOverDialog(false)}
          onRestart={handleRestart}
          gameId="gomoku"
          score={getGameScore()}
          userId={user.id}
          username={user.nickname || user.username}
          gameMode={gameMode}
          playTime={playTime}
          details={{ 
            winner,
            game_mode: gameMode,
            is_pve: gameMode === 'pve',
            player_color: 'black'
          }}
          isWin={winner === 'black' || (gameMode === 'pvp' && winner !== 'draw')}
          title={winner === 'draw' ? '平局！' : winner === 'black' ? '黑棋获胜！' : '白棋获胜！'}
          message={winner === 'draw' ? '势均力敌的对决！' : `恭喜${winner === 'black' ? '黑棋' : '白棋'}取得胜利！`}
        />
      )}
    </div>
  );
}

export default function GomokuPage() {
  return (
    <AuthGuard>
      <GomokuGame />
    </AuthGuard>
  );
}
