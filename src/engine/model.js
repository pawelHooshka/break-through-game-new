import  {Observer} from 'react-observer-pattern';

import * as config from '../settings/settings';

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

class Data {

    constructor() {
        this.state = {
            gameOn: true,
            refreshIntervalId: null,
            right: false,
            left: false,
            brickRowCount: config.game.brickRowCount,
            brickWidth: config.game.brickWidth,
            brickHeight: config.game.brickHeight,
            brickPadding: config.game.brickPadding,
            brickOffsetTop: config.game.brickOffsetTop,
            brickOffsetLeft: config.game.brickOffsetLeft,
            gameScore: 0,
            gamesPlayed: 0,
            brickColumnCount: Math.floor((canvas.width-(this.state.brickOffsetLeft*2))/(this.state.brickWidth+this.state.brickPadding)),
            stillactiveBricks: (this.state.brickColumnCount+1) * (this.state.brickRowCount+1),
            paddleHeight: config.game.paddleHeight,
            paddleWidth: 75,
            dx_paddle: config.game.dx_paddle,
            paddle_edge_index: 0,
            paddle_edge_index_west: 0,
            paddle_edge_index_east: 1,
            dx: config.game.toleranceX,
            dy: -config.game.toleranceY,

            paddle_x_edge: null,
            paddle_y_west_edge: null,
            paddle_y_east_edge: null,

            egdeLeftHeight: this.createEdge("Y", 0, 0, canvas.height),
            edgeRightHeight: this.createEdge("Y", canvas.width, 0, canvas.height),
            edgeTop: this.createEdge("X", 0, 0, canvas.width),
            edgeBottom: this.createEdge("X", 0, canvas.height, canvas.width),

            bricks: new Array(),
            x_edges: new Array(),
            y_edges: new Array(),
            paddleX: (canvas.width-this.state.paddleWidth)/2,
            paddleY: canvas.height-this.state.paddleHeight,
            x: canvas.width/2,
            y: canvas.height - 30,
            dx_max: 3 * this.state.dx,
            bricks_top_left_corners: new Array()
        };
    }

    createEdge(type_value, x_coord, y_coord, length_value) {
        return ({
            type: type_value,
            x: x_coord,
            y: y_coord,
            length: length_value
        });
    }

    makeBrick(edgeTopIndex, edgeBottomIndex, edgeLeftIndex, edgeRightIndex) {
        return ({
            edgeTop: edgeTopIndex,
            edgeBottom: edgeBottomIndex,
            edgeLeft: edgeLeftIndex,
            edgeRight: edgeRightIndex,
            state: 1
        });
    }

    getPaddle_x_edge_x(defValue) {
        if (this.state.paddle_x_edge) {
            return this.state.paddle_x_edge.x;
        } else {
            return defValue;
        }
    }

    getPaddle_x_edge_y(defValue) {
        if (this.state.paddle_x_edge) {
            return this.state.paddle_x_edge.y;
        } else {
            return defValue;
        }
    }

    setBrickState(index, newstate) {
        this.state.bricks[index].state = newstate;
        if (newstate === 0) {
            this.state.gameScore++;
            this.state.stillactiveBricks--;
        }
    }

    brickExists(top, bottom, left, right) {
        for (var i = 0;i < this.state.bricks.length;i++) {
            var b = this.state.bricks[i];
            if (b.edgeTop==top && b.edgeBottom==bottom &&
                b.edgeLeft==left && b.edgeRight==right) {
                return i;
            }
        }
        return -1;
    }

    notifyObservers() {

    }

    resetBricks() {
        for (var i = 0;i < this.state.bricks.length;i++) {
            this.state.bricks[i].state=1;
        }
        this.state.stillactiveBricks = (this.state.brickColumnCount+1) * (this.state.brickRowCount+1);
        this.state.paddleX = (canvas.width-this.state.paddleWidth)/2;
        this.state.paddleY = canvas.height-this.state.paddleHeight;
        this.state.x = canvas.width/2;
        this.state.y = canvas.height - 30;
    }

