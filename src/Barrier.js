import {Color3, MeshBuilder, Scalar, StandardMaterial, Vector3} from "@babylonjs/core";
import {Explosion} from "./Explosion";
import State from "./State";

export class Barrier {

  constructor(gameAssets, scene, position) {
    this.scene = scene;
    this.gameAssets = gameAssets;
    this.position = position;
    this.bricks = [];
    this.params = {
      brickSize: {
        x: 1,
        y: 1
      },
      columns: 14,
      rows: 7
    }

    this.buildBarrier();
  }

  buildBarrier() {
    let rootMesh = MeshBuilder.CreateBox('brick', {
      width: this.params.brickSize.x,
      height: this.params.brickSize.y,
      depth: 4
    }, this.scene);
    rootMesh.position = new Vector3(0, -300, 0);
    rootMesh.isVisible = false;
    rootMesh.checkCollisions = true;
    rootMesh.collisionGroup = 16;
    rootMesh.collisionResponse = false;
    rootMesh.collisionRetryCount = 10;
    rootMesh.metadata = {
      type: "barrier"
    }
    rootMesh.material = new StandardMaterial("brick_mesh", this.scene);
    //rootMesh.material.disableLighting = true;
    rootMesh.material.diffuseColor = new Color3(0.9, 0.8, 0.6);
    rootMesh.material.specularColor = new Color3(0.9, 0.8, 0.6);
    rootMesh.registerInstancedBuffer("color", 3);
    rootMesh.instancedBuffers.color = new Color3(0.9, 0.8, 0.6);

    this.bricks.push(rootMesh);

    for (let rc = 0; rc < this.params.rows; rc++) {
      for (let cc = 0; cc < this.params.columns; cc++) {
        // Omit certain blocks to create the arch
        if (rc === 2 && cc > 3 && cc < this.params.columns - 4) {
          continue;
        }
        if (rc < 2 && cc > 2 && cc < this.params.columns - 3) {
          continue;
        }
        if (rc === this.params.rows - 1 && (cc === 0 || cc === this.params.columns - 1)) {
          continue;
        }

        let x = (cc * this.params.brickSize.x) - ((this.params.columns - 1) / 2 * this.params.brickSize.x);
        let y = (rc * this.params.brickSize.y) - ((this.params.rows - 1) / 2 * this.params.brickSize.y);

        let brick = rootMesh.createInstance("i" + cc + rc);

        brick.position = new Vector3(
          this.position.x + x,
          this.position.y + y,
          this.position.z
        );
        brick.checkCollisions = true;
        brick.collisionGroup = 16;
        brick.collisionResponse = false;
        brick.collisionRetryCount = 10;
        brick.metadata = {
          type: "barrier"
        }
        let color = Scalar.RandomRange(0.8, 1);
        //brick.material.diffuseColor = new Color3(color,color,color);
        brick.instancedBuffers.color = new Color3(color, color, color / 2);

        brick.onDispose = (mesh) => {
          this.onDisposeMesh(mesh);
        };
        this.bricks.push(brick);
      }
    }
  }

  onDisposeMesh(mesh) {
    new Explosion(mesh, 2, 1, this.scene);
    if (State.state !== "CLEARLEVEL" && State.state !== "GAMEOVER") {
      this.gameAssets.sounds.alienExplosion.play(0, 0.1, 1);
    }
  }

  destroyBarrierMesh() {
    //Destroy random mesh but not the root [0]
    let index = Math.floor(Math.random() * (this.bricks.length - 1)) + 1;
    this.bricks[index].dispose();
    this.bricks.splice(index, 1);
    State.score += 1;

    if (this.bricks.length === 1) {
      //Destroy the root mesh
      this.bricks[0].dispose();
      this.bricks = [];
    }
  }


  sleep(ms) {
    let date = new Date();
    let curDate = null;
    do {
      curDate = new Date();
    }
    while (curDate - date < ms);
  }
}
