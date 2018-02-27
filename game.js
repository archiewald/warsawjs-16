// VIEW

class ViewComponent {
    constructor() {
        if (new.target === ViewComponent) { //check if constructor was not used directly
            throw new Error('Abstract class!'); 
        }  
    }
    getElement() {
        return this._element;
    }
}

class GameCell extends ViewComponent {
    constructor(handleCellClick, row, column) { //constructor code runs on the creation of object
        super(); // run cunstructor of parent class
        this._state = 'unknown'; // underscore means 'private', not accessible outside of class
        this._element = document.createElement('td');
        const self = this;
        this._element.addEventListener('click', function() {
            handleCellClick(row,column);
        });
    }

    setState(state) {
        if (state !== 'unknown' && state !== 'miss' && state !== 'hit' && state !== 'mark'){
            throw new Error('Invalid state!')
        }
        this._state = state;
        this._element.className = 'cell_' + state;
    }
}

class GameBoard extends ViewComponent {
    constructor(handleCellClick) {
        const _boardSize = 10;
        super();
        this._state = 'unknown';
        this._element = document.createElement('table');
        const self = this;
        this.cells = {};
        for (let i = 0; i < _boardSize; i++){
            const row = document.createElement('tr');
            for (let j = 0; j < _boardSize; j++) {
                const key = 'x'+ i + 'y' + j;
                this.cells[key] = new GameCell(handleCellClick, i, j);
                row.appendChild(this.cells[key].getElement());
            }
            this._element.appendChild(row);
        }
    }

    setStateAt(row, column, state) {
        const key = 'x' + row + 'y' + column;
        this.cells[key].setState(state);
    }

    cleanBoard() {
        Object.keys(this.cells).forEach(key => {
            this.cells[key].setState('unknown');
        })
    }
}

class GameCounter extends ViewComponent {
    constructor() {
        super();
        this._element = document.createElement('p');
        this._status = document.createElement('span');
        this._value = document.createElement('span');
        this._outOfValue = document.createElement('span');
        this._status.textContent = 'Choose your ships position. ';
        this._value.textContent = '0';
        this._element.appendChild(this._status);
        this._element.appendChild(this._value);
        this._element.appendChild(this._outOfValue);
    }

    setValue(score) {
        this._value.textContent = String(score);
    }
    setStatus(status) {
        this._status.textContent = status;
    }
    setOutOfValue(outOfValue){
        this._outOfValue.textContent = outOfValue;
    }
    setWinStatus(){
        this._element.textContent = "You cheeky bastard, you did it! Congrats ;*"
    }
}

// CONTROLLER

class BoardController {
    constructor(boardModel) {
        this._boardModel = boardModel;
    }
    handleCellClick(row, column) {
        console.log('handle click ' + row + ' ' + column);
        if (this._boardModel.getMode() === 'markShips'){
            this._boardModel.markShip(row, column);
        } else  this._boardModel.fireAt(row, column);
    }
}

// MODEL

class GameModel {
    constructor(board1, board2) {
        this.board1=board1;
        this.board2=board2;
    }
}

class BoardModel {
    constructor() {
        const _boardSize = 10;
        this._cells = {};
        this._observers = [];
        this._score = 0;
        this._markedShips = 0;
        this._shipsNumber = 12;
        this._mode = 'markShips';
        for (let i = 0; i < _boardSize; i++){
            for (let j = 0; j < _boardSize; j++) {
                const key = 'x'+ i + 'y' + j;
                this._cells[key] = {
                    hasShip: false,
                    firedAt: false
                }
            }
        }
    }

    getMode() {
        return this._mode;
    }

    getShipsNumber() {
        return this._shipsNumber;
    }

    markShip(row, column) {
        const coordinatesKey = 'x'+ row + 'y' + column;
        const targetCell = this._cells[coordinatesKey]; 
        if (targetCell.hasShip){
            console.log('This one is already marked')
            return;
        }
        targetCell.hasShip = true;
        this._markedShips += 1;
        const markedShips = this._markedShips;
        console.log('You marked ship of coordinates ' + coordinatesKey);
        this._observers.forEach(function(observer) {
            observer('shipMarked', {row, column, markedShips})
        });
        if (this._markedShips === this._shipsNumber) {
            this._mode = 'fireShips';
            this._observers.forEach(function(observer) {
                observer('allShipsMarked');
            }, this);
        }
    }

    fireAt(row, column) {
        const coordinatesKey = 'x'+ row + 'y' + column;
        const targetCell = this._cells[coordinatesKey]; 
        if (targetCell.firedAt){
            return;
        }
        targetCell.firedAt=true;
        const result = targetCell.hasShip ? 'hit' : 'miss';
        if (result === 'hit') {
            this._score += 1;
            if (this._score === this._shipsNumber){
                this._observers.forEach(function(observer) {
                    observer('win')
                });
            }
        }
        console.log("cell coordinates " + coordinatesKey + ' was shot!');
        this._observers.forEach(function(observer) {
            observer('firedAt', {result, row, column})
        });
        if (result === 'hit') {
            this._observers.forEach(function(observer) {
                observer('scored', {score: this._score});
            }, this);
        }
    }

    addObserver(observerFunction) {
        this._observers.push(observerFunction);
    }
}

// APP INIT

const game = document.getElementById('game');
let board1;
let board2;
let controller1;
let controller2;
let boardModel1;
let boardModel2;
const counter1 = new GameCounter();
const counter2 = new GameCounter();

function handleCellClick1(row, column) {
    controller1.handleCellClick(row, column);
}
function handleCellClick2(row, column) {
    controller2.handleCellClick(row, column);
}

board1 = new GameBoard(handleCellClick1);
board2 = new GameBoard(handleCellClick2);
boardModel1 = new BoardModel();
boardModel2 = new BoardModel();
gameModel = new GameModel(boardModel1,boardModel2);
counter1.setOutOfValue('/' + gameModel.board1.getShipsNumber());
counter2.setOutOfValue('/' + gameModel.board1.getShipsNumber());
gameModel.board1.addObserver(function(eventType, params) {
    switch (eventType) {
        case 'firedAt' :
            board1.setStateAt(params.row, params.column, params.result);
            break;
        case 'shipMarked' :
            board1.setStateAt(params.row, params.column, 'mark');
            counter1.setValue(params.markedShips);
            break;
        case 'allShipsMarked' :
            board1.cleanBoard();
            counter1.setStatus('Shoot the ships! ')
            counter1.setValue('0')
            break;
        case 'scored' :
            counter1.setValue(params.score);
            break;
        case 'win' :
            counter1.setWinStatus();
            break;
    }
})
gameModel.board2.addObserver(function(eventType, params) {
    switch (eventType) {
        case 'firedAt' :
            board2.setStateAt(params.row, params.column, params.result);
            break;
        case 'shipMarked' :
            board2.setStateAt(params.row, params.column, 'mark');
            counter2.setValue(params.markedShips);
            break;
        case 'allShipsMarked' :
            board2.cleanBoard();
            counter2.setStatus('Shoot the ships! ')
            counter2.setValue('0')
            break;
        case 'scored' :
            counter2.setValue(params.score);
            break;
        case 'win' :
            counter2.setWinStatus();
            break;
    }
})

controller1 = new BoardController(gameModel.board1);
controller2 = new BoardController(gameModel.board2);
game.appendChild(board1.getElement());
game.appendChild(counter1.getElement());
game.appendChild(board2.getElement());
game.appendChild(counter2.getElement());


