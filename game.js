const PRIVATE_PASSWORD = "1234";

const loginScreen = document.getElementById("loginScreen");
const passwordInput = document.getElementById("passwordInput");
const enterBtn = document.getElementById("enterBtn");

enterBtn.onclick = () => {
  if (passwordInput.value === PRIVATE_PASSWORD) {
    loginScreen.style.display = "none";
    startGame();
  } else {
    passwordInput.value = "";
    passwordInput.placeholder = "Senha errada";
  }
};

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enterBtn.click();
});

function startGame() {
  const canvas = document.getElementById("gameCanvas");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);
  scene.fog = new THREE.Fog(0x080808, 40, 260);

  const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x161616, 1.2);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(20, 35, 15);
  sun.castShadow = true;
  scene.add(sun);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .9 });
  const road = new THREE.Mesh(new THREE.BoxGeometry(18, .2, 900), roadMat);
  road.position.y = -0.12;
  road.receiveShadow = true;
  scene.add(road);

  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let z = -420; z < 420; z += 20) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(.25, .02, 8), lineMat);
    line.position.set(0, .02, z);
    scene.add(line);
  }

  const sideMat = new THREE.MeshStandardMaterial({ color: 0x191919, roughness: .8 });
  for (let i = 0; i < 70; i++) {
    const h = 2 + Math.random() * 8;
    const box = new THREE.Mesh(new THREE.BoxGeometry(4 + Math.random()*7, h, 4 + Math.random()*7), sideMat);
    box.position.set((Math.random() > .5 ? 1 : -1) * (18 + Math.random()*35), h/2 - .08, -420 + i * 13);
    scene.add(box);
  }

  function makeBike() {
    const group = new THREE.Group();

    const black = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: .25, roughness: .5 });
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: .15, roughness: .35 });
    const redHot = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0x220000 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(.9, .35, 2.0), white);
    body.position.y = .95;
    body.castShadow = true;
    group.add(body);

    const tank = new THREE.Mesh(new THREE.BoxGeometry(.75, .38, .75), white);
    tank.position.set(0, 1.22, -.15);
    tank.castShadow = true;
    group.add(tank);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(.68, .18, .9), black);
    seat.position.set(0, 1.32, .55);
    group.add(seat);

    const fork = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 1.15, 12), black);
    fork.rotation.x = .45;
    fork.position.set(0, .8, -1.05);
    group.add(fork);

    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.25, 18), redHot);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(.5, .78, .55);
    group.add(exhaust);

    const wheelGeo = new THREE.TorusGeometry(.43, .07, 14, 32);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x030303, roughness: .7 });

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.rotation.y = Math.PI / 2;
    frontWheel.position.set(0, .43, -1.05);
    group.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.rotation.y = Math.PI / 2;
    rearWheel.position.set(0, .43, .95);
    group.add(rearWheel);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.25, .07, .08), black);
    bar.position.set(0, 1.42, -1.0);
    group.add(bar);

    group.userData = { frontWheel, rearWheel, exhaust };
    scene.add(group);
    return group;
  }

  const bike = makeBike();

  const keys = {
    throttle: false,
    brakeFront: false,
    brakeRear: false,
    clutch: false,
    leanBack: false,
    leanForward: false
  };

  function bindHold(id, key) {
    const el = document.getElementById(id);
    const on = (e) => { e.preventDefault(); keys[key] = true; el.classList.add("active"); };
    const off = (e) => { e.preventDefault(); keys[key] = false; el.classList.remove("active"); };
    el.addEventListener("touchstart", on, { passive: false });
    el.addEventListener("touchend", off, { passive: false });
    el.addEventListener("touchcancel", off, { passive: false });
    el.addEventListener("mousedown", on);
    el.addEventListener("mouseup", off);
    el.addEventListener("mouseleave", off);
  }

  bindHold("throttle", "throttle");
  bindHold("brakeFront", "brakeFront");
  bindHold("brakeRear", "brakeRear");
  bindHold("clutch", "clutch");
  bindHold("leanBack", "leanBack");
  bindHold("leanForward", "leanForward");

  let gear = 0;
  const gearRatios = [0, 2.8, 2.1, 1.65, 1.28, 1.05, .9];
  document.getElementById("gearUp").onclick = () => { if (gear < 6) gear++; };
  document.getElementById("gearDown").onclick = () => { if (gear > 0) gear--; };

  let speed = 0;
  let rpm = 900;
  let temp = 80;
  let damage = 0;
  let pitch = 0;
  let pitchVelocity = 0;
  let z = 0;
  let x = 0;
  let steerOffset = 0;

  const speedEl = document.getElementById("speed");
  const rpmEl = document.getElementById("rpm");
  const gearEl = document.getElementById("gear");
  const tempEl = document.getElementById("temp");
  const damageFill = document.getElementById("damageFill");

  let last = performance.now();

  function animate(now) {
    const dt = Math.min((now - last) / 1000, .033);
    last = now;

    const ratio = gearRatios[gear] || 0;
    const clutchFactor = keys.clutch ? .15 : 1;
    const throttlePower = keys.throttle && gear > 0 ? 24 * ratio * clutchFactor : 0;

    speed += throttlePower * dt;
    speed -= .8 * dt;
    if (keys.brakeRear) speed -= 12 * dt;
    if (keys.brakeFront) speed -= 18 * dt;
    speed = Math.max(0, Math.min(speed, 145));

    rpm = 900 + speed * 95 * (ratio || .8);
    if (keys.throttle && gear === 0) rpm += 3800;
    if (keys.clutch && keys.throttle) rpm += 1400;
    rpm = Math.min(12500, Math.max(900, rpm));

    const liftPower =
      (keys.throttle ? 1 : 0) * (gear === 1 ? 1.6 : gear === 2 ? 1.15 : gear === 3 ? .75 : .35) +
      (keys.leanBack ? 1.1 : 0) -
      (keys.leanForward ? 1.45 : 0) -
      (keys.brakeRear ? 1.4 : 0) -
      (keys.brakeFront ? .65 : 0);

    pitchVelocity += liftPower * dt * 1.15;
    pitchVelocity -= pitch * dt * .95;
    pitchVelocity *= .985;
    pitch += pitchVelocity;
    pitch = Math.max(-0.12, Math.min(1.15, pitch));

    if (pitch > 1.05 || rpm > 11200) damage += dt * (pitch > 1.05 ? 6 : 2.5);
    if (keys.throttle) temp += dt * (rpm / 9000);
    else temp -= dt * 2.5;
    temp = Math.max(75, Math.min(130, temp));
    if (temp > 115) damage += dt * 1.8;
    damage = Math.min(100, damage);

    z -= speed * dt * .8;
    steerOffset = Math.sin(now * 0.0017) * Math.min(speed / 120, 1) * .08;
    x += steerOffset * dt;

    bike.position.set(x, 0, z);
    bike.rotation.x = -pitch;
    bike.rotation.z = steerOffset * .8;

    bike.userData.frontWheel.rotation.x -= speed * dt * 2;
    bike.userData.rearWheel.rotation.x -= speed * dt * 2.6;
    bike.userData.exhaust.material.emissive.setHex(temp > 105 ? 0x441100 : 0x220000);

    const camTarget = new THREE.Vector3(x, 2.6 + pitch * 2.2, z + 7.5 + pitch * 2.2);
    camera.position.lerp(camTarget, .08);
    camera.lookAt(x, 1.1 + pitch * 1.2, z - 2.4);

    speedEl.textContent = Math.round(speed);
    rpmEl.textContent = Math.round(rpm);
    gearEl.textContent = gear === 0 ? "N" : gear;
    tempEl.textContent = Math.round(temp);
    damageFill.style.width = damage + "%";

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}
