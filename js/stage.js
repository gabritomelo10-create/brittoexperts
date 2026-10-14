/* BRITTO* GROUP — cena de abertura.
   Uma plateia cheia vista do palco. Ao rolar, a câmera recua, atravessa o palestrante
   e revela a sua silhueta escrita VOCÊ; atrás dele, a frase da apoteose.
   Renderização em canvas 2D com projeção em perspectiva própria (sem dependências). */
(function () {
  var canvas = document.getElementById("stage-canvas");
  var section = document.getElementById("stage");
  if (!canvas || !section) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = 1;
  var target = 0, prog = 0;          // progresso do scroll (alvo e suavizado)
  var mx = 0, my = 0, smx = 0, smy = 0; // mouse normalizado (-1..1)
  var time = 0, last = performance.now();
  var visible = true;

  /* ---------------- mundo ---------------- */
  // eixos: x lateral, y para cima, z para dentro (rumo à plateia). Metros.
  var STAGE_EDGE = 7, STAGE_H = 1.2, SPEAKER_Z = 4.5, PHRASE_Z = 9.6, CAM_END_Z = 1.5, CAM_END_Y = 1.62;
  var rows = [];

  function rand(seed) { var x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x); }

  function buildCrowd() {
    rows = [];
    var small = W < 700;
    var R = small ? 30 : 40;
    var spacing = small ? 0.66 : 0.6;
    for (var r = 0; r < R; r++) {
      var z = STAGE_EDGE + 2 + r * 1.0;
      var floor = -STAGE_H + r * 0.36;
      var hw = 7 + r * 0.62;
      var n = Math.floor((hw * 2) / spacing);
      var people = [];
      var off = (r % 2) * spacing * 0.5;
      for (var i = 0; i < n; i++) {
        var k = r * 1000 + i;
        if (rand(k + 0.3) < 0.035) continue; // alguns lugares vazios
        people.push({
          x: -hw + off + i * spacing + (rand(k) - 0.5) * 0.18,
          h: 1.18 + rand(k + 1) * 0.16,        // altura do ombro sentado
          hr: 0.095 + rand(k + 2) * 0.025,      // raio da cabeça
          sw: 0.2 + rand(k + 3) * 0.06,         // meia largura dos ombros
          ph: rand(k + 4) * 6.283,
          phone: rand(k + 5),
          hand: rand(k + 6)
        });
      }
      rows.push({ z: z, floor: floor, people: people, hw: hw });
    }
  }

  /* ---------------- câmera ---------------- */
  var cam = { x: 0, y: 1.25, z: 7, f: 1, pitch: 0 };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function map(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function updateCamera(p) {
    var t = ease(map(p, 0.04, 0.78));
    var base = Math.min(H, W * 1.15);
    cam.z = lerp(7.4, CAM_END_Z, t);
    cam.y = lerp(1.3, CAM_END_Y, t);
    cam.f = lerp(1.55, 0.86, t) * base;
    cam.x = lerp(0.42, 0, t) + smx * lerp(0.15, 0.45, t);
    cam.pitch = smy * 18;
  }

  // retorna [sx, sy, escala] ou null se atrás da câmera
  function proj(x, y, z) {
    var dz = z - cam.z;
    if (dz < 0.08) return null;
    var s = cam.f / dz;
    return [W / 2 + (x - cam.x) * s, H * 0.5 + cam.pitch - (y - cam.y) * s, s];
  }

  /* ---------------- desenho ---------------- */
  function background(p) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#020403");
    g.addColorStop(0.45, "#06100b");
    g.addColorStop(1, "#020403");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // névoa iluminada no fundo do auditório
    var far = proj(0, 8, STAGE_EDGE + 40);
    if (far) {
      var rg = ctx.createRadialGradient(far[0], far[1], 0, far[0], far[1], Math.max(W, H) * 0.75);
      rg.addColorStop(0, "rgba(35,184,116,0.22)");
      rg.addColorStop(0.5, "rgba(26,157,97,0.07)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function beams(p) {
    // feixes de luz varrendo a plateia, saindo do teto do palco
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var n = 6;
    for (var i = 0; i < n; i++) {
      var side = i < n / 2 ? -1 : 1;
      var j = i % (n / 2);
      var ox = W / 2 + side * (W * 0.1 + j * W * 0.16);
      var oy = -H * 0.08;
      var sweep = Math.sin(time * 0.35 + i * 1.7) * 0.35;
      var ang = Math.PI / 2 + side * (0.35 + j * 0.12) * -1 + sweep;
      var len = H * 1.4;
      var spread = 0.07 + j * 0.015;
      var a1 = ang - spread, a2 = ang + spread;
      var g = ctx.createLinearGradient(ox, oy, ox + Math.cos(ang) * len, oy + Math.sin(ang) * len);
      var alpha = 0.06 + 0.04 * Math.sin(time * 0.8 + i);
      g.addColorStop(0, "rgba(95,224,163," + (alpha * 1.6).toFixed(3) + ")");
      g.addColorStop(1, "rgba(95,224,163,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(a1) * len, oy + Math.sin(a1) * len);
      ctx.lineTo(ox + Math.cos(a2) * len, oy + Math.sin(a2) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function mix(a, b, t) {
    return "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)) + ")";
  }
  var C_NEAR = [3, 8, 5], C_FAR = [34, 82, 58], C_RIM = [95, 224, 163];

  function crowd(p) {
    var cheer = map(p, 0.8, 1);           // na apoteose a plateia se agita
    var phones = [];
    var cull = W * 0.1;
    for (var r = rows.length - 1; r >= 0; r--) {
      var row = rows[r];
      var dz = row.z - cam.z;
      if (dz < 0.3) continue;
      var s = cam.f / dz;
      var depth = map(dz, 2, 46);
      ctx.fillStyle = mix(C_NEAR, C_FAR, Math.pow(depth, 0.7));
      var rimA = (1 - depth) * 0.55 + 0.12;
      var body = new Path2D();
      var rim = new Path2D();
      for (var i = 0; i < row.people.length; i++) {
        var pp = row.people[i];
        var bob = Math.sin(time * (1.2 + cheer * 4) + pp.ph) * (0.008 + cheer * 0.05 * (pp.hand > 0.5 ? 1 : 0.3));
        var sx = W / 2 + (pp.x - cam.x) * s;
        if (sx < -cull || sx > W + cull) continue;
        var by = H * 0.5 + cam.pitch - (row.floor + pp.h + bob - cam.y) * s;
        if (by - 0.5 * s > H + 20) continue;
        var sw = pp.sw * s, hr = pp.hr * s;
        var hy = by - (pp.hr * 1.9) * s;
        // ombros: elipse truncada
        body.moveTo(sx - sw * 0.9, by + 0.6 * s);
        body.lineTo(sx - sw, by + sw * 0.35);
        body.quadraticCurveTo(sx - sw, by - sw * 0.25, sx - sw * 0.35, by - sw * 0.32);
        body.lineTo(sx + sw * 0.35, by - sw * 0.32);
        body.quadraticCurveTo(sx + sw, by - sw * 0.25, sx + sw, by + sw * 0.35);
        body.lineTo(sx + sw * 0.9, by + 0.6 * s);
        body.closePath();
        // cabeça
        body.moveTo(sx + hr, hy);
        body.ellipse(sx, hy, hr, hr * 1.18, 0, 0, Math.PI * 2);
        // contorno de luz na cabeça
        rim.moveTo(sx - hr * 0.85, hy - hr * 0.4);
        rim.ellipse(sx, hy, hr, hr * 1.18, 0, Math.PI * 1.1, Math.PI * 1.9);

        // braços levantados com celular aceso
        var lit = pp.phone < lerp(0.05, 0.32, cheer);
        if (lit) {
          var arm = (0.42 + pp.hand * 0.2) * s;
          var ax = sx + (pp.hand > 0.5 ? 1 : -1) * sw * 0.8;
          body.moveTo(ax - 0.035 * s, by);
          body.lineTo(ax - 0.03 * s, by - arm);
          body.lineTo(ax + 0.04 * s, by - arm);
          body.lineTo(ax + 0.035 * s, by);
          body.closePath();
          phones.push([ax, by - arm - 0.04 * s, Math.max(1.2, 0.05 * s), pp.ph]);
        }
      }
      ctx.fill(body);
      ctx.strokeStyle = "rgba(" + C_RIM.join(",") + "," + rimA.toFixed(3) + ")";
      ctx.lineWidth = Math.max(0.6, Math.min(2.4, s * 0.012));
      ctx.stroke(rim);
    }
    // luzes dos celulares
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var k = 0; k < phones.length; k++) {
      var ph = phones[k];
      var tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(time * 3 + ph[3] * 5);
      var rr = ph[2] * 3.2;
      var g = ctx.createRadialGradient(ph[0], ph[1], 0, ph[0], ph[1], rr);
      g.addColorStop(0, "rgba(235,255,245," + (0.95 * tw).toFixed(3) + ")");
      g.addColorStop(0.2, "rgba(150,240,200," + (0.35 * tw).toFixed(3) + ")");
      g.addColorStop(1, "rgba(95,224,163,0)");
      ctx.fillStyle = g;
      ctx.fillRect(ph[0] - rr, ph[1] - rr, rr * 2, rr * 2);
    }
    ctx.restore();
  }

  function stageFloor(p) {
    var z0 = Math.max(cam.z + 0.12, -2), z1 = STAGE_EDGE;
    if (z0 >= z1) return;
    var a = proj(-14, 0, z0), b = proj(14, 0, z0), c = proj(14, 0, z1), d = proj(-14, 0, z1);
    if (!a || !b || !c || !d) return;
    ctx.fillStyle = "#010201";
    ctx.fillRect(0, d[1], W, H - d[1]);
    var g = ctx.createLinearGradient(0, d[1], 0, Math.min(a[1], H * 3));
    g.addColorStop(0, "#07110c");
    g.addColorStop(1, "#010201");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]);
    ctx.closePath(); ctx.fill();

    // face frontal do palco
    var e = proj(14, -STAGE_H, z1), f = proj(-14, -STAGE_H, z1);
    if (e && f) {
      ctx.fillStyle = "#010302";
      ctx.beginPath();
      ctx.moveTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(e[0], e[1]); ctx.lineTo(f[0], f[1]);
      ctx.closePath(); ctx.fill();
    }
    // fita de LED na borda do palco
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(35,184,116,0.9)";
    ctx.shadowColor = "#23b874";
    ctx.shadowBlur = 18;
    ctx.lineWidth = Math.max(1, c[2] * 0.02);
    ctx.beginPath(); ctx.moveTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
    ctx.restore();
  }

  // silhueta do palestrante, de costas, braço direito aberto para a plateia (metros, y para cima)
  var SIL = [
    [-0.055, 1.585], [-0.065, 1.53], [-0.2, 1.495], [-0.255, 1.43], [-0.272, 1.3], [-0.29, 1.1],
    [-0.295, 0.98], [-0.285, 0.8], [-0.272, 0.71], [-0.235, 0.715], [-0.232, 0.82], [-0.238, 1.0],
    [-0.205, 1.2], [-0.19, 1.0], [-0.172, 0.92], [-0.185, 0.84], [-0.172, 0.5], [-0.152, 0.09],
    [-0.168, 0.0], [-0.04, 0.0], [-0.048, 0.4], [-0.012, 0.79], [0.012, 0.79], [0.048, 0.4],
    [0.04, 0.0], [0.168, 0.0], [0.152, 0.09], [0.172, 0.5], [0.185, 0.84], [0.172, 0.92],
    [0.19, 1.0], [0.205, 1.21], [0.31, 1.18], [0.42, 1.26], [0.53, 1.37], [0.575, 1.43],
    [0.585, 1.475], [0.548, 1.47], [0.475, 1.43], [0.36, 1.355], [0.255, 1.43], [0.2, 1.495],
    [0.065, 1.53], [0.055, 1.585]
  ];

  function speakerPath(sx, sy, s) {
    var path = new Path2D();
    var pts = SIL.map(function (q) { return [sx + q[0] * s, sy - q[1] * s]; });
    var n = pts.length;
    var m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    path.moveTo(m0[0], m0[1]);
    for (var i = 0; i < n; i++) {
      var p0 = pts[i], p1 = pts[(i + 1) % n];
      path.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    path.closePath();
    path.moveTo(sx + 0.098 * s, sy - 1.705 * s);
    path.ellipse(sx, sy - 1.705 * s, 0.098 * s, 0.118 * s, 0, 0, Math.PI * 2);
    return path;
  }

  function speaker(p) {
    var pr = proj(0, 0, SPEAKER_Z);
    if (!pr) return;
    var sx = pr[0], sy = pr[1], s = pr[2];
    var dz = SPEAKER_Z - cam.z;
    var light = map(p, 0.5, 0.64);

    // foco de luz: cone e poça no chão
    if (light > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var top = proj(0, 9, SPEAKER_Z);
      var tx = top ? top[0] : sx, ty = top ? top[1] : -H;
      var cone = ctx.createLinearGradient(tx, ty, sx, sy);
      cone.addColorStop(0, "rgba(180,255,220," + (0.22 * light).toFixed(3) + ")");
      cone.addColorStop(1, "rgba(95,224,163," + (0.05 * light).toFixed(3) + ")");
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(tx - 0.12 * s, ty);
      ctx.lineTo(tx + 0.12 * s, ty);
      ctx.lineTo(sx + 1.1 * s, sy);
      ctx.lineTo(sx - 1.1 * s, sy);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1, 0.22);
      var pool = ctx.createRadialGradient(0, 0, 0, 0, 0, 1.3 * s);
      pool.addColorStop(0, "rgba(140,250,200," + (0.4 * light).toFixed(3) + ")");
      pool.addColorStop(1, "rgba(35,184,116,0)");
      ctx.fillStyle = pool;
      ctx.beginPath(); ctx.arc(0, 0, 1.3 * s, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // halo atrás do corpo
      var halo = ctx.createRadialGradient(sx, sy - 1.3 * s, 0, sx, sy - 1.3 * s, 1.4 * s);
      halo.addColorStop(0, "rgba(95,224,163," + (0.28 * light).toFixed(3) + ")");
      halo.addColorStop(1, "rgba(95,224,163,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 1.4 * s, sy - 2.7 * s, 2.8 * s, 2.8 * s);
      ctx.restore();
    }

    var path = speakerPath(sx, sy, s);
    ctx.save();
    ctx.shadowColor = "rgba(95,224,163," + (0.25 + 0.6 * light).toFixed(3) + ")";
    ctx.shadowBlur = Math.min(60, 0.12 * s);
    ctx.fillStyle = "#010201";
    ctx.fill(path);
    ctx.restore();
    // contorno de luz (rim light)
    ctx.save();
    ctx.strokeStyle = "rgba(150,245,205," + (0.15 + 0.55 * light).toFixed(3) + ")";
    ctx.lineWidth = Math.max(1, s * 0.005);
    ctx.stroke(path);
    ctx.restore();

    // VOCÊ escrito nas costas
    var vA = map(p, 0.56, 0.68);
    if (vA > 0 && dz > 0.6) {
      ctx.save();
      ctx.clip(path);
      var fs = 0.25 * s;
      ctx.font = "900 " + fs.toFixed(1) + "px 'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var rise = (1 - easeOut(vA)) * 0.08 * s;
      ctx.globalAlpha = vA;
      ctx.shadowColor = "#23b874";
      ctx.shadowBlur = 0.06 * s;
      ctx.fillStyle = "#5fe0a3";
      ctx.fillText("VOCÊ", sx, sy - 1.17 * s + rise);
      ctx.restore();
    }
    return { sx: sx, sy: sy, s: s };
  }

  /* frase da apoteose, pendurada sobre a plateia, atrás do palestrante */
  var PHRASE = {
    wide: [["NÃO DESPERDICE", 0], ["O POTENCIAL DA SUA", 0], ["PRÓXIMA APRESENTAÇÃO.", 1]],
    narrow: [["NÃO", 0], ["DESPERDICE", 0], ["O POTENCIAL", 0], ["DA SUA PRÓXIMA", 0], ["APRESENTAÇÃO.", 1]]
  };
  var phraseWorld = 1; // altura da fonte em metros, ajustada no resize

  function fitPhrase() {
    var lines = W / H < 0.9 ? PHRASE.narrow : PHRASE.wide;
    ctx.font = "900 100px 'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif";
    var maxW = 0;
    lines.forEach(function (l) { maxW = Math.max(maxW, ctx.measureText(l[0]).width / 100); });
    // escala final da câmera no plano da frase
    var base = Math.min(H, W * 1.15);
    var sFinal = (0.86 * base) / (PHRASE_Z - CAM_END_Z);
    var byW = (W * 0.84) / (maxW * sFinal);
    var byH = (H * 0.37) / (lines.length * 0.9 * sFinal);
    phraseWorld = Math.min(byW, byH);
    return lines;
  }
  var phraseLines = PHRASE.wide;

  function phrase(p) {
    var a = map(p, 0.72, 0.86);
    if (a <= 0) return;
    var lh = phraseWorld * 0.9;
    var n = phraseLines.length;
    var base = Math.min(H, W * 1.15);
    var sFinal = (0.86 * base) / (PHRASE_Z - CAM_END_Z);
    // a frase ocupa o alto da tela no enquadramento final; a última linha passa atrás da cabeça
    var topScreen = Math.max(H * 0.14, 120);
    var yTop = CAM_END_Y + (H * 0.5 - topScreen) / sFinal;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    for (var i = 0; i < n; i++) {
      var la = map(p, 0.72 + i * 0.025, 0.8 + i * 0.025);
      if (la <= 0) continue;
      var y = yTop - (i + 0.85) * lh - (1 - easeOut(la)) * 0.6;
      var pr = proj(0, y, PHRASE_Z);
      if (!pr) continue;
      var fs = phraseWorld * pr[2];
      ctx.font = "900 " + fs.toFixed(1) + "px 'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif";
      ctx.globalAlpha = la;
      var hl = phraseLines[i][1];
      ctx.shadowColor = hl ? "rgba(35,184,116,0.9)" : "rgba(0,0,0,0.85)";
      ctx.shadowBlur = hl ? fs * 0.35 : fs * 0.25;
      ctx.fillStyle = hl ? "#5fe0a3" : "#eef3ef";
      ctx.fillText(phraseLines[i][0], pr[0], pr[1]);
    }
    ctx.restore();
  }

  function blackout() {
    // ao atravessar o palestrante, a tela escurece por um instante
    var dz = SPEAKER_Z - cam.z;
    var a = 0;
    if (dz > -0.6 && dz < 0.9) a = 1 - Math.abs(dz - 0.15) / 0.75;
    if (a > 0) {
      ctx.fillStyle = "rgba(1,2,1," + clamp(a, 0, 1).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function grain() {
    // linhas de varredura sutis, sensação de telão
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "#000";
    for (var y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    ctx.restore();
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduce) time += dt;
    if (visible) {
      var k = reduce ? 1 : 1 - Math.pow(0.0009, dt);
      prog += (target - prog) * k;
      smx += (mx - smx) * (1 - Math.pow(0.02, dt));
      smy += (my - smy) * (1 - Math.pow(0.02, dt));
      render(prog);
      if (window.BrittoStage.onProgress) window.BrittoStage.onProgress(prog);
    }
    requestAnimationFrame(frame);
  }

  function render(p) {
    updateCamera(p);
    background(p);
    beams(p);
    crowd(p);
    phrase(p);
    stageFloor(p);
    speaker(p);
    blackout();
    grain();
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildCrowd();
    phraseLines = fitPhrase();
  }

  function onScroll() {
    var r = section.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    target = clamp(-r.top / total, 0, 1);
    visible = r.bottom > 0 && r.top < window.innerHeight;
  }

  window.addEventListener("resize", function () { resize(); onScroll(); });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.BrittoStage = { onProgress: null, get progress() { return prog; } };

  resize();
  onScroll();
  prog = target;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { phraseLines = fitPhrase(); });
  requestAnimationFrame(frame);
})();
