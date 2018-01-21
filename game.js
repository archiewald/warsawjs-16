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
    constructor() { //constructor code runs on the creation of object
        super(); // run cunstructor of parent class
        this._state = 'unknown'; // zmienna "prywatna", nie zmieniaj poza kodem
        this._element = document.createElement('td');
        const self = this;
        this._element.addEventListener('click', function() {
            console.log('clicked!');
            self.setState('miss');
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
    constructor() {
        const boardSize = 10;
        super();
        this._state = 'unknown';
        this._element = document.createElement('table');
        const self = this;
        for (let i = 0; i < boardSize; i++){
            const row = document.createElement('tr');
            for (let j = 0; j < boardSize; j++) {
                const cell = new GameCell;
                row.appendChild(cell.getElement());
            }
            this._element.appendChild(row);
        }

    }
}

const board = new GameBoard;
const main = document.getElementById('game');
main.appendChild(board.getElement());

