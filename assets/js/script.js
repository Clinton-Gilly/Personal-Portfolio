/*==============================================================
  Clinton Kiplagat — Portfolio
  No dependencies. The 3D in the hero is a hand-rolled software
  renderer drawing to a 2D canvas — no WebGL, no libraries.
==============================================================*/
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/*--------------------------------------------------------------
  Preloader
--------------------------------------------------------------*/
(() => {
  const pre = $('[data-preloader]');
  if (!pre) return;

  const finish = () => {
    pre.classList.add('is-done');
    document.body.classList.remove('is-locked');
    setTimeout(() => pre.remove(), 700);
  };

  document.body.classList.add('is-locked');
  window.addEventListener('load', () => setTimeout(finish, reducedMotion ? 0 : 550));
  // Safety net: never trap the page behind the preloader.
  setTimeout(finish, 3500);
})();

/*--------------------------------------------------------------
  Scroll progress bar
--------------------------------------------------------------*/
(() => {
  const bar = $('[data-progress]');
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

/*--------------------------------------------------------------
  Sticky header
--------------------------------------------------------------*/
(() => {
  const header = $('[data-header]');
  if (!header) return;

  const update = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

/*--------------------------------------------------------------
  Mobile drawer
--------------------------------------------------------------*/
(() => {
  const burger = $('[data-burger]');
  const drawer = $('[data-drawer]');
  if (!burger || !drawer) return;

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  };

  burger.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
  $$('[data-drawer-link]', drawer).forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();

/*--------------------------------------------------------------
  Scroll reveal
--------------------------------------------------------------*/
(() => {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  items.forEach(el => el.style.setProperty('--d', el.dataset.revealDelay || 0));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => io.observe(el));
})();

/*--------------------------------------------------------------
  Animated counters
--------------------------------------------------------------*/
(() => {
  const nums = $$('[data-count]');
  if (!nums.length) return;

  const run = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';

    if (reducedMotion) { el.textContent = target + suffix; return; }

    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
})();

/*--------------------------------------------------------------
  Nav: scroll spy + sliding pill
--------------------------------------------------------------*/
(() => {
  const links = $$('[data-nav]');
  const pill = $('[data-nav-pill]');
  if (!links.length) return;

  const movePill = (link) => {
    if (!pill || !link) return;
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    pill.classList.add('is-on');
  };

  const setActive = (id) => {
    let active = null;
    links.forEach(link => {
      const on = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', on);
      if (on) active = link;
    });
    movePill(active);
  };

  const sections = links
    .map(l => document.getElementById(l.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] });

    sections.forEach(s => io.observe(s));
  }

  setActive('top');
  window.addEventListener('resize', () => {
    movePill(links.find(l => l.classList.contains('is-active')));
  });
})();

/*--------------------------------------------------------------
  Project filter
--------------------------------------------------------------*/
(() => {
  const buttons = $$('[data-filter]');
  const cards = $$('.proj');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.filter;

      buttons.forEach(b => b.classList.toggle('is-active', b === btn));

      cards.forEach((card, i) => {
        const show = value === 'all' || card.dataset.cat === value;
        card.classList.remove('is-entering');

        if (!show) { card.classList.remove('is-shown'); return; }

        card.classList.add('is-shown');
        if (reducedMotion) return;
        // Restart the entrance animation with a small stagger.
        void card.offsetWidth;
        card.style.animationDelay = `${Math.min(i, 9) * 35}ms`;
        card.classList.add('is-entering');
      });
    });
  });
})();

