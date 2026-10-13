/* Знак выставки: государственный флаг Республики Беларусь на ветру.
   Полотнище — официальный рисунок флага (Wikimedia Commons), вшитый как data URI.
   Волна — смещение вершин плоскости; древко — хромированная стойка. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('flagCanvas');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FLAG_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAzNzggMTg5Ij4KCTx0aXRsZT5GbGFnIG9mIEJlbGFydXM8L3RpdGxlPgoJPGRlZnM+CgkJPGNsaXBQYXRoIGlkPSJwIj4KCQkJPHBhdGggIGQ9Im0wIDBoMjAwdjYwOGg4djI4NGwtOCA4SDB6Ii8+CgkJPC9jbGlwUGF0aD4KCTwvZGVmcz4KCTxwYXRoIGZpbGw9IiNjZTE3MjAiIGQ9Im0wIDBoMzc4djE4OUgweiIvPgoJPGcgdHJhbnNmb3JtPSJtYXRyaXgoLjIxLDAsMCwuMjEsMiwwKSIgY2xpcC1wYXRoPSJ1cmwoI3ApIiBmaWxsPSIjZmZmIj4KCQk8ZyBpZD0iYiI+CgkJCTxwYXRoIGlkPSJhIiBkPSJtMzYgMHYxNGgtOXYxNEgxNnYxNkg4djEzSC04VjI0SDhWNkgtOFYwem0yNiA3N3YxNWgtOHYxMmgtOFY5MmgtOFY3N2gtOFY1N2g4VjQyaDhWMzBoOHYxMmg4djE1aDh2MjB6bS0xNy0xaDEwVjU4SDQ1ek0xOSAxODNoOHYtMThoLTh6bTU0IDBoOHYtMThoLTh6TS04IDMwNUg2djEzaDZ2MTZoOXYxNWgxMnYtMTVoOXYtMTZoOHYtMTNIMzh2LTE1aDIxdjEwaDEzdjE3aDExdjE5aC04djE0aC03djEzaC02djE0aC05djEyaC03djExaC05djE0SDI0di0xNWgtOXYtMTRIOHYtOUgtOHYtMjNIOHYtMjBILTh6Ii8+CgkJCTx1c2UgeGxpbms6aHJlZj0iI2EiIHRyYW5zZm9ybT0ibWF0cml4KC0xLDAsMCwxLDIwMCwwKSIvPgoJCQk8cGF0aCBkPSJtOTYgMHYzMmg4VjBoMzJ2MTRoLTh2MTRoLTEydjE2aC04djEzSDkyVjQ0aC04VjI4SDcyVjE0aC04VjB6bS0yIDI3NHYtMTFoLTZ2LTEzaC03di0xNGgtOHYtMTRoLTh2LTEwaC05di0xNEg0NHYxNGgtOXYxMGgtN3YxNGgtOHYxNGgtNnYxM0g4djE3SC04di00NEg4di0yMEgtOHYtMzNIOHYxNGgxMHYxNGgxMHYtMTRoMTB2LTE0aDh2LTE4aC04di0xNEgyOHYtMTRIMTh2MTRIOHYxNEgtOHYtNDFIOHYtMTlILThWNzdIOHYxM2g4djE2aDExdjEzaDl2MTVoN3YxMmgxNHYtMTJoN3YtMTVoOXYtMTNoMTFWOTBoOFY3N2gxNnYxM2g4djE2aDExdjEzaDl2MTVoN3YxMmgxNHYtMTJoN3YtMTVoOXYtMTNoMTFWOTBoOFY3N2gxNnYyOGgtMTZ2MTloMTZ2NDFoLTE2di0xNGgtMTB2LTE0aC0xMHYxNGgtMTB2MTRoLTh2MThoOHYxNGgxMHYxNGgxMHYtMTRoMTB2LTE0aDE2djMzaC0xNnYyMGgxNnY0NGgtMTZ2LTE3aC02di0xM2gtNnYtMTRoLTh2LTE0aC03di0xMGgtOXYtMTRoLTEydjE0aC05djEwaC04djE0aC04djE0aC03djEzaC02djExem0yLTE2N3YyN2g4di0yN3ptLTQgNTh2LTE0SDgydi0xNEg3MnYxNEg2MnYxNGgtOHYxOGg4djE0aDEwdjE0aDEwdi0xNGgxMHYtMTRoMTZ2MTRoMTB2MTRoMTB2LTE0aDEwdi0xNGg4di0xOGgtOHYtMTRoLTEwdi0xNGgtMTB2MTRoLTEwdjE0em00IDQ2djI3aDh2LTI3eiIvPgoJCTwvZz4KCQk8dXNlIHhsaW5rOmhyZWY9IiNiIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwwLDkwMCkiLz4KCQk8cGF0aCBkPSJtLTggNDA4SDh2MTRoN3Y4aDh2MTRoN3YxMmgtN3YxNGgtOHY4SDh2MTRILTh6bTIxNiAwdjg0aC0xNnYtMTRoLTd2LThoLTh2LTE0aC03di0xMmg3di0xNGg4di04aDd2LTE0ek02MiA0NTloOHYtMThoLTh6bTc2IDB2LTE4aC04djE4em0tNDItNTloOHYtMThoLTh6bTAgMTAwdjE4aDh2LTE4em0tNTAtNzVoMTR2LTExaDEwdi0xMGg1di0xMGg2di0xNGg4di0xNGg0di0xM2gxNHYxM2g0djE0aDh2MTRoNnYxMGg1djEwaDEwdjExaDE0djUwaC0xNHYxMWgtMTB2MTBoLTV2MTBoLTZ2MTRoLTh2MTRoLTR2MTNIOTN2LTEzaC00di0xNGgtOHYtMTRoLTZ2LTEwaC01di0xMEg2MHYtMTFINDZ6bTUwIDl2LTE1aC04di0xMGgtOHYyNWg4djloNXYxNGgtNXY5aC04djI1aDh2LTEwaDh2LTE1aDh2MTVoOHYxMGg4di0yNWgtOHYtOWgtNXYtMTRoNXYtOWg4di0yNWgtOHYxMGgtOHYxNXoiLz4KCTwvZz4KCTxwYXRoIGZpbGw9IiMwMDdjMzAiIGQ9Im00NCAxMjZoMzM0djYzSDQ0eiIvPgo8L3N2Zz4K';

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 4 / 3, 0.1, 60);
  camera.position.set(0.5, 0.26, 5.15);
  camera.lookAt(0.05, 0.0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.46));
  var keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
  keyLight.position.set(2.6, 3.6, 4.6);
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0xe4ecff, 0.62);
  rimLight.position.set(-3.6, -1.2, 2.4);
  scene.add(rimLight);

  /* --- полотнище --- */
  var TW = 1200, TH = 600;
  var texCanvas = document.createElement('canvas');
  texCanvas.width = TW; texCanvas.height = TH;
  var ctx = texCanvas.getContext('2d');
  // запасная отрисовка, если SVG ещё не загрузился
  ctx.fillStyle = '#ce1720';
  ctx.fillRect(0, 0, TW, Math.round(TH * 2 / 3));
  ctx.fillStyle = '#007c30';
  ctx.fillRect(0, Math.round(TH * 2 / 3), TW, TH);

  var texture = new THREE.CanvasTexture(texCanvas);
  if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  var img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, TW, TH);
    ctx.drawImage(img, 0, 0, TW, TH);
    texture.needsUpdate = true;
  };
  img.src = FLAG_SVG;

  var FLAG_W = 3.0, FLAG_H = 1.5, SEG_X = 96, SEG_Y = 40;
  var geo = new THREE.PlaneGeometry(FLAG_W, FLAG_H, SEG_X, SEG_Y);
  geo.translate(FLAG_W / 2, 0, 0);

  var cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map: texture, side: THREE.DoubleSide, roughness: 0.58, metalness: 0.0
  }));

  var group = new THREE.Group();
  var POLE_X = -1.5;
  cloth.position.x = POLE_X;
  group.add(cloth);

  var metal = new THREE.MeshStandardMaterial({ color: 0xb9bfc7, roughness: 0.22, metalness: 0.92 });
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 2.2, 20), metal);
  pole.position.set(POLE_X, 0.02, 0);
  group.add(pole);
  var finial = new THREE.Mesh(new THREE.SphereGeometry(0.075, 26, 18), metal);
  finial.position.set(POLE_X, 1.16, 0);
  group.add(finial);

  group.rotation.y = -0.2;
  scene.add(group);

  var basePos = geo.attributes.position.array.slice();

  function wave(t) {
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var ix = i * 3;
      var u = basePos[ix] / FLAG_W;           // 0 у древка, 1 у свободного края
      var y = basePos[ix + 1];
      var z = Math.sin(u * 5.0 - t * 2.2) * 0.34 * u
            + Math.sin(u * 9.5 + y * 4.0 - t * 3.3) * 0.15 * u
            + Math.sin(y * 3.2 - t * 1.5) * 0.08 * u;
      z += u * u * 0.14 * Math.sin(t * 0.65);   // загиб свободного края
      // закрутка полотнища вокруг продольной оси — как у настоящего флага
      var th = u * (0.42 + 0.22 * Math.sin(t * 0.55));
      var cy = y * Math.cos(th) - z * Math.sin(th);
      var cz = y * Math.sin(th) + z * Math.cos(th);
      pos.setZ(i, cz);
      pos.setY(i, cy - 0.07 * u * u);           // лёгкая провислость
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  function layout() {
    var w = canvas.clientWidth || 520;
    var h = canvas.clientHeight || 390;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  var mx = 0;
  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
    });
  }

  var visible = true;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; });
    io.observe(canvas);
  }

  var clock = new THREE.Clock();
  function draw(t) {
    wave(t);
    group.rotation.y = -0.2 + (reduceMotion ? 0 : mx * 0.14);
    renderer.render(scene, camera);
  }

  layout();
  window.addEventListener('resize', layout);

  if (reduceMotion) {
    draw(0.9);
  } else {
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      draw(clock.getElapsedTime());
    })();
  }
})();
