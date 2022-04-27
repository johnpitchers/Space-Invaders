import {AssetContainer, AssetsManager, SceneLoader, Sound, Vector3} from "@babylonjs/core";
import "@babylonjs/loaders";

export class GameAssetsManager {

  sounds = {};

  constructor(scene) {
    this.isComplete = false;
    this.scene = scene;
    this.assetContainer = new AssetContainer(this.scene);
    this.totalAssetsToLoad = 5 + 10;
    this.assetsLoaded = 0;

    this.loadSounds();
    this.loadModels();
  }

  loadSounds() {
    this.sounds.levelStart = new Sound("levelStart", "/assets/sounds/level-start-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.lazer = new Sound("Lazer", "/assets/sounds/player-bullet-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.alienMove = new Sound("alienMove", "/assets/sounds/alien-move-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.alienBullet = new Sound("alienBullet", "/assets/sounds/alien-bullet-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.clearLevel = new Sound("clearLevel", "/assets/sounds/clear-level-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.motherShipExplosion = new Sound("motherShipExplosion", "/assets/sounds/mothership-explosion-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.playerExplosion = new Sound("playerExplosion", "/assets/sounds/player-explosion-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.alienExplosion = new Sound("alienExplosion", "/assets/sounds/alien-explosion-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    })

    this.sounds.gameOver = new Sound("gameOver", "/assets/sounds/game-over-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.sounds.motherShip = new Sound("motherShip", "/assets/sounds/mothership-sfx.wav", this.scene, () => {
      this.assetsLoaded++;
      this.checkComplete();
    }, {
      loop: true
    });
    this.checkComplete();
  }

  loadModels() {
    this.loadAsset("Alien_1.glb").then((assets) => {
      assets.meshes[0].rotation = new Vector3(0, 0, 0); // root Mesh
      assets.meshes[1].position = new Vector3(0, -2000, -2000); // Alien
      this.pushToAssetsContainer(assets.meshes[0]);
      this.pushToAssetsContainer(assets.meshes[1]);
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.loadAsset("Alien_2.glb").then((assets) => {
      assets.meshes[0].rotation = new Vector3(0, 0, 0);
      assets.meshes[1].position = new Vector3(0, -2000, -2000);
      this.pushToAssetsContainer(assets.meshes[0]);
      this.pushToAssetsContainer(assets.meshes[1]);
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.loadAsset("Alien_3.glb").then((assets) => {
      assets.meshes[0].rotation = new Vector3(0, 0, 0);
      assets.meshes[1].position = new Vector3(0, -2000, -2000);
      this.pushToAssetsContainer(assets.meshes[0]);
      this.pushToAssetsContainer(assets.meshes[1]);
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.loadAsset("Player_1.glb").then((assets) => {
      assets.meshes[0].rotation = new Vector3(0, 0, 0);
      assets.meshes[1].position = new Vector3(0, -2000, -2000);
      this.pushToAssetsContainer(assets.meshes[0]);
      this.pushToAssetsContainer(assets.meshes[1]);
      this.assetsLoaded++;
      this.checkComplete();
    });

    this.loadAsset("MotherShip.glb").then((assets) => {
      assets.meshes[0].rotation = new Vector3(0, 0, 0);
      assets.meshes[1].position = new Vector3(0, -2000, -2000);
      this.pushToAssetsContainer(assets.meshes[0]);
      this.pushToAssetsContainer(assets.meshes[1]);
      this.assetsLoaded++;
      this.checkComplete();
    });
  }

  async loadAsset(file) {
    let assets = await SceneLoader.ImportMeshAsync("", "/assets/models/", file, this.scene);
    return assets;
  }

  pushToAssetsContainer(mesh) {
    this.assetContainer.meshes.push(mesh);
  }

  clone(name, newName = null) {
    if (!newName) newName = "id" + Math.floor(Math.random() * 1000000).toString(16);
    let newMesh = null;
    let sourceMesh = this.assetContainer.meshes.filter((mesh) => {
      return mesh.name === name;
    })
    if (sourceMesh.length) {
      newMesh = sourceMesh[0].clone(newName, undefined, undefined);
      newMesh.name = newName;
    }
    return newMesh;
  }

  checkComplete() {
    if (this.assetsLoaded > this.totalAssetsToLoad - 1) {
      // Must call removeAllFromSceneon next tick for some reason
      setTimeout(() => {
        this.assetContainer.removeAllFromScene();
        this.isComplete = true;
      }, 1);
    }
  }
}
