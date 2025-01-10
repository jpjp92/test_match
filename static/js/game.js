class ImageMatchingGame {
    constructor() {
        this.gameStarted = false;
        this.selectedCards = [];
        this.matchedCards = [];
        this.timeLimit = 50;
        this.remainingTime = this.timeLimit;
        this.timer = null;
        this.mode = "normal";
        this.totalImages = 10;
        this.currentLanguage = 'ko'; // 기본 언어를 한국어로 변경
        
        // Language configurations
        this.translations = {
            ko: {
                pageTitle: "이미지 맞추기 게임",
                playerNameLabel: "플레이어 이름:",
                playerNamePlaceholder: "플레이어 이름을 입력하세요",
                difficultyLabel: "난이도:",
                startButton: "게임 시작",
                difficultyEasy: "쉬움",
                difficultyNormal: "보통",
                timeRemaining: "남은 시간: ",
                seconds: "초",
                enterPlayerName: "플레이어 이름을 입력해주세요!",
                gameStartsIn: "10초 후 게임이 시작됩니다",
                gameStart: "게임 시작!",
                gameSuccess: "게임 성공! 모든 카드를 맞췄습니다.",
                gameFail: "게임 실패! 시간이 초과되었습니다.",
                playAgain: "다시 하시겠습니까?",
                leaderboardTitle: "리더보드",
                playerHeader: "플레이어",
                scoreHeader: "점수",
                difficultyHeader: "난이도",
                timeHeader: "소요시간"
            },
            en: {
                pageTitle: "Image Matching Game",
                playerNameLabel: "Player Name:",
                playerNamePlaceholder: "Enter your name",
                difficultyLabel: "Difficulty:",
                startButton: "Start Game",
                difficultyEasy: "Easy",
                difficultyNormal: "Normal",
                timeRemaining: "Time Remaining: ",
                seconds: "seconds",
                enterPlayerName: "Please enter your player name!",
                gameStartsIn: "Game starts in 10 seconds",
                gameStart: "Game Start!",
                gameSuccess: "Success! All cards matched!",
                gameFail: "Game Over! Time's up!",
                playAgain: "Would you like to play again?",
                leaderboardTitle: "Leaderboard",
                playerHeader: "Player",
                scoreHeader: "Score",
                difficultyHeader: "Difficulty",
                timeHeader: "Time"
            },
            es: {
                pageTitle: "Juego de Parejas",
                playerNameLabel: "Nombre del Jugador:",
                playerNamePlaceholder: "Ingrese su nombre",
                difficultyLabel: "Dificultad:",
                startButton: "Comenzar Juego",
                difficultyEasy: "Fácil",
                difficultyNormal: "Normal",
                timeRemaining: "Tiempo Restante: ",
                seconds: "segundos",
                enterPlayerName: "¡Por favor ingrese su nombre!",
                gameStartsIn: "El juego comienza en 10 segundos",
                gameStart: "¡Comienza el juego!",
                gameSuccess: "¡Éxito! ¡Todas las cartas coinciden!",
                gameFail: "¡Juego terminado! ¡Se acabó el tiempo!",
                playAgain: "¿Quieres jugar de nuevo?",
                leaderboardTitle: "Tabla de Clasificación",
                playerHeader: "Jugador",
                scoreHeader: "Puntuación",
                difficultyHeader: "Dificultad",
                timeHeader: "Tiempo"
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.addEventListeners();
            this.setupGameBoard();
            this.initializeLanguageSelector();
            this.updateUIText(); // 초기 UI 텍스트 설정
        });
    }

    initializeLanguageSelector() {
        // Create language selector
        const languageSelector = document.createElement('select');
        languageSelector.id = 'languageSelector';
        languageSelector.className = 'form-control';
        
        const languages = [
            { code: 'ko', name: '한국어' },
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' }
        ];

        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            if (lang.code === this.currentLanguage) {
                option.selected = true;
            }
            languageSelector.appendChild(option);
        });

        // Insert before the game board
        this.gameBoard.parentNode.insertBefore(languageSelector, this.gameBoard);

        // Add event listener
        languageSelector.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    updateUIText() {
        const texts = this.translations[this.currentLanguage];
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (texts[key]) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = texts[key];
                } else {
                    element.textContent = texts[key];
                }
            }
        });
        
        // Update document title
        document.title = texts.pageTitle;
        
        // Update timer if game is in progress
        if (this.remainingTime !== this.timeLimit) {
            this.updateTimer();
        }

        // Update status if there's any status message
        if (this.statusLabel.textContent) {
            const currentStatus = this.statusLabel.textContent;
            // Update status based on current game state
            if (currentStatus.includes('시작')) {
                this.statusLabel.textContent = texts.gameStart;
            } else if (currentStatus.includes('성공')) {
                this.statusLabel.textContent = texts.gameSuccess;
            } else if (currentStatus.includes('실패')) {
                this.statusLabel.textContent = texts.gameFail;
            }
        }
    }

    // ... (나머지 메서드들은 이전 코드와 동일)
    initializeElements() {
        this.playerNameInput = document.getElementById('playerName');
        this.difficultySelect = document.getElementById('difficulty');
        this.startButton = document.getElementById('startButton');
        this.statusLabel = document.getElementById('status');
        this.timerLabel = document.getElementById('timer');
        this.gameBoard = document.getElementById('gameBoard');
    }

    addEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.difficultySelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
    }

    changeDifficulty(difficulty) {
        this.mode = difficulty;
        this.timeLimit = difficulty === 'easy' ? 40 : 50;
        this.remainingTime = this.timeLimit;
        this.updateTimer();
        this.setupGameBoard();
    }

    setupGameBoard() {
        this.gameBoard.innerHTML = '';
        const numCards = this.mode === 'easy' ? 12 : 20;
        const numPairs = numCards / 2;
        
        // 수정: 사용 가능한 이미지 수를 고려하여 이미지 배열 생성
        let imageNumbers = Array.from({length: this.totalImages}, (_, i) => i + 1);
        this.shuffleArray(imageNumbers);
        imageNumbers = imageNumbers.slice(0, numPairs);
        
        // 수정: 선택된 이미지들을 페어로 만들기
        let images = imageNumbers.flatMap(n => [`/static/images/${n}.jpg`, `/static/images/${n}.jpg`]);
        this.shuffleArray(images);

        // 카드 생성
        images.forEach((img, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            
            const image = document.createElement('img');
            image.src = img;
            // 추가: 이미지 로드 에러 처리
            image.onerror = () => {
                console.error(`Failed to load image: ${img}`);
                image.src = '/static/images/1.jpg'; // 기본 이미지로 대체
            };
            
            card.appendChild(image);
            card.addEventListener('click', () => this.flipCard(card, index));
            this.gameBoard.appendChild(card);
        });

        // 그리드 열 수 조정
        this.gameBoard.style.gridTemplateColumns = 
            `repeat(${this.mode === 'easy' ? 4 : 5}, 1fr)`;
    }
    startGame() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            alert('플레이어 이름을 입력해주세요!');
            return;
        }

        if (!this.gameStarted) {
            this.gameStartTime = Date.now();
            this.initialize();
            this.gameStarted = true;
            this.startButton.disabled = true;
            this.difficultySelect.disabled = true;
            this.playerNameInput.disabled = true;
            
            this.statusLabel.textContent = '10초 후 게임이 시작됩니다.';
            this.showCards(10000);

            this.remainingTime = this.timeLimit;
            this.updateTimer();
            this.startTimer();
        }
    }

    initialize() {
        this.selectedCards = [];
        this.matchedCards = [];
        this.setupGameBoard();
    }

    showCards(duration) {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('flipped'));
        setTimeout(() => this.hideCards(), duration);
    }

    hideCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (!this.matchedCards.includes(parseInt(card.dataset.index))) {
                card.classList.remove('flipped');
            }
        });
        this.statusLabel.textContent = '게임 시작!';
    }

    flipCard(card, index) {
        if (this.gameStarted && 
            !this.selectedCards.includes(index) && 
            !this.matchedCards.includes(index)) {
            
            this.selectedCards.push(index);
            card.classList.add('flipped');

            if (this.selectedCards.length === 2) {
                setTimeout(() => this.checkMatch(), 100);
            }
        }
    }

    checkMatch() {
        const [index1, index2] = this.selectedCards;
        const cards = document.querySelectorAll('.card');
        const card1 = cards[index1];
        const card2 = cards[index2];

        if (card1.querySelector('img').src === card2.querySelector('img').src) {
            this.matchedCards.push(index1, index2);
            if (this.matchedCards.length === (this.mode === 'easy' ? 12 : 20)) {
                this.endGame(true);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 200);
        }
        this.selectedCards = [];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                this.updateTimer();
            } else {
                this.endGame(false);
            }
        }, 1000);
    }

    updateTimer() {
        this.timerLabel.textContent = `남은 시간: ${this.remainingTime}초`;
    }

    calculateScore(success, timeTaken) {
        if (!success) return 0;
        
        const baseScore = 1000;
        const timePenalty = timeTaken * 2;
        const difficultyMultiplier = this.mode === 'easy' ? 1 : 1.5;
        
        const finalScore = Math.max(0, 
            Math.floor((baseScore - timePenalty) * difficultyMultiplier));
        return finalScore;
    }

    async saveScore(success) {
        const timeTaken = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const score = this.calculateScore(success, timeTaken);

        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_name: this.playerNameInput.value,
                    score: score,
                    difficulty: this.mode,
                    time_taken: timeTaken
                })
            });
            
            if (!response.ok) throw new Error('점수 저장 실패');
            
            this.updateLeaderboard();
        } catch (error) {
            console.error('점수 저장 중 오류:', error);
            alert('점수 저장 중 오류가 발생했습니다.');
        }
    }

    maskPlayerName(name) {
        if (name.length === 1) return name; // 1글자는 마스킹하지 않음
        
        const firstChar = name.charAt(0);
        const maskedPart = '*'.repeat(name.length - 1); // 첫 글자를 제외한 모든 글자를 마스킹
        
        return firstChar + maskedPart;
    }

    async updateLeaderboard() {
        try {
            const response = await fetch('/api/scores');
            const scores = await response.json();
            
            const tbody = document.querySelector('#scoresTable tbody');
            tbody.innerHTML = '';
            
            scores.forEach(score => {
                const row = tbody.insertRow();
                row.insertCell().textContent = this.maskPlayerName(score.player_name);
                row.insertCell().textContent = score.score;
                row.insertCell().textContent = score.difficulty;
                row.insertCell().textContent = `${score.time_taken}초`;
            });
        } catch (error) {
            console.error('리더보드 업데이트 중 오류:', error);
        }
    }

    endGame(success) {
        clearInterval(this.timer);
        this.gameStarted = false;
        
        this.saveScore(success);
        
        this.statusLabel.textContent = success ? 
            '게임 성공! 모든 카드를 맞췄습니다.' : 
            '게임 실패! 시간이 초과되었습니다.';

        if (confirm('다시 하시겠습니까?')) {
            this.completeReset();
        }
    }

    completeReset() {
        this.mode = 'normal';
        this.difficultySelect.value = 'normal';
        this.difficultySelect.disabled = false;
        this.startButton.disabled = false;
        this.playerNameInput.disabled = false;
        this.gameStarted = false; // 추가: gameStarted 초기화
        
        this.setupGameBoard();
        
        this.remainingTime = this.timeLimit;
        this.updateTimer();
        this.statusLabel.textContent = '';
    }
}

