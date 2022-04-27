// @todo: proper mobile virtual joysticks. So far results have been poor.
// Good example of custom controls here:https://playground.babylonjs.com/#C6V6UY#5

import {Control, Ellipse, Line, Rectangle} from "@babylonjs/gui";

export class MobileInputs {

  fire = false;
  left = false;
  right = false;
  isMobile = false;

  constructor(scene) {
    this.scene = scene;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  enable(texture) {
    if (this.isMobile) {
      this.drawJoystick(texture);
      this.drawFireButton(texture);
    }
  }

  disable() {

  }

  drawFireButton(texture) {
    let offsetX = 40;
    let offsetY = -30;
    let width = 60;
    let height = 60;
    let fireButton = this.makeThumbArea("thumb", 2, "white", null);

    fireButton.height = height + "px";
    fireButton.width = width + "px";
    fireButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    fireButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    fireButton.alpha = 1;
    fireButton.left = offsetX;
    fireButton.top = offsetY;
    fireButton.onPointerDownObservable.add(() => {
      this.fire = true;
    });
    fireButton.onPointerUpObservable.add(() => {
      this.fire = false;
    });
    texture.addControl(fireButton);

    let line1 = new Line();
    line1.x1 = (width / 2) - 1;
    line1.y1 = height / 8 * 2;
    line1.x2 = (width / 3) - 2;
    line1.y2 = height / 8 * 5;
    line1.color = "white";
    line1.lineWidth = 4;
    fireButton.addControl(line1);

    let line2 = new Line();
    line2.x1 = (width / 2) - 2;
    line2.y1 = height / 8 * 2;
    line2.x2 = (width / 3 * 2) - 2;
    line2.y2 = height / 8 * 5;
    line2.color = "white";
    line2.lineWidth = 4;
    fireButton.addControl(line2);

    let line3 = new Line();
    line3.x1 = (width / 3) - 2;
    line3.y1 = (height / 8 * 5) - 1;
    line3.x2 = (width / 3 * 2) - 2;
    line3.y2 = (height / 8 * 5) - 1;
    line3.color = "white";
    line3.lineWidth = 4;
    fireButton.addControl(line3);
  }

  drawJoystick(texture) {
    let joystickX = 0;
    let joystickY = 0;
    let offsetX = 30;
    let offsetY = -20;

    let thumbContainer = this.makeThumbArea("thumb", 2, "white", null);
    thumbContainer.height = "100px";
    thumbContainer.width = "100px";
    thumbContainer.isPointerBlocker = true;
    thumbContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    thumbContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    thumbContainer.alpha = 1;
    thumbContainer.left = -offsetX;
    thumbContainer.top = offsetY;

    let innerThumbContainer = this.makeThumbArea("rightInnterThumb", 4, "white", null);
    innerThumbContainer.height = "40px";
    innerThumbContainer.width = "40px";
    innerThumbContainer.isPointerBlocker = true;
    innerThumbContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    innerThumbContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

    let puck = this.makeThumbArea("puck", 0, "red", "red");
    puck.height = "35px";
    puck.width = "35px";
    puck.alpha = 0.6;
    puck.isPointerBlocker = true;
    puck.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    puck.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

    thumbContainer.onPointerDownObservable.add((coordinates) => {
      puck.isVisible = true;
      puck.floatLeft = -(texture._canvas.width - coordinates.x - (thumbContainer._currentMeasure.width * .5) - offsetX);
      puck.left = puck.floatLeft;
      puck.floatTop = texture._canvas.height - coordinates.y - (thumbContainer._currentMeasure.height * .5) + offsetY;
      puck.top = puck.floatTop * -1;
      puck.isDown = true;
      this.left = this.right = false;
      if (puck.floatLeft < 0) this.left = true;
      if (puck.floatLeft > 0) this.right = true;
    });

    thumbContainer.onPointerUpObservable.add((coordinates) => {
      joystickX = 0;
      joystickY = 0;
      this.left = this.right = false;
      puck.isDown = false;
      puck.isVisible = false;
    });

    thumbContainer.onPointerMoveObservable.add((coordinates) => {
      let deadZone = 15;
      if (puck.isDown) {
        joystickX = -(texture._canvas.width - coordinates.x - (thumbContainer._currentMeasure.width * .5) - offsetX);
        joystickY = texture._canvas.height - coordinates.y - (thumbContainer._currentMeasure.height * .5) + offsetY;
        puck.floatLeft = joystickX;
        puck.floatTop = joystickY * -1;
        puck.left = puck.floatLeft;
        puck.top = puck.floatTop;
        this.left = this.right = false;
        if (joystickX < -deadZone) this.left = true;
        if (joystickX > deadZone) this.right = true;
      }
    });

    texture.addControl(thumbContainer);
    thumbContainer.addControl(innerThumbContainer);
    thumbContainer.addControl(puck);
    puck.isVisible = false;

  }

  makeThumbArea(name, thickness, color, background, curves) {
    let ellipse = new Ellipse();
    ellipse.name = name;
    ellipse.thickness = thickness;
    ellipse.color = color;
    ellipse.background = background;
    ellipse.paddingLeft = "0px";
    ellipse.paddingRight = "0px";
    ellipse.paddingTop = "0px";
    ellipse.paddingBottom = "0px";
    return ellipse;
  }
}
