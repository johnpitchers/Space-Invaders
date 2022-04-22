import {MeshBuilder, Vector3} from "@babylonjs/core";
import State from "./State";

export class AlienBullet {

  constructor(scene, playerMesh) {
    this.scene = scene;
    this.minY = -30;
    this.offset = -2;
    this.bulletSpeed = -0.5;
    this.bullet = new MeshBuilder.CreateBox("bullet", {
      width: 0.5,
      height: 3,
      depth: 1
    }, this.scene);
    this.bullet.position = new Vector3(
      playerMesh.position.x,
      playerMesh.position.y + this.offset,
      playerMesh.position.z
    );
    let bulletArc = Math.PI/6;
    this.bullet.rotate(new Vector3(0, 0, 1), (Math.random() * bulletArc) - bulletArc/2);
    this.bullet.checkCollisions = true;
    this.bullet.collisionGroup = 8;
    this.bullet.collisionMask = 17;

    this.startBulletLoop();
  }

  startBulletLoop() {
    this.bulletObserver = this.scene.onBeforeRenderObservable.add(() => {
      let moveVector = this.bullet.calcMovePOV(0, this.bulletSpeed * State.delta, 0);
      this.bullet.moveWithCollisions(moveVector);
      if (this.bullet.position.y < this.minY) {
        this.destroyBullet();
      }
      if (this.bullet.collider.collidedMesh) {
        this.handleCollision();
      }

    });
  }

  handleCollision() {
    let collidedWithType = (this.bullet.collider.collidedMesh.metadata).type;
    if (collidedWithType === "player") {
      this.bullet.collider.collidedMesh.dispose(); // perform action with player meshes onDispose event.
      this.destroyBullet();
    }
    if (collidedWithType === "barrier") {
      this.bullet.collider.collidedMesh.dispose();
      this.destroyBullet();
    }
  }

  destroyBullet() {
    this.scene.onBeforeRenderObservable.remove(this.bulletObserver);
    this.bullet.dispose();
    this.disposed = true; // Tells our game loop to destroy this instance.
  }
}
