import {AlienFormationController} from "./AlienFormationController";
import State from "./State";
import {PlayerController} from "./PlayerController";
import config from "../spaceinvaders.config";
import {Color3} from "@babylonjs/core";
import {GameGUI} from "./GameGUI";

export class GameController {

  constructor(environment, inputController, gameAssets = null, UI) {
    this.UI = UI;
    this.environment = environment;
    this.scene = environment.scene;
    this.inputController = inputController;
    this.gameAssets = gameAssets;
    this.playerController = new PlayerController(environment, this.gameAssets);
  }

  initialise() {
    State.lives = config.startingLives;
    State.level = config.startingLevel;
    State.score = 0;
    State.highScore = this.getHighScore();
    State.gameOverStep = 0;
    State.gameOverStep = 0;
  }

  setHighScore(score) {
    window.localStorage.setItem('highScore', score);
    State.highScore = score;
  }

  getHighScore() {
    return parseInt(window.localStorage.getItem('highScore') ?? 0);
  }

  startGame() {
    //this.fullScreen();
    this.initialise();
    this.nextLevel();
    this.loadGameGUI();
  }

  loadGameGUI(){
    this.UI.disable();
    this.gameGUI = new GameGUI();
    this.playerController.mobileInputs.enable(this.gameGUI.texture);
  }

  fullScreen() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      let el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) { /* Safari */
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) { /* IE11 */
        el.msRequestFullscreen();
      }
    }
  }

  titleScreen() {
    this.UI.showTitleScreen();
    this.UI.hideLoadingScreen()
  }

  nextLevel() {
    State.level += 1;
    this.playerController.movementEnabled = false;
    this.buildAliensFormation();
    this.playerController.initPlayer();
    State.state = "GAMELOOP";
    this.gameAssets.sounds.levelStart.play();
  }

  checkStates() {
    this.playerController.actionCam();
    if (this.alienFormation.alienCount === 0) {
      State.state = "PLAYERWINS";
      this.playerController.disableMovement();
      setTimeout(() => {
        State.state = "CLEARLEVEL";
        this.gameAssets.sounds.clearLevel.play();
        this.UI.showGameUI();
        this.UI.showGameHints();
      }, 1500);
    }
    this.gameGUI.update();
  }

  aliensWin() {
    State.lives = 0;
    this.playerController.playerMesh.dispose();
  }

  gameOver() {
    switch (State.gameOverStep) {
      case 0:
        this.UI.showGameUI();
        setTimeout(() => {
          this.UI.showGameOver();
          this.checkForNewHighScore();
          this.gameAssets.sounds.gameOver.play();
        }, 2000);
        setTimeout(() => {
          this.UI.showPlayAgain();
          State.gameOverStep = 2;
        }, 4000);
        State.gameOverStep = 1;
        break;
      case 1:
        break;
      case 2:
        if (this.UI.playAgainPressed) {
          this.destroyGameGUI();
          this.UI.hideGameOver();
          this.UI.hidePlayAgain();
          this.UI.hideNewHighScore();
          State.gameOverStep = 3;
          this.gameAssets.sounds.clearLevel.play();
        }
        break;
      case 3 :
        this.clearLevel();
        break;
      case 4:
        State.state = "TITLESCREEN";
        break;
      default:
        break;
    }
  }

  destroyGameGUI(){
    this.gameGUI.texture.dispose();
    delete this.gameGUI.texture;
  }

  checkForNewHighScore() {
    if (State.score > this.getHighScore()) {
      this.setHighScore(State.score);
      this.UI.showNewHighScore();
      this.gameGUI.update();
    }
  }

  buildAliensFormation() {
    this.alienFormation = new AlienFormationController(this.scene, this.gameAssets);
  }

  clearLevel() {
    let clearSteps = 4;
    this.playerController.actionCam(0);
    this.gameGUI.update();
    // Step 1. All barriers must be destroyed.
    if (this.alienFormation.barriers.length) {
      this.alienFormation.destroyBarriers();
      clearSteps -= 1;
    }
    //Step 2. The player should be moved off-screen.
    this.playerController.disableMovement();
    if (this.playerController.moveOffScreen()) {
      clearSteps -= 1;
    }
    // Step 3. Move the mothership offscreen.
    if (this.alienFormation.motherShip.moveOffScreen()) {
      clearSteps -= 1;
    }
    // Step 4. Destroy remaining alien bullets.
    // Step 5. Destroy remaining aliens
    if (this.alienFormation.aliens.length) {
      let randID = Math.floor(Math.random() * this.alienFormation.aliens.length);
      this.alienFormation.aliens[randID].mesh.dispose();
      this.alienFormation.aliens.splice(randID, 1);
      clearSteps -= 1;
    }

    if (clearSteps === 4) {
      this.playerController.destroyPlayer();
      this.alienFormation.motherShip.destroyMotherShip();
      this.alienFormation.clearScene();
      delete this.alienFormation;
      // final cleanup to ensure everything has been disposed of.
      while (this.scene.meshes.length) {
        this.scene.meshes[0].dispose();
      }
      if (State.state === "GAMEOVER") {
        State.gameOverStep += 1;
      } else {
        State.state = "NEXTLEVEL";
      }
      this.UI.hideGameHints();
      this.UI.hideGameUI();
      this.UI.disable();
    }
  }
}
