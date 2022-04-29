import {Color4, MeshBuilder, Space, Vector3} from "@babylonjs/core";
import State from "./State";
import spaceinvadersConfig from "../spaceinvaders.config";

export class Explosion {

  constructor(mesh, numParticles = 20, maxSize, scene) {
    this.particles = {};
    this.position = mesh.position;
    this.numParticles = numParticles;
    this.scene = scene;
    this.maxSize = maxSize;
    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < this.numParticles; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    let id = "p" + Math.floor(Math.random() * 1000000).toString(16);
    //let color = new Color4(1,1,0,1);
    let color = new Color4(1, 1, Math.random(), 1);
    let minSize = this.maxSize * 0.33;
    let mesh = MeshBuilder.CreateBox("ExplosionParticle" + id, {
      //size: Math.random() * (this.maxSize - minSize) + minSize,
      size: this.maxSize/1.5,
      faceColors: [color, color, color, color, color, color]
    }, this.scene);

    let particle = {
      id: id,
      mesh: mesh,
      velocity: Math.random() / 3,
      movementVector: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
      rotationVector: new Vector3(Math.random(), Math.random(), Math.random()),
      rotationVelocity: Math.random() / 20,
      duration: Math.floor(Math.random() * 120)
    }
    particle.mesh.position = new Vector3(
      this.position.x,
      this.position.y,
      this.position.z
    );
    // Rotate it in a random direction and move
    // it out. Move out distance is based on
    // the number of particles and velocity.
    if (!spaceinvadersConfig.oldSchoolEffects.enabled) {
      particle.mesh.rotation = new Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    }
    particle.mesh.translate(particle.movementVector, particle.velocity * this.numParticles / 1.5, Space.WORLD);
    particle.loopFunction = particle.mesh.onBeforeRenderObservable.add(() => {
      this.move(particle);
    });
    this.particles[id] = particle;
  }

  move(particle) {
    particle.duration -= State.delta;
    // Fade it out at the end of it's duration
    if (particle.duration < 20) {
      particle.mesh.visibility = particle.duration / 20;
    }
    // hide it completely. For some reason, mesh.dispose causes flickering and other meshes to be disposed.
    if (particle.duration < 1 && particle.mesh.isVisible) {
      particle.mesh.onBeforeRenderObservable.remove(particle.loopFunction);
      particle.mesh.visibility = 0;
    }
    // Delete it.
    if (particle.mesh.visibility === 0) {
      delete this.particles[particle.id];
    } else {
      particle.mesh.translate(particle.movementVector, particle.velocity, Space.WORLD);
      if (!spaceinvadersConfig.oldSchoolEffects.enabled) {
        particle.mesh.rotate(particle.rotationVector, particle.rotationVelocity);
      }
    }
  }
}
