/**
 * boxing.js v1 — 第一人称单词拳击
 * 
 * 第一人称视角，日语单词从对手方向飞来
 * 正确答案作为"出拳目标"，答对挥拳暴击
 * 
 * 剧情：1~10R 业余拳手 → 11~20R 职业拳手
 * Boss：每 5 回合出现强力对手
 */
;(function() {
'use strict';

// ============================================================
// 常量
// ============================================================
const MAX_HP = 6;
const ROUNDS_PER_OPPONENT = 3; // 每个对手挨 3 拳 KO
const BOSS_INTERVAL = 5;       // 每 5 回合打 Boss
const INSTANT_KO_STREAK = 20;  // 连续答对 20 道直接 KO

const DIRECTIONS = [
  { id: 'upper', name: '上勾拳', icon: '⬆️' },
  { id: 'left',  name: '左勾拳', icon: '⬅️' },
  { id: 'right', name: '右勾拳', icon: '➡️' },
  { id: 'straight', name: '直拳',   icon: '🎯' },
];

const DIFFICULTY_TABLE = [
  { min: 1,  max: 3,  level: 'N5', time: 7000 },
  { min: 4,  max: 6,  level: 'N4', time: 6000 },
  { min: 7,  max: 10, level: 'N3', time: 5500 },
  { min: 11, max: 15, level: 'N2', time: 4500 },
  { min: 16, max: 99, level: 'N1', time: 3500 },
];

const OPPONENTS = [
  // 普通对手
  { id: 'rookie',    icon: '😤', name: '新人拳手', color: '#f59e0b', boss: false,
    hitFace: '😵', koFace: '💀' },
  { id: 'fighter',   icon: '😠', name: '格斗者',   color: '#ef4444', boss: false,
    hitFace: '😫', koFace: '😵' },
  { id: 'veteran',   icon: '🤨', name: '老手',     color: '#8b5cf6', boss: false,
    hitFace: '😰', koFace: '💫' },
  { id: 'champion',  icon: '🏆', name: '冠军',     color: '#ec4899', boss: false,
    hitFace: '😱', koFace: '🤯' },
  // Boss
  { id: 'boss1',     icon: '👹', name: '拳王',     color: '#dc2626', boss: true,
    hitFace: '😡', koFace: '😭' },
  { id: 'boss2',     icon: '🥷', name: '忍者拳手', color: '#1d4ed8', boss: true,
    hitFace: '😤', koFace: '😵' },
];

// ============================================================
// 状态
// ============================================================
let state = {
  round: 1,
  hp: MAX_HP, maxHp: MAX_HP,
  opponentHp: ROUNDS_PER_OPPONENT, opponentMaxHp: ROUNDS_PER_OPPONENT,
  combo: 0, maxCombo: 0,
  score: 0,
  isPlaying: false,
  isBoss: false,
  selectedLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
  quizMode: 'word',
  currentOpponent: null,
  animating: false,
  winStreak: 0,
  consecutiveCorrect: 0, // 连续答对计数（用于 20 连胜 KO）
};

let currentQuestion = null;
let timerId = null;

const el = {};

// ============================================================
// 辅助函数（复用 tower-climb 的逻辑）
// ============================================================
function getDifficulty(round) {
  for (const d of DIFFICULTY_TABLE) {
    if (round >= d.min && round <= d.max) return d;
  }
  return DIFFICULTY_TABLE[DIFFICULTY_TABLE.length - 1];
}

function hasChinese(str) {
  if (!str) return false;
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    if ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF)) return true;
  }
  return false;
}

let _cachedByLevel = {};
let _cachedByLevelCn = {};