/*--------------------------------------------------------------
  3D tilt on cards (mouse perspective)
--------------------------------------------------------------*/
(() => {
  if (reducedMotion || !finePointer) return;

  $$('[data-tilt]').forEach(el => {
    const MAX = 8; // degrees
    let raf = null;

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateZ(6px)`;
      });
    };

    const reset = () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      el.style.transform = '';
    };

    el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', () => { el.style.transition = 'transform .12s linear'; });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      reset();
    });
  });
})();

/*--------------------------------------------------------------
  Custom cursor + magnetic buttons
--------------------------------------------------------------*/
(() => {
  if (reducedMotion || !finePointer) return;

  const ring = $('[data-cursor]');
  const dot = $('[data-cursor-dot]');
  if (!ring || !dot) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  }, { passive: true });

  const loop = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();

  const hoverables = 'a, button, [data-tilt], .trusted-list li, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) ring.classList.add('is-big');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) ring.classList.remove('is-big');
  });

  // magnetic pull
  $$('[data-magnet]').forEach(el => {
    const STRENGTH = 0.28;

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * STRENGTH}px, ${y * STRENGTH}px)`;
    });

    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/*--------------------------------------------------------------
  HERO 3D — hand-rolled wireframe renderer
  Rotating icosahedron + depth-sorted particle field, projected
  onto a 2D canvas. Pure maths, zero dependencies.
--------------------------------------------------------------*/
(() => {
  const canvas = $('[data-canvas]');
  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* ---- geometry: icosahedron ---- */
  const PHI = (1 + Math.sqrt(5)) / 2;

  const raw = [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1]
  ];

  // Normalise onto the unit sphere so it scales predictably.
  const norm = Math.hypot(1, PHI);
  const verts = raw.map(([x, y, z]) => ({ x: x / norm, y: y / norm, z: z / norm }));

  // Edges = every vertex pair at the minimum separation.
  const edges = [];
  let min = Infinity;
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(verts[i].x - verts[j].x, verts[i].y - verts[j].y, verts[i].z - verts[j].z);
      if (d < min - 1e-6) min = d;
    }
  }
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(verts[i].x - verts[j].x, verts[i].y - verts[j].y, verts[i].z - verts[j].z);
      if (Math.abs(d - min) < 1e-6) edges.push([i, j]);
    }
  }

  /* ---- particle field ---- */
  const PARTICLES = 120;
  const stars = Array.from({ length: PARTICLES }, () => {
    // Uniform points on a sphere shell, then pushed outward a bit.
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 1.5 + Math.random() * 1.3;
    return { x: s * Math.cos(t) * r, y: s * Math.sin(t) * r, z: u * r, tw: Math.random() * Math.PI * 2 };
  });

  /* ---- sizing ---- */
  let W = 0, H = 0, dpr = 1, scale = 1;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(W, H) * 0.3;
  };

  resize();
  window.addEventListener('resize', resize);

  /* ---- pointer parallax ---- */
  let tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;

  if (finePointer) {
    window.addEventListener('mousemove', (e) => {
      aimX = (e.clientY / window.innerHeight - 0.5) * 0.55;
      aimY = (e.clientX / window.innerWidth - 0.5) * 0.9;
    }, { passive: true });
  }

  /* ---- projection ---- */
  const CAM = 3.4;      // camera distance along +z
  const FOV = 2.3;

  const project = (p, sinX, cosX, sinY, cosY) => {
    // rotate around Y, then X
    const x1 = p.x * cosY + p.z * sinY;
    const z1 = -p.x * sinY + p.z * cosY;
    const y2 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;

    const depth = CAM - z2;
    if (depth <= 0.1) return null;

    const k = (FOV * scale) / depth;
    return { x: W / 2 + x1 * k, y: H / 2 + y2 * k, z: z2, k };
  };

  /* ---- render loop ---- */
  let running = true;
  let t = 0;

  const io = new IntersectionObserver(([entry]) => { running = entry.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) running = true;
  });

  const frame = () => {
    requestAnimationFrame(frame);
    if (!running || document.hidden) return;

    t += 0.0042;
    tiltX += (aimX - tiltX) * 0.045;
    tiltY += (aimY - tiltY) * 0.045;

    const ax = tiltX + Math.sin(t * 0.7) * 0.16;
    const ay = t * 1.5 + tiltY;

    const sinX = Math.sin(ax), cosX = Math.cos(ax);
    const sinY = Math.sin(ay), cosY = Math.cos(ay);

    ctx.clearRect(0, 0, W, H);

    /* particles — behind and around the solid */
    for (const s of stars) {
      const p = project(s, sinX, cosX, sinY, cosY);
      if (!p) continue;
      s.tw += 0.03;
      const near = Math.max(0, Math.min(1, (p.z + 2.8) / 5.6));
      const alpha = (0.1 + near * 0.4) * (0.65 + Math.sin(s.tw) * 0.35);
      const size = 0.5 + near * 1.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${alpha.toFixed(3)})`;
      ctx.fill();
    }

    /* project the solid once, reuse for edges + vertices */
    const pts = verts.map(v => project(v, sinX, cosX, sinY, cosY));

    /* edges — nearer edges are brighter and thicker */
    ctx.lineCap = 'round';
    for (const [i, j] of edges) {
      const a = pts[i], b = pts[j];
      if (!a || !b) continue;

      const mid = (a.z + b.z) / 2;
      const near = Math.max(0, Math.min(1, (mid + 1) / 2));
      const alpha = 0.07 + near * 0.5;

      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, `rgba(168, 132, 42, ${alpha.toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(246, 220, 138, ${(alpha * 1.15).toFixed(3)})`);
      grad.addColorStop(1, `rgba(168, 132, 42, ${alpha.toFixed(3)})`);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.4 + near * 1.2;
      ctx.stroke();
    }

    /* vertices — glowing gold nodes */
    for (const p of pts) {
      if (!p) continue;
      const near = Math.max(0, Math.min(1, (p.z + 1) / 2));
      const r = 1.2 + near * 2.6;

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
      glow.addColorStop(0, `rgba(246, 220, 138, ${(0.35 + near * 0.5).toFixed(3)})`);
      glow.addColorStop(1, 'rgba(212, 175, 55, 0)');

      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 244, 214, ${(0.4 + near * 0.6).toFixed(3)})`;
      ctx.fill();
    }
  };

  requestAnimationFrame(frame);
})();

/*--------------------------------------------------------------
  Contact form — submit to Web3Forms without leaving the page
--------------------------------------------------------------*/
(() => {
  const form = $('[data-form]');
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const label = btn ? btn.querySelector('span') : null;
  const original = label ? label.textContent : '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    if (btn) btn.disabled = true;
    if (label) label.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      if (label) label.textContent = 'Message sent ✓';
      form.reset();
    } catch (err) {
      console.error(err);
      if (label) label.textContent = 'Failed — email me instead';
    } finally {
      setTimeout(() => {
        if (btn) btn.disabled = false;
        if (label) label.textContent = original;
      }, 3600);
    }
  });
})();

/*--------------------------------------------------------------
  Footer year
--------------------------------------------------------------*/
(() => {
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
