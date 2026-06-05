// ── quiz-core.js — 增强版真题题库核心 ──
// 覆盖 inline.js 中的旧版 quiz 函数
// 依赖: QUIZ_DATA_REAL 在外部已加载

// ── 工具函数 ──
function escHtml(s) { if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function shuffle(a) { for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

// ── 格式化解析（理由/陷阱/秒杀） ──
function formatExplanation(exp) {
  if(!exp) return '';
  var s = escHtml(exp);
  var sections = [];
  var m = s.match(/(理由[：:]\s*[^。]*。?)\s*(陷阱[：:]\s*[^。]*。?)\s*(秒杀[：:]\s*[^。]*。?)/);
  if(m) {
    sections.push('<div class="exp-sec exp-reason"><span class="exp-label">📖 理由</span>'+m[1].replace(/^(理由[：:])/,'')+'</div>');
    sections.push('<div class="exp-sec exp-trap"><span class="exp-label">⚠️ 陷阱</span>'+m[2].replace(/^(陷阱[：:])/,'')+'</div>');
    sections.push('<div class="exp-sec exp-tip"><span class="exp-label">⚡ 秒杀</span>'+m[3].replace(/^(秒杀[：:])/,'')+'</div>');
    return sections.join('');
  }
  var m2 = s.match(/(理由[：:]\s*[^。]*。?)\s*(陷阱[：:]\s*[^。]*。?)/);
  if(m2) {
    sections.push('<div class="exp-sec exp-reason"><span class="exp-label">📖 理由</span>'+m2[1].replace(/^(理由[：:])/,'')+'</div>');
    sections.push('<div class="exp-sec exp-trap"><span class="exp-label">⚠️ 陷阱</span>'+m2[2].replace(/^(陷阱[：:])/,'')+'</div>');
    return sections.join('');
  }
  return '<div class="exp-sec exp-plain">' + s + '</div>';
}

// ── 全局状态（_qz前缀避免与inline.js的let声明冲突） ──
var QUIZ_MODE = 'all';
var _qzPool = [];
var _qzData = [], _qzIdx = 0, _qzRight = 0, _qzTotal = 0;
var _qzAnswered = false, _qzLastPassage = '';
var _qzFilterYear = 'all';

// ── 筛选栏构建 ──
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
  _qzFilterYear = 'all';
}

function setQuizFilter(year) {
  _qzFilterYear = year;
  document.querySelectorAll('#quizFilterBar .filter-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.year === year);
  });
}

// ── 模式卡构建 ──
function buildQuizModeCards() {
  var h = '';
  var modes = [
    {k:'all', icon:'📚', label:'综合练习', desc:'所有题型混合随机'},
    {k:'vocab', icon:'📝', label:'文字词汇', desc:'汉字读法、表记等'},
    {k:'grammar_fill', icon:'⭐', label:'★排序文法', desc:'五角星文法填空'},
    {k:'grammar', icon:'📐', label:'语法选择', desc:'近义语法、表达辨析'},
    {k:'reading_mid', icon:'📖', label:'中篇阅读', desc:'短文阅读理解'}
  ];
  modes.forEach(function(m) {
    h += '<div class="quiz-mode-card" onclick="startEnhancedQuiz(\'' + m.k + '\')">'
      + '<div class="qm-icon">' + m.icon + '</div>'
      + '<div class="qm-title">' + m.label + '</div>'
      + '<div class="qm-desc">' + m.desc + '</div>'
      + '</div>';
  });
  var container = document.getElementById('quizModeCards');
  if(container) container.innerHTML = h;
}

// ── ★星号高亮处理 ──
function processStarQuestion(q) {
  if(!q.question) return q.question;
  return q.question.replace(/★/g, '<span class="star-highlight">★</span>');
}

