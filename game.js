// TO DO counter
// add counter view, event observer,
// https://github.com/rkaw92


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
        if (state !== 'unknown' && state !== 'miss' && state !== 'hit'){
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
}

// CONTROLLER

class GameController {
    constructor(model) {
        this._model = model;
    }
    handleCellClick(row, column) {
        console.log('handle click ' + row + ' ' + column);
        this._model.fireAt(row, column);
    }
}

// MODEL

class GameModel {
    constructor() {
        const _boardSize = 10;
        this._cells = {};
        this._observers = [];
        for (let i = 0; i < _boardSize; i++){
            for (let j = 0; j < _boardSize; j++) {
                const key = 'x'+ i + 'y' + j;
                this._cells[key] = {
                    hasShip: true,
                    firedAt: false
                }
                this._cells['x1y1'] = {
                    hasShip: false,
                    firedAt: false
                }

            }
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
        console.log("cell coordinates " + coordinatesKey + ' was shot!');
        this._observers.forEach(function(observer) {
            observer('firedAt', {result, row, column})
        })
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

function handleCellClick(row, column) {
    controller.handleCellClick(row, column);
}

board = new GameBoard(handleCellClick);
model = new GameModel();
model.addObserver(function(eventType, params) {
    switch (eventType) {
        case 'firedAt' :
            board.setStateAt(params.row, params.column, params.result);
            break;
    }
})
controller = new GameController(model);


game.appendChild(board.getElement());


