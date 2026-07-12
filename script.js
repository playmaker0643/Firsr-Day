/* ==========================================================================
   FIRST DAY SURVIVAL SYSTEM — script.js
   Sections:
   1. Boot sequence
   2. Randomized data generation (stats / threats)
   3. Dashboard rendering
   4. Terminal log feed
   5. Mission checklist
   6. Simulation launch + emergency alert
   7. Misc (clock, easter eggs)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. BOOT SEQUENCE
     ------------------------------------------------------------------ */
  const bootMessages = [
    { text: 'Initializing Student Mode...', type: 'ok' },
    { text: 'Loading forgotten knowledge...', type: 'warn' },
    { text: 'Recovering programming skills...', type: 'ok' },
    { text: 'Detecting lecturer difficulty...', type: 'warn' },
    { text: 'Scanning for unfinished assignments...', type: 'warn' },
    { text: 'Holiday mode detected.', type: 'ok' },
    { text: 'Compiling excuses.exe... failed.', type: 'warn' },
    { text: 'Reconnecting to campus WiFi (this may take a while)...', type: 'ok' }
  ];

  const bootLogEl = document.getElementById('boot-log');
  const bootFillEl = document.getElementById('boot-progress-fill');
  const bootPercentEl = document.getElementById('boot-progress-percent');
  const bootTextEl = document.getElementById('boot-progress-text');
  const bootScreenEl = document.getElementById('boot-screen');
  const skipBtn = document.getElementById('skip-boot');
  const dashboardEl = document.getElementById('dashboard');

  let bootFinished = false;
  let bootTimers = [];

  function runBootSequence() {
    const stepCount = bootMessages.length;
    const stepDuration = 480; // ms per line

    bootMessages.forEach((msg, i) => {
      const t = setTimeout(() => {
        const line = document.createElement('div');
        line.className = `line ${msg.type}`;
        line.textContent = msg.text;
        bootLogEl.appendChild(line);
        bootLogEl.scrollTop = bootLogEl.scrollHeight;

        const pct = Math.round(((i + 1) / stepCount) * 100);
        bootFillEl.style.width = pct + '%';
        bootPercentEl.textContent = pct + '%';
        bootTextEl.textContent = pct < 100 ? 'BOOTING' : 'READY';
      }, i * stepDuration);
      bootTimers.push(t);
    });

    const finishTimer = setTimeout(finishBoot, stepCount * stepDuration + 500);
    bootTimers.push(finishTimer);
  }

  function finishBoot() {
    if (bootFinished) return;
    bootFinished = true;
    bootTimers.forEach(clearTimeout);
    bootScreenEl.classList.add('boot-hidden');
    dashboardEl.hidden = false;
    setTimeout(() => { bootScreenEl.style.display = 'none'; }, 650);
    startTerminalFeed();
  }

  skipBtn.addEventListener('click', finishBoot);
  runBootSequence();

  /* ------------------------------------------------------------------
     2. RANDOMIZED DATA
     ------------------------------------------------------------------ */
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function tierFor(value, invert) {
    // invert=true means LOW value is good (e.g. holiday energy being high is "bad" for readiness)
    const v = invert ? 100 - value : value;
    if (v >= 66) return 'tier-good';
    if (v >= 33) return 'tier-mid';
    return 'tier-bad';
  }

  const statNotes = {
    math: ['Mostly replaced by calculator muscle memory.', 'PEMDAS partially recovered.', 'Long division: still classified.'],
    programming: ['Semicolons remembered. Logic, less so.', 'Stack Overflow dependency at critical levels.', '"It worked yesterday" module reloaded.'],
    examConf: ['Confidence inversely proportional to preparation.', 'Panic reserves fully charged instead.', 'Based on vibes, not revision.'],
    holidayEnergy: ['Still running on holiday time zone.', 'Bed gravity remains dangerously strong.', 'Refusing to acknowledge Monday.'],
    readiness8am: ['Alarm clock treated as a personal enemy.', '8AM class located. Attendance, uncertain.', 'Snooze button usage: expert level.'],
    attendance: ['Motivated until the first rainy day.', 'Strong in theory, weak in practice.', 'Depends entirely on free breakfast.'],
    sleep: ['Reserves drained by "one more episode".', 'Running on borrowed sleep from 2025.', 'Critically low. Naps recommended.']
  };

  function buildStats() {
    const math = rand(10, 70);
    const programming = rand(15, 80);
    const examConf = rand(5, 60);
    const holidayEnergy = rand(55, 100);
    const readiness8am = rand(5, 55);
    const attendance = rand(20, 85);
    const sleep = rand(10, 60);

    return [
      { id: 'math', label: 'Mathematics Memory', value: math, note: pick(statNotes.math) },
      { id: 'programming', label: 'Programming Knowledge', value: programming, note: pick(statNotes.programming) },
      { id: 'examConf', label: 'Exam Confidence', value: examConf, note: pick(statNotes.examConf) },
      { id: 'holidayEnergy', label: 'Holiday Energy', value: holidayEnergy, note: pick(statNotes.holidayEnergy), invert: true },
      { id: 'readiness8am', label: 'Readiness for 8AM Classes', value: readiness8am, note: pick(statNotes.readiness8am) },
      { id: 'attendance', label: 'Attendance Motivation', value: attendance, note: pick(statNotes.attendance) },
      { id: 'sleep', label: 'Sleep Reserve', value: sleep, note: pick(statNotes.sleep) }
    ];
  }

  const threatPool = [
    {
      id: 'surpriseTest',
      label: 'Surprise Test Probability',
      messages: ['A pop quiz is loading in the background.', 'Lecturer was seen holding a stapled paper stack.', 'Your gut feeling says "study tonight."']
    },
    {
      id: 'assignmentRisk',
      label: 'Assignment Risk Level',
      messages: ['Group project partners still unresponsive.', 'Deadline detected closer than it appears.', 'Google Classroom notification incoming.']
    },
    {
      id: 'lecturerMood',
      label: 'Lecturer Mood Analysis',
      messages: ['Coffee levels unknown — proceed with caution.', 'Mood swings correlate with attendance sheets.', 'Currently unreadable. Recommend front-row eye contact.']
    },
    {
      id: 'wifi',
      label: 'WiFi Availability Prediction',
      messages: ['Signal last seen during orientation week.', 'Bandwidth reserved for staff only, allegedly.', 'Connects perfectly, only when no one needs it.']
    },
    {
      id: 'cafeteria',
      label: 'Cafeteria Queue Forecast',
      messages: ['Line length approaching the length of the syllabus.', 'Jollof will sell out by second period.', 'Queue physics currently defy known science.']
    }
  ];

  function buildThreats() {
    return threatPool.map(t => {
      const level = rand(10, 99);
      return { ...t, level, message: pick(t.messages) };
    });
  }

  function threatTierClass(level) {
    if (level >= 70) return { cls: 'tier-bad', word: 'CRITICAL' };
    if (level >= 40) return { cls: 'tier-mid', word: 'ELEVATED' };
    return { cls: 'tier-good', word: 'STABLE' };
  }

  /* ------------------------------------------------------------------
     3. DASHBOARD RENDERING
     ------------------------------------------------------------------ */
  const statGrid = document.getElementById('stat-grid');
  const threatGrid = document.getElementById('threat-grid');

  function renderStats() {
    const stats = buildStats();
    statGrid.innerHTML = '';
    stats.forEach(s => {
      const tier = tierFor(s.value, s.invert);
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div class="stat-card-top">
          <span class="stat-label">${s.label}</span>
          <span class="stat-value ${tier}">${s.value}%</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill ${tier}" style="width:0%"></div>
        </div>
        <p class="stat-note">${s.note}</p>
      `;
      statGrid.appendChild(card);
      const fill = card.querySelector('.stat-bar-fill');
      const colorVar = tier === 'tier-good' ? 'var(--green)' : tier === 'tier-mid' ? 'var(--amber)' : 'var(--red)';
      fill.style.color = colorVar;
      fill.style.background = colorVar;
      requestAnimationFrame(() => { fill.style.width = s.value + '%'; });
    });
  }

  function renderThreats() {
    const threats = buildThreats();
    threatGrid.innerHTML = '';
    threats.forEach(t => {
      const { cls, word } = threatTierClass(t.level);
      const color = cls === 'tier-good' ? 'var(--green)' : cls === 'tier-mid' ? 'var(--amber)' : 'var(--red)';
      const card = document.createElement('div');
      card.className = 'threat-card';
      card.innerHTML = `
        <div class="threat-top">
          <span class="threat-label">${t.label}</span>
          <span class="threat-level" style="color:${color}; border:1px solid ${color};">${word} · ${t.level}%</span>
        </div>
        <p class="threat-msg">${t.message}</p>
      `;
      threatGrid.appendChild(card);
    });
  }

  renderStats();
  renderThreats();

  /* holiday length easter flavor text in hero */
  const holidayLengths = ['3 weeks', '6 weeks', '2 months', 'an entire academic eternity', 'longer than the syllabus said it would be'];
  document.getElementById('holiday-length').textContent = pick(holidayLengths);

  /* ------------------------------------------------------------------
     4. TERMINAL LOG FEED
     ------------------------------------------------------------------ */
  const terminalEl = document.getElementById('terminal');
  const terminalLogs = [
    'checking for assignment.docx... not found',
    'restoring lecture_notes/ from cold storage',
    'python: ModuleNotFoundError: No module named "motivation"',
    'ping campus_wifi... request timed out',
    'brain.exe is not responding',
    'cafeteria queue length: undefined',
    'alarm_clock service: snoozed x7',
    'searching for "will this be on the test"... 0 results',
    'group_project.partner_1: last seen 3 weeks ago',
    'sudo apt install focus... permission denied',
    'lecturer.mood: fluctuating',
    'attempting to recall semester 1 content... 12% loaded',
    'charging_socket.exe: 3 students competing for 1 outlet',
    'coffee.stock: critically low',
    'new_notification: "Assignment due in 3 hours"',
    'system check: still holiday-brained'
  ];

  let terminalTimer = null;
  function startTerminalFeed() {
    printTerminalLine('boot sequence complete. entering monitor mode.', true);
    terminalTimer = setInterval(() => {
      printTerminalLine(pick(terminalLogs));
    }, 2600);
  }

  function printTerminalLine(text, isPrompt) {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = isPrompt
      ? `<span class="t-prompt">system&gt;</span> ${text}`
      : `<span class="t-prompt">log&gt;</span> ${text}`;
    terminalEl.appendChild(line);
    terminalEl.scrollTop = terminalEl.scrollHeight;
    // keep terminal from growing unbounded
    while (terminalEl.childNodes.length > 40) {
      terminalEl.removeChild(terminalEl.firstChild);
    }
  }

  /* ------------------------------------------------------------------
     5. MISSION CHECKLIST
     ------------------------------------------------------------------ */
  const missions = [
    'Survive first lecture.',
    'Find classmates.',
    'Locate charging socket.',
    'Remember previous semester topics.',
    'Avoid sleeping during class.'
  ];
  const missionListEl = document.getElementById('mission-list');
  const missionCountTag = document.getElementById('mission-count-tag');

  function renderMissions() {
    missionListEl.innerHTML = '';
    missions.forEach((m, i) => {
      const li = document.createElement('li');
      li.className = 'mission-item';
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.dataset.index = i;
      li.innerHTML = `<span class="mission-check" aria-hidden="true"></span><span class="mission-text">${m}</span>`;
      missionListEl.appendChild(li);
    });
    updateMissionCount();
  }

  function updateMissionCount() {
    const done = missionListEl.querySelectorAll('.mission-item.done').length;
    missionCountTag.textContent = `${done}/${missions.length}`;
  }

  function toggleMission(item) {
    item.classList.toggle('done');
    updateMissionCount();
    if (missionListEl.querySelectorAll('.mission-item.done').length === missions.length) {
      printTerminalLine('all missions complete. suspiciously well-prepared.', true);
    }
  }

  missionListEl.addEventListener('click', (e) => {
    const item = e.target.closest('.mission-item');
    if (item) toggleMission(item);
  });
  missionListEl.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('mission-item')) {
      e.preventDefault();
      toggleMission(e.target);
    }
  });

  renderMissions();

  /* ------------------------------------------------------------------
     6. SIMULATION LAUNCH + EMERGENCY ALERT
     ------------------------------------------------------------------ */
  const startSimBtn = document.getElementById('start-sim');
  const emergencyOverlay = document.getElementById('emergency-overlay');
  const closeEmergencyBtn = document.getElementById('close-emergency');
  const finalOverlay = document.getElementById('final-overlay');
  const closeFinalBtn = document.getElementById('close-final');

  /* tiny WebAudio "alarm" beep, no external files/dependencies */
  function playAlarmBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [0, 0.22, 0.44].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 660, now + offset);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
      setTimeout(() => ctx.close(), 900);
    } catch (err) {
      /* audio not available — fail silently, animation still runs */
    }
  }

  startSimBtn.addEventListener('click', () => {
    startSimBtn.classList.add('firing');
    printTerminalLine('SEMESTER SIMULATION INITIATED', true);
    playAlarmBeep();

    setTimeout(() => {
      startSimBtn.classList.remove('firing');
      emergencyOverlay.hidden = false;
      emergencyOverlay.setAttribute('aria-hidden', 'false');
      printTerminalLine('incoming transmission: new_assignment.pdf', true);
    }, 420);
  });

  closeEmergencyBtn.addEventListener('click', () => {
    emergencyOverlay.hidden = true;
    emergencyOverlay.setAttribute('aria-hidden', 'true');
    finalOverlay.hidden = false;
    finalOverlay.setAttribute('aria-hidden', 'false');
  });

  closeFinalBtn.addEventListener('click', () => {
    finalOverlay.hidden = true;
    finalOverlay.setAttribute('aria-hidden', 'true');
    printTerminalLine('tutorial phase officially over. good luck.', true);
  });

  /* ------------------------------------------------------------------
     7. MISC — clock + easter eggs
     ------------------------------------------------------------------ */
  const clockEl = document.getElementById('clock');
  function tickClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* Easter egg #1: konami-ish click combo on the logo triggers a wink log */
  const topbarLogo = document.querySelector('.topbar-logo');
  if (topbarLogo) {
    let clickCount = 0;
    let clickTimer = null;
    topbarLogo.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 1200);
      if (clickCount === 5) {
        printTerminalLine('developer mode unlocked. there is no spoon. only assignments.', true);
        clickCount = 0;
      }
    });
  }

  /* Easter egg #2: hidden corner zone */
  const easterCorner = document.getElementById('easter-corner');
  if (easterCorner) {
    easterCorner.addEventListener('click', () => {
      printTerminalLine('you found the secret corner. it contains nothing but vibes.', true);
    });
  }

  /* Easter egg #3: typing "sleep" anywhere on the page */
  let typedBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (e.key.length === 1) {
      typedBuffer = (typedBuffer + e.key).slice(-10).toLowerCase();
      if (typedBuffer.includes('sleep')) {
        printTerminalLine('nap protocol requested. request denied by lecturer.exe.', true);
        typedBuffer = '';
      }
      if (typedBuffer.includes('codebreakers')) {
        printTerminalLine('CodeBreakers signal detected. respect.', true);
        typedBuffer = '';
      }
    }
  });

  /* Easter egg #4: console message for the curious devtools opener */
  console.log('%cF.D.S.S ONLINE', 'color:#4de3ff; font-family:monospace; font-size:14px;');
  console.log('%cSnooping around the console, operative? Respect. Nothing broken here.', 'color:#3dffa0; font-family:monospace;');

})();