// ── 启动增强版题库 ──
function startEnhancedQuiz(mode) {
  QUIZ_MODE = mode || 'all';
  
  var all = QUIZ_DATA_REAL || [];
  var filtered = all;
  if(_qzFilterYear && _qzFilterYear !== 'all') {
    filtered = all.filter(function(d) { return (d.source||'').indexOf(_qzFilterYear) === 0; });
  }
  
  if(QUIZ_MODE !== 'all') {
    if(QUIZ_MODE === 'vocab') {
      filtered = filtered.filter(function(d) {
        var t = d.type || '';
        return t === 'vocab' || t === 'kanji' || t === 'orthography' || t === 'word_formation' || t === 'vocab_context' || t === 'word_usage' || t === 'synonym' || t === 'usage';
      });
    } else {
      filtered = filtered.filter(function(d) { return d.type === QUIZ_MODE; });
    }
  }
  
  if(filtered.length === 0) {
    var a = document.getElementById('quizArea');
    if(a) a.innerHTML = '<p style="color:#666;text-align:center;padding:40px;">当前筛选条件下无题目，请切换筛选。</p>';
    return;
  }
  
  _qzPool = shuffle([].concat(filtered));
  _qzData = _qzPool.slice(0, Math.min(20, _qzPool.length));
  _qzIdx = 0;
  _qzRight = 0;
  _qzAnswered = false;
  _qzLastPassage = '';
  _qzTotal = _qzData.length;
  
  // 隐藏开始界面，显示答题区
  var start = document.getElementById('quizStart');
  if(start) start.style.display = 'none';
  
  showEnhancedQuiz();
  if(window.speak && _qzData[0]) {
    try { speak(_qzData[0].question); } catch(e) {}
  }
}

// ── 显示当前题 ──
function showEnhancedQuiz() {
  var q = _qzData[_qzIdx];
  if(!q) return showQuizResult();
  
  // 显示 quizArea
  var area = document.getElementById('quizArea');
  if(!area) return;
  area.style.display = 'block';
  
  // 隐藏结果页
  var res = document.getElementById('quizResult');
  if(res) res.style.display = 'none';
  
  // 进度文字
  var prog = document.getElementById('quizProg');
  if(prog) {
    var t = '第 ' + (_qzIdx+1) + '/' + _qzTotal + ' 题';
    if(q.source) t += ' · ' + escHtml(q.source);
    if(q.type_label) t += ' · ' + escHtml(q.type_label);
    prog.textContent = t;
  }
  
  // 篇章区
  var passage = document.getElementById('quizPassage');
  if(passage) {
    if(q.passage) {
      passage.style.display = 'block';
      passage.innerHTML = '<div class="quiz-passage-box">' + escHtml(q.passage) + '</div>';
    } else {
      passage.style.display = 'none';
    }
  }
  
  // 题目
  var qDiv = document.getElementById('quizQ');
  if(qDiv) {
    qDiv.innerHTML = processStarQuestion(q);
  }
  
  // 选项
  var opts = document.getElementById('quizOpts');
  if(opts) {
    var html = '';
    (q.options || []).forEach(function(opt, i) {
      var label = String.fromCharCode(65+i);
      html += '<button class="quiz-opt-btn" onclick="checkQuizAnswer(' + i + ')">'
        + '<span class="opt-label">' + label + '</span>'
        + '<span class="opt-text">' + escHtml(opt) + '</span>'
        + '</button>';
    });
    opts.innerHTML = html;
  }
  
  // 隐藏反馈和下一题按钮
  var fb = document.getElementById('quizFeedback');
  if(fb) { fb.style.display = 'none'; fb.innerHTML = ''; }
  var nb = document.getElementById('quizNextBtn');
  if(nb) nb.style.display = 'none';
  
  _qzAnswered = false;
}

