import {AliensController} from "./AliensController";
import {Alien} from "./Alien";
import {Axis, Scalar, Space, Vector3} from "@babylonjs/core";
import State from "./State";
import {AlienBullet} from "./AlienBullet";
import {Barrier} from "./Barrier";
import {Explosion} from "./Explosion";
import {MotherShip} from "./MotherShip";
import spaceinvadersConfig from "../spaceinvaders.config";

export class AlienFormationController {

  defaultParams = {
    columns: 5,
    rows: 5,
    spacing: {
      x: 9,
      y: 8
    },
    formationAnimInterval: 1500, //1500 is good start value
    formationAnimSpeed: 0.2,
    fireRate: 1, // Avg bullets per second
    numBarriers: 3,
    alien1Lives: 0,
    alien2Lives: 0,
    alien3Lives: 0
  }
  minX = -45;
  maxX = 45;
  minY = -6;
  aliens = [];
  bullets = [];
  barriers = [];

  constructor(scene, gameAssets = null) {
    this.scene = scene;
    this.gameAssets = gameAssets;
    this.aliensController = new AliensController(scene);
    this.motherShip = new MotherShip(this.gameAssets, scene);
    this.direction = Math.random() < 0.5 ? "left" : "right";
    this.movementStarted = false;
    this.levelParams = this.levelFormationAlgorithm();
    this.level = State.level;
    this.buildFormation();
    this.buildBarriers(this.levelParams.numBarriers);
    this.setLoop();
  }

  buildBarriers(numBarriers) {
    let posy = 15;
    let totalWidth = (this.maxX - this.minX);
    let distance = totalWidth / (numBarriers - 1);
    let posx = this.minX;
    for (let i = 0; i < numBarriers; i++) {
      let pos = new Vector3(posx, posy, 0);
      let barrier = new Barrier(this.gameAssets, this.scene, pos);
      this.barriers.push(barrier);
      posx += distance;
    }
  }

  destroyBarriers() {
    let index = 0;
    for (let barrier of this.barriers) {
      barrier.destroyBarrierMesh();
      if (!barrier.bricks.length) {
        this.barriers.splice(index, 1);
        break;
      }
      index++;
    }
  }

  buildFormation() {
    let alien1 = this.gameAssets.clone("Alien_1");
    let alien2 = this.gameAssets.clone("Alien_2");
    let alien3 = this.gameAssets.clone("Alien_3");
    let alien = {};
    for (let rc = 0; rc < this.levelParams.rows; rc++) {
      for (let cc = 0; cc < this.levelParams.columns; cc++) {
        let x = (cc * this.levelParams.spacing.x) - ((this.levelParams.columns - 1) / 2 * this.levelParams.spacing.x);
        let y = (rc * this.levelParams.spacing.y) - ((this.levelParams.rows - 1) / 2 * this.levelParams.spacing.y);
        if (rc < 2) {
          alien = new Alien(this.scene, alien1);
          alien.mesh.metadata.lives = this.levelParams.alien1Lives ?? 0;
          alien.mesh.metadata.scoreValue = 10;
        } else if (rc < 4) {
          alien = new Alien(this.scene, alien2);
          alien.mesh.metadata.lives = this.levelParams.alien2Lives ?? 0;
          alien.mesh.metadata.scoreValue = 20;
        } else {
          alien = new Alien(this.scene, alien3);
          alien.mesh.metadata.lives = this.levelParams.alien3Lives ?? 0;
          alien.mesh.metadata.scoreValue = 30;
        }

        // Scaling
        alien.mesh.scaling = new Vector3(1.7 - (rc * 0.14), 1.7 - (rc * 0.14), 4 - (rc * 0.14));

        alien.x = x;
        alien.y = y;
        alien.id = alien.mesh.id;
        alien.mesh.onDispose = (mesh) => {
          if (State.state !== "GAMEOVER") {
            this.onDestroyMesh(mesh);
          }
        };
        this.aliens.push(alien);
      }
    }
    this.alienCount = this.aliens.length;
    State.formation = 1;
  }

  onDestroyMesh(mesh) {
    // destroy the alien object.
    let index = 0
    for (let a of this.aliens) {
      if (a.id === mesh.id) {
        State.score += mesh.metadata.scoreValue;

        // Bigger aliens have bigger explosions
        new Explosion(mesh, 20 * mesh.scaling.x, mesh.scaling.x / 1.5, this.scene);
        this.gameAssets.sounds.alienExplosion.play();
        this.aliens.splice(index, 1);
      }
      index++;
    }
    this.alienCount = this.aliens.length;
  }

