import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
    const [decks, setDecks] = useState(6);
    const [bankroll, setBankroll] = useState(1000);
    const [betUnit, setBetUnit] = useState(10);
    const [runningCount, setRunningCount] = useState(0);
    const [trueCount, setTrueCount] = useState(0);
    const [cardCounts, setCardCounts] = useState({});
    const [totalCardsPlayed, setTotalCardsPlayed] = useState(0);
    const [blackjackPayout, setBlackjackPayout] = useState('3:2');
    const [dealerHitsSoft17, setDealerHitsSoft17] = useState(true);
    const [resplittingAllowed, setResplittingAllowed] = useState(true);
    const [resplitLimit, setResplitLimit] = useState(3); // Max resplits
    const [doubleAfterSplit, setDoubleAfterSplit] = useState(true);
    const [doubleOnAny, setDoubleOnAny] = useState(true);

    // Advantage Lookup Table (True Count -> Advantage)
    const advantageTable = {
        '-5': -0.035, '-4': -0.028, '-3': -0.021, '-2': -0.014, '-1': -0.007,
        '0': 0,
        '1': 0.007, '2': 0.014, '3': 0.021, '4': 0.028, '5': 0.035,
        '6': 0.042, '7': 0.049, '8': 0.056, '9': 0.063, '10': 0.070,
    };

    const getAdvantage = (trueCount) => {
        const tc = Math.round(trueCount); // Ensure integer
        if (tc <= -5) return advantageTable['-5'];
        if (tc >= 10) return advantageTable['10'];
        return advantageTable[tc];
    };


    const initialCardCounts = (numDecks) => {
        let counts = {};
        for (let i = 2; i <= 11; i++) {
            counts[i] = 4 * numDecks; // 4 of each card per deck
            if (i === 10) {
                counts[i] = 16 * numDecks; // J, Q, K also count as 10
            }
        }
        return counts;
    };

    useEffect(() => {
        setCardCounts(initialCardCounts(decks));
        // Suggest bet unit based on bankroll (1-2%)
        setBetUnit(Math.max(1, Math.round(bankroll * 0.015))); // Targeting 1.5%
    }, [decks, bankroll]);

    useEffect(() => {
        // Recalculate bet unit whenever bankroll changes (1-2%)
        setBetUnit(Math.max(1, Math.round(bankroll * 0.015)));
      }, [bankroll]);


    const handleCardClick = (value) => {
        let countChange = 0;
        // Zen Count Logic
        if (value >= 2 && value <= 3 || value === 7) {
            countChange = 1;
        } else if (value >= 4 && value <= 6) {
            countChange = 2;
        } else if (value === 10) {
            countChange = -2;
        } else if (value === 11) {
            countChange = -1;
        }

        const newRunningCount = runningCount + countChange;
        setRunningCount(newRunningCount);

        // Update card counts
        setCardCounts(prevCounts => ({
            ...prevCounts,
            [value]: prevCounts[value] - 1,
        }));

        setTotalCardsPlayed(prev => prev + 1);

        // Calculate True Count
        const remainingDecks = Math.max(1, decks - (totalCardsPlayed / 52));
        const calculatedTrueCount = Math.round(newRunningCount / remainingDecks);
        setTrueCount(calculatedTrueCount);
    };

    const handleReset = () => {
        setRunningCount(0);
        setTrueCount(0);
        setCardCounts(initialCardCounts(decks));
        setTotalCardsPlayed(0);
    };

    const handleDecksChange = (event) => {
        setDecks(parseInt(event.target.value, 10));
        handleReset();
    };

    const handleBankrollChange = (event) => {
        setBankroll(parseFloat(event.target.value));
    };

    const getBetSuggestion = () => {
        // Half-Kelly Betting
        const advantage = getAdvantage(trueCount);
        const odds = blackjackPayout === '3:2' ? 1.5 : 1.2; // Use actual BJ payout.
        let bet = Math.round((bankroll * (advantage / odds)) / 2);

        // Ensure bet is at least the bet unit, and not more than bankroll
        bet = Math.max(betUnit, bet);
        bet = Math.min(bankroll, bet);
        return bet;
    };

    const totalCardsInShoe = decks * 52;
    const remainingCards = totalCardsInShoe - totalCardsPlayed;
    const shoePenetration = ((totalCardsPlayed / totalCardsInShoe) * 100).toFixed(2);

    return (
        <div className="app">
            <div className={`advantage-indicator ${trueCount >= 1 ? 'player' : 'house'}`}>
                {trueCount >= 1 ? 'Player Advantage' : 'House Advantage'}
            </div>
            <div className="controls">
                <label>
                    Session Bankroll:
                    <input
                        type="number"
                        value={bankroll}
                        onChange={handleBankrollChange}
                        min="1"
                    />
                </label>
                <label>
                    Bet Unit:
                    <input
                        type="number"
                        value={betUnit}
                        readOnly
                    />
                </label>
                <label>
                    Decks:
                    <select value={decks} onChange={handleDecksChange}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={4}>4</option>
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                    </select>
                </label>
                <button onClick={handleReset}>Reset</button>
            </div>
            <div className="card-buttons">
                <div className="card-button-row">
                    {[2, 3, 4, 5, 6].map((value) => (
                        <div key={value} className="card-button-container">
                            <span>Played: {initialCardCounts(decks)[value] - cardCounts[value]}</span>
                            <button onClick={() => handleCardClick(value)}>
                                {value}
                            </button>
                            <span>Remaining: {cardCounts[value]}</span>
                        </div>
                    ))}
                </div>
                <div className="card-button-row">
                    {[7, 8, 9, 10, 11].map((value) => (
                        <div key={value} className="card-button-container">
                            <span>Played: {initialCardCounts(decks)[value] - cardCounts[value]}</span>
                            <button onClick={() => handleCardClick(value)}>
                                {value === 10 ? '10/J/Q/K' : value === 11 ? 'A' : value}
                            </button>
                            <span>Remaining: {cardCounts[value]}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="count-display">
                <p>Running Count: <b>{runningCount}</b></p>
                <p>True Count: <b>{trueCount}</b></p>
            </div>
            <div className="bet-suggestion">
                <p>Suggested Bet: <b>${getBetSuggestion()}</b></p>
            </div>
            <div className="shoe-stats">
                <p>Total Cards Played: <b>{totalCardsPlayed}</b></p>
                <p>Total Cards in Shoe: <b>{totalCardsInShoe}</b></p>
                <p>Remaining Cards: <b>{remainingCards}</b></p>
                <p>Shoe Penetration: <b>{shoePenetration}%</b></p>
            </div>

            <div className="game-rules">
                <label>
                    Blackjack Pays:
                    <select value={blackjackPayout} onChange={(e) => setBlackjackPayout(e.target.value)}>
                        <option value="3:2">3:2</option>
                        <option value="6:5">6:5</option>
                    </select>
                </label>

                <label>
                    Dealer Hits Soft 17:
                    <select value={dealerHitsSoft17} onChange={(e) => setDealerHitsSoft17(e.target.value === 'true')}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>

                <label>
                    Resplitting Allowed:
                    <select value={resplittingAllowed} onChange={(e) => setResplittingAllowed(e.target.value === 'true')}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>
                {resplittingAllowed && (
                    <label>
                        Resplit Limit:
                        <select value={resplitLimit} onChange={(e) => setResplitLimit(parseInt(e.target.value))}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                    </label>
                )}

                <label>
                    Double After Split:
                    <select value={doubleAfterSplit} onChange={(e) => setDoubleAfterSplit(e.target.value === 'true')}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>
                <label>
                    Double on:
                    <select value={doubleOnAny} onChange={(e) => setDoubleOnAny(e.target.value === 'true')}>
                        <option value={true}>Any</option>
                        <option value={false}>9/10/11 Only</option>
                    </select>
                </label>

            </div>
        </div>
    );
}

export default App;
