import {Color4, Scalar, Sprite, SpriteManager} from "@babylonjs/core";
import spaceinvadersConfig from "../spaceinvaders.config";

export class Starfield {

  constructor(scene) {
    this.scene = scene;
    this.maxStars = spaceinvadersConfig.starField.numberofStars;
    this.stars = [];
    this.ratioOfBlinkers = spaceinvadersConfig.starField.ratioOfBlinkingStars;
    this.minY = -50;
    this.maxY = 150;
    this.minSize = spaceinvadersConfig.starField.minStarSize;
    this.maxSize = spaceinvadersConfig.starField.maxStarSize;
    if (spaceinvadersConfig.actionCam) {
      this.maxY = 500;
    }
    this.colors = [
      [1, 1, 0, 1],
      [0, 1, 0, 1],
      [1, 0, 0, 1],
      [1, 0, 1, 1],
      [1, 1, 1, 1]
    ];
    this.speed = spaceinvadersConfig.starField.speed;

    // With actioncam enabled the starfield is rolling
    // at an angle. Speed it up to compensate.
    if (spaceinvadersConfig.actionCam) this.speed *= 2;

    if (spaceinvadersConfig.oldSchoolEffects.enabled && spaceinvadersConfig.oldSchoolEffects.blurIntensity > 0.2) {
      this.spriteManager = new SpriteManager("starsManager", "/assets/images/star_glow.png", 1000, {width: 384, height: 384}, this.scene);
      this.minSize *= 3;
      this.maxSize *= 3;
    } else {
      this.spriteManager = new SpriteManager("starsManager", "/assets/images/star.png", 1000, {width: 128, height: 128}, this.scene);
    }

    this.createStarField();
    this.startRoll();
  }

  startRoll() {
    this.roll = this.scene.onBeforeRenderObservable.add(() => {
      this.rollStarsDown();
    });
  }

  rollStarsDown() {
    let i = 0;
    while (i < this.stars.length) {
      this.stars[i].position.y -= this.speed * this.getDelta();
      if (this.stars[i].position.y < this.minY) {
        this.stars[i].position.y = this.maxY - (this.minY - this.stars[i].position.y);
      }
      i++;
    }
  }

  createStarField() {
    while (this.stars.length < this.maxStars) {
      this.stars.push(this.addStar());
    }
  }

  addStar() {
    let z = 10;
    if (spaceinvadersConfig.actionCam) z = 5;

    let star = new Sprite("star", this.spriteManager);
    star.size = Scalar.RandomRange(this.minSize, this.maxSize);
    star.position.x = Scalar.RandomRange(-this.maxY, this.maxY);
    star.position.y = Scalar.RandomRange(this.minY, this.maxY);
    star.position.z = z;
    let color = Math.floor(Math.random() * this.colors.length);
    star.color = new Color4(this.colors[color][0], this.colors[color][1], this.colors[color][2], 1);
    if (Math.random() < this.ratioOfBlinkers) {
      star.blinkInterval = (Math.random() * 2000) + 500;
      setTimeout(() => {
        this.blinkStar(star);
      }, Math.random() * star.blinkInterval);
    }
    return star;
  }

  blinkStar(star) {
    let opacity = star.color.a;
    star.color.a = 1 - opacity;
    setTimeout(() => {
      this.blinkStar(star);
    }, star.blinkInterval);
  }

  // This class uses its own delta function.
  // The starfield is created and started
  // before the deltaTime class can accurately
  // calculate an average FPS which causes
  // issues with the initial creation of the
  // starfield
  getDelta() {
    let targetFps = 60;
    let fps = 1000 / this.scene.deltaTime;
    let delta = targetFps / fps;
    if (delta === 0) delta = 1;
    if (delta > 50) delta = 1;
    return delta;
  }

}
