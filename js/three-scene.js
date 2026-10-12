/* Знак выставки: орнаментальная розетка. Спокойное вращение, плоские цвета. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var view = 6.2;
  var camera = new THREE.OrthographicCamera(-view / 2, view / 2, view / 2, -view / 2, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var light = new THREE.DirectionalLight(0xffffff, 0.55);
  light.position.set(3, 5, 8);
  scene.add(light);

  var group = new THREE.Group();

  var shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.32, 0.95);
  shape.lineTo(0, 1.9);
  shape.lineTo(-0.32, 0.95);
  shape.closePath();

  var geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.10, bevelEnabled: true, bevelThickness: 0.03,
    bevelSize: 0.03, bevelSegments: 1, steps: 1
  });

  var red = new THREE.MeshLambertMaterial({ color: 0xcf1f2e, flatShading: true });
  var redDeep = new THREE.MeshLambertMaterial({ color: 0xa91622, flatShading: true });
  var gold = new THREE.MeshLambertMaterial({ color: 0xb08a2e, flatShading: true });
  var green = new THREE.MeshLambertMaterial({ color: 0x0d7a44, flatShading: true });

  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2;
    var petal = new THREE.Mesh(geo, i % 2 ? red : redDeep);
    petal.rotation.z = a - Math.PI / 2;
    group.add(petal);
  }

  var core = new THREE.Mesh(new THREE.CircleGeometry(0.28, 36), gold);
  core.position.z = 0.07;
  group.add(core);

  var ring = new THREE.Mesh(new THREE.TorusGeometry(2.14, 0.02, 10, 190), green);
  group.add(ring);
  var ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.44, 0.011, 8, 190), gold);
  group.add(ring2);

  scene.add(group);

  function layout() {
    var w = canvas.clientWidth || 320;
    var h = canvas.clientHeight || 320;
    renderer.setSize(w, h, false);
    var aspect = w / h, half = view / 2;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
  }

  var visible = true;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; });
    io.observe(canvas);
  }

  var clock = new THREE.Clock();
  function draw(t) {
    group.rotation.z = -t * 0.055;
    ring.rotation.z = t * 0.04;
    ring2.rotation.z = -t * 0.03;
    renderer.render(scene, camera);
  }

  layout();
  window.addEventListener('resize', layout);

  if (reduceMotion) {
    draw(0);
  } else {
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      draw(clock.getElapsedTime());
    })();
  }
})();
