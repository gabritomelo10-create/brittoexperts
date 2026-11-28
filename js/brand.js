/* Profundidade e interação: bokeh com paralaxe, a marca construída com o scroll,
   mockups 3D (inclinação, luz, foco) e inclinação com brilho nos cartões do site. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function map(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ---------- bokeh: camadas desfocadas em profundidades diferentes ---------- */
  var bokeh = Array.prototype.slice.call(document.querySelectorAll("#fx-bokeh i"));
  var depth = [0.12, 0.35, 0.08, 0.5, 0.65, 0.2];
  var mx = 0, my = 0, smx = 0, smy = 0;
  if (fine) window.addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  /* ---------- a marca: construção com o scroll ---------- */
  var brand = document.getElementById("marca");
  var bv = document.getElementById("brand-visual");
  var bars = brand ? Array.prototype.slice.call(brand.querySelectorAll("#bv-star .bar")) : [];
  var star = document.getElementById("bv-star");
  var guides = brand ? brand.querySelector(".bv-guides") : null;
  var word = document.getElementById("bv-word");
  var pal = brand ? Array.prototype.slice.call(brand.querySelectorAll("#bv-pal span")) : [];
  var type = document.getElementById("bv-type");
  var steps = brand ? Array.prototype.slice.call(brand.querySelectorAll(".bstep")) : [];
  var dots = brand ? Array.prototype.slice.call(brand.querySelectorAll(".bdots i")) : [];
  var stepN = document.getElementById("bstep-n");
  var curStep = -1;
  /* de onde cada barra chega (espalhadas) e o ângulo final */
  var FROM = [{ x: -320, y: -260, r: -120, s: 0.6 }, { x: 340, y: -120, r: 200, s: 0.5 }, { x: 60, y: 330, r: -40, s: 0.7 }];
  var ANG = [0, 60, -60];

  function brandScroll() {
    if (!brand) return;
    var r = brand.getBoundingClientRect();
    var p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    if (r.bottom < 0 || r.top > innerHeight) return;
    // 5 passos em faixas iguais
    var k = Math.min(4, Math.floor(p * 5));
    if (k !== curStep) {
      curStep = k;
      steps.forEach(function (s, i) { s.classList.toggle("on", i === k); s.classList.toggle("past", i < k); });
      stepN.textContent = "0" + (k + 1);
    }
    dots.forEach(function (d, i) { d.style.setProperty("--f", clamp(p * 5 - i, 0, 1).toFixed(3)); });

    // 1. conceito: as barras chegam e formam o asterisco
    var a = ease(map(p, 0.0, 0.16));
    bars.forEach(function (b, i) {
      var f = FROM[i];
      var x = lerp(f.x, 0, a), y = lerp(f.y, 0, a), rot = lerp(f.r, ANG[i], a), s = lerp(f.s, 1, a);
      b.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + " 300 300) translate(300 300) scale(" + s.toFixed(3) + ") translate(-300 -300)");
      b.style.opacity = (0.2 + 0.8 * a).toFixed(3);
    });
    // 2. geometria: guias desenham, ângulos e medidas aparecem
    guides.style.setProperty("--g", ease(map(p, 0.06, 0.34)).toFixed(3));
    guides.style.setProperty("--g2", (map(p, 0.24, 0.32) * (1 - map(p, 0.4, 0.46))).toFixed(3));
    guides.style.setProperty("--go", (1 - 0.7 * map(p, 0.42, 0.5)).toFixed(3));
    // 3. nome: o asterisco encolhe e sobe para o canto do BRITTO*, o nome aparece
    var n = ease(map(p, 0.42, 0.56));
    var vr = bv.getBoundingClientRect();
    var ww = vr.width * 0.84; // largura do logotipo (84% do quadro)
    var tx = (0.08 * vr.width + 0.954 * ww) / vr.width * 600 - 300;
    var ty = (0.5 * vr.height - (ww * 106.18 / 330) / 2 + 0.145 * (ww * 106.18 / 330)) / vr.height * 600 - 300;
    var sc = lerp(1, (0.0933 * ww) / (vr.width * 200 / 600), n);
    var spin = 0;
    star.setAttribute("transform", "translate(" + (tx * n).toFixed(1) + " " + (ty * n).toFixed(1) + ") translate(300 300) scale(" + sc.toFixed(3) + ") rotate(" + spin.toFixed(1) + ") translate(-300 -300)");
    word.style.setProperty("--w", ease(map(p, 0.48, 0.6)).toFixed(3));
    word.style.setProperty("--wo", (map(p, 0.46, 0.5)).toFixed(3));
    star.style.opacity = (1 - map(p, 0.57, 0.6)).toFixed(3);
    // 4. cores: o logotipo sobe, as amostras entram em cascata
    var c = map(p, 0.6, 0.78);
    word.style.translate = "0 calc(-50% - " + (ease(map(p, 0.6, 0.66)) * 22).toFixed(1) + "%)";
    pal.forEach(function (s, i) { s.style.setProperty("--o", ease(clamp(c * 2.2 - i * 0.25, 0, 1)).toFixed(3)); });
    // 5. tipografia: as amostras descem, os tipos aparecem no topo
    var t = ease(map(p, 0.8, 0.9));
    type.style.setProperty("--to", t.toFixed(3));
    word.style.opacity = (1 - t).toFixed(3);
  }

  /* ---------- mockups: inclinação, luz que segue o mouse e foco no que está sob o cursor ---------- */
  var grid = document.getElementById("mk-grid");
  var mks = Array.prototype.slice.call(document.querySelectorAll("[data-mk]"));
  var mkLight = document.querySelector(".mk-light");
  mks.forEach(function (m) {
    var scene = m.querySelector(".mk-scene");
    m.addEventListener("pointerenter", function (e) { if (e.pointerType !== "mouse") return; m.classList.add("on"); grid.classList.add("focus"); });
    m.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      m.classList.remove("on"); grid.classList.remove("focus");
      scene.style.setProperty("--rx", "0deg"); scene.style.setProperty("--ry", "0deg");
    });
    m.addEventListener("pointermove", function (e) {
      if (reduce) return;
      var b = m.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      scene.style.setProperty("--ry", ((x - 0.5) * 26).toFixed(2) + "deg");
      scene.style.setProperty("--rx", ((0.5 - y) * 20).toFixed(2) + "deg");
      m.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      m.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      m.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
    });
    m.addEventListener("click", function () { if (!fine) m.classList.toggle("on"); });
  });
  var mkSec = document.getElementById("mockups");
  if (mkSec && fine) mkSec.addEventListener("pointermove", function (e) {
    var r = mkSec.getBoundingClientRect();
    mkLight.style.setProperty("--lx", (e.clientX - r.left) + "px");
    mkLight.style.setProperty("--ly", (e.clientY - r.top) + "px");
  });
  /* no celular, o letreiro acende sozinho quando aparece */
  var neon = document.querySelector(".mk-neon");
  if (neon) new IntersectionObserver(function (es) { es.forEach(function (e) { neon.classList.toggle("lit", e.isIntersecting && !fine); }); }, { threshold: 0.6 }).observe(neon);

  /* crachá: pêndulo que reage à velocidade do mouse */
  var lan = document.getElementById("lanyard"), ang = 0, vel = 0, lastX = null;
  var badgeCard = document.querySelector(".mk-badge");
  if (badgeCard) {
    badgeCard.addEventListener("pointermove", function (e) {
      if (lastX !== null) vel += clamp((e.clientX - lastX) * 0.08, -3, 3);
      lastX = e.clientX;
    });
    badgeCard.addEventListener("pointerleave", function () { lastX = null; });
    badgeCard.addEventListener("click", function () { vel += 6; });
  }

  /* ---------- inclinação com brilho nos cartões do site ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".eco-arm, .clientes li, .dor > div, .palco").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        el.style.transform = "perspective(800px) rotateX(" + ((0.5 - y) * 8).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 10).toFixed(2) + "deg) translateY(-4px)";
        el.style.backgroundImage = "radial-gradient(300px circle at " + (x * 100).toFixed(1) + "% " + (y * 100).toFixed(1) + "%, rgba(215,228,75,.14), transparent 60%)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; el.style.backgroundImage = ""; });
    });
  }

  /* ---------- laço único: scroll + animações contínuas ---------- */
  function frame() {
    requestAnimationFrame(frame);
    smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
    if (!reduce) {
      var y = scrollY;
      bokeh.forEach(function (b, i) {
        var d = depth[i];
        b.style.setProperty("--bx", (smx * -80 * d * 2).toFixed(1) + "px");
        b.style.setProperty("--by", (Math.sin(y * 0.0012 + i) * 260 * d + smy * -60 * d).toFixed(1) + "px");
      });
    }
    brandScroll();
    if (lan) {
      vel += -ang * 0.02; vel *= 0.94; ang += vel;
      ang = clamp(ang, -35, 35);
      lan.style.setProperty("--sw", ang.toFixed(2) + "deg");
    }
  }
  requestAnimationFrame(frame);
})();
