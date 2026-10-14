/* Método C.N.V.: uma ideia solta viaja pela tela, absorve o seu repertório e se transforma
   em roteiro (Narrativa), depois em slide (Visual) e por fim em você, brilhando no palco.
   Partículas em canvas 2D que migram entre formas desenhadas fora da tela. */
(function () {
  var sec = document.getElementById("mentorias");
  var canvas = document.getElementById("flow-canvas");
  if (!sec || !canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var steps = Array.prototype.slice.call(document.querySelectorAll(".flow-step"));
  var finalEl = document.getElementById("flow-final");
  var tagEl = document.getElementById("flow-tag"), tagTxt = tagEl.querySelector("span");
  var wordsEl = document.getElementById("flow-words");

  var W = 0, H = 0, DPR = 1, N = 0, scale = 1, cx = 0, cy = 0, narrow = false;
  var shapes = [], parts = [];
  var target = 0, prog = 0, time = 0, last = performance.now();

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function map(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rnd(i) { var x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); }

  /* ---------- formas (desenhadas num canvas 600×420, origem no centro) ---------- */
  var SW = 600, SH = 420;
  var FONT = "'Big Shoulders Display','Arial Narrow',Impact,sans-serif";

  function sample(draw, n, jitter) {
    var c = document.createElement("canvas");
    c.width = SW; c.height = SH;
    var g = c.getContext("2d");
    g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
    draw(g);
    var data = g.getImageData(0, 0, SW, SH).data, pts = [];
    for (var y = 0; y < SH; y += 2) for (var x = 0; x < SW; x += 2) if (data[(y * SW + x) * 4 + 3] > 128) pts.push([x - SW / 2, y - SH / 2]);
    var out = [];
    for (var i = 0; i < n; i++) {
      var p = pts[Math.floor(rnd(i * 3.3 + n) * pts.length)] || [0, 0];
      out.push([p[0] + (rnd(i * 7.1) - 0.5) * (jitter || 0), p[1] + (rnd(i * 5.9) - 0.5) * (jitter || 0)]);
    }
    return out;
  }

  // 0 · ideia: lâmpada com filamento e um halo de pontos soltos
  function shapeIdea(n) {
    var core = sample(function (g) {
      g.lineWidth = 7;
      g.beginPath(); g.arc(0 + SW / 2, -30 + SH / 2, 95, Math.PI * 0.78, Math.PI * 2.22); g.stroke();
      g.beginPath(); g.moveTo(SW / 2 - 55, SH / 2 + 45); g.lineTo(SW / 2 - 45, SH / 2 + 85); g.lineTo(SW / 2 + 45, SH / 2 + 85); g.lineTo(SW / 2 + 55, SH / 2 + 45); g.stroke();
      g.fillRect(SW / 2 - 42, SH / 2 + 96, 84, 9); g.fillRect(SW / 2 - 34, SH / 2 + 112, 68, 9); g.fillRect(SW / 2 - 20, SH / 2 + 128, 40, 8);
      g.lineWidth = 5;
      g.beginPath(); g.moveTo(SW / 2 - 25, SH / 2 + 45); g.lineTo(SW / 2 - 15, SH / 2 - 30); g.lineTo(SW / 2 - 5, SH / 2 - 10); g.lineTo(SW / 2 + 5, SH / 2 - 30); g.lineTo(SW / 2 + 15, SH / 2 - 10); g.lineTo(SW / 2 + 25, SH / 2 + 45); g.stroke();
    }, Math.floor(n * 0.62), 3);
    var halo = [];
    for (var i = core.length; i < n; i++) {
      var a = rnd(i * 2.1) * Math.PI * 2, r = 120 + Math.pow(rnd(i * 4.7), 0.6) * 160;
      halo.push([Math.cos(a) * r, -30 + Math.sin(a) * r * 0.85]);
    }
    return core.concat(halo);
  }

  // 1 · roteiro: folha com título, tópicos numerados e linhas de texto
  function shapeScript(n) {
    return sample(function (g) {
      var x0 = SW / 2 - 150, y0 = SH / 2 - 190;
      g.lineWidth = 4; g.strokeRect(x0, y0, 300, 380);
      g.fillRect(x0 + 28, y0 + 30, 170, 16);
      g.fillRect(x0 + 28, y0 + 56, 110, 6);
      var y = y0 + 90;
      for (var k = 0; k < 3; k++) {
        g.font = "900 26px " + FONT; g.fillText("0" + (k + 1), x0 + 26, y + 22);
        g.fillRect(x0 + 72, y + 4, 150 - k * 22, 9);
        g.fillRect(x0 + 72, y + 24, 196, 4); g.fillRect(x0 + 72, y + 36, 180 - k * 20, 4); g.fillRect(x0 + 72, y + 48, 120 + k * 30, 4);
        y += 86;
      }
    }, n, 1.5);
  }

  // 2 · slide: moldura 16:9 com título forte e imagem
  function shapeSlide(n) {
    return sample(function (g) {
      var w = 520, h = 292, x0 = SW / 2 - w / 2, y0 = SH / 2 - h / 2;
      g.lineWidth = 5; g.strokeRect(x0, y0, w, h);
      g.font = "900 96px " + FONT; g.fillText("SUA", x0 + 30, y0 + 116); g.fillText("IDEIA.", x0 + 30, y0 + 206);
      g.fillRect(x0 + 32, y0 + 236, 150, 7);
      g.lineWidth = 6; g.beginPath(); g.arc(x0 + 405, y0 + 146, 70, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(x0 + 405, y0 + 146, 34, 0, Math.PI * 2); g.fill();
    }, n, 1.5);
  }

  // 3 · brilho: você no palco, de frente para o slide, com raios de luz
  var SIL = [[-0.055,1.585],[-0.065,1.53],[-0.2,1.495],[-0.255,1.43],[-0.272,1.3],[-0.29,1.1],[-0.295,0.98],[-0.285,0.8],[-0.272,0.71],[-0.235,0.715],[-0.232,0.82],[-0.238,1.0],[-0.205,1.2],[-0.19,1.0],[-0.172,0.92],[-0.185,0.84],[-0.172,0.5],[-0.152,0.09],[-0.168,0.0],[-0.04,0.0],[-0.048,0.4],[-0.012,0.79],[0.012,0.79],[0.048,0.4],[0.04,0.0],[0.168,0.0],[0.152,0.09],[0.172,0.5],[0.185,0.84],[0.172,0.92],[0.19,1.0],[0.205,1.21],[0.31,1.18],[0.42,1.26],[0.53,1.37],[0.575,1.43],[0.585,1.475],[0.548,1.47],[0.475,1.43],[0.36,1.355],[0.255,1.43],[0.2,1.495],[0.065,1.53],[0.055,1.585]];
  function shapeShine(n) {
    var body = sample(function (g) {
      var s = 190, fx = SW / 2 - 20, fy = SH / 2 + 190;
      g.beginPath();
      SIL.forEach(function (q, i) { var x = fx + q[0] * s, y = fy - q[1] * s; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.closePath(); g.fill();
      g.beginPath(); g.ellipse(fx, fy - 1.705 * s, 0.1 * s, 0.12 * s, 0, 0, Math.PI * 2); g.fill();
    }, Math.floor(n * 0.55), 1);
    var rays = [];
    for (var i = body.length; i < n; i++) {
      var k = i % 18, a = (k / 18) * Math.PI * 2 + 0.1, r = 150 + rnd(i * 3.7) * 150;
      rays.push([-20 + Math.cos(a) * r, -60 + Math.sin(a) * r * 0.9]);
    }
    return body.concat(rays);
  }

  function build() {
    narrow = W < 900;
    N = narrow ? 1100 : 2200;
    shapes = [shapeIdea(N), shapeScript(N), shapeSlide(N), shapeShine(N)];
    parts = [];
    for (var i = 0; i < N; i++) parts.push({ d: rnd(i * 1.37), s: 0.6 + rnd(i * 8.3) * 1.4, ph: rnd(i * 2.9) * 6.283, hue: rnd(i * 6.1) });
  }

  /* ---------- palavras do repertório que flutuam e são absorvidas pela ideia ---------- */
  var WORDS = ["experiência", "resultados", "histórias", "dados", "bastidores", "provas", "erros", "conquistas", "clientes", "método", "viradas", "números"];
  var words = WORDS.map(function (w, i) {
    var el = document.createElement("span");
    el.textContent = w;
    wordsEl.appendChild(el);
    return { el: el, x: rnd(i * 4.4), y: rnd(i * 9.2), ph: rnd(i * 3.1) * 6.283, d: i / WORDS.length };
  });

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  // linha do tempo: [ideia viajando] C → N (roteiro) → V (slide) → brilho
  var K = [0.26, 0.36, 0.5, 0.6, 0.74, 0.84]; // inícios/fins das transformações

  function render(p) {
    ctx.clearRect(0, 0, W, H);
    // área da cena: à direita no desktop, no alto no celular
    var areaX = narrow ? W / 2 : W * 0.66, areaY = narrow ? H * 0.3 : H * 0.52;
    scale = narrow ? Math.min(W / 640, H * 0.42 / 420) : Math.min(W * 0.5 / 600, H * 0.72 / 420);

    // a ideia viaja: entra pela esquerda, faz uma curva flutuando e para no centro da cena
    var travel = ease(map(p, 0, 0.24));
    var fx = lerp(narrow ? W * 0.15 : W * 0.42, areaX, travel) + Math.sin(travel * Math.PI * 2) * (narrow ? 20 : 60) * (1 - travel);
    var fy = lerp(narrow ? H * 0.5 : H * 0.88, areaY, travel) - Math.sin(travel * Math.PI) * H * 0.18;
    var bob = Math.sin(time * 1.3) * 10 * (1 - map(p, K[0], K[1]));
    cx = fx; cy = fy + bob;
    var sc = scale * lerp(0.55, 1, travel);

    // qual forma e quanto de transformação
    var from = 0, to = 0, t = 0;
    if (p < K[0]) { from = to = 0; }
    else if (p < K[1]) { from = 0; to = 1; t = map(p, K[0], K[1]); }
    else if (p < K[2]) { from = to = 1; }
    else if (p < K[3]) { from = 1; to = 2; t = map(p, K[2], K[3]); }
    else if (p < K[4]) { from = to = 2; }
    else if (p < K[5]) { from = 2; to = 3; t = map(p, K[4], K[5]); }
    else { from = to = 3; }
    var A = shapes[from], B = shapes[to];
    var shine = map(p, K[4], 1);

    // brilho de fundo
    var glowR = sc * (260 + shine * 220);
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, "rgba(95,224,163," + (0.18 + shine * 0.3).toFixed(3) + ")");
    g.addColorStop(0.45, "rgba(35,184,116," + (0.07 + shine * 0.12).toFixed(3) + ")");
    g.addColorStop(1, "rgba(35,184,116,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var loose = 1 - map(p, 0.12, K[0]); // a ideia começa solta e vai se organizando
    for (var i = 0; i < N; i++) {
      var q = parts[i];
      var lt = ease(clamp((t - q.d * 0.35) / 0.65, 0, 1));
      var a = A[i], b = B[i];
      var x = lerp(a[0], b[0], lt), y = lerp(a[1], b[1], lt);
      // arco durante a viagem entre formas
      var arc = Math.sin(lt * Math.PI) * (12 + q.d * 34);
      x += Math.cos(q.ph) * arc; y += Math.sin(q.ph) * arc;
      // flutuação: grande quando a ideia está solta, sutil depois
      var amp = 2 + loose * 26;
      x += Math.sin(time * (0.6 + q.s * 0.4) + q.ph) * amp;
      y += Math.cos(time * (0.5 + q.s * 0.3) + q.ph * 1.3) * amp;
      var px = cx + x * sc, py = cy + y * sc;
      var r = (0.8 + q.s * 0.7) * Math.max(0.7, sc);
      var tw = 0.55 + 0.45 * Math.sin(time * 2 + q.ph * 3);
      var white = q.hue > 0.72 || (to === 3 && q.hue > 0.4 * (1 - shine));
      ctx.fillStyle = white ? "rgba(235,255,245," + (0.55 + 0.45 * tw).toFixed(2) + ")" : "rgba(95,224,163," + (0.45 + 0.5 * tw).toFixed(2) + ")";
      ctx.fillRect(px - r / 2, py - r / 2, r, r);
    }
    ctx.restore();

    // raios girando quando você brilha
    if (shine > 0.4) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(cx - 20 * sc, cy - 60 * sc);
      ctx.rotate(time * 0.12);
      var ra = (shine - 0.4) / 0.6;
      for (var k = 0; k < 12; k++) {
        ctx.rotate(Math.PI / 6);
        var lg = ctx.createLinearGradient(0, 0, 0, -380 * sc);
        lg.addColorStop(0, "rgba(180,255,220," + (0.14 * ra).toFixed(3) + ")");
        lg.addColorStop(1, "rgba(95,224,163,0)");
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.moveTo(-6 * sc, 0); ctx.lineTo(6 * sc, 0); ctx.lineTo(30 * sc, -380 * sc); ctx.lineTo(-30 * sc, -380 * sc); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // palavras: flutuam pela tela e são puxadas para dentro da ideia
    words.forEach(function (w) {
      var pull = ease(map(p, 0.06 + w.d * 0.1, 0.2 + w.d * 0.08));
      var wx = (narrow ? w.x * W * 0.8 + W * 0.1 : w.x * W * 0.5 + W * 0.42) + Math.sin(time * 0.5 + w.ph) * 30;
      var wy = (narrow ? w.y * H * 0.4 + H * 0.12 : w.y * H * 0.75 + H * 0.12) + Math.cos(time * 0.4 + w.ph) * 24;
      var x = lerp(wx, cx, pull), y = lerp(wy, cy, pull);
      var o = map(p, 0, 0.04) * (1 - pull) * (narrow ? 0.7 : 1);
      w.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) scale(" + (1 - pull * 0.7).toFixed(3) + ")";
      w.el.style.opacity = o.toFixed(3);
    });

    // etiqueta que acompanha a forma
    var label = p < K[0] ? "Sua ideia" : p < K[2] ? "Roteiro" : p < K[4] ? "Slide" : "Você no palco";
    if (tagTxt.textContent !== label) tagTxt.textContent = label;
    var tagY = cy + (to === 3 || from === 3 ? 230 : 200) * sc;
    tagEl.style.transform = "translate3d(" + cx.toFixed(1) + "px," + tagY.toFixed(1) + "px,0) translate(-50%,0)";

    // texto: qual mentoria está ativa
    var active = p < K[1] ? 0 : p < K[3] ? 1 : p < K[5] - 0.04 ? 2 : 3;
    steps.forEach(function (s, i) { s.classList.toggle("on", i === active); s.classList.toggle("done", i < active); });
    finalEl.classList.toggle("on", active === 3);
  }

  function update() {
    var r = sec.getBoundingClientRect();
    target = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var r = sec.getBoundingClientRect();
    if (r.bottom > -50 && r.top < innerHeight + 50) {
      if (!reduce) time += dt;
      prog += (target - prog) * (reduce ? 1 : 1 - Math.pow(0.002, dt));
      render(prog);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", function () { resize(); update(); });
  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { shapes[2] = shapeSlide(N); shapes[1] = shapeScript(N); });
  update();
  prog = target;
  requestAnimationFrame(frame);
})();