// 게임 인스턴스 생성
const game = new ImageMatchingGame();




// class ImageMatchingGame {
//     constructor() {
//         this.gameStarted = false;
//         this.selectedCards = [];
//         this.matchedCards = [];
//         this.timeLimit = 50;
//         this.remainingTime = this.timeLimit;
//         this.timer = null;
//         this.mode = "normal";
//         this.totalImages = 10; // 추가: 총 이미지 수 설정
        
//         // DOM이 로드된 후 초기화하도록 수정
//         document.addEventListener('DOMContentLoaded', () => {
//             this.initializeElements();
//             this.addEventListeners();
//             this.setupGameBoard();
//             // 게임 보드 컨테이너 크기 설정 추가
//             // this.setGameBoardSize();
//         });
//     }

//     // 게임 보드 크기 설정을 위한 새로운 메서드
//     // setGameBoardSize() {
//     //     this.gameBoard.style.width = '55%';
//     //     this.gameBoard.style.margin = '0'; // 중앙 정렬 '0 auto'
        
//     //     // 카드 크기도 적절하게 조정
//     //     const style = document.createElement('style');
//     //     style.textContent = `
//     //         .card {
//     //             aspect-ratio: 1; /* 카드를 정사각형으로 유지 */
//     //             width: 100%; /* 그리드 셀에 맞춤 */
//     //         }
//     //     `;
//     //     document.head.appendChild(style);
//     // }

