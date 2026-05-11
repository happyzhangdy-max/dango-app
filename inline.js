
const VOCAB=VOCAB_DATA;
// SM-2
function sm2(c,q){let{i=1,r=0,e=2.5}=c;if(q<3){r=0;i=1}else{if(r===0)i=1;else if(r===1)i=6;else i=Math.round(i*e);r++;e=Math.max(1.3,e+0.1-(5-q)*(0.08+(5-q)*0.02))}return{interval:i,repetitions:r,ef:e,nextDate:new Date(Date.now()+i*864e5).toISOString().split("T")[0]}}
function lp(){try{return JSON.parse(localStorage.getItem('jp')||'{}')}catch(e){return{}}}
function sp(p){localStorage.setItem('jp',JSON.stringify(p))}
function due(){const p=lp();const t=new Date().toISOString().split('T')[0];return VOCAB.filter(v=>{const c=p[v.id];return c&&c.nextDate<=t})}
function st(n){if(n>=8)return '★★★★';if(n>=5)return '★★★';if(n>=3)return '★★';return '★'}
function fc(n){if(n>=8)return 'fb-s';if(n>=5)return 'fb-a';if(n>=3)return 'fb-b';return 'fb-c'}
let quizData=[],quizIdx=0,quizRight=0,quizMode='high';
function go(p){closeD();closePlanModal();
  // 清理所有自动播放定时器（Bug #3）
  clearTimeout(_apTimer);_apTimer=null;
  clearTimeout(_vApTimer);_vApTimer=null;
  clearTimeout(_gApTimer);_gApTimer=null;
  clearTimeout(_vocabTrackingTimer);_vocabTrackingTimer=null;
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tabs .tab').forEach(x=>x.classList.remove('active'));document.getElementById('p-'+p).classList.add('active');const tabs=['home','vocab','grammar','review','book','quiz','wrong','autoplay','game','scan'];tabs.forEach((t,i)=>{if(t===p)document.querySelectorAll('.tabs .tab')[i].classList.add('active')});if(p==='home'){upH();upP()}if(p==='vocab'){renderV();clearTimeout(_vocabTrackingTimer);_vocabTrackingTimer=setTimeout(function(){initVocabTracking()},50)}if(p==='grammar')renderG();if(p==='quiz'){document.getElementById('quizStart').style.display='block';document.getElementById('quizArea').style.display='none';document.getElementById('quizResult').style.display='none'};if(p==='review')renderR();if(p==='book')renderBook();if(p==='wrong')renderWrong();if(p==='autoplay')renderAutoPlayOptions();if(p==='scan'){loadScanHistory()}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(mode){quizMode=mode;quizIdx=0;quizRight=0;window._lastPassage='';let src;if(mode==='high')src=QUIZ_DATA_HIGH;else if(mode==='normal')src=QUIZ_DATA_NORMAL;else src=QUIZ_DATA_REAL;quizData=shuffle([...src]).slice(0,mode==='real'?src.length:10);document.getElementById('quizStart').style.display='none';document.getElementById('quizResult').style.display='none';document.getElementById('quizArea').style.display='block';showQuiz()}
function showQuiz(){const q=quizData[quizIdx];document.getElementById('quizProg').textContent=(quizIdx+1)+'/'+quizData.length;document.getElementById('quizBar').style.width=((quizIdx)/quizData.length*100)+'%';const pEl=document.getElementById('quizPassage');if(q.passage&&q.passage!==window._lastPassage){pEl.innerHTML='<div style="background:#1a2a4a;border-left:3px solid #f5a623;border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:12px;font-size:12px;line-height:1.9;white-space:pre-wrap;color:#c8d6e5;max-height:300px;overflow-y:auto"><b style="color:#f5a623;font-size:10px;display:block;margin-bottom:4px">📖 阅读原文</b>'+q.passage.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>';pEl.style.display='block';window._lastPassage=q.passage}else{pEl.style.display='none'};document.getElementById('quizQ').innerHTML='<div style="display:flex;align-items:flex-start;gap:8px">'+q.question+'<button onclick="speakQuizQ()" style="flex-shrink:0;background:none;border:none;font-size:18px;cursor:pointer;opacity:0.7;padding:2px" title="读题">🔊</button></div>';const optDiv=document.getElementById('quizOpts');optDiv.innerHTML='';q.options.forEach((o,i)=>{const b=document.createElement('button');b.className='btn bs';b.style.textAlign='left';b.style.fontSize='13px';b.style.padding='10px 14px';var hasJa=/[\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(o);b.innerHTML='<span style="flex:1">'+(i+1)+'. '+o+'</span>'+(hasJa?'<span onclick="event.stopPropagation();speakQuizOpt('+i+')" style="flex-shrink:0;cursor:pointer;opacity:0.7;margin-left:8px;font-size:15px" title="朗读选项">🔊</span>':'');b.style.display='flex';b.style.alignItems='center';b.onclick=()=>answerQuiz(i);optDiv.appendChild(b)});document.getElementById('quizFeedback').style.display='none';document.getElementById('quizNextBtn').style.display='none'}
function answerQuiz(i){const q=quizData[quizIdx];const fb=document.getElementById('quizFeedback');const isRight=i===q.answer;if(isRight){quizRight++;fb.style.borderLeft='3px solid #4ecca3';fb.innerHTML='<span style="color:#4ecca3;font-weight:700">✅ 正解！</span><br>'+q.explanation}else{addWrong(q);fb.style.borderLeft='3px solid #e94560';fb.innerHTML='<span style="color:#e94560;font-weight:700">❌ 不正解</span> <span style="font-size:10px;color:#888">（已加入错题本）</span><br>正解：'+(q.answer+1)+'. '+q.options[q.answer]+'<br><br>'+q.explanation}fb.style.display='block';document.getElementById('quizNextBtn').style.display='inline-flex';document.querySelectorAll('#quizOpts .btn').forEach(b=>b.disabled=true)}
function nextQuiz(){quizIdx++;if(quizIdx>=quizData.length){showQuizResult()}else{showQuiz()}}
function exitQuiz(){document.getElementById('quizArea').style.display='none';document.getElementById('quizResult').style.display='none';document.getElementById('quizStart').style.display='block'}
function showQuizResult(){document.getElementById('quizArea').style.display='none';document.getElementById('quizResult').style.display='block';const rate=Math.round(quizRight/quizData.length*100);let emo='🎉',tit='優秀！';if(rate<60){emo='😢';tit='要復習'}else if(rate<80){emo='😊';tit='Good！'}document.getElementById('quizEmo').textContent=emo;document.getElementById('quizTitle').textContent=tit;document.getElementById('quizScore').textContent='正解：'+quizRight+'/'+quizData.length+'（'+rate+'%）'}
function upH(){const p=lp();const d=due();document.getElementById('s1').textContent=Object.keys(p).length;document.getElementById('s1').style.color='#4ecca3';document.getElementById('s2').textContent=d.length;document.getElementById('s2').style.color='#f5a623';document.getElementById('dueH').textContent=d.length;upP()}
function renderV(){if(_vocabObserver)_vocabObserver.disconnect();const f=curF;document.querySelectorAll('#p-vocab .st2 .tab').forEach(t=>{t.classList.toggle('active',t.textContent.trim().toLowerCase()===f)});let data=f==='all'?VOCAB:VOCAB.filter(v=>v.level===f);if(curVMark){var vm=getMarks();data=data.filter(function(v){return vm[v.id]===curVMark})}if(curSort==='freq'){data=[...data].sort((a,b)=>b.appear-a.appear);_vocabOrder=null}else if(curSort==='random'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}}else if(curSort==='rand100'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}data=data.slice(0,Math.min(100,data.length))}else if(curSort==='rand200'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}data=data.slice(0,Math.min(200,data.length))}else if(curSort==='rand500'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}data=data.slice(0,Math.min(500,data.length))}else if(curSort==='category'){var groupField=catMode==='scene'?'category':'type';if(!catSelected){var groups={};data.forEach(function(v){var key=v[groupField]||'未分类';if(!groups[key])groups[key]=[];groups[key].push(v)});var sorted=Object.entries(groups).sort(function(a,b){return b[1].length-a[1].length});var flat=[];flat.push({_catModeTabs:true});flat.push({_catSubTitle:catMode==='scene'?'选择场景分类查看词汇':'选择词性分类查看词汇'});var overviewCards=[];sorted.forEach(function(p){overviewCards.push({type:p[0],count:p[1].length})});flat.push({_overviewCards:overviewCards});data=flat;_vocabOrder=null}else{var filtered=data.filter(function(v){return(v[groupField]||'未分类')===catSelected});if(filtered.length===0){catSelected=null;renderV();return}var flat=[];flat.push({_catBackBtn:true,_backLabel:catSelected});flat.push({_header:true,_cat:catSelected,_count:filtered.length});var levelOrder=['n1','n2','n3','n4','n5'];levelOrder.forEach(function(lv){var levelItems=filtered.filter(function(v){return v.level===lv});if(levelItems.length===0)return;flat.push({_subHeader:true,_subLabel:lv.toUpperCase(),_count:levelItems.length});if(levelItems.length>500){levelItems.slice(0,500).forEach(function(v){flat.push(v)});flat.push({_overflowMsg:true,_count:levelItems.length-500})}else{levelItems.forEach(function(v){flat.push(v)})}});data=flat;_vocabOrder=null}}else if(curSort==='studyCount'){var p=lp();var sc=curStudyCount||'all';data=data.filter(function(v){var cnt=(p[v.id]&&p[v.id].viewCount)||0;if(sc==='all')return true;if(sc==='0')return cnt===0;if(sc==='1')return cnt===1;if(sc==='2')return cnt===2;if(sc==='3')return cnt===3;if(sc==='4')return cnt===4;if(sc==='5-9')return cnt>=5&&cnt<=9;if(sc==='10-20')return cnt>=10&&cnt<=20;if(sc==='20+')return cnt>=21;return true});data=[...data].sort(function(a,b){var ca=(p[a.id]&&p[a.id].viewCount)||0;var cb=(p[b.id]&&p[b.id].viewCount)||0;return cb-ca});_vocabOrder=null;var scLabels=['all','0','1','2','3','4','5-9','10-20','20+'];data=[{_scTabs:true,_scVal:sc,_scLabels:scLabels}].concat(data)}const g=document.getElementById('vocabG');g.innerHTML='';const label=document.getElementById('sortLabel');if(label){if(curSort==='rand100')label.textContent='🎲 随机100词';else if(curSort==='rand200')label.textContent='🎲 随机200词';else if(curSort==='rand500')label.textContent='🎲 随机500词';else if(curSort==='random')label.textContent='🔀 随机排序';else if(curSort==='category')label.textContent='📂 分类排序';else if(curSort==='studyCount')label.textContent='📖 学习次数';else label.textContent='📊 高频降序'}const cnt=document.getElementById('vocabCount');if(cnt){var wc=0;if(curSort==='category'||curSort==='studyCount'){data.forEach(function(x){if(x._header||x._subHeader||x._catModeTabs||x._catSubTitle||x._overviewCards||x._catBackBtn||x._overflowMsg||x._scTabs)return;wc++});cnt.textContent='共 '+wc+' 词'}else cnt.textContent='共 '+data.length+' 词'};data.forEach(v=>{if(v._scTabs){var td=document.createElement('div');td.style.cssText='display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap';v._scLabels.forEach(function(l){var btn=document.createElement('button');btn.className='tab'+(l===v._scVal?' active':'');btn.textContent=l==='all'?'📖 全部':l;btn.onclick=function(){curStudyCount=l;renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)};td.appendChild(btn)});g.appendChild(td);return}if(v._catModeTabs){let td=document.createElement('div');td.style.cssText='display:flex;gap:8px;margin-bottom:12px';var sb=document.createElement('button');sb.className='btn '+(catMode==='scene'?'bp':'bs');sb.textContent='🏷️ 场景';sb.onclick=function(){setCatMode('scene')};td.appendChild(sb);var tb=document.createElement('button');tb.className='btn '+(catMode==='type'?'bp':'bs');tb.textContent='📚 词性';tb.onclick=function(){setCatMode('type')};td.appendChild(tb);g.appendChild(td);return}if(v._catSubTitle){let st=document.createElement('div');st.style.cssText='color:#888;font-size:12px;margin-bottom:10px';st.textContent=v._catSubTitle;g.appendChild(st);return}if(v._overviewCards){v._overviewCards.forEach(function(c){var ce=document.createElement('div');ce.className='vc-h';ce.style.cursor='pointer';ce.textContent='📂 '+c.type+' ('+c.count+'词)';ce.onclick=function(){catSelected=c.type;renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)};g.appendChild(ce)});return}if(v._catBackBtn){var bb=document.createElement('div');bb.style.cssText='margin-bottom:10px';bb.innerHTML='<button class="btn bs" onclick="catSelected=null;renderV();if(typeof initVocabTracking===\'function\')initVocabTracking(false)">🔙 返回 ('+v._backLabel+')</button>';g.appendChild(bb);return}if(v._header){var h=document.createElement('div');h.className='vc-h';h.textContent='📂 '+v._cat+' ('+v._count+'词)';g.appendChild(h);return}if(v._subHeader){var sh=document.createElement('div');sh.className='vc-h';sh.style.cssText='font-size:13px;padding:6px 14px;margin-top:4px;background:rgba(168,85,247,0.08);border-color:rgba(168,85,247,0.2)';sh.textContent='📖 '+v._subLabel+' ('+v._count+'词)';g.appendChild(sh);return}if(v._overflowMsg){var om=document.createElement('div');om.style.cssText='text-align:center;color:#888;font-size:12px;padding:8px';om.textContent='... 还有 '+v._count+' 个词汇未显示';g.appendChild(om);return}const d=document.createElement('div');d.className='vc';d.setAttribute('data-id',v.id);const fbc=fc(v.appear);const ss=st(v.appear);const lv=v.level==='n3'?'l3':v.level==='n2'?'l2':'l1';d.innerHTML='<span class="vl '+lv+'">'+(v.level||'n3').toUpperCase()+'</span><span class="vb-freq '+fbc+'">'+ss+' '+v.appear+'回</span><span class="vw">'+v.word+'</span><span class="vr">'+v.reading+'</span><span class="vm">'+v.meaning+'</span><span class="va-stack"><span class="v-info" onclick="event.stopPropagation();openD(findVocabById('+v.id+'))" title="详情">🔍</span></span><span class="vf"><span class="vbf" data-id="'+v.id+'" onclick="event.stopPropagation();toggleBook({type:\'vocab\',id:\'+v.id+\'})">'+(getBook().some(function(x){return x.type==='vocab'&&x.id===v.id})?'⭐':'☆')+'</span><span class="vm-btn-group"><span class="vm-btn vm-btn-red" data-id="'+v.id+'" data-color="red" onclick="event.stopPropagation();toggleMark('+v.id+',\'red\');return false" title="不认识">🔴</span><span class="vm-btn vm-btn-yellow" data-id="'+v.id+'" data-color="yellow" onclick="event.stopPropagation();toggleMark('+v.id+',\'yellow\');return false" title="不熟">🟡</span><span class="vm-btn vm-btn-green" data-id="'+v.id+'" data-color="green" onclick="event.stopPropagation();toggleMark('+v.id+',\'green\');return false" title="熟悉">🟢</span></span></span>';if(kanjiMode===1)d.classList.add('vh1');else if(kanjiMode===2)d.classList.add('vh2');(function(v2,el){var vs=el.querySelector('.va-stack');var wb=document.createElement('button');wb.className='vb vb-w';wb.textContent='🔊';wb.title='单词发音';wb.onclick=function(e){e.stopPropagation();speak(v2.word)};vs.insertBefore(wb,vs.firstChild);if(v2.ex_jp){var eb=document.createElement('button');eb.className='vb vb-e';eb.textContent='📢';eb.title='例句发音';eb.onclick=function(e){e.stopPropagation();speak(v2.ex_jp)};vs.insertBefore(eb,wb.nextSibling||null)}})(v,d);
if(kanjiMode===0)d.classList.add('vc-fold');d.onclick=function(){this.classList.toggle('vc-fold')};
// --- 新增：初始化颜色标记状态 ---
var markColor = getMarks()[v.id];
if (markColor) d.querySelector('.vm-btn[data-color="'+markColor+'"]').classList.add('vm-btn-active');
// --- 新增结束 ---
g.appendChild(d)})}
function setF(f,el){curF=f;document.querySelectorAll('#p-vocab .st2 .tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');curSort='freq';_vocabOrder=null;document.querySelectorAll('#p-vocab .st3 .tab').forEach(x=>x.classList.remove('active'));if(document.querySelector('#p-vocab .st3 .tab'))document.querySelector('#p-vocab .st3 .tab').classList.add('active');renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)}
function sortV(mode,el){curSort=mode;document.querySelectorAll('#p-vocab .st3 .tab').forEach(x=>x.classList.remove('active'));if(el)el.classList.add('active');_vocabOrder=null;catSelected=null;renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)}
function startStudy(f){document.getElementById('sp').style.display='block';document.getElementById('lm').style.display='none';curF=f;const data=f==='all'?VOCAB:VOCAB.filter(v=>v.level===f);q=[...data].sort((a,b)=>b.appear-a.appear);ci=resumeSession(f);if(ci>0)showT('📖 继续上次的进度 ('+(ci+1)+'/'+q.length+')');showC()}
function showC(){if(ci>=q.length){showComp();return}const v=q[ci];fl=false;document.getElementById('c3d').classList.remove('f');document.getElementById('cft').innerHTML='<span class="fb '+fc(v.appear)+'">'+st(v.appear)+' <span style="font-size:10px;color:#888">'+v.appear+'回</span></span>';document.getElementById('cfw').textContent=v.word;document.getElementById('cfr').textContent=v.reading;document.getElementById('cft2').textContent=v.type||'';document.getElementById('cbm').textContent=v.meaning;document.getElementById('cbt').textContent=v.type||'';document.getElementById('cbej').textContent=v.ex_jp||'';document.getElementById('cber').textContent=v.ex_read||'';document.getElementById('cbec').textContent=v.ex_cn||'';document.getElementById('cbb').innerHTML='<span class="fb '+fc(v.appear)+'">'+st(v.appear)+'</span>';document.getElementById('abtns').style.display='none';document.getElementById('pt').textContent=(ci+1)+'/'+q.length;document.getElementById('pf').style.width=Math.max(3,Math.round(ci/q.length*100))+'%'}
function flipC(){if(ci>=q.length)return;fl=!fl;document.getElementById('c3d').classList.toggle('f',fl);if(fl)document.getElementById('abtns').style.display='flex'}
function rate(q){const v=q[ci];const p=lp();const cur=p[v.id]||{};const r=sm2(cur,q);p[v.id]={...r,word:v.word};sp(p);if(q===0)toggleMark(v.id,"red");else if(q===3)toggleMark(v.id,"yellow");else if(q===4)toggleMark(v.id,"green");ci++;if(ci<q.length)setTimeout(showC,200);else showComp()}
function showComp(){document.getElementById('sp').style.display='block';document.getElementById('csc').style.display='none';document.getElementById('abtns').style.display='none';const p=lp();let h=0,e=0;q.forEach(v=>{const c=p[v.id];if(c&&c.repetitions>=2)e++;else h++});document.getElementById('rn1').textContent=q.length;document.getElementById('rn2').textContent=h;document.getElementById('rn3').textContent=e;document.getElementById('comp').classList.add('show');clearSession();if(typeof upH==='function')upH();window._sd=false;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null}
function exitS(){saveSession();document.getElementById('sp').style.display='none';document.getElementById('comp').classList.remove('show');document.getElementById('csc').style.display='block';document.getElementById('lm').style.display='block';window._sd=false;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null}
let dwId=0;function openD(v){dwId=v.id;document.getElementById('drw').textContent=v.word;document.getElementById('drr').textContent=v.reading;document.getElementById('drm').textContent=v.meaning;document.getElementById('drt').textContent=v.type||'';const fbc=fc(v.appear);document.getElementById('drfb').innerHTML='<span class="fb '+fbc+'">'+st(v.appear)+' <span style="font-size:10px">'+v.appear+'回</span></span>';document.getElementById('dre1j').textContent=v.ex_jp||'';document.getElementById('dre1r').textContent=v.ex_read||'';document.getElementById('dre1c').textContent=v.ex_cn||'';document.getElementById('dw').classList.add('open');document.getElementById('ol').classList.add('open');updateBookBtn(dwId)}
function closeD(){document.getElementById('dw').classList.remove('open');document.getElementById('ol').classList.remove('open')}
function renderG(){const f=curG;let data=f==='all'?GRAMMAR_DATA:GRAMMAR_DATA.filter(g=>g.level===f);if(curGSort==='random')data=[...data].sort(function(){return Math.random()-0.5});const filtered=curGMark?data.filter(function(g){var m=getGMarks()[g.id];return m===curGMark}):data;const g=document.getElementById('grammarL');g.innerHTML='';filtered.forEach(gr=>{const d=document.createElement('div');d.className='gc';const fbc=fc(gr.appear);const ss=st(gr.appear);const gMark=getGMarks()[gr.id];const gBook=getGBook().indexOf(gr.id)>=0;d.innerHTML='<div class="gh"><span class="gp">'+gr.pattern+'</span><span class="gb '+(gr.level==='n3'?'bn3':'bn2')+'">'+gr.level.toUpperCase()+'</span><span class="fb '+fbc+'">'+ss+' '+gr.appear+'次</span></div><div class="gm">'+gr.meaning+'</div><div class="gd">'+(gr.desc||'')+'</div><div class="eb"><div class="ej">'+(gr.ex_jp||'')+'</div><div class="er">'+(gr.ex_read||'')+'</div><div class="ec">'+(gr.ex_cn||'')+'</div></div><div class="gf"><button class="btn bs" style="font-size:11px;padding:5px 10px" onclick="event.stopPropagation();speakGP('+gr.id+')">🔊 朗读</button><button class="btn bg" style="font-size:11px;padding:5px 10px" onclick="event.stopPropagation();markG('+gr.id+')">✅ 掌握</button><span class="vbf" data-gid="'+gr.id+'" onclick="event.stopPropagation();toggleGBook('+gr.id+')" style="font-size:14px;margin-left:6px">'+(gBook?'⭐':'☆')+'</span><span class="vm-btn-group" style="margin-left:4px"><span class="vm-btn" data-gid="'+gr.id+'" data-color="red" onclick="event.stopPropagation();toggleGMark('+gr.id+',\'red\');return false" style="'+(gMark==='red'?'opacity:1;border-color:#e94560':'')+'">🔴</span><span class="vm-btn" data-gid="'+gr.id+'" data-color="yellow" onclick="event.stopPropagation();toggleGMark('+gr.id+',\'yellow\');return false" style="'+(gMark==='yellow'?'opacity:1;border-color:#f5a623':'')+'">🟡</span><span class="vm-btn" data-gid="'+gr.id+'" data-color="green" onclick="event.stopPropagation();toggleGMark('+gr.id+',\'green\');return false" style="'+(gMark==='green'?'opacity:1;border-color:#4ecca3':'')+'">🟢</span></span></div>';if(_grammarFold)d.classList.add('gc-fold');d.onclick=function(){speakGP(gr.id)};g.appendChild(d)})}
function setG(f,el){curG=f;document.querySelectorAll('#p-grammar .st2 .tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderG()}
var curGMark=null,_grammarFold=false,curVMark=null;
function markG(id){let gc=parseInt(localStorage.getItem('gc')||'0');gc++;localStorage.setItem('gc',gc);showT('✅ 已掌握！')}
function getGMarks(){try{return JSON.parse(localStorage.getItem('gm')||'{}')}catch(e){return{}}}
function setGMarks(m){localStorage.setItem('gm',JSON.stringify(m))}
function toggleGMark(id,c){var m=getGMarks();m[id]=m[id]===c?null:c;setGMarks(m);renderG()}
function getGBook(){try{return JSON.parse(localStorage.getItem('gb')||'[]')}catch(e){return[]}}
function setGBook(b){localStorage.setItem('gb',JSON.stringify(b))}
function toggleGBook(id){var b=getGBook();var i=b.indexOf(id);i>=0?b.splice(i,1):b.push(id);setGBook(b);renderG()}
function setGMark(c,el){curGMark=curGMark===c?null:c;document.querySelectorAll('#p-grammar .st3 .tab').forEach(function(x){x.classList.toggle('active',x===el&&curGMark)});renderG()}
function toggleGrammarDisplay(){_grammarFold=!_grammarFold;document.getElementById('grammarToggle').textContent=_grammarFold?'🔤 展开':'🔤 显示切换';renderG()}
function setVMark(c,el){curVMark=curVMark===c?null:c;document.querySelectorAll('#p-vocab .tab[title*="筛选"]').forEach(function(x){x.classList.toggle('active',x===el&&curVMark)});renderV()}
function apToggleBook(){var v=_apQueue[_apIdx-(_apPaused?0:1)];if(!v)return;toggleBook({type:'vocab',id:v.id});apSyncMarks(v)}
function apToggleMark(c){var v=_apQueue[_apIdx-(_apPaused?0:1)];if(!v)return;toggleMark(v.id,c);apSyncMarks(v)}
function apSyncMarks(v){if(!v)return;var b=getBook().some(function(x){return x.type==='vocab'&&x.id===v.id});;document.getElementById('apBmk').textContent=b?'⭐':'☆';var m=getMarks()[v.id];document.querySelectorAll('#apScreen .ap-marks .vm-btn').forEach(function(x){var c=x.getAttribute('data-color');var a=m===c;x.classList.remove('vm-btn-red','vm-btn-yellow','vm-btn-green','vm-btn-active');if(a){x.classList.add('vm-btn-'+c,'vm-btn-active');x.style.borderColor='';x.style.background='';x.style.opacity=''}else{x.style.borderColor='transparent';x.style.background='transparent';x.style.opacity='0.4'}})}
let _reviewMode='sm2';
function getViewCountWords(){const p=lp();const entries=Object.entries(p).filter(([id,s])=>s.viewCount&&s.viewCount>0).sort((a,b)=>(b[1].viewCount||0)-(a[1].viewCount||0));return entries.map(([id])=>VOCAB.find(v=>v.id==id)).filter(v=>v)}
function setReviewMode(m){_reviewMode=m;renderR()}
function _injWW(){if(document.getElementById('ww-s'))return;var s=document.createElement('style');s.id='ww-s';s.textContent='.ww{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:4px 0}.ww-c{background:linear-gradient(135deg,#1a1a3e,#16213e);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 10px 10px;cursor:pointer;transition:all .25s;position:relative}.ww-c:hover{border-color:rgba(168,85,247,0.4);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.3)}.ww-c .ww-w{font-size:17px;font-weight:700;color:#eaeaea;line-height:1.3}.ww-c .ww-r{font-size:11px;color:#888;margin-top:2px;line-height:1.3}.ww-c .ww-b{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:4px}.ww-c .ww-l{font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(255,255,255,0.08);color:#aaa;white-space:nowrap}.ww-c .ww-l.l2{background:rgba(233,69,96,0.2);color:#e94560}.ww-c .ww-l.l3{background:rgba(78,204,163,0.2);color:#4ecca3}.ww-c .ww-x{display:flex;gap:3px;font-size:10px;align-items:center;flex-wrap:nowrap}.ww-c .ww-s{border:none;background:rgba(255,255,255,0.06);border-radius:50%;cursor:pointer;font-size:10px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;transition:background .2s;position:absolute;top:6px;right:6px}.ww-c .ww-s:hover{background:rgba(168,85,247,0.3)}.ww-c .ww-bm{font-size:12px;cursor:pointer;opacity:.5;transition:opacity .2s;user-select:none}.ww-c .ww-bm.act{opacity:1}.ww-c.mr{border-color:rgba(233,69,96,0.4);background:linear-gradient(135deg,#1a1a3e,#2a1520)}.ww-c.my{border-color:rgba(245,166,35,0.4);background:linear-gradient(135deg,#1a1a3e,#2a2510)}.ww-c.mg{border-color:rgba(78,204,163,0.4);background:linear-gradient(135deg,#1a1a3e,#102a20)}';document.head.appendChild(s)}
function renderR(){_injWW();var c=document.getElementById('reviewC');var data,emptyText,emptyEmoji,countLabel,startAction;if(_reviewMode==='sm2'){data=due();emptyText='今日复习全部完成！';emptyEmoji='🌸';countLabel='待复习';startAction="startReview('sm2')"}else{data=getViewCountWords();emptyText='还没有学习过任何词汇';emptyEmoji='📖';countLabel='已学习词汇';startAction="startReview('viewcount')"}c.innerHTML='<div class="review-tabs"><button class="review-tab'+(_reviewMode==='sm2'?' active':'')+'" onclick="setReviewMode(\'sm2\')">🔄 遗忘曲线</button><button class="review-tab'+(_reviewMode==='viewcount'?' active':'')+'" onclick="setReviewMode(\'viewcount\')">📖 学习次数</button></div>';if(data.length===0){c.innerHTML+='<div class="re"><div class="rem">'+emptyEmoji+'</div><div style="font-size:18px;font-weight:700;margin-bottom:10px">'+emptyText+'</div><div style="font-size:13px;line-height:1.7">坚持学习，继续保持！ 💪</div></div>';return}c.innerHTML+='<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between"><span style="color:#888;font-size:13px">共 '+data.length+' 个'+countLabel+'</span><button class="btn bp" style="padding:5px 12px;font-size:11px" onclick="'+startAction+'">开始复习</button></div>';var wall=document.createElement('div');wall.className='ww';data.forEach(function(v){var cd=document.createElement('div');cd.className='ww-c';cd.setAttribute('data-id',v.id);var mc=getMarks()[v.id];if(mc)cd.classList.add('m'+mc[0]);var lc=v.level==='n3'?'l3':v.level==='n2'?'l2':'l1';var ib=getBook().some(function(x){return x.type==='vocab'&&x.id===v.id});cd.innerHTML='<div class="ww-w">'+v.word+'</div><div class="ww-r">'+v.reading+'</div><div class="ww-b"><span class="ww-l '+lc+'">'+(v.level||'N3').toUpperCase()+'</span><div class="ww-x"><span class="vm-btn vm-btn-red" data-id="'+v.id+'" data-color="red" onclick="event.stopPropagation();toggleMark('+v.id+',\'red\')" title="不认识">🔴</span><span class="vm-btn vm-btn-yellow" data-id="'+v.id+'" data-color="yellow" onclick="event.stopPropagation();toggleMark('+v.id+',\'yellow\')" title="不熟">🟡</span><span class="vm-btn vm-btn-green" data-id="'+v.id+'" data-color="green" onclick="event.stopPropagation();toggleMark('+v.id+',\'green\')" title="熟悉">🟢</span><span class="ww-bm'+(ib?' act':'')+'" data-id="'+v.id+'" onclick="event.stopPropagation();toggleBook({type:\'vocab\',id:\'+v.id+\'})">'+(ib?'⭐':'☆')+'</span></div></div>';var sb=document.createElement('button');sb.className='ww-s';sb.textContent='🔊';sb.onclick=function(e){e.stopPropagation();speak(v.word)};cd.appendChild(sb);cd.onclick=function(){openD(findVocabById(v.id))};// 初始状态：标记按钮高亮
if(mc)cd.querySelector('.vm-btn[data-color="'+mc+'"]').classList.add('vm-btn-active');wall.appendChild(cd)});c.appendChild(wall)}
function startReview(mode){var d;if(mode==='viewcount'){d=getViewCountWords()}else{d=due()}if(d.length===0){showT('暂无内容可复习');return}go('vocab');setTimeout(function(){q=[...d];ci=0;document.getElementById('sp').style.display='block';document.getElementById('lm').style.display='none';document.getElementById('comp').classList.remove('show');document.getElementById('csc').style.display='block';showC()},100)}
function showT(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000)}
let curF='n2',curSort='freq',curG='all',curGSort=null,q=[],ci=0,fl=false,kanjiMode=0,_vocabOrder=null,catMode='type',catSelected=null,curStudyCount='all';
function toggleKanji(){kanjiMode=(kanjiMode+1)%3;var btn=document.getElementById('kanjiToggle');if(btn){if(kanjiMode===0)btn.textContent='🔤 显示切换';else if(kanjiMode===1)btn.textContent='🔤 全文';else btn.textContent='🔤 仮名';btn.classList.toggle('active',kanjiMode!==0)}renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)}
function setCatMode(m){catMode=m;catSelected=null;renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)}
// TTS：Web Speech API（修复 Chrome cancel/speak bug）
var _jaVoice = null;
function initTTS(){
    function pick(){
        var vs = speechSynthesis.getVoices();
        for(var i=0;i<vs.length;i++){if(vs[i].lang&&vs[i].lang.indexOf('ja')===0){_jaVoice=vs[i];return}}
        _jaVoice=null;
    }
    pick();
    if(speechSynthesis.onvoiceschanged!==undefined) speechSynthesis.onvoiceschanged=pick;
}
initTTS();
// ── 发音队列系统（多个 speak 按顺序排队，onend 触发下一个）───
var _speechQueue=[],_speechBusy=false;
function _speakNext(){
  if(_speechBusy||_speechQueue.length===0)return;
  _speechBusy=true;
  var item=_speechQueue.shift();
  var u=new SpeechSynthesisUtterance(item.text);
  u.lang=item.lang||'ja-JP';u.rate=item.rate||0.9;
  if(item.voice)u.voice=item.voice;
  else if(_jaVoice)u.voice=_jaVoice;
  u.onend=function(){_speechBusy=false;_speakNext()};
  u.onerror=function(){_speechBusy=false;_speakNext()};
  speechSynthesis.speak(u);
}
function queueSpeak(text,opts){
  if(!text||!('speechSynthesis' in window))return;
  opts=opts||{};
  _speechQueue.push({text:String(text),lang:opts.lang||'ja-JP',rate:opts.rate||0.9,voice:opts.voice||null});
  if(!_speechBusy)_speakNext();
}
function clearSpeechQueue(){_speechQueue=[];speechSynthesis.cancel();_speechBusy=false}
function speak(text){
  if(!text||!('speechSynthesis' in window))return;
  clearSpeechQueue();
  queueSpeak(text);
}
function speakW() { if (ci < q.length) speak(q[ci].reading || q[ci].word); }
function speakE() { if (ci < q.length) speak(q[ci].ex_jp || q[ci].word); }
function speakDW() {
    if (!dwId) return;
    var v = VOCAB.find(function(x){ return x.id === dwId; });
    if (v) speak(v.word);
}
function speakGP(id) {
    var gr = GRAMMAR_DATA.find(function(x){ return x.id === id; });
    if (gr) speak(gr.ex_jp || gr.pattern);
}

