import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { MoveHistory } from '../components/Board/MoveHistory';
import { CapturedPieces } from '../components/Board/CapturedPieces';
import { GameControls } from '../components/Board/GameControls';
import { Chat } from '../components/UI/Chat';
import { Modal } from '../components/UI/Modal';
import { useChessGame } from '../hooks/useChessGame';
import { useFirebaseMultiplayer } from '../hooks/useFirebaseMultiplayer';
import { useGameStore } from '../store/gameStore';
import { Users, Copy, Check, Loader2, Wifi, WifiOff, Crown, Share2 } from 'lucide-react';

type GamePhase = 'menu' | 'waiting' | 'playing';

export function PlayFriend() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAutoJoining, setIsAutoJoining] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [showRematchRequest, setShowRematchRequest] = useState(false);
  const [showDrawOffer, setShowDrawOffer] = useState(false);

  const { recordGame, settings } = useGameStore();

  const {
    gameState,
    makeMove,
    resetGame,
    game,
    getLegalMoves,
    loadFen,
  } = useChessGame();

  const handleOpponentMove = useCallback((from: string, to: string, promotion?: string) => {
    console.log('[PlayFriend] handleOpponentMove called:', { from, to, promotion });
    const success = makeMove(from as Square, to as Square, promotion as any);
    console.log('[PlayFriend] Opponent move applied:', success);
    setLastMove({ from: from as Square, to: to as Square });
  }, [makeMove]);

  const {
    peerId,
    opponentConnected,
    playerColor,
    chatMessages,
    createGame,
    joinGame,
    sendMove,
    sendChat,
    requestRematch,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    disconnect,
  } = useFirebaseMultiplayer({
    onMove: handleOpponentMove,
    onRematchRequest: () => setShowRematchRequest(true),
    onOpponentResign: () => {
      setGameResult('Opponent resigned. You win!');
      setShowGameOver(true);
      recordGame(true);
    },
    onDrawOffer: () => setShowDrawOffer(true),
    onDrawAccepted: () => {
      setGameResult('Draw agreed!');
      setShowGameOver(true);
    },
    onGameStateLoaded: (fen: string) => {
      loadFen(fen);
    },
  });

  // Check for game over
  useEffect(() => {
    if (!gameState.isGameOver) return;

    setShowGameOver(true);
    if (gameState.isCheckmate) {
      const winner = gameState.turn === 'w' ? 'Black' : 'White';
      setGameResult(`Checkmate! ${winner} wins!`);
      const didWin = (winner === 'White' && playerColor === 'w') || (winner === 'Black' && playerColor === 'b');
      recordGame(didWin);
    } else if (gameState.isStalemate) {
      setGameResult('Stalemate! The game is a draw.');
    } else if (gameState.isDraw) {
      setGameResult('Draw!');
    }
  }, [gameState.isGameOver, gameState.isCheckmate, gameState.isStalemate, gameState.isDraw, gameState.turn, playerColor, recordGame]);

  // Start game when opponent connects
  useEffect(() => {
    if (opponentConnected && phase === 'waiting') {
      setPhase('playing');
    }
  }, [opponentConnected, phase]);

  // Auto-join if there's a ?join= parameter in the URL
  useEffect(() => {
    const joinCodeFromUrl = searchParams.get('join');
    if (joinCodeFromUrl && !isAutoJoining && phase === 'menu') {
      setIsAutoJoining(true);
      setSearchParams({});
      joinGame(joinCodeFromUrl.toUpperCase()).then((success) => {
        if (success) {
          setPhase('playing');
        } else {
          alert('Could not connect to game. The host may have left or the code is invalid.');
        }
        setIsAutoJoining(false);
      });
    }
  }, [searchParams, setSearchParams, joinGame, isAutoJoining, phase]);

  const handleCreateGame = async () => {
    try {
      await createGame();
      setPhase('waiting');
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please check your internet connection and try again.');
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim()) return;
    try {
      const success = await joinGame(joinCode.trim().toUpperCase());
      if (success) {
        setPhase('playing');
      } else {
        alert('Failed to join game. Check the code and try again.');
      }
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const getShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/play-friend?join=${peerId}`;
  };

  const copyGameLink = () => {
    if (peerId) {
      navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareGame = async () => {
    if (peerId && navigator.share) {
      try {
        await navigator.share({
          title: 'Play Chess with me!',
          text: 'Click the link to join my chess game:',
          url: getShareUrl(),
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        copyGameLink();
      }
    } else {
      copyGameLink();
    }
  };

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      console.log('[PlayFriend] handleMove called:', { from, to, promotion, turn: game.turn(), playerColor });
      if (game.turn() !== playerColor) {
        console.log('[PlayFriend] Not my turn, ignoring');
        return false;
      }

      const success = makeMove(from, to, promotion as any);
      console.log('[PlayFriend] makeMove result:', success);
      if (success) {
        setLastMove({ from, to });
        // Pass the updated FEN for game persistence
        const newFen = game.fen();
        console.log('[PlayFriend] Calling sendMove with FEN:', newFen);
        sendMove(from, to, promotion, newFen);
      }
      return success;
    },
    [game, playerColor, makeMove, sendMove]
  );

  const handleResign = () => {
    resign();
    setGameResult(`You resigned. ${playerColor === 'w' ? 'Black' : 'White'} wins!`);
    setShowGameOver(true);
    recordGame(false);
  };

  const handleNewGame = () => {
    resetGame();
    setShowGameOver(false);
    setLastMove(undefined);
    disconnect();
    setPhase('menu');
  };

  const handleRematch = () => {
    requestRematch();
    resetGame();
    setShowGameOver(false);
    setLastMove(undefined);
  };

  const handleAcceptRematch = () => {
    setShowRematchRequest(false);
    resetGame();
    setLastMove(undefined);
  };

  const handleAcceptDraw = () => {
    acceptDraw();
    setShowDrawOffer(false);
    setGameResult('Draw agreed!');
    setShowGameOver(true);
  };

  // Find king square for check highlight
  const findKingSquare = (): Square | undefined => {
    if (!gameState.isCheck) return undefined;
    const board = game.board();
    const kingColor = game.turn();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.type === 'k' && piece.color === kingColor) {
          const file = String.fromCharCode(97 + j);
          const rank = 8 - i;
          return `${file}${rank}` as Square;
        }
      }
    }
    return undefined;
  };

  // Menu Phase
  if (phase === 'menu') {
    // Show loading if auto-joining from URL
    if (isAutoJoining) {
      return (
        <div className="min-h-screen py-8">
          <div className="max-w-xl mx-auto px-4">
            <div className="card p-8 text-center">
              <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Joining game...</h2>
              <p className="text-slate-400">Connecting to your friend's game</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Play with Friends</h1>
            <p className="text-slate-400">Create a game and share the link, or join with a friend's code</p>
          </div>

          <div className="space-y-4">
            {/* Create Game */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Create New Game</h2>
              <button
                onClick={handleCreateGame}
                className="btn btn-primary w-full"
              >
                Create Game
              </button>
              <p className="text-sm text-slate-400 mt-3">
                You'll get a code to share with your friend
              </p>
            </div>

            {/* Join Game */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Join a Game</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter game code"
                  className="input uppercase tracking-widest text-center font-mono"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinGame}
                  disabled={joinCode.length < 4}
                  className="btn btn-success"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting Phase
  if (phase === 'waiting') {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="card p-8 text-center">
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Waiting for opponent...</h2>
            <p className="text-slate-400 mb-4">Share this link with your friend via WhatsApp, text, or any app:</p>

            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="text-sm text-slate-300 bg-slate-900 px-4 py-3 rounded-lg break-all max-w-full">
                {getShareUrl()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={shareGame}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Share2 size={20} />
                  Share Link
                </button>
                <button
                  onClick={copyGameLink}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-xs text-slate-500">Game code: {peerId}</p>
            </div>

            <button
              onClick={handleNewGame}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Phase
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Board */}
          <div className="flex-shrink-0">
            {/* Opponent info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Opponent</div>
                <div className="text-xs text-slate-400">{playerColor === 'w' ? 'Black' : 'White'}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {opponentConnected ? (
                  <Wifi size={16} className="text-green-400" />
                ) : (
                  <WifiOff size={16} className="text-red-400" />
                )}
              </div>
            </div>

            {/* Board */}
            <ChessBoard
              fen={gameState.fen}
              playerColor={playerColor}
              onMove={handleMove}
              disabled={game.turn() !== playerColor || gameState.isGameOver || !opponentConnected}
              showCoordinates={settings.showCoordinates}
              showLegalMoves={settings.showLegalMoves}
              boardTheme={settings.boardTheme}
              autoQueen={settings.autoQueen}
              premoveEnabled={settings.premoveEnabled}
              soundEnabled={settings.soundEnabled}
              lastMove={lastMove}
              isCheck={gameState.isCheck}
              kingSquare={findKingSquare()}
              getLegalMoves={getLegalMoves}
            />

            {/* Player info */}
            <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <Crown size={20} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">You</div>
                <div className="text-xs text-slate-400">{playerColor === 'w' ? 'White' : 'Black'}</div>
              </div>
            </div>

            {/* Debug info */}
            <div className="mt-4 p-3 rounded-lg bg-yellow-900/50 text-xs text-yellow-200 font-mono">
              <div>Game: {peerId}</div>
              <div>Turn: {game.turn() === 'w' ? 'White' : 'Black'}</div>
              <div>You: {playerColor === 'w' ? 'White' : 'Black'}</div>
              <div>Can move: {game.turn() === playerColor && opponentConnected ? 'YES' : 'NO'}</div>
              <div>Opponent: {opponentConnected ? 'Connected' : 'Disconnected'}</div>
              <div>Moves: {gameState.moveHistory.length}</div>
              <button
                onClick={() => {
                  alert('Testing sendMove: e2 to e4');
                  sendMove('e2', 'e4', undefined, 'test-fen');
                  setTimeout(() => alert('sendMove completed (check Firebase)'), 1000);
                }}
                className="mt-2 px-2 py-1 bg-yellow-600 text-black rounded"
              >
                Test Send Move
              </button>
            </div>
          </div>

          {/* Right side - Info panels */}
          <div className="flex-1 space-y-4">
            <GameControls
              onResign={handleResign}
              onOfferDraw={offerDraw}
              onReset={handleNewGame}
              isGameOver={gameState.isGameOver}
            />

            <MoveHistory moves={gameState.moveHistory} />

            <CapturedPieces
              whiteCaptured={gameState.capturedPieces.white}
              blackCaptured={gameState.capturedPieces.black}
            />

            <Chat
              messages={chatMessages}
              onSend={sendChat}
              disabled={!opponentConnected}
            />
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={showGameOver} onClose={() => setShowGameOver(false)} title="Game Over">
        <div className="text-center py-4">
          <p className="text-xl font-semibold text-white mb-6">{gameResult}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRematch} className="btn btn-primary">
              Rematch
            </button>
            <button onClick={handleNewGame} className="btn btn-secondary">
              New Game
            </button>
          </div>
        </div>
      </Modal>

      {/* Rematch Request Modal */}
      <Modal isOpen={showRematchRequest} onClose={() => setShowRematchRequest(false)} title="Rematch Request">
        <div className="text-center py-4">
          <p className="text-lg text-white mb-6">Your opponent wants a rematch!</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleAcceptRematch} className="btn btn-success">
              Accept
            </button>
            <button onClick={() => setShowRematchRequest(false)} className="btn btn-secondary">
              Decline
            </button>
          </div>
        </div>
      </Modal>

      {/* Draw Offer Modal */}
      <Modal isOpen={showDrawOffer} onClose={() => { declineDraw(); setShowDrawOffer(false); }} title="Draw Offer">
        <div className="text-center py-4">
          <p className="text-lg text-white mb-6">Your opponent offers a draw</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleAcceptDraw} className="btn btn-success">
              Accept
            </button>
            <button onClick={() => { declineDraw(); setShowDrawOffer(false); }} className="btn btn-secondary">
              Decline
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
