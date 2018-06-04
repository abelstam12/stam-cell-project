// hardcoded matrix containing the composition of the crypt
let composition_matrix = [
    [0,'blue','black','red',0],
    ['green','black', 'yellow','black', 'white'],
    ['black', 'purple', 'black','orange', 'black'],
    ['brown', 'black', 'blueviolet', 'black', 'darkgreen'],
    [0, 'grey', 'black', 'cyan', 0]
]

// matrix is N x N so no
let size = composition_matrix.length

// hardcode possible dividers #TODO (specify on load for random matrix)
let possible_cells = [
    [0,1], [0,3], [1,0], [1,2] ,[1,4],
    [2,1], [2,3], [3,0], [3,2], [3,4], [4,1], [4,3]
];

// hardcoded ""
let offspring = {
    blue: [1], red: [1], green: [1], yellow: [1],
    white: [1], purple: [1], orange: [1], brown: [1],
    blueviolet: [1], darkgreen: [1], grey: [1], cyan: [1]
};


let update_count = 0;

// select random element
function select() {
    index =  Math.floor(Math.random() * possible_cells.length);
    return possible_cells[index];
}

// do an update of current composition
function update() {
    // get gamemode
    gm = getGameMode();
    if (gm == undefined) {
        alert('Select divide mechanism');
        document.getElementById('sym').disabled = false;
        document.getElementById('asym').disabled = false;
        return;
    }

    document.getElementById('sym').disabled = true;
    document.getElementById('asym').disabled = true;

    draw_matrix(composition_matrix);
    let element = select();
    let x = element[0];
    let y = element[1];
    // add to offspring
    update_offspring(composition_matrix[x][y]);
    // flash cell that will devide
    flash(x, y);
    // symmetric
    if (gm == 2) {
        divide_symmetric(x, y);
    } else {
        divide_asymmetric(x, y);
    }
    update_count += 1;
    plot_offspring();
    if(crypt_is_singular()) {

    }
}

// return boolean corresponging to 
function crypt_is_singular() {
    let check_if_singular = []
    for(let i = 0; i < composition_matrix.length; i++) {
        check_if_singular = check_if_singular.concat(composition_matrix[i]);
    }
    console.log('check array sing', check_if_singular);
    let prev_element = check_if_singular[0];
    for (let i = 1; i < check_if_singular.length; i++) {
        let element = check_if_singular[i];
        console.log(prev_element, element);
        if (is_valid_cell(element) && is_valid_cell(prev_element)
        && prev_element != element) {
            console.log('false');
            return false;
        }
        if (is_valid_cell(element)) {
            prev_element = element;
        }
    }
    return true;
}

function is_valid_cell(cell) {
    if (cell != 0 && cell != 'black' ) {
        return true;
    }
    return false;
}

// pushes the cells in front of dividing cell towards the edge of the crypt
function push_cells(x, y, direction) {
    cells = [];
    i = 0;
    while (x + i * direction[0] < size && y + i * direction[1] < size 
        && x + i * direction[0] >= 0 && y + i * direction[1] >=0) {
        cells.push([x + i * direction[0], y + i * direction[1]])
        i += 1;
    }
    // shift each element in the specified direction
    cells = cells.reverse();
    for (let i = 0; i < cells.length - 1; i ++) {
        composition_matrix[cells[i][0]][cells[i][1]] = 
        composition_matrix[cells[i + 1][0]][cells[i + 1][1]];
    }
}

function divide_symmetric(x, y) {
    // one cell remains on the same position, other cell has to find a new place
    direction = [random_element([1, -1]), random_element([1, -1])];
    hop_to = [x +direction[0], y + direction[1]];

    push_cells(x, y, direction);
    return;
}

function random_element(list) {
    index =  Math.floor(Math.random() * list.length);
    return list[index]
}

// offspring hops out of crypt without interaction with stem cells
function divide_asymmetric(x, y) {
    //offspring[composition_matrix[x][y]] = offspring[composition_matrix[x][y]] + 1
}


// flash selected element
function flash(x, y) {
    let display_select_matrix = zeros([size, size]);
    display_select_matrix[x][y] = 'black';
    const canvas = document.getElementById('canvas').getContext('2d');
    context.fillStyle = 'black';
    offset = get_offset(x,y);
    roundRect(canvas, offset[0], offset[1], 50, 50, 20, true)
    setTimeout(function() {draw_matrix(composition_matrix)}, 400);
}

function getGameMode() {
    let radios = document.getElementsByName('game_mode');

    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}

// set canvas size and initial probability
window.onload = window.onresize = function() {
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    // set probability
    draw_matrix(composition_matrix);
}

// draw utils
function roundRect(ctx, x, y, width, height, radius ,fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  // draw matrix
function draw_matrix(draw_this) {
    canvas = document.getElementById('canvas')
    context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    // 140 currently approx half of crypt
    x_s = canvas.width / 2.0 - 140    
    y_s =  canvas.height / 2.0 - 140
    for (let i = 0; i < draw_this.length; i ++) {
        for (let j = 0; j < draw_this[0].length ; j++) {
            // if element is a color -> draw
            if (draw_this[j][i] != 0) {
                context.fillStyle = draw_this[j][i];
                // j corresponds to x postition in matrix
                roundRect(context, x_s + j * 50, y_s + i * 50, 50, 50, 28, true);
            }
        }
    }
    return true;
}

function get_offset(x, y) {
    canvas = document.getElementById('canvas');
    x_s = canvas.width / 2.0 - 140;
    y_s =  canvas.height / 2.0 - 140;
    return [x_s + x * 50, y_s + y * 50];
}

function zeros(dimensions) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }
    return array;
}

function update_offspring(color) {
    for (const [key, value] of Object.entries(offspring)) {
        let current_offspring_size = offspring[key][offspring[key].length - 1];
        if (key == color) {
            offspring[key].push(current_offspring_size + 1);
        }
        else {
            offspring[key].push(current_offspring_size)
        } 
    }
}

// graph results
function get_x_interval(list) {
    let x_values = [];
    for (let i = 0; i < list.length; i++) {
        x_values.push(i);
    }
    return x_values;
}

function plot_offspring() {
    let data = []

    for (const [key, value] of Object.entries(offspring)) {
        let plot_specific_offspring = {
            x: get_x_interval(value),
            y: value,
            mode: 'lines',
            line: {
                color: key,
                width: 3,
            }
        }
        data.push(plot_specific_offspring);
    }
    Plotly.newPlot('graph', data);
}