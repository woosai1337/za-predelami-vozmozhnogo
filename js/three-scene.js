/* 3D-сцена героя: орнаментальный узел в цветах флага РБ.
   Требует js/vendor/three.min.js (THREE глобально). */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isNarrow = window.innerWidth < 860;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  var key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 6, 6);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffffff, 0.7);
  fill.position.set(-5, -3, 4);
  scene.add(fill);
  var redLight = new THREE.PointLight(0xd22730, 28, 40);
  redLight.position.set(-5, -2, 3);
  scene.add(redLight);
  var greenLight = new THREE.PointLight(0x00843d, 28, 40);
  greenLight.position.set(5, 2, 3);
  scene.add(greenLight);

  var group = new THREE.Group();

  var knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.5, 0.4, 220, 30, 2, 3),
    new THREE.MeshStandardMaterial({ color: 0xd22730, roughness: 0.22, metalness: 0.55 })
  );
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.05, 16, 180),
    new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.28, metalness: 0.85 })
  );
  ring.rotation.x = Math.PI / 2.6;
  var ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.62, 0.035, 12, 180),
    new THREE.MeshBasicMaterial({ color: 0x00843d, transparent: true, opacity: 0.45 })
  );
  ring2.rotation.x = Math.PI / 1.85;
  group.add(knot);
  group.add(ring);
  group.add(ring2);

  // звёздная пыль
  var N = 300;
  var positions = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    var r = 3.1 + Math.random() * 3.6;
    var th = Math.random() * Math.PI * 2;
    var ph = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
    positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    positions[i * 3 + 2] = r * Math.cos(ph) * 0.75;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xc9a227, size: 0.05, transparent: true, opacity: 0.9, sizeAttenuation: true
  }));
  scene.add(points);
  scene.add(group);

  function layout() {
    isNarrow = window.innerWidth < 860;
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (isNarrow) {
      group.position.set(0, 0.6, 0);
      group.scale.setScalar(Math.min(1.05, w / 560));
      camera.position.set(0, 0, 12);
      points.visible = false;
      canvas.style.opacity = '0.4';
    } else {
      group.position.set(2.9, 0, 0);
      group.scale.setScalar(Math.min(1.35, w / 1350));
      camera.position.set(0, 0, 9);
      points.visible = true;
      canvas.style.opacity = '1';
    }
  }
  layout();
  window.addEventListener('resize', layout);

  var mx = 0, my = 0;
  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  var visible = true;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    });
    io.observe(document.getElementById('top') || canvas);
  }

  function renderFrame(t) {
    knot.rotation.x = t * 0.22 + (reduceMotion ? 0 : my * 0.3);
    knot.rotation.y = t * 0.34 + (reduceMotion ? 0 : mx * 0.4);
    ring.rotation.z = t * 0.14;
    ring2.rotation.z = -t * 0.1;
    points.rotation.y = t * 0.05;
    points.rotation.x = t * 0.03;
    var scrollK = window.scrollY || 0;
    group.rotation.y = (scrollK / (window.innerHeight * 2)) * 1.2;
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    renderFrame(0.8);
  } else {
    var start = performance.now();
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      renderFrame((now - start) / 1000);
    })(start);
  }
})();