function cacheByLevel() {
  if (Object.keys(_cachedByLevel).length > 0) return;
  if (typeof VOCAB_DATA === 'undefined') return;
  for (const w of VOCAB_DATA) {
    const lv = (w.level || 'N5').toUpperCase().replace(/^N/,'N');
    if (!_cachedByLevel[lv]) _cachedByLevel[lv] = [];
    _cachedByLevel[lv].push(w);
    if (!_cachedByLevelCn[lv]) _cachedByLevelCn[lv] = [];
    if (hasChinese(w.meaning)) _cachedByLevelCn[lv].push(w);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomWords(level, exclude, count = 3) {
  let pool = [];
  const source = state.quizMode === 'word' ? _cachedByLevelCn : _cachedByLevel;
  if (state.selectedLevels.includes(level)) {
    const p = source[level];
    if (p && p.length) pool = pool.concat(p);
  }
  if (pool.length < count) {
    for (const lv of state.selectedLevels) {
      const p = source[lv];
      if (p && p.length) pool = pool.concat(p);
    }
  }
  if (pool.length === 0) pool = _cachedByLevel[level] || _cachedByLevel['N5'];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const result = [];
  for (const w of shuffled) {
    if (w.id === exclude) continue;
    if (!result.find(r => r.meaning === w.meaning)) {
      result.push(w);
      if (result.length >= count) break;
    }
  }
  return result;
}

// 发音
let _jpVoice = null;
let _voiceReady = false;

function initVoice() {
  if (_voiceReady || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = function() {
      const v = window.speechSynthesis.getVoices();
      _jpVoice = v.find(vv => vv.lang.startsWith('ja')) || null;
      _voiceReady = true;
    };
    return;
  }
  _jpVoice = voices.find(v => v.lang.startsWith('ja')) || null;
  _voiceReady = true;
}

function speak(text, lang = 'ja-JP') {
  try {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.85;
    if (_jpVoice) utter.voice = _jpVoice;
    window.speechSynthesis.speak(utter);
  } catch(e) {}
}

// ============================================================
// 音效
// ============================================================
let _audioCtx = null;
function getCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return _audioCtx;
}

function playTone(freq, duration, type, vol) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

const SFX = {};
SFX.punch = function() {
  playTone(200, 0.08, 'sawtooth', 0.12);
  setTimeout(() => playTone(120, 0.06, 'sawtooth', 0.08), 40);
};
SFX.hit = function() { playTone(400, 0.15, 'square', 0.1); };
SFX.combo = function() { playTone(600, 0.1, 'sine', 0.08); setTimeout(() => playTone(800, 0.15, 'sine', 0.08), 80); };
SFX.wrong = function() { playTone(150, 0.2, 'sawtooth', 0.1); };
SFX.ko = function() {
  playTone(300, 0.1, 'square', 0.1);
  setTimeout(() => playTone(200, 0.15, 'square', 0.08), 100);
  setTimeout(() => playTone(100, 0.3, 'square', 0.06), 200);
};
SFX.bossAppear = function() {
  playTone(400, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(500, 0.1, 'sine', 0.08), 100);
  setTimeout(() => playTone(600, 0.15, 'sine', 0.1), 200);
};

// ============================================================
// 出题
// ============================================================
function generateQuestion() {
  const diff = getDifficulty(state.round);
  const level = diff.level;
  let pool = [];
  const source = state.quizMode === 'word' ? _cachedByLevelCn : _cachedByLevel;
  if (state.selectedLevels.includes(level)) {
    const p = source[level];
    if (p && p.length) pool = pool.concat(p);
  }
  if (pool.length === 0) {
    for (const lv of state.selectedLevels) {
      const p = source[lv];
      if (p && p.length) pool = pool.concat(p);
    }
  }
  if (pool.length === 0) {
    pool = source[level] || _cachedByLevel['N5'];
  }
  if (!pool || pool.length === 0) return null;

  const word = pool[Math.floor(Math.random() * pool.length)];
  const distractors = getRandomWords(level, word.id, 2); // 拳击只出3选项

  // 单词模式：显示日语选中文
  const options = [
    { text: word.meaning || word.word, correct: true },
    ...distractors.map(w => ({ text: w.meaning || w.word, correct: false })),
  ];
  shuffle(options);

  speak(word.word);

  return {
    word, options,
    displayWord: word.word,
    displayReading: word.reading || '',
    displaySentence: word.ex_jp || '',
    displayMeaning: word.meaning || '',
    timeLimit: state.isBoss ? diff.time - 1000 : diff.time,
    level,
  };
}

// ============================================================
// 对手选择
// ============================================================
function pickOpponent() {
  const isBoss = state.round % BOSS_INTERVAL === 0;
  const bossPool = OPPONENTS.filter(o => o.boss);
  const normalPool = OPPONENTS.filter(o => !o.boss);
  const pool = isBoss ? bossPool : normalPool;
  const opp = pool[Math.floor(Math.random() * pool.length)];
  state.isBoss = isBoss;
  state.opponentHp = ROUNDS_PER_OPPONENT + (isBoss ? 2 : 0); // Boss 多 2 血
  state.opponentMaxHp = state.opponentHp;
  state.currentOpponent = opp;
  if (isBoss) SFX.bossAppear();
}

// ============================================================
// 渲染
// ============================================================
function renderRing() {
  const container = document.getElementById('p-game');
  if (!container) return;
  
  const opp = state.currentOpponent || { icon: '😤', name: '???', color: '#888', hitFace: '😵', koFace: '💀' };
  const oppHpPct = state.opponentHp / state.opponentMaxHp * 100;
  
  container.innerHTML = `
    <style>
      @keyframes bxPunch {
        0% { transform:translate(0,0) rotate(0deg); }
        20% { transform:translate(30px,-20px) rotate(-15deg) scale(1.3); }
        40% { transform:translate(60px,-10px) rotate(-5deg) scale(1.1); }
        60% { transform:translate(30px,-20px) rotate(-15deg) scale(1.2); }
        100% { transform:translate(0,0) rotate(0deg); }
      }
      @keyframes bxHitShake {
        0%,100% { transform:translateX(0) rotate(0deg); }
        15% { transform:translateX(-20px) rotate(-8deg); }
        30% { transform:translateX(15px) rotate(5deg); }
        45% { transform:translateX(-10px) rotate(-3deg); }
        60% { transform:translateX(8px) rotate(2deg); }
      }
      @keyframes bxOpponentPunch {
        0% { transform:translate(0,0); }
        30% { transform:translate(-40px,10px); }
        60% { transform:translate(-30px,5px); }
        100% { transform:translate(0,0); }
      }
      @keyframes bxScreenShake {
        0%,100% { transform:translate(0,0); }
        20% { transform:translate(-6px,3px); }
        40% { transform:translate(6px,-3px); }
        60% { transform:translate(-4px,2px); }
        80% { transform:translate(4px,-2px); }
      }
      @keyframes bxFloatUp {
        0% { opacity:1; transform:translateY(0) scale(1); }
        100% { opacity:0; transform:translateY(-50px) scale(1.5); }
      }
      @keyframes bxBounceIn {
        0% { transform:scale(0.3); opacity:0; }
        50% { transform:scale(1.15); }
        70% { transform:scale(0.9); }
        100% { transform:scale(1); opacity:1; }
      }
      @keyframes bxPulse {
        0%,100% { opacity:1; transform:scale(1); }
        50% { opacity:0.7; transform:scale(1.05); }
      }
      .bx-ring {
        display:flex; flex-direction:column; height:100%;
        background:radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #0a0a18 100%);
        position:relative; overflow:hidden;
      }
      /* 聚光灯效果 */
      .bx-ring::before {
        content:''; position:absolute; top:0; left:50%; transform:translateX(-50%);
        width:200px; height:300px;
        background:radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%);
        pointer-events:none;
      }
      /* 擂台地板线 */
      .bx-ring::after {
        content:''; position:absolute; bottom:80px; left:5%; right:5%;
        height:3px;
        background:linear-gradient(90deg, transparent, rgba(255,215,0,0.1) 20%, rgba(255,215,0,0.15) 50%, rgba(255,215,0,0.1) 80%, transparent);
        border-radius:2px;
      }
    </style>
    <div class="bx-ring" id="bx-ring">
      <!-- HUD -->
      <div style="display:flex;justify-content:space-between;padding:8px 14px;flex-shrink:0;z-index:10">
        <div>
          <div style="font-size:11px;color:#94a3b8;font-weight:600">ROUND ${state.round}</div>
          <div style="font-size:17px;letter-spacing:1px" id="bx-hp">
            ${'❤️'.repeat(state.hp)}${'🖤'.repeat(state.maxHp - state.hp)}
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#94a3b8;font-weight:600">SCORE</div>
          <div style="font-size:17px;color:#fbbf24;font-weight:700" id="bx-score">${state.score}</div>
        </div>
      </div>
      
      <!-- 对手区 -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;min-height:0">
        <!-- 对手血量 -->
        <div style="width:140px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;margin-bottom:6px">
          <div style="height:100%;width:${oppHpPct}%;background:linear-gradient(90deg,#22c55e,#ef4444);border-radius:3px;transition:width 0.3s ease-out" id="bx-opp-hp-bar"></div>
        </div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:10px" id="bx-opp-name">${opp.icon} ${opp.name}</div>
        
        <!-- 对手表情 -->
        <div id="bx-opp-face" style="font-size:72px;margin-bottom:6px;transition:all 0.15s;user-select:none;line-height:1">
          ${opp.icon}
        </div>
        <div style="font-size:10px;color:#64748b">👊 ${state.opponentHp}/${state.opponentMaxHp}</div>
        
        <!-- 浮字区 -->
        <div id="bx-float" style="position:absolute;top:35%;left:50%;transform:translateX(-50%);font-size:36px;font-weight:900;pointer-events:none;z-index:5;text-shadow:0 0 40px rgba(255,255,255,0.3)"></div>
        
        <!-- 方向显示 -->
        <div id="bx-dir-display" style="position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);font-size:22px;font-weight:800;text-shadow:0 2px 12px rgba(0,0,0,0.8);z-index:20;pointer-events:none;white-space:nowrap;text-align:center"></div>
      </div>
      
      <!-- 问题区 -->
      <div style="flex-shrink:0;text-align:center;padding:0 16px 10px">
        <div style="font-size:28px;font-weight:700;color:#e2e8f0;letter-spacing:2px;margin-bottom:10px;text-shadow:0 0 20px rgba(168,85,247,0.2)" id="bx-word">
          ${currentQuestion ? currentQuestion.displayWord : '🥊 准备战斗'}
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:8px" id="bx-level">
          ${currentQuestion ? currentQuestion.level + ' · ' + currentQuestion.displayReading : ''}
        </div>
        
        <!-- 选项（拳击目标） -->
        <div style="display:flex;gap:8px;justify-content:center" id="bx-options">
        </div>
        
        <!-- 连击 -->
        <div style="margin-top:6px;font-size:11px;color:#94a3b8;transition:all 0.2s" id="bx-combo">
          ${state.combo > 0 ? `🔥 ${state.combo} 连击` : ''}
        </div>
      </div>
      
      <!-- 拳击手套（第一人称视角底部） -->
      <div style="flex-shrink:0;height:60px;display:flex;justify-content:center;align-items:center;position:relative;z-index:2;overflow:hidden">
        <div id="bx-glove-left" style="font-size:34px;transform:rotate(10deg);margin-right:-8px;transition:transform 0.1s">🥊</div>
        <div id="bx-glove-right" style="font-size:38px;transform:rotate(-10deg);margin-left:-8px;transition:transform 0.1s">🥊</div>
      </div>
      
      <!-- 计时器 -->
      <div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);z-index:10">
        <div id="bx-timer" style="font-size:11px;color:#64748b;font-weight:600;font-variant-numeric:tabular-nums">--</div>
      </div>
    </div>
  `;
  
  // 绑定选项
  if (currentQuestion) {
    renderOptions();
  }
}

function renderOptions() {
  const container = document.getElementById('bx-options');
  if (!container || !currentQuestion) return;
  
  container.innerHTML = currentQuestion.options.map((opt, i) => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e'];
    const positions = ['rotate(-5deg)', 'rotate(0deg)', 'rotate(5deg)'];
    return `<div class="bx-opt" data-index="${i}" style="
      flex:1; max-width:140px; padding:14px 6px; border-radius:16px;
      background:linear-gradient(135deg, ${colors[i]}22, ${colors[i]}11);
      border:2px solid ${colors[i]}44;
      color:#eaeaea; font-size:14px; font-weight:600; text-align:center;
      cursor:pointer; transition:all 0.15s; user-select:none;
      ${positions[i]};
      animation:bxBounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both;
    ">${opt.text}</div>`;
  }).join('');
  
  container.querySelectorAll('.bx-opt').forEach(el => {
    el.addEventListener('click', function() {
      const idx = parseInt(this.dataset.index);
      handleAnswer(idx);
    });
    el.addEventListener('mouseenter', function() {
      if (!state.animating) {
        this.style.transform = 'scale(1.08) translateY(-4px)';
        this.style.borderColor = this.style.borderColor.replace('44', 'aa');
        this.style.boxShadow = '0 4px 20px rgba(255,255,255,0.1)';
      }
    });
    el.addEventListener('mouseleave', function() {
      if (!state.animating) {
        this.style.transform = '';
        this.style.boxShadow = '';
      }
    });
  });
}

