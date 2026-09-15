/* ============================================================
   Udyam – Master JavaScript Engine
   Vanilla JS – Responsive, Interactive, Futuristic
   ============================================================ */

'use strict';

const configuredApiBaseUrl = window.UDYAM_API_BASE_URL || (
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? ''
    : 'https://ai-sport-coach-1.onrender.com'
);
const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

/* ──────────────────────────────────────────────────────────
   1. LOCAL STORAGE & DATA LAYER
   ────────────────────────────────────────────────────────── */

function getUser() {
  try {
    const raw = localStorage.getItem('Udyam_user');
    return raw ? JSON.parse(raw) : {
      name: 'Alex Vance',
      age: 24,
      gender: 'male',
      height: 178,
      weight: 72,
      UdyamnessLevel: 'Intermediate',
      activityLevel: 'Moderately Active',
      sport: 'Running',
      goal: 'General Udyamness',
      duration: '45',
      equipment: 'Minimal (Dumbbells/Bands)',
      diet: 'Standard'
    };
  } catch (e) {
    return { name: 'Athlete', age: 25, height: 175, weight: 70, goal: 'General Udyamness', sport: 'Running' };
  }
}

function saveUser(data) {
  const current = getUser();
  const updated = { ...current, ...data };
  localStorage.setItem('Udyam_user', JSON.stringify(updated));
  return updated;
}

function getProgress() {
  try {
    const raw = localStorage.getItem('Udyam_progress');
    return raw ? JSON.parse(raw) : {
      calories: 1450,
      workoutMin: 180,
      streak: 5,
      points: 1250,
      completedWorkouts: 8,
      exercisesDone: 36,
      weeklyDays: [45, 60, 30, 0, 75, 45, 60],
      challengeProgress: { c1: 3, c2: 2, c3: 5, c4: 1, c5: 3, c6: 2 },
      badges: ['Beginner', 'Rising Star', 'Udyamness Warrior']
    };
  } catch (e) {
    return {
      calories: 1450, workoutMin: 180, streak: 5, points: 1250,
      completedWorkouts: 8, exercisesDone: 36, weeklyDays: [45, 60, 30, 0, 75, 45, 60],
      challengeProgress: {}, badges: ['Beginner']
    };
  }
}

function saveProgress(data) {
  const current = getProgress();
  const updated = { ...current, ...data };
  localStorage.setItem('Udyam_progress', JSON.stringify(updated));
  return updated;
}

function getActivities() {
  try {
    const raw = localStorage.getItem('Udyam_activities');
    return raw ? JSON.parse(raw) : [
      { text: 'Completed 30-min High Intensity Run', pts: 60, icon: 'fa-person-running', color: '#3b82f6', time: new Date(Date.now() - 3600000 * 2).toISOString() },
      { text: 'Earned "Udyamness Warrior" Badge', pts: 200, icon: 'fa-shield-halved', color: '#8b5cf6', time: new Date(Date.now() - 3600000 * 5).toISOString() },
      { text: 'Completed AI Posture Analysis in Cricket', pts: 80, icon: 'fa-brain', color: '#10b981', time: new Date(Date.now() - 3600000 * 22).toISOString() },
      { text: 'Logged 3.5L Daily Hydration Goal', pts: 40, icon: 'fa-droplet', color: '#06b6d4', time: new Date(Date.now() - 3600000 * 30).toISOString() },
      { text: 'Generated Customized Nutrition Plan', pts: 50, icon: 'fa-utensils', color: '#f59e0b', time: new Date(Date.now() - 3600000 * 48).toISOString() }
    ];
  } catch (e) {
    return [];
  }
}

function addActivity(text, pts = 0, icon = 'fa-bolt', color = '#3b82f6') {
  const acts = getActivities();
  acts.unshift({ text, pts, icon, color, time: new Date().toISOString() });
  localStorage.setItem('Udyam_activities', JSON.stringify(acts.slice(0, 25)));
}

/* ──────────────────────────────────────────────────────────
   2. UI HELPERS & NOTIFICATIONS
   ────────────────────────────────────────────────────────── */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }

function showToast(msg, type = 'info', duration = 3500) {
  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = {
    success: 'fa-circle-check',
    info: 'fa-circle-info',
    warn: 'fa-triangle-exclamation'
  };
  const colors = {
    success: '#10b981',
    info: '#3b82f6',
    warn: '#f59e0b'
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || 'fa-bell'}" style="color:${colors[type] || '#3b82f6'};font-size:1.1rem"></i>
    <span>${msg}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'Recently';
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 2) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

/* ──────────────────────────────────────────────────────────
   3. NAVIGATION & MOBILE MENU
   ────────────────────────────────────────────────────────── */

function initGlobalNav() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobile-nav');

  // Scroll glassmorphism effect
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Hamburger drawer
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    $$('.mobile-nav .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active page link detection
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || ((currentPath === '' || currentPath === '/') && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Dynamic user avatar/name on nav if element exists
  const user = getUser();
  $$('.nav-user-name').forEach(el => { el.textContent = user.name || 'Athlete'; });
}

/* ──────────────────────────────────────────────────────────
   4. HOME PAGE (index.html)
   ────────────────────────────────────────────────────────── */

function initHomePage() {
  // Animated Stat Counters
  $$('.stat-counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 100;
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 50));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 20);
  });

  // Rotating Hero Text
  const typeEl = $('#hero-type-target');
  if (typeEl) {
    const phrases = [
      'Sports Coaching',
      'Posture Analysis',
      'Personalized Nutrition',
      'Daily Workout Plans',
      'Gamified Challenges'
    ];
    let pIdx = 0, cIdx = 0, isDeleting = false;
    setInterval(() => {
      const phrase = phrases[pIdx];
      if (!isDeleting) {
        typeEl.textContent = phrase.slice(0, cIdx + 1);
        cIdx++;
        if (cIdx === phrase.length) isDeleting = true;
      } else {
        typeEl.textContent = phrase.slice(0, cIdx - 1);
        cIdx--;
        if (cIdx === 0) {
          isDeleting = false;
          pIdx = (pIdx + 1) % phrases.length;
        }
      }
    }, 120);
  }

  // Smooth anchor scroll
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────
   5. DASHBOARD PAGE (dashboard.html)
   ────────────────────────────────────────────────────────── */

