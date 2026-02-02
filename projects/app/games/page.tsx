'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Trophy } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

export default function GamesPage() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gridSize = 20;
  const boardSize = 400;

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * (boardSize / gridSize)),
      y: Math.floor(Math.random() * (boardSize / gridSize)),
    };
    setFood(newFood);
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    generateFood();
  }, [generateFood]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying || gameOver) return;

    const key = e.key.toLowerCase();
    if (key === 'arrowup' && direction.y !== 1) {
      setDirection({ x: 0, y: -1 });
    } else if (key === 'arrowdown' && direction.y !== -1) {
      setDirection({ x: 0, y: 1 });
    } else if (key === 'arrowleft' && direction.x !== 1) {
      setDirection({ x: -1, y: 0 });
    } else if (key === 'arrowright' && direction.x !== -1) {
      setDirection({ x: 1, y: 0 });
    }
  }, [direction, isPlaying, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = newSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // 检查碰撞
        if (
          newHead.x < 0 ||
          newHead.x >= boardSize / gridSize ||
          newHead.y < 0 ||
          newHead.y >= boardSize / gridSize ||
          newSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
          }
          return prevSnake;
        }

        newSnake.unshift(newHead);

        // 检查是否吃到食物
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 100);

    gameLoopRef.current = gameLoop;
    return () => clearInterval(gameLoop);
  }, [direction, isPlaying, gameOver, food, score, highScore, generateFood]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">小游戏</h1>
        <p className="text-muted-foreground">放松一下，玩个贪吃蛇</p>
      </div>

      <Card className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-lg font-semibold">
            分数: <span className="text-primary">{score}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Trophy className="h-4 w-4 mr-1" />
            最高分: {highScore}
          </div>
        </div>

        <div
          className="mx-auto mb-6 rounded-lg border-2 border-border bg-muted/20 relative"
          style={{ width: boardSize, height: boardSize }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute rounded-sm transition-all duration-100"
              style={{
                left: segment.x * gridSize + 1,
                top: segment.y * gridSize + 1,
                width: gridSize - 2,
                height: gridSize - 2,
                backgroundColor: index === 0 ? '#f472b6' : '#fb7185',
                boxShadow: index === 0 ? '0 0 10px rgba(244, 114, 182, 0.5)' : 'none',
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute rounded-full"
            style={{
              left: food.x * gridSize + 2,
              top: food.y * gridSize + 2,
              width: gridSize - 4,
              height: gridSize - 4,
              backgroundColor: '#4ade80',
              boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
            }}
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">游戏结束</h2>
                <p className="text-xl mb-4">得分: {score}</p>
                <Button onClick={resetGame} className="bg-white text-black hover:bg-gray-200">
                  再来一次
                </Button>
              </div>
            </div>
          )}

          {/* Start Overlay */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-2">贪吃蛇</h2>
                <p className="mb-4">使用方向键控制蛇的移动</p>
                <Button onClick={resetGame} className="bg-white text-black hover:bg-gray-200">
                  开始游戏
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDirection({ x: 0, y: -1 })}
              disabled={!isPlaying || gameOver}
            >
              ↑
            </Button>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDirection({ x: -1, y: 0 })}
              disabled={!isPlaying || gameOver}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDirection({ x: 0, y: 1 })}
              disabled={!isPlaying || gameOver}
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDirection({ x: 1, y: 0 })}
              disabled={!isPlaying || gameOver}
            >
              →
            </Button>
          </div>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={resetGame}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              重新开始
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>使用键盘方向键或屏幕按钮控制蛇的移动</p>
        </div>
      </Card>
    </div>
  );
}