// ── 真题练习 TTS ───────────
function speakQuizQ(){if(!quizData[quizIdx])return;var html=quizData[quizIdx].question;var d=document.createElement("div");d.innerHTML=html;var t=d.textContent||d.innerText||"";speak(t)}
function speakQuizOpt(i){if(!quizData[quizIdx]||!quizData[quizIdx].options[i])return;var o=quizData[quizIdx].options[i];speak(o)}

// ── 生词本──────────
const BOOK_KEY = 'jp_book';

// ── 新增：颜色标记 ──────────
const MARK_KEY = 'jp_mark';
function getMarks(){
    try { return JSON.parse(localStorage.getItem(MARK_KEY) || '{}'); } catch(e) { return {}; }
}
function setMarks(marks){
    localStorage.setItem(MARK_KEY, JSON.stringify(marks));
}
function toggleMark(id, color){
    var marks = getMarks();
    if (marks[id] === color) {
        delete marks[id];
    } else {
        marks[id] = color;
    }
    setMarks(marks);
    updateMarkUI(id);
}
function updateMarkUI(id){
    var marks = getMarks();
    var activeColor = marks[id] || '';
    document.querySelectorAll('.vm-btn[data-id="'+id+'"]').forEach(function(btn){
        btn.classList.toggle('vm-btn-active', btn.dataset.color === activeColor);
    });
    // 同步更新单词墙卡片边框色
    document.querySelectorAll('.ww-c[data-id="'+id+'"]').forEach(function(card){
        card.className = card.className.replace(/\bm[ryg]\b/g,'').trim();
        if(activeColor) card.classList.add('m'+activeColor[0]);
    });
}
// --- 新增结束 ---

