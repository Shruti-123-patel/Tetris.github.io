let canvas=document.getElementById('canvas');
let ctx=canvas.getContext("2d");
const ROWS=20;
const COLS=10;
const SQ=25;     //length of each square
const WHITE="WHITE";

//create function to draw square
function createSquare(x,y,color)
{
    ctx.fillStyle=color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
    ctx.strokeStyle="BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

//create board => by just makind 2d array and assign colors into that
let Board=[];   
for(let i=0;i<ROWS;i++)
{
    Board[i]=[];
    for(let j=0;j<COLS;j++)
        Board[i][j]=WHITE;
}

//draw board => connect that array with canvas
function drawBoard()
{
  for(let i=0;i<ROWS;i++)
    for(let j=0;j<COLS;j++)
        createSquare(j,i,Board[i][j]);
}
drawBoard();

//create tetromino array for randomnly choose one one of the shape
const Pieces=[
    [Z,"BLUE"],
    [I,"GREEN"],
    [J,"RED"],
    [L,"BROWN"],
    [T,"VIOLET"],
    [O,"ORANGE"],
    [S,"GREY"]
];

//create an object of shape which is falling down
function Piece(tetromino,color)
{
    this.tetromino=tetromino;
    this.color=color;
    this.tetrominoN=0;
    this.activeTetromino=tetromino[this.tetrominoN];
    this.x=0;
    this.y=0;
}

//randomly choose any of the pieces
function random_shape()
{
    let random_no=Math.floor(Math.random()*Pieces.length);
    return new Piece(Pieces[random_no][0],Pieces[random_no][1]);
}

//fill the shape
Piece.prototype.fill_shape=function(color)
{
    for(let i=0;i<this.activeTetromino.length;i++)
    {
        for(let j=0;j<this.activeTetromino.length;j++)
        {
            if(this.activeTetromino[i][j])
            {
                createSquare(j+this.x,i+this.y,color);
            }
        }
    }
}

//draw the shape
Piece.prototype.draw=function()
{
    this.fill_shape(this.color);
}

//undraw the shape
Piece.prototype.undraw=function()
{
    this.fill_shape(WHITE);
}
let p=random_shape();
p.draw();

//move left 
Piece.prototype.moveL=function()
{
    if(!this.collision(-1,0,this.activeTetromino))
    {
        this.undraw();
        this.x--;
        this.draw();
    }
    else{
        
    }
}

//move right
Piece.prototype.moveR=function()
{
    if(!this.collision(1,0,this.activeTetromino))
    {
        this.undraw();
        this.x++;
        this.draw();
    }
}

//move down 
Piece.prototype.moveD=function()
{
    if(!this.collision(0,1,this.activeTetromino))
    {
        this.undraw();
        this.y++;
        this.draw();
    }
    else
    {
        this.lock();
        p=random_shape();
    }
}

//rotate the piece 
Piece.prototype.rotate=function()
{
    this.undraw();
    this.tetrominoN=(this.tetrominoN+1)%(this.tetromino.length);
    this.activeTetromino=this.tetromino[this.tetrominoN];
    this.draw();
}

// control the piece by detecting which key is pressed
document.addEventListener("keydown",Control);  //call the control function 

function Control(event)
{
    if(event.keyCode==37)
    {
        p.moveL();
    }
    else if(event.keyCode==38)
    {
        p.rotate();
    }
    else if(event.keyCode==39)
    {
        p.moveR();
    }
    else if(event.keyCode==40)
    {
        p.moveD();
    }
}

//check collision
Piece.prototype.collision=function(x,y,chunk)
{
    for(let i=0;i<chunk.length;i++)
    {
        for(let j=0;j<chunk.length;j++)
        {
            if(!chunk[i][j])
                continue;
            let nextX=x+this.x+j;
            let nextY=y+this.y+i;
            console.log(nextX);
            console.log(nextY);
            if(nextY<0)
                continue;
            if(nextX<0 || nextX>=COLS || nextY>=ROWS)
                return true;
            if(Board[nextY][nextX]!=WHITE)
                return true;
        }
    }
    return false;
}

//drop function for one by onr fall down of piece
let dropDownTime=Date.now();
let game_over=false;

function drop()
{
    let now = Date.now();
    let diffTime=now-dropDownTime;
    if(diffTime>1000)
    {
        p.moveD();
        dropDownTime=Date.now();
    }
    if(!game_over)
        requestAnimationFrame(drop);    
}
drop();

//lock the shape
Piece.prototype.lock=function()
{
    for(let i=0;i<this.activeTetromino.length;i++)
    {
        for(let j=0;j<this.activeTetromino.length;j++)
        {
            if(this.activeTetromino[i][j])
                 Board[this.y+i][this.x+j]=this.color;
        }
    }

    //if the row is full then we have to clear that row
    let j,i;
    for(i=0;i<ROWS;i++)
    {
        isfull=true;
        for(j=0;j<COLS;j++)
        {
            isfull=isfull && (Board[i][j]!=WHITE);
        }
        if(isfull)
        {
            for(i;i>1;i--)
            {
                for(let col=0;col<COLS;col++)
                {
                    Board[i][col]=Board[i-1][col];
                    createSquare(i,col,Board[i-1][col]);
                }
            }
        }
        for(j=0;i<COLS;j++)
        {
            Board[0][j]=WHITE;
        }
    }
    drawBoard();
}


