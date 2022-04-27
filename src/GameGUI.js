import {AdvancedDynamicTexture, Control, Style, TextBlock} from "@babylonjs/gui";
import State from "./State";

export class GameGUI {

  texture;
  style;
  canvasWidth;
  canvasHeight;
  textScore;
  textLevel;
  textLives;
  textHigh;

  constructor() {
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true);
    this.getCanvasSize();
    this.createTextNodes();

    window.onresize = () => {
      this.getCanvasSize();
    }
  }

  createTextNodes() {
    //Score
    this.textScore = new TextBlock();
    this.textScore.color = "white";
    this.textScore.fontFamily = '"Press Start 2P"';
    this.textScore.fontSize = 22;
    this.textScore.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.textScore.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.textScore.left = -450;
    this.textScore.top = 40;
    this.texture.addControl(this.textScore);

    // Level
    this.textLevel = new TextBlock();
    this.textLevel.color = "white";
    this.textLevel.fontSize = 22;
    this.textLevel.fontFamily = '"Press Start 2P"';
    this.textLevel.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.textLevel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    this.textLevel.left = -150;
    this.textLevel.top = 40;
    this.texture.addControl(this.textLevel);

    // Lives
    this.textLives = new TextBlock();
    this.textLives.color = "white";
    this.textLives.fontSize = 22;
    this.textLives.fontFamily = '"Press Start 2P"';
    this.textLives.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.textLives.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    this.textLives.left = 150;
    this.textLives.top = 40;
    this.texture.addControl(this.textLives);

    // High score
    this.textHigh = new TextBlock();
    this.textHigh.color = "white";
    this.textHigh.fontSize = 22;
    this.textHigh.fontFamily = '"Press Start 2P"';
    this.textHigh.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.textHigh.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    this.textHigh.left = 450;
    this.textHigh.top = 40;
    this.texture.addControl(this.textHigh);

  }

  update() {
    this.textScore.text = "SCORE:"+State.score;
    this.textLevel.text = "LEVEL:"+State.level;
    this.textLives.text = "LIVES:"+State.lives;
    this.textHigh.text = "HIGH:"+window.localStorage.getItem('highScore');
  }

  getCanvasSize() {
    this.canvasWidth = document.querySelector("canvas").width;
    this.canvasHeight = document.querySelector("canvas").height;
    console.log(this.canvasHeight);
  }
}