// ── 搜索收藏（独立于生词本）──
const SEARCH_BOOK_KEY = 'jp_search_book';
function getSearchBook(){ try { return JSON.parse(localStorage.getItem(SEARCH_BOOK_KEY) || '[]'); } catch(e){ return []; } }
function saveSearchBook(list){ localStorage.setItem(SEARCH_BOOK_KEY, JSON.stringify(list)); }
function toggleSearchBook(item){
  var list = getSearchBook();
  var idx = list.findIndex(function(x){ return x.id === item.id; });
  if (idx >= 0) { list.splice(idx,1); showT('已从搜索收藏移除'); }
  else { list.unshift({id:item.id, word:item.word, reading:item.reading||'', meaning:item.meaning||'', level:item.level||'', time:Date.now()}); showT('已加入搜索收藏 ✅'); }
  saveSearchBook(list);
  updateSearchBookUI(item.id);
}
function isInSearchBook(id){
  return getSearchBook().some(function(x){ return x.id === id; });
}
function updateSearchBookUI(id){
  var inSb = isInSearchBook(id);
  document.querySelectorAll('.search-book-btn[data-id="'+id+'"]').forEach(function(btn){
    btn.textContent = inSb ? '⭐' : '☆';
    btn.style.opacity = inSb ? '1' : '0.4';
  });
}

function getBook(){
  var raw;
  try { raw = JSON.parse(localStorage.getItem(BOOK_KEY)); } catch(e) { return []; }
  if (!raw) return [];
  // v2: 如果还是旧格式 [1,2,3]，升级为 [{type:'vocab',id:1},{type:'vocab',id:2}]
  if (raw.length > 0 && typeof raw[0] === 'number') {
    raw = raw.map(function(id){ return {type:'vocab', id:id}; });
    localStorage.setItem(BOOK_KEY, JSON.stringify(raw));
  }
  return raw;
}
function saveBook(book){ localStorage.setItem(BOOK_KEY, JSON.stringify(book)); }
function isInBook(item){
  // item 可以是 {type:'vocab',id:123} 或 {type:'ai',word:'...'}
  var book = getBook();
  if (item.type === 'vocab') return book.some(function(x){ return x.type==='vocab' && x.id===item.id; });
  return book.some(function(x){ return x.type==='ai' && x.word===item.word; });
}
function toggleBook(item){
  // item: {type:'vocab',id:123} 或 {type:'ai', word, reading, meaning, level}
  var book = getBook();
  var idx = -1;
  if (item.type === 'vocab') {
    idx = book.findIndex(function(x){ return x.type==='vocab' && x.id===item.id; });
  } else {
    idx = book.findIndex(function(x){ return x.type==='ai' && x.word===item.word; });
  }
  if (idx >= 0) { book.splice(idx,1); showT('已从生词本移除'); }
  else { book.unshift(item); showT('已加入生词本 ✅'); }
  saveBook(book);
  // 同步更新卡片星星（仅词库词）
  if (item.type === 'vocab') {
    var inB = book.some(function(x){ return x.type==='vocab' && x.id===item.id; });
    document.querySelectorAll('.vbf[data-id="'+item.id+'"],.ww-bm[data-id="'+item.id+'"]').forEach(function(el){ el.textContent = inB ? '⭐' : '☆'; el.classList.toggle('act', inB); });
  }
  // 同步更新搜索结果页的收藏按钮
  var idVal = item.type==='vocab' ? item.id : item.word;
  document.querySelectorAll('.search-book-btn[data-id="'+idVal+'"]').forEach(function(btn){
    var inB = item.type==='vocab'
      ? book.some(function(x){ return x.type==='vocab' && x.id===item.id; })
      : book.some(function(x){ return x.type==='ai' && x.word===item.word; });
    btn.textContent = inB ? '⭐' : '☆';
    btn.style.opacity = inB ? '1' : '0.4';
  });
}
function updateBookBtn(id){
    var book = getBook();
    var inBook = book.some(function(x){ return x.type==='vocab' && x.id===id; });
    var btn = document.getElementById('bookBtn');
    if (!btn) return;
    btn.textContent = inBook ? '📕 移出生词本' : '📗 加入生词本';
    btn.className = 'btn ' + (inBook ? 'br' : 'bg');
}
function renderBook(){
    var el = document.getElementById('bookC');
    var cnt = document.getElementById('bookCount');
    if (!el) return;
    // Tab 状态
    var tab = document.getElementById('bookTabState');
    var curTab = tab ? tab.textContent : 'book';
    if (!tab) { tab = document.createElement('span'); tab.id = 'bookTabState'; tab.style.display='none'; document.body.appendChild(tab); tab.textContent='book'; }
    
    // Tab 切换按钮
    var tabsHtml = '<div style="display:flex;gap:8px;margin-bottom:12px">'+
      '<button class="btn '+(curTab==='book'?'bp':'bs')+'" onclick="switchBookTab(\'book\')" style="font-size:12px">📖 收藏</button>'+
      '<button class="btn '+(curTab==='search'?'bp':'bs')+'" onclick="switchBookTab(\'search\')" style="font-size:12px">🔍 搜索收藏</button>'+
      '<button onclick="'+(curTab==='book'?'clearBook':'clearSearchBook')+'()" class="btn br" style="font-size:11px;padding:3px 10px;margin-left:auto">清空</button>'+
      '</div>';
    
    if (curTab === 'search') {
      var sb = getSearchBook();
      var total = sb.length;
      if (cnt) cnt.textContent = '共 '+total+' 个搜索收藏';
      if (total === 0) {
        el.innerHTML = tabsHtml + '<div style="text-align:center;color:#666;padding:40px 0;font-size:14px">搜索收藏为空<br><span style="font-size:12px">在搜索页面点击 ☆ 收藏搜索结果</span></div>';
        return;
      }
      el.innerHTML = tabsHtml;
      sb.forEach(function(item){
        var d = document.createElement('div');
        d.className = 'vc';
        d.style.cursor = 'pointer';
        d.innerHTML = '<div class="vt"><span class="vl '+(item.level==='n3'?'l3':item.level==='n2'?'l2':'l1')+'">'+(item.level||'N3').toUpperCase()+'</span></div>'
          + '<div class="vw">'+escHtml(item.word)+'</div>'
          + '<div class="vr">'+escHtml(item.reading)+'</div>'
          + '<div class="vm">'+escHtml(item.meaning)+'</div>'
          + '<div style="font-size:10px;color:#888;margin-top:4px">'+new Date(item.time).toLocaleDateString()+'</div>';
        d.onclick = function(){
          var v = VOCAB.find(function(x){ return x.id === item.id; });
          if (v) { openD(v); } else { showT('该词未在词库中找到'); }
        };
        el.appendChild(d);
      });
    } else {
      var book = getBook();
      if (cnt) cnt.textContent = '共 '+book.length+' 个条目';
      if (book.length === 0) {
        el.innerHTML = tabsHtml + '<div style="text-align:center;color:#666;padding:40px 0;font-size:14px">生词本为空<br><span style="font-size:12px">从词汇卡、搜索、AI 搜索自动加入</span></div>';
        return;
      }
      el.innerHTML = tabsHtml;
      book.forEach(function(item){
        var d = document.createElement('div');
        d.className = 'vc';
        d.style.cursor = 'pointer';
        if (item.type === 'ai') {
          // AI 搜索词
          d.innerHTML = '<div class="vt"><span class="vl '+(item.level==='n3'?'l3':item.level==='n2'?'l2':'l1')+'">'+(item.level||'AI').toUpperCase()+'</span></div>'
            + '<div class="vw">'+escHtml(item.word)+'</div>'
            + '<div class="vr">'+escHtml(item.reading||'')+'</div>'
            + '<div class="vm">'+escHtml(item.meaning||'')+' <span style="font-size:9px;color:#a855f7;margin-left:4px">AI搜</span></div>';
          d.onclick = function(){ showT('🔍 "'+item.word+'" — '+item.meaning); };
        } else {
          // 词库词
          var v = VOCAB.find(function(x){ return x.id === item.id; });
          if (!v) return;
          d.innerHTML = '<div class="vt"><span class="vl '+(v.level==='n3'?'l3':'l2')+'">'+(v.level||'N3').toUpperCase()+'</span></div>'
            + '<div class="vw">'+v.word+'</div><div class="vr">'+v.reading+'</div><div class="vm">'+v.meaning+'</div>';
          d.onclick = function(){ openD(v); };
        }
        el.appendChild(d);
      });
    }
}
function switchBookTab(t){
    document.getElementById('bookTabState').textContent = t;
    renderBook();
}
function clearSearchBook(){
    if (!confirm('确定清空搜索收藏？')) return;
    localStorage.removeItem(SEARCH_BOOK_KEY);
    renderBook();
    showT('搜索收藏已清空');
}
function clearBook(){
    if (!confirm('确定清空收藏？')) return;
    localStorage.removeItem(BOOK_KEY);
    renderBook();
    showT('收藏已清空');
}