//     initializeElements() {
//         this.playerNameInput = document.getElementById('playerName');
//         this.difficultySelect = document.getElementById('difficulty');
//         this.startButton = document.getElementById('startButton');
//         this.statusLabel = document.getElementById('status');
//         this.timerLabel = document.getElementById('timer');
//         this.gameBoard = document.getElementById('gameBoard');
//     }

//     addEventListeners() {
//         this.startButton.addEventListener('click', () => this.startGame());
//         this.difficultySelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
//     }

//     changeDifficulty(difficulty) {
//         this.mode = difficulty;
//         this.timeLimit = difficulty === 'easy' ? 40 : 50;
//         this.remainingTime = this.timeLimit;
//         this.updateTimer();
//         this.setupGameBoard();
//     }

//     setupGameBoard() {
//         this.gameBoard.innerHTML = '';
//         const numCards = this.mode === 'easy' ? 12 : 20;
//         const numPairs = numCards / 2;
        
//         // 수정: 사용 가능한 이미지 수를 고려하여 이미지 배열 생성
//         let imageNumbers = Array.from({length: this.totalImages}, (_, i) => i + 1);
//         this.shuffleArray(imageNumbers);
//         imageNumbers = imageNumbers.slice(0, numPairs);
        
//         // 수정: 선택된 이미지들을 페어로 만들기
//         let images = imageNumbers.flatMap(n => [`/static/images/${n}.jpg`, `/static/images/${n}.jpg`]);
//         this.shuffleArray(images);

