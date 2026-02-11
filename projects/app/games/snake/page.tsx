'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Trophy, 
  Gamepad2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { GameLeaderboard } from '@/components/GameLeaderboard';
import { GameOverDialog } from '@/components/GameOverDialog';
import { SupabaseAuth } from '@/lib/supabase-auth';
import { AuthGuard } from '@/components/AuthGuard';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;

function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [user, setUser] = useState<any>(null);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [playTime, setPlayTime] = useState<number>(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // 获取当前用户
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await SupabaseAuth.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) {
      setHighScore(parseInt(saved));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setShowGameOverDialog(false);
    setGameStartTime(Date.now());
    setPlayTime(0);
  }, [generateFood]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isPlaying || gameOver) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        resetGame();
      }
      return;
    }

    if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      setIsPaused(prev => !prev);
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        if (direction !== 'DOWN') setNextDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (direction !== 'UP') setNextDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (direction !== 'RIGHT') setNextDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (direction !== 'LEFT') setNextDirection('RIGHT');
        break;
    }
  }, [direction, isPlaying, gameOver, resetGame]);

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setDirection(nextDirection);
      
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };

        // Move head
        switch (nextDirection) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          const finalPlayTime = Math.floor((Date.now() - gameStartTime) / 1000);
          setPlayTime(finalPlayTime);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
          }
          setTimeout(() => setShowGameOverDialog(true), 500);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setIsPlaying(false);
          const finalPlayTime = Math.floor((Date.now() - gameStartTime) / 1000);
          setPlayTime(finalPlayTime);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
          }
          setTimeout(() => setShowGameOverDialog(true), 500);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          // Increase speed every 50 points
          if (score > 0 && score % 50 === 0) {
            setSpeed(s => Math.max(50, s - 10));
          }
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, isPaused, nextDirection, food, score, highScore, speed, generateFood, gameStartTime]);

  // Focus board on mount
  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  const handleDirectionButton = (newDirection: Direction) => {
    if (!isPlaying || gameOver) return;
    
    const opposites: Record<Direction, Direction> = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT',
    };
    
    if (direction !== opposites[newDirection]) {
      setNextDirection(newDirection);
    }
  };

  const handleRestart = () => {
    setShowGameOverDialog(false);
    setLeaderboardRefresh(prev => prev + 1);
    resetGame();
  };

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
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  贪吃蛇
                </h1>
                <p className="text-sm text-muted-foreground">经典休闲游戏</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                最高分: {highScore}
              </Badge>
            </div>
          </div>

          {/* Score */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg">
                  分数: <span className="font-bold text-primary">{score}</span>
                </div>
                <div className="flex gap-2">
                  {isPlaying && !gameOver && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={resetGame}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    重新开始
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Board */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div
                ref={boardRef}
                tabIndex={0}
                className="relative mx-auto rounded-lg border-2 border-border bg-muted/20 outline-none"
                style={{
                  width: GRID_SIZE * CELL_SIZE,
                  height: GRID_SIZE * CELL_SIZE,
                }}
              >
                {/* Grid Lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ opacity: 0.3 }}
                >
                  {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                    <g key={i}>
                      <line
                        x1={i * CELL_SIZE}
                        y1={0}
                        x2={i * CELL_SIZE}
                        y2={GRID_SIZE * CELL_SIZE}
                        stroke="currentColor"
                        strokeWidth={1}
                      />
                      <line
                        x1={0}
                        y1={i * CELL_SIZE}
                        x2={GRID_SIZE * CELL_SIZE}
                        y2={i * CELL_SIZE}
                        stroke="currentColor"
                        strokeWidth={1}
                      />
                    </g>
                  ))}
                </svg>

                {/* Snake */}
                {snake.map((segment, index) => (
                  <div
                    key={index}
                    className="absolute rounded-md transition-all duration-75"
                    style={{
                      left: segment.x * CELL_SIZE + 1,
                      top: segment.y * CELL_SIZE + 1,
                      width: CELL_SIZE - 2,
                      height: CELL_SIZE - 2,
                      backgroundColor: index === 0 ? '#22c55e' : '#4ade80',
                      boxShadow: index === 0 ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
                      zIndex: 10,
                    }}
                  />
                ))}

                {/* Food */}
                <div
                  className="absolute rounded-full animate-pulse"
                  style={{
                    left: food.x * CELL_SIZE + 3,
                    top: food.y * CELL_SIZE + 3,
                    width: CELL_SIZE - 6,
                    height: CELL_SIZE - 6,
                    backgroundColor: '#ef4444',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                    zIndex: 5,
                  }}
                />

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg z-20">
                    <div className="text-center text-white">
                      <h2 className="text-3xl font-bold mb-2">游戏结束</h2>
                      <p className="text-xl mb-2">得分: {score}</p>
                      {score === highScore && score > 0 && (
                        <p className="text-yellow-400 mb-4">🎉 新纪录！</p>
                      )}
                      <Button onClick={resetGame} size="lg">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        再来一次
                      </Button>
                      <p className="text-sm text-gray-400 mt-4">按空格键重新开始</p>
                    </div>
                  </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-20">
                    <div className="text-center text-white">
                      <Pause className="h-16 w-16 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold">游戏暂停</h2>
                      <p className="text-gray-300 mt-2">按空格键或点击按钮继续</p>
                      <Button onClick={() => setIsPaused(false)} className="mt-4">
                        <Play className="mr-2 h-4 w-4" />
                        继续游戏
                      </Button>
                    </div>
                  </div>
                )}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg z-20">
                    <div className="text-center text-white">
                      <Gamepad2 className="h-16 w-16 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">贪吃蛇</h2>
                      <p className="text-gray-300 mb-2">使用方向键或 WASD 控制</p>
                      <p className="text-sm text-gray-400 mb-6">吃掉红色食物，不要撞墙或撞到自己</p>
                      <Button onClick={resetGame} size="lg">
                        <Play className="mr-2 h-4 w-4" />
                        开始游戏
                      </Button>
                      <p className="text-sm text-gray-400 mt-4">按空格键开始</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-center mb-4 text-sm text-muted-foreground">
                屏幕按钮控制
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-16 h-16"
                  onClick={() => handleDirectionButton('UP')}
                  disabled={!isPlaying || gameOver}
                >
                  <ChevronUp className="h-6 w-6" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-16 h-16"
                    onClick={() => handleDirectionButton('LEFT')}
                    disabled={!isPlaying || gameOver}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-16 h-16"
                    onClick={() => handleDirectionButton('DOWN')}
                    disabled={!isPlaying || gameOver}
                  >
                    <ChevronDown className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-16 h-16"
                    onClick={() => handleDirectionButton('RIGHT')}
                    disabled={!isPlaying || gameOver}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>键盘: 方向键 / WASD 移动 | 空格键 暂停/继续</p>
            <p>每得 50 分速度会加快</p>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="lg:col-span-1">
          <GameLeaderboard 
            gameId="snake" 
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
          gameId="snake"
          score={score}
          userId={user.id}
          username={user.nickname || user.username}
          playTime={playTime}
          details={{ high_score: highScore }}
        />
      )}
    </div>
  );
}

export default function SnakePage() {
  return (
    <AuthGuard>
      <SnakeGame />
    </AuthGuard>
  );
}
