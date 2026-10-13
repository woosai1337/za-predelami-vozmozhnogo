/* Знак выставки: государственный флаг Республики Беларусь, развивающийся на ветру.
   Полотнище — процедурная текстура (CanvasTexture), волна — смещение вершин. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('flagCanvas');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 4 / 3, 0.1, 60);
  camera.position.set(0.55, 0.30, 5.2);
  camera.lookAt(0.05, 0.02, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.86));
  var keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(3, 4.5, 5);
  scene.add(keyLight);
  var fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
  fillLight.position.set(-4, -1.5, 3);
  scene.add(fillLight);

  /* --- полотнище: красное и зелёное поле + орнамент у древка --- */
  function makeFlagTexture() {
    var w = 1080, h = 540;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');

    g.fillStyle = '#d22630';
    g.fillRect(0, 0, w, Math.round(h * 2 / 3));
    g.fillStyle = '#009639';
    g.fillRect(0, Math.round(h * 2 / 3), w, h);

    var band = Math.round(w / 9);
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, band, h);

    g.fillStyle = '#d22630';
    function rhombus(cx, cy, rx, ry) {
      g.beginPath();
      g.moveTo(cx, cy - ry);
      g.lineTo(cx + rx, cy);
      g.lineTo(cx, cy + ry);
      g.lineTo(cx - rx, cy);
      g.closePath();
      g.fill();
    }
    var rows = 9, cellH = h / rows;
    for (var i = 0; i < rows; i++) {
      var cy = i * cellH + cellH / 2;
      var cx = band / 2;
      rhombus(cx, cy, band * 0.42, cellH * 0.44);
      g.fillStyle = '#ffffff';
      rhombus(cx, cy, band * 0.24, cellH * 0.26);
      g.fillStyle = '#d22630';
      rhombus(cx, cy, band * 0.11, cellH * 0.12);
      rhombus(0, cy, band * 0.14, cellH * 0.22);
      rhombus(band, cy, band * 0.14, cellH * 0.22);
      rhombus(cx, i * cellH, band * 0.16, cellH * 0.11);
    }

    var tex = new THREE.CanvasTexture(c);
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  var FLAG_W = 3.0, FLAG_H = 1.5, SEG_X = 80, SEG_Y = 34;
  var geo = new THREE.PlaneGeometry(FLAG_W, FLAG_H, SEG_X, SEG_Y);
  geo.translate(FLAG_W / 2, 0, 0);

  var cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map: makeFlagTexture(), side: THREE.DoubleSide, roughness: 0.94, metalness: 0.01
  }));

  var group = new THREE.Group();
  var POLE_X = -1.5;
  cloth.position.x = POLE_X;
  group.add(cloth);

  var pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.032, 2.15, 16),
    new THREE.MeshStandardMaterial({ color: 0x2b2921, roughness: 0.5, metalness: 0.28 })
  );
  pole.position.set(POLE_X, 0.02, 0);
  group.add(pole);

  var finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.062, 20, 14),
    new THREE.MeshStandardMaterial({ color: 0xb08a2e, roughness: 0.35, metalness: 0.5 })
  );
  finial.position.set(POLE_X, 1.12, 0);
  group.add(finial);

  group.rotation.y = -0.16;
  scene.add(group);

  var basePos = geo.attributes.position.array.slice();

  function wave(t) {
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var ix = i * 3;
      var u = basePos[ix] / FLAG_W;          // 0 у древка, 1 у свободного края
      var y = basePos[ix + 1];
      var z = Math.sin(u * 4.4 - t * 2.3) * 0.30 * u
            + Math.sin(u * 8.6 + y * 2.7 - t * 3.1) * 0.10 * u
            + Math.sin(y * 2.5 - t * 1.5) * 0.055 * u;
      pos.setZ(i, z);
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
    group.rotation.y = -0.16 + (reduceMotion ? 0 : mx * 0.14);
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
