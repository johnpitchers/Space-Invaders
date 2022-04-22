import {ActionManager, ExecuteCodeAction} from "@babylonjs/core";

export class InputController {

  constructor(scene) {
    scene.actionManager = new ActionManager(scene);

    this.inputMap = {};
    // scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
    //   this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
    // }));
    // scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
    //   this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
    // }));
    window.addEventListener("keydown", (key) => {
      let keyPressed = key.key;
      if (key.key === " ") keyPressed = "space";
      this.inputMap[keyPressed.toLowerCase()] = true;
      console.log(keyPressed);
    });
    window.addEventListener("keyup", (key) => {
      let keyPressed = key.key;
      if (key.key === " ") keyPressed = "space";
      this.inputMap[keyPressed.toLowerCase()] = false;
    });
  }
}
