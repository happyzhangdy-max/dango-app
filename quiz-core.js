// ── quiz-core.js — 增强版真题题库核心 ──
// 覆盖 inline.js 中的旧版 quiz 函数
// 依赖: QUIZ_DATA_REAL 在外部已加载

// ── 工具函数 ──
function escHtml(s) { if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function shuffle(a) { for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
function speakText(t){ if(window.speak && t) speak(t); }

// ── 格式化解析（理由/陷阱/秒杀） ──
function formatExplanation(exp) {
  if(!exp) return '';
  var s = escHtml(exp);
  var sections = [];
  // 理由 + 陷阱 + 秒杀
  var m = s.match(/(理由[：:]\s*[^。]*。?)\s*(陷阱[：:]\s*[^。]*。?)\s*(秒杀[：:]\s*[^。]*。?)/);
  if(m) {
    sections.push('<div class="exp-sec exp-reason"><span class="exp-label">📖 理由</span>'+m[1].replace(/^(理由[：:])/,'')+'</div>');
    sections.push('<div class="exp-sec exp-trap"><span class="exp-label">⚠️ 陷阱</span>'+m[2].replace(/^(陷阱[：:])/,'')+'</div>');
    sections.push('<div class="exp-sec exp-tip"><span class="exp-label">⚡ 秒杀</span>'+m[3].replace(/^(秒杀[：:])/,'')+'</div>');
    return sections.join('');
  }
  // 理由 + 陷阱（无秒杀）
  var m2 = s.match(/(理由[：:]\s*[^。]*。?)\s*(陷阱[：:]\s*[^。]*。?)/);
  if(m2) {
    sections.push('<div class="exp-sec exp-reason"><span class="exp-label">📖 理由</span>'+m2[1].replace(/^(理由[：:])/,'')+'</div>');
    sections.push('<div class="exp-sec exp-trap"><span class="exp-label">⚠️ 陷阱</span>'+m2[2].replace(/^(陷阱[：:])/,'')+'</div>');
    return sections.join('');
  }
  return '<div class="exp-sec exp-plain">' + s + '</div>';
}

// ── 全局状态 ──
var QUIZ_MODE = 'all';
var quizPool = [];
var quizData = [], quizIdx = 0, quizRight = 0, quizTotal = 0;
var _answered = false, _lastPassage = '';

// ── Filter/Source 管理 ──
var _filterYear = 'all';

function buildQuizFilterBar() {
  var bar = document.getElementById('quizFilterBar');
  if(!bar) return;
  var years = {};
  (QUIZ_DATA_REAL || []).forEach(function(d) {
    var s = d.source || '未知';
    var y = s.substring(0,4);
    years[y] = (years[y]||0)+1;
  });
  var html = '<button class="filter-btn active" data-year="all" onclick="setQuizFilter(\'all\')">📋 全部</button>';
  Object.keys(years).sort().forEach(function(y) {
    html += '<button class="filter-btn" data-year="' + y + '" onclick="setQuizFilter(\'' + y + '\')">' + y + '年 (' + years[y] + '题)</button>';
  });
  bar.innerHTML = html;
  _filterYear = 'all';
}

function setQuizFilter(year) {
  _filterYear = year;
  document.querySelectorAll('#quizFilterBar .filter-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.year === year);
  });
  buildQuizModeCards();
}

function getFilteredQuizData() {
  if(_filterYear === 'all') return QUIZ_DATA_REAL || [];
  return (QUIZ_DATA_REAL || []).filter(function(d) {
    var s = d.source || '';
    return s.substring(0,4) === _filterYear;
  });
}

// ── Mode cards ──
function buildQuizModeCards() {
  var data = getFilteredQuizData();
  var total = data.length;
  var vocabCount = data.filter(function(d){ return d.type && d.type.indexOf('vocab')!==-1; }).length;
  var grammarCount = data.filter(function(d){ return d.type && d.type.indexOf('grammar')!==-1; }).length;
  var readingCount = data.filter(function(d){ return d.type && d.type.indexOf('reading')!==-1; }).length;

  var sources = {};
  data.forEach(function(d){ var s=d.source||'未知'; sources[s]=(sources[s]||0)+1; });
  var sourceLabel = Object.keys(sources).sort().map(function(s){ return s+' '+sources[s]+'题'; }).join(' · ');

  var cards = document.getElementById('quizModeCards');
  if(!cards) return;
  cards.innerHTML =
    '<div class="mode-card" onclick="startEnhancedQuiz(\'all\')">' +
      '<span class="icon">📋</span><div class="title">随机抽题</div>' +
      '<div class="desc">从当前筛选题库中抽取</div>' +
      '<div class="count">共 '+total+' 题 · '+sourceLabel+'</div></div>' +
    '<div class="mode-card" onclick="startEnhancedQuiz(\'vocab\')">' +
      '<span class="icon">📝</span><div class="title">語彙专项</div>' +
      '<div class="desc">読解・漢字・語形成・文脈規定・言い換え・使い方</div>' +
      '<div class="count">'+vocabCount+' 题</div></div>' +
    '<div class="mode-card" onclick="startEnhancedQuiz(\'grammar\')">' +
      '<span class="icon">📐</span><div class="title">文法专项</div>' +
      '<div class="desc">文法形式判断・排列组合</div>' +
      '<div class="count">'+grammarCount+' 题</div></div>' +
    '<div class="mode-card" onclick="startEnhancedQuiz(\'reading\')">' +
      '<span class="icon">📖</span><div class="title">読解专项</div>' +
      '<div class="desc">短文読解</div>' +
      '<div class="count">'+readingCount+' 题</div></div>';
}

// ── 覆盖 inline.js 的 go() 中的 quiz 初始化 ──
// 在页面切换到 quiz 页时，由 inline.js 的 go() 调用
// 我们额外 hook 初始化
var _origGo = window.go;
// 我们会在下面重写 startQuiz 等函数

// ── 主函数：启动真题练习 ──
function startEnhancedQuiz(mode) {
  var data = getFilteredQuizData();
  var pool;
  if(mode === 'all') {
    pool = data.slice();
  } else {
    pool = data.filter(function(d){ return d.type && d.type.indexOf(mode)!==-1; });
  }
  if(pool.length === 0) { alert('当前筛选下没有题目'); return; }

  shuffle(pool);
  quizData = pool;
  quizIdx = 0;
  quizRight = 0;
  _answered = false;
  _lastPassage = '';
  QUIZ_MODE = mode;

  document.getElementById('quizStart').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizArea').style.display = 'block';
  showEnhancedQuiz();
}

// ── 显示题目 ──
function showEnhancedQuiz() {
  var q = quizData[quizIdx];
  _answered = false;

  // 进度
  document.getElementById('quizProg').textContent = (quizIdx+1)+'/'+quizData.length;
  document.getElementById('quizBar').style.width = (quizIdx/quizData.length*100)+'%';

  // 阅读原文
  var pEl = document.getElementById('quizPassage');
  if(q.passage && q.passage !== _lastPassage) {
    pEl.innerHTML = '<div style="background:#1a2a4a;border-left:3px solid #f5a623;border-radius:0 10px 10px 0;padding:10px 14px;font-size:12px;line-height:1.9;white-space:pre-wrap;color:#c8d6e5;max-height:300px;overflow-y:auto"><b style="color:#f5a623;font-size:10px;display:block;margin-bottom:4px">📖 阅读原文</b>' + escHtml(q.passage).replace(/\n/g,'<br>') + '</div>';
    pEl.style.display = 'block';
    _lastPassage = q.passage;
  } else {
    pEl.style.display = 'none';
  }

  // 徽章
  var sourceBadge = '';
  if(q.source) {
    var yr = q.source.substring(0,4);
    sourceBadge = '<span class="badge badge-'+yr+'">'+escHtml(q.source)+'</span>';
  }
  var typeBadge = '';
  if(q.type) {
    var tLabels = {vocab_reading:'読解',vocab_kanji:'漢字',vocab_formation:'語形成',vocab_context:'文脈規定',vocab_paraphrase:'言い換え',vocab_usage:'使い方',grammar_form:'文法形式判断',grammar_fill:'排列组合',reading_short:'短文読解',reading_mid:'中文読解',reading_long:'長文読解'};
    var tl = tLabels[q.type] || q.type;
    typeBadge = '<span class="badge badge-type">'+escHtml(tl)+'</span>';
  }

  // 题目文本
  var qText = q.question || '';
  if(q.type === 'grammar_fill' && qText) {
    qText = qText.replace(/★/g, '<span class="star-highlight">★</span>');
  }
  document.getElementById('quizQ').innerHTML =
    '<div style="display:flex;align-items:flex-start;gap:8px">' +
    '<span>' + qText + ' ' + typeBadge + ' ' + sourceBadge + '</span>' +
    '<button onclick="speakText(\'' + escAttr(q.question) + '\')" style="flex-shrink:0;background:none;border:none;font-size:18px;cursor:pointer;opacity:0.7;padding:2px" title="读题">🔊</button>' +
    '</div>';

  // 选项
  var optDiv = document.getElementById('quizOpts');
  optDiv.innerHTML = '';
  q.options.forEach(function(o, i) {
    var b = document.createElement('button');
    b.className = 'btn bs q-opt-btn';
    b.style.textAlign = 'left';
    b.style.fontSize = '13px';
    b.style.padding = '10px 14px';
    b.style.display = 'flex';
    b.style.alignItems = 'center';
    b.style.gap = '8px';
    var hasJa = /[\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(o);
    b.innerHTML = '<span class="opt-label">' + (i+1) + '</span>' +
      '<span class="opt-text">' + escHtml(o) + '</span>' +
      (hasJa ? '<span class="opt-speak" onclick="event.stopPropagation();speakText(\''+escAttr(o)+'\')">🔊</span>' : '');
    b.onclick = function() { answerEnhancedQuiz(i); };
    optDiv.appendChild(b);
  });

  // 隐藏反馈和下一题
  document.getElementById('quizFeedback').style.display = 'none';
  document.getElementById('quizNextBtn').style.display = 'none';
}

// ── 答题 ──
function answerEnhancedQuiz(i) {
  if(_answered) return;
  _answered = true;

  var q = quizData[quizIdx];
  var isRight = (i === q.answer);
  if(isRight) quizRight++;

  // 高亮选项
  document.querySelectorAll('#quizOpts .q-opt-btn').forEach(function(b, idx) {
    b.disabled = true;
    if(idx === q.answer) b.classList.add('q-correct');
    if(idx === i && !isRight) b.classList.add('q-wrong');
  });

  // 反馈
  var fb = document.getElementById('quizFeedback');
  // 先把旧反馈按钮的样式清理
  fb.className = '';
  var html = '';
  if(isRight) {
    html += '<div style="color:#4ecca3;font-weight:700;font-size:15px">✅ 正解！</div>';
    fb.style.borderLeft = '3px solid #4ecca3';
  } else {
    html += '<div style="color:#e94560;font-weight:700;font-size:15px">❌ 不正解</div>';
    fb.style.borderLeft = '3px solid #e94560';
    // 记入错题本
    if(typeof addWrong === 'function') addWrong(q);
    html += '<div style="margin-top:6px;font-size:13px;color:#aaa">正解：' + (q.answer+1) + '. ' + escHtml(q.options[q.answer]) + '</div>';
  }

  // 解析
  if(q.explanation) {
    var expHtml = formatExplanation(q.explanation);
    html += '<div class="explain-box">' + expHtml + '</div>';
  }

  // error_analysis（2025-07 独有）
  if(q.error_analysis) {
    var cats = {A:'词汇不认识',B:'文法功能错',C:'读解定位错',D:'推理过度',E:'听漏关键词',F:'时间管理'};
    var catLabel = cats[q.error_analysis.category] || q.error_analysis.category;
    html += '<div class="ea-box">' +
      '<div class="ea-cat">🔍 ' + escHtml(catLabel) + '</div>' +
      '<div class="ea-clue">💡 ' + escHtml(q.error_analysis.clue) + '</div>' +
      '<div class="ea-action">📌 ' + escHtml(q.error_analysis.action) + '</div>' +
    '</div>';
  }

  fb.innerHTML = html;
  fb.style.display = 'block';
  document.getElementById('quizNextBtn').style.display = 'inline-flex';
}

// ── 下一题 ──
function nextQuiz() {
  quizIdx++;
  if(quizIdx >= quizData.length) {
    showQuizResult();
  } else {
    showEnhancedQuiz();
  }
}

// ── 退出 ──
function exitQuiz() {
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizStart').style.display = 'block';
}

// ── 结果页 ──
function showQuizResult() {
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';
  var rate = Math.round(quizRight/quizData.length*100);
  var emo, tit;
  if(rate >= 80) { emo='🎉'; tit='優秀！'; }
  else if(rate >= 60) { emo='😊'; tit='Good！'; }
  else { emo='😢'; tit='要復習'; }
  document.getElementById('quizEmo').textContent = emo;
  document.getElementById('quizTitle').textContent = tit;
  document.getElementById('quizScore').textContent = '正解：'+quizRight+'/'+quizData.length+'（'+rate+'%）';
}

// ── 再练 ──
function retryQuiz() {
  startEnhancedQuiz(QUIZ_MODE);
}

// ── 初始化入口（由 index.html 页面切换时调用） ──
function initQuizPage() {
  var qs = document.getElementById('quizStart');
  if(!qs) return;
  // 只初始化一次
  if(!qs._inited) {
    buildQuizFilterBar();
    buildQuizModeCards();
    qs._inited = true;
  }
  document.getElementById('quizStart').style.display = 'block';
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
}

// ── 覆盖 inline.js 的旧函数 ──
// 保存旧 startQuiz 以便在需要时回退
var _oldStartQuiz = window.startQuiz;

// 覆盖：新增强版本
function startQuiz(mode) {
  startEnhancedQuiz(mode);
}