// ── 错题本──────────
const WRONG_KEY = 'jp_wrong';
function getWrong(){ try { return JSON.parse(localStorage.getItem(WRONG_KEY) || '[]'); } catch(e){ return []; } }
function addWrong(q){
    var list = getWrong();
    if (!list.find(function(w){ return w.id === q.id && w.question === q.question; })) {
        list.unshift({id:q.id,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation,source:q.source||'',type:q.type||'vocab',wrongTime:Date.now()});
        if (list.length > 500) list.length = 500;
        localStorage.setItem(WRONG_KEY, JSON.stringify(list));
    }
}
function removeWrong(idx){
    var list = getWrong();
    list.splice(idx,1);
    localStorage.setItem(WRONG_KEY, JSON.stringify(list));
    renderWrong();
    showT('已从错题本移除');
}
function clearWrong(){
    if (!confirm('确定清空错题本？')) return;
    localStorage.removeItem(WRONG_KEY);
    renderWrong();
    showT('错题本已清空');
}
function renderWrong(){
    var list = getWrong();
    var c = document.getElementById('wrongC');
    var cnt = document.getElementById('wrongCount');
    if (cnt) cnt.textContent = '共 '+list.length+' 道错题';
    if (!c) return;
    if (list.length === 0){
        c.innerHTML = '<div style="text-align:center;color:#666;padding:40px 0;font-size:14px">错题本为空<br><span style="font-size:12px">做真题时答错的题目会自动加入这里</span></div>';
        return;
    }
    c.innerHTML = '';
    list.forEach(function(q, idx){
        var d = document.createElement('div');
        d.className = 'gc';
        var optsHtml = '';
        q.options.forEach(function(o,i){
            optsHtml += '<span style="display:inline-block;min-width:140px;font-size:12px;padding:2px 0;color:'+(i===q.answer?'#4ecca3':'#888')+';font-weight:'+(i===q.answer?'700':'400')+'">'+(i===q.answer?'✓ ':'')+String.fromCharCode(65+i)+'. '+o+'</span>';
        });
        d.innerHTML = '<div class="gh">'
            +'<span style="font-size:11px;color:#e94560;font-weight:700">#'+(idx+1)+'</span>'
            +'<span class="gb" style="background:rgba(233,69,96,0.2);color:#e94560">'+(q.type==='grammar'?'文法':'語彙')+'</span>'
            +'<span style="font-size:10px;color:#666">'+(q.source||'')+'</span>'
            +'<span style="margin-left:auto;font-size:10px;color:#555">'+new Date(q.wrongTime).toLocaleDateString()+'</span>'
            +'</div>'
            +'<div style="font-size:13px;line-height:1.7;margin-bottom:8px">'+q.question+'</div>'
            +'<div style="margin-bottom:6px">'+optsHtml+'</div>'
            +'<div style="font-size:12px;color:#888;margin-bottom:8px;line-height:1.6">'+q.explanation+'</div>'
            +'<div style="display:flex;gap:6px">'
            +'<button class="btn ba" style="font-size:10px;padding:3px 8px" onclick="event.stopPropagation();removeWrong('+idx+')">✕ 移除</button>'
            +'</div>';
        c.appendChild(d);
    });
}
function startWrongQuiz(){
    var list = getWrong();
    if (list.length === 0){ showT('错题本为空'); return; }
    quizMode = 'wrong';
    quizIdx = 0;
    quizRight = 0;
    quizData = shuffle([...list]).slice(0, Math.min(10, list.length));
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizArea').style.display = 'block';
    showQuiz();
}

// ── 学习进度持久化（断点续学）──────────
const SESSION_KEY = 'jp_session';
function saveSession(){
    if (!curF || q.length === 0) return;
    var session = {
        filter: curF,
        ci: ci,
        total: q.length,
        wordId: q[ci] ? q[ci].id : null,
        time: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function clearSession(){
    localStorage.removeItem(SESSION_KEY);
}
function resumeSession(f){
    // 返回应恢复的 ci，如无有效进度则返回 0
    try {
        var s = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!s || s.filter !== f) return 0;
        // 超过 24 小时作废
        if (Date.now() - s.time > 86400000) { clearSession(); return 0; }
        // 找 wordId 在 q 中的位置（比存 ci 更可靠，因为 q 是排序生成的）
        if (s.wordId) {
            for (var i = 0; i < q.length; i++) {
                if (q[i].id === s.wordId) return i;
            }
        }
        return 0;
    } catch(e) { return 0; }
}

// ── 浏览学习：辅助函数 ──────────
function findVocabById(id) {
    return VOCAB.find(function(v){ return v.id === id; });
}

// ── 浏览学习追踪 ──────────
var _viewedWords = new Set();
var _vocabTimer = null;
var _vocabObserver = null;
var _vocabTrackingTimer = null; // Bug #5: 追踪 setTimeout 以便清理

function initVocabTracking(reset) {
    if (reset !== false) {
        _viewedWords.clear();
        stopVocabTimer();
    }
    if (_vocabObserver) _vocabObserver.disconnect();
    _vocabObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var id = parseInt(entry.target.getAttribute('data-id'));
                if (!isNaN(id) && id > 0) _viewedWords.add(id);
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('#vocabG .vc[data-id]').forEach(function(card) {
        _vocabObserver.observe(card);
    });
    startVocabTimer();
}

function startVocabTimer() {
    stopVocabTimer();
    _vocabTimer = setTimeout(function() {
        saveViewedWords();
    }, 60000);
}

function stopVocabTimer() {
    if (_vocabTimer) {
        clearTimeout(_vocabTimer);
        _vocabTimer = null;
    }
}

function saveViewedWords() {
    if (_viewedWords.size === 0) { startVocabTimer(); return; }
    var p = lp();
    var now = new Date();
    var tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
    var today = now.toISOString().split('T')[0];
    var count = 0;
    _viewedWords.forEach(function(id) {
        if (!p[id]) {
            p[id] = {
                interval: 1,
                repetitions: 0,
                ef: 2.5,
                nextDate: tomorrow,
                learnedDate: today,
                viewCount: 0
            };
        }
        if (!p[id].viewCount) p[id].viewCount = 0;
        p[id].viewCount++;
        count++;
    });
    if (count > 0) {
        sp(p);
    }
    _viewedWords.clear();
    startVocabTimer();
}

// === 学习模式：从单词墙顺序学 + 进度条拖动 + 跳过 ===
function startStudyFromWall(startId){
    var g=document.getElementById('vocabG');
    var cards=g?g.querySelectorAll('.vc[data-id]'):[];
    if(!cards||cards.length===0){startStudy(curF);return}
    q=[];
    var started=startId?false:true;
    cards.forEach(function(c){
        var id=parseInt(c.getAttribute('data-id'));
        if(id===startId)started=true;
        if(started&&!isNaN(id)){
            var v=findVocabById(id);
            if(v)q.push(v)
        }
    });
    if(q.length===0){startStudy(curF);return}
    document.getElementById('sp').style.display='block';
    document.getElementById('lm').style.display='none';
    ci=0;
    showC();
    upH()
}
function studyNext(){if(ci<q.length-1){ci++;showC()}else{showComp()}}
function studySeek(e){var b=document.getElementById('studyProgressBar');if(!b)return;var r=b.getBoundingClientRect();var p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));var i=Math.floor(p*q.length);if(i>=q.length)i=q.length-1;if(i<0)i=0;ci=i;showC()}
function studyDragStart(e){window._sd=true;studySeek(e);document.onmousemove=function(e2){if(window._sd)studySeek(e2)};document.onmouseup=function(){window._sd=false;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null};document.ontouchmove=function(e2){if(window._sd)studySeek(e2.touches[0])};document.ontouchend=function(){window._sd=false;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null}}

// === 自动播放 ===
var _apInterval=2000,_apBoth=true,_apQueue=[],_apIdx=0,_apTimer=null,_apPaused=false,_apStop=false;
function showAutoPlayOptions(){document.getElementById('autoPlayModal').classList.add('open');document.getElementById('autoPlayOverlay').classList.add('open')}
function closeAutoPlayOptions(){document.getElementById('autoPlayModal').classList.remove('open');document.getElementById('autoPlayOverlay').classList.remove('open')}
function saveAutoPlayOptions(){var iv=document.querySelector('input[name=apInterval]:checked');if(iv)_apInterval=parseInt(iv.value);var ct=document.querySelector('input[name=apContent]:checked');_apBoth=ct&&ct.value==='both';closeAutoPlayOptions();showT('⏱ 选项已保存');startAutoPlay()}
function startAutoPlay(){var g=document.getElementById('vocabG');if(!g){showT('请先进入词汇页');return}var cards=g.querySelectorAll('.vc[data-id]');if(!cards||cards.length===0){showT('当前词汇列表为空');return}_apQueue=[];cards.forEach(function(c){var id=parseInt(c.getAttribute('data-id'));if(!isNaN(id)){var v=findVocabById(id);if(v)_apQueue.push(v)}});if(_apQueue.length===0){showT('获取词汇数据失败');return}_apIdx=0;_apStop=false;_apPaused=false;document.getElementById('apScreen').classList.add('show');document.getElementById('sp').style.display='none';document.getElementById('lm').style.display='block';var pbar=document.querySelector('#apScreen .ap-progress');pbar.onmousedown=function(e){apSeek(e);window._apDragging=true};document.onmousemove=function(e){if(window._apDragging)apSeek(e)};document.onmouseup=function(){window._apDragging=false};pbar.ontouchstart=function(e){apSeek(e.touches[0]);window._apDragging=true};document.ontouchmove=function(e){if(window._apDragging)apSeek(e.touches[0])};document.ontouchend=function(){window._apDragging=false};_apTimer=setTimeout(apShowCard,500)}
function apSeek(e){clearTimeout(_apTimer);_apTimer=null;var bar=document.querySelector('#apScreen .ap-progress');var rect=bar.getBoundingClientRect();var pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));_apIdx=Math.floor(pct*_apQueue.length);if(_apIdx>=_apQueue.length)_apIdx=_apQueue.length-1;if(_apIdx<0)_apIdx=0;var pct2=Math.round((_apIdx+1)/_apQueue.length*100);document.querySelector('#apScreen .ap-progress-bar').style.width=pct2+'%';document.querySelector('#apScreen .ap-counter').textContent=(_apIdx+1)+'/'+_apQueue.length;clearTimeout(_apTimer);_apTimer=setTimeout(apShowCard,200)}
function apShowCard(){if(_apStop||_apIdx>=_apQueue.length){apDone();return}if(_apPaused){_apTimer=setTimeout(apShowCard,200);return}var v=_apQueue[_apIdx];var el=document.getElementById('apScreen');el.querySelector('.ap-word').textContent=v.word;el.querySelector('.ap-read').textContent=v.reading;el.querySelector('.ap-mean').textContent=v.meaning;var ex=el.querySelector('.ap-exjp');var exc=el.querySelector('.ap-excn');if(_apBoth&&v.ex_jp){ex.textContent=v.ex_jp;ex.style.display='block';exc.textContent=v.ex_cn||'';exc.style.display=v.ex_cn?'block':'none'}else{ex.style.display='none';exc.style.display='none'}var pct=Math.round((_apIdx+1)/_apQueue.length*100);el.querySelector('.ap-progress-bar').style.width=pct+'%';el.querySelector('.ap-counter').textContent=(_apIdx+1)+'/'+_apQueue.length;apSyncMarks(v);clearSpeechQueue();queueSpeak(v.word);if(_apBoth&&v.ex_jp)queueSpeak(v.ex_jp);var totalSpeechTime=_apBoth&&v.ex_jp?5000:2500;_apIdx++;clearTimeout(_apTimer);_apTimer=setTimeout(apShowCard,totalSpeechTime+_apInterval)}
function apTogglePause(){_apPaused=!_apPaused;var btn=document.querySelector('.ap-controls .btn:first-child');if(btn)btn.textContent=_apPaused?'▶ 继续':'⏸ 暂停';if(!_apPaused&&_apTimer===null)_apTimer=setTimeout(apShowCard,200)}
function apStop(){_apStop=true;clearTimeout(_apTimer);_apTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('apScreen').classList.remove('show');go('vocab')}
function apDone(){clearTimeout(_apTimer);_apTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('apScreen').classList.remove('show');showT('🎉 自动播放完成！共 '+_apQueue.length+' 个词');go('vocab')}
function apPrev(){if(!_apQueue||_apQueue.length===0)return;clearSpeechQueue();clearTimeout(_apTimer);_apTimer=null;var cur=_apIdx-(_apPaused?0:1);if(cur<=0)return;_apIdx=cur-1;_apPaused=false;apShowCard()}
function apNext(){if(!_apQueue||_apQueue.length===0)return;clearSpeechQueue();clearTimeout(_apTimer);_apTimer=null;var cur=_apIdx-(_apPaused?0:1);if(cur>=_apQueue.length-1)return;_apIdx=cur+1;_apPaused=false;apShowCard()}