function initDashboardPage() {
  const user = getUser();
  const progress = getProgress();

  // Welcome user name
  const nameEl = $('#dash-user-name');
  if (nameEl) nameEl.textContent = user.name || 'Athlete';

  // Current Date
  const dateEl = $('#dash-current-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  // Rotating Motivation
  const quoteEl = $('#dash-motivational-quote');
  if (quoteEl) {
    const quotes = [
      '"The body achieves what the mind believes."',
      '"Success starts with self-discipline."',
      '"Small daily improvements over time lead to stunning results."',
      '"Champions keep playing until they get it right."',
      '"Your only limit is you. Train smart, stay strong."'
    ];
    quoteEl.textContent = randChoice(quotes);
  }

  // Metrics animation
  animateCounter('#dash-cal-val', 0, progress.calories, 1000);
  animateCounter('#dash-time-val', 0, progress.workoutMin, 900);
  animateCounter('#dash-streak-val', 0, progress.streak, 700);
  animateCounter('#dash-points-val', 0, progress.points, 1200);

  // Weekly Activity Chart
  const days = progress.weeklyDays || [45, 60, 30, 0, 75, 45, 60];
  const maxDay = Math.max(...days, 1);
  $$('.chart-bar-item').forEach((bar, idx) => {
    const min = days[idx] !== undefined ? days[idx] : 30;
    setTimeout(() => {
      bar.style.height = `${Math.round((min / maxDay) * 100)}%`;
      bar.setAttribute('data-val', `${min}m`);
    }, idx * 100);
  });

  // Recent Activity Feed
  const feedEl = $('#dash-activity-feed');
  if (feedEl) {
    const activities = getActivities();
    feedEl.innerHTML = activities.slice(0, 5).map(act => `
      <div class="activity-row flex-between" style="padding:14px;background:rgba(255,255,255,0.03);border:1px solid var(--clr-border);border-radius:var(--radius-md);margin-bottom:10px">
        <div class="flex gap-4" style="align-items:center">
          <div style="width:38px;height:38px;border-radius:10px;background:${act.color}22;color:${act.color};display:flex;align-items:center;justify-content:center;font-size:0.95rem">
            <i class="fa-solid ${act.icon}"></i>
          </div>
          <div>
            <div style="font-weight:600;font-size:0.92rem">${act.text}</div>
            <div style="font-size:0.78rem;color:var(--clr-text-dim)">${formatTimeAgo(act.time)}</div>
          </div>
        </div>
        ${act.pts ? `<span style="font-family:var(--font-tech);font-weight:700;color:var(--clr-orange);font-size:0.9rem">+${act.pts} pts</span>` : ''}
      </div>
    `).join('');
  }

  // Badges showcase
  const badgesEl = $('#dash-badges-grid');
  if (badgesEl) {
    const allBadges = [
      { id: 'Beginner', icon: '🌱', label: 'Beginner', desc: 'Started Udyamness journey' },
      { id: 'Rising Star', icon: '⭐', label: 'Rising Star', desc: '5+ Workouts completed' },
      { id: 'Udyamness Warrior', icon: '⚔️', label: 'Warrior', desc: 'Maintained 5-day streak' },
      { id: 'Sports Champion', icon: '🏆', label: 'Champion', desc: 'Mastered AI Sports coaching' }
    ];
    const earned = progress.badges || ['Beginner'];
    badgesEl.innerHTML = allBadges.map(b => {
      const isEarned = earned.includes(b.id);
      return `
        <div class="card" style="text-align:center;padding:18px;opacity:${isEarned ? 1 : 0.4};border-color:${isEarned ? 'var(--clr-border-glow)' : 'var(--clr-border)'}">
          <div style="font-size:2.2rem;margin-bottom:6px">${b.icon}</div>
          <div style="font-family:var(--font-display);font-weight:700;font-size:0.9rem">${b.label}</div>
          <div style="font-size:0.75rem;color:var(--clr-text-muted);margin-top:2px">${b.desc}</div>
          <div style="margin-top:8px">
            <span class="badge ${isEarned ? 'badge-green' : 'badge-outline'}" style="font-size:0.7rem;padding:3px 10px">
              ${isEarned ? 'UNLOCKED' : 'LOCKED'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function animateCounter(selector, from, to, duration) {
  const el = $(selector);
  if (!el) return;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * ease);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ──────────────────────────────────────────────────────────
   6. AI SPORTS COACH – VIDEO UPLOAD & ANALYSIS (ai-coach.html)
   ────────────────────────────────────────────────────────── */

const DRILLS_DB = {
  Cricket: [
    { title: 'Batting Stance & Backlift', desc: 'Align eyes level, feet shoulder-width apart and keep hands close to ribcage.', focus: 'Balance & Head Position' },
    { title: 'Cover Drive Footwork', desc: 'Step forward toward pitch of the ball, high elbow, transfer weight smoothly.', focus: 'Front-foot Commitment' },
    { title: 'Bowling Action Mechanics', desc: 'Maintain vertical spine angle and synchronized front-arm pull down.', focus: 'Shoulder Alignment' }
  ],
  Football: [
    { title: 'First Touch & Directional Control', desc: 'Cushion incoming pass with inside of foot, prepare ball for next step.', focus: 'Ankle Lock & Body Lean' },
    { title: 'Shooting Accuracy & Form', desc: 'Place non-kicking foot beside ball, strike center with laces, follow through.', focus: 'Hip Rotation' },
    { title: 'Agility Cone Dribbling', desc: 'Low center of gravity, rapid micro-touches using both feet.', focus: 'Change of Direction' }
  ],
  Badminton: [
    { title: 'Overhead Smash Technique', desc: 'Rotate shoulders fully, contact birdie at highest point, snap wrist down.', focus: 'Power Transfer' },
    { title: 'Net Kill & Recovery', desc: 'Lunge forward quickly, tap birdie steeply downwards, recover to base center.', focus: 'Footwork Speed' },
    { title: 'Backhand Clear Execution', desc: 'Thumb grip on flat bevel, turn back to net, generate whip from forearm.', focus: 'Grip Transition' }
  ],
  Basketball: [
    { title: 'Free-Throw Shooting Pocket', desc: 'BEEF (Balance, Eyes, Elbow, Follow-through), hold release till ball lands.', focus: 'Arc Consistency' },
    { title: 'Crossover Dribble Rhythm', desc: 'Drop hips, pound ball low below knee height, explode off plant foot.', focus: 'Deceleration' },
    { title: 'Defensive Slide Posture', desc: 'Wide base, chest up, arms extended wide, slide without crossing feet.', focus: 'Lateral Quickness' }
  ],
  Running: [
    { title: 'Cadence & Midfoot Strike', desc: 'Aim for 170-180 strides per minute, land softly beneath your center of mass.', focus: 'Impact Reduction' },
    { title: 'Upper Body Relaxation', desc: 'Keep shoulders dropped, 90° elbow swing forward and back, unclench hands.', focus: 'Energy Conservation' },
    { title: 'Hill Sprint Posture', desc: 'Drive knees upward, lean slightly into the slope from ankles, power arms.', focus: 'Glute Drive' }
  ],
  Tennis: [
    { title: 'Forehand Topspin Drive', desc: 'Low-to-high racket trajectory, brush back of the ball, wrap finish over shoulder.', focus: 'Wrist Snap' },
    { title: 'Serve Trophy Pose', desc: 'Deep knee bend, non-dominant arm points at ball, racket head drops behind back.', focus: 'Kinetic Chain' },
    { title: 'Split-Step Reaction Drill', desc: 'Hop lightly as opponent makes contact, react explosively in direction of shot.', focus: 'Court Anticipation' }
  ]
};

const SPORT_VIDEO_FEEDBACKS = {
  Cricket: [
    { title: 'Batting & Stance Alignment', text: 'Good body positioning and balanced center of gravity during setup.', type: 'positive' },
    { title: 'Front Elbow & Drive', text: 'Excellent technique on high-elbow elevation. High extension drives power.', type: 'positive' },
    { title: 'Weight Transfer', text: 'Improve your balance on the follow-through stride to maintain crisp stroke control.', type: 'info' },
    { title: 'Follow-Through Motion', text: 'Try improving your follow-through by keeping your head still over the contact point.', type: 'warn' }
  ],
  Football: [
    { title: 'Plant Foot Placement', text: 'Good body positioning relative to the ball before striking.', type: 'positive' },
    { title: 'Strike Execution', text: 'Excellent technique with clean ankle lock and compact striking motion.', type: 'positive' },
    { title: 'Movement Timing', text: 'Your movement timing can be improved during the final deceleration step.', type: 'info' },
    { title: 'Hip Rotation & Follow-Through', text: 'Try improving your follow-through with a fluid hip swivel towards the target.', type: 'warn' }
  ],
  Badminton: [
    { title: 'Overhead Preparation', text: 'Keep your posture stable during the initial racket backswing.', type: 'positive' },
    { title: 'Smash Contact Point', text: 'Excellent technique contacting the shuttlecock at peak vertical reach.', type: 'positive' },
    { title: 'Footwork Deceleration', text: 'Improve your balance during the deep court lunge recovery.', type: 'warn' },
    { title: 'Wrist Pronation', text: 'Good body positioning and rapid forearm snap generated high shuttle velocity.', type: 'positive' }
  ],
  Basketball: [
    { title: 'Shooting Pocket Base', text: 'Good body positioning with squared shoulders and balanced stance.', type: 'positive' },
    { title: 'Release Arc & Apex', text: 'Excellent technique with high release pocket and smooth upward energy transfer.', type: 'positive' },
    { title: 'Release Timing', text: 'Your movement timing can be improved by releasing precisely at jump apex.', type: 'info' },
    { title: 'Follow-Through Hold', text: 'Try improving your follow-through by holding the wrist snap until ball arrives at the hoop.', type: 'warn' }
  ],
  Running: [
    { title: 'Torso & Spine Posture', text: 'Keep your posture stable with a slight forward lean from the ankles.', type: 'positive' },
    { title: 'Foot Strike Mechanics', text: 'Excellent technique landing softly midfoot beneath your center of gravity.', type: 'positive' },
    { title: 'Arm Drive Cadence', text: 'Your movement timing can be improved by syncing 90-degree elbow swings with stride rhythm.', type: 'info' },
    { title: 'Upper Body Relaxation', text: 'Improve your balance by relaxing the trapezius and shoulder girdle.', type: 'warn' }
  ],
  Tennis: [
    { title: 'Unit Turn Preparation', text: 'Good body positioning and early shoulder coil before ball arrival.', type: 'positive' },
    { title: 'Racket Path & Topspin', text: 'Excellent technique with smooth low-to-high racket acceleration.', type: 'positive' },
    { title: 'Weight Transfer', text: 'Keep your posture stable when transferring weight through contact zone.', type: 'info' },
    { title: 'Finish & Recovery', text: 'Try improving your follow-through over opposite shoulder for maximum control.', type: 'warn' }
  ]
};

let currentCoachSport = 'Football';
let uploadedSportsVideoFile = null;
let uploadedSportsVideoUrl = null;
let isAnalyzingVideo = false;

function initAICoachPage() {
  // Sport Selection Cards
  $$('.sport-select-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.sport === 'Cricket' || card.dataset.sport === 'Tennis') {
        showToast(`${card.dataset.sport} analysis is not available in the AI backend yet. Choose Football, Badminton, Basketball or Running.`, 'warn', 5000);
        return;
      }
      $$('.sport-select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentCoachSport = card.dataset.sport;
      renderSportDetails(currentCoachSport);

      // If results were already shown, re-generate for new sport
      if ($('#video-feedback-results') && !$('#video-feedback-results').classList.contains('hidden')) {
        renderVideoAnalysisResults(currentCoachSport);
      }
    });
  });

  // Video Upload Triggers
  const fileInput = $('#sports-video-input');
  const triggerBtn = $('#btn-trigger-upload');
  const dropzone = $('#video-dropzone');
  const changeBtn = $('#btn-change-video');
  const removeBtn = $('#btn-remove-video');
  const analyzeBtn = $('#btn-analyze-video');
  const reanalyzeBtn = $('#btn-reanalyze-video');

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (changeBtn && fileInput) {
    changeBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleSelectedSportsVideo(file);
    });
  }

  // Drag & Drop Handlers
  if (dropzone) {
    dropzone.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length > 0) {
        handleSelectedSportsVideo(files[0]);
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', clearSelectedSportsVideo);
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', startSportsVideoAnalysis);
  }

  if (reanalyzeBtn) {
    reanalyzeBtn.addEventListener('click', startSportsVideoAnalysis);
  }

  // Initial render
  renderSportDetails(currentCoachSport);
}

function handleSelectedSportsVideo(file) {
  if (!file) return;

  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/mov', 'video/avi'];
  const isVideo = file.type.startsWith('video/') || validTypes.includes(file.type.toLowerCase()) || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);

  if (!isVideo) {
    showToast('Please select a valid sports video file (MP4, WebM, MOV).', 'warn', 4000);
    return;
  }

  // Clean up any old object URL
  if (uploadedSportsVideoUrl) {
    URL.revokeObjectURL(uploadedSportsVideoUrl);
  }

  uploadedSportsVideoFile = file;
  uploadedSportsVideoUrl = URL.createObjectURL(file);

  const videoPlayer = $('#sports-video-player');
  const uploadArea = $('#video-upload-area');
  const previewContainer = $('#video-preview-container');
  const nameEl = $('#uploaded-video-name');
  const sizeEl = $('#uploaded-video-size');
  const statusBadge = $('#video-status-badge');
  const analyzeBtn = $('#btn-analyze-video');
  const reanalyzeBtn = $('#btn-reanalyze-video');
  const feedbackContainer = $('#video-feedback-results');
  const loadingContainer = $('#video-analysis-loading');

  if (videoPlayer) {
    videoPlayer.src = uploadedSportsVideoUrl;
    videoPlayer.load();
  }

  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    sizeEl.textContent = `${sizeMb} MB · Video Loaded · Ready for Analysis`;
  }

  if (uploadArea) uploadArea.classList.add('hidden');
  if (previewContainer) previewContainer.classList.remove('hidden');
  if (feedbackContainer) feedbackContainer.classList.add('hidden');
  if (loadingContainer) loadingContainer.classList.add('hidden');

  if (statusBadge) {
    statusBadge.textContent = 'Video Ready';
    statusBadge.className = 'badge badge-green';
  }

  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.removeAttribute('title');
    analyzeBtn.classList.remove('hidden');
  }

  if (reanalyzeBtn) reanalyzeBtn.classList.add('hidden');

  // Reset ratings to waiting state
  setScoreHUD('#circle-tech', '#val-tech', 0);
  setScoreHUD('#circle-mov', '#val-mov', 0);
  setScoreHUD('#circle-perf', '#val-perf', 0);
  if ($('#overall-score-badge')) {
    $('#overall-score-badge').textContent = 'Ready to Analyze';
    $('#overall-score-badge').className = 'badge badge-blue';
  }

  showToast(`Video "${file.name}" loaded! Click "Analyze Video" to start.`, 'success', 3500);
}

function clearSelectedSportsVideo() {
  if (uploadedSportsVideoUrl) {
    URL.revokeObjectURL(uploadedSportsVideoUrl);
    uploadedSportsVideoUrl = null;
  }
  uploadedSportsVideoFile = null;

  const fileInput = $('#sports-video-input');
  const videoPlayer = $('#sports-video-player');
  const uploadArea = $('#video-upload-area');
  const previewContainer = $('#video-preview-container');
  const statusBadge = $('#video-status-badge');
  const analyzeBtn = $('#btn-analyze-video');
  const reanalyzeBtn = $('#btn-reanalyze-video');
  const feedbackContainer = $('#video-feedback-results');
  const loadingContainer = $('#video-analysis-loading');

  if (fileInput) fileInput.value = '';
  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
  }

  if (uploadArea) uploadArea.classList.remove('hidden');
  if (previewContainer) previewContainer.classList.add('hidden');
  if (feedbackContainer) feedbackContainer.classList.add('hidden');
  if (loadingContainer) loadingContainer.classList.add('hidden');

  if (statusBadge) {
    statusBadge.textContent = 'Upload Ready';
    statusBadge.className = 'badge badge-blue';
  }

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.setAttribute('title', 'Please upload a sports video first');
    analyzeBtn.classList.remove('hidden');
  }

  if (reanalyzeBtn) reanalyzeBtn.classList.add('hidden');

  setScoreHUD('#circle-tech', '#val-tech', 0);
  setScoreHUD('#circle-mov', '#val-mov', 0);
  setScoreHUD('#circle-perf', '#val-perf', 0);
  if ($('#overall-score-badge')) {
    $('#overall-score-badge').textContent = 'Awaiting Video';
    $('#overall-score-badge').className = 'badge badge-outline';
  }

  showToast('Video removed.', 'info', 2000);
}

async function startSportsVideoAnalysis() {
  if (!uploadedSportsVideoFile && !uploadedSportsVideoUrl) {
    showToast('Please select or upload a sports video first.', 'warn');
    return;
  }

  if (isAnalyzingVideo) return;
  isAnalyzingVideo = true;

  const loadingEl = $('#video-analysis-loading');
  const feedbackEl = $('#video-feedback-results');
  const statusText = $('#video-analysis-status-text');
  const progressBar = $('#video-analysis-progress-bar');
  const analyzeBtn = $('#btn-analyze-video');
  const reanalyzeBtn = $('#btn-reanalyze-video');
  const statusBadge = $('#video-status-badge');

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (feedbackEl) feedbackEl.classList.add('hidden');
  if (analyzeBtn) analyzeBtn.disabled = true;
  if (reanalyzeBtn) reanalyzeBtn.classList.add('hidden');
  if (statusBadge) {
    statusBadge.textContent = 'Analyzing...';
    statusBadge.className = 'badge badge-outline';
  }

  if (statusText) statusText.textContent = 'Uploading video to the AI engine...';
  if (progressBar) progressBar.style.width = '35%';

  try {
    const formData = new FormData();
    formData.append('file', uploadedSportsVideoFile);
    formData.append('user_id', getUser().name || 'browser-athlete');
    const backendSport = currentCoachSport === 'Running' ? 'athletics' : currentCoachSport.toLowerCase();
    const response = await fetch(`${API_BASE_URL}/api/analyze/${backendSport}`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(180000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || 'Analysis failed.');

    if (loadingEl) loadingEl.classList.add('hidden');
    if (feedbackEl) feedbackEl.classList.remove('hidden');
    if (analyzeBtn) analyzeBtn.classList.add('hidden');
    if (reanalyzeBtn) reanalyzeBtn.classList.remove('hidden');
    if (statusBadge) {
      statusBadge.textContent = 'Analysis Complete';
      statusBadge.className = 'badge badge-green';
    }
    renderBackendAnalysisResults(result);
    if (result.analysis_mode === 'degraded' && result.warning) {
      showToast(result.warning, 'warn', 9000);
    }
    const pts = 100;
    const prog = getProgress();
    saveProgress({ points: prog.points + pts, calories: prog.calories + 45 });
    addActivity(`Uploaded & Analyzed ${currentCoachSport} sports video`, pts, 'fa-film', '#10b981');
    showToast(`AI Video Analysis completed! +${pts} Points awarded!`, 'success', 4500);
  } catch (error) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (analyzeBtn) analyzeBtn.disabled = false;
    if (statusBadge) {
      statusBadge.textContent = 'Analysis Failed';
      statusBadge.className = 'badge badge-outline';
    }
    const message = error.name === 'TimeoutError'
      ? 'The analysis took too long. Try a shorter video and try again.'
      : error instanceof TypeError
      ? `AI backend is not reachable${API_BASE_URL ? ` at ${API_BASE_URL}` : ''}. Please try again in a moment.`
      : (error.message || 'Could not analyze the video.');
    showToast(message, 'warn', 7000);
  } finally {
    isAnalyzingVideo = false;
  }
}

function renderBackendAnalysisResults(result) {
  const components = result.components || {};
  const overall = Number(result.overall_score || 0);
  const techniqueScore = averageValues([
    components.lower_body_technique,
    components.kicking_posture
  ]) || overall;
  const movementScore = averageValues([
    components.movement,
    components.running_ability,
    components.consistency
  ]) || overall;
  const performanceScore = averageValues([
    components.balance,
    components.ball_control,
    components.ball_interaction
  ]) || overall;
  setScoreHUD('#circle-tech', '#val-tech', Math.round(techniqueScore));
  setScoreHUD('#circle-mov', '#val-mov', Math.round(movementScore));
  setScoreHUD('#circle-perf', '#val-perf', Math.round(performanceScore));
  const overallBadge = $('#overall-score-badge');
  if (overallBadge) {
    overallBadge.textContent = `${overall}% Overall Score`;
    overallBadge.className = overall >= 60 ? 'badge badge-green' : 'badge badge-blue';
  }
  const items = [
    ...(result.strengths || []).map(text => ({ title: 'Strength', text, type: 'positive' })),
    ...(result.weaknesses || []).map(text => ({ title: 'Needs Improvement', text, type: 'warn' })),
    ...(result.recommendations || []).map(text => ({ title: 'Recommendation', text, type: 'info' }))
  ];
  const feedbackList = $('#ai-video-feedback-list');
  if (feedbackList) {
    feedbackList.innerHTML = items.map(item => {
      const color = item.type === 'positive' ? '#10b981' : item.type === 'warn' ? '#f59e0b' : '#3b82f6';
      const icon = item.type === 'positive' ? 'fa-circle-check' : item.type === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-info';
      return `<div style="background:rgba(255,255,255,0.03);border-left:4px solid ${color};border-radius:var(--radius-sm);padding:14px 16px;display:flex;align-items:flex-start;gap:12px"><i class="fa-solid ${icon}" style="color:${color};font-size:1.15rem;margin-top:2px"></i><div><div style="font-weight:700;font-size:0.92rem;color:var(--clr-text);margin-bottom:2px">${item.title}</div><div style="font-size:0.86rem;color:var(--clr-text-muted)">${item.text}</div></div></div>`;
    }).join('');
  }
  renderCompleteBackendResponse(result);
}

function averageValues(values) {
  const numbers = values.filter(value => typeof value === 'number' && Number.isFinite(value));
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatBackendValue(value) {
  if (value === null || value === undefined) return '<span style="color:var(--clr-text-dim)">Not available</span>';
  if (typeof value !== 'object') return escapeHtml(value);
  if (Array.isArray(value)) {
    if (!value.length) return '<span style="color:var(--clr-text-dim)">None</span>';
    return `<div style="display:grid;gap:6px">${value.map((item, index) => `<div><span style="color:var(--clr-text-dim)">${index + 1}.</span> ${formatBackendValue(item)}</div>`).join('')}</div>`;
  }
  return `<div style="display:grid;gap:6px">${Object.entries(value).map(([key, item]) => `
    <div style="display:grid;grid-template-columns:minmax(150px, 0.35fr) 1fr;gap:12px;border-bottom:1px solid var(--clr-border);padding:5px 0">
      <span style="color:var(--clr-text-muted)">${escapeHtml(key.replaceAll('_', ' '))}</span>
      <span style="overflow-wrap:anywhere">${formatBackendValue(item)}</span>
    </div>`).join('')}</div>`;
}

function renderCompleteBackendResponse(result) {
  const details = $('#backend-analysis-details');
  if (!details) return;
  const sections = [
    ['Analysis summary', {
      success: result.success,
      sport: result.sport,
      analysis_mode: result.analysis_mode,
      overall_score: result.overall_score,
      kick_events_detected: result.kick_events_detected,
      warning: result.warning,
      runtime_error: result.runtime_error
    }],
    ['Component scores', result.components],
    ['Pose quality', result.pose_quality],
    ['Object detection quality', result.object_detection_quality],
    ['Extracted features', result.features],
    ['Running features', result.running_features],
    ['Ball control features', result.ball_control_features],
    ['Kicking features', result.kicking_features],
    ['Saved performance', result.saved_performance]
  ].filter(([, value]) => value !== undefined);
  details.innerHTML = `
    <div style="font-family:var(--font-display);font-weight:800;margin-bottom:10px;color:var(--clr-cyan)">
      Complete backend analysis output
    </div>
    <div style="display:grid;gap:10px">
      ${sections.map(([title, value]) => `
        <details style="border:1px solid var(--clr-border);border-radius:var(--radius-sm);padding:10px 12px">
          <summary style="cursor:pointer;font-weight:700;color:var(--clr-text)">${escapeHtml(title)}</summary>
          <div style="margin-top:8px;font-size:0.82rem;color:var(--clr-text-muted)">${formatBackendValue(value)}</div>
        </details>`).join('')}
    </div>`;
}

function renderVideoAnalysisResults(sport) {
  const techVal = randInt(88, 96);
  const movVal = randInt(84, 95);
  const perfVal = randInt(87, 97);
  const overallVal = Math.round((techVal + movVal + perfVal) / 3);

  setScoreHUD('#circle-tech', '#val-tech', techVal);
  setScoreHUD('#circle-mov', '#val-mov', movVal);
  setScoreHUD('#circle-perf', '#val-perf', perfVal);

  const overallBadge = $('#overall-score-badge');
  if (overallBadge) {
    overallBadge.textContent = `${overallVal}% Optimal Technique`;
    overallBadge.className = overallVal >= 90 ? 'badge badge-green' : 'badge badge-blue';
  }

  const feedbackList = $('#ai-video-feedback-list');
  if (feedbackList) {
    const feedbacks = SPORT_VIDEO_FEEDBACKS[sport] || SPORT_VIDEO_FEEDBACKS['Cricket'];
    feedbackList.innerHTML = feedbacks.map(item => {
      const typeColor = item.type === 'positive' ? '#10b981' : item.type === 'warn' ? '#f59e0b' : '#3b82f6';
      const typeIcon = item.type === 'positive' ? 'fa-circle-check' : item.type === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-info';
      return `
        <div style="background:rgba(255,255,255,0.03);border-left:4px solid ${typeColor};border-radius:var(--radius-sm);padding:14px 16px;display:flex;align-items:flex-start;gap:12px">
          <i class="fa-solid ${typeIcon}" style="color:${typeColor};font-size:1.15rem;margin-top:2px"></i>
          <div>
            <div style="font-weight:700;font-size:0.92rem;color:var(--clr-text);margin-bottom:2px">${item.title}</div>
            <div style="font-size:0.86rem;color:var(--clr-text-muted)">${item.text}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderSportDetails(sport) {
  const titleEl = $('#selected-sport-title');
  const drillsEl = $('#sport-drills-list');
  if (titleEl) titleEl.textContent = `${sport} AI Coaching Hub`;

  if (drillsEl) {
    const drills = DRILLS_DB[sport] || DRILLS_DB['Cricket'];
    drillsEl.innerHTML = drills.map((d, i) => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid var(--clr-border);border-radius:var(--radius-md);padding:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-weight:700;font-size:0.95rem;color:var(--clr-text)">${i + 1}. ${d.title}</span>
          <span class="badge badge-blue" style="font-size:0.72rem">${d.focus}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--clr-text-muted)">${d.desc}</p>
      </div>
    `).join('');
  }
}

function setScoreHUD(circleSelector, valSelector, score) {
  const circle = $(circleSelector);
  const val = $(valSelector);
  if (val) val.textContent = score > 0 ? `${score}%` : '--';
  if (circle) {
    const color = score >= 88 ? '#10b981' : score >= 75 ? '#3b82f6' : score > 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)';
    circle.style.setProperty('--pct', `${score}%`);
    circle.style.background = score > 0
      ? `conic-gradient(${color} ${score}%, rgba(255,255,255,0.06) 0%)`
      : `conic-gradient(rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.06) 0%)`;
  }
}

/* ──────────────────────────────────────────────────────────
   7. WORKOUT GENERATOR (workout.html)
   ────────────────────────────────────────────────────────── */

const WORKOUT_CATALOG = {
  'Weight Loss': {
    warmup: [
      { name: 'Jumping Jacks', reps: '3 mins', cal: 30, desc: 'Keep arms fully extended, land on balls of feet.' },
      { name: 'High Knees', reps: '2 mins', cal: 25, desc: 'Drive knees up toward chest with rapid tempo.' }
    ],
    main: [
      { name: 'Bodyweight Burpees', reps: '3 sets × 12 reps', cal: 65, desc: 'Chest to floor, explode upward with high jump.' },
      { name: 'Mountain Climbers', reps: '3 sets × 30 secs', cal: 45, desc: 'Keep core braced, alternate knees dynamically.' },
      { name: 'Jump Squats', reps: '3 sets × 15 reps', cal: 55, desc: 'Deep squat into explosive vertical leap.' },
      { name: 'Plank Shoulder Taps', reps: '3 sets × 20 reps', cal: 35, desc: 'Minimize hip rotation while tapping opposite shoulders.' }
    ],
    cooldown: [
      { name: 'Forward Fold & Hamstring Stretch', reps: '2 mins', cal: 5, desc: 'Breathe deeply, relax neck and lower back.' },
      { name: 'Deep Diaphragmatic Breathing', reps: '2 mins', cal: 0, desc: 'Slow 4-second inhale, 6-second exhale.' }
    ]
  },
  'Muscle Building': {
    warmup: [
      { name: 'Arm Circles & Shoulder Dislocations', reps: '2 mins', cal: 15, desc: 'Activate rotator cuff muscles smoothly.' },
      { name: 'Bodyweight Squats', reps: '2 sets × 15 reps', cal: 25, desc: 'Warm up hip joints and knees.' }
    ],
    main: [
      { name: 'Diamond / Standard Push-Ups', reps: '4 sets × 12 reps', cal: 50, desc: 'Full range of motion, elbows at 45 degrees.' },
      { name: 'Bulgarian Split Squats', reps: '4 sets × 10 reps/leg', cal: 65, desc: 'Elevate rear foot, descend deep with upright chest.' },
      { name: 'Inverted Bodyweight Rows / Pull-Ups', reps: '4 sets × 8-10 reps', cal: 55, desc: 'Drive elbows back, squeeze shoulder blades.' },
      { name: 'Bodyweight Pike Push-Ups', reps: '3 sets × 10 reps', cal: 40, desc: 'Target anterior deltoids and upper chest.' },
      { name: 'Weighted / Body Glute Bridges', reps: '3 sets × 15 reps', cal: 35, desc: 'Squeeze glutes hard at peak contraction.' }
    ],
    cooldown: [
      { name: 'Doorway Chest Stretch', reps: '2 mins', cal: 5, desc: 'Open pectorals and anterior shoulders.' },
      { name: 'Quad & Hip Flexor Stretch', reps: '2 mins', cal: 5, desc: 'Stretch hip flexors to restore mobility.' }
    ]
  },
  'General Udyamness': {
    warmup: [
      { name: 'Jump Rope / Light Jog', reps: '3 mins', cal: 25, desc: 'Elevate heart rate and core temperature.' },
      { name: 'Torso Twists & Hip Openers', reps: '2 mins', cal: 15, desc: 'Mobilize spinal column and pelvis.' }
    ],
    main: [
      { name: 'Air Squats', reps: '3 sets × 15 reps', cal: 40, desc: 'Sit back into heels, knees tracking toes.' },
      { name: 'Push-Ups (Knee or Standard)', reps: '3 sets × 12 reps', cal: 35, desc: 'Rigid plank line from head to heels.' },
      { name: 'Reverse Walking Lunges', reps: '3 sets × 12 reps/leg', cal: 45, desc: 'Step backwards with controlled deceleration.' },
      { name: 'Forearm Plank Hold', reps: '3 sets × 45 secs', cal: 30, desc: 'Engage transverse abdominis and glutes.' }
    ],
    cooldown: [
      { name: 'Cobra to Child’s Pose Flow', reps: '3 mins', cal: 10, desc: 'Gentle spinal extension and flexion.' }
    ]
  },
  'Sports Performance': {
    warmup: [
      { name: 'Agility Ladder Simulation', reps: '4 mins', cal: 35, desc: 'High-frequency footwork drills.' },
      { name: 'Dynamic Leg Swings', reps: '2 mins', cal: 15, desc: 'Front-to-back and lateral hip mobility.' }
    ],
    main: [
      { name: 'Plyometric Box / Tuck Jumps', reps: '4 sets × 8 reps', cal: 70, desc: 'Maximum explosive power, land softly.' },
      { name: 'Lateral Bounds (Skater Hops)', reps: '4 sets × 12 reps', cal: 55, desc: 'Develop lateral force production and deceleration.' },
      { name: 'Medicine Ball / Slam Simulation', reps: '4 sets × 15 reps', cal: 50, desc: 'Triple extension power from hips.' },
      { name: 'Sprint Interval Shuttles', reps: '6 sets × 20m', cal: 75, desc: 'Max acceleration with quick turnaround.' }
    ],
    cooldown: [
      { name: 'Sport-Specific Mobility Stretch', reps: '4 mins', cal: 10, desc: 'Full lower body and thoracic mobility.' }
    ]
  },
  'Flexibility': {
    warmup: [
      { name: 'Cat-Cow Spinal Waves', reps: '3 mins', cal: 10, desc: 'Sync breath with gentle spinal flexion.' },
      { name: 'World’s Greatest Stretch', reps: '3 mins', cal: 15, desc: 'Lunge with thoracic rotation and hamstring reach.' }
    ],
    main: [
      { name: 'Deep Pigeon Pose', reps: '3 sets × 60 secs/side', cal: 20, desc: 'Release tension in piriformis and glutes.' },
      { name: 'Seated Straddle Forward Fold', reps: '3 sets × 45 secs', cal: 15, desc: 'Gentle adductor and hamstring lengthening.' },
      { name: 'Puppy Dog Shoulder Opener', reps: '3 sets × 60 secs', cal: 15, desc: 'Release tight lats and upper thoracic spine.' },
      { name: 'Lying Spinal Twist', reps: '3 sets × 45 secs/side', cal: 10, desc: 'Restore rotational freedom to spine.' }
    ],
    cooldown: [
      { name: 'Corpse Pose (Savasana)', reps: '3 mins', cal: 0, desc: 'Complete somatic relaxation.' }
    ]
  }
};

let currentWorkoutExercises = [];
let completedWorkoutCount = 0;

/* --- Exercise Coach State & Constants --- */
let exerciseCoachStream = null;
let exerciseCoachInterval = null;
let exerciseCoachTimer = null;
let exerciseCoachSeconds = 0;
let currentExerciseCoachTarget = 'Squats';
let currentExerciseCoachScore = 87;

const EXERCISE_COACH_FEEDBACK_DB = {
  Squats: {
    excellent: 'Excellent Form! Keep it up. Deep hip hinge and vertical chest alignment.',
    good: 'Good Form! Minor adjustments needed. Keep your weight firmly distributed over your heels.',
    moderate: 'Adjust your posture for better performance. Prevent knees from caving inward during ascent.',
    poor: 'Please correct your posture and follow the exercise guidance. Keep your chest up and spine neutral.',
    cues: { spine: 'Neutral & Erect ✅', joint: 'Knees Tracking Toes 🎯', rom: 'Full 90° Depth ⚡' }
  },
  'Push-ups': {
    excellent: 'Excellent Form! Keep it up. Full body plank line with 45-degree elbow tuck.',
    good: 'Good Form! Minor adjustments needed. Maintain steady eccentric lowering tempo.',
    moderate: 'Adjust your posture for better performance. Avoid sagging at your hips and lower back.',
    poor: 'Please correct your posture and follow the exercise guidance. Keep core engaged and elbows tucked.',
    cues: { spine: 'Rigid Plank Line ✅', joint: 'Elbows at 45° 🎯', rom: 'Chest to Floor ⚡' }
  },
  Lunges: {
    excellent: 'Excellent Form! Keep it up. 90-degree angles on both front and trailing knees.',
    good: 'Good Form! Minor adjustments needed. Step straight ahead with balanced center of gravity.',
    moderate: 'Adjust your posture for better performance. Front knee is tracking too far past your toes.',
    poor: 'Please correct your posture and follow the exercise guidance. Maintain upright torso and stable hips.',
    cues: { spine: 'Vertical Spine ✅', joint: '90° Knee Bend 🎯', rom: 'Full Step Stride ⚡' }
  },
  Plank: {
    excellent: 'Excellent Form! Keep it up. Total core bracing and optimal scapular protraction.',
    good: 'Good Form! Minor adjustments needed. Keep neck relaxed and gaze between your hands.',
    moderate: 'Adjust your posture for better performance. Lower your hips slightly to maintain flat line.',
    poor: 'Please correct your posture and follow the exercise guidance. Engage your glutes and pull navel in.',
    cues: { spine: 'Neutral Lumbar ✅', joint: 'Shoulders over Elbows 🎯', rom: 'Isometric Hold ⚡' }
  },
  'Jumping Jacks': {
    excellent: 'Excellent Form! Keep it up. Fluid rhythm, soft landings and full overhead arm arc.',
    good: 'Good Form! Minor adjustments needed. Stay light on the balls of your feet.',
    moderate: 'Adjust your posture for better performance. Extend arms fully above head level.',
    poor: 'Please correct your posture and follow the exercise guidance. Synchronize arm and foot timing.',
    cues: { spine: 'Athletic Posture ✅', joint: 'Full Extension 🎯', rom: 'Rhythmic Cadence ⚡' }
  }
};

function initWorkoutPage() {
  const form = $('#workout-gen-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      generateWorkoutRoutine();
    });
  }

  const postureBtn = $('#btn-posture-quick-check');
  if (postureBtn) {
    postureBtn.addEventListener('click', runQuickPostureCheck);
  }

  // Initialize Exercise Coach
  initExerciseCoach();
}

/* ──────────────────────────────────────────────────────────
   EXERCISE COACH LIVE CAMERA ENGINE
   ────────────────────────────────────────────────────────── */

function initExerciseCoach() {
  const startBtn = $('#btn-start-exercise-coach');
  const stopBtn = $('#btn-stop-exercise-coach');
  const exerciseSelect = $('#coach-exercise-select');

  if (startBtn) {
    startBtn.addEventListener('click', startExerciseCoachSession);
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', stopExerciseCoachSession);
  }

  if (exerciseSelect) {
    exerciseSelect.addEventListener('change', (e) => {
      currentExerciseCoachTarget = e.target.value;
      const badge = $('#coach-active-exercise-badge');
      if (badge) badge.textContent = `${currentExerciseCoachTarget} Protocol`;
      updateExerciseCoachFeedback();
    });
  }

  // Automatic clean shutdown when navigating away or hiding tab
  window.addEventListener('beforeunload', stopExerciseCoachSession);
  window.addEventListener('pagehide', stopExerciseCoachSession);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopExerciseCoachSession();
    }
  });
}

async function startExerciseCoachSession() {
  const idleState = $('#coach-camera-idle');
  const activeState = $('#coach-camera-active');
  const stopBtn = $('#btn-stop-exercise-coach');
  const videoEl = $('#exercise-coach-video');
  const exerciseSelect = $('#coach-exercise-select');

  if (exerciseSelect) {
    currentExerciseCoachTarget = exerciseSelect.value || 'Squats';
  }

  const badge = $('#coach-active-exercise-badge');
  if (badge) badge.textContent = `${currentExerciseCoachTarget} Protocol`;

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      exerciseCoachStream = stream;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play().catch(e => console.log('Camera play error:', e));
      }
    } else {
      showToast('Camera access is not supported on this browser.', 'warn', 4000);
      return;
    }
  } catch (err) {
    console.warn('Camera access denied or unavailable:', err);
    showToast('Camera permission denied or camera not found. Please allow camera access in browser settings.', 'warn', 5000);
    return;
  }

  // Switch UI States
  if (idleState) idleState.classList.add('hidden');
  if (activeState) activeState.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.remove('hidden');

  // Start Session Timer
  exerciseCoachSeconds = 0;
  const timerEl = $('#coach-session-timer');
  clearInterval(exerciseCoachTimer);
  exerciseCoachTimer = setInterval(() => {
    exerciseCoachSeconds++;
    const m = String(Math.floor(exerciseCoachSeconds / 60)).padStart(2, '0');
    const s = String(exerciseCoachSeconds % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);

  // Initialize Posture Analysis Engine Loop (Future-ready structure for MediaPipe / TF.js Pose)
  currentExerciseCoachScore = randInt(84, 92);
  updateExerciseCoachFeedback();

  clearInterval(exerciseCoachInterval);
  exerciseCoachInterval = setInterval(() => {
    // Dynamic simulated posture tracking drift
    const delta = randInt(-4, 5);
    currentExerciseCoachScore = Math.max(45, Math.min(98, currentExerciseCoachScore + delta));
    updateExerciseCoachFeedback();
  }, 2200);

  showToast(`Exercise Coach active for ${currentExerciseCoachTarget}!`, 'success', 3000);
}

function updateExerciseCoachFeedback() {
  const scoreVal = $('#coach-perfectness-val');
  const scoreBar = $('#coach-perfectness-bar');
  const ratingBadge = $('#coach-score-rating-badge');
  const feedbackHeadline = $('#coach-feedback-headline');
  const feedbackText = $('#coach-feedback-text');
  const feedbackBox = $('#coach-posture-feedback-box');
  const cpSpine = $('#cp-spine');
  const cpJoint = $('#cp-joint');
  const cpRom = $('#cp-rom');

  const score = currentExerciseCoachScore;
  const data = EXERCISE_COACH_FEEDBACK_DB[currentExerciseCoachTarget] || EXERCISE_COACH_FEEDBACK_DB['Squats'];

  if (scoreVal) scoreVal.textContent = `${score}%`;
  if (scoreBar) scoreBar.style.width = `${score}%`;

  let headline = 'Posture Guidance';
  let message = '';
  let badgeText = 'Tracking';
  let colorHex = '#10b981';

  if (score >= 90) {
    headline = '🌟 Excellent Form!';
    message = data.excellent;
    badgeText = '90%+ Excellent';
    colorHex = 'var(--clr-green-neon)';
    if (scoreBar) scoreBar.style.background = 'var(--grad-green)';
  } else if (score >= 75) {
    headline = '⚡ Good Form!';
    message = data.good;
    badgeText = 'Good Form';
    colorHex = 'var(--clr-blue-light)';
    if (scoreBar) scoreBar.style.background = 'var(--grad-primary)';
  } else if (score >= 50) {
    headline = '⚠️ Posture Adjustment Needed';
    message = data.moderate;
    badgeText = 'Form Alert';
    colorHex = 'var(--clr-orange)';
    if (scoreBar) scoreBar.style.background = 'var(--grad-fire)';
  } else {
    headline = '🚨 Correct Posture';
    message = data.poor;
    badgeText = 'Below 50%';
    colorHex = 'var(--clr-pink)';
    if (scoreBar) scoreBar.style.background = 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)';
  }

  if (scoreVal) scoreVal.style.color = colorHex;
  if (ratingBadge) {
    ratingBadge.textContent = badgeText;
    ratingBadge.className = score >= 75 ? 'badge badge-green' : 'badge badge-outline';
  }

  if (feedbackHeadline) {
    feedbackHeadline.innerHTML = `<i class="fa-solid fa-person-running" style="color:${colorHex}"></i> ${headline}`;
  }

  if (feedbackText) {
    feedbackText.textContent = message;
  }

  if (feedbackBox) {
    feedbackBox.style.borderLeftColor = colorHex;
  }

  // Update Biomechanical Checkpoints
  if (cpSpine) cpSpine.textContent = data.cues.spine;
  if (cpJoint) cpJoint.textContent = data.cues.joint;
  if (cpRom) cpRom.textContent = data.cues.rom;
}

function stopExerciseCoachSession() {
  if (exerciseCoachStream) {
    try {
      exerciseCoachStream.getTracks().forEach(track => track.stop());
    } catch (e) {}
    exerciseCoachStream = null;
  }

  clearInterval(exerciseCoachTimer);
  clearInterval(exerciseCoachInterval);
  exerciseCoachTimer = null;
  exerciseCoachInterval = null;

  const videoEl = $('#exercise-coach-video');
  if (videoEl) {
    videoEl.pause();
    videoEl.srcObject = null;
  }

  const idleState = $('#coach-camera-idle');
  const activeState = $('#coach-camera-active');
  const stopBtn = $('#btn-stop-exercise-coach');

  if (idleState) idleState.classList.remove('hidden');
  if (activeState) activeState.classList.add('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');

  if (exerciseCoachSeconds > 5) {
    const durationMin = Math.max(1, Math.round(exerciseCoachSeconds / 60));
    const pts = durationMin * 20 + randInt(25, 45);
    const prog = getProgress();
    saveProgress({
      workoutMin: prog.workoutMin + durationMin,
      points: prog.points + pts,
      calories: prog.calories + durationMin * 8
    });
    addActivity(`Live Exercise Coach Session (${currentExerciseCoachTarget})`, pts, 'fa-camera', '#10b981');
    showToast(`Exercise Coach session ended! +${pts} Points Added 🎉`, 'success', 4000);
  }
}

function generateWorkoutRoutine() {
  const goal = $('#w-goal')?.value || 'General Udyamness';
  const diff = $('#w-diff')?.value || 'Intermediate';
  const dur = $('#w-dur')?.value || '45';
  const equip = $('#w-equip')?.value || 'Minimal';

  const loadingEl = $('#workout-loading');
  const resultsEl = $('#workout-results');

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (resultsEl) resultsEl.classList.add('hidden');

  setTimeout(() => {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (resultsEl) resultsEl.classList.remove('hidden');

    const template = WORKOUT_CATALOG[goal] || WORKOUT_CATALOG['General Udyamness'];
    currentWorkoutExercises = [
      ...template.warmup.map(ex => ({ ...ex, phase: 'Warm-up' })),
      ...template.main.map(ex => ({ ...ex, phase: 'Main Workout' })),
      ...template.cooldown.map(ex => ({ ...ex, phase: 'Cool Down' }))
    ];
    completedWorkoutCount = 0;

    let totalCal = currentWorkoutExercises.reduce((acc, x) => acc + (x.cal || 0), 0);

    const titleEl = $('#w-plan-title');
    const metaEl = $('#w-plan-meta');
    if (titleEl) titleEl.textContent = `${goal} Plan (${diff})`;
    if (metaEl) metaEl.textContent = `${currentWorkoutExercises.length} Exercises · ~${dur} Mins · ${totalCal} kcal · Equipment: ${equip}`;

    renderExerciseList(template);
    updateWorkoutProgressBar();
    showToast('Personalized workout plan ready!', 'success');
  }, 1400);
}

function renderExerciseList(template) {
  const container = $('#w-exercise-container');
  if (!container) return;

  const phases = [
    { name: '🔥 Warm-up', items: template.warmup, phaseKey: 'warmup' },
    { name: '💪 Main Workout', items: template.main, phaseKey: 'main' },
    { name: '🧘 Cool Down', items: template.cooldown, phaseKey: 'cooldown' }
  ];

  container.innerHTML = phases.map(p => `
    <div class="exercise-phase-block">
      <h3 class="phase-header-title">${p.name}</h3>
      <div>
        ${p.items.map((ex, idx) => `
          <div class="exercise-card-item" id="ex-card-${p.phaseKey}-${idx}">
            <div class="ex-num-badge">${idx + 1}</div>
            <div class="ex-content-box">
              <div class="ex-name-title">${ex.name}</div>
              <div class="ex-meta-info">${ex.reps} · ~${ex.cal} kcal &bull; <span style="color:var(--clr-text-dim)">${ex.desc}</span></div>
            </div>
            <button class="btn btn-sm btn-primary btn-ex-complete" onclick="markExerciseDone('${p.phaseKey}', ${idx}, ${ex.cal})">
              <i class="fa-solid fa-check"></i> Complete
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

window.markExerciseDone = function(phaseKey, idx, cal) {
  const card = $(`#ex-card-${phaseKey}-${idx}`);
  if (!card || card.classList.contains('completed')) return;

  card.classList.add('completed');
  const btn = card.querySelector('button');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Done';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-green');
  }

  completedWorkoutCount++;
  updateWorkoutProgressBar();

  const prog = getProgress();
  saveProgress({
    calories: prog.calories + (cal || 20),
    exercisesDone: (prog.exercisesDone || 0) + 1
  });

  if (completedWorkoutCount === currentWorkoutExercises.length) {
    const pts = randInt(80, 150);
    saveProgress({
      points: prog.points + pts,
      completedWorkouts: (prog.completedWorkouts || 0) + 1,
      streak: prog.streak + 1
    });
    addActivity('Completed full generated workout', pts, 'fa-fire', '#f59e0b');
    showToast(`🏆 Entire workout finished! +${pts} Points earned!`, 'success', 5000);
  } else {
    showToast(`Exercise completed! (+${cal} kcal)`, 'success', 2000);
  }
};

function updateWorkoutProgressBar() {
  const total = currentWorkoutExercises.length || 1;
  const pct = Math.round((completedWorkoutCount / total) * 100);
  const fill = $('#w-progress-bar-fill');
  const text = $('#w-progress-pct-text');
  const count = $('#w-progress-count-text');

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${pct}%`;
  if (count) count.textContent = `${completedWorkoutCount} of ${total} Completed`;
}

function runQuickPostureCheck() {
  const reportBox = $('#w-posture-report-box');
  if (!reportBox) return;

  reportBox.classList.remove('hidden');
  reportBox.innerHTML = `
    <div style="padding:20px;text-align:center">
      <div class="spinner spinner-lg" style="margin:0 auto 12px"></div>
      <p style="color:var(--clr-blue-light);font-weight:600">Analyzing form biomechanics...</p>
    </div>
  `;

  setTimeout(() => {
    const cues = [
      { label: 'Spine Alignment', val: 'Optimal & Neutral ✅', color: '#10b981' },
      { label: 'Shoulder Position', val: 'Slight anterior roll (retract scapula) ⚠️', color: '#f59e0b' },
      { label: 'Knee Tracking', val: 'Properly aligned over 2nd toe ✅', color: '#10b981' },
      { label: 'Core Engagement', val: 'Solid pelvic stability ✅', color: '#10b981' }
    ];

    reportBox.innerHTML = `
      <div class="card card-glow-blue fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--font-display);font-weight:800;font-size:1.1rem;display:flex;align-items:center;gap:10px">
            <i class="fa-solid fa-person-rays" style="color:var(--clr-blue-light)"></i> AI Posture Diagnostics
          </div>
          <span class="badge badge-green">Scan Passed</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${cues.map(c => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--clr-border);border-radius:var(--radius-md);padding:12px">
              <div style="font-size:0.75rem;color:var(--clr-text-dim);text-transform:uppercase;font-weight:700">${c.label}</div>
              <div style="font-size:0.9rem;font-weight:700;color:${c.color};margin-top:2px">${c.val}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:0.8rem;color:var(--clr-text-muted);margin-top:14px">
          <i class="fa-solid fa-circle-info"></i> Maintain abdominal brace during all eccentric descent phases.
        </div>
      </div>
    `;
    showToast('Posture analysis completed!', 'success');
  }, 1200);
}

/* ──────────────────────────────────────────────────────────
   8. NUTRITION ASSISTANT (nutrition.html)
   ────────────────────────────────────────────────────────── */

const MEAL_DATABASE = {
  Standard: {
    breakfast: ['Greek Yogurt with Chia Seeds & Wild Blueberries', '3 Scrambled Eggs with Avocado on Sourdough', 'Overnight Oats with Almond Butter & Honey'],
    lunch: ['Grilled Chicken Breast, Quinoa & Steamed Broccoli', 'Tuna Poke Bowl with Brown Rice & Edamame', 'Lean Turkey Wrap with Hummus & Crisp Veggies'],
    snack: ['Handful of Raw Almonds & Green Apple', 'Whey Protein Shake with Banana', 'Cottage Cheese with Pineapple Chunks'],
    dinner: ['Baked Atlantic Salmon with Sweet Potato & Asparagus', 'Sirloin Steak with Roasted Brussels Sprouts', 'Herb-Roasted Chicken Thighs with Wild Rice']
  },
  Vegetarian: {
    breakfast: ['Tofu Scramble with Spinach, Tomatoes & Multigrain Toast', 'Oatmeal with Walnuts, Cinnamon & Sliced Banana', 'Paneer Bhurji with Whole Wheat Roti'],
    lunch: ['Lentil & Chickpea Curry with Basmati Brown Rice', 'Paneer Tikka with Grilled Bell Peppers & Quinoa', 'Mediterranean Falafel Bowl with Tahini & Olives'],
    snack: ['Roasted Makhana (Foxnuts) & Walnuts', 'Plant Protein Shake with Almond Milk', 'Greek Yogurt with Flaxseed & Strawberries'],
    dinner: ['Tofu Stir-Fry with Broccoli, Carrots & Cashews', 'Palak Paneer with Jowar Roti & Cucumber Salad', 'Black Bean Burrito Bowl with Guacamole']
  },
  Vegan: {
    breakfast: ['Tofu Scramble with Nutritional Yeast & Avocado', 'Smoothie Bowl with Plant Protein, Spinach & Berries', 'Chia Pudding with Coconut Milk & Mango'],
    lunch: ['Lentil Dahl with Brown Basmati & Steamed Greens', 'Tempeh Buddha Bowl with Roasted Sweet Potato', 'Chickpea & Avocado Salad with Lime Tahini'],
    snack: ['Edamame with Sea Salt', 'Mixed Raw Nuts & Dark Chocolate Piece', 'Carrot & Cucumber Sticks with Roasted Garlic Hummus'],
    dinner: ['Seitan / Soy Chunks Fajita with Guacamole & Black Beans', 'Coconut Chickpea Curry with Cauliflower Rice', 'Stir-Fried Tofu with Bok Choy & Rice Noodles']
  },
  Keto: {
    breakfast: ['3-Egg Omelette with Cheddar Cheese & Bacon', 'Avocado & Smoked Salmon Boats with Everything Seasoning', 'Keto Bulletproof Coffee with Scrambled Eggs'],
    lunch: ['Grilled Chicken Cobb Salad with Blue Cheese & Bacon', 'Bacon-Wrapped Turkey Breast with Cauliflower Mash', 'Tuna Salad with Extra Virgin Olive Oil & Celery'],
    snack: ['Macadamia Nuts & Pecans', 'String Cheese & Pepperoni Slices', 'Hard-Boiled Eggs with Guacamole'],
    dinner: ['Pan-Seared Ribeye Steak with Herb Butter & Asparagus', 'Baked Salmon with Creamy Garlic Butter Spinach', 'Pork Chops with Roasted Zucchini Ribbons']
  },
  'High Protein': {
    breakfast: ['4 Egg Whites + 2 Whole Eggs with Turkey Bacon & Oats', 'High-Protein French Toast with Whey Drizzle', 'Protein Power Pancakes with Mixed Berries'],
    lunch: ['200g Grilled Chicken Breast with 1 Cup Jasmine Rice', '200g Lean Ground Beef (95/5) with Sweet Potato', 'Double Salmon Fillet with Quinoa & Asparagus'],
    snack: ['Whey Isolate Shake with 1 Spoon Peanut Butter', '200g 0% Greek Yogurt with Blueberries', 'Boiled Eggs & Turkey Jerky'],
    dinner: ['200g Sirloin Steak with Roasted Baby Potatoes & Greens', 'Grilled Cod Fillet with Brown Rice & Zucchini', 'Chicken Breast Stir-Fry with Broccoli']
  }
};

function initNutritionPage() {
  const form = $('#nutrition-calc-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      calculateAndRenderNutrition();
    });
  }
}

function calculateAndRenderNutrition() {
  const weight = parseFloat($('#n-weight')?.value) || 72;
  const height = parseFloat($('#n-height')?.value) || 178;
  const age = parseFloat($('#n-age')?.value) || 24;
  const goal = $('#n-goal')?.value || 'General Udyamness';
  const act = $('#n-activity')?.value || 'moderate';
  const diet = $('#n-diet')?.value || 'Standard';

  const loadingEl = $('#nutrition-loading');
  const resultEl = $('#nutrition-result-card');

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (resultEl) resultEl.classList.add('hidden');

  setTimeout(() => {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (resultEl) resultEl.classList.remove('hidden');

    // BMR Calculation (Mifflin-St Jeor Formula)
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const actMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };
    const tdee = bmr * (actMultipliers[act] || 1.55);

    let targetCalories = Math.round(tdee);
    if (goal === 'Weight Loss') targetCalories -= 450;
    else if (goal === 'Muscle Building' || goal === 'Sports Performance') targetCalories += 350;

    let proteinGrams = Math.round(weight * 2.0);
    if (diet === 'Keto') proteinGrams = Math.round(weight * 1.8);
    if (diet === 'High Protein') proteinGrams = Math.round(weight * 2.4);

    let fatGrams = Math.round((targetCalories * (diet === 'Keto' ? 0.65 : 0.25)) / 9);
    let remainingCal = targetCalories - (proteinGrams * 4 + fatGrams * 9);
    let carbGrams = Math.max(20, Math.round(remainingCal / 4));

    if (diet === 'Keto') {
      carbGrams = 25;
      fatGrams = Math.round((targetCalories - (proteinGrams * 4 + carbGrams * 4)) / 9);
    }

    const waterLitres = (weight * 0.045).toFixed(1);

    // Populate Target Stats
    $('#target-cal-num').textContent = `${targetCalories.toLocaleString()}`;
    $('#target-protein-num').textContent = `${proteinGrams}g`;
    $('#target-carbs-num').textContent = `${carbGrams}g`;
    $('#target-fats-num').textContent = `${fatGrams}g`;
    $('#target-water-num').textContent = `${waterLitres}L`;

    // Populate Macros progress
    const totalMacroCal = (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9);
    const pPct = Math.round(((proteinGrams * 4) / totalMacroCal) * 100);
    const cPct = Math.round(((carbGrams * 4) / totalMacroCal) * 100);
    const fPct = 100 - pPct - cPct;

    $('#macro-p-bar').style.width = `${pPct}%`;
    $('#macro-c-bar').style.width = `${cPct}%`;
    $('#macro-f-bar').style.width = `${fPct}%`;

    $('#macro-p-pct').textContent = `${pPct}% (${proteinGrams}g)`;
    $('#macro-c-pct').textContent = `${cPct}% (${carbGrams}g)`;
    $('#macro-f-pct').textContent = `${fPct}% (${fatGrams}g)`;

    // Populate Meal Plan
    const mealSource = MEAL_DATABASE[diet] || MEAL_DATABASE['Standard'];
    $('#meal-b-item').textContent = randChoice(mealSource.breakfast);
    $('#meal-l-item').textContent = randChoice(mealSource.lunch);
    $('#meal-s-item').textContent = randChoice(mealSource.snack);
    $('#meal-d-item').textContent = randChoice(mealSource.dinner);

    const prog = getProgress();
    saveProgress({ points: prog.points + 30 });
    addActivity('Generated AI Nutrition Blueprint', 30, 'fa-utensils', '#10b981');

    showToast('Nutrition plan calculated and personalized!', 'success');
  }, 1300);
}

/* ──────────────────────────────────────────────────────────
   9. CHALLENGES & REWARDS (challenges.html)
   ────────────────────────────────────────────────────────── */

const CHALLENGES_LIST = [
  { id: 'c1', title: '5 Workouts This Week', desc: 'Finish 5 intense strength or cardio sessions.', total: 5, pts: 250, icon: 'fa-dumbbell', color: '#3b82f6', badge: 'none' },
  { id: 'c2', title: '10,000 Steps for 3 Days', desc: 'Maintain daily non-exercise physical activity.', total: 3, pts: 180, icon: 'fa-person-walking', color: '#10b981', badge: 'Rising Star' },
  { id: 'c3', title: '7-Day Active Streak', desc: 'Log consecutive workout sessions without rest days.', total: 7, pts: 400, icon: 'fa-fire', color: '#f59e0b', badge: 'Udyamness Warrior' },
  { id: 'c4', title: 'AI Sports Session Master', desc: 'Complete high accuracy analysis in your chosen sport.', total: 3, pts: 300, icon: 'fa-brain', color: '#8b5cf6', badge: 'Sports Champion' },
  { id: 'c5', title: 'Hydration Champion (3L/day)', desc: 'Hit optimal hydration target for 5 days.', total: 5, pts: 150, icon: 'fa-droplet', color: '#06b6d4', badge: 'none' },
  { id: 'c6', title: 'Perfect Nutrition Adherence', desc: 'Track your customized macro targets for 4 days.', total: 4, pts: 220, icon: 'fa-apple-whole', color: '#ec4899', badge: 'none' }
];

const LEADERBOARD_USERS = [
  { name: 'Arjun Sharma', sport: 'Cricket', pts: 4850, avatar: 'AS', color: '#3b82f6' },
  { name: 'Priya Patel', sport: 'Badminton', pts: 4210, avatar: 'PP', color: '#8b5cf6' },
  { name: 'Marcus Sterling', sport: 'Running', pts: 3980, avatar: 'MS', color: '#10b981' },
  { name: 'Elena Rostova', sport: 'Tennis', pts: 3540, avatar: 'ER', color: '#f59e0b' },
  { name: 'David Chen', sport: 'Basketball', pts: 3220, avatar: 'DC', color: '#06b6d4' }
];

const PARTNER_REWARDS = [
  { brand: 'Nike', offer: '25% Off Pro Training Shoes', code: 'Udyam-NIKE25', cost: 300, icon: '👟', color: '#f59e0b' },
  { brand: 'MyProtein', offer: 'Free 1kg Whey + Shaker Bottle', code: 'Udyam-WHEY100', cost: 450, icon: '🥤', color: '#10b981' },
  { brand: 'Decathlon', offer: '$20 Gift Voucher on Gear', code: 'Udyam-DECA20', cost: 250, icon: '🏋️', color: '#3b82f6' },
  { brand: 'Under Armour', offer: '30% Off Compression Wear', code: 'Udyam-ARMOUR30', cost: 350, icon: '🎽', color: '#8b5cf6' }
];

function initChallengesPage() {
  renderChallengesGrid();
  renderLeaderboard();
  renderPartnerRewards();
  updateUserGamificationHeader();
}

function updateUserGamificationHeader() {
  const prog = getProgress();
  const ptsEl = $('#ch-total-points');
  const levelEl = $('#ch-level-title');
  const lvlBar = $('#ch-level-bar-fill');

  if (ptsEl) ptsEl.textContent = `${prog.points.toLocaleString()} pts`;

  // Levels: Rookie (0-499), Amateur (500-1499), Pro (1500-2999), Elite (3000-5999), Legend (6000+)
  let level = 'Rookie';
  let nextPts = 500;
  let pct = (prog.points / 500) * 100;

  if (prog.points >= 6000) { level = 'Legend (Max Tier)'; pct = 100; }
  else if (prog.points >= 3000) { level = 'Elite Athlete'; nextPts = 6000; pct = ((prog.points - 3000) / 3000) * 100; }
  else if (prog.points >= 1500) { level = 'Pro Competitor'; nextPts = 3000; pct = ((prog.points - 1500) / 1500) * 100; }
  else if (prog.points >= 500) { level = 'Amateur Enthusiast'; nextPts = 1500; pct = ((prog.points - 500) / 1000) * 100; }

  if (levelEl) levelEl.textContent = level;
  if (lvlBar) lvlBar.style.width = `${Math.min(100, Math.max(5, pct))}%`;
}

function renderChallengesGrid() {
  const grid = $('#challenges-list-grid');
  if (!grid) return;

  const prog = getProgress();
  const currentProg = prog.challengeProgress || {};

  grid.innerHTML = CHALLENGES_LIST.map(ch => {
    const val = Math.min(ch.total, currentProg[ch.id] || 0);
    const pct = Math.round((val / ch.total) * 100);
    const isDone = val >= ch.total;

    return `
      <div class="challenge-item-card ${isDone ? 'card-glow-green' : ''}">
        <div>
          <div class="flex-between" style="margin-bottom:12px">
            <div class="flex gap-4" style="align-items:center">
              <div style="width:42px;height:42px;border-radius:12px;background:${ch.color}22;color:${ch.color};display:flex;align-items:center;justify-content:center;font-size:1.1rem">
                <i class="fa-solid ${ch.icon}"></i>
              </div>
              <div>
                <h4 style="font-family:var(--font-display);font-weight:700;font-size:1.05rem">${ch.title}</h4>
                <span class="badge ${isDone ? 'badge-green' : 'badge-blue'}" style="font-size:0.7rem;margin-top:2px">
                  ${isDone ? 'COMPLETED' : `REWARD: +${ch.pts} PTS`}
                </span>
              </div>
            </div>
          </div>
          <p style="font-size:0.86rem;color:var(--clr-text-muted);margin-bottom:18px">${ch.desc}</p>
        </div>

        <div>
          <div class="progress-label">
            <span>Progress (${val}/${ch.total})</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-wrap" style="margin-bottom:16px">
            <div class="progress-bar" style="width:${pct}%;background:${isDone ? 'var(--clr-green)' : ch.color}"></div>
          </div>

          <div class="flex-between" style="align-items:center">
            <span style="font-family:var(--font-tech);font-size:0.85rem;color:var(--clr-orange)">
              <i class="fa-solid fa-star"></i> +${ch.pts} pts
            </span>
            ${!isDone ? `
              <button class="btn btn-sm btn-primary" onclick="logChallengeStep('${ch.id}')">
                <i class="fa-solid fa-plus"></i> Log Progress
              </button>
            ` : `
              <span style="font-size:0.88rem;font-weight:700;color:var(--clr-green)">
                <i class="fa-solid fa-circle-check"></i> Completed
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.logChallengeStep = function(chId) {
  const prog = getProgress();
  const cp = { ...(prog.challengeProgress || {}) };
  const targetCh = CHALLENGES_LIST.find(c => c.id === chId);
  if (!targetCh) return;

  cp[chId] = (cp[chId] || 0) + 1;
  const isFinished = cp[chId] >= targetCh.total;

  let newPoints = prog.points;
  let badges = [...(prog.badges || [])];

  if (isFinished) {
    newPoints += targetCh.pts;
    if (targetCh.badge !== 'none' && !badges.includes(targetCh.badge)) {
      badges.push(targetCh.badge);
    }
    addActivity(`Finished Challenge: ${targetCh.title}`, targetCh.pts, 'fa-trophy', '#f59e0b');
    showToast(`🏆 Challenge complete! +${targetCh.pts} Points awarded!`, 'success', 4500);
  } else {
    showToast(`Progress logged: ${cp[chId]}/${targetCh.total}`, 'info', 2000);
  }

  saveProgress({ challengeProgress: cp, points: newPoints, badges });
  renderChallengesGrid();
  updateUserGamificationHeader();
  renderLeaderboard();
};

function renderLeaderboard() {
  const lbEl = $('#challenges-leaderboard-list');
  if (!lbEl) return;

  const user = getUser();
  const prog = getProgress();

  const allEntries = [
    ...LEADERBOARD_USERS,
    { name: `${user.name || 'You'} (You)`, sport: user.sport || 'Udyamness', pts: prog.points, avatar: (user.name || 'U').charAt(0), color: '#39ff14', isUser: true }
  ].sort((a, b) => b.pts - a.pts);

  lbEl.innerHTML = allEntries.map((u, idx) => {
    const rank = idx + 1;
    const rankMedals = ['🥇', '🥈', '🥉'];
    return `
      <div class="leaderboard-row ${rank === 1 ? 'rank-1' : ''} ${u.isUser ? 'user-row' : ''}">
        <div class="lb-rank-num" style="${rank <= 3 ? 'background:rgba(255,255,255,0.1)' : ''}">
          ${rank <= 3 ? rankMedals[rank - 1] : `#${rank}`}
        </div>
        <div class="lb-avatar-circle" style="background:${u.color}22;color:${u.color};border:1px solid ${u.color}44">
          ${u.avatar}
        </div>
        <div>
          <div style="font-weight:700;font-size:0.95rem;color:${u.isUser ? 'var(--clr-green-neon)' : 'var(--clr-text)'}">
            ${u.name}
          </div>
          <div style="font-size:0.78rem;color:var(--clr-text-dim)">${u.sport}</div>
        </div>
        <div class="lb-score-val">${u.pts.toLocaleString()} pts</div>
      </div>
    `;
  }).join('');
}

function renderPartnerRewards() {
  const grid = $('#partner-rewards-grid');
  if (!grid) return;

  grid.innerHTML = PARTNER_REWARDS.map(r => `
    <div class="card" style="text-align:center;padding:24px">
      <div style="font-size:2.8rem;margin-bottom:12px">${r.icon}</div>
      <h4 style="font-family:var(--font-display);font-weight:800;font-size:1.1rem;margin-bottom:4px">${r.brand}</h4>
      <p style="font-size:0.86rem;color:var(--clr-text-muted);margin-bottom:16px">${r.offer}</p>
      <div style="background:${r.color}15;border:1px solid ${r.color}44;border-radius:var(--radius-sm);padding:8px 12px;font-family:var(--font-tech);font-weight:700;color:${r.color};font-size:0.88rem;letter-spacing:1px;margin-bottom:16px">
        ${r.code}
      </div>
      <button class="btn btn-sm btn-outline btn-full" onclick="redeemPartnerCoupon('${r.brand}', '${r.code}', ${r.cost})">
        <i class="fa-solid fa-gift"></i> Redeem (${r.cost} pts)
      </button>
    </div>
  `).join('');
}

window.redeemPartnerCoupon = function(brand, code, cost) {
  const prog = getProgress();
  if (prog.points < cost) {
    showToast(`You need at least ${cost} points to claim ${brand} coupon!`, 'warn');
    return;
  }

  saveProgress({ points: prog.points - cost });
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  updateUserGamificationHeader();
  renderLeaderboard();
  showToast(`🎉 Coupon ${code} copied to clipboard! (-${cost} pts)`, 'success', 5000);
};

/* ──────────────────────────────────────────────────────────
   10. USER PROFILE & ONBOARDING (profile.html)
   ────────────────────────────────────────────────────────── */

function initProfilePage() {
  const steps = $$('.onboarding-step-content');
  const dotElements = $$('.step-dot-item');
  const lineElements = $$('.step-line-seg');
  let activeStep = 0;

  function updateStepperUI() {
    steps.forEach((s, idx) => s.classList.toggle('active', idx === activeStep));
    dotElements.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeStep);
      dot.classList.toggle('done', idx < activeStep);
      dot.innerHTML = idx < activeStep ? '<i class="fa-solid fa-check"></i>' : `${idx + 1}`;
    });
    lineElements.forEach((line, idx) => {
      line.classList.toggle('done', idx < activeStep);
    });

    const prevBtn = $('#btn-profile-prev');
    const nextBtn = $('#btn-profile-next');
    const submitBtn = $('#btn-profile-submit');

    if (prevBtn) prevBtn.style.visibility = activeStep === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.classList.toggle('hidden', activeStep === steps.length - 1);
    if (submitBtn) submitBtn.classList.toggle('hidden', activeStep !== steps.length - 1);
  }

  // Stepper dots click handler
  dotElements.forEach((dot, idx) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => {
      saveCurrentStepData(activeStep);
      activeStep = idx;
      updateStepperUI();
    });
  });

  // Next / Prev button events
  const nextBtn = $('#btn-profile-next');
  const prevBtn = $('#btn-profile-prev');
  const submitBtn = $('#btn-profile-submit');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (activeStep < steps.length - 1) {
        saveCurrentStepData(activeStep);
        activeStep++;
        updateStepperUI();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (activeStep > 0) {
        activeStep--;
        updateStepperUI();
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      saveCurrentStepData(activeStep);
      const user = getUser();
      $$('.nav-user-name').forEach(el => { el.textContent = user.name || 'Athlete'; });
      showToast('Profile updated & synced successfully! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    });
  }

  // Pre-fill fields from storage
  populateProfileFormFields();
  updateStepperUI();

  // Reset profile action
  const resetBtn = $('#btn-reset-profile');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset your profile and metrics back to defaults?')) {
        localStorage.removeItem('Udyam_user');
        localStorage.removeItem('Udyam_progress');
        localStorage.removeItem('Udyam_activities');
        showToast('All profile data reset to factory state.', 'info');
        setTimeout(() => location.reload(), 1000);
      }
    });
  }
}

function saveCurrentStepData(stepIdx) {
  const fields = {
    name: $('#p-name')?.value,
    age: parseInt($('#p-age')?.value, 10),
    gender: $('#p-gender')?.value,
    height: parseFloat($('#p-height')?.value),
    weight: parseFloat($('#p-weight')?.value),
    UdyamnessLevel: $('#p-Udyamness-level')?.value,
    activityLevel: $('#p-activity-level')?.value,
    sport: $('#p-sport')?.value,
    goal: $('#p-goal')?.value,
    duration: $('#p-duration')?.value,
    equipment: $('#p-equipment')?.value,
    diet: $('#p-diet')?.value
  };

  const filtered = {};
  Object.keys(fields).forEach(k => {
    if (fields[k] !== undefined && fields[k] !== '') filtered[k] = fields[k];
  });

  saveUser(filtered);
}

function populateProfileFormFields() {
  const u = getUser();
  if ($('#p-name')) $('#p-name').value = u.name || '';
  if ($('#p-age')) $('#p-age').value = u.age || 24;
  if ($('#p-gender')) $('#p-gender').value = u.gender || 'male';
  if ($('#p-height')) $('#p-height').value = u.height || 178;
  if ($('#p-weight')) $('#p-weight').value = u.weight || 72;
  if ($('#p-Udyamness-level')) $('#p-Udyamness-level').value = u.UdyamnessLevel || 'Intermediate';
  if ($('#p-activity-level')) $('#p-activity-level').value = u.activityLevel || 'Moderately Active';
  if ($('#p-sport')) $('#p-sport').value = u.sport || 'Running';
  if ($('#p-goal')) $('#p-goal').value = u.goal || 'General Udyamness';
  if ($('#p-duration')) $('#p-duration').value = u.duration || '45';
  if ($('#p-equipment')) $('#p-equipment').value = u.equipment || 'Minimal (Dumbbells/Bands)';
  if ($('#p-diet')) $('#p-diet').value = u.diet || 'Standard';
}

/* ──────────────────────────────────────────────────────────
   11. THEME SYSTEM (Dark / Light)
   ────────────────────────────────────────────────────────── */

function initTheme() {
  const savedTheme = localStorage.getItem('Udyam_theme') || 'dark';
  applyTheme(savedTheme);

  // Wire ALL theme toggle buttons on the page
  $$('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('Udyam_theme', next);
    });
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeIcons(theme);
}

function updateThemeIcons(theme) {
  $$('.theme-toggle').forEach(btn => {
    const icon = theme === 'light' ? 'fa-sun' : 'fa-moon';
    const textSpan = btn.querySelector('.theme-toggle-text');
    if (textSpan) {
      textSpan.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
    const iconEl = btn.querySelector('i');
    if (iconEl) {
      iconEl.className = `fa-solid ${icon}`;
    } else {
      btn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    }
    btn.setAttribute('title', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
  });
}

/* ──────────────────────────────────────────────────────────
   12. PAGE ROUTER INITIALIZATION
   ────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGlobalNav();

  const page = document.body.dataset.page || window.location.pathname.split('/').pop() || 'home';

  if (page === 'home' || page === 'index.html') initHomePage();
  if (page === 'dashboard' || page === 'dashboard.html') initDashboardPage();
  if (page === 'ai-coach' || page === 'ai-coach.html') initAICoachPage();
  if (page === 'workout' || page === 'workout.html') initWorkoutPage();
  if (page === 'nutrition' || page === 'nutrition.html') initNutritionPage();
  if (page === 'challenges' || page === 'challenges.html') initChallengesPage();
  if (page === 'profile' || page === 'profile.html') initProfilePage();
});
