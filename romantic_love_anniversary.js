(function ensureConfettiSupport() {
      if (typeof window.confetti === 'undefined') {
        const fallbackConfetti = function(options = {}) {
          const colors = options.colors || ['#ff2a70', '#fcd34d', '#ffffff', '#ff85a2'];
          const count = options.particleCount || 45;
          const originY = options.origin && options.origin.y !== undefined ? options.origin.y : 0.6;
          const originX = options.origin && options.origin.x !== undefined ? options.origin.x : 0.5;

          for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            const isText = options.shapes && options.shapes[0] && options.shapes[0].text;
            if (isText) {
              el.textContent = options.shapes[0].text;
              el.style.fontSize = `${(options.scalar || 1.8) * 14}px`;
            } else {
              el.style.width = `${Math.random() * 8 + 6}px`;
              el.style.height = `${Math.random() * 10 + 6}px`;
              el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
              el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            }

            el.style.position = 'fixed';
            el.style.left = `${originX * 100}vw`;
            el.style.top = `${originY * 100}vh`;
            el.style.zIndex = '99999';
            el.style.pointerEvents = 'none';
            el.style.userSelect = 'none';
            el.style.transition = 'all 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            el.style.transform = 'translate(-50%, -50%)';

            document.body.appendChild(el);

            const spreadAngle = (Math.random() - 0.5) * (options.spread || 90) * (Math.PI / 180);
            const distance = Math.random() * 320 + 80;
            const destX = Math.sin(spreadAngle) * distance;
            const destY = -Math.cos(spreadAngle) * distance + (Math.random() * 80 + 30);
            const rot = (Math.random() - 0.5) * 720;

            requestAnimationFrame(() => {
              el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) rotate(${rot}deg) scale(0.6)`;
              el.style.opacity = '0';
            });

            setTimeout(() => {
              if (el && el.parentNode) el.parentNode.removeChild(el);
            }, 1450);
          }
        };

        fallbackConfetti.shapeFromText = function(opts) {
          return { type: 'text', text: (opts && opts.text) || '❤️' };
        };

        window.confetti = fallbackConfetti;
      }
    })();

/* -------------------------------------------------------------
       1. DATA & STATE MANAGEMENT
    -------------------------------------------------------------- */
    const DEFAULT_PHOTOS = [
      {
        url: '1.jpg',
        title: 'HEO CON',
        caption: 'YÊU HEO CON'
      },
      {
        url: '2.jpg',
        title: 'VŨ TRỤ',
        caption: 'YÊU VŨ TRỤ CỦA ANH'
      },
      {
        url: '3.jpg',
        title: 'MẶT TRỜI',
        caption: ' YÊU MẶT TRỜI NHỎ'
      },
      {
        url: '4.jpg',
        title: 'BÉ BỰ',
        caption: 'YÊU BÉ BỰ NHA'
      },
      {
        url: '5.jpg',
        title: 'EM',
        caption: 'ANH YÊU EM NHIỀU LẮM'
      }
    ];

    let photos = DEFAULT_PHOTOS;
    let partnerName = localStorage.getItem('partner_name') || 'Gửi Em, Cả Thế Giới Của Anh';
    let loveLetterContent = localStorage.getItem('partner_letter') || 
`Gửi em - công chúa nhỏ đáng yêu nhất trần đời,\n\nCảm ơn em đã đến bên anh, giúp anh luôn hạnh phúc, luôn đồng hành với anh trong những ngày tháng qua. Anh biết anh không đủ tốt luôn làm em phải khó chịu, lo lắng, buồn phiền, nhưng anh sẽ luôn ở đây, cùng em trải qua, nắm chặt tay em và yêu thương em nhiều hơn mỗi ngày. Mãi yêu em! ❤️`;

    let loveStartDate = localStorage.getItem('anniversary_start') || '2026-02-22';

    /* -------------------------------------------------------------
       2. MP3 SOUNDTRACK & WEB AUDIO EFFECTS
    -------------------------------------------------------------- */
    let audioCtx = null;
    let isMusicPlaying = false;

    // Harmonic Piano Note Synthesizer with natural envelope & reverb feel
    function playRomanticPianoNote(freq, timeOffset = 0, duration = 3.5, velocity = 0.2) {
      if (!audioCtx) return;
      try {
        const now = audioCtx.currentTime + timeOffset;

        // Fundamental note oscillator
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Soft warmth filter
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Overtone for bell-like brightness
        const overtone = audioCtx.createOscillator();
        const overGain = audioCtx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2, now);

        // Exponential Piano decay envelope
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(velocity, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(velocity * 0.45, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

        overGain.gain.setValueAtTime(velocity * 0.25, now);
        overGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.8);

        osc.connect(filter);
        overtone.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + duration);
        overtone.stop(now + duration);
      } catch (err) {
        console.warn(err);
      }
    }

    const backgroundMusic = document.getElementById('backgroundMusic');
    const audioTrackName = document.getElementById('audioTrackName');
    function startRomanticSoundtrack() {
      if (isMusicPlaying) return;

      isMusicPlaying = true;
      document.getElementById('audioIndicator').classList.remove('hidden');
      audioTrackName.textContent = 'Nhạc kỷ niệm';
      backgroundMusic.play().catch(error => {
        isMusicPlaying = false;
        audioTrackName.textContent = 'Không phát được music.mp3';
        console.warn('Không thể phát music.mp3. Hãy kiểm tra file và thử mở bằng Live Server.', error);
      });
    }

    function fadeOutMusic() {
      isMusicPlaying = false;
      backgroundMusic.pause();
      // Play a soft closing chime
      [587.33, 739.99, 880.00].forEach((f, i) => {
        playRomanticPianoNote(f, i * 0.25, 4.0, 0.08);
      });
      setTimeout(() => {
        document.getElementById('audioIndicator').classList.add('hidden');
      }, 1800);
    }

    /* -------------------------------------------------------------
       3. PHASE 1: FINGERPRINT SCAN LOGIC (1.5 SECONDS EXACT)
    -------------------------------------------------------------- */
    const phaseLock = document.getElementById('phaseLock');
    const phaseGallery = document.getElementById('phaseGallery');
    const phaseLetter = document.getElementById('phaseLetter');
    const fingerprintBtn = document.getElementById('fingerprintBtn');
    const progressCircle = document.getElementById('progressCircle');
    const scanRipple = document.getElementById('scanRipple');
    const lockStatusText = document.getElementById('lockStatusText');
    const portalFlash = document.getElementById('portalFlash');

    const CIRCUMFERENCE = 2 * Math.PI * 62; // 389.5
    const HOLD_TIME_MS = 1500;
    const TICK_MS = 25;
    let holdTimer = null;
    let elapsedHold = 0;

    function handleHoldStart(e) {
      if (e) e.preventDefault();
      // Unlock audio early via user interaction
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      elapsedHold = 0;
      scanRipple.classList.remove('hidden');
      lockStatusText.textContent = "Đang nhận diện nhịp tim yêu thương...";
      lockStatusText.classList.remove('text-pink-300');
      lockStatusText.classList.add('text-amber-300');

      playRomanticPianoNote(440, 0, 1.2, 0.08);

      holdTimer = setInterval(() => {
        elapsedHold += TICK_MS;
        const progress = Math.min(1, elapsedHold / HOLD_TIME_MS);
        const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
        progressCircle.style.strokeDashoffset = offset;

        if (progress >= 1) {
          clearInterval(holdTimer);
          triggerBiometricSuccess();
        }
      }, TICK_MS);
    }

    function handleHoldEnd() {
      if (elapsedHold < HOLD_TIME_MS) {
        clearInterval(holdTimer);
        elapsedHold = 0;
        progressCircle.style.strokeDashoffset = CIRCUMFERENCE;
        scanRipple.classList.add('hidden');
        lockStatusText.textContent = "Chạm & giữ trái tim 1.5s";
        lockStatusText.classList.remove('text-amber-300');
        lockStatusText.classList.add('text-pink-300');
      }
    }

    fingerprintBtn.addEventListener('touchstart', handleHoldStart, { passive: false });
    fingerprintBtn.addEventListener('touchend', handleHoldEnd);
    fingerprintBtn.addEventListener('touchcancel', handleHoldEnd);

    fingerprintBtn.addEventListener('mousedown', handleHoldStart);
    fingerprintBtn.addEventListener('mouseup', handleHoldEnd);
    fingerprintBtn.addEventListener('mouseleave', handleHoldEnd);

    function triggerBiometricSuccess() {
      scanRipple.classList.add('hidden');
      lockStatusText.textContent = "Xác thực thành công! Bắt đầu du hành...";
      
      // Portal Flash & Sound Stinger
      portalFlash.classList.add('trigger');
      playRomanticPianoNote(587.33, 0, 2.5, 0.25);
      playRomanticPianoNote(880.00, 0.1, 3.0, 0.2);

      // Start the user-provided MP3 soundtrack
      startRomanticSoundtrack();

      // Confetti burst (safely called with fallback protection)
      try {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff2a70', '#fcd34d', '#ffffff']
          });
        }
      } catch (err) {
        console.warn('Confetti launch caught safely:', err);
      }

      setTimeout(() => {
        phaseLock.style.opacity = '0';
        phaseLock.style.pointerEvents = 'none';

        phaseGallery.style.opacity = '1';
        phaseGallery.style.pointerEvents = 'auto';

        portalFlash.classList.remove('trigger');
        startCinematicSlideshow();
      }, 700);
    }

    /* -------------------------------------------------------------
       4. PHASE 2: 3D CINEMATIC SLIDESHOW
    -------------------------------------------------------------- */
    const slidesContainer = document.getElementById('slidesContainer');
    const segmentedBars = document.getElementById('segmentedBars');
    const slideCounterText = document.getElementById('slideCounterText');
    const btnSkipToLetter = document.getElementById('btnSkipToLetter');
    const customPhotoInput = document.getElementById('customPhotoInput');

    let currentSlide = 0;
    let slideInterval = null;
    const SLIDE_DURATION = 5000; // 5s each photo

    function renderSlidesAndBars() {
      slidesContainer.innerHTML = '';
      segmentedBars.innerHTML = '';

      photos.forEach((item, index) => {
        // Micro progress bar segments
        const barWrapper = document.createElement('div');
        barWrapper.className = 'h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden';
        barWrapper.innerHTML = `<div id="bar-${index}" class="h-full bg-gradient-to-r from-pink-500 to-amber-300 w-0 transition-all duration-100"></div>`;
        segmentedBars.appendChild(barWrapper);

        // 3D Slide
        const slide = document.createElement('div');
        slide.className = `slide-3d ${index === 0 ? 'active' : ''}`;
        slide.id = `slide-${index}`;
        slide.innerHTML = `
          <div class="relative w-full h-full overflow-hidden rounded-3xl">
            <img src="${item.url}" alt="Moment" class="ken-burns-img w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            
            <!-- Overlay Content -->
            <div class="absolute bottom-0 inset-x-0 p-6 z-20 flex flex-col gap-1.5">
              <span class="text-[11px] font-cinematic font-bold tracking-widest text-amber-300 uppercase">
                ĐỒ CON HEO 0${index + 1}
              </span>
              <h3 class="text-2xl font-serif-lux font-bold text-white drop-shadow-md">
                ${item.title}
              </h3>
              <p class="text-xs text-pink-200/90 leading-relaxed font-normal mt-1 drop-shadow">
                ${item.caption}
              </p>
            </div>
          </div>
        `;
        slidesContainer.appendChild(slide);
      });
    }

    function setSlide(index) {
      const total = photos.length;
      if (index >= total) {
        // All photos completed -> Transition to Phase 3
        finishGalleryToLetter();
        return;
      }

      currentSlide = index;
      slideCounterText.textContent = `0${currentSlide + 1} / 0${total}`;

      // Update 3D card classes
      photos.forEach((_, i) => {
        const slide = document.getElementById(`slide-${i}`);
        const bar = document.getElementById(`bar-${i}`);
        if (!slide || !bar) return;

        slide.classList.remove('active', 'prev');
        if (i === currentSlide) {
          slide.classList.add('active');
          bar.style.width = '100%';
        } else if (i < currentSlide) {
          slide.classList.add('prev');
          bar.style.width = '100%';
        } else {
          bar.style.width = '0%';
        }
      });
    }

    function startCinematicSlideshow() {
      setSlide(0);
      if (slideInterval) clearInterval(slideInterval);

      let slideStartTime = Date.now();
      slideInterval = setInterval(() => {
        const elapsed = Date.now() - slideStartTime;
        const currentBar = document.getElementById(`bar-${currentSlide}`);
        if (currentBar) {
          const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
          currentBar.style.width = `${pct}%`;
        }

        if (elapsed >= SLIDE_DURATION) {
          slideStartTime = Date.now();
          setSlide(currentSlide + 1);
        }
      }, 50);
    }

    // Touch Swipe support for slides
    let touchStartX = 0;
    slidesContainer.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slidesContainer.addEventListener('touchend', e => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      if (diffX < -50) {
        // Next
        setSlide(currentSlide + 1);
      } else if (diffX > 50 && currentSlide > 0) {
        // Prev
        setSlide(currentSlide - 1);
      }
    }, { passive: true });

    btnSkipToLetter.addEventListener('click', finishGalleryToLetter);

    // Custom user photos upload
    customPhotoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const loaded = [];
      files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          loaded.push({
            url: event.target.result,
            title: `HEO CON ƠI #${idx + 1}`,
            caption: 'ANH YÊU EM NHIỀU LẮM'
          });
          if (loaded.length === files.length) {
            photos = loaded;
            renderSlidesAndBars();
            setSlide(0);
            confetti({ particleCount: 40, spread: 60 });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    function finishGalleryToLetter() {
      if (slideInterval) clearInterval(slideInterval);

      // Trigger Golden Portal Flash
      portalFlash.classList.add('trigger');

      setTimeout(() => {
        phaseGallery.style.opacity = '0';
        phaseGallery.style.pointerEvents = 'none';

        phaseLetter.style.opacity = '1';
        phaseLetter.style.pointerEvents = 'auto';

        portalFlash.classList.remove('trigger');
        startLetterTypewriter();
      }, 600);
    }

    /* -------------------------------------------------------------
       5. PHASE 3: ETERNAL LOVE LETTER & TYPEWRITER EFFECT
    -------------------------------------------------------------- */
    const typedLoveText = document.getElementById('typedLoveText');
    const typingCaret = document.getElementById('typingCaret');
    const partnerNameTitle = document.getElementById('partnerNameTitle');
    const btnHeartExplosion = document.getElementById('btnHeartExplosion');
    const btnReplayLetterType = document.getElementById('btnReplayLetterType');
    const btnReplayAll = document.getElementById('btnReplayAll');

    let typeIndex = 0;
    let typeTimer = null;

    function startLetterTypewriter() {
      if (typeTimer) clearTimeout(typeTimer);
      partnerNameTitle.textContent = partnerName;
      typedLoveText.innerHTML = '';
      typeIndex = 0;
      typingCaret.style.display = 'inline-block';

      function typeChar() {
        if (typeIndex < loveLetterContent.length) {
          const char = loveLetterContent[typeIndex];
          typedLoveText.innerHTML += (char === '\n') ? '<br>' : char;
          typeIndex++;

          // Gentle typewriter chime occasionally
          if (typeIndex % 8 === 0) {
            playRomanticPianoNote(659.25, 0, 0.8, 0.03);
          }

          typeTimer = setTimeout(typeChar, 35);
        } else {
          typingCaret.style.display = 'none';
        }
      }
      typeChar();
    }

    btnReplayLetterType.addEventListener('click', startLetterTypewriter);

    btnHeartExplosion.addEventListener('click', (e) => {
      // Golden Harp / Chime sound
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        playRomanticPianoNote(f, i * 0.12, 2.5, 0.12);
      });

      // Confetti Hearts Storm (guarded)
      try {
        if (typeof confetti === 'function') {
          const heartShape = confetti.shapeFromText ? confetti.shapeFromText({ text: '❤️' }) : null;
          confetti({
            shapes: heartShape ? [heartShape] : undefined,
            scalar: 2.2,
            particleCount: 50,
            spread: 100,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.warn('Heart explosion confetti skipped safely:', err);
      }

      // Spawn floating kiss emojis
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const rx = window.innerWidth / 2 + (Math.random() * 240 - 120);
          const ry = window.innerHeight * 0.6 + (Math.random() * 100 - 50);
          createTapSparkle(rx, ry, '💋');
        }, i * 90);
      }
    });

    // Replay journey from start
    btnReplayAll.addEventListener('click', () => {
      isMusicPlaying = false;
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      document.getElementById('audioIndicator').classList.add('hidden');

      phaseLetter.style.opacity = '0';
      phaseLetter.style.pointerEvents = 'none';

      phaseLock.style.opacity = '1';
      phaseLock.style.pointerEvents = 'auto';
      progressCircle.style.strokeDashoffset = CIRCUMFERENCE;
      lockStatusText.textContent = "Chạm & giữ trái tim 1.5s";
    });

    /* -------------------------------------------------------------
       6. EDIT LETTER & PARTNER NAME MODAL
    -------------------------------------------------------------- */
    const editLetterModal = document.getElementById('editLetterModal');
    const btnEditLetterModal = document.getElementById('btnEditLetterModal');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    const inputPartnerName = document.getElementById('inputPartnerName');
    const inputTextLetter = document.getElementById('inputTextLetter');

    btnEditLetterModal.addEventListener('click', () => {
      inputPartnerName.value = partnerName;
      inputTextLetter.value = loveLetterContent;
      editLetterModal.classList.remove('hidden');
      editLetterModal.classList.add('flex');
    });

    btnCancelEdit.addEventListener('click', () => {
      editLetterModal.classList.add('hidden');
      editLetterModal.classList.remove('flex');
    });

    btnSaveEdit.addEventListener('click', () => {
      if (inputPartnerName.value.trim()) partnerName = inputPartnerName.value.trim();
      if (inputTextLetter.value.trim()) loveLetterContent = inputTextLetter.value.trim();

      localStorage.setItem('partner_name', partnerName);
      localStorage.setItem('partner_letter', loveLetterContent);

      editLetterModal.classList.add('hidden');
      editLetterModal.classList.remove('flex');

      startLetterTypewriter();
      confetti({ particleCount: 30, spread: 60 });
    });

    /* -------------------------------------------------------------
       7. REALTIME LOVE TIMER CALCULATION
    -------------------------------------------------------------- */
    const counterDays = document.getElementById('counterDays');
    const counterHours = document.getElementById('counterHours');
    const counterMinutes = document.getElementById('counterMinutes');
    const counterSeconds = document.getElementById('counterSeconds');

    function updateCounter() {
      const start = new Date(loveStartDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      counterDays.textContent = days.toString().padStart(3, '0');
      counterHours.textContent = hours.toString().padStart(2, '0');
      counterMinutes.textContent = minutes.toString().padStart(2, '0');
      counterSeconds.textContent = seconds.toString().padStart(2, '0');
    }
    setInterval(updateCounter, 1000);
    updateCounter();

    /* -------------------------------------------------------------
       8. AMBIENT 3D STARLIGHT & ROSE PETALS CANVAS
    -------------------------------------------------------------- */
    const canvas = document.getElementById('ambientCanvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class FloatingEntity {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 40;
        this.size = Math.random() * 10 + 4;
        this.speedY = Math.random() * 0.9 + 0.3;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.rotation = Math.random() * 360;
        this.rotSpeed = Math.random() * 1.5 - 0.75;
        this.isHeart = Math.random() > 0.45;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y < -30) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.isHeart) {
          ctx.fillStyle = '#ff2a70';
          ctx.beginPath();
          const s = this.size * 0.45;
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-s, -s, -s * 1.5, s * 0.5, 0, s * 1.5);
          ctx.bezierCurveTo(s * 1.5, s * 0.5, s, -s, 0, 0);
          ctx.fill();
        } else {
          // Starlight dust
          ctx.fillStyle = '#fcd34d';
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 30 }, () => {
      const p = new FloatingEntity();
      p.y = Math.random() * height;
      return p;
    });

    function animateAmbient() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateAmbient);
    }
    animateAmbient();

    /* -------------------------------------------------------------
       9. SCREEN TAP MAGIC SPARKLE
    -------------------------------------------------------------- */
    function createTapSparkle(x, y, emoji = null) {
      if (!x || !y) return;
      const el = document.createElement('div');
      el.className = 'tap-sparkle text-2xl pointer-events-none select-none';
      const emojis = ['💖', '✨', '🌸', '🌹', '🥰'];
      el.textContent = emoji || emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('#fingerprintBtn')) return;
      createTapSparkle(e.clientX, e.clientY);
    });

    // Initialize initial render
    renderSlidesAndBars();
