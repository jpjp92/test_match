class ImageMatchingGame {
    constructor() {
        this.gameStarted = false;
        this.selectedCards = [];
        this.matchedCards = [];
        this.timeLimit = 50;
        this.remainingTime = this.timeLimit;
        this.timer = null;
        this.mode = "normal";
        this.totalImages = 10; // 추가: 총 이미지 수 설정
        
        // DOM이 로드된 후 초기화하도록 수정
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.addEventListeners();
            this.setupGameBoard();
        });
    }

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
                setTimeout(() => this.checkMatch(), 300);
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
            }, 500);
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

    // async updateLeaderboard() {
    //     try {
    //         const response = await fetch('/api/scores');
    //         const scores = await response.json();
            
    //         const tbody = document.querySelector('#scoresTable tbody');
    //         tbody.innerHTML = '';
            
    //         scores.forEach(score => {
    //             const row = tbody.insertRow();
    //             row.insertCell().textContent = score.player_name;
    //             row.insertCell().textContent = score.score;
    //             row.insertCell().textContent = score.difficulty;
    //             row.insertCell().textContent = `${score.time_taken}초`;
    //         });
    //     } catch (error) {
    //         console.error('리더보드 업데이트 중 오류:', error);
    //     }
    // }

    maskPlayerName(name) {
        if (name.length <= 2) return name; // 2글자 이하는 마스킹하지 않음
        
        const firstChar = name.charAt(0);
        const lastChar = name.charAt(name.length - 1);
        const maskedPart = '*'.repeat(name.length - 2);
        
        return firstChar + maskedPart + lastChar;
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
