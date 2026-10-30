(function () {
  var WA = "5592991218255";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function waLink(m) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(m); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });

  /* ---------- navegação: links reais, com endereço #seção ----------
     Nas seções que ficam presas na tela, o salto cai no ponto da animação em que há conteúdo
     (o MacBook já aberto, por exemplo), e não no começo vazio. */
  var LAND = { apresentacoes: 0.5, mentorias: 0.05 };
  var navLock = 0;
  function alvoY(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var top = el.getBoundingClientRect().top + scrollY;
    var preso = el.offsetHeight > innerHeight * 1.5;
    if (preso && LAND[id] != null) return top + (el.offsetHeight - innerHeight) * LAND[id];
    return top;
  }
  function irPara(id, suave) {
    var y = alvoY(id);
    if (y == null) return false;
    navLock = performance.now() + 1600;
    document.querySelector("header.top").classList.remove("hide");
    window.scrollTo({ top: Math.max(0, y), behavior: suave && !reduce ? "smooth" : "auto" });
    return true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (id === "topo") id = "stage";
    if (!document.getElementById(id)) return;
    e.preventDefault();
    fecharMenu();
    if (irPara(id, true)) history.pushState(null, "", "#" + (id === "stage" ? "topo" : id));
  });
  window.addEventListener("popstate", function () { var id = location.hash.slice(1) || "stage"; irPara(id === "topo" ? "stage" : id, false); });
  window.addEventListener("load", function () {
    var id = location.hash.slice(1);
    if (id && id !== "topo") setTimeout(function () { irPara(id, false); }, 60);
  });

  /* ---------- menu do celular ---------- */
  var header0 = document.querySelector("header.top"), toggle = document.querySelector(".menu-toggle");
  function fecharMenu() {
    if (!header0.classList.contains("open")) return;
    header0.classList.remove("open");
    document.documentElement.classList.remove("menu-aberto");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var abrir = !header0.classList.contains("open");
    header0.classList.toggle("open", abrir);
    document.documentElement.classList.toggle("menu-aberto", abrir);
    toggle.setAttribute("aria-expanded", abrir ? "true" : "false");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharMenu(); });
  window.addEventListener("resize", function () { if (innerWidth >= 900) fecharMenu(); });

  /* ---------- cidades ---------- */
  var cid = ["Manaus", "São Paulo", "Salvador", "Japão", "China"] /* 3 cidades no Brasil e 2 países */, ct = document.getElementById("cidades");
  for (var r = 0; r < 4; r++) cid.forEach(function (c) { var s = document.createElement("span"); s.textContent = c; ct.appendChild(s); });

  /* ---------- palestrantes: trilho horizontal ---------- */
  var spk = (window.BRITTO && window.BRITTO.palestrantes) || [];
  var sp = document.getElementById("speakers");
  spk.forEach(function (p, i) {
    var ini = p.nome.split(" ").slice(0, 2).map(function (w) { return w[0]; }).join("");
    var d = document.createElement("article");
    d.className = "spk no-photo";
    d.innerHTML =
      '<div class="spk-photo"><span class="spk-ini" aria-hidden="true">' + esc(ini) + '</span>' +
      '<img alt="' + esc(p.nome) + '" loading="lazy" decoding="async"></div>' +
      '<div class="spk-info"><span class="spk-n">' + String(i + 1).padStart(2, "0") + '</span>' +
      '<b>' + esc(p.nome) + '</b><span class="spk-role">' + esc(p.papel) + '</span>' +
      (p.palestra ? '<span class="spk-talk">' + esc(p.palestra) + '</span>' : '') + '</div>';
    var img = d.querySelector("img");
    img.addEventListener("load", function () { d.classList.remove("no-photo"); });
    if (p.foto) img.src = "img/palestrantes/" + p.foto;
    sp.appendChild(d);
  });
  document.getElementById("cast-total").textContent = String(spk.length).padStart(2, "0");

  var cast = document.getElementById("palestrantes");
  var castCards = Array.prototype.slice.call(sp.children);
  var castIdx = document.getElementById("cast-idx"), castBar = document.getElementById("cast-bar");
  var castPinned = false, castMax = 0;
  function castLayout() {
    castPinned = !reduce && innerWidth >= 900;
    cast.classList.toggle("pinned", castPinned);
    sp.style.transform = "";
    if (castPinned) {
      castMax = Math.max(0, sp.scrollWidth - innerWidth + 32);
      cast.style.height = (innerHeight + castMax) + "px";
    } else {
      cast.style.height = "";
    }
  }
  function castScroll() {
    var p;
    if (castPinned) {
      var r = cast.getBoundingClientRect();
      p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      sp.style.transform = "translate3d(" + (-p * castMax).toFixed(1) + "px,0,0)";
    } else {
      p = sp.scrollLeft / Math.max(1, sp.scrollWidth - sp.clientWidth);
    }
    castBar.style.transform = "scaleX(" + Math.max(0.04, p).toFixed(3) + ")";
    // cada card gira levemente conforme a posição na tela e endireita no centro
    var best = 0, bestD = 1e9, mid = innerWidth / 2;
    castCards.forEach(function (c, i) {
      var b = c.getBoundingClientRect();
      var off = (b.left + b.width / 2 - mid) / innerWidth;
      if (Math.abs(off) < bestD) { bestD = Math.abs(off); best = i; }
      if (!reduce) c.style.setProperty("--off", clamp(off, -1, 1).toFixed(3));
    });
    castIdx.textContent = String(best + 1).padStart(2, "0");
  }
  sp.addEventListener("scroll", castScroll, { passive: true });
  window.addEventListener("resize", function () { castLayout(); castScroll(); });
  castLayout();
  window.addEventListener("load", function () { castLayout(); castScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { castLayout(); castScroll(); });

  /* ---------- títulos divididos em palavras ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + esc(w) + '</span></span>';
    }).join(" ");
  });

  /* ---------- revelação no scroll ---------- */
  // atraso escalonado para irmãos revelados juntos
  document.querySelectorAll(".dor,.palco-list,.cases,.nums,.founder-copy").forEach(function (g) {
    Array.prototype.forEach.call(g.querySelectorAll("[data-reveal]"), function (el, i) { el.style.setProperty("--d", i * 0.09 + "s"); });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  function countUp(el) {
    var to = +el.getAttribute("data-count"), pre = el.getAttribute("data-prefix") || "";
    if (reduce) { el.textContent = pre + to; return; }
    var t0 = performance.now(), dur = 1400;
    (function step(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      var v = Math.round(to * (1 - Math.pow(1 - t, 4)));
      el.textContent = pre + v;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- hover: inclinação 3D e luz que segue o mouse ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".glow").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
        if (el.classList.contains("tilt")) {
          el.classList.add("hovering");
          el.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
          el.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");
        }
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("hovering");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    /* botões magnéticos */
    document.querySelectorAll(".magnet").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect();
        var x = e.clientX - (b.left + b.width / 2), y = e.clientY - (b.top + b.height / 2);
        el.style.transform = "translate(" + (x * 0.25).toFixed(1) + "px," + (y * 0.35).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

    /* luz ambiente que acompanha o cursor */
    var cur = document.getElementById("cursor");
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
    (function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      cur.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- cena de abertura: textos sincronizados com a câmera ---------- */
  var beats = Array.prototype.map.call(document.querySelectorAll(".beat"), function (el) {
    return { el: el, a: +el.getAttribute("data-in"), b: +el.getAttribute("data-out") };
  });
  var hint = document.querySelector(".scroll-hint");
  if (window.BrittoStage) {
    window.BrittoStage.onProgress = function (p) {
      beats.forEach(function (bt) {
        var fade = 0.04;
        var o = Math.min(clamp((p - bt.a) / fade + (bt.a === 0 ? 1 : 0), 0, 1), clamp((bt.b - p) / fade, 0, 1));
        bt.el.style.opacity = o.toFixed(3);
        bt.el.classList.toggle("on", o > 0.01);
        var y = (1 - o) * (p < bt.a + fade ? 30 : -30);
        bt.el.firstElementChild.style.transform = "translateY(" + y.toFixed(1) + "px)";
      });
      hint.style.opacity = p < 0.04 ? 1 : 0;
      if (window.__atualizaWa) window.__atualizaWa();
    };
  }

  /* ---------- scroll: progresso, header, parallax, asterisco ---------- */
  var bar = document.getElementById("progress");
  var header = document.querySelector("header.top");
  var stage = document.getElementById("stage");
  var parallax = document.querySelectorAll("[data-parallax]");
  var apoAst = document.getElementById("apo-ast");
  var lastY = scrollY, ticking = false;
  var navBtns = Array.prototype.map.call(document.querySelectorAll('nav.menu a[href^="#"]'), function (b) {
    return { b: b, s: document.getElementById(b.getAttribute("href").slice(1)) };
  });
  /* o botão flutuante do WhatsApp sai de cena quando já há botões de contato na tela */
  var wa = document.getElementById("wa"), apo = document.getElementById("apoteose"), flowFinal = document.getElementById("flow-final");
  var heroBtns = document.querySelectorAll(".beat-1, .beat-final");
  function atualizaWa() {
    var fr = document.getElementById("mentorias").getBoundingClientRect();
    var noMetodo = fr.top < innerHeight && fr.bottom > 0;
    var esconder = apo.getBoundingClientRect().top < innerHeight - 40 || (noMetodo && flowFinal.classList.contains("on"));
    var sr = stage.getBoundingClientRect();
    if (sr.bottom > innerHeight * 0.5) heroBtns.forEach(function (b) { if (b.classList.contains("on") && +b.style.opacity > 0.3) esconder = true; });
    wa.classList.toggle("off", esconder);
  }
  window.__atualizaWa = atualizaWa;
  atualizaWa();

  function onScroll() {
    ticking = false;
    castScroll();
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0).toFixed(4) + ")";
    var pastStage = y > stage.offsetHeight - innerHeight;
    header.classList.toggle("solid", pastStage);
    if (performance.now() > navLock && !header.classList.contains("open")) {
      header.classList.toggle("hide", pastStage && y > lastY + 4 && y > stage.offsetHeight);
      if (y < lastY - 4) header.classList.remove("hide");
    }
    atualizaWa();
    lastY = y;
    if (!reduce) {
      parallax.forEach(function (el) {
        var b = el.parentElement.getBoundingClientRect();
        var c = b.top + b.height / 2 - innerHeight / 2;
        el.style.setProperty("--py", clamp(-c * +el.getAttribute("data-parallax"), -24, 24).toFixed(1) + "px");
      });
      if (apoAst) {
        var ab = apoAst.parentElement.getBoundingClientRect();
        apoAst.style.setProperty("--rot", (ab.top * 0.15).toFixed(1) + "deg");
      }
    }
    var cur = null;
    navBtns.forEach(function (n) { if (n.s && n.s.getBoundingClientRect().top < innerHeight * 0.4) cur = n; });
    navBtns.forEach(function (n) { var on = n === cur && !!cur && cur.s.getBoundingClientRect().bottom > 0; n.b.classList.toggle("on", on); if (on) n.b.setAttribute("aria-current", "true"); else n.b.removeAttribute("aria-current"); });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- quem é Gabriel Brito: o retrato acende e o nome corre atrás ---------- */
  var founder = document.getElementById("gabriel");
  var fPhoto = document.getElementById("founder-photo"), fName = document.getElementById("founder-name");
  var fImg = fPhoto.querySelector("img"), reel = document.getElementById("reel-track");
  fImg.addEventListener("load", function () { fPhoto.classList.remove("no-photo"); });
  fImg.src = fImg.getAttribute("data-src");
  function founderScroll() {
    var r = founder.getBoundingClientRect();
    var p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    var fr = fPhoto.getBoundingClientRect();
    founder.style.setProperty("--lit", reduce ? 1 : clamp((innerHeight - fr.top) / (innerHeight * 0.55), 0, 1).toFixed(3));
    if (!reduce) fName.style.setProperty("--nx", (-p * innerWidth * 0.8).toFixed(1) + "px");
    if (!reduce && innerWidth >= 900) {
      var max = Math.max(0, reel.scrollWidth - innerWidth);
      reel.style.setProperty("--rx", (-clamp((p - 0.3) / 0.6, 0, 1) * max).toFixed(1) + "px");
    }
  }
  window.addEventListener("scroll", founderScroll, { passive: true });
  founderScroll();

  /* ---------- para cada tipo de palco: o painel em foco se abre ---------- */
  var palcos = Array.prototype.slice.call(document.querySelectorAll(".palco"));
  function abrirPalco(el) { palcos.forEach(function (p) { p.classList.toggle("is-open", p === el); }); }
  palcos.forEach(function (p) {
    p.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") abrirPalco(p); });
    p.addEventListener("focus", function () { abrirPalco(p); });
    p.addEventListener("click", function () { abrirPalco(p); });
  });

  /* ---------- Matriz de Genialidade (demonstração) ---------- */
  var zonas = {
    E: { nome: "Estrategista", txt: "Você enxerga o todo e organiza caminhos. As pessoas te procuram para decidir.", sug: ["Mentoria", "Consultoria", "Palestra de liderança"] },
    C: { nome: "Comunicador", txt: "Você conecta pessoas pela fala e pelas histórias. Seu repertório nasce no palco.", sug: ["Palestra", "Imersão", "Treinamento"] },
    T: { nome: "Técnico", txt: "Você domina o como fazer. Seu conhecimento vira método passo a passo.", sug: ["Curso", "Workshop", "Mentoria técnica"] },
    H: { nome: "Inspirador", txt: "A sua história é o conteúdo. Sua trajetória mostra que é possível.", sug: ["Palestra de história", "Livro", "Evento autoral"] }
  };
  var perguntas = [
    { p: "Sobre o que as pessoas mais pedem a sua opinião?", o: [["Decisões de negócio e gestão", "E"], ["Como falar, vender e convencer", "C"], ["Detalhes da minha área técnica", "T"], ["Como eu cheguei até aqui", "H"]] },
    { p: "Em uma reunião, qual é o seu papel natural?", o: [["Definir a direção", "E"], ["Animar e engajar o grupo", "C"], ["Resolver o problema prático", "T"], ["Contar a experiência que já vivi", "H"]] },
    { p: "Qual elogio você mais escuta?", o: [["Você pensa lá na frente", "E"], ["Você fala muito bem", "C"], ["Você sabe tudo disso", "T"], ["Sua história me inspira", "H"]] },
    { p: "Se fosse ensinar amanhã, qual formato te atrai?", o: [["Mentoria com poucos empresários", "E"], ["Palestra para um auditório cheio", "C"], ["Curso com aulas práticas", "T"], ["Contar minha trajetória em um evento", "H"]] }
  ];
  var quiz = document.getElementById("quiz"), idx = 0, pts = { E: 0, C: 0, T: 0, H: 0 }, ordem = [];
  function render() {
    if (idx < perguntas.length) {
      var q = perguntas[idx];
      var h = '<span class="q">Pergunta ' + (idx + 1) + ' de ' + perguntas.length + '</span><span class="pergunta">' + esc(q.p) + '</span><div class="opts">';
      q.o.forEach(function (o) { h += '<button type="button" data-z="' + o[1] + '">' + esc(o[0]) + '</button>'; });
      h += '</div><div class="bar"><i style="width:' + (idx / perguntas.length * 100) + '%"></i></div>';
      quiz.innerHTML = h;
      quiz.querySelectorAll("button[data-z]").forEach(function (b) { b.addEventListener("click", function () { var z = b.getAttribute("data-z"); pts[z]++; ordem.push(z); idx++; render(); }); });
    } else {
      // maior pontuação; em empate, vale a resposta mais recente entre os empatados
      var max = Math.max.apply(null, Object.keys(pts).map(function (k) { return pts[k]; }));
      var top = ordem.slice().reverse().filter(function (k) { return pts[k] === max; })[0];
      var z = zonas[top];
      var msg = "Olá! Fiz a demonstração da Matriz de Genialidade no site da BRITTO* Experts e meu resultado foi " + z.nome + ". Quero fazer a Matriz completa.";
      quiz.innerHTML = '<span class="q">Sua zona de genialidade</span><span class="res-zona">' + esc(z.nome) + '</span><p class="res-txt">' + esc(z.txt) + '</p><div class="res-sug">' + z.sug.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join("") + '</div><div class="btns" style="margin-top:auto"><a class="btn" target="_blank" rel="noopener" href="' + waLink(msg) + '">Fazer a Matriz completa <span class="arr">→</span></a><button type="button" class="btn ghost" id="refazer">Refazer</button></div>';
      document.getElementById("refazer").addEventListener("click", function () { idx = 0; pts = { E: 0, C: 0, T: 0, H: 0 }; ordem = []; render(); });
    }
  }
  render();
})();
