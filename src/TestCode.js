import {Mesh, MeshBuilder, Vector3} from "@babylonjs/core";

export class TestCode {

  constructor(environment) {
    environment.camera.position = new Vector3(0, 3, -15);
    environment.camera.setTarget(Vector3.Zero());
    this.ground = Mesh.CreateGround("ground1", 12, 6, 2, environment.scene);
    this.cube = MeshBuilder.CreateBox("box", {size: 2}, environment.scene);

    this.cube.position.y = 1;
    this.cube.position.x = -5;
  }

  loop() {

    this.cube.rotate(new Vector3(0, 1, 0), Math.PI / 180);

    // Calculate movement vector based on cubes POV and move with collisions.
    // let moveVector = this.cube.calcMovePOV(0.02,0,0);
    // this.cube.moveWithCollisions(moveVector);

    this.cube.moveWithCollisions(new Vector3(0.01,0,0));

  }
}
