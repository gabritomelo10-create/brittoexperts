/* Apresentações BRITTO*: o MacBook entra girando, abre a tampa com um brilho atrás,
   liga mostrando a logo e depois passa as apresentações conforme o scroll. */
(function () {
  var sec = document.getElementById("apresentacoes");
  if (!sec) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mac = document.getElementById("mac");
  var lid = document.getElementById("mac-lid");
  var screen = document.getElementById("mac-screen");
  var box = document.getElementById("mac-slides");
  var dotsEl = document.getElementById("show-dots");
  var clientEl = document.getElementById("show-client"), titleEl = document.getElementById("show-title");
  var slides = (window.BRITTO && window.BRITTO.slides) || [];

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function map(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* maquetes de slide desenhadas em HTML; "img" no data.js substitui pela imagem real */
  var MOCK = {
    crime: function (s) {
      return '<div class="sl sl-crime"><i class="tape t1">CENA DO CRIME · NÃO ULTRAPASSE · CENA DO CRIME · NÃO ULTRAPASSE</i>' +
        '<span class="k">BOLETIM DE OCORRÊNCIA Nº 0001</span><h4>O advogado que não vende está <em>desaparecido</em></h4>' +
        '<span class="k">Visto pela última vez: esperando indicação</span><i class="tape t2">CENA DO CRIME · NÃO ULTRAPASSE · CENA DO CRIME</i></div>';
    },
    futuro: function () {
      return '<div class="sl sl-futuro"><i class="grid"></i><i class="sun"></i><span class="k">Grupo Gerber apresenta</span>' +
        '<h4>25 anos</h4><span class="k">De volta para o futuro</span></div>';
    },
    ia: function () {
      return '<div class="sl sl-ia"><span class="k">&gt; prompt: gerar vendas_</span><h4>IA gera vendas<br><em>e eu posso provar</em></h4>' +
        '<div class="bars"><i style="--h:22%"></i><i style="--h:34%"></i><i style="--h:41%"></i><i style="--h:58%"></i><i style="--h:72%"></i><i style="--h:94%"></i></div></div>';
    },
    faixa: function () {
      return '<div class="sl sl-faixa"><span class="k">All In Club</span><h4>All In<br>Faixa Preta</h4><i class="belt"><b></b></i></div>';
    },
    sushi: function () {
      return '<div class="sl sl-sushi"><i class="sun"></i><span class="k">História e bastidores</span><h4>Sushi<br>Ponta Negra</h4><span class="jp">寿司</span></div>';
    },
    redes: function () {
      return '<div class="sl sl-redes"><div class="txt"><span class="k">@você</span><h4>Domine as redes sociais e <em>venda mais</em></h4></div>' +
        '<div class="feed"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
    },
    pitch: function () {
      return '<div class="sl sl-pitch"><span class="k">Pitch · Medprev Manaus</span><h4>O problema.<br>A virada.<br><em>O fechamento.</em></h4>' +
        '<div class="cols"><i>C</i><i>N</i><i>V</i></div></div>';
    }
  };

  slides.forEach(function (s, i) {
    var el = document.createElement("div");
    el.className = "mac-slide";
    el.innerHTML = s.img ? '<img src="' + esc(s.img) + '" alt="">' : (MOCK[s.tema] ? MOCK[s.tema](s) : "");
    box.appendChild(el);
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", "Mostrar " + s.cliente + ": " + s.titulo);
    d.addEventListener("click", function () { jumpTo(i); });
    dotsEl.appendChild(d);
  });
  var slideEls = Array.prototype.slice.call(box.children);
  var dotEls = Array.prototype.slice.call(dotsEl.children);

  // linha do tempo do scroll
  var T = { enter: [0, 0.3], open: [0.08, 0.34], boot: [0.34, 0.42], slides: [0.44, 0.97] };

  function jumpTo(i) {
    var r = sec.getBoundingClientRect();
    var total = r.height - innerHeight;
    var p = T.slides[0] + (i + 0.5) / slides.length * (T.slides[1] - T.slides[0]);
    window.scrollTo({ top: scrollY + r.top + p * total, behavior: reduce ? "auto" : "smooth" });
  }

  var target = 0, prog = 0, mx = 0, my = 0, smx = 0, smy = 0, current = -2, last = performance.now();

  function update() {
    var r = sec.getBoundingClientRect();
    target = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
  }

  function render(p) {
    var e = ease(map(p, T.enter[0], T.enter[1]));
    var o = ease(map(p, T.open[0], T.open[1]));
    var spin = lerp(-215, -8, e) + smx * 10;
    var tilt = lerp(-48, -16, e) + smy * 6;
    var y = lerp(46, 0, e);
    var sc = lerp(0.55, 1, e);
    mac.style.transform = "translateY(" + y.toFixed(2) + "vh) scale(" + sc.toFixed(3) + ") rotateX(" + tilt.toFixed(2) + "deg) rotateY(" + spin.toFixed(2) + "deg)";
    lid.style.transform = "rotateX(" + lerp(-90, 12, o).toFixed(2) + "deg)";
    sec.style.setProperty("--glow", (0.15 + 0.85 * easeOut(map(p, 0.05, 0.4))).toFixed(3));
    sec.style.setProperty("--copy", map(p, 0.3, 0.42).toFixed(3));

    var boot = map(p, T.boot[0], T.boot[1]);
    screen.style.setProperty("--on", boot.toFixed(3));

    var idx = -1;
    if (p >= T.slides[0]) idx = Math.min(slides.length - 1, Math.floor(map(p, T.slides[0], T.slides[1]) * slides.length));
    if (idx !== current) {
      current = idx;
      slideEls.forEach(function (el, i) { el.classList.toggle("on", i === idx); el.classList.toggle("past", i < idx); });
      dotEls.forEach(function (d, i) { d.classList.toggle("on", i === idx); if (i === idx) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      screen.classList.toggle("showing", idx >= 0);
      var s = slides[idx];
      clientEl.textContent = s ? s.cliente : "BRITTO*";
      titleEl.textContent = s ? s.titulo : "Direção de arte para palestras";
    }
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var r = sec.getBoundingClientRect();
    if (r.bottom > -100 && r.top < innerHeight + 100) {
      prog += (target - prog) * (reduce ? 1 : 1 - Math.pow(0.0005, dt));
      smx += (mx - smx) * (1 - Math.pow(0.03, dt));
      smy += (my - smy) * (1 - Math.pow(0.03, dt));
      render(prog);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("pointermove", function (ev) {
    if (ev.pointerType !== "mouse") return;
    mx = (ev.clientX / innerWidth) * 2 - 1;
    my = (ev.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  update();
  prog = target;
  render(prog);
  requestAnimationFrame(frame);
})();