// ============================================================
// 游戏逻辑
// ============================================================
function handleAnswer(index) {
  if (state.animating || !currentQuestion) return;
  state.animating = true;
  
  const opt = currentQuestion.options[index];
  const isCorrect = opt && opt.correct;
  
  if (isCorrect) {
    onCorrect(index);
  } else {
    onWrong(index);
  }
}

function onCorrect(index) {
  state.combo++;
  state.consecutiveCorrect++;
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  state.score += 10 * state.combo;
  
  // 方向系统：我方随机出拳 vs 对方随机防3方向
  const punchIdx = Math.floor(Math.random() * 4);
  const punch = DIRECTIONS[punchIdx];
  // 对方随机选1个方向不防（即防3个方向）
  const unguardedIdx = Math.floor(Math.random() * 4);
  const isBlocked = punchIdx !== unguardedIdx;
  
  SFX.punch();
  
  // 拳击手套动画
  const glove = document.getElementById('bx-glove-right');
  if (glove) {
    glove.style.animation = 'bxPunch 0.35s ease-out';
    setTimeout(() => { if (glove) glove.style.animation = ''; }, 400);
  }
  
  // 显示出拳方向
  const dirEl = document.getElementById('bx-dir-display');
  if (dirEl) {
    dirEl.textContent = isBlocked ? '🛡️ 被格挡！' : (punch.icon + ' ' + punch.name + '！');
    dirEl.style.color = isBlocked ? '#94a3b8' : '#fbbf24';
    dirEl.style.animation = 'none';
    void dirEl.offsetHeight;
    dirEl.style.animation = 'bxFloatUp 0.8s ease-out forwards';
    setTimeout(() => { if (dirEl) dirEl.textContent = ''; }, 900);
  }
  
  // 被格挡 → 无伤害
  if (isBlocked) {
    showFloat('🛡️', '#94a3b8');
    updateHUD();
    setTimeout(() => {
      state.animating = false;
      if (state.isPlaying) nextRound();
    }, 400);
    return;
  }
  
  // 打中了！
  // 检查 20 连胜 KO
  if (state.consecutiveCorrect >= INSTANT_KO_STREAK) {
    state.opponentHp = 1; // 下一击 KO
    showFloat('🔥🔥 20连胜！必杀一击！🔥🔥', '#ff6b6b');
    SFX.ko();
  }
  
  // 对手受击
  const oppFace = document.getElementById('bx-opp-face');
  const opp = state.currentOpponent;
  if (oppFace && opp) {
    oppFace.style.animation = 'bxHitShake 0.4s ease-out';
    oppFace.textContent = opp.hitFace || '😵';
    setTimeout(() => {
      if (oppFace) {
        oppFace.style.animation = '';
        oppFace.textContent = opp.icon;
      }
    }, 500);
  }
  
  // 屏幕震动
  const ring = document.getElementById('bx-ring');
  if (ring) ring.style.animation = 'bxScreenShake 0.2s ease-out';
  setTimeout(() => { if (ring) ring.style.animation = ''; }, 200);
  
  // 连击反馈
  if (state.combo >= 3) {
    SFX.combo();
    showFloat('🔥 ' + state.combo + '连击！', '#fbbf24');
  }
  
  // 对手扣血
  state.opponentHp--;
  const hpBar = document.getElementById('bx-opp-hp-bar');
  if (hpBar) {
    const pct = state.opponentHp / state.opponentMaxHp * 100;
    hpBar.style.width = pct + '%';
  }
  
  // 判断是否 KO
  if (state.opponentHp <= 0) {
    SFX.ko();
    if (oppFace && opp) oppFace.textContent = opp.koFace || '💀';
    state.winStreak++;
    state.round++;
    state.consecutiveCorrect = 0; // KO 后重置连胜计数
    
    showFloat('💥 KO！+' + (state.isBoss ? 200 : 100), '#22c55e');
    state.score += state.isBoss ? 200 : 100;
    
    state.combo = 0;
    
    setTimeout(() => {
      state.animating = false;
      nextOpponent();
    }, 1500);
    updateHUD();
    return;
  }
  
  // 打中但未 KO
  showFloat('💥 +' + (10 * state.combo), '#22c55e');
  updateHUD();
  
  setTimeout(() => {
    state.animating = false;
    if (state.isPlaying) nextRound();
  }, 500);
}

