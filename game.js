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

class GameController {
    constructor(model) {
        this._model = model;
    }
    handleCellClick(row, column) {
        console.log('handle click ' + row + ' ' + column);
        if (this._model.getMode() === 'markShips'){
            this._model.markShip(row, column);
        } else  this._model.fireAt(row, column);
    }
}

// MODEL

class GameModel {
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
                this._cells['x1y1'] = {
                    hasShip: true,
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
let board;
let controller;
let model;
const counter = new GameCounter();

function handleCellClick(row, column) {
    controller.handleCellClick(row, column);
}

board = new GameBoard(handleCellClick);
model = new GameModel();
counter.setOutOfValue('/' + model.getShipsNumber());
model.addObserver(function(eventType, params) {
    switch (eventType) {
        case 'firedAt' :
            board.setStateAt(params.row, params.column, params.result);
            break;
        case 'shipMarked' :
            board.setStateAt(params.row, params.column, 'mark');
            counter.setValue(params.markedShips);
            break;
        case 'allShipsMarked' :
            board.cleanBoard();
            counter.setStatus('Shoot the ships! ')
            counter.setValue('0')
            break;
        case 'scored' :
            counter.setValue(params.score);
            break;
        case 'win' :
            counter.setWinStatus();
            break;
    }
})

controller = new GameController(model);
game.appendChild(board.getElement());
game.appendChild(counter.getElement());


