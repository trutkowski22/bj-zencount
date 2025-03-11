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
    const [doubleOn9_10_11, setDoubleOn9_10_11] = useState(false);
    const [doubleOn10_11, setDoubleOn10_11] = useState(false);
    const [doubleOn11, setDoubleOn11] = useState(false);
    const [noHoleCard, setNoHoleCard] = useState(false);
    const [resplitAces, setResplitAces] = useState(false);
    const [blackjackPays2To1, setBlackjackPays2To1] = useState(false);
    const [lateSurrender, setLateSurrender] = useState(false);
    const [earlySurrender, setEarlySurrender] = useState(false);

    const handleDouble9_10_11Change = (event) => {
        const value = event.target.value === 'true';
        setDoubleOn9_10_11(value);
        if (value) {
            setDoubleOnAny(false);
            setDoubleOn10_11(false);
            setDoubleOn11(false);
        }
    };
    const handleDouble10_11Change = (event) => {
        const value = event.target.value === 'true';
        setDoubleOn10_11(value);
        if (value) {
            setDoubleOnAny(false);
            setDoubleOn9_10_11(false);
            setDoubleOn11(false);
        }
    };
    const handleDouble11Change = (event) => {
        const value = event.target.value === 'true';
        setDoubleOn11(value);
        if (value) {
            setDoubleOnAny(false);
            setDoubleOn9_10_11(false);
            setDoubleOn10_11(false);
        }
    };

    const handleNoHoleCardChange = (event) => {
        setNoHoleCard(event.target.value === 'true');
    };

    const handleResplitAcesChange = (event) => {
        const value = event.target.value === 'true';
        setResplitAces(value);
        if (value) {
            setResplittingAllowed(true); // Ensure consistency
        }
    };
    const handleBlackjackPays2To1Change = (event) => {
        const value = event.target.value === 'true';
        setBlackjackPays2To1(value);
        if (value) {
            setBlackjackPayout('2:1');
        }
    };

    const handleLateSurrenderChange = (event) => {
        setLateSurrender(event.target.value === 'true');
    };
    const handleEarlySurrenderChange = (event) => {
        const value = event.target.value === 'true';
        setEarlySurrender(value);
        if (value) {
            setLateSurrender(false);
        }
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
    const calculateBaseAdvantage = () => {
        let tv1, tv2, tv3, tv4, tv5, tv6;

        // --- Base Advantage Calculation (from the provided code) ---
        if (dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && !lateSurrender) {
            tv1 = -.189; tv2 = -.3; tv3 = -.599; tv4 = -.738; tv5 = -.784; tv6 = -.807;
        }
        if (dealerHitsSoft17 && resplitAces && !doubleAfterSplit && !lateSurrender) {
            tv1 = -.150; tv2 = -.26; tv3 = -.529; tv4 = -.654; tv5 = -.696; tv6 = -.717;
        }
        if (dealerHitsSoft17 && !resplitAces && doubleAfterSplit && !lateSurrender) {
            tv1 = -.046; tv2 = -.17; tv3 = -.456; tv4 = -.595; tv5 = -.640; tv6 = -.664;
        }
        if (dealerHitsSoft17 && resplitAces && doubleAfterSplit && !lateSurrender) {
            tv1 = -.004; tv2 = -.12; tv3 = -.387; tv4 = -.512; tv5 = -.552; tv6 = -.573;
        }
        if (dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && lateSurrender) {
            tv1 = -.163; tv2 = -.3; tv3 = -.546; tv4 = -.661; tv5 = -.696; tv6 = -.719;
        }
        if (dealerHitsSoft17 && resplitAces && !doubleAfterSplit && lateSurrender) {
            tv1 = -.119; tv2 = -.25; tv3 = -.476; tv4 = -.578; tv5 = -.609; tv6 = -.629;
        }
        if (dealerHitsSoft17 && !resplitAces && doubleAfterSplit && lateSurrender) {
            tv1 = -.023; tv2 = -.16; tv3 = -.404; tv4 = -.518; tv5 = -.556; tv6 = -.576;
        }
        if (dealerHitsSoft17 && resplitAces && doubleAfterSplit && lateSurrender) {
            tv1 = .021; tv2 = -.12; tv3 = -.334; tv4 = -.434; tv5 = -.468; tv6 = -.486;
        }
        if (!dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && !lateSurrender) {
            tv1 = .002; tv2 = -.11; tv3 = -.395; tv4 = -.526; tv5 = -.569; tv6 = -.589;
        }
        if (!dealerHitsSoft17 && resplitAces && !doubleAfterSplit && !lateSurrender) {
            tv1 = .047; tv2 = -.06; tv3 = -.323; tv4 = -.44; tv5 = -.478; tv6 = -.496;
        }
        if (!dealerHitsSoft17 && !resplitAces && doubleAfterSplit && !lateSurrender) {
            tv1 = .142; tv2 = .020; tv3 = -.256; tv4 = -.385; tv5 = -.428; tv6 = -.449;
        }
        if (!dealerHitsSoft17 && resplitAces && doubleAfterSplit && !lateSurrender) {
            tv1 = .180; tv2 = .07; tv3 = -.184; tv4 = -.3; tv5 = -.337; tv6 = -.356;
        }
        if (!dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && lateSurrender) {
            tv1 = .013; tv2 = -.11; tv3 = -.356; tv4 = -.462; tv5 = -.5; tv6 = -.517;
        }
        if (!dealerHitsSoft17 && resplitAces && !doubleAfterSplit && lateSurrender) {
            tv1 = .058; tv2 = -.07; tv3 = -.285; tv4 = -.377; tv5 = -.409; tv6 = -.423;
        }
        if (!dealerHitsSoft17 && !resplitAces && doubleAfterSplit && lateSurrender) {
            tv1 = .15; tv2 = .02; tv3 = -.216; tv4 = -.324; tv5 = -.359; tv6 = -.374;
        }
        if (!dealerHitsSoft17 && resplitAces && doubleAfterSplit && lateSurrender) {
            tv1 = .195; tv2 = .06; tv3 = -.145; tv4 = -.239; tv5 = -.269; tv6 = -.281;
        }
        if (noHoleCard) {
            if (dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && !lateSurrender) {
                tv1 = -.189; tv2 = -.3; tv3 = -.599; tv4 = -.849; tv5 = -.894; tv6 = -.917;
            }
            if (dealerHitsSoft17 && resplitAces && !doubleAfterSplit && !lateSurrender) {
                tv1 = -.150; tv2 = -.26; tv3 = -.529; tv4 = -.772; tv5 = -.813; tv6 = -.834;
            }
            if (dealerHitsSoft17 && !resplitAces && doubleAfterSplit && !lateSurrender) {
                tv1 = -.046; tv2 = -.17; tv3 = -.456; tv4 = -.706; tv5 = -.753; tv6 = -.774;
            }
            if (dealerHitsSoft17 && resplitAces && doubleAfterSplit && !lateSurrender) {
                tv1 = -.004; tv2 = -.12; tv3 = -.387; tv4 = -.629; tv5 = -.672; tv6 = -.692;
            }

            if (dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && lateSurrender) {
                tv1 = -.163; tv2 = -.3; tv3 = -.546; tv4 = -.612; tv5 = -.647; tv6 = -.666;
            }
            if (dealerHitsSoft17 && resplitAces && !doubleAfterSplit && lateSurrender) {
                tv1 = -.119; tv2 = -.25; tv3 = -.476; tv4 = -.535; tv5 = -.567; tv6 = -.583;
            }
            if (dealerHitsSoft17 && !resplitAces && doubleAfterSplit && lateSurrender) {
                tv1 = -.023; tv2 = -.16; tv3 = -.404; tv4 = -.470; tv5 = -.506; tv6 = -.524;
            }
            if (dealerHitsSoft17 && resplitAces && doubleAfterSplit && lateSurrender) {
                tv1 = .021; tv2 = -.12; tv3 = -.334; tv4 = -.393; tv5 = -.425; tv6 = -.441;
            }
            if (!dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && !lateSurrender) {
                tv1 = .002; tv2 = -.11; tv3 = -.395; tv4 = -.635; tv5 = -.677; tv6 = -.7;
            }
            if (!dealerHitsSoft17 && resplitAces && !doubleAfterSplit && !lateSurrender) {
                tv1 = .047; tv2 = -.06; tv3 = -.323; tv4 = -.558; tv5 = -.596; tv6 = -.606;
            }
            if (!dealerHitsSoft17 && !resplitAces && doubleAfterSplit && !lateSurrender) {
                tv1 = .142; tv2 = .020; tv3 = -.256; tv4 = -.495; tv5 = -.54; tv6 = -.562;
            }
            if (!dealerHitsSoft17 && resplitAces && doubleAfterSplit && !lateSurrender) {
                tv1 = .180; tv2 = .07; tv3 = -.184; tv4 = -.417; tv5 = -.458; tv6 = -.479;
            }
            if (!dealerHitsSoft17 && !resplitAces && !doubleAfterSplit && lateSurrender) {
                tv1 = .013; tv2 = -.11; tv3 = -.356; tv4 = -.397; tv5 = -.432; tv6 = -.45;
            }
            if (!dealerHitsSoft17 && resplitAces && !doubleAfterSplit && lateSurrender) {
                tv1 = .058; tv2 = -.07; tv3 = -.285; tv4 = -.32; tv5 = -.35; tv6 = -.367;
            }
            if (!dealerHitsSoft17 && !resplitAces && doubleAfterSplit && lateSurrender) {
                tv1 = .15; tv2 = .02; tv3 = -.21; tv4 = -.259; tv5 = -.292; tv6 = -.309;
            }
            if (!dealerHitsSoft17 && resplitAces && doubleAfterSplit && lateSurrender) {
                tv1 = .195; tv2 = .06; tv3 = -.145; tv4 = -.181; tv5 = -.211; tv6 = -.226;
            }
        }
        if (doubleOn11) {
            tv1 = tv1 - .787; tv2 = tv2 - .77; tv3 = tv3 - .683; tv4 = tv4 - .644; tv5 = tv5 - .632; tv6 = tv6 - .623;
        }
        if (doubleOn10_11) {
            tv1 = tv1 - .264; tv2 = tv2 - .25; tv3 = tv3 - .201; tv4 = tv4 - .178; tv5 = tv5 - .172; tv6 = tv6 - .169;
        }
        if (doubleOn9_10_11) {
            tv1 = tv1 - .151; tv2 = tv2 - .13; tv3 = tv3 - .108; tv4 = tv4 - .098; tv5 = tv5 - .094; tv6 = tv6 - .093;
        }
        if (earlySurrender && !dealerHitsSoft17) {
            tv1 = tv1 - .151; tv2 = tv2 - .13; tv3 = tv3 + .589; tv4 = tv4 + .6; tv5 = tv5 + .606; tv6 = tv6 + .607;
        }
        if (earlySurrender && dealerHitsSoft17) {
            tv1 = tv1 - .151; tv2 = tv2 - .13; tv3 = tv3 + .676; tv4 = tv4 + .684; tv5 = tv5 + .688; tv6 = tv6 + .691;
        }
        if (blackjackPays2To1) {
            tv1 = tv1 + 2.324; tv2 = tv2 + 2.32; tv3 = tv3 + 2.287; tv4 = tv4 + 2.271; tv5 = tv5 + 2.264; tv6 = tv6 + 2.261;
        }
        if (blackjackPayout === '6:5') {
            tv1 = tv1 - 1.395; tv2 = tv2 - 1.37; tv3 = tv3 - 1.367; tv4 = tv4 - 1.36; tv5 = tv5 - 1.358; tv6 = tv6 - 1.355;
        }


        // --- End of Base Advantage Calculation ---

        // Return the appropriate tv value based on the number of decks
        switch (decks) {
            case 1: return tv1 / 100; // Convert to percentage
            case 2: return tv2 / 100;
            case 4: return tv3 / 100;
            case 6: return tv5 / 100; // tv4 in original, but tv5 is 6-deck
            case 8: return tv6 / 100;
            default: return tv5 / 100; // Default to 6 decks
        }
    };

    const getBetSuggestion = () => {
        const baseAdvantage = calculateBaseAdvantage();
        const advantage = baseAdvantage + (trueCount * 0.005); // Add count advantage:  trueCount * 0.5%
        const odds = blackjackPayout === '3:2' ? 1.5 : (blackjackPayout === '2:1' ? 2 : 1.2);
        let bet = Math.round((bankroll * (advantage / odds)) / 2); // Half Kelly
        bet = Math.max(betUnit, bet);  // Bet at least the bet unit
        bet = Math.min(bankroll, bet); // Don't bet more than the bankroll
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
                    <select value={blackjackPays2To1 ? '2:1' : blackjackPayout} onChange={(e) => {
                        if (e.target.value === '2:1') {
                            handleBlackjackPays2To1Change({ target: { value: 'true' } });
                        } else {
                            setBlackjackPayout(e.target.value);
                            handleBlackjackPays2To1Change({ target: { value: 'false' } });
                        }
                    }}>
                        <option value="3:2">3:2</option>
                        <option value="6:5">6:5</option>
                        <option value="2:1">2:1</option>
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
                    Resplit Aces:
                    <select value={resplitAces} onChange={handleResplitAcesChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>

                <label>
                    Double After Split:
                    <select value={doubleAfterSplit} onChange={(e) => setDoubleAfterSplit(e.target.value === 'true')}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>
                <label>
                    Double on:
                    <select
                        value={doubleOnAny ? 'any' : doubleOn9_10_11 ? '9/10/11' : doubleOn10_11 ? '10/11' : doubleOn11 ? '11' : 'none'}
                        onChange={(e) => {
                            if (e.target.value === 'any') {
                                setDoubleOnAny(true);
                                setDoubleOn9_10_11(false);
                                setDoubleOn10_11(false);
                                setDoubleOn11(false);
                            } else if (e.target.value === '9/10/11') {
                                handleDouble9_10_11Change({ target: { value: 'true' } });
                            } else if (e.target.value === '10/11') {
                                handleDouble10_11Change({ target: { value: 'true' } });
                            } else if (e.target.value === '11') {
                                handleDouble11Change({ target: { value: 'true' } });
                            }
                        }}
                    >
                        <option value="any">Any</option>
                        <option value="9/10/11">9/10/11 Only</option>
                        <option value="10/11">10/11 Only</option>
                        <option value="11">11 Only</option>
                    </select>
                </label>


                <label>
                    No Hole Card:
                    <select value={noHoleCard} onChange={handleNoHoleCardChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>

                <label>
                    Late Surrender:
                    <select value={lateSurrender} onChange={handleLateSurrenderChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>

                <label>
                    Early Surrender:
                    <select value={earlySurrender} onChange={handleEarlySurrenderChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                </label>
            </div>
        </div>
    );
}

export default App;