// ── 学习计划系统 ───────────
const PLAN_KEY='jp_plans';
function getPlans(){try{return JSON.parse(localStorage.getItem(PLAN_KEY)||'[]')}catch(e){return[]}}
function savePlans(p){localStorage.setItem(PLAN_KEY,JSON.stringify(p))}
function upP(){
  var plans=getPlans();
  // 继续学习按钮
  var cont=document.getElementById('continueSection');
  var session=null;
  try{session=JSON.parse(localStorage.getItem('jp_session'))}catch(e){}
  if(session&&cont){
    cont.style.display='block';
    var info=document.getElementById('continueInfo');
    if(info){
      var lv={n1:'N1',n2:'N2',n3:'N3',n4:'N4',n5:'N5'}[session.filter]||session.filter;
      info.textContent=lv+' · 进度 '+(session.ci+1)+'/'+session.total;}
  }else if(cont){cont.style.display='none'}
  // 计划列表
  var list=document.getElementById('planList');
  if(!list)return;
  var active=plans.filter(function(p){return!p.finished});
  if(active.length===0){
    list.innerHTML='<div style="text-align:center;color:#555;padding:12px 0;font-size:12px">还没有学习计划，新建一个开始吧</div>';
    return;}
  list.innerHTML='';
  active.forEach(function(plan,idx){
    var d=document.createElement('div');d.className='plan-card';
    var ls=plan.levels.map(function(l){return l.toUpperCase()}).join(' + ');
    var total=plan.daily*plan.days;
    var pct=Math.min(100,plan.completedDays/plan.days*100);
    var realIdx=plans.indexOf(plan);
    d.innerHTML='<div class="plan-level" onclick="event.stopPropagation();startPlanStudy('+realIdx+')" style="cursor:pointer">'+ls+' · 每日 '+plan.daily+' 词</div>'
      +'<div class="plan-meta" onclick="event.stopPropagation();startPlanStudy('+realIdx+')" style="cursor:pointer">共 '+total+' 词 · '+plan.days+' 天 · 已完成 '+plan.completedDays+' 天</div>'
      +'<div class="plan-bar" onclick="event.stopPropagation();startPlanStudy('+realIdx+')" style="cursor:pointer"><div class="plan-fill" style="width:'+pct+'%"></div></div>'
      +'<div class="plan-actions">'
      +'<button class="btn bs" style="font-size:10px;padding:3px 8px" onclick="event.stopPropagation();startPlanStudy('+realIdx+')">▶ 今日学习</button>'
      +'<button class="btn br" style="font-size:10px;padding:3px 8px" onclick="event.stopPropagation();deletePlan('+realIdx+')">🗑 删除</button>'
      +'</div>';
    list.appendChild(d);});
}
function showPlanModal(){document.getElementById('planModal').classList.add('open');document.getElementById('planModal').querySelector('.dw').classList.add('open');planCalcEstimate()}
function closePlanModal(){document.getElementById('planModal').classList.remove('open');document.getElementById('planModal').querySelector('.dw').classList.remove('open')}
function togglePlanLvl(b){b.classList.toggle('active');planCalcEstimate()}
function planCalcEstimate(){
  var lvls=document.querySelectorAll('#planLevels .lvl-btn.active');
  var dly=document.getElementById('planDailyInput');
  if(!lvls.length||!dly)return;
  var daily=parseInt(dly.value)||10;if(daily<1)daily=1;
  var total=0;var parts=[];lvls.forEach(function(b){var lv=b.getAttribute('data-lvl');var cnt=0;VOCAB.forEach(function(v){if(v.level===lv)cnt++});total+=cnt;parts.push(lv.toUpperCase()+'('+cnt+')')});
  var days=Math.ceil(total/daily);
  var daysInput=document.getElementById('planDaysInput');
  if(daysInput)daysInput.value=days;
  document.getElementById('planEstimate').textContent='📊 词库：'+parts.join('+')+' = '+total+'词 · 每日 '+daily+'词 ≈ '+days+'天'}
function createPlan(){
  var lvlBtns=document.querySelectorAll('#planLevels .lvl-btn.active');
  var dlyInput=document.getElementById('planDailyInput');
  if(!lvlBtns.length){showT('请至少选择一个级别');return}
  if(!dlyInput||!dlyInput.value||parseInt(dlyInput.value)<1){showT('请输入每日学习量');return}
  var levels=[];lvlBtns.forEach(function(b){levels.push(b.getAttribute('data-lvl'))});
  var daily=parseInt(dlyInput.value)||10;if(daily<1)daily=1;
  var plan={id:Date.now(),levels:levels,daily:daily,days:parseInt(document.getElementById('planDaysInput').value)||30,created:new Date().toISOString().split('T')[0],startDate:new Date().toISOString().split('T')[0],completedDays:0,finished:false};
  var plans=getPlans();plans.push(plan);savePlans(plans);closePlanModal();upP();showT('🎉 学习计划已创建！')}
function deletePlan(idx){
  if(!confirm('确定删除此计划？'))return;
  var plans=getPlans();plans.splice(idx,1);savePlans(plans);upP()}
function startPlanStudy(idx){
  var plans=getPlans();
  if(!plans[idx])return;
  var plan=plans[idx];
  // 将计划设置同步到自动播放
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.levels=plan.levels;
  saved.count=plan.daily;
  saved.lvlOn=true;
  localStorage.setItem('ap_settings',JSON.stringify(saved));
  go('autoplay');
}
function resumeLastSession(){
  var session=null;
  try{session=JSON.parse(localStorage.getItem('jp_session'))}catch(e){}
  if(!session){showT('没有保存的学习进度');return}
  if(session.filter){
    var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
    saved.levels=[session.filter];
    saved.count=50;
    saved.lvlOn=true;
    localStorage.setItem('ap_settings',JSON.stringify(saved));
  }
  go('autoplay');
}

// ── 语法随机排序 ───────────
function setGSort(mode,el){
  curGSort=curGSort===mode?null:mode;
  document.querySelectorAll('#p-grammar .g-sort-btn').forEach(function(x){x.classList.toggle('active',x===el&&curGSort)});
  renderG()}

// ── 语法自动播放 ───────────
var _gApInterval=2000,_gApBoth=true,_gApQueue=[],_gApIdx=0,_gApTimer=null,_gApPaused=false,_gApStop=false;
function showGAutoPlayOptions(){document.getElementById('gAutoPlayModal').classList.add('open');document.getElementById('gAutoPlayOverlay').classList.add('open')}
function closeGAutoPlayOptions(){document.getElementById('gAutoPlayModal').classList.remove('open');document.getElementById('gAutoPlayOverlay').classList.remove('open')}
function saveGAutoPlayOptions(){var iv=document.querySelector('input[name=gApInterval]:checked');if(iv)_gApInterval=parseInt(iv.value);var ct=document.querySelector('input[name=gApContent]:checked');_gApBoth=ct&&ct.value==='both';closeGAutoPlayOptions();showT('⏱ 选项已保存');startGAutoPlay()}
function startGAutoPlay(){var g=document.getElementById('grammarL');if(!g){showT('请先进入语法页');return}var cards=g.querySelectorAll('.gc');if(!cards||cards.length===0){showT('当前语法列表为空');return}_gApQueue=[];cards.forEach(function(c){var btns=c.querySelectorAll('[data-gid]');if(btns.length>0){var id=btns[0].getAttribute('data-gid');var gr=GRAMMAR_DATA.find(function(x){return x.id==id});if(gr)_gApQueue.push(gr)}});if(_gApQueue.length===0){showT('获取语法数据失败');return}_gApIdx=0;_gApStop=false;_gApPaused=false;document.getElementById('gApScreen').classList.add('show');var pbar=document.querySelector('#gApScreen .ap-progress');pbar.onmousedown=function(e){gApSeek(e);window._gApDragging=true};document.onmousemove=function(e){if(window._gApDragging)gApSeek(e)};document.onmouseup=function(){window._gApDragging=false};pbar.ontouchstart=function(e){gApSeek(e.touches[0]);window._gApDragging=true};document.ontouchmove=function(e){if(window._gApDragging)gApSeek(e.touches[0])};document.ontouchend=function(){window._gApDragging=false};_gApTimer=setTimeout(gApShowCard,500)}
function gApSeek(e){clearTimeout(_gApTimer);_gApTimer=null;var bar=document.querySelector('#gApScreen .ap-progress');var rect=bar.getBoundingClientRect();var pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));_gApIdx=Math.floor(pct*_gApQueue.length);if(_gApIdx>=_gApQueue.length)_gApIdx=_gApQueue.length-1;if(_gApIdx<0)_gApIdx=0;var pct2=Math.round((_gApIdx+1)/_gApQueue.length*100);document.querySelector('#gApScreen .ap-progress-bar').style.width=pct2+'%';document.querySelector('#gApScreen .ap-counter').textContent=(_gApIdx+1)+'/'+_gApQueue.length;gApShowCard()}
function gApShowCard(){if(_gApStop||_gApIdx>=_gApQueue.length){gApDone();return}if(_gApPaused){_gApTimer=setTimeout(gApShowCard,200);return}var gr=_gApQueue[_gApIdx];var el=document.getElementById('gApScreen');el.querySelector('.ap-word').textContent=gr.pattern;el.querySelector('.ap-read').textContent=gr.ex_read||'';el.querySelector('.ap-mean').textContent=gr.meaning;var ex=el.querySelector('.ap-exjp');var exc=el.querySelector('.ap-excn');if(_gApBoth&&gr.ex_jp){ex.textContent=gr.ex_jp;ex.style.display='block';exc.textContent=gr.ex_cn||'';exc.style.display=gr.ex_cn?'block':'none'}else{ex.style.display='none';exc.style.display='none'}var pct=Math.round((_gApIdx+1)/_gApQueue.length*100);el.querySelector('.ap-progress-bar').style.width=pct+'%';el.querySelector('.ap-counter').textContent=(_gApIdx+1)+'/'+_gApQueue.length;gApSyncMarks(gr);clearSpeechQueue();queueSpeak(gr.ex_jp||gr.pattern);if(_gApBoth&&gr.ex_jp)queueSpeak(gr.ex_jp);var totalSpeechTime=_gApBoth&&gr.ex_jp?5000:2500;_gApIdx++;clearTimeout(_gApTimer);_gApTimer=setTimeout(gApShowCard,totalSpeechTime+_gApInterval)}
function gApTogglePause(){_gApPaused=!_gApPaused;var btn=document.querySelector('#gApScreen .ap-controls .btn:first-child');if(btn)btn.textContent=_gApPaused?'▶ 继续':'⏸ 暂停';if(!_gApPaused&&_gApTimer===null)_gApTimer=setTimeout(gApShowCard,200)}
function gApStop(){_gApStop=true;clearTimeout(_gApTimer);_gApTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('gApScreen').classList.remove('show')}
function gApDone(){clearTimeout(_gApTimer);_gApTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('gApScreen').classList.remove('show');showT('🎉 语法自动播放完成！共 '+_gApQueue.length+' 条');go('grammar')}
function gApPrev(){if(!_gApQueue||_gApQueue.length===0)return;clearSpeechQueue();clearTimeout(_gApTimer);_gApTimer=null;var cur=_gApIdx-(_gApPaused?0:1);if(cur<=0)return;_gApIdx=cur-1;_gApPaused=false;gApShowCard()}
function gApNext(){if(!_gApQueue||_gApQueue.length===0)return;clearSpeechQueue();clearTimeout(_gApTimer);_gApTimer=null;var cur=_gApIdx-(_gApPaused?0:1);if(cur>=_gApQueue.length-1)return;_gApIdx=cur+1;_gApPaused=false;gApShowCard()}
function gApToggleBook(){var gr=_gApQueue[_gApIdx-(_gApPaused?0:1)];if(!gr)return;toggleGBook(gr.id);gApSyncMarks(gr)}
function gApToggleMark(c){var gr=_gApQueue[_gApIdx-(_gApPaused?0:1)];if(!gr)return;toggleGMark(gr.id,c);gApSyncMarks(gr)}
function gApSyncMarks(gr){if(!gr)return;var b=(JSON.parse(localStorage.getItem('gb')||'[]')||[]).indexOf(gr.id)>=0;document.getElementById('gApBmk').textContent=b?'⭐':'☆';var m=JSON.parse(localStorage.getItem('gm')||'{}')[gr.id];document.querySelectorAll('#gApScreen .ap-marks .vm-btn').forEach(function(x){var c=x.getAttribute('data-color');var a=m===c;x.classList.remove('vm-btn-red','vm-btn-yellow','vm-btn-green','vm-btn-active');if(a){x.classList.add('vm-btn-'+c,'vm-btn-active');x.style.borderColor='';x.style.background='';x.style.opacity=''}else{x.style.borderColor='transparent';x.style.background='transparent';x.style.opacity='0.4'}})}

// ============================================================
// 单词自动播放
// ============================================================
var _vApQueue=[],_vApIdx=0,_vApPaused=false,_vApTimer=null,_vApActive=false;
var ALL_CATEGORIES=[];
(function(){var c={};VOCAB.forEach(function(v){c[v.category]=1});ALL_CATEGORIES=Object.keys(c).sort()})();