    isBrickActive(brickIndex) {
        if (this.state.bricks[brickIndex].state==1) {
            return true;
        } else {
            return false;
        }
    }

    createBricks() {
        var lastX = this.state.brickOffsetLeft;
        var lastY = this.state.brickOffsetTop;
        for (var i = 0; i <= this.state.brickRowCount; i++) {
            this.state.bricks_top_left_corners[i] = new Array();
            for (var z = 0; z <= this.state.brickColumnCount; z++) {
                this.state.bricks_top_left_corners[i][z] = {x: lastX, y: lastY};
                lastX += (this.state.brickWidth + this.state.brickPadding);
            }
            lastY += (this.state.brickHeight + this.state.brickPadding);
            lastX = this.state.brickOffsetLeft;
        }

        this.registerBricks();
    }

    registerPaddle() {
        this.state.paddle_x_edge = this.createEdge("X", paddleX, paddleY, this.state.paddleWidth);
        this.state.paddle_y_west_edge = this.createEdge("Y", paddleX, paddleY, this.state.paddleHeight);
        this.state.paddle_y_east_edge = this.createEdge("Y", paddleX+this.state.paddleWidth, paddleY, this.state.paddleHeight);
    }

    registerBricks() {
        var x_index_offset = this.state.paddle_edge_index + 1;
        var y_index_offset = Math.max(this.state.paddle_edge_index_east, this.state.paddle_edge_index_west) + 1;

        var length1 = this.state.bricks_top_left_corners.length;
        /*alert("Current length of array of top left corners is: " + length1);*/
        for (var i = 0; i < length1; i++) {
            var length2 = this.state.bricks_top_left_corners[i].length;
            //alert("Current length of array of top left corners at index 0 is: " + length2);
            for (var z = 0; z < length2; z++) {
                var brick_left_top_x = this.state.bricks_top_left_corners[i][z].x;
                var brick_left_top_y = this.state.bricks_top_left_corners[i][z].y;
                var brickEdgeY1 = this.createEdge("Y", brick_left_top_x, brick_left_top_y, this.state.brickHeight);
                var brickEdgeY2 = this.createEdge("Y", brick_left_top_x+this.state.brickWidth, brick_left_top_y, this.state.brickHeight);
                var brickEdgeX1 = this.createEdge("X", brick_left_top_x, brick_left_top_y, this.state.brickWidth);
                var brickEdgeX2 = this.createEdge("X", brick_left_top_x, brick_left_top_y+this.state.brickHeight, this.state.brickWidth);
                var indexX1 = x_index_offset;
                x_index_offset++;
                var indexX2 = x_index_offset;
                x_index_offset++;
                var indexY1 = y_index_offset;
                y_index_offset++;
                var indexY2 = y_index_offset;
                y_index_offset++;
                var currentBrickIndex = this.brickExists(indexX1, indexX2, indexY1, indexY2);

                if (currentBrickIndex > -1) {
                    if (this.isBrickActive(currentBrickIndex)) {
                        this.state.x_edges[indexX1] = brickEdgeX1;
                        this.state.x_edges[indexX2] = brickEdgeX2;
                        this.state.y_edges[indexY1] = brickEdgeY1;
                        this.state.y_edges[indexY2] = brickEdgeY2;
                    } else {
                        this.state.x_edges[indexX1] = null;
                        this.state.x_edges[indexX2] = null;
                        this.state.y_edges[indexY1] = null;
                        this.state.y_edges[indexY2] = null;
                    }
                } else {
                    this.state.x_edges[indexX1] = brickEdgeX1;
                    this.state.x_edges[indexX2] = brickEdgeX2;
                    this.state.y_edges[indexY1] = brickEdgeY1;
                    this.state.y_edges[indexY2] = brickEdgeY2;
                    this.state.bricks.push(this.makeBrick(indexX1,indexX2,indexY1,indexY2));
                }
            }
        }
    }
}