function onWrong(index) {
  state.combo = 0;
  state.consecutiveCorrect = 0;
  
  // 方向系统：对方随机攻1方向 vs 我方随机防1方向
  const attackIdx = Math.floor(Math.random() * 4);
  const attack = DIRECTIONS[attackIdx];
  const guardIdx = Math.floor(Math.random() * 4);
  const isGuarded = attackIdx === guardIdx;
  
  // 方向显示
  const dirEl = document.getElementById('bx-dir-display');
  if (dirEl) {
    dirEl.textContent = isGuarded ? ('🛡️ 防御成功！挡住 ' + attack.icon) : (attack.icon + ' 对方' + attack.name + '！');
    dirEl.style.color = isGuarded ? '#4ecca3' : '#ef4444';
    dirEl.style.animation = 'none';
    void dirEl.offsetHeight;
    dirEl.style.animation = 'bxFloatUp 0.8s ease-out forwards';
    setTimeout(() => { if (dirEl) dirEl.textContent = ''; }, 900);
  }
  
  // 防御成功 → 无伤害
  if (isGuarded) {
    SFX.hit();
    showFloat('🛡️ 防御！', '#4ecca3');
    updateHUD();
    setTimeout(() => {
      state.animating = false;
      if (state.isPlaying) nextRound();
    }, 400);
    return;
  }
  
  SFX.wrong();
  state.hp--;
  
  // 屏幕震动更剧烈
  const ring = document.getElementById('bx-ring');
  if (ring) ring.style.animation = 'bxScreenShake 0.4s ease-out';
  setTimeout(() => { if (ring) ring.style.animation = ''; }, 400);
  
  // 对手挥拳动画
  const oppFace = document.getElementById('bx-opp-face');
  if (oppFace) oppFace.style.animation = 'bxOpponentPunch 0.3s ease-out';
  setTimeout(() => { if (oppFace) oppFace.style.animation = ''; }, 300);
  
  // 我方手套后仰
  const glove = document.getElementById('bx-glove-left');
  if (glove) {
    glove.style.transform = 'rotate(30deg) translateX(-10px)';
    setTimeout(() => { if (glove) glove.style.transform = 'rotate(10deg)'; }, 300);
  }
  
  showFloat('😵 被击中！', '#ef4444');
  
  if (state.hp <= 0) {
    setTimeout(() => {
      state.animating = false;
      gameOver();
    }, 800);
    updateHUD();
    return;
  }
  
  updateHUD();
  setTimeout(() => {
    state.animating = false;
    if (state.isPlaying) nextRound();
  }, 600);
}