function renderAutoPlayOptions(){
  var c=document.getElementById('p-autoplay');if(!c)return;
  var lvls=['n5','n4','n3','n2','n1'];
  var lvlNames={n5:'N5',n4:'N4',n3:'N3',n2:'N2',n1:'N1'};
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  var selLvls=saved.levels||['n5','n4','n3'];
  var selCats=saved.categories||[];
  var speed=saved.speed||1;
  var count=typeof saved.count==='number' ? saved.count : 50;
  var lvlOn=saved.lvlOn!==false; // 默认开启
  var catOn=saved.catOn||false;   // 默认关闭（需要显式开启）
  c.innerHTML='<div style="padding:20px;max-width:600px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="go(\'home\')" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px">←</button>'
    +'<div style="font-size:20px;font-weight:700;color:#e2e8f0">📚 背单词 · 自动播放</div>'
    +'</div>'
    // 考级分类（带勾选）
    +'<div class="ap-section" style="padding:14px 16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">'
    +'<div style="display:flex;justify-content:space-between;align-items:center">'
    +'<span onclick="_apToggleLvlSection()" style="cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#e2e8f0">'
    +'<span class="ap-checkbox'+(lvlOn?' ap-checked':'')+'" id="ap-cb-lvl">'+(lvlOn?'☑':'☐')+'</span>🏷️ 考级分类</span>'
    +'<span id="ap-lvl-arrow" onclick="_apToggle(document.getElementById(\'ap-lvl-section\'),\'ap-lvl-body\')" style="color:#64748b;font-size:14px;cursor:pointer;transition:transform 0.2s">▼</span>'
    +'</div>'
    +'<div id="ap-lvl-body" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;'+(lvlOn?'':'opacity:0.35;pointer-events:none')+'">'
    +lvls.map(function(l){var a=selLvls.indexOf(l)>=0;return '<span class="ap-tag'+(a?' ap-tag-on':'')+'" data-lvl="'+l+'" onclick="_apToggleLvl(this,\''+l+'\')" style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;'+(a?'background:linear-gradient(135deg,#e94560,#ff6b9d);color:#fff':'background:rgba(255,255,255,0.06);color:#64748b')+'">'+lvlNames[l]+'</span>'}).join('')
    +'</div>'
    +'</div>'
    // 场景分类（带勾选）
    +'<div class="ap-section" style="padding:14px 16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">'
    +'<div style="display:flex;justify-content:space-between;align-items:center">'
    +'<span onclick="_apToggleCatSection()" style="cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#e2e8f0">'
    +'<span class="ap-checkbox'+(catOn?' ap-checked':'')+'" id="ap-cb-cat">'+(catOn?'☑':'☐')+'</span>📂 场景分类</span>'
    +'<span style="display:flex;gap:6px;align-items:center">'
    +(catOn?'<span onclick="event.stopPropagation();_apCatAll()" style="font-size:11px;color:#4ecca3;cursor:pointer">全选</span>':'')
    +'<span id="ap-cat-arrow" onclick="_apToggle(document.getElementById(\'ap-cat-section\'),\'ap-cat-body\')" style="color:#64748b;font-size:14px;cursor:pointer;transition:transform 0.2s">▼</span></span>'
    +'</div>'
    +'<div id="ap-cat-body" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;'+(catOn?'':'opacity:0.35;pointer-events:none')+'">'
    +ALL_CATEGORIES.map(function(cat){var a=selCats.length===0||selCats.indexOf(cat)>=0;return '<span class="ap-tag'+(a?' ap-tag-on':'')+'" data-cat="'+cat.replace(/'/g,'\\\'')+'" onclick="_apToggleCat(this)" style="display:inline-block;padding:5px 12px;border-radius:16px;font-size:11px;cursor:pointer;transition:all 0.2s;'+(a?'background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff':'background:rgba(255,255,255,0.06);color:#64748b')+'">'+cat+'</span>'}).join('')
    +'</div>'
    +'</div>'
    // 形式
    +'<div style="padding:14px 16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">'
    +'<div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:10px">📐 形式</div>'
    +'<div style="display:flex;gap:8px">'
    +[['word','单词'],['word_sent','单词+例句']].map(function(f){
      var val=f[0],label=f[1];
      var cur=saved.format||'word';
      return '<span class="ap-tag'+(cur===val?' ap-tag-on':'')+'" data-format="'+val+'" onclick="_apSetFormat(this,\''+val+'\')" style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:all 0.2s;'+(cur===val?'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff':'background:rgba(255,255,255,0.06);color:#64748b')+'">'+label+'</span>'
    }).join('')
    +'</div>'
    +'</div>'
    // 播放间隔
    +'<div style="padding:14px 16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">'
    +'<div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:10px">⏱️ 播放间隔</div>'
    +'<div style="display:flex;gap:8px">'
    +[[0,'0秒'],[0.5,'0.5秒'],[1,'1秒'],[2,'2秒'],[3,'3秒']].map(function(s){
      var val=s[0],label=s[1];
      return '<span class="ap-tag'+(speed===val?' ap-tag-on':'')+'" data-speed="'+val+'" onclick="_apSetSpeed(this,'+val+')" style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:all 0.2s;'+(speed===val?'background:linear-gradient(135deg,#4ecca3,#2ecc71);color:#fff':'background:rgba(255,255,255,0.06);color:#64748b')+'">'+label+'</span>'
    }).join('')
    +'</div>'
    +'</div>'
    // 数量
    +'<div style="padding:14px 16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.06)">'
    +'<div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:10px">🔢 单词数量</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +[10,20,50,100].map(function(n){return '<span class="ap-tag'+(count===n?' ap-tag-on':'')+'" data-count="'+n+'" onclick="_apSetCount(this,'+n+')" style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:all 0.2s;'+(count===n?'background:linear-gradient(135deg,#f5a623,#ffd700);color:#000':'background:rgba(255,255,255,0.06);color:#64748b')+'">'+n+'个</span>'}).join('')
    +'<span class="ap-tag'+(count===0?' ap-tag-on':'')+'" data-count="0" onclick="_apSetCount(this,0)" style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:all 0.2s;'+(count===0?'background:linear-gradient(135deg,#f5a623,#ffd700);color:#000':'background:rgba(255,255,255,0.06);color:#64748b')+'">全部</span>'
    +'</div>'
    +'</div>'
    // 开始按钮
    +'<button onclick="startVocabAutoPlay()" style="width:100%;padding:16px;border-radius:24px;border:none;background:linear-gradient(135deg,#e94560,#ff6b9d);color:#fff;font-size:18px;font-weight:700;cursor:pointer;box-shadow:0 4px 24px rgba(233,69,96,0.3);transition:all 0.2s">🚀 开始播放</button>'
    +'</div>';
}

// 展开/收起
function _apToggle(triggerEl,bodyId){
  var body=document.getElementById(bodyId);if(!body)return;
  var arrow=triggerEl?triggerEl.querySelector('[id$="-arrow"]'):null;
  if(!arrow)arrow=document.getElementById(bodyId.replace('body','arrow'));
  if(body.style.display==='none'||body.style.display===''){
    body.style.display='flex';
    if(arrow)arrow.style.transform='rotate(0deg)'
  }else{
    body.style.display='none';
    if(arrow)arrow.style.transform='rotate(-90deg)'
  }
}

// 考级分类勾选切换
function _apToggleLvlSection(){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.lvlOn=!saved.lvlOn;
  if(!saved.lvlOn&&!saved.catOn){saved.lvlOn=true} // 至少保留一个
  localStorage.setItem('ap_settings',JSON.stringify(saved));
  renderAutoPlayOptions();
}

// 场景分类勾选切换
function _apToggleCatSection(){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.catOn=!saved.catOn;
  if(!saved.lvlOn&&!saved.catOn){saved.catOn=true} // 至少保留一个
  localStorage.setItem('ap_settings',JSON.stringify(saved));
  renderAutoPlayOptions();
}

// 考级点击
function _apToggleLvl(el,lvl){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  var lvls=saved.levels||['n5','n4','n3'];
  var idx=lvls.indexOf(lvl);
  if(idx>=0)lvls.splice(idx,1);else lvls.push(lvl);
  if(lvls.length===0)lvls=['n5','n4','n3'];
  saved.levels=lvls;localStorage.setItem('ap_settings',JSON.stringify(saved));
  el.classList.toggle('ap-tag-on');
  el.style.background=el.classList.contains('ap-tag-on')?'linear-gradient(135deg,#e94560,#ff6b9d)':'rgba(255,255,255,0.06)';
  el.style.color=el.classList.contains('ap-tag-on')?'#fff':'#64748b';
}

// 场景点击
function _apToggleCat(el){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  var cats=saved.categories||[];
  var cat=el.getAttribute('data-cat');
  var idx=cats.indexOf(cat);
  if(idx>=0)cats.splice(idx,1);else cats.push(cat);
  saved.categories=cats;localStorage.setItem('ap_settings',JSON.stringify(saved));
  el.classList.toggle('ap-tag-on');
  el.style.background=el.classList.contains('ap-tag-on')?'linear-gradient(135deg,#a855f7,#7c3aed)':'rgba(255,255,255,0.06)';
  el.style.color=el.classList.contains('ap-tag-on')?'#fff':'#64748b';
}

// 全选场景
function _apCatAll(){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.categories=[];localStorage.setItem('ap_settings',JSON.stringify(saved));
  document.querySelectorAll('#ap-cat-body .ap-tag').forEach(function(el){el.classList.add('ap-tag-on');el.style.background='linear-gradient(135deg,#a855f7,#7c3aed)';el.style.color='#fff'});
}

// 形式
function _apSetFormat(el,f){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.format=f;localStorage.setItem('ap_settings',JSON.stringify(saved));
  document.querySelectorAll('[data-format]').forEach(function(x){x.classList.remove('ap-tag-on');x.style.background='rgba(255,255,255,0.06)';x.style.color='#64748b'});
  el.classList.add('ap-tag-on');el.style.background='linear-gradient(135deg,#6366f1,#8b5cf6)';el.style.color='#fff';
}

// 速度
function _apSetSpeed(el,s){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.speed=s;localStorage.setItem('ap_settings',JSON.stringify(saved));
  document.querySelectorAll('[data-speed]').forEach(function(x){x.classList.remove('ap-tag-on');x.style.background='rgba(255,255,255,0.06)';x.style.color='#64748b'});
  el.classList.add('ap-tag-on');el.style.background='linear-gradient(135deg,#4ecca3,#2ecc71)';el.style.color='#fff';
}

// 数量
function _apSetCount(el,n){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  saved.count=n;localStorage.setItem('ap_settings',JSON.stringify(saved));
  document.querySelectorAll('[data-count]').forEach(function(x){x.classList.remove('ap-tag-on');x.style.background='rgba(255,255,255,0.06)';x.style.color='#64748b'});
  el.classList.add('ap-tag-on');el.style.background='linear-gradient(135deg,#f5a623,#ffd700)';el.style.color='#000';
}

// 开始自动播放
function startVocabAutoPlay(){
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  var selLvls=saved.levels||['n5','n4','n3'];
  var selCats=saved.categories||[];
  var speed=saved.speed||1;
  var count=typeof saved.count==='number' ? saved.count : 50;
  var lvlOn=saved.lvlOn!==false;
  var catOn=saved.catOn||false;
  var format=saved.format||'word';
  
  // 过滤词汇
  var pool=VOCAB.filter(function(v){
    if(lvlOn&&selLvls.indexOf(v.level)<0)return false;
    if(catOn&&selCats.length>0&&selCats.indexOf(v.category)<0)return false;
    return true;
  });
  if(pool.length===0){showT('没有符合条件的词汇，请调整筛选条件');return}
  
  // 打乱并截取
  pool=[...pool].sort(function(){return Math.random()-0.5});
  if(count>0&&pool.length>count)pool=pool.slice(0,count);
  
  _vApQueue=pool;_vApIdx=0;_vApPaused=false;_vApActive=true;
  
  // 绑定控制按钮到单词自动播放
  var screen=document.getElementById('gApScreen');
  screen.querySelectorAll('.btn').forEach(function(btn){
    if(btn.textContent.indexOf('暂停')>=0||btn.textContent.indexOf('继续')>=0)btn.onclick=vApTogglePause;
    else if(btn.textContent.indexOf('停止')>=0)btn.onclick=vApStop;
  });
  screen.querySelector('.ap-nav-left').onclick=vApPrev;
  screen.querySelector('.ap-nav-right').onclick=vApNext;
  document.getElementById('gApBmk').onclick=vApToggleBook;
  screen.querySelectorAll('.ap-marks .vm-btn').forEach(function(btn){
    var c=btn.getAttribute('data-color');
    btn.onclick=function(){vApToggleMark(c)};
  });
  
  // 调整字号（词汇用大字号）
  var wEl=screen.querySelector('.ap-word');
  wEl.style.fontSize='56px';
  
  screen.classList.add('show');
  _vApSpeed=speed;
  vApShowCard();
}

var _vApSpeed=1;

function vApShowCard(){
  if(!_vApQueue||_vApQueue.length===0)return;
  var w=_vApQueue[_vApIdx];
  if(!w)return;
  var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
  var format=saved.format||'word';
  var showSent=(format==='word_sent');
  clearSpeechQueue();
  document.querySelector('#gApScreen .ap-word').textContent=w.word;
  document.querySelector('#gApScreen .ap-read').textContent=w.reading;
  document.querySelector('#gApScreen .ap-mean').textContent=w.meaning;
  document.querySelector('#gApScreen .ap-exjp').textContent=showSent?(w.ex_jp||''):'';
  document.querySelector('#gApScreen .ap-excn').textContent=showSent?(w.ex_cn||''):'';
  document.querySelector('#gApScreen .ap-progress-bar').style.width=((_vApIdx+1)/_vApQueue.length*100)+'%';
  document.querySelector('#gApScreen .ap-counter').textContent=(_vApIdx+1)+'/'+_vApQueue.length;
  // 同步标记
  vApSyncMarks(w);
  // 自动发音
  vApSpeak(w,showSent);
  // 计算下一词时间：基础展示 + 间隔
  clearTimeout(_vApTimer);_vApTimer=null;
  var baseTime=showSent?3500:2000; // 单词展示时间(ms)
  var gap=_vApSpeed*1000;           // 间隔(ms)
  var delay=baseTime+gap;
  if(!_vApPaused&&_vApIdx<_vApQueue.length-1){
    _vApTimer=setTimeout(function(){if(!_vApPaused&&_vApActive){_vApIdx++;vApShowCard()}},delay);
  }else if(!_vApPaused&&_vApIdx>=_vApQueue.length-1){
    // 最后一个词展示完后结束
    _vApTimer=setTimeout(function(){if(_vApActive)vApStop()},delay+1000);
  }
}

function vApSpeak(w,showSent){
  try{
    clearSpeechQueue();
    queueSpeak(w.word);
    if(showSent&&w.ex_jp)queueSpeak(w.ex_jp,{rate:0.7});
  }catch(e){}
}

function vApTogglePause(){
  _vApPaused=!_vApPaused;
  var btn=document.querySelector('#gApScreen .ap-controls .btn:first-child');
  if(btn)btn.textContent=_vApPaused?'▶ 继续':'⏸ 暂停';
  if(_vApPaused){
    clearTimeout(_vApTimer);_vApTimer=null;
  }else{
    var saved=JSON.parse(localStorage.getItem('ap_settings')||'{}');
    var format=saved.format||'word';
    var baseTime=format==='word_sent'?3500:2000;
    var gap=_vApSpeed*1000;
    if(_vApIdx<_vApQueue.length-1){
      _vApTimer=setTimeout(function(){if(!_vApPaused&&_vApActive){_vApIdx++;vApShowCard()}},baseTime+gap);
    }else{
      vApShowCard();
    }
  }
}

function vApStop(){
  _vApActive=false;_vApPaused=false;
  clearTimeout(_vApTimer);_vApTimer=null;
  clearSpeechQueue();
  // 操作词汇自动播放屏幕（非语法 gApScreen）（Bug #4）
  document.getElementById('apScreen').classList.remove('show');
  showT('🎉 自动播放完成！共 '+_vApQueue.length+' 词');
  _vApQueue=[];_vApIdx=0;
}

function vApPrev(){
  clearSpeechQueue();clearTimeout(_vApTimer);_vApTimer=null;
  var cur=_vApIdx-(_vApPaused?0:1);
  if(cur<=0)return;
  _vApIdx=cur-1;_vApPaused=false;
  vApShowCard();
}

function vApNext(){
  clearSpeechQueue();clearTimeout(_vApTimer);_vApTimer=null;
  var cur=_vApIdx-(_vApPaused?0:1);
  if(cur>=_vApQueue.length-1)return;
  _vApIdx=cur+1;_vApPaused=false;
  vApShowCard();
}

function vApToggleBook(){
  var w=_vApQueue[_vApIdx-(_vApPaused?0:1)];
  if(!w)return;
  toggleBook({type:'vocab',id:w.id});
  vApSyncMarks(w);
}

function vApToggleMark(c){
  var w=_vApQueue[_vApIdx-(_vApPaused?0:1)];
  if(!w)return;
  var mk=JSON.parse(localStorage.getItem('mk')||'{}');
  mk[w.id]=mk[w.id]===c?null:c;
  localStorage.setItem('mk',JSON.stringify(mk));
  vApSyncMarks(w);
}

function vApSyncMarks(w){
  if(!w)return;
  var b=getBook().some(function(x){return x.type==='vocab'&&x.id===w.id});
  document.getElementById('gApBmk').textContent=b?'⭐':'☆';
  var mk=JSON.parse(localStorage.getItem('mk')||'{}')[w.id];
  document.querySelectorAll('#gApScreen .ap-marks .vm-btn').forEach(function(x){
    var c=x.getAttribute('data-color');
    var a=mk===c;
    x.classList.remove('vm-btn-red','vm-btn-yellow','vm-btn-green','vm-btn-active');
    if(a){x.classList.add('vm-btn-'+c,'vm-btn-active');x.style.borderColor='';x.style.background='';x.style.opacity=''}
    else{x.style.borderColor='transparent';x.style.background='transparent';x.style.opacity='0.4'}
  });
}

// ===== AI 搜索栏 =====
var _searchTimer=null;

function doSearch(){
  var q=document.getElementById('aiSearchInput').value.trim();
  clearSearchResults();
  if(!q){showSearchEmpty('输入关键词开始搜索');return}
  showSearchLoading();
  // 本地搜索（VOCAB + GRAMMAR）
  var results=searchLocal(q);
  // 渲染本地结果
  renderSearchResults(q,results);
  // 始终触发 AI 搜索（日翻中 + 中翻日）
  doAISearch(q,results);
}

function clearSearch(){
  document.getElementById('aiSearchInput').value='';
  document.getElementById('searchClear').classList.remove('visible');
  clearSearchResults();
}

function clearSearchResults(){
  var el=document.getElementById('searchResults');
  el.innerHTML='';
  el.classList.remove('visible');
}

function doAISearch(q,localResults){
  // AI 翻译 + 补充语源信息
  var el=document.getElementById('searchResults');
  // 判断输入是中文还是日文（含日文假名→日文，否则→中文）
  var isChinese = /[\u4e00-\u9fff]/.test(q) && !/[\u3040-\u309f\u30a0-\u30ff]/.test(q);
  var aiId = '_ai_'+Date.now();
  
  // 根据语言选择不同的 prompt
  var prompt;
  if (isChinese) {
    prompt='翻译以下中文到地道的日语口语/书面表达，格式严格如下（每行一个字段）：\n'+
      '日语翻译：\n'+
      '中文解释：\n'+
      '说明：\n\n'+
      '规则：\n'+
      '- 日语翻译写最自然、最常用的日语表达（必要时用汉字+假名）\n'+
      '- 中文解释写简洁的中文释义\n'+
      '- 说明写语境或使用注意\n\n'+
      '中文：'+q;
  } else {
    prompt='分析以下日文并输出信息，格式严格如下（每行一个字段，没有就写「无」）：\n'+
      '中文翻译：\n'+
      '外来语原词：\n'+
      '日文汉字：\n'+
      '说明：\n\n'+
      '规则：\n'+
      '- 如果是片假名词汇 → 外来语原词写出对应的外语原词（如 switch on）\n'+
      '- 如果是平假名词汇有对应的日文汉字 → 日文汉字写出汉字形式（如 おいしい→美味しい）\n'+
      '- 中文翻译写简洁的中文释义\n'+
      '- 说明写简单备注（如语境、常用搭配），没有就不写\n\n'+
      '日文：'+q;
  }
  
  callAI(_searchConfig.apiUrl,_searchConfig.model,[{role:'user',content:prompt}],512,_searchConfig.apiKey).then(function(txt){
    // 解析 AI 返回的字段
    var cn='',src='',kanji='',note='';
    
    if (isChinese) {
      // 中文→日语模式
      txt.split('\n').forEach(function(line){
        var m=line.match(/^日语翻译[：:]?\s*(.*)/);if(m)cn=m[1];
        // cn 暂时存日语翻译结果
        m=line.match(/^中文解释[：:]?\s*(.*)/);if(m)kanji=m[1];
        m=line.match(/^说明[：:]?\s*(.*)/);if(m)note=m[1];
      });
      // 容错
      if(!cn&&txt.trim())cn=txt.trim();
      if(kanji==='无'||kanji==='なし')kanji='';
      if(note==='无'||note==='なし')note='';
      
      var jpText = cn;    // 日语翻译文本（发音用）
      var chText = kanji; // 中文解释
      var displayWord = jpText;
      var displayReading = '';
      var meaningText = chText || q; // 显示中文解释或原文
      
      // 检查收藏状态
      var book = getBook();
      var alreadyInBook = book.some(function(x){ return x.type==='ai' && x.word===jpText; });
      
      var aiHtml='<div class="search-result-item" style="cursor:default">'+
        '<div class="search-result-info" style="flex:1;min-width:0">'+
        '<div class="search-result-wordrow">'+
        '<span class="search-result-word">'+escHtml(jpText)+'</span>'+
        '<span class="search-result-level sl-ai" style="background:#e6f7ff;color:#1890ff;border:1px solid #91d5ff;font-size:10px;padding:1px 6px;border-radius:3px;font-weight:500">中→日</span>'+
        '</div>'+
        '<div class="search-result-meaning" style="color:#d46b08">→ '+escHtml(meaningText)+'</div>'+
        '<div class="search-result-tags">'+
        (note ? '<span class="search-result-tag">💡 '+escHtml(note)+'</span>' : '')+
        '</div>'+
        '</div>'+
        '<div class="search-result-actions" style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;align-items:center">'+
        '<button onclick="event.stopPropagation();speak(\''+escHtml(jpText)+'\')" style="background:none;border:none;cursor:pointer;font-size:18px;padding:4px;color:#888" title="发音">🔊</button>'+
        '<span class="search-book-btn" onclick="event.stopPropagation();toggleBook({type:\'ai\', word:\''+escHtml(jpText)+'\', reading:\'\', meaning:\''+escHtml(meaningText)+'\', level:\'\'});this.textContent=this.textContent==\'★\'?\'☆\':\'★\';return false" style="cursor:pointer;font-size:18px;opacity:0.4;transition:opacity 0.2s" title="收藏到生词本">'+(alreadyInBook?'★':'☆')+'</span>'+
        '</div>'+
        '</div>';
      
      // 插入到现有结果前面
      if(!localResults||localResults.length===0){
        el.innerHTML=aiHtml;
      }else{
        el.innerHTML=aiHtml+el.innerHTML;
      }
      
      // 自动加入生词本
      if (!alreadyInBook && !VOCAB.some(function(x){ return x.word===jpText; })) {
        toggleBook({type:'ai', word:jpText, reading:'', meaning:meaningText, level:''});
      }
    } else {
      // 日文→中文模式（原逻辑）
      txt.split('\n').forEach(function(line){
        var m=line.match(/^中文翻译[：:]?\s*(.*)/);if(m)cn=m[1];
        m=line.match(/^外来语原词[：:]?\s*(.*)/);if(m)src=m[1];
        m=line.match(/^日文汉字[：:]?\s*(.*)/);if(m)kanji=m[1];
        m=line.match(/^说明[：:]?\s*(.*)/);if(m)note=m[1];
      });
      if(!cn&&txt.trim())cn=txt.trim();
      if(src==='无'||src==='なし')src='';
      if(kanji==='无'||kanji==='なし')kanji='';
      if(note==='无'||note==='なし')note='';
      
      var displayWord = (kanji && kanji!=='无' && kanji!=='なし') ? kanji : q;
      var displayReading = (kanji && kanji!==q && kanji!=='无' && kanji!=='なし') ? q : '';
      
      var book = getBook();
      var alreadyInBook = book.some(function(x){ return x.type==='ai' && x.word===q; });
      
      var aiHtml='<div class="search-result-item" style="cursor:default">'+
        '<div class="search-result-info" style="flex:1;min-width:0">'+
        '<div class="search-result-wordrow">'+
        '<span class="search-result-word">'+escHtml(displayWord)+'</span>'+
        (displayReading ? '<span class="search-result-reading">'+escHtml(displayReading)+'</span>' : '')+
        '<span class="search-result-level sl-ai" style="background:#e6f7ff;color:#1890ff;border:1px solid #91d5ff;font-size:10px;padding:1px 6px;border-radius:3px;font-weight:500">AI</span>'+
        '</div>'+
        '<div class="search-result-meaning" style="color:#d46b08">→ '+escHtml(cn||'')+'</div>'+
        '<div class="search-result-tags">'+
        (src ? '<span class="search-result-tag">语源：'+escHtml(src)+'</span>' : '')+
        (note ? '<span class="search-result-tag">💡 '+escHtml(note)+'</span>' : '')+
        '</div>'+
        '</div>'+
        '<div class="search-result-actions" style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;align-items:center">'+
        '<button onclick="event.stopPropagation();speak(\''+escHtml(q)+'\')" style="background:none;border:none;cursor:pointer;font-size:18px;padding:4px;color:#888" title="发音">🔊</button>'+
        '<span class="search-book-btn" onclick="event.stopPropagation();toggleBook({type:\'ai\', word:\''+escHtml(q)+'\', reading:\''+escHtml(kanji||'')+'\', meaning:\''+escHtml(cn||'')+'\', level:\'\'});this.textContent=this.textContent==\'★\'?\'☆\':\'★\';return false" style="cursor:pointer;font-size:18px;opacity:0.4;transition:opacity 0.2s" title="收藏到生词本">'+(alreadyInBook?'★':'☆')+'</span>'+
        '</div>'+
        '</div>';
      
      if(!localResults||localResults.length===0){
        el.innerHTML=aiHtml;
      }else{
        el.innerHTML=aiHtml+el.innerHTML;
      }
      
      // 不自动加生词本，用户可手动点收藏按钮
    }
  }).catch(function(err){
    console.log('AI search error:',err);
  });
}

function showSearchLoading(){
  var el=document.getElementById('searchResults');
  el.innerHTML='<div class="search-tip-text" style="color:#888;padding:12px 0;font-size:14px">🐴 AI全力拉磨中<span class="dot-anim"><span>.</span><span>.</span><span>.</span></span></div>';
  el.classList.add('visible');
}

function showSearchEmpty(txt){
  var el=document.getElementById('searchResults');
  el.innerHTML='<div class="search-empty">'+txt+'</div>';
  el.classList.add('visible');
}

function showSearchTip(txt,ai){
  var el=document.getElementById('searchResults');
  el.innerHTML='<div class="search-tip-text">'+txt+'</div>';
  el.classList.add('visible');
}

function searchLocal(q){
  var ql=q.toLowerCase();
  var results=[];
  // 搜索词汇
  for(var i=0;i<VOCAB.length;i++){
    var v=VOCAB[i];
    if(!v||!v.word)continue;
    if(v.word.indexOf(ql)>=0||(v.reading&&v.reading.indexOf(ql)>=0)||(v.meaning&&v.meaning.indexOf(ql)>=0)){
      results.push({type:'vocab',data:v,score:calcScore(v,ql)});
      if(results.length>=30)break; // 最多30个本地结果
    }
  }
  // 搜索语法（如果结果不够）
  if(results.length<10&&typeof GRAMMAR_DATA!=='undefined'){
    try{
      for(var i=0;i<GRAMMAR_DATA.length;i++){
        var g=GRAMMAR_DATA[i];
        if(!g||!g.pattern)continue;
        if(g.pattern.indexOf(ql)>=0||(g.meaning&&g.meaning.indexOf(ql)>=0)||(g.notes&&g.notes.indexOf(ql)>=0)){
          results.push({type:'grammar',data:g,score:0.5});
          if(results.length>=30)break;
        }
      }
    }catch(e){}
  }
  // 按相关性排序
  results.sort(function(a,b){return b.score-a.score});
  return results.slice(0,20);
}

function calcScore(v,ql){
  var s=0;
  if(v.word===ql)s=100;
  else if(v.word.indexOf(ql)===0)s=90;
  else if(v.word.indexOf(ql)>=0)s=70;
  else if(v.reading&&v.reading.indexOf(ql)>=0)s=60;
  else if(v.meaning&&v.meaning.indexOf(ql)>=0)s=50;
  // 短词优先（精确匹配优先于长词的部分匹配）
  if(s>0&&v.word.length<=2)s+=10;
  return s;
}

function renderSearchResults(q,results){
  var el=document.getElementById('searchResults');
  el.innerHTML='';
  if(results.length===0){
    showSearchEmpty('未找到本地词库结果，正在 AI 搜索…');
    return;
  }
  var html='<div style="font-size:11px;color:#666;margin-bottom:4px;padding:0 4px">词库结果：</div>';
  for(var i=0;i<results.length;i++){
    var r=results[i];
    if(r.type==='vocab'){
      var v=r.data;
      var lv=(v.level||'n?').toLowerCase();
      html+='<div class="search-result-item" style="cursor:default">'+
        '<div class="search-result-info" onclick="goToVocab('+(v.id||0)+')" style="cursor:pointer;flex:1;min-width:0">'+
        '<div class="search-result-wordrow">'+
        '<span class="search-result-word">'+escHtml(v.word||'')+'</span>'+
        '<span class="search-result-reading">'+escHtml(v.reading||'')+'</span>'+
        '<span class="search-result-level sl-'+lv+'">'+lv.toUpperCase()+'</span>'+
        '</div>'+
        '<div class="search-result-meaning">'+escHtml(v.meaning||'')+'</div>'+
        '<div class="search-result-tags">'+
        (v.type?'<span class="search-result-tag">'+escHtml(v.type)+'</span>':'')+
        (v.category?'<span class="search-result-tag">'+escHtml(v.category)+'</span>':'')+
        '</div>'+
        '</div>'+
        '<div class="search-result-actions" style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;align-items:center">'+
        '<button onclick="event.stopPropagation();speak(\''+escHtml(v.word)+'\')" style="background:none;border:none;cursor:pointer;font-size:18px;padding:4px;color:#888" title="发音">🔊</button>'+
        '<span class="search-book-btn" data-id="'+(v.id||0)+'" onclick="event.stopPropagation();toggleBook({type:\'vocab\',id:'+(v.id||0)+'});return false" style="cursor:pointer;font-size:18px;opacity:0.4;transition:opacity 0.2s" title="加入生词本">☆</span>'+
        '</div>'+
        '</div>';
    }else if(r.type==='grammar'){
      var g=r.data;
      html+='<div class="search-result-item" onclick="goToGrammar('+(g.id||0)+')">'+
        '<div class="search-result-info">'+
        '<div class="search-result-wordrow">'+
        '<span class="search-result-word">'+escHtml(g.pattern||'')+'</span>'+
        '<span class="search-result-level sl-'+(g.level||'n3')+'">'+((g.level||'n3').toUpperCase())+'</span>'+
        '</div>'+
        '<div class="search-result-meaning">'+escHtml(g.meaning||'')+'</div>'+
        (g.notes?'<div class="search-result-tags"><span class="search-result-tag">'+escHtml(g.notes.substr(0,40))+'</span></div>':'')+
        '</div>'+
        '</div>';
    }
  }
  el.innerHTML=html;
  el.classList.add('visible');
}

function goToVocab(id){
  go('vocab');
  // 跳转到该词的详情弹窗
  setTimeout(function(){
    var v=VOCAB_DATA.find(function(x){return x.id===id});
    if(v)showDetail(v);
  },100);
}

function goToGrammar(id){
  go('grammar');
  setTimeout(function(){
    var g=GRAMMAR_DATA.find(function(x){return x.id===id});
    if(g){showGDetail(g);}
  },100);
}

function escHtml(s){
  if(!s)return'';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// 搜索栏输入事件
document.addEventListener('DOMContentLoaded',function(){
  var inp=document.getElementById('aiSearchInput');
  if(!inp)return;
  var cl=document.getElementById('searchClear');
  var btn=document.getElementById('searchBtn');
  
  inp.addEventListener('input',function(){
    var v=this.value.trim();
    if(v){cl.classList.add('visible')}else{cl.classList.remove('visible')}
  });
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){doSearch()}
  });
  if(btn)btn.addEventListener('click',function(){doSearch()});
  if(cl)cl.addEventListener('click',function(){clearSearch()});
});