  setLoop() {
    this.formationAnimInterval = this.levelParams.formationAnimInterval;
    this.formationAnimSpeed = this.levelParams.formationAnimSpeed / 2;
    this.formationAnimTick = setTimeout(() => {
      this.formationAnimSpeed = this.levelParams.formationAnimSpeed;
      this.moveFormation();
      this.movementStarted = true;
    }, 3000);
    this.formationObserver = this.scene.onBeforeRenderObservable.add(() => {
      this.updateAlienMeshPositions();
      if (this.movementStarted) {
        this.fireBullets();
      }
    }, 1);
  }

  fireBullets() {
    if (!this.aliens.length) return;
    let firenow = Math.random() * (60 / State.delta) < this.levelParams.fireRate;
    if (firenow) {
      let randAlien = this.aliens[Math.floor(Math.random() * this.aliens.length)];
      let randAlienMesh = randAlien.mesh;
      this.bullets.push(new AlienBullet(this.scene, randAlienMesh));
      this.gameAssets.sounds.alienBullet.play();
    }
  }

  updateAlienMeshPositions() {
    for (const alien of this.aliens) {
      let alienPosition = alien.updateMeshPosition(this.formationAnimSpeed);
      this.changeDirectionIfAtEdge(alienPosition);
      this.checkCollisionWithGround(alienPosition);
    }
  }

  checkCollisionWithGround(position) {
    if (position.y < this.minY) {
      this.scene.onBeforeRenderObservable.remove(this.formationObserver);
      State.state = "ALIENSWIN";
    }
  }

  moveFormation() {
    if (this.direction === "right") {
      this.aliensController.formation.x += 5;
    }
    if (this.direction === "left") {
      this.aliensController.formation.x -= 5;
    }
    if (this.direction === "down") {
      // If the player has died no need to move further
      // down during the delay before loading the next level
      if (State.state !== "GAMEOVER") {
        this.aliensController.formation.y -= 5;
      }
      this.direction = this.nextDirection;
    }
    //this.formationAnimSpeed = Scalar.Lerp(this.formationAnimSpeed, 0.8, 0.013);
    if (State.state === "GAMELOOP" && this.aliens.length) {
      this.gameAssets.sounds.alienMove.play();
      this.formationAnimInterval = Scalar.Lerp(this.formationAnimInterval, 100, 0.025);
    }
    this.formationAnimTick = setTimeout(() => {
      this.moveFormation();
    }, this.formationAnimInterval);
  }

  changeDirectionIfAtEdge(position) {
    if (position.x > this.maxX && this.direction === "right") {
      this.direction = "down";
      this.nextDirection = "left";
    }
    if (position.x < this.minX && this.direction === "left") {
      this.direction = "down";
      this.nextDirection = "right";
    }
  }

  clearScene() {
    this.scene.onBeforeRenderObservable.remove(this.formationObserver);
    clearTimeout(this.formationAnimTick);
    this.aliensController.recenterFormation();
  }

  levelFormationAlgorithm() {
    let levelParams = this.defaultParams;

    // Alien grid gets bigger each level up to a max size
    const maxColumns = 10;
    const maxRows = 6;
    levelParams.columns = this.defaultParams.columns + State.level - 1;
    levelParams.rows = this.defaultParams.rows + State.level - 1;
    if (levelParams.columns > maxColumns) levelParams.columns = maxColumns;
    if (levelParams.rows > maxRows) levelParams.rows = maxRows;

    // Fire rate increases every level by a multiple;
    const fireRateIncreaseMultiple = 1.2;
    levelParams.fireRate = this.defaultParams.fireRate * Math.pow(fireRateIncreaseMultiple, State.level - 1);

    // Increase the number of barriers;
    // Additional barrier every 2 levels
    // up to a maximum
    const maxBarriers = 6;
    levelParams.numBarriers = Math.floor(this.defaultParams.numBarriers + (State.level / 2) - 0.5);
    if (levelParams.numBarriers > maxBarriers) levelParams.numBarriers = maxBarriers;

    // Give aliens lives, so they take more than one hit to die.
    // From Level 4 Alien1 gets 1 life increasing by 1 every 3 levels.
    // From Level 6 Alien2 gets 1 life increasing by 1 every 3 levels.
    const maxAlienLives = 3;
    if (State.level > 3) {
      levelParams.alien1Lives = 1 + Math.floor((State.level / 3) - 1);
      if (levelParams.alien1Lives > maxAlienLives) levelParams.alien1Lives = maxAlienLives;
    }
    if (State.level > 5) {
      levelParams.alien2Lives = 1 + Math.floor((State.level / 3) - 2);
      if (levelParams.alien2Lives > maxAlienLives) levelParams.alien2Lives = maxAlienLives;
    }

    // Motherships spawn faster at higher levels.
    this.motherShip.interval = spaceinvadersConfig.motherShip.interval - (State.level / 2);
    this.motherShip.fireRate = 2 + (State.level / 3);

    return levelParams
  }
}