function showFloat(text, color) {
  const el = document.getElementById('bx-float');
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'bxFloatUp 0.8s ease-out forwards';
}

// ============================================================
// 游戏流程
// ============================================================
function nextOpponent() {
  pickOpponent();
  renderRing();
  updateHUD();
  nextRound();
}

function nextRound() {
  if (!state.isPlaying) return;
  // 不设置 animating = true，让 handleAnswer / onTimeout 管理动画锁
  currentQuestion = generateQuestion();
  
  const wordEl = document.getElementById('bx-word');
  const levelEl = document.getElementById('bx-level');
  if (wordEl) wordEl.textContent = currentQuestion ? currentQuestion.displayWord : '---';
  if (levelEl) levelEl.textContent = currentQuestion ? currentQuestion.level + ' · ' + currentQuestion.displayReading : '';
  
  renderOptions();
  updateHUD();
  startTimer();
}

function updateHUD() {
  const hpEl = document.getElementById('bx-hp');
  if (hpEl) hpEl.innerHTML = '❤️'.repeat(state.hp) + '🖤'.repeat(state.maxHp - state.hp);
  
  const scoreEl = document.getElementById('bx-score');
  if (scoreEl) scoreEl.textContent = state.score;
  
  const comboEl = document.getElementById('bx-combo');
  if (comboEl) comboEl.textContent = state.combo >= 2 ? `🔥 ${state.combo} 连击` : '';
  
  const oppHpEl = document.getElementById('bx-opp-hp-bar');
  if (oppHpEl) {
    const pct = state.opponentHp / state.opponentMaxHp * 100;
    oppHpEl.style.width = pct + '%';
  }
  
  const oppNameEl = document.getElementById('bx-opp-name');
  if (oppNameEl && state.currentOpponent) {
    oppNameEl.textContent = `${state.currentOpponent.icon} ${state.currentOpponent.name}`;
  }
  
  const faceEl = document.getElementById('bx-opp-face');
  if (faceEl && state.currentOpponent) {
    faceEl.textContent = state.currentOpponent.icon;
  }
}

