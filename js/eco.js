/* A BRITTO*: Gabriel no centro, partículas "tech" no ar e linhas de energia até os cinco braços. */
(function () {
  var sec = document.getElementById("ecossistema");
  if (!sec) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = document.getElementById("eco-stage");
  var svg = document.getElementById("eco-lines");
  var core = sec.querySelector(".eco-core");
  var arms = Array.prototype.slice.call(sec.querySelectorAll(".eco-arm"));
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- entrada ---------- */
  var visible = false;
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      visible = e.isIntersecting;
      if (visible && !sec.classList.contains("in")) { sec.classList.add("in"); setTimeout(draw, 1500); }
    });
  }, { threshold: 0.12 }).observe(sec);

  /* ---------- linhas do centro até cada braço ---------- */
  var paths = [];
  function anchor(el, s) {
    var r = el.getBoundingClientRect();
    if (el.classList.contains("eco-b")) return [r.left + r.width / 2 - s.left, r.top - s.top];
    var left = el.classList.contains("eco-l1") || el.classList.contains("eco-l2");
    return [(left ? r.right : r.left) - s.left, r.top + r.height / 2 - s.top];
  }
  function draw() {
    svg.innerHTML = "";
    paths = [];
    if (getComputedStyle(svg).display === "none") return;
    var s = stage.getBoundingClientRect(), c = core.getBoundingClientRect();
    var cx = c.left + c.width / 2 - s.left, cy = c.top + c.height * 0.46 - s.top;
    arms.forEach(function (el) {
      var a = anchor(el, s);
      var mx = (a[0] + cx) / 2;
      var d = el.classList.contains("eco-b")
        ? "M" + cx + " " + cy + " C" + cx + " " + (cy + 60) + " " + a[0] + " " + (a[1] - 80) + " " + a[0] + " " + a[1]
        : "M" + cx + " " + cy + " C" + mx + " " + cy + " " + mx + " " + a[1] + " " + a[0] + " " + a[1];
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("r", "2.6");
      svg.appendChild(dot);
      paths.push({ p: p, dot: dot, len: p.getTotalLength(), t: Math.random() });
    });
  }
  function hl(i) {
    paths.forEach(function (o, j) { o.p.classList.toggle("on", i === j); });
    arms.forEach(function (a, j) { a.classList.toggle("on", i === j); });
  }
  arms.forEach(function (a, i) {
    a.addEventListener("mouseenter", function () { hl(i); });
    a.addEventListener("mouseleave", function () { hl(-1); });
  });

  /* ---------- partículas ---------- */
  var cv = document.getElementById("eco-fx"), ctx = cv.getContext("2d");
  var W = 0, H = 0, dpr = 1, P = [], mouse = { x: -999, y: -999 };
  var GLYPHS = ["0", "1", "+", "*", "<>", "/", "{ }"];
  function seed() {
    var n = Math.round(Math.min(140, (W * H) / 9000));
    P = [];
    for (var i = 0; i < n; i++) {
      var g = Math.random() < 0.22;
      P.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15, vy: -0.1 - Math.random() * 0.35,
        r: 0.6 + Math.random() * 1.6, a: 0.25 + Math.random() * 0.6,
        g: g ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : null,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = sec.clientWidth; H = sec.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    draw();
  }
  sec.addEventListener("pointermove", function (e) {
    var r = sec.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  sec.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });

  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    var cr = core.getBoundingClientRect(), sr = sec.getBoundingClientRect();
    var cx = cr.left + cr.width / 2 - sr.left, cy = cr.top + cr.height * 0.46 - sr.top;
    ctx.font = "600 11px Manrope, sans-serif";
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (!reduce) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 12000) { var f = (12000 - d2) / 12000 * 0.9; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
        // leve atração em espiral para o centro
        var ox = cx - p.x, oy = cy - p.y, od = Math.sqrt(ox * ox + oy * oy) + 1;
        p.x += p.vx + (-oy / od) * 0.12; p.y += p.vy + (ox / od) * 0.04;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      }
      var tw = 0.6 + 0.4 * Math.sin(t / 700 + p.tw);
      ctx.globalAlpha = p.a * tw;
      if (p.g) { ctx.fillStyle = "#D7E44B"; ctx.fillText(p.g, p.x, p.y); }
      else {
        ctx.fillStyle = i % 5 ? "#D7E44B" : "#F4F6F0";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    }
    // rede: liga partículas próximas
    ctx.lineWidth = 0.6; ctx.strokeStyle = "#B9D352";
    for (var a = 0; a < P.length; a++) {
      if (P[a].g) continue;
      for (var b = a + 1; b < P.length; b++) {
        if (P[b].g) continue;
        var x = P[a].x - P[b].x, y = P[a].y - P[b].y, dd = x * x + y * y;
        if (dd < 7000) {
          ctx.globalAlpha = (1 - dd / 7000) * 0.22;
          ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    // pulsos de energia correndo pelas linhas até os braços
    paths.forEach(function (o) {
      if (!reduce) o.t = (o.t + 0.006) % 1;
      var pt = o.p.getPointAtLength(o.len * (reduce ? 1 : o.t));
      o.dot.setAttribute("cx", pt.x); o.dot.setAttribute("cy", pt.y);
    });
  }

  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 120); });
  var img = core.querySelector("img");
  if (img && !img.complete) img.addEventListener("load", draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  size();
  requestAnimationFrame(frame);
})();
