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
        this._state = 'unknown'; // zmienna "prywatna", nie zmieniaj poza kodem
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
        const boardSize = 10;
        super();
        this._state = 'unknown';
        this._element = document.createElement('table');
        const self = this;
        this.cells = {};
        for (let i = 0; i < boardSize; i++){
            const row = document.createElement('tr');
            for (let j = 0; j < boardSize; j++) {
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
        const boardSize = 10;
        this.cells = {};
        for (let i = 0; i < boardSize; i++){
            for (let j = 0; j < boardSize; j++) {
                const key = 'x'+ i + 'y' + j;
                this.cells[key] = {
                    hasShip: true,
                    firedAt: false
                }
            }
        }
    }

    fireAt(row, column) {
        const coordinatesKey = 'x'+ row + 'y' + column;
        const targetCell = this.cells[coordinatesKey]; 
        if (targetCell.firedAt){
            return;
        }
        targetCell.firedAt=true;
        console.log("cell coordinates " + coordinatesKey + ' was shot!');
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
controller = new GameController(model);


game.appendChild(board.getElement());


