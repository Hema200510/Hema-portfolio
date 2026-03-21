/* ═══════════════════════════════════════
   HEMA G — PORTFOLIO JavaScript
   main.js
═══════════════════════════════════════ */

/* ──────────────────────────────
   3D BACKGROUND — Three.js
────────────────────────────── */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.z = 32;

  /* Particle field */
  const N = 2200;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 110;
    pos[i*3+1] = (Math.random() - 0.5) * 110;
    pos[i*3+2] = (Math.random() - 0.5) * 70;
    const r = Math.random();
    if      (r < 0.33) { col[i*3]=0;    col[i*3+1]=0.83; col[i*3+2]=1;    }
    else if (r < 0.66) { col[i*3]=0.49; col[i*3+1]=0.23; col[i*3+2]=0.93; }
    else               { col[i*3]=0.06; col[i*3+1]=0.73; col[i*3+2]=0.51; }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.65 });
  scene.add(new THREE.Points(geo, mat));

  /* DNA helix */
  function makeHelix(offsetX, offsetZ, color1, color2) {
    const group = new THREE.Group();
    for (let strand = 0; strand < 2; strand++) {
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * Math.PI * 10;
        pts.push(new THREE.Vector3(
          Math.cos(t + strand * Math.PI) * 2.8,
          (i / 120) * 48 - 24,
          Math.sin(t + strand * Math.PI) * 2.8
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tGeo = new THREE.TubeGeometry(curve, 240, 0.035, 6, false);
      const tMat = new THREE.MeshBasicMaterial({ color: strand === 0 ? color1 : color2, transparent: true, opacity: 0.45 });
      group.add(new THREE.Mesh(tGeo, tMat));
    }
    /* rungs */
    for (let i = 0; i < 25; i++) {
      const t = (i / 25) * Math.PI * 10;
      const y = (i / 25) * 48 - 24;
      const rGeo = new THREE.CylinderGeometry(0.018, 0.018, 5.6, 4);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.28 });
      const rung = new THREE.Mesh(rGeo, rMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, y, 0);
      group.add(rung);
    }
    group.position.set(offsetX, 0, offsetZ);
    return group;
  }

  const helix1 = makeHelix(14, -8, 0x00d4ff, 0x7c3aed);
  const helix2 = makeHelix(-16, -12, 0x10b981, 0x00d4ff);
  scene.add(helix1);
  scene.add(helix2);

  /* Mouse parallax */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;
    helix1.rotation.y = t * 0.4;
    helix2.rotation.y = -t * 0.3;
    camera.position.x += (mx * 2.5 - camera.position.x) * 0.022;
    camera.position.y += (-my * 2.5 - camera.position.y) * 0.022;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ──────────────────────────────
   CUSTOM CURSOR
────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let cx = 0, cy = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

  function tick() {
    dot.style.left  = cx - 5  + 'px';
    dot.style.top   = cy - 5  + 'px';
    rx += (cx - rx) * 0.13;
    ry += (cy - ry) * 0.13;
    ring.style.left = rx - 17 + 'px';
    ring.style.top  = ry - 17 + 'px';
    requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll('a, button, .project-card, .cert-card, .achievement-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '52px'; ring.style.height = '52px';
      ring.style.borderColor = 'rgba(0,212,255,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '34px'; ring.style.height = '34px';
      ring.style.borderColor = 'rgba(0,212,255,0.55)';
    });
  });
})();

/* ──────────────────────────────
   SCROLL REVEAL
────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        /* animate skill bars on reveal */
        e.target.querySelectorAll('.skill-fill[data-width]').forEach(bar => {
          bar.style.width = bar.dataset.width;
        });
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

  /* Stagger children in grids */
  document.querySelectorAll('.projects-grid, .skills-grid, .certs-grid, .achievements-grid').forEach(grid => {
    [...grid.children].forEach((child, i) => {
      child.style.transitionDelay = (i * 0.08) + 's';
    });
  });
})();

/* ──────────────────────────────
   NAV ACTIVE LINK ON SCROLL
────────────────────────────── */
(function initNavActive() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => observer.observe(s));
})();

/* ──────────────────────────────
   TYPED HERO SUBTITLE
────────────────────────────── */
(function initTyped() {
  const el = document.getElementById('typed-role');
  if (!el) return;
  const roles = [
    'Biomedical Engineer',
    'Healthcare Innovator',
    'Medical Device Builder',
    'AI Healthcare Researcher',
    'Embedded Systems Developer'
  ];
  let ri = 0, ci = 0, deleting = false;
  function tick() {
    const current = roles[ri];
    el.textContent = deleting ? current.slice(0, ci--) : current.slice(0, ci++);
    if (!deleting && ci > current.length) { deleting = true; setTimeout(tick, 1400); return; }
    if (deleting && ci < 0)              { deleting = false; ri = (ri + 1) % roles.length; ci = 0; }
    setTimeout(tick, deleting ? 45 : 80);
  }
  tick();
})();

/* ──────────────────────────────
   SMOOTH SCROLL for nav links
────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
