/* Эмблема выставки: орнаментальная розетка в оформлении «печатной» графики.
   Подключается к canvas#emblemCanvas. Требует js/vendor/three.min.js. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('emblemCanvas');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var view = 5.6;
  var camera = new THREE.OrthographicCamera(-view / 2, view / 2, view / 2, -view / 2, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.AmbientLight(0xffffff, 0.86));
  var sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(3, 5, 8);
  scene.add(sun);

  var rosette = new THREE.Group();

  var petal = new THREE.Shape();
  petal.moveTo(0, 0);
  petal.lineTo(0.30, 0.92);
  petal.lineTo(0, 1.85);
  petal.lineTo(-0.30, 0.92);
  petal.closePath();

  var petalGeo = new THREE.ExtrudeGeometry(petal, {
    depth: 0.09, bevelEnabled: true, bevelThickness: 0.026,
    bevelSize: 0.026, bevelSegments: 1, steps: 1
  });

  var red = new THREE.MeshLambertMaterial({ color: 0xc8102e, flatShading: true });
  var redDeep = new THREE.MeshLambertMaterial({ color: 0xa20c25, flatShading: true });
  var gold = new THREE.MeshLambertMaterial({ color: 0xa8842c, flatShading: true });
  var green = new THREE.MeshLambertMaterial({ color: 0x00713c, flatShading: true });

  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2;
    var m = new THREE.Mesh(petalGeo, i % 2 ? red : redDeep);
    m.rotation.z = a - Math.PI / 2;
    rosette.add(m);
  }

  var core = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), gold);
  core.position.z = 0.06;
  rosette.add(core);

  var ring = new THREE.Mesh(new THREE.TorusGeometry(2.06, 0.022, 10, 180), green);
  rosette.add(ring);
  var ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.34, 0.012, 8, 180), gold);
  rosette.add(ring2);

  scene.add(rosette);

  function layout() {
    var box = canvas.parentNode;
    var w = (box && box.clientWidth) || 300;
    var h = (box && box.clientHeight) || 300;
    renderer.setSize(w, h, false);
    var aspect = w / h;
    var half = view / 2;
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
    rosette.rotation.z = -t * 0.07;
    ring.rotation.z = t * 0.05;
    ring2.rotation.z = -t * 0.04;
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
