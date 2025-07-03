import { useEffect, useState } from 'react';

export default function Home(){
    const[isPlaying, setIsPlaying] = useState(false);
    const[clickItems, setClickItems] = useState({});
    const[numberOfPoints, setNumberOfPoints] = useState(0);
    const [time, setTime] = useState(0);
    const [currentNext, setCurrentNext] = useState(1);
    const [gameStatus, setGameStatus] = useState('');
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [autoPlayInterval, setAutoPlayInterval] = useState(null);
    const [hiddenItems, setHiddenItems] = useState(new Set());
    const [pointPositions, setPointPositions] = useState([]);
    const [correctClicks, setCorrectClicks] = useState(new Set());
    

    useEffect(() => {
        let interval = null;
        
        if (isPlaying && gameStatus === '') {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 0.1);
            }, 100);
        } else {
            clearInterval(interval);
        }
        
        return () => clearInterval(interval);
    }, [isPlaying, gameStatus]);

   
    useEffect(() => {
        if (isAutoPlay && isPlaying && gameStatus === '') {
            const interval = setInterval(() => {
                handleClickItems(currentNext);
            }, 1000);
            
            setAutoPlayInterval(interval);
            return () => clearInterval(interval);
        } else {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                setAutoPlayInterval(null);
            }
        }
    }, [isAutoPlay, isPlaying, currentNext, gameStatus]);

    
    const generateRandomPositions = (count) => {
        const positions = [];
        const containerWidth = 740; 
        const containerHeight = 540; 
        const itemSize = 60;
        const margin = 15;
        
        for (let i = 0; i < count; i++) {
            let position;
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
                position = {
                    left: 30 + Math.random() * (containerWidth - itemSize), 
                    top: 30 + Math.random() * (containerHeight - itemSize)  
                };
                attempts++;
            } while (
                attempts < maxAttempts && 
                positions.some(pos => 
                    Math.abs(pos.left - position.left) < itemSize + margin &&
                    Math.abs(pos.top - position.top) < itemSize + margin
                )
            );
            
            positions.push(position);
        }
        return positions;
    };
    
    const handleButtonChange = () => {
        const currentPoints = numberOfPoints;
        
        setIsPlaying(true);
        setTime(0);
        setCurrentNext(1);
        setGameStatus('');
        setClickItems({});
        setHiddenItems(new Set());
        setCorrectClicks(new Set());
        setIsAutoPlay(false);
        
        setPointPositions(generateRandomPositions(currentPoints));
        
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            setAutoPlayInterval(null);
        }
    }
    
    const handleChange = (e) => {
        setNumberOfPoints(Number(e.target.value));
    }

    const handleAutoPlay = () => {
        if (isPlaying && gameStatus === '') {
            setIsAutoPlay(!isAutoPlay);
        }
    }

    const handleClickItems = (itemValue) => {
        if (gameStatus !== '' || clickItems[itemValue] || hiddenItems.has(itemValue)) return;

        const isCorrect = itemValue === currentNext;
        
        if (isCorrect) {
            setClickItems(prev => ({
                ...prev,
                [itemValue]: time.toFixed(1)
            }));
            
            setCorrectClicks(prev => new Set([...prev, itemValue]));
            
            setTimeout(() => {
                setHiddenItems(prev => new Set([...prev, itemValue]));
                setClickItems(prev => {
                    const newItems = {...prev};
                    delete newItems[itemValue];
                    return newItems;
                });
            }, 1000);

            if (currentNext < pointPositions.length) {
                setCurrentNext(currentNext + 1);
            } else {
                setTimeout(() => {
                    setGameStatus('allClear');
                    setIsPlaying(false);
                    setIsAutoPlay(false);
                }, 1000);
            }
        } else {
            setClickItems(prev => ({
                ...prev,
                [itemValue]: time.toFixed(1)
            }));
            
            setTimeout(() => {
                setGameStatus('gameOver');
                setIsPlaying(false);
                setIsAutoPlay(false);
            }, 1000);
        }
    }

    const getItemClasses = (item) => {
        let classes = 'main__number';
        
        if (clickItems[item] !== undefined) {
            if (correctClicks.has(item)) {
                classes += ' main__number--clicked-correct';
            } else {
                classes += ' main__number--clicked-wrong';
            }
        }
        
        if (isAutoPlay) {
            classes += ' main__number--auto-play';
        }
        
        return classes;
    }
    
    const points = [...Array(pointPositions.length)].map((_, i) => i + 1);
    
    return(
        <div className="home">
            <h1>Let's Play</h1>
            
            <div className="input-section">
                <label>Points:</label>
                <input 
                    type="number"
                    onChange={handleChange} 
                    value={numberOfPoints || ''}
                    min="1"
                    max="50"
                />
            </div>
            
            <div className="time-display">
                Time: {time.toFixed(1)}s
            </div>
            
            <div className="button__main">
                <button className="button--change" onClick={handleButtonChange}>
                    {isPlaying ? "Restart" : "Play"}
                </button>
                <button 
                    className="button--hide" 
                    style={{display: isPlaying && gameStatus === '' ? "inline-block" : "none"}}
                    onClick={handleAutoPlay}
                >
                    Auto Play {isAutoPlay ? "OFF" : "ON"}
                </button>
            </div>

         
            {gameStatus === 'gameOver' && (
                <div className="game-status game-status--game-over">
                    GAME OVER
                </div>
            )}

            {gameStatus === 'allClear' && (
                <div className="game-status game-status--all-clear">
                    ALL CLEAR!
                </div>
            )}

            <div className="main-container">
                <div className="main">
                    {isPlaying && gameStatus === '' && points
                        .filter(item => !hiddenItems.has(item))
                        .map((item) => {
                            const isClicked = clickItems[item] !== undefined;
                            const clickTime = clickItems[item];
                            const position = pointPositions[item - 1];
                            
                            return (
                                <div 
                                    className={getItemClasses(item)}
                                    key={item}
                                    style={{
                                        left: `${position?.left || 0}px`,
                                        top: `${position?.top || 0}px`,
                                    }} 
                                    onClick={() => !isAutoPlay && handleClickItems(item)}
                                >
                                    <div className="number-text">{item}</div>
                                    {isClicked && (
                                        <div className="click-time">
                                            {clickTime}s
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {isPlaying && (
                <div className="next-indicator">
                    Next: {gameStatus === '' ? currentNext : (gameStatus === 'allClear' ? 'Completed!' : currentNext)}
                </div>
            )}
        </div>
    )
}
