const gameElement = document.getElementById("game");
const row = document.createElement('tr');
const cell = document.createElement('td');
const cell2 = document.createElement('td');

row.appendChild(cell);
row.appendChild(cell2);

gameElement.appendChild(row);

//controler pobiera input od uzytkownika i przekazuje na view

function colorCell(event) {
    console.log(event);
    event.target.classList.add('clicked');
}

const cells = [cell, cell2];

cells.forEach((cell) => cell.addEventListener('click', colorCell));

// for (let i = 0; i < cells.length; i++){
//     cells[i].addEventListener('click', colorCell)
// }


// cell.addEventListener('click', colorCell);
// cell2.addEventListener('click', colorCell);

