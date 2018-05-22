// hardcoded matrix containing the composition of the crypt
let composition_matrix = [[0,'blue','black','red',0],
['green','black', 'yellow','black', 'white'],
['black', 'purple', 'black','orange', 'black'],
['brown', 'black', 'blueviolet', 'black', 'darkgreen'],
[0, 'grey', 'black', 'cyan', 0]
]

// matrix is N x N so no
let size = composition_matrix.length

// hardcode possible dividers #TODO (specify on load for random matrix)
let possible_cells = [[0,1], [0,3], [1,0], [1,2] ,[1,4], [2,1], [2,3], [3,0], [3,2], [3,4], [4,1], [4,3]];

// hardcoded ""
let offspring = {blue: 0, red: 0, green: 0, yellow: 0, white: 0, purple: 0, orange: 0, brown: 0, blueviolet: 0, darkgreen: 0, grey: 0, cyan: 0};

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

    draw_matrix(composition_matrix)
    let element = select();
    let x = element[0];
    let y = element[1];
    flash(x, y);
    // symmetric
    if (gm == 2) {
        divide_symmetric(x, y);
    } else {
        divide_asymmetric(x, y);
    }

    if(crypt_is_singular()) {

    }
}

function crypt_is_singular() {
    prev_element = composition_matrix[0][0]
    for (let row in composition_matrix) {
        for (let element in row) {
            if (element != 0 && emement != 'black') {
                if (prev_element != element) {
                    return false;
                }
            }
        }
    }
    return true;
}

// pushes the cells in front of dividing cell towards the edge of the crypt
function push_cells(x, y, direction) {
    cells = [];
    i = 0;
    while (x + i * direction[0] < size && y + i * direction[1] < size && x + i * direction[0] >= 0 && y + i * direction[1] >=0) {
        cells.push([x + i * direction[0], y + i * direction[1]])
        i += 1;
    }
    offspring[composition_matrix[cells[cells.length - 1][0]][cells[cells.length - 1][1]]] += 1
    // shift each element in the specified direction
    cells = cells.reverse();
    for (let i = 0; i < cells.length - 1; i ++) {
        composition_matrix[cells[i][0]][cells[i][1]] = composition_matrix[cells[i + 1][0]][cells[i + 1][1]]
    }
}

function divide_symmetric(x, y) {
    // one cell remains on the same position, other cell has to find a new place
    direction = [random_element([1, -1]), random_element([1, -1])]
    hop_to = [x +direction[0], y + direction[1]]
    console.log(x, y, hop_to);
    // hop out of matrix
    if (hop_to[0] >= size || hop_to[1] >= size ||
        hop_to[0] < 0 || hop_to[1] < 0) {
        // add to the offspring
        offspring[composition_matrix[x][y]] = offspring[composition_matrix[x][y]] + 1;
        return;
    }
    push_cells(x, y, direction);
    return;
}

function random_element(list) {
    index =  Math.floor(Math.random() * list.length);
    return list[index]
}

// offspring hops out of crypt without interaction with stem cells
function divide_asymmetric(x, y) {
    offspring[composition_matrix[x][y]] = offspring[composition_matrix[x][y]] + 1
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

// get random stem cell neighbour which can be replaced
// stem cells can hop one black cel but not replace a black cel
function getStemNeighbour(x, y) {
    // should be easier, if element 0 hops to left, hop to last element
    if (y - 1 == -1 ) {
        possible_hops = [[x, size], [x, (y + 1) % size]]
    }
    possible_hops = [[x, y - 1], [x, (y + 1) % size]]
    // should be easier
    if (x == 1) {
        if (y == 0) {
            possible_hops.push([1, 3])
        }
        if (y == 3) {
            possible_hops.push([1, 0])
        }
        if (x + 2 < composition_matrix.lenth) {
            possible_hops.push([(x + 2), y])
        }
        if (x - 2 > -1) {
            possible_hops.push([x-2, y])
        }
    }
    let index = Math.floor(Math.random() * possible_hops.length)
    let random_neighbour = possible_hops[index];
    // while random neighbour is invalid hop candidate
    console.log('random neighbours ' + random_neighbour)
    console.log(composition_matrix[random_neighbour[0]])
    while(composition_matrix[random_neighbour[0]][random_neighbour[1]] == undefined || 
        composition_matrix[random_neighbour[0]][random_neighbour[1]] == 'black' ||
        composition_matrix[random_neighbour[0]][random_neighbour[1]] == 0){
        possible_hops.splice(index, 1)
        index = Math.floor(Math.random() * possible_hops.length)
        random_neighbour = possible_hops[index];
    }
    return random_neighbour
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