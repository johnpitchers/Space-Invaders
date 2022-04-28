import {ActionManager, ExecuteCodeAction} from "@babylonjs/core";

export class InputController {

  constructor(scene) {
    scene.actionManager = new ActionManager(scene);
    this.inputMap = {};
    window.addEventListener("keydown", (key) => {
      key.preventDefault();
      key.stopPropagation();
      let keyPressed = key.key;
      if (key.key === " ") keyPressed = "space";
      this.inputMap[keyPressed.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (key) => {
      key.preventDefault();
      key.stopPropagation();
      let keyPressed = key.key;
      if (key.key === " ") keyPressed = "space";
      this.inputMap[keyPressed.toLowerCase()] = false;
    });
  }
}