// ── 检查答案 ──
function checkQuizAnswer(idx) {
  if(_qzAnswered) return;
  _qzAnswered = true;
  
  var q = _qzData[_qzIdx];
  if(!q) return;
  
  var correct = q.answer;
  var isRight = (idx === correct);
  if(isRight) _qzRight++;
  
  // 高亮选项
  var btns = document.querySelectorAll('#quizOpts .quiz-opt-btn');
  btns.forEach(function(b, i) {
    b.classList.add(i === correct ? 'correct' : (i === idx && !isRight ? 'wrong' : 'dimmed'));
    b.disabled = true;
  });
  
  // 构建反馈
  var fbHtml = '';
  if(isRight) {
    fbHtml += '<div class="quiz-fb-correct">✅ 正确！</div>';
  } else {
    fbHtml += '<div class="quiz-fb-wrong">❌ 错误！正确答案：' + String.fromCharCode(65+correct) + '</div>';
  }
  
  if(q.explanation) {
    fbHtml += '<div class="quiz-explain-box">' + formatExplanation(q.explanation) + '</div>';
  }
  if(q.error_analysis) {
    var ea = q.error_analysis;
    var eaStr = '';
    if(typeof ea === 'object') {
      if(ea.category) eaStr += '<span class="ea-cat ea-cat-' + escAttr(ea.category) + '">' + escHtml(ea.category) + '</span> ';
      if(ea.clue) eaStr += '<div><strong>🔍 线索：</strong>' + escHtml(ea.clue) + '</div>';
      if(ea.action) eaStr += '<div><strong>💡 行动：</strong>' + escHtml(ea.action) + '</div>';
    } else {
      eaStr = escHtml(String(ea));
    }
    fbHtml += '<div class="quiz-ea-box">' + eaStr + '</div>';
  }
  if(q.note) {
    fbHtml += '<div class="quiz-note-box">💡 ' + escHtml(q.note) + '</div>';
  }
  
  // 显示反馈
  var fb = document.getElementById('quizFeedback');
  if(fb) {
    fb.innerHTML = fbHtml;
    fb.style.display = 'block';
  }
  
  // 显示下一题按钮，改文案
  var nb = document.getElementById('quizNextBtn');
  if(nb) {
    nb.style.display = 'inline-block';
    nb.textContent = _qzIdx < _qzTotal - 1 ? '下一题 →' : '查看结果';
    nb.onclick = nextEnhancedQuiz;
  }
}

// ── 下一题 ──
function nextEnhancedQuiz() {
  _qzIdx++;
  if(_qzIdx >= _qzTotal) {
    showQuizResult();
  } else {
    _qzAnswered = false;
    showEnhancedQuiz();
    if(window.speak && _qzData[_qzIdx]) {
      try { speak(_qzData[_qzIdx].question); } catch(e) {}
    }
  }
}

// ── 显示结果 ──
function showQuizResult() {
  var area = document.getElementById('quizArea');
  if(area) area.style.display = 'none';
  
  var res = document.getElementById('quizResult');
  if(!res) return;
  res.style.display = 'block';
  
  var rate = _qzTotal > 0 ? Math.round(_qzRight / _qzTotal * 100) : 0;
  var emoji = rate >= 80 ? '🎉' : rate >= 60 ? '💪' : '📖';
  
  var emoEl = document.getElementById('quizEmo');
  var titleEl = document.getElementById('quizTitle');
  var scoreEl = document.getElementById('quizScore');
  
  if(emoEl) emoEl.textContent = emoji;
  if(titleEl) titleEl.textContent = '答题完成！';
  if(scoreEl) scoreEl.textContent = '正确率：' + rate + '%（' + _qzRight + '/' + _qzTotal + '）';
}

// ── 退出题库 ──
function exitQuiz() {
  var area = document.getElementById('quizArea');
  var res = document.getElementById('quizResult');
  var start = document.getElementById('quizStart');
  if(area) area.style.display = 'none';
  if(res) res.style.display = 'none';
  if(start) start.style.display = 'block';
}

// ── 重新练习 ──
function retryQuiz() {
  startEnhancedQuiz(QUIZ_MODE);
}

// ── 页面初始化入口 ──
function initQuizPage() {
  buildQuizFilterBar();
  buildQuizModeCards();
  
  var start = document.getElementById('quizStart');
  var area = document.getElementById('quizArea');
  var res = document.getElementById('quizResult');
  if(start) start.style.display = 'block';
  if(area) area.style.display = 'none';
  if(res) res.style.display = 'none';
}
