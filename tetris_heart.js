$(document).ready(function () {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    const ROWS = 20;
    const COLS = 10;
    const SQ = 25;     //length of each square
    const WHITE = "rgb(12,12,41)";

    //voice
    let music = document.getElementById("sound");
    let key_press = document.getElementById("key");

    //speed num show
    let speed_num = $("#sp_num");

    //get live game over modal
    // let gameOver = $(".gameover");
    // gameOver.hide();

    //score
    let score = 0;
    let score_live = document.getElementById("score");
    let highest_score=score;
    $('#high_score').text(highest_score);

    //speed control
    let changeSp = document.getElementById("change_speed");
    let speed = 1;
    speed_num.text(`${speed}x`);

    changeSp.addEventListener("click", function () {
        speed = document.getElementById("speed").value;
        speed_num.text(`${speed}x`);
    });
    $('#score').text(score);


    //game over part
    let msg_game_over = $(".gameover");
    msg_game_over.hide();
    let play_again = $('#play_again');
    let exit = $('#close');


    //button left/right/rotate/down
    let left = document.getElementById('left');
    let right = document.getElementById('right');
    let rotate = document.getElementById('rotate');
    let down = document.getElementById('down');

    //create function to draw square
    function createSquare(x, y, color, b_color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
        ctx.strokeStyle = b_color;
        ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
    }

    //create board => by just makind 2d array and assign colors into that
    let Board = [];
    function createBoard() {
        for (let i = 0; i < ROWS; i++) {
            Board[i] = [];
            for (let j = 0; j < COLS; j++)
                Board[i][j] = WHITE;
        }
    }
    createBoard();
    //draw board => connect that array with canvas
    function drawBoard() {
        for (let i = 0; i < ROWS; i++)
            for (let j = 0; j < COLS; j++) {
                if (Board[i][j] == WHITE)
                    createSquare(j, i, Board[i][j], Board[i][j]);
                else
                    createSquare(j, i, Board[i][j], "WHITE");
            }
    }
    drawBoard();

    //create tetromino array for randomnly choose one one of the shape

    const Pieces = [
        [Z, "rgb(26, 209, 194)"],
        [I, " rgb(230, 240, 97)"],
        [J, "rgb(238, 63, 185)"],
        [L, "rgb(247, 34, 34)"],
        [T, "rgb(156, 11, 105)"],
        [O, "rgb(238, 20, 104)"],
        [S, "rgb(6, 211, 6)"]
    ];

    //create an object of shape which is falling down
    function Piece(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
        this.tetrominoN = 0;
        this.activeTetromino = tetromino[this.tetrominoN];
        this.x = 3;
        this.y = -2;
    }

    //randomly choose any of the pieces
    function random_shape() {
        let random_no = Math.floor(Math.random() * Pieces.length);
        return new Piece(Pieces[random_no][0], Pieces[random_no][1]);
    }

    //fill the shape
    Piece.prototype.fill_shape = function (color, border_color) {
        for (let i = 0; i < this.activeTetromino.length; i++) {
            for (let j = 0; j < this.activeTetromino.length; j++) {
                if (this.activeTetromino[i][j]) {
                    createSquare(j + this.x, i + this.y, color, border_color);
                }
            }
        }
    }

    //draw the shape
    Piece.prototype.draw = function () {
        this.fill_shape(this.color, "WHITE");

    }

    //undraw the shape
    Piece.prototype.undraw = function () {
        this.fill_shape(WHITE, WHITE);
        drawBoard();
    }
    let p = random_shape();
    p.draw();

    //move left 
    Piece.prototype.moveL = function () {
        if (!this.collision(-1, 0, this.activeTetromino)) {
            this.undraw();
            this.x--;
            this.draw();
        }
    }

    //move right
    Piece.prototype.moveR = function () {
        if (!this.collision(1, 0, this.activeTetromino)) {
            this.undraw();
            this.x++;
            this.draw();
        }
    }

    //move down 
    Piece.prototype.moveD = function () {
        if (!this.collision(0, 1, this.activeTetromino)) {
            this.undraw();
            this.y++;
            this.draw();
        }
        else {
            this.lock();
            p = random_shape();
        }
    }

    //rotate the piece 
    Piece.prototype.rotate = function () {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % (this.tetromino.length)];
        if (!this.collision(0, 0, nextPattern)) {
            this.undraw();
            this.tetrominoN = (this.tetrominoN + 1) % (this.tetromino.length);
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
        else {
            let kick = 0;
            if (this.x < (COLS / 2))
                kick = 1;
            if (this.x > (COLS / 2))
                kick = -1;
            if (!this.collision(kick, 0, nextPattern)) {
                this.undraw();
                this.x += kick;
                this.tetrominoN = (this.tetrominoN + 1) % (this.tetromino.length);
                this.activeTetromino = this.tetromino[this.tetrominoN];
                this.draw();
            }

        }
    }

    // control the piece by detecting which key is pressed
    document.addEventListener("keydown", Control);  //call the control function 

    function Control(event) {
        if (event.keyCode == 37) {
            p.moveL();
        }
        else if (event.keyCode == 38) {
            p.rotate();
        }
        else if (event.keyCode == 39) {
            p.moveR();
        }
        else if (event.keyCode == 40) {
            p.moveD();
        }

    }

    //check collision
    Piece.prototype.collision = function (x, y, chunk) {
        for (let i = 0; i < chunk.length; i++) {
            for (let j = 0; j < chunk.length; j++) {
                if (!chunk[i][j])
                    continue;
                let nextX = x + this.x + j;
                let nextY = y + this.y + i;
                if (nextY < 0)
                    continue;
                if (nextX < 0 || nextX >= COLS || nextY >= ROWS)
                    return true;
                if (Board[nextY][nextX] != WHITE)
                    return true;
            }
        }
        return false;
    }
    // let time_diff=
    //drop function for one by onr fall down of piece
    let dropDownTime = Date.now();
    let game_over = false;

    function drop() {
        let now = Date.now();
        let diffTime = now - dropDownTime;
        console.log(speed);
        if (diffTime > 1000 / speed) {
            p.moveD();
            dropDownTime = Date.now();
        }
        if (!game_over)
            requestAnimationFrame(drop);
    }
    drop();
    //lock the shape
    Piece.prototype.lock = function () {
        for (let i = 0; i < this.activeTetromino.length; i++) {
            for (let j = 0; j < this.activeTetromino.length; j++) {
                if (this.activeTetromino[i][j])
                    Board[this.y + i][this.x + j] = this.color;
            }
            key_press.play();
        }

        //if the row is full then we have to clear that row
        for (i = 0; i < ROWS; i++) {
            let isfull = true;
            for (j = 0; j < COLS; j++) {
                isfull = isfull && (Board[i][j] != WHITE);
            }
            if (isfull) {
                for (let y = i; y > 0; y--) {
                    for (let col = 0; col < COLS; col++) {
                        Board[y][col] = Board[y - 1][col];
                    }
                }
                music.play();
                score += 10;
                if(highest_score<score)
                {
                    highest_score=score;
                    $('#high_score').text(highest_score);
                }
                $('#score').text(`${score}`);
            }
            for (j = 0; j < COLS; j++) {
                Board[0][j] = WHITE;
            }
        }
        drawBoard();

        //check for game over
        if (this.y <= 1) {
            $('#canvas').hide();
            $('#left').hide();
            $('#right').hide();
            $('#rotate').hide();
            $('#down').hide();
            $('#speed').hide();
            $('#sp_num').hide();
            $('#change_speed').hide();
            $('.score').hide();
            msg_game_over.show();
            play_again.click(function () {
                msg_game_over.hide();
                $('#canvas').show();
                $('#left').show();
                $('#right').show();
                $('#rotate').show();
                $('#down').show();
                $('#speed').show();
                $('#sp_num').show();
                $('#change_speed').show();
                $('.score').show();
                speed = 1;
                document.getElementById("speed").value = 1;
                createBoard();
                drawBoard();
                drop();
                score = 0;
                speed_num.text(`${speed}x`);
                $('#score1').text(score);
            }
            );
            exit.click(function () {
                location.replace("first_page.html");
            });
        }
    }

    //control piece by mouse by these buttons
    left.addEventListener('click', () => { p.moveL(); });
    right.addEventListener('click', () => { p.moveR(); });
    down.addEventListener('click', () => { p.moveD(); });
    rotate.addEventListener('click', () => { p.rotate(); });
});