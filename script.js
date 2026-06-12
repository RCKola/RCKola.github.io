(() => {
  // ===== Theme Toggle =====
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ===== Navbar scroll =====
  const navbar = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });

  // ===== Scroll fade-in =====
  const faders = document.querySelectorAll(
    '.section-title, .pub-card, .project-card, .about-text, .about-interests, .contact-content'
  );
  faders.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  faders.forEach(el => observer.observe(el));

  // ===== Interactive 3D Point Cloud on Canvas =====
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;
  let mouseX = 0, mouseY = 0;
  let points = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / w - 0.5) * 2;
    mouseY = (e.clientY / h - 0.5) * 2;
  });

  const POINT_COUNT = 120;
  const CONNECT_DIST = 150;

  class Point {
    constructor() {
      this.x = Math.random() * 2 - 1;
      this.y = Math.random() * 2 - 1;
      this.z = Math.random() * 2 - 1;
      this.vx = (Math.random() - 0.5) * 0.002;
      this.vy = (Math.random() - 0.5) * 0.002;
      this.vz = (Math.random() - 0.5) * 0.002;
    }

    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;

      if (Math.abs(this.x) > 1.2) this.vx *= -1;
      if (Math.abs(this.y) > 1.2) this.vy *= -1;
      if (Math.abs(this.z) > 1.2) this.vz *= -1;
    }

    project(rotX, rotY) {
      let x = this.x, y = this.y, z = this.z;

      // Rotate Y
      let cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // Rotate X
      let cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      let scale = 2 / (3 + z2);
      return {
        sx: x1 * scale * Math.min(w, h) * 0.3 + w / 2,
        sy: y1 * scale * Math.min(w, h) * 0.3 + h / 2,
        scale,
        z: z2
      };
    }
  }

  for (let i = 0; i < POINT_COUNT; i++) {
    points.push(new Point());
  }

  let time = 0;
  function animate() {
    time += 0.005;
    ctx.clearRect(0, 0, w, h);

    const rotY = time * 0.3 + mouseX * 0.4;
    const rotX = Math.sin(time * 0.2) * 0.3 + mouseY * 0.3;

    const projected = points.map((p, i) => {
      p.update(time);
      return { ...p.project(rotX, rotY), idx: i };
    });

    projected.sort((a, b) => a.z - b.z);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const baseColor = isLight ? [40, 60, 160] : [108, 138, 255];

    // Draw connections
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const a = projected[i], b = projected[j];
        const dx = a.sx - b.sx, dy = a.sy - b.sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = `rgba(${baseColor.join(',')},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw points
    for (const p of projected) {
      const r = Math.max(1.5, p.scale * 2.5);
      const alpha = 0.3 + p.scale * 0.3;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor.join(',')},${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
