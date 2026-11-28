/* O símbolo BRITTO* em 3D (three.js): três barras extrudadas com bisel, luzes coloridas,
   uma luz que segue o mouse, arrastar para girar com inércia e duplo toque para dar uma volta. */
(function () {
  var sec = document.getElementById("simbolo");
  var cv = document.getElementById("sim-canvas");
  if (!sec || !cv) return;
  if (!window.THREE) { sec.classList.add("no3d"); return; }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = window.THREE;

  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); }
  catch (e) { sec.classList.add("no3d"); return; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.NoToneMapping;
  renderer.toneMappingExposure = 0.85;

  var scene = new T.Scene();
  scene.fog = new T.Fog(0x11130f, 9, 22);
  var cam = new T.PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(0, 0, 12);

  /* barra com cantos arredondados, extrudada com bisel */
  function bar() {
    var w = 1.0, h = 4.3, r = 0.14, s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    var g = new T.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 6, curveSegments: 8 });
    g.translate(0, 0, -0.35);
    return g;
  }
  var mat = new T.MeshPhysicalMaterial({ color: 0x9fc22a, metalness: 0.35, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15, emissive: 0x24360a, emissiveIntensity: 0.2 });
  var star = new T.Group(), geo = bar();
  [0, 60, -60].forEach(function (a) { var m = new T.Mesh(geo, mat); m.rotation.z = a * Math.PI / 180; star.add(m); });
  var pivot = new T.Group();
  pivot.add(star);
  scene.add(pivot);

  /* luzes: ambiente baixa, chave branca, contraluzes verde e limão que orbitam, e a luz do mouse */
  scene.add(new T.HemisphereLight(0x8eb85a, 0x0b0d0a, 0.35));
  var key = new T.DirectionalLight(0xffffff, 0.55); key.position.set(4, 6, 8); scene.add(key);
  var rimA = new T.PointLight(0xd7e44b, 3.2, 20); scene.add(rimA);
  var rimB = new T.PointLight(0x8eb85a, 3.0, 20); scene.add(rimB);
  var mouseL = new T.PointLight(0xf4ffc0, 0, 14); mouseL.position.set(0, 0, 5); scene.add(mouseL);

  /* poeira luminosa em volta (profundidade com névoa) */
  var N = 260, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    var rr = 3.5 + Math.random() * 6, th = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(th) * rr; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = Math.sin(th) * rr - 2;
  }
  var pg = new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pos, 3));
  var dust = new T.Points(pg, new T.PointsMaterial({ color: 0xd7e44b, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(dust);

  /* mini asteriscos desfocados ao fundo */
  var miniMat = new T.MeshBasicMaterial({ color: 0xd7e44b, transparent: true, opacity: 0.28, depthWrite: false });
  var minis = [];
  for (var j = 0; j < 7; j++) {
    var mg = new T.Group();
    [0, 60, -60].forEach(function (a) { var m = new T.Mesh(geo, miniMat); m.rotation.z = a * Math.PI / 180; mg.add(m); });
    var sc = 0.08 + Math.random() * 0.12;
    mg.scale.setScalar(sc);
    mg.position.set(-1 + Math.random() * 10, (Math.random() - 0.5) * 7, -6 - Math.random() * 8);
    mg.userData = { s: 0.2 + Math.random() * 0.6, o: Math.random() * 6 };
    scene.add(mg); minis.push(mg);
  }

  /* layout: no desktop o símbolo fica à direita do texto */
  function size() {
    var w = sec.clientWidth, h = sec.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    var wide = w >= 900;
    pivot.position.set(wide ? 2.9 : 0, wide ? 0 : 1.5, 0);
    pivot.scale.setScalar(wide ? 0.82 : 0.5);
  }
  size();
  window.addEventListener("resize", size);

  /* interação */
  var rotX = 0.2, rotY = -0.5, vx = 0, vy = 0.004, drag = false, lx = 0, ly = 0, hover = 0, hoverT = 0, spin = 0;
  var ray = new T.Raycaster(), ndc = new T.Vector2(-2, -2);
  cv.addEventListener("pointerdown", function (e) {
    drag = true; lx = e.clientX; ly = e.clientY; cv.classList.add("drag");
    if (e.pointerType === "mouse") cv.setPointerCapture(e.pointerId);
  });
  window.addEventListener("pointerup", function () { drag = false; cv.classList.remove("drag"); });
  cv.addEventListener("pointermove", function (e) {
    var r = cv.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (drag) {
      vy = (e.clientX - lx) * 0.004; vx = (e.clientY - ly) * 0.004;
      rotY += vy; rotX += vx; lx = e.clientX; ly = e.clientY;
    }
  });
  cv.addEventListener("pointerleave", function () { ndc.set(-2, -2); });
  cv.addEventListener("dblclick", function () { spin = Math.PI * 2; });
  var lastTap = 0;
  cv.addEventListener("touchend", function () { var n = Date.now(); if (n - lastTap < 300) spin = Math.PI * 2; lastTap = n; });

  var visible = false;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.05 }).observe(sec);

  var t0 = performance.now(), last = t0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) { last = now; return; }
    var dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000;
    last = now;
    if (!drag) {
      rotY += vy; rotX += vx;
      vy += ((reduce ? 0 : 0.0035) - vy) * 0.02; vx *= 0.94;
      rotX += (0.18 - rotX) * 0.02;
    }
    if (spin > 0) { var d = Math.min(spin, dt * 9); rotY += d; spin -= d; }
    // scroll gira um pouco o símbolo
    var sr = sec.getBoundingClientRect();
    var sp = (innerHeight / 2 - (sr.top + sr.height / 2)) / innerHeight;
    pivot.rotation.set(rotX + sp * 0.4, rotY, 0);
    star.position.y = reduce ? 0 : Math.sin(t * 1.2) * 0.12;

    // hover no símbolo: acende a luz do mouse e cresce de leve
    ray.setFromCamera(ndc, cam);
    var hit = ray.intersectObject(star, true).length > 0;
    hoverT = hit ? 1 : 0;
    hover += (hoverT - hover) * 0.1;
    cv.style.cursor = drag ? "grabbing" : hit ? "grab" : "";
    var v = new T.Vector3(ndc.x, ndc.y, 0.5).unproject(cam).sub(cam.position).normalize();
    var p = cam.position.clone().add(v.multiplyScalar(7));
    mouseL.position.lerp(p, 0.2);
    mouseL.intensity = (ndc.x > -2 ? 0.6 : 0) + hover * 1.6;
    star.scale.setScalar(1 + hover * 0.06);
    mat.emissiveIntensity = 0.2 + hover * 0.3;

    rimA.position.set(Math.cos(t * 0.6) * 6, 3 + Math.sin(t * 0.8), Math.sin(t * 0.6) * 6);
    rimB.position.set(Math.cos(t * 0.6 + Math.PI) * 6, -3, Math.sin(t * 0.6 + Math.PI) * 6);
    dust.rotation.y = t * 0.04;
    minis.forEach(function (m) {
      var u = m.userData;
      m.rotation.z = t * u.s; m.rotation.y = t * u.s * 0.7;
      m.position.y += Math.sin(t * u.s + u.o) * 0.002;
    });
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
})();
