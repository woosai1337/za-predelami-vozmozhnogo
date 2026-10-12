/* 3D-сцена героя: вращающаяся орнаментальная розетка в цветах флага РБ.
   Требует js/vendor/three.min.js (THREE глобально). */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.82));
  var keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
  keyLight.position.set(4, 7, 10);
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0xffe6cc, 0.55);
  rimLight.position.set(-7, -4, 7);
  scene.add(rimLight);

  /* --- орнаментальная розетка --- */
  var rosette = new THREE.Group();

  // лепесток-ромб: основание в центре, острие наружу (без пересечений)
  var petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.lineTo(0.30, 0.92);
  petalShape.lineTo(0, 1.85);
  petalShape.lineTo(-0.30, 0.92);
  petalShape.closePath();

  var petalGeo = new THREE.ExtrudeGeometry(petalShape, {
    depth: 0.13, bevelEnabled: true, bevelThickness: 0.035,
    bevelSize: 0.035, bevelSegments: 1, steps: 1
  });

  var redMat = new THREE.MeshStandardMaterial({ color: 0xd22730, roughness: 0.66, metalness: 0.04, flatShading: true });
  var deepRedMat = new THREE.MeshStandardMaterial({ color: 0xb41d27, roughness: 0.66, metalness: 0.04, flatShading: true });
  var goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.34, metalness: 0.45, flatShading: true });
  var greenMat = new THREE.MeshStandardMaterial({ color: 0x0a8a44, roughness: 0.45, metalness: 0.12, flatShading: true });
  var edgeMat = new THREE.LineBasicMaterial({ color: 0x9d7615, transparent: true, opacity: 0.5 });
  var petalEdges = new THREE.EdgesGeometry(petalGeo, 32);

  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2;
    var petal = new THREE.Mesh(petalGeo, i % 2 ? redMat : deepRedMat);
    petal.rotation.z = a - Math.PI / 2;
    rosette.add(petal);
    var outline = new THREE.LineSegments(petalEdges, edgeMat);
    outline.rotation.copy(petal.rotation);
    rosette.add(outline);
  }

  // золотая сердцевина, закрывающая стык лепестков
  var core = new THREE.Mesh(new THREE.SphereGeometry(0.23, 28, 20), goldMat);
  core.position.z = 0.02;
  rosette.add(core);

  var ringGold = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.024, 12, 220), goldMat);
  var ringGreen = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.014, 10, 220), greenMat);
  var ringThin = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.008, 8, 220), goldMat);
  rosette.add(ringGold);
  rosette.add(ringGreen);
  rosette.add(ringThin);
  rosette.rotation.x = -0.13;
  scene.add(rosette);

  /* --- летающие ромбы --- */
  var dust = new THREE.Group();
  var dustGeo = new THREE.OctahedronGeometry(0.08, 0);
  var dustMats = [goldMat, redMat, greenMat];
  var dustItems = [];
  for (var d = 0; d < 16; d++) {
    var dm = new THREE.Mesh(dustGeo, dustMats[d % 3]);
    var ang = (d / 16) * Math.PI * 2;
    dm.position.set(
      Math.cos(ang) * (3.0 + (d % 4) * 0.3),
      Math.sin(ang * 1.3) * (2.3 + (d % 3) * 0.4),
      -1.2 + (d % 5) * 0.55
    );
    dm.userData.phase = d * 0.7;
    dm.userData.base = dm.position.clone();
    dustItems.push(dm);
    dust.add(dm);
  }
  scene.add(dust);

  /* --- раскладка --- */
  var worldHeight = 2 * 9 * Math.tan(Math.PI / 8);
  var worldPerPx = 0.01;
  var objectDiameter = 5.1;

  function layout() {
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    worldPerPx = worldHeight / h;
    var narrow = w < 860;
    var targetPx = narrow ? Math.min(w * 0.66, 320) : Math.min(h * 0.52, w * 0.34);
    var scale = (targetPx * worldPerPx) / objectDiameter;

    rosette.scale.setScalar(scale);
    dust.scale.setScalar(scale);

    if (narrow) {
      rosette.position.set(0, h * 0.06 * worldPerPx, 0);
      dust.position.copy(rosette.position);
      dust.visible = false;
      canvas.style.opacity = '0.45';
    } else {
      rosette.position.set(w * 0.295 * worldPerPx, h * 0.012 * worldPerPx, 0);
      dust.position.copy(rosette.position);
      dust.visible = true;
      canvas.style.opacity = '1';
    }
    if (reduceMotion) renderFrame(0.6);
  }

  /* --- ввод и видимость --- */
  var mx = 0, my = 0;
  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }
  var visible = true;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; });
    io.observe(document.getElementById('top') || canvas);
  }

  var clock = new THREE.Clock();
  function renderFrame(t) {
    rosette.rotation.z = t * 0.18;
    rosette.rotation.x = -0.13 + (reduceMotion ? 0 : my * 0.15);
    rosette.rotation.y = reduceMotion ? 0 : mx * 0.2;
    ringGreen.rotation.z = -t * 0.32;
    ringThin.rotation.z = t * 0.26;
    core.rotation.y = t * 0.5;

    for (var k = 0; k < dustItems.length; k++) {
      var it = dustItems[k];
      it.position.y = it.userData.base.y + Math.sin(t * 0.8 + it.userData.phase) * 0.16;
      it.rotation.x = t * 0.5 + it.userData.phase;
      it.rotation.y = t * 0.4 + it.userData.phase;
    }
    var scrollK = (window.scrollY || 0) / (window.innerHeight * 3);
    rosette.rotation.z += scrollK * 0.5;
    renderer.render(scene, camera);
  }

  layout();
  window.addEventListener('resize', layout);

  if (reduceMotion) {
    renderFrame(0.6);
  } else {
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      renderFrame(clock.getElapsedTime());
    })();
  }
})();