// ===== 扫描识图翻译 =====
var _scanImageData = null; // base64 image data
var _scanHistory = [];      // history cache

function triggerUpload(){
  document.getElementById('scanFileInput').click();
}
function triggerCamera(){
  document.getElementById('scanCameraInput').click();
}

function handleScanFile(input){
  if(!input.files||!input.files[0])return;
  var file=input.files[0];
  if(file.size>20*1024*1024){showT('图片太大，请选择 20MB 以下的图片');return}
  var reader=new FileReader();
  reader.onload=function(e){
    loadScanImage(e.target.result);
  };
  reader.readAsDataURL(file);
  input.value='';
}

function loadScanImage(dataUrl){
  _scanImageData=dataUrl;
  document.getElementById('scanEmpty').style.display='none';
  document.getElementById('scanPreview').style.display='block';
  document.getElementById('scanResult').style.display='none';
  document.getElementById('scanLoading').style.display='none';
  document.getElementById('scanImage').src=dataUrl;
}

function clearScanImage(){
  _scanImageData=null;
  document.getElementById('scanEmpty').style.display='block';
  document.getElementById('scanPreview').style.display='none';
  document.getElementById('scanResult').style.display='none';
  document.getElementById('scanLoading').style.display='none';
  document.getElementById('scanDoBtn').disabled=false;
  document.getElementById('scanDoBtn').textContent='🔍 识别并翻译';
}