function startTimer() {
  const timerEl = document.getElementById('bx-timer');
  if (!timerEl || !currentQuestion) return;
  
  const timeLimit = currentQuestion.timeLimit || 7000;
  const startTime = Date.now();
  
  if (timerId) clearInterval(timerId);
  
  timerId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimit - elapsed);
    const secs = (remaining / 1000).toFixed(1);
    timerEl.textContent = secs + 's';
    
    if (remaining < 2000) {
      timerEl.style.color = '#ef4444';
      timerEl.style.animation = 'bxPulse 0.5s ease-in-out infinite';
    } else if (remaining < 4000) {
      timerEl.style.color = '#fbbf24';
      timerEl.style.animation = '';
    } else {
      timerEl.style.color = '#64748b';
      timerEl.style.animation = '';
    }
    
    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      onTimeout();
    }
  }, 100);
}

function onTimeout() {
  if (state.animating) return;
  state.animating = true;
  state.consecutiveCorrect = 0;
  SFX.wrong();
  
  state.combo = 0;
  state.hp--;
  
  const ring = document.getElementById('bx-ring');
  if (ring) ring.style.animation = 'bxScreenShake 0.4s ease-out';
  setTimeout(() => { if (ring) ring.style.animation = ''; }, 400);
  
  const oppFace = document.getElementById('bx-opp-face');
  if (oppFace) oppFace.style.animation = 'bxOpponentPunch 0.3s ease-out';
  setTimeout(() => { if (oppFace) oppFace.style.animation = ''; }, 300);
  
  showFloat('⏰ 超时！', '#ef4444');
  
  if (state.hp <= 0) {
    updateHUD();
    setTimeout(() => { state.animating = false; gameOver(); }, 800);
  } else {
    updateHUD();
    setTimeout(() => { state.animating = false; if (state.isPlaying) nextRound(); }, 600);
  }
}

