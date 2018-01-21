class ViewComponent {
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

const cell1 = new GameCell;
const gameElement = document.getElementById('game');
const row = document.createElement('tr');
gameElement.appendChild(row);
row.appendChild(cell1.getElement());