//         // 카드 생성
//         images.forEach((img, index) => {
//             const card = document.createElement('div');
//             card.className = 'card';
//             card.dataset.index = index;
            
//             const image = document.createElement('img');
//             image.src = img;
//             // 추가: 이미지 로드 에러 처리
//             image.onerror = () => {
//                 console.error(`Failed to load image: ${img}`);
//                 image.src = '/static/images/1.jpg'; // 기본 이미지로 대체
//             };
            
//             card.appendChild(image);
//             card.addEventListener('click', () => this.flipCard(card, index));
//             this.gameBoard.appendChild(card);
//         });

//         // 그리드 열 수 조정
//         this.gameBoard.style.gridTemplateColumns = 
//             `repeat(${this.mode === 'easy' ? 4 : 5}, 1fr)`;
//     }
//     startGame() {
//         const playerName = this.playerNameInput.value.trim();
//         if (!playerName) {
//             alert('플레이어 이름을 입력해주세요!');
//             return;
//         }

//         if (!this.gameStarted) {
//             this.gameStartTime = Date.now();
//             this.initialize();
//             this.gameStarted = true;
//             this.startButton.disabled = true;
//             this.difficultySelect.disabled = true;
//             this.playerNameInput.disabled = true;
            
//             this.statusLabel.textContent = '10초 후 게임이 시작됩니다.';
//             this.showCards(10000);

//             this.remainingTime = this.timeLimit;
//             this.updateTimer();
//             this.startTimer();
//         }
//     }

//     initialize() {
//         this.selectedCards = [];
//         this.matchedCards = [];
//         this.setupGameBoard();
//     }

//     showCards(duration) {
//         const cards = document.querySelectorAll('.card');
//         cards.forEach(card => card.classList.add('flipped'));
//         setTimeout(() => this.hideCards(), duration);
//     }

//     hideCards() {
//         const cards = document.querySelectorAll('.card');
//         cards.forEach(card => {
//             if (!this.matchedCards.includes(parseInt(card.dataset.index))) {
//                 card.classList.remove('flipped');
//             }
//         });
//         this.statusLabel.textContent = '게임 시작!';
//     }

//     flipCard(card, index) {
//         if (this.gameStarted && 
//             !this.selectedCards.includes(index) && 
//             !this.matchedCards.includes(index)) {
            
//             this.selectedCards.push(index);
//             card.classList.add('flipped');

//             if (this.selectedCards.length === 2) {
//                 setTimeout(() => this.checkMatch(), 100);
//             }
//         }
//     }

