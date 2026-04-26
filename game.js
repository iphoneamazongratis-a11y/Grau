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

passwordInput.addEventListener("keydown", e => {
  if (e.key === "Enter") enterBtn.click();
});

function startGame() {
  const canvas = document.getElementById("gameCanvas");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x79a9d8);
  scene.fog = new THREE.Fog(0x79a9d8, 85, 360);

  const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 1.45);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(55, 80, 35);
  sun.castShadow = true;
  scene.add(sun);

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2f7c33, roughness: .9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: .86 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  function road(x, z, w, l, rot=0) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, .08, l), asphaltMat);
    r.position.set(x, .02, z);
    r.rotation.y = rot;
    r.receiveShadow = true;
    scene.add(r);
    return r;
  }

  road(0, 0, 16, 470, 0);
  road(0, 0, 16, 470, Math.PI/2);
  road(65, -85, 12, 220, Math.PI/6);
  road(-95, 80, 12, 230, -Math.PI/5);

  for (let z = -230; z <= 230; z += 22) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(.35, .03, 8), lineMat);
    l.position.set(0, .08, z);
    scene.add(l);
  }
  for (let x = -230; x <= 230; x += 22) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(8, .03, .35), lineMat);
    l.position.set(x, .08, 0);
    scene.add(l);
  }

  const mats = {
    brick: new THREE.MeshStandardMaterial({ color: 0xb6633c, roughness: .8 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xd9d0b8, roughness: .75 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x6b1e1e, roughness: .7 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x335a8a, roughness: .8 }),
    favela: new THREE.MeshStandardMaterial({ color: 0x8c7a5f, roughness: .9 }),
    shop: new THREE.MeshStandardMaterial({ color: 0xf0e4bb, roughness: .65 })
  };

  function building(x, z, w, h, d, mat) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, h/2, z);
    b.castShadow = true;
    b.receiveShadow = true;
    scene.add(b);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + .5, .35, d + .5), mats.roof);
    roof.position.set(x, h + .18, z);
    roof.castShadow = true;
    scene.add(roof);
    return b;
  }

  // Centro urbano
  for (let i = 0; i < 70; i++) {
    const x = (Math.random() - .5) * 430;
    const z = (Math.random() - .5) * 430;
    if (Math.abs(x) < 18 || Math.abs(z) < 18) continue;
    const h = 4 + Math.random() * 16;
    const w = 7 + Math.random() * 14;
    const d = 7 + Math.random() * 14;
    const mat = [mats.brick, mats.wall, mats.blue, mats.shop][Math.floor(Math.random()*4)];
    building(x, z, w, h, d, mat);
  }

  // Favela/morro simples
  for (let i = 0; i < 55; i++) {
    const x = -170 + Math.random() * 90;
    const z = -185 + Math.random() * 95;
    const yOffset = Math.random() * 5;
    const b = building(x, z, 7 + Math.random()*8, 3 + Math.random()*4, 7 + Math.random()*8, mats.favela);
    b.position.y += yOffset;
  }

  // Posto BR fictício
  building(88, 38, 38, 5, 18, mats.shop);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(45, 1, 26), new THREE.MeshStandardMaterial({color:0xffffff}));
  canopy.position.set(88, 7.2, 12);
  scene.add(canopy);
  for (let i = 0; i < 4; i++) {
    const pump = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1), new THREE.MeshStandardMaterial({color:0x111111}));
    pump.position.set(75 + i*8, 1.1, 12);
    scene.add(pump);
  }

  // Praça
  const park = new THREE.Mesh(new THREE.CircleGeometry(32, 48), new THREE.MeshStandardMaterial({color:0x216b28}));
  park.rotation.x = -Math.PI/2;
  park.position.set(-70, .09, 72);
  scene.add(park);

  for (let i = 0; i < 26; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.35, .45, 3, 8), new THREE.MeshStandardMaterial({color:0x4a2b14}));
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), new THREE.MeshStandardMaterial({color:0x1d6b2a}));
    const x = -110 + Math.random()*85;
    const z = 35 + Math.random()*80;
    trunk.position.set(x, 1.5, z);
    leaves.position.set(x, 4.2, z);
    scene.add(trunk, leaves);
  }

  function makeCar() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: .2, roughness: .35 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: .1, roughness: .2 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, .75, 4.1), bodyMat);
    body.position.y = .72;
    body.castShadow = true;
    g.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, .75, 1.8), glass);
    cabin.position.set(0, 1.22, -.35);
    cabin.castShadow = true;
    g.add(cabin);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .7 });
    const wheelGeo = new THREE.CylinderGeometry(.42, .42, .34, 18);
    const wheels = [];
    [[-.95,.42,1.35],[.95,.42,1.35],[-.95,.42,-1.35],[.95,.42,-1.35]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI/2;
      w.position.set(...p);
      g.add(w);
      wheels.push(w);
    });

    g.userData.wheels = wheels;
    return g;
  }

  function makeBike() {
    const g = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({color:0xffffff, metalness:.15, roughness:.38});
    const black = new THREE.MeshStandardMaterial({color:0x050505, roughness:.5});
    const hot = new THREE.MeshStandardMaterial({color:0xff4a11, emissive:0x220000});

    const body = new THREE.Mesh(new THREE.BoxGeometry(.8,.35,2.0), white);
    body.position.y = .95;
    g.add(body);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(.65,.18,.85), black);
    seat.position.set(0,1.27,.45);
    g.add(seat);

    const wheelGeo = new THREE.TorusGeometry(.43,.07,14,30);
    const fw = new THREE.Mesh(wheelGeo, black);
    const rw = new THREE.Mesh(wheelGeo, black);
    fw.rotation.y = Math.PI/2;
    rw.rotation.y = Math.PI/2;
    fw.position.set(0,.43,-1.05);
    rw.position.set(0,.43,.95);
    g.add(fw,rw);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1,.07,.08), black);
    bar.position.set(0,1.38,-.95);
    g.add(bar);

    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,1.1,16), hot);
    exhaust.rotation.x = Math.PI/2;
    exhaust.position.set(.45,.78,.55);
    g.add(exhaust);

    g.userData.wheels = [fw,rw];
    g.userData.exhaust = exhaust;
    return g;
  }

  const car = makeCar();
  const bike = makeBike();
  scene.add(car, bike);

  let vehicleType = "car";
  let active = car;
  bike.visible = false;

  const keys = {
    throttle:false, brake:false, left:false, right:false, handbrake:false
  };

  function bindHold(id, key) {
    const el = document.getElementById(id);
    const on = e => { e.preventDefault(); keys[key] = true; el.classList.add("active"); };
    const off = e => { e.preventDefault(); keys[key] = false; el.classList.remove("active"); };
    el.addEventListener("touchstart", on, {passive:false});
    el.addEventListener("touchend", off, {passive:false});
    el.addEventListener("touchcancel", off, {passive:false});
    el.addEventListener("mousedown", on);
    el.addEventListener("mouseup", off);
    el.addEventListener("mouseleave", off);
  }

  bindHold("throttle","throttle");
  bindHold("brake","brake");
  bindHold("left","left");
  bindHold("right","right");
  bindHold("handbrake","handbrake");

  let thirdPersonClose = false;
  document.getElementById("cameraBtn").onclick = () => thirdPersonClose = !thirdPersonClose;

  document.getElementById("vehicleBtn").onclick = () => {
    const pos = active.position.clone();
    const rot = active.rotation.y;
    if (vehicleType === "car") {
      vehicleType = "bike";
      active = bike;
      car.visible = false;
      bike.visible = true;
    } else {
      vehicleType = "car";
      active = car;
      bike.visible = false;
      car.visible = true;
    }
    active.position.copy(pos);
    active.rotation.y = rot;
  };

  document.getElementById("horn").onclick = () => beep();

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 420;
      gain.gain.value = .12;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 110);
    } catch(e) {}
  }

  let speed = 0;
  let rpm = 900;
  let gear = 0;
  let yaw = 0;
  let drift = 0;
  let bikePitch = 0;
  let last = performance.now();

  const speedEl = document.getElementById("speed");
  const rpmEl = document.getElementById("rpm");
  const gearEl = document.getElementById("gear");
  const modeEl = document.getElementById("mode");

  function updateGear() {
    if (speed < 3) gear = 0;
    else if (speed < 28) gear = 1;
    else if (speed < 55) gear = 2;
    else if (speed < 85) gear = 3;
    else if (speed < 120) gear = 4;
    else gear = 5;
  }

  function animate(now) {
    const dt = Math.min((now - last)/1000, .033);
    last = now;

    const isBike = vehicleType === "bike";
    const accel = isBike ? 36 : 28;
    const maxSpeed = isBike ? 155 : 175;
    const brakeForce = keys.brake ? (isBike ? 24 : 20) : 0;
    const handForce = keys.handbrake ? 18 : 0;

    if (keys.throttle) speed += accel * dt;
    speed -= (1.8 + brakeForce + handForce) * dt;
    speed = Math.max(0, Math.min(maxSpeed, speed));

    const steer = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    const steerPower = isBike ? 1.55 : 1.25;
    yaw += steer * steerPower * dt * Math.min(speed / 32, 1.45);

    if (keys.handbrake && !isBike && Math.abs(steer) > 0) {
      drift += steer * dt * 2.8;
      speed -= dt * 5;
    } else {
      drift *= .92;
    }

    const forwardX = Math.sin(yaw + drift * .22);
    const forwardZ = Math.cos(yaw + drift * .22);

    active.position.x += forwardX * speed * dt * .55;
    active.position.z += forwardZ * speed * dt * .55;
    active.rotation.y = yaw;
    active.rotation.z = isBike ? -steer * Math.min(speed/70, 1) * .42 : -drift * .09;

    if (isBike) {
      const lift = (keys.throttle ? .9 : 0) + (keys.handbrake ? -1.4 : 0) + (keys.brake ? -.45 : 0);
      bikePitch += (lift - bikePitch * .8) * dt;
      bikePitch = Math.max(-.18, Math.min(.75, bikePitch));
      active.rotation.x = -bikePitch;
    } else {
      active.rotation.x = 0;
    }

    active.userData.wheels?.forEach(w => {
      if (isBike) w.rotation.x -= speed * dt * 2.3;
      else w.rotation.x -= speed * dt * 1.8;
    });

    rpm = 850 + speed * (isBike ? 72 : 58) + (keys.throttle ? 1400 : 0);
    rpm = Math.max(850, Math.min(isBike ? 11800 : 8200, rpm));
    updateGear();

    const backDistance = thirdPersonClose ? 7 : 13;
    const height = thirdPersonClose ? 4.2 : 7.5;
    const camX = active.position.x - Math.sin(yaw) * backDistance;
    const camZ = active.position.z - Math.cos(yaw) * backDistance;
    camera.position.lerp(new THREE.Vector3(camX, height, camZ), .08);
    camera.lookAt(active.position.x, 1.3, active.position.z);

    speedEl.textContent = Math.round(speed);
    rpmEl.textContent = Math.round(rpm);
    gearEl.textContent = gear === 0 ? "N" : gear;
    modeEl.textContent = isBike ? "MOTO" : "CARRO";

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