// 监听粘贴事件：支持用户粘贴截图到扫描页
document.addEventListener('paste',function(e){
  if(document.getElementById('p-scan').style.display==='none')return;
  var items=e.clipboardData&&e.clipboardData.items;
  if(!items)return;
  for(var i=0;i<items.length;i++){
    if(items[i].type.indexOf('image')>=0){
      var blob=items[i].getAsFile();
      if(!blob)continue;
      if(blob.size>20*1024*1024){showT('图片太大，请选择 20MB 以下的图片');return}
      var reader=new FileReader();
      reader.onload=function(ev){loadScanImage(ev.target.result)};
      reader.readAsDataURL(blob);
      break;
    }
  }
});

function compressImage(dataUrl,maxW){
  return new Promise(function(resolve){
    var img=new Image();
    img.onload=function(){
      var w=img.width,h=img.height;
      if(w<=maxW){resolve(dataUrl);return}
      var ratio=maxW/w;
      var c=document.createElement('canvas');
      c.width=maxW;c.height=Math.round(h*ratio);
      var ctx=c.getContext('2d');
      ctx.drawImage(img,0,0,c.width,c.height);
      resolve(c.toDataURL('image/jpeg',0.85));
    };
    img.src=dataUrl;
  });
}

// ===== API 配置 =====
// Cloudflare Worker URL
var _searchWorkerUrl='https://damp-cell-c1f2.happyzhangdy.workers.dev';
var _scanWorkerUrl='https://damp-cell-c1f2.happyzhangdy.workers.dev';

var _searchConfig={
  // OpenRouter（通过 Worker 代理，Key 藏服务端）
  apiUrl:_searchWorkerUrl + '/v1/or/chat/completions',
  model:'deepseek/deepseek-v4-flash',
  apiKey:_searchWorkerUrl ? '' : 'sk-tjhjahjojrwrmfzoqktyugyefrwhdxnovdyivttypdlpuimu'
};

var _scanConfig={
  // 硅基流动（通过 Worker 代理，Key 藏服务端）
  apiUrl:_scanWorkerUrl ? (_scanWorkerUrl + '/v1/chat/completions') : 'https://api.siliconflow.cn/v1/chat/completions',
  model:'Qwen/Qwen3-VL-8B-Instruct',
  apiKey:_scanWorkerUrl ? '' : 'sk-tjhjahjojrwrmfzoqktyugyefrwhdxnovdyivttypdlpuimu'
};

function doScan(){
  if(!_scanImageData){showT('请先选择一张图片');return}
  if(!_scanWorkerUrl && !_scanConfig.apiKey){
    showT('⚠️ 请先在设置中配置 API Key');
    return;
  }
  document.getElementById('scanDoBtn').disabled=true;
  document.getElementById('scanDoBtn').textContent='⏳ 处理中...';
  document.getElementById('scanPreview').style.display='none';
  document.getElementById('scanLoading').style.display='block';
  document.getElementById('scanResult').style.display='none';
  document.getElementById('scanLoadingText').textContent='正在识别图片中的日文...';
  
  compressImage(_scanImageData,1200).then(function(compressed){
    return callOCRandTranslate(compressed);
  }).then(function(result){
    if(!result||!result.jp){
      showT('未识别到日文文字，请换一张图片试试');
      clearScanImage();
      return;
    }
    showScanResult(result.jp,result.cn);
  }).catch(function(err){
    var msg=err.message||'';
    if(msg.indexOf('balance')>=0||msg.indexOf('insufficient')>=0){
      showT('⚠️ 硅基流动账户余额不足，请先充值或领取免费额度');
    }else{
      showT('识别失败：'+msg);
    }
    clearScanImage();
  });
}

function callOCRandTranslate(imageBase64){
  // 用 Qwen3-VL-8B 一步完成 OCR + 翻译（¥0.5/M 输入）
  var prompt='你识别图片中日文并翻译。\n规则：先逐行输出图片中日文原文，再逐行输出中文翻译。\n不要分析语法，不要解释，不要加任何多余内容。\n\n格式：\n【日文原文】\n（第一行原文）\n（第二行原文）\n【中文翻译】\n（第一行译文）\n（第二行译文）';
  return new Promise(function(resolve,reject){
    callAI(_scanConfig.apiUrl,_scanConfig.model,
      [{role:'user',content:[{type:'image_url',image_url:{url:imageBase64}},{type:'text',text:prompt}]}],
      4096).then(function(text){
        // 解析返回格式
        var jp='',cn='';
        var parts=text.split('【');
        for(var i=0;i<parts.length;i++){
          var p=parts[i];
          if(p.indexOf('日文原文】')===0){jp=p.replace('日文原文】','').trim()}
          if(p.indexOf('中文翻译】')===0){cn=p.replace('中文翻译】','').trim()}
        }
        if(!jp&&!cn){
          // 格式不匹配，全部当原文
          jp=text;
        }
        resolve({jp:jp,cn:cn||'(翻译中...)'});
      }).catch(function(err){reject(err)});
  });
}

function callAI(url,model,messages,maxTokens,apiKey){
  if(!apiKey) apiKey=_scanConfig.apiKey;
  return new Promise(function(resolve,reject){
    var xhr=new XMLHttpRequest();
    xhr.open('POST',url);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.setRequestHeader('Authorization','Bearer '+apiKey);
    xhr.onload=function(){
      try{
        var r=JSON.parse(xhr.responseText);
        if(r.choices&&r.choices[0]&&r.choices[0].message){
          resolve(r.choices[0].message.content||'');
        }else if(r.error){
          reject(new Error(r.error.message||'API Error'));
        }else{
          reject(new Error('Unexpected response'));
        }
      }catch(e){reject(new Error('Parse error: '+e.message))}
    };
    xhr.onerror=function(){reject(new Error('Network error'))};
    xhr.send(JSON.stringify({
      model:model,
      messages:messages,
      max_tokens:maxTokens||2048,
      temperature:0.1
    }));
  });
}

function showScanResult(jpText,cnText){
  document.getElementById('scanLoading').style.display='none';
  document.getElementById('scanResult').style.display='block';
  document.getElementById('scanPreview').style.display='none';
  
  document.getElementById('scanJpText').textContent=jpText;
  document.getElementById('scanCnText').textContent=cnText;
  document.getElementById('scanFullJp').textContent=jpText;
  document.getElementById('scanFullCn').textContent=cnText;
  
  // 默认显示对照视图
  switchScanView('parallel',document.querySelector('.scan-result-tab.active'));
  
  // 保存历史
  saveScanHistory(jpText,cnText);
}

function switchScanView(view,btn){
  document.querySelectorAll('.scan-result-tab').forEach(function(t){t.classList.remove('active')});
  if(btn)btn.classList.add('active');
  
  document.getElementById('scanParallel').style.display=view==='parallel'?'grid':'none';
  document.getElementById('scanFullOrig').style.display=view==='orig'?'block':'none';
  document.getElementById('scanFullTrans').style.display=view==='trans'?'block':'none';
}

function copyScanResult(){
  var cn=document.getElementById('scanCnText').textContent;
  if(!cn){showT('没有可复制的内容');return}
  // 使用 textarea 方案兼容
  var ta=document.createElement('textarea');
  ta.value=cn;
  document.body.appendChild(ta);
  ta.select();
  try{document.execCommand('copy');showT('✅ 译文已复制到剪贴板')}catch(e){showT('复制失败，请手动复制')}
  document.body.removeChild(ta);
}

function saveScanHistory(jp,cn){
  _scanHistory.unshift({jp:jp,cn:cn,time:new Date().toLocaleString()});
  if(_scanHistory.length>10)_scanHistory=_scanHistory.slice(0,10);
  localStorage.setItem('scanHist',JSON.stringify(_scanHistory));
  renderScanHistory();
}

function renderScanHistory(){
  var list=document.getElementById('scanHistoryList');
  if(!list)return;
  if(_scanHistory.length===0){
    document.getElementById('scanHistory').style.display='none';
    return;
  }
  document.getElementById('scanHistory').style.display='block';
  var html='';
  for(var i=0;i<_scanHistory.length;i++){
    var h=_scanHistory[i];
    html+='<div class="plan-card" style="padding:10px 14px;margin-bottom:6px">'+
      '<div style="font-size:10px;color:#555;margin-bottom:4px">'+escHtml(h.time)+'</div>'+
      '<div style="font-size:11px;color:#999;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+
      escHtml(h.cn.substr(0,100))+'</div></div>';
  }
  list.innerHTML=html;
}

function loadScanHistory(){
  try{
    var h=localStorage.getItem('scanHist');
    if(h)_scanHistory=JSON.parse(h);
  }catch(e){_scanHistory=[]}
  renderScanHistory();
}

// 粘贴图片支持
document.addEventListener('paste',function(e){
  var items=e.clipboardData&&e.clipboardData.items;
  if(!items)return;
  // 只在扫描页面生效
  var sp=document.getElementById('p-scan');
  if(!sp||!sp.classList.contains('active'))return;
  for(var i=0;i<items.length;i++){
    if(items[i].type.indexOf('image')===0){
      var file=items[i].getAsFile();
      if(!file)continue;
      var reader=new FileReader();
      reader.onload=function(ev){loadScanImage(ev.target.result);showT('✅ 已粘贴截图')};
      reader.readAsDataURL(file);
      break;
    }
  }
});

// 上传区点击触发选图
document.addEventListener('DOMContentLoaded',function(){
  var ua=document.getElementById('scanUploadArea');
  if(ua){ua.addEventListener('click',function(){triggerUpload()})}
});

// =====================
// 防盗取 - 禁止右键/复制
// =====================
(function(){
    // 禁用右键
    document.addEventListener('contextmenu',function(e){
        e.preventDefault();
        return false;
    });

    // 禁用快捷键（F12, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J）
    document.addEventListener('keydown',function(e){
        if(e.key==='F12' || 
           (e.ctrlKey && e.shiftKey && e.key==='I') || 
           (e.ctrlKey && e.shiftKey && e.key==='J') || 
           (e.ctrlKey && e.key==='U')){
            e.preventDefault();
            return false;
        }
    });

    // 禁用拖拽
    document.body.addEventListener('dragstart',function(e){
        e.preventDefault();
        return false;
    });
})();

// Init
upH();upP();renderV();renderG();