function gameOver() {
  state.isPlaying = false;
  if (timerId) { clearInterval(timerId); timerId = null; }
  
  const container = document.getElementById('p-game');
  if (!container) return;
  
  const isHighScore = state.score > (parseInt(localStorage.getItem('bx_high_score') || '0'));
  if (isHighScore) localStorage.setItem('bx_high_score', state.score);
  
  container.innerHTML = `
    <style>
      @keyframes bxGameOver {
        0% { transform:scale(0.5); opacity:0; }
        60% { transform:scale(1.1); }
        100% { transform:scale(1); opacity:1; }
      }
    </style>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:30px;text-align:center">
      <div style="font-size:60px;margin-bottom:10px;animation:bxGameOver 0.6s cubic-bezier(0.34,1.56,0.64,1) both">😵</div>
      <div style="font-size:22px;font-weight:800;color:#ef4444;margin-bottom:4px">你被击倒了！</div>
      <div style="font-size:13px;color:#94a3b8;margin-bottom:16px">坚持了 ${state.round} 回合 · ${state.score} 分</div>
      ${isHighScore ? '<div style="font-size:14px;color:#fbbf24;font-weight:700;margin-bottom:10px">🏆 新纪录！</div>' : ''}
      <div style="font-size:12px;color:#64748b;margin-bottom:16px">
        🔥 最高连击 ${state.maxCombo} · 🏆 最高分 ${localStorage.getItem('bx_high_score') || state.score}
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="GameBoxing.start()" style="padding:12px 28px;border-radius:24px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 24px rgba(239,68,68,0.3);transition:all 0.2s">🔄 再来一局</button>
        <button onclick="window.GameBoxing.backToMenu()" style="padding:12px 20px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#94a3b8;font-size:13px;cursor:pointer;transition:all 0.2s">🔙 返回</button>
      </div>
    </div>
  `;
}

