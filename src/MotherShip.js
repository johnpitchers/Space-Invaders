import {Axis, Scalar, Space, Vector3} from "@babylonjs/core";
import State from "./State";
import spaceinvadersConfig from "../spaceinvaders.config";
import {AlienBullet} from "./AlienBullet";
import {Explosion} from "./Explosion";

export class MotherShip {

  constructor(gameAssets, scene) {
    this.enabled = false;
    this.active = false;
    this.lastactivated = Math.floor(Date.now() / 1000) - 1;
    this.gameAssets = gameAssets;
    this.interval = spaceinvadersConfig.motherShip.interval;
    this.fireRate = spaceinvadersConfig.motherShip.fireRate;
    this.hitsToKill = spaceinvadersConfig.motherShip.hitsToKill;
    this.velocity = spaceinvadersConfig.motherShip.velocity;
    this.scene = scene;
    this.bullets = [];
    this.enable();
  }

  initMotherShipMesh() {
    this.mesh = this.gameAssets.clone("MotherShip");
    this.mesh.position = new Vector3(-3000, 100, 0);
    this.mesh.metadata = {
      type: "mothership",
      scoreValue: 1000,
      lives: this.hitsToKill,
      frameCounter: 0 // Used in orthographic camera mode
    }
    this.mesh.onDispose = (mesh) => {
      if (this.mesh.metadata.silentDispose === undefined) {
        State.score += mesh.metadata.scoreValue;
        new Explosion(mesh, 60, 1.5, this.scene);
        this.gameAssets.sounds.motherShipExplosion.play();
      }
      this.gameAssets.sounds.motherShip.stop();
      this.deactivate();
    }
    this.mesh.checkCollisions = true;
    this.mesh.collisionGroup = 2;
  }

  fireBullets() {
    if (!this.active || State.state !== "GAMELOOP") return;
    let firenow = Math.random() * (60 / State.delta) < this.fireRate;
    if (firenow) {
      this.bullets.push(new AlienBullet(this.scene, this.mesh));
      this.gameAssets.sounds.alienBullet.play();
    }
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.activatedTimer = this.scene.onBeforeRenderObservable.add(() => {
      if (!this.active) {
        let now = Math.floor(Date.now() / 1000);
        if (now > this.lastactivated + this.interval) {
          this.activate();
        }
      }
      this.fireBullets();
    });
  }

  disable() {
    if (!this.enabled) return;
    this.scene.onBeforeRenderObservable.remove(this.activatedTimer);
    if (this.mesh) this.mesh.position = new Vector3(-3000, 100, 0);
    this.enabled = false;
    this.active = false;
  }

  activate() {
    if (State.state !== "GAMELOOP") return;
    this.initMotherShipMesh();
    this.mesh.position = new Vector3(-100, 100, 0);
    this.startLoopArc();
    this.active = true;
  }

  moveOffScreen() {
    if (!this.active) return false;
    let posY = this.mesh.position.y;
    if (posY < 150) {
      this.mesh.position.y = Scalar.Lerp(posY, 160, 0.015);
      return true;
    }
    return false;
  }

  destroyMotherShip() {
    this.deactivate();
    this.disable();
    if (this.mesh) {
      this.mesh.metadata.silentDispose = true;
      this.mesh.dispose();
    }
  }

  startLoopArc() {
    this.gameAssets.sounds.motherShip.play();
    let direction = Math.random() < 0.5 ? "leftToRight" : "rightToLeft";
    let center = {
      x: 0,
      y: 125
    }
    let radius = {
      x: 100,
      y: 27
    };
    let i = 0;
    this.mothershipLoop = this.scene.onBeforeRenderObservable.add(() => {
      i += (this.velocity / 250) * State.delta;
      if (spaceinvadersConfig.oldSchoolEffects.enabled) {
        // If orthographic camera is in use,
        // rotate the mesh just once every 15 frames
        // to create an old school animation.
        this.mesh.metadata.frameCounter ++
        if (this.mesh.metadata.frameCounter % 15 === 0) {
           this.mesh.rotate(Axis.Y, this.mesh.rotation.y+Math.PI / 8, Space.LOCAL);
        }
      } else {
        this.mesh.rotate(Axis.Y, this.mesh.rotation.y + (spaceinvadersConfig.motherShip.rotateSpeed * State.delta), Space.LOCAL);
      }
      let pos = {
        x: center.x + Math.cos(i) * radius.x,
        y: center.y - Math.sin(i) * radius.y
      }
      if (State.state === "CLEARLEVEL") {
        pos.y = this.mesh.position.y;
      }
      if (direction === "leftToRight") {
        this.mesh.position = new Vector3(-pos.x, pos.y, 0);
      } else { // rightToLeft
        this.mesh.position = new Vector3(pos.x, pos.y, 0);
      }
      if (i > Math.PI) {
        this.gameAssets.sounds.motherShip.stop();
        this.deactivate();
        this.mesh.metadata.silentDispose = true;
        this.mesh.dispose();
      }
    });
  }

  deactivate() {
    this.scene.onBeforeRenderObservable.remove(this.mothershipLoop);
    this.active = false;
    this.lastactivated = Math.floor(Date.now() / 1000);
  }
}
