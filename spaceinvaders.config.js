export default {
  actionCam: false, // This value is changed dynamically in the code based on the users selected mode.
  light: {
    intensity: 1.5
  },
  motherShip: {
    interval: 20, //seconds
    rotateSpeed: 0.1,
    velocity: 0.75,
    fireRate: 5,
    hitsToKill: 4
  },
  oldSchoolEffects: {
    enabled: false, // This value is changed dynamically in the code based on the users selected mode.
    blurIntensity: 0.35,
    scanLines: true
  },
  starField: {
    speed: 0.1,
    minStarSize: 0.1,
    maxStarSize: 0.6,
    numberofStars: 500,
    ratioOfBlinkingStars: 0.3,
  },
  startingLevel: 0, // Starting level -1;
  startingLives: 2,
}