// ============================================================
// 启动 / 菜单
// ============================================================
function start() {
  cacheByLevel();
  state.round = 1;
  state.hp = MAX_HP;
  state.maxHp = MAX_HP;
  state.combo = 0;
  state.maxCombo = 0;
  state.score = 0;
  state.isPlaying = true;
  state.winStreak = 0;
  state.animating = false;
  state.consecutiveCorrect = 0;
  
  pickOpponent();
  renderRing();
  updateHUD();
  nextRound();
}

function init() {
  cacheByLevel();
  initVoice();
  
  const container = document.getElementById('p-game');
  if (!container) return;
  
  container.innerHTML = `
    <style>
      @keyframes bxEntrance {
        0% { transform:translateY(20px); opacity:0; }
        100% { transform:translateY(0); opacity:1; }
      }
    </style>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:30px;text-align:center;background:radial-gradient(ellipse at 50% 30%, #1a1a2e, #0a0a18)">
      <div style="font-size:48px;margin-bottom:10px;animation:bxBounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both">🥊</div>
      <div style="font-size:20px;font-weight:800;color:#e2e8f0;margin-bottom:4px;background:linear-gradient(135deg,#ef4444,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent">单词拳击</div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:16px;line-height:1.8">
        第一人称 · 出拳打中正确答案<br>
        <span style="color:#22c55e">✅ 答对出拳</span> · <span style="color:#ef4444">❌ 答错挨打</span><br>
        <span style="color:#64748b">🔥 连击越多伤害越高</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px;width:200px">
        <button onclick="GameBoxing.start()" style="padding:14px 24px;border-radius:24px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 24px rgba(239,68,68,0.3);transition:all 0.2s">🥊 开始战斗</button>
        <button onclick="GameBoxing.backToMenu()" style="padding:10px 20px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#64748b;font-size:12px;cursor:pointer;transition:all 0.2s">🔙 返回游戏选择</button>
      </div>
      <div style="margin-top:14px;font-size:10px;color:#4a4a6a">
        最高分: ${localStorage.getItem('bx_high_score') || '无'}
      </div>
    </div>
  `;
  
  // 按钮悬停效果
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// 返回游戏菜单（调用 tower-climb 的 init 显示选择界面）
window.GameBoxing = { init, start, backToMenu: function() {
  if (typeof Game !== 'undefined' && Game.init) {
    Game.init(); // tower-climb 的 init 显示游戏选择
  }
} };

})();