//     checkMatch() {
//         const [index1, index2] = this.selectedCards;
//         const cards = document.querySelectorAll('.card');
//         const card1 = cards[index1];
//         const card2 = cards[index2];

//         if (card1.querySelector('img').src === card2.querySelector('img').src) {
//             this.matchedCards.push(index1, index2);
//             if (this.matchedCards.length === (this.mode === 'easy' ? 12 : 20)) {
//                 this.endGame(true);
//             }
//         } else {
//             setTimeout(() => {
//                 card1.classList.remove('flipped');
//                 card2.classList.remove('flipped');
//             }, 200);
//         }
//         this.selectedCards = [];
//     }

//     shuffleArray(array) {
//         for (let i = array.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [array[i], array[j]] = [array[j], array[i]];
//         }
//     }

//     startTimer() {
//         this.timer = setInterval(() => {
//             if (this.remainingTime > 0) {
//                 this.remainingTime--;
//                 this.updateTimer();
//             } else {
//                 this.endGame(false);
//             }
//         }, 1000);
//     }

//     updateTimer() {
//         this.timerLabel.textContent = `남은 시간: ${this.remainingTime}초`;
//     }

//     calculateScore(success, timeTaken) {
//         if (!success) return 0;
        
//         const baseScore = 1000;
//         const timePenalty = timeTaken * 2;
//         const difficultyMultiplier = this.mode === 'easy' ? 1 : 1.5;
        
//         const finalScore = Math.max(0, 
//             Math.floor((baseScore - timePenalty) * difficultyMultiplier));
//         return finalScore;
//     }

//     async saveScore(success) {
//         const timeTaken = Math.floor((Date.now() - this.gameStartTime) / 1000);
//         const score = this.calculateScore(success, timeTaken);

//         try {
//             const response = await fetch('/api/scores', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     player_name: this.playerNameInput.value,
//                     score: score,
//                     difficulty: this.mode,
//                     time_taken: timeTaken
//                 })
//             });
            
//             if (!response.ok) throw new Error('점수 저장 실패');
            
//             this.updateLeaderboard();
//         } catch (error) {
//             console.error('점수 저장 중 오류:', error);
//             alert('점수 저장 중 오류가 발생했습니다.');
//         }
//     }

//     maskPlayerName(name) {
//         if (name.length === 1) return name; // 1글자는 마스킹하지 않음
        
//         const firstChar = name.charAt(0);
//         const maskedPart = '*'.repeat(name.length - 1); // 첫 글자를 제외한 모든 글자를 마스킹
        
//         return firstChar + maskedPart;
//     }

//     async updateLeaderboard() {
//         try {
//             const response = await fetch('/api/scores');
//             const scores = await response.json();
            
//             const tbody = document.querySelector('#scoresTable tbody');
//             tbody.innerHTML = '';
            
//             scores.forEach(score => {
//                 const row = tbody.insertRow();
//                 row.insertCell().textContent = this.maskPlayerName(score.player_name);
//                 row.insertCell().textContent = score.score;
//                 row.insertCell().textContent = score.difficulty;
//                 row.insertCell().textContent = `${score.time_taken}초`;
//             });
//         } catch (error) {
//             console.error('리더보드 업데이트 중 오류:', error);
//         }
//     }

//     endGame(success) {
//         clearInterval(this.timer);
//         this.gameStarted = false;
        
//         this.saveScore(success);
        
//         this.statusLabel.textContent = success ? 
//             '게임 성공! 모든 카드를 맞췄습니다.' : 
//             '게임 실패! 시간이 초과되었습니다.';

//         if (confirm('다시 하시겠습니까?')) {
//             this.completeReset();
//         }
//     }



//     completeReset() {
//         this.mode = 'normal';
//         this.difficultySelect.value = 'normal';
//         this.difficultySelect.disabled = false;
//         this.startButton.disabled = false;
//         this.playerNameInput.disabled = false;
//         this.gameStarted = false; // 추가: gameStarted 초기화
        
//         this.setupGameBoard();
        
//         this.remainingTime = this.timeLimit;
//         this.updateTimer();
//         this.statusLabel.textContent = '';
//     }
// }

// // 게임 인스턴스 생성
// const game = new ImageMatchingGame();
