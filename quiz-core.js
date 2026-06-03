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

// ── 构建题目HTML ──
function buildQuizQuestionHTML(q, idx, total) {
  var html = '';
  // 进度条
  html += '<div id="quizProg" class="quiz-prog">第 ' + (idx+1) + '/' + total + ' 题';
  if(q.source) html += ' · ' + escHtml(q.source);
  if(q.type_label) html += ' · ' + escHtml(q.type_label);
  html += '</div>';
  
  // 题目
  html += '<div class="quiz-q-text">' + processStarQuestion(q) + '</div>';
  if(q.passage) html += '<div class="quiz-passage-box">' + escHtml(q.passage) + '</div>';
  
  // 选项
  html += '<div class="quiz-opts">';
  (q.options || []).forEach(function(opt, i) {
    var label = String.fromCharCode(65+i);
    html += '<button class="quiz-opt-btn" onclick="checkQuizAnswer(' + i + ')">'
      + '<span class="opt-label">' + label + '</span>'
      + '<span class="opt-text">' + escHtml(opt) + '</span>'
      + '</button>';
  });
  html += '</div>';
  
  return html;
}

// ── 启动增强版题库 ──
function startEnhancedQuiz(mode) {
  QUIZ_MODE = mode || 'all';
  
  // 筛选数据源
  var all = QUIZ_DATA_REAL || [];
  var filtered = all;
  if(_qzFilterYear && _qzFilterYear !== 'all') {
    filtered = all.filter(function(d) { return (d.source||'').indexOf(_qzFilterYear) === 0; });
  }
  
  // 按类型筛选
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
    document.getElementById('quizArea').innerHTML = '<p style="color:#666;text-align:center;padding:40px;">当前筛选条件下无题目，请切换筛选。</p>';
    return;
  }
  
  // 随机打乱，最多20题
  _qzPool = shuffle([].concat(filtered));
  _qzData = _qzPool.slice(0, Math.min(20, _qzPool.length));
  _qzIdx = 0;
  _qzRight = 0;
  _qzAnswered = false;
  _qzLastPassage = '';
  _qzTotal = _qzData.length;
  
  showEnhancedQuiz();
  if(window.speak) {
    try { speak(_qzData[0].question); } catch(e) {}
  }
}

// ── 显示当前题 ──
function showEnhancedQuiz() {
  var q = _qzData[_qzIdx];
  if(!q) return showQuizResult();
  
  var area = document.getElementById('quizArea');
  area.style.display = 'block';
  area.innerHTML = buildQuizQuestionHTML(q, _qzIdx, _qzTotal);
  
  // 重置反馈区
  var fb = document.getElementById('quizFeedback');
  if(fb) fb.innerHTML = '';
  
  // 隐藏结果
  var res = document.getElementById('quizResult');
  if(res) res.style.display = 'none';
  
  // 更新模式卡高亮
  document.querySelectorAll('.quiz-mode-card').forEach(function(c) {
    c.classList.toggle('active', false);
  });
}

// ── 检查答案 ──
function checkQuizAnswer(idx) {
  if(_qzAnswered) return;
  _qzAnswered = true;
  
  var q = _qzData[_qzIdx];
  var correct = q.answer;
  var isRight = (idx === correct);
  if(isRight) _qzRight++;
  
  // 高亮选项
  var btns = document.querySelectorAll('#quizArea .quiz-opt-btn');
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
  
  // 解析展示
  if(q.explanation) {
    fbHtml += '<div class="quiz-explain-box">' + formatExplanation(q.explanation) + '</div>';
  }
  if(q.error_analysis) {
    fbHtml += '<div class="quiz-ea-box">' + escHtml(q.error_analysis) + '</div>';
  }
  if(q.note) {
    fbHtml += '<div class="quiz-note-box">💡 ' + escHtml(q.note) + '</div>';
  }
  
  // 下一题按钮
  fbHtml += '<div style="text-align:center;margin-top:16px;">'
    + '<button class="quiz-next-btn" onclick="nextEnhancedQuiz()">'
    + (_qzIdx < _qzTotal - 1 ? '下一题 →' : '查看结果')
    + '</button></div>';
  
  var fb = document.getElementById('quizFeedback');
  if(fb) fb.innerHTML = fbHtml;
}

// ── 下一题 ──
function nextEnhancedQuiz() {
  _qzIdx++;
  if(_qzIdx >= _qzTotal) {
    showQuizResult();
  } else {
    _qzAnswered = false;
    showEnhancedQuiz();
    if(window.speak) {
      try { speak(_qzData[_qzIdx].question); } catch(e) {}
    }
  }
}

// ── 显示结果 ──
function showQuizResult() {
  var area = document.getElementById('quizArea');
  area.style.display = 'none';
  
  var res = document.getElementById('quizResult');
  if(!res) return;
  res.style.display = 'block';
  
  var rate = _qzTotal > 0 ? Math.round(_qzRight / _qzTotal * 100) : 0;
  var emoji = rate >= 80 ? '🎉' : rate >= 60 ? '💪' : '📖';
  
  var html = '<div class="quiz-result-card">'
    + '<div class="qr-emoji">' + emoji + '</div>'
    + '<div class="qr-title">答题完成！</div>'
    + '<div class="qr-score">正确率：' + rate + '%（' + _qzRight + '/' + _qzTotal + '）</div>';
  
  if(rate === 100) {
    html += '<div class="qr-msg">全部正确，太厉害了！</div>';
  } else if(rate >= 80) {
    html += '<div class="qr-msg">很不错！继续保持~</div>';
  } else {
    html += '<div class="qr-msg">加油！错题多看看解析~</div>';
  }
  
  html += '<div style="text-align:center;margin-top:20px;">'
    + '<button class="quiz-retry-btn" onclick="startEnhancedQuiz(\'' + QUIZ_MODE + '\')">🔄 再来一次</button>'
    + '</div></div>';
  
  res.innerHTML = html;
}

// ── 页面初始化入口 ──
function initQuizPage() {
  buildQuizFilterBar();
  buildQuizModeCards();
  
  // 默认启动综合模式
  var area = document.getElementById('quizArea');
  var res = document.getElementById('quizResult');
  if(area) area.style.display = 'none';
  if(res) res.style.display = 'none';
}
