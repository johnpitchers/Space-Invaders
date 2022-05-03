import {Camera, Color3, GlowLayer, HemisphericLight, Scalar, Scene, UniversalCamera, Vector3} from "@babylonjs/core";
import spaceinvadersConfig from "../spaceinvaders.config";
import State from "./State";

export class Environment {

  clearColor = new Color3(0.01, 0.03, 0.1);

  constructor(engine) {
    this.isComplete = false;
    this.canvas = document.querySelector('canvas');
    this.engine = engine;
    this.scene = this.CreateScene();
    this.initLightsAndCamera();
    this.oldSchoolEffects();
    if (spaceinvadersConfig.actionCam) {
      this.createFog();
    }
    this.isComplete = true;
  }

  CreateScene() {
    const scene = new Scene(this.engine);
    if (spaceinvadersConfig.oldSchoolEffects.enabled) {
      this.clearColor = new Color3(0.05, 0.05, 0.15);
    }
    scene.clearColor = this.clearColor.toColor4(1);
    scene.collisionsEnabled = true;
    return scene;
  }

  oldSchoolEffects() {
    if (!spaceinvadersConfig.oldSchoolEffects.enabled) return;
    let glow = new GlowLayer("glow", this.scene);
    glow.intensity = spaceinvadersConfig.oldSchoolEffects.blurIntensity;
    glow.customEmissiveColorSelector = function (mesh, subMesh, material, result) {
      result.set(1, 1, 1, 0.5);
    };
    if (spaceinvadersConfig.oldSchoolEffects.scanLines) {
      document.querySelector('body').classList.add('scanlines');
    }
  }

  createFog() {
    this.scene.fogEnabled = true;
    this.scene.fogColor = this.clearColor;
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 200;
    this.scene.fogEnd = 400;
    if (spaceinvadersConfig.actionCam) {
      this.scene.fogStart = 140;
      this.scene.fogEnd = 160;
    }
    this.scene.fogDensity = 0.1;
  }

  initLightsAndCamera() {
    this.camera = this.CreateCamera();
    this.light = new HemisphericLight('light', new Vector3(0, 0.5, -1), this.scene);
    this.light.intensity = 1;
  }

  actionCam(x) {
    if (spaceinvadersConfig.actionCam) {
      this.camera.position.x = Scalar.Lerp(this.camera.position.x, x, 0.1 * State.delta);
      this.camera.rotation.y = Scalar.Lerp(this.camera.rotation.y, -this.camera.position.x / 300, 0.05 * State.delta);
    }
  }

  CreateCamera() {
    let camera;
    if (spaceinvadersConfig.actionCam) {
      //camera = new UniversalCamera("camera", new Vector3(0, -60, -60), this.scene);
      camera = new UniversalCamera("camera", new Vector3(0, -35, -22), this.scene);
    } else {
      camera = new UniversalCamera("camera", new Vector3(0, 50, -150), this.scene);
    }
    if (spaceinvadersConfig.oldSchoolEffects.enabled) {
      let orthoSize = 60;
      camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
      camera.orthoTop = orthoSize;
      camera.orthoBottom = -orthoSize;
      this.setOrthographicRatio(camera, orthoSize);

      // resize on canvas resize
      this.engine.onResizeObservable.add(() => {
        this.setOrthographicRatio(camera, orthoSize);
      });
    }
    if (spaceinvadersConfig.actionCam) {
      camera.setTarget(new Vector3(0, 30, 0));
    } else {
      camera.setTarget(new Vector3(0, 50, 0));
    }
    return camera;
  }

  setOrthographicRatio(camera, orthoSize) {
    camera.width = this.engine.getRenderWidth();
    camera.height = this.engine.getRenderHeight();
    camera.ratio = camera.width / camera.height;
    camera.orthoLeft = camera.ratio * -orthoSize;
    camera.orthoRight = camera.ratio * orthoSize;
  }
}
