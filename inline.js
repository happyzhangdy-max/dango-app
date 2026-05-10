
const VOCAB=VOCAB_DATA;
// SM-2
function sm2(c,q){let{i=1,r=0,e=2.5}=c;if(q<3){r=0;i=1}else{if(r===0)i=1;else if(r===1)i=6;else i=Math.round(i*e);r++;e=Math.max(1.3,e+0.1-(5-q)*(0.08+(5-q)*0.02))}return{interval:i,repetitions:r,ef:e,nextDate:new Date(Date.now()+i*864e5).toISOString().split("T")[0]}}
function lp(){try{return JSON.parse(localStorage.getItem('jp')||'{}')}catch(e){return{}}}
function sp(p){localStorage.setItem('jp',JSON.stringify(p))}
function due(){const p=lp();const t=new Date().toISOString().split('T')[0];return VOCAB.filter(v=>{const c=p[v.id];return c&&c.nextDate<=t})}
function st(n){if(n>=8)return '★★★★';if(n>=5)return '★★★';if(n>=3)return '★★';return '★'}
function fc(n){if(n>=8)return 'fb-s';if(n>=5)return 'fb-a';if(n>=3)return 'fb-b';return 'fb-c'}
let quizData=[],quizIdx=0,quizRight=0,quizMode='high';
function go(p){closeD();closePlanModal();document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tabs .tab').forEach(x=>x.classList.remove('active'));document.getElementById('p-'+p).classList.add('active');const tabs=['home','vocab','grammar','review','book','quiz','wrong','game'];tabs.forEach((t,i)=>{if(t===p)document.querySelectorAll('.tabs .tab')[i].classList.add('active')});if(p==='home')upH();if(p==='vocab'){renderV();setTimeout(function(){initVocabTracking()},50)}if(p==='grammar')renderG();if(p==='quiz'){document.getElementById('quizStart').style.display='block';document.getElementById('quizArea').style.display='none';document.getElementById('quizResult').style.display='none'};if(p==='review')renderR();if(p==='book')renderBook();if(p==='wrong')renderWrong()}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(mode){quizMode=mode;quizIdx=0;quizRight=0;window._lastPassage='';let src;if(mode==='high')src=QUIZ_DATA_HIGH;else if(mode==='normal')src=QUIZ_DATA_NORMAL;else src=QUIZ_DATA_REAL;quizData=shuffle([...src]).slice(0,mode==='real'?src.length:10);document.getElementById('quizStart').style.display='none';document.getElementById('quizResult').style.display='none';document.getElementById('quizArea').style.display='block';showQuiz()}
function showQuiz(){const q=quizData[quizIdx];document.getElementById('quizProg').textContent=(quizIdx+1)+'/'+quizData.length;document.getElementById('quizBar').style.width=((quizIdx)/quizData.length*100)+'%';const pEl=document.getElementById('quizPassage');if(q.passage&&q.passage!==window._lastPassage){pEl.innerHTML='<div style="background:#1a2a4a;border-left:3px solid #f5a623;border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:12px;font-size:12px;line-height:1.9;white-space:pre-wrap;color:#c8d6e5;max-height:300px;overflow-y:auto"><b style="color:#f5a623;font-size:10px;display:block;margin-bottom:4px">📖 阅读原文</b>'+q.passage.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>';pEl.style.display='block';window._lastPassage=q.passage}else{pEl.style.display='none'};document.getElementById('quizQ').innerHTML='<div style="display:flex;align-items:flex-start;gap:8px">'+q.question+'<button onclick="speakQuizQ()" style="flex-shrink:0;background:none;border:none;font-size:18px;cursor:pointer;opacity:0.7;padding:2px" title="读题">🔊</button></div>';const optDiv=document.getElementById('quizOpts');optDiv.innerHTML='';q.options.forEach((o,i)=>{const b=document.createElement('button');b.className='btn bs';b.style.textAlign='left';b.style.fontSize='13px';b.style.padding='10px 14px';var hasJa=/[\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(o);b.innerHTML='<span style="flex:1">'+(i+1)+'. '+o+'</span>'+(hasJa?'<span onclick="event.stopPropagation();speakQuizOpt('+i+')" style="flex-shrink:0;cursor:pointer;opacity:0.7;margin-left:8px;font-size:15px" title="朗读选项">🔊</span>':'');b.style.display='flex';b.style.alignItems='center';b.onclick=()=>answerQuiz(i);optDiv.appendChild(b)});document.getElementById('quizFeedback').style.display='none';document.getElementById('quizNextBtn').style.display='none'}
function answerQuiz(i){const q=quizData[quizIdx];const fb=document.getElementById('quizFeedback');const isRight=i===q.answer;if(isRight){quizRight++;fb.style.borderLeft='3px solid #4ecca3';fb.innerHTML='<span style="color:#4ecca3;font-weight:700">✅ 正解！</span><br>'+q.explanation}else{addWrong(q);fb.style.borderLeft='3px solid #e94560';fb.innerHTML='<span style="color:#e94560;font-weight:700">❌ 不正解</span> <span style="font-size:10px;color:#888">（已加入错题本）</span><br>正解：'+(q.answer+1)+'. '+q.options[q.answer]+'<br><br>'+q.explanation}fb.style.display='block';document.getElementById('quizNextBtn').style.display='inline-flex';document.querySelectorAll('#quizOpts .btn').forEach(b=>b.disabled=true)}
function nextQuiz(){quizIdx++;if(quizIdx>=quizData.length){showQuizResult()}else{showQuiz()}}
function exitQuiz(){document.getElementById('quizArea').style.display='none';document.getElementById('quizResult').style.display='none';document.getElementById('quizStart').style.display='block'}
function showQuizResult(){document.getElementById('quizArea').style.display='none';document.getElementById('quizResult').style.display='block';const rate=Math.round(quizRight/quizData.length*100);let emo='🎉',tit='優秀！';if(rate<60){emo='😢';tit='要復習'}else if(rate<80){emo='😊';tit='Good！'}document.getElementById('quizEmo').textContent=emo;document.getElementById('quizTitle').textContent=tit;document.getElementById('quizScore').textContent='正解：'+quizRight+'/'+quizData.length+'（'+rate+'%）'}
function upH(){const p=lp();const d=due();document.getElementById('s1').textContent=Object.keys(p).length;document.getElementById('s1').style.color='#4ecca3';document.getElementById('s2').textContent=d.length;document.getElementById('s2').style.color='#f5a623';document.getElementById('dueH').textContent=d.length;const gc=parseInt(localStorage.getItem('gc')||'0');document.getElementById('s3').textContent=gc;upP()}
function renderV(){if(_vocabObserver)_vocabObserver.disconnect();const f=curF;document.querySelectorAll('#p-vocab .st2 .tab').forEach(t=>{t.classList.toggle('active',t.textContent.trim().toLowerCase()===f)});let data=f==='all'?VOCAB:VOCAB.filter(v=>v.level===f);if(curVMark){var vm=getMarks();data=data.filter(function(v){return vm[v.id]===curVMark})}if(curSort==='freq'){data=[...data].sort((a,b)=>b.appear-a.appear);_vocabOrder=null}else if(curSort==='random'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}}else if(curSort==='rand100'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}data=data.slice(0,Math.min(100,data.length))}else if(curSort==='rand200'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}data=data.slice(0,Math.min(200,data.length))}else if(curSort==='rand500'){if(_vocabOrder&&_vocabOrder.length===data.length){data=_vocabOrder.map(id=>data.find(v=>v.id===id))}else{data=[...data].sort(()=>Math.random()-0.5);_vocabOrder=data.map(v=>v.id)}data=data.slice(0,Math.min(500,data.length))}else if(curSort==='category'){var groupField=catMode==='scene'?'category':'type';if(!catSelected){var groups={};data.forEach(function(v){var key=v[groupField]||'未分类';if(!groups[key])groups[key]=[];groups[key].push(v)});var sorted=Object.entries(groups).sort(function(a,b){return b[1].length-a[1].length});var flat=[];flat.push({_catModeTabs:true});flat.push({_catSubTitle:catMode==='scene'?'选择场景分类查看词汇':'选择词性分类查看词汇'});var overviewCards=[];sorted.forEach(function(p){overviewCards.push({type:p[0],count:p[1].length})});flat.push({_overviewCards:overviewCards});data=flat;_vocabOrder=null}else{var filtered=data.filter(function(v){return(v[groupField]||'未分类')===catSelected});if(filtered.length===0){catSelected=null;renderV();return}var flat=[];flat.push({_catBackBtn:true,_backLabel:catSelected});flat.push({_header:true,_cat:catSelected,_count:filtered.length});var levelOrder=['n1','n2','n3','n4','n5'];levelOrder.forEach(function(lv){var levelItems=filtered.filter(function(v){return v.level===lv});if(levelItems.length===0)return;flat.push({_subHeader:true,_subLabel:lv.toUpperCase(),_count:levelItems.length});if(levelItems.length>500){levelItems.slice(0,500).forEach(function(v){flat.push(v)});flat.push({_overflowMsg:true,_count:levelItems.length-500})}else{levelItems.forEach(function(v){flat.push(v)})}});data=flat;_vocabOrder=null}}else if(curSort==='studyCount'){var p=lp();var sc=curStudyCount||'all';data=data.filter(function(v){var cnt=(p[v.id]&&p[v.id].viewCount)||0;if(sc==='all')return true;if(sc==='0')return cnt===0;if(sc==='1')return cnt===1;if(sc==='2')return cnt===2;if(sc==='3')return cnt===3;if(sc==='4')return cnt===4;if(sc==='5-9')return cnt>=5&&cnt<=9;if(sc==='10-20')return cnt>=10&&cnt<=20;if(sc==='20+')return cnt>=21;return true});data=[...data].sort(function(a,b){var ca=(p[a.id]&&p[a.id].viewCount)||0;var cb=(p[b.id]&&p[b.id].viewCount)||0;return cb-ca});_vocabOrder=null;var scLabels=['all','0','1','2','3','4','5-9','10-20','20+'];data=[{_scTabs:true,_scVal:sc,_scLabels:scLabels}].concat(data)}const g=document.getElementById('vocabG');g.innerHTML='';const label=document.getElementById('sortLabel');if(label){if(curSort==='rand100')label.textContent='🎲 随机100词';else if(curSort==='rand200')label.textContent='🎲 随机200词';else if(curSort==='rand500')label.textContent='🎲 随机500词';else if(curSort==='random')label.textContent='🔀 随机排序';else if(curSort==='category')label.textContent='📂 分类排序';else if(curSort==='studyCount')label.textContent='📖 学习次数';else label.textContent='📊 高频降序'}const cnt=document.getElementById('vocabCount');if(cnt){var wc=0;if(curSort==='category'||curSort==='studyCount'){data.forEach(function(x){if(x._header||x._subHeader||x._catModeTabs||x._catSubTitle||x._overviewCards||x._catBackBtn||x._overflowMsg||x._scTabs)return;wc++});cnt.textContent='共 '+wc+' 词'}else cnt.textContent='共 '+data.length+' 词'};data.forEach(v=>{if(v._scTabs){var td=document.createElement('div');td.style.cssText='display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap';v._scLabels.forEach(function(l){var btn=document.createElement('button');btn.className='tab'+(l===v._scVal?' active':'');btn.textContent=l==='all'?'📖 全部':l;btn.onclick=function(){curStudyCount=l;renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)};td.appendChild(btn)});g.appendChild(td);return}if(v._catModeTabs){let td=document.createElement('div');td.style.cssText='display:flex;gap:8px;margin-bottom:12px';var sb=document.createElement('button');sb.className='btn '+(catMode==='scene'?'bp':'bs');sb.textContent='🏷️ 场景';sb.onclick=function(){setCatMode('scene')};td.appendChild(sb);var tb=document.createElement('button');tb.className='btn '+(catMode==='type'?'bp':'bs');tb.textContent='📚 词性';tb.onclick=function(){setCatMode('type')};td.appendChild(tb);g.appendChild(td);return}if(v._catSubTitle){let st=document.createElement('div');st.style.cssText='color:#888;font-size:12px;margin-bottom:10px';st.textContent=v._catSubTitle;g.appendChild(st);return}if(v._overviewCards){v._overviewCards.forEach(function(c){var ce=document.createElement('div');ce.className='vc-h';ce.style.cursor='pointer';ce.textContent='📂 '+c.type+' ('+c.count+'词)';ce.onclick=function(){catSelected=c.type;renderV();if(typeof initVocabTracking==='function')initVocabTracking(false)};g.appendChild(ce)});return}if(v._catBackBtn){var bb=document.createElement('div');bb.style.cssText='margin-bottom:10px';bb.innerHTML='<button class="btn bs" onclick="catSelected=null;renderV();if(typeof initVocabTracking===\'function\')initVocabTracking(false)">🔙 返回 ('+v._backLabel+')</button>';g.appendChild(bb);return}if(v._header){var h=document.createElement('div');h.className='vc-h';h.textContent='📂 '+v._cat+' ('+v._count+'词)';g.appendChild(h);return}if(v._subHeader){var sh=document.createElement('div');sh.className='vc-h';sh.style.cssText='font-size:13px;padding:6px 14px;margin-top:4px;background:rgba(168,85,247,0.08);border-color:rgba(168,85,247,0.2)';sh.textContent='📖 '+v._subLabel+' ('+v._count+'词)';g.appendChild(sh);return}if(v._overflowMsg){var om=document.createElement('div');om.style.cssText='text-align:center;color:#888;font-size:12px;padding:8px';om.textContent='... 还有 '+v._count+' 个词汇未显示';g.appendChild(om);return}const d=document.createElement('div');d.className='vc';d.setAttribute('data-id',v.id);const fbc=fc(v.appear);const ss=st(v.appear);const lv=v.level==='n3'?'l3':v.level==='n2'?'l2':'l1';d.innerHTML='<span class="vl '+lv+'">'+(v.level||'n3').toUpperCase()+'</span><span class="vb-freq '+fbc+'">'+ss+' '+v.appear+'回</span><span class="vw">'+v.word+'</span><span class="vr">'+v.reading+'</span><span class="vm">'+v.meaning+'</span><span class="va-stack"><span class="v-info" onclick="event.stopPropagation();openD(findVocabById('+v.id+'))" title="详情">🔍</span></span><span class="vf"><span class="vbf" data-id="'+v.id+'" onclick="event.stopPropagation();toggleBook('+v.id+')">'+(getBook().indexOf(v.id)>=0?'⭐':'☆')+'</span><span class="vm-btn-group"><span class="vm-btn vm-btn-red" data-id="'+v.id+'" data-color="red" onclick="event.stopPropagation();toggleMark('+v.id+',\'red\');return false" title="不认识">🔴</span><span class="vm-btn vm-btn-yellow" data-id="'+v.id+'" data-color="yellow" onclick="event.stopPropagation();toggleMark('+v.id+',\'yellow\');return false" title="不熟">🟡</span><span class="vm-btn vm-btn-green" data-id="'+v.id+'" data-color="green" onclick="event.stopPropagation();toggleMark('+v.id+',\'green\');return false" title="熟悉">🟢</span></span></span>';if(kanjiMode===1)d.classList.add('vh1');else if(kanjiMode===2)d.classList.add('vh2');(function(v2,el){var vs=el.querySelector('.va-stack');var wb=document.createElement('button');wb.className='vb vb-w';wb.textContent='🔊';wb.title='单词发音';wb.onclick=function(e){e.stopPropagation();speak(v2.word)};vs.insertBefore(wb,vs.firstChild);if(v2.ex_jp){var eb=document.createElement('button');eb.className='vb vb-e';eb.textContent='🔊';eb.title='例句发音';eb.onclick=function(e){e.stopPropagation();speak(v2.ex_jp)};vs.insertBefore(eb,wb.nextSibling||null)}})(v,d);
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
function apToggleBook(){var v=_apQueue[_apIdx-(_apPaused?0:1)];if(!v)return;toggleBook(v.id);apSyncMarks(v)}
function apToggleMark(c){var v=_apQueue[_apIdx-(_apPaused?0:1)];if(!v)return;toggleMark(v.id,c);apSyncMarks(v)}
function apSyncMarks(v){if(!v)return;var b=getBook().indexOf(v.id)>=0;document.getElementById('apBmk').textContent=b?'⭐':'☆';var m=getMarks()[v.id];document.querySelectorAll('#apScreen .ap-marks .vm-btn').forEach(function(x){var c=x.getAttribute('data-color');var a=m===c;x.classList.remove('vm-btn-red','vm-btn-yellow','vm-btn-green','vm-btn-active');if(a){x.classList.add('vm-btn-'+c,'vm-btn-active');x.style.borderColor='';x.style.background='';x.style.opacity=''}else{x.style.borderColor='transparent';x.style.background='transparent';x.style.opacity='0.4'}})}
let _reviewMode='sm2';
function getViewCountWords(){const p=lp();const entries=Object.entries(p).filter(([id,s])=>s.viewCount&&s.viewCount>0).sort((a,b)=>(b[1].viewCount||0)-(a[1].viewCount||0));return entries.map(([id])=>VOCAB.find(v=>v.id==id)).filter(v=>v)}
function setReviewMode(m){_reviewMode=m;renderR()}
function _injWW(){if(document.getElementById('ww-s'))return;var s=document.createElement('style');s.id='ww-s';s.textContent='.ww{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:4px 0}.ww-c{background:linear-gradient(135deg,#1a1a3e,#16213e);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 10px 10px;cursor:pointer;transition:all .25s;position:relative}.ww-c:hover{border-color:rgba(168,85,247,0.4);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.3)}.ww-c .ww-w{font-size:17px;font-weight:700;color:#eaeaea;line-height:1.3}.ww-c .ww-r{font-size:11px;color:#888;margin-top:2px;line-height:1.3}.ww-c .ww-b{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:4px}.ww-c .ww-l{font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(255,255,255,0.08);color:#aaa;white-space:nowrap}.ww-c .ww-l.l2{background:rgba(233,69,96,0.2);color:#e94560}.ww-c .ww-l.l3{background:rgba(78,204,163,0.2);color:#4ecca3}.ww-c .ww-x{display:flex;gap:3px;font-size:10px;align-items:center;flex-wrap:nowrap}.ww-c .ww-s{border:none;background:rgba(255,255,255,0.06);border-radius:50%;cursor:pointer;font-size:10px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;transition:background .2s;position:absolute;top:6px;right:6px}.ww-c .ww-s:hover{background:rgba(168,85,247,0.3)}.ww-c .ww-bm{font-size:12px;cursor:pointer;opacity:.5;transition:opacity .2s;user-select:none}.ww-c .ww-bm.act{opacity:1}.ww-c.mr{border-color:rgba(233,69,96,0.4);background:linear-gradient(135deg,#1a1a3e,#2a1520)}.ww-c.my{border-color:rgba(245,166,35,0.4);background:linear-gradient(135deg,#1a1a3e,#2a2510)}.ww-c.mg{border-color:rgba(78,204,163,0.4);background:linear-gradient(135deg,#1a1a3e,#102a20)}';document.head.appendChild(s)}
function renderR(){_injWW();var c=document.getElementById('reviewC');var data,emptyText,emptyEmoji,countLabel,startAction;if(_reviewMode==='sm2'){data=due();emptyText='今日复习全部完成！';emptyEmoji='🌸';countLabel='待复习';startAction="startReview('sm2')"}else{data=getViewCountWords();emptyText='还没有学习过任何词汇';emptyEmoji='📖';countLabel='已学习词汇';startAction="startReview('viewcount')"}c.innerHTML='<div class="review-tabs"><button class="review-tab'+(_reviewMode==='sm2'?' active':'')+'" onclick="setReviewMode(\'sm2\')">🔄 遗忘曲线</button><button class="review-tab'+(_reviewMode==='viewcount'?' active':'')+'" onclick="setReviewMode(\'viewcount\')">📖 学习次数</button></div>';if(data.length===0){c.innerHTML+='<div class="re"><div class="rem">'+emptyEmoji+'</div><div style="font-size:18px;font-weight:700;margin-bottom:10px">'+emptyText+'</div><div style="font-size:13px;line-height:1.7">坚持学习，继续保持！ 💪</div></div>';return}c.innerHTML+='<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between"><span style="color:#888;font-size:13px">共 '+data.length+' 个'+countLabel+'</span><button class="btn bp" style="padding:5px 12px;font-size:11px" onclick="'+startAction+'">开始复习</button></div>';var wall=document.createElement('div');wall.className='ww';data.forEach(function(v){var cd=document.createElement('div');cd.className='ww-c';cd.setAttribute('data-id',v.id);var mc=getMarks()[v.id];if(mc)cd.classList.add('m'+mc[0]);var lc=v.level==='n3'?'l3':v.level==='n2'?'l2':'l1';var ib=getBook().indexOf(v.id)>=0;cd.innerHTML='<div class="ww-w">'+v.word+'</div><div class="ww-r">'+v.reading+'</div><div class="ww-b"><span class="ww-l '+lc+'">'+(v.level||'N3').toUpperCase()+'</span><div class="ww-x"><span class="vm-btn vm-btn-red" data-id="'+v.id+'" data-color="red" onclick="event.stopPropagation();toggleMark('+v.id+',\'red\')" title="不认识">🔴</span><span class="vm-btn vm-btn-yellow" data-id="'+v.id+'" data-color="yellow" onclick="event.stopPropagation();toggleMark('+v.id+',\'yellow\')" title="不熟">🟡</span><span class="vm-btn vm-btn-green" data-id="'+v.id+'" data-color="green" onclick="event.stopPropagation();toggleMark('+v.id+',\'green\')" title="熟悉">🟢</span><span class="ww-bm'+(ib?' act':'')+'" data-id="'+v.id+'" onclick="event.stopPropagation();toggleBook('+v.id+')">'+(ib?'⭐':'☆')+'</span></div></div>';var sb=document.createElement('button');sb.className='ww-s';sb.textContent='🔊';sb.onclick=function(e){e.stopPropagation();speak(v.word)};cd.appendChild(sb);cd.onclick=function(){openD(findVocabById(v.id))};// 初始状态：标记按钮高亮
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
function speak(text){
    if(!text||!('speechSynthesis' in window))return;
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.lang='ja-JP';u.rate=0.9;
    // 每次重新找日语 voice（Chrome 异步加载 voices）
    var vs=speechSynthesis.getVoices();
    if(!_jaVoice){for(var i=0;i<vs.length;i++){if(vs[i].lang&&vs[i].lang.indexOf('ja')===0){_jaVoice=vs[i];break}}}
    if(_jaVoice)u.voice=_jaVoice;
    // Chrome bug: cancel() 后必须延迟 speak()，否则被吞
    setTimeout(function(){speechSynthesis.speak(u)},80);
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

function getBook(){ try { return JSON.parse(localStorage.getItem(BOOK_KEY) || '[]'); } catch(e){ return []; } }
function toggleBook(id){
    var book = getBook();
    var idx = book.indexOf(id);
    if (idx >= 0) { book.splice(idx,1); showT('已从生词本移除'); }
    else { book.push(id); showT('已加入生词本 ✅'); }
    localStorage.setItem(BOOK_KEY, JSON.stringify(book));
    updateBookBtn(id);
    // 同步更新所有卡片上的星星
    var inBook = book.indexOf(id) >= 0;
    document.querySelectorAll('.vbf[data-id="'+id+'"],.ww-bm[data-id="'+id+'"]').forEach(function(el){ el.textContent = inBook ? '⭐' : '☆'; el.classList.toggle('act', inBook); });
}
function updateBookBtn(id){
    var book = getBook();
    var inBook = book.indexOf(id) >= 0;
    var btn = document.getElementById('bookBtn');
    if (!btn) return;
    btn.textContent = inBook ? '📕 移出生词本' : '📗 加入生词本';
    btn.className = 'btn ' + (inBook ? 'br' : 'bg');
}
function renderBook(){
    var book = getBook();
    var c = document.getElementById('bookC');
    var cnt = document.getElementById('bookCount');
    if (cnt) cnt.textContent = '共 '+book.length+' 个生词';
    if (!c) return;
    if (book.length === 0){
        c.innerHTML = '<div style="text-align:center;color:#666;padding:40px 0;font-size:14px">生词本为空<br>点击词汇卡片侧栏的「加入生词本」添加</div>';
        return;
    }
    c.innerHTML = '';
    book.forEach(function(id){
        var v = VOCAB.find(function(x){ return x.id === id; });
        if (!v) return;
        var d = document.createElement('div');
        d.className = 'vc';
        d.innerHTML = '<div class="vt"><span class="vl '+(v.level==='n3'?'l3':'l2')+'">'+(v.level||'N3').toUpperCase()+'</span></div>'
            + '<div class="vw">'+v.word+'</div><div class="vr">'+v.reading+'</div><div class="vm">'+v.meaning+'</div>';
        d.onclick = function(){ openD(v); };
        c.appendChild(d);
    });
}
function clearBook(){
    if (!confirm('确定清空生词本？')) return;
    localStorage.removeItem(BOOK_KEY);
    renderBook();
    showT('生词本已清空');
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
function apShowCard(){if(_apStop||_apIdx>=_apQueue.length){apDone();return}if(_apPaused){_apTimer=setTimeout(apShowCard,200);return}var v=_apQueue[_apIdx];var el=document.getElementById('apScreen');el.querySelector('.ap-word').textContent=v.word;el.querySelector('.ap-read').textContent=v.reading;el.querySelector('.ap-mean').textContent=v.meaning;var ex=el.querySelector('.ap-exjp');var exc=el.querySelector('.ap-excn');if(_apBoth&&v.ex_jp){ex.textContent=v.ex_jp;ex.style.display='block';exc.textContent=v.ex_cn||'';exc.style.display=v.ex_cn?'block':'none'}else{ex.style.display='none';exc.style.display='none'}var pct=Math.round((_apIdx+1)/_apQueue.length*100);el.querySelector('.ap-progress-bar').style.width=pct+'%';el.querySelector('.ap-counter').textContent=(_apIdx+1)+'/'+_apQueue.length;apSyncMarks(v);speak(v.word);var totalSpeechTime=1500;if(_apBoth&&v.ex_jp){(function(exJp){setTimeout(function(){if(!exJp||!('speechSynthesis' in window))return;var u=new SpeechSynthesisUtterance(exJp);u.lang='ja-JP';u.rate=0.9;var vs=speechSynthesis.getVoices();if(!_jaVoice){for(var i=0;i<vs.length;i++){if(vs[i].lang&&vs[i].lang.indexOf('ja')===0){_jaVoice=vs[i];break}}}if(_jaVoice)u.voice=_jaVoice;setTimeout(function(){speechSynthesis.speak(u)},80)},300)})(v.ex_jp);totalSpeechTime=4500}_apIdx++;clearTimeout(_apTimer);_apTimer=setTimeout(apShowCard,totalSpeechTime+_apInterval)}
function apTogglePause(){_apPaused=!_apPaused;var btn=document.querySelector('.ap-controls .btn:first-child');if(btn)btn.textContent=_apPaused?'▶ 继续':'⏸ 暂停';if(!_apPaused&&_apTimer===null)_apTimer=setTimeout(apShowCard,200)}
function apStop(){_apStop=true;clearTimeout(_apTimer);_apTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('apScreen').classList.remove('show');go('vocab')}
function apDone(){clearTimeout(_apTimer);_apTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('apScreen').classList.remove('show');showT('🎉 自动播放完成！共 '+_apQueue.length+' 个词');go('vocab')}
function apPrev(){if(!_apQueue||_apQueue.length===0)return;speechSynthesis.cancel();clearTimeout(_apTimer);_apTimer=null;var cur=_apIdx-(_apPaused?0:1);if(cur<=0)return;_apIdx=cur-1;_apPaused=false;apShowCard()}
function apNext(){if(!_apQueue||_apQueue.length===0)return;speechSynthesis.cancel();clearTimeout(_apTimer);_apTimer=null;var cur=_apIdx-(_apPaused?0:1);if(cur>=_apQueue.length-1)return;_apIdx=cur+1;_apPaused=false;apShowCard()}

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
    d.innerHTML='<div class="plan-level">'+ls+' · 每日 '+plan.daily+' 词</div>'
      +'<div class="plan-meta">共 '+total+' 词 · '+plan.days+' 天 · 已完成 '+plan.completedDays+' 天</div>'
      +'<div class="plan-bar"><div class="plan-fill" style="width:'+pct+'%"></div></div>'
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
  go('vocab');
  setTimeout(function(){curF=plans[idx].levels[0];renderV();setTimeout(function(){startStudy(plans[idx].levels[0])},100)},100)}
function resumeLastSession(){
  var session=null;
  try{session=JSON.parse(localStorage.getItem('jp_session'))}catch(e){}
  if(!session){showT('没有保存的学习进度');return}
  go('vocab');
  setTimeout(function(){curF=session.filter;renderV();setTimeout(function(){startStudy(session.filter)},100)},100)}

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
function gApShowCard(){if(_gApStop||_gApIdx>=_gApQueue.length){gApDone();return}if(_gApPaused){_gApTimer=setTimeout(gApShowCard,200);return}var gr=_gApQueue[_gApIdx];var el=document.getElementById('gApScreen');el.querySelector('.ap-word').textContent=gr.pattern;el.querySelector('.ap-read').textContent=gr.ex_read||'';el.querySelector('.ap-mean').textContent=gr.meaning;var ex=el.querySelector('.ap-exjp');var exc=el.querySelector('.ap-excn');if(_gApBoth&&gr.ex_jp){ex.textContent=gr.ex_jp;ex.style.display='block';exc.textContent=gr.ex_cn||'';exc.style.display=gr.ex_cn?'block':'none'}else{ex.style.display='none';exc.style.display='none'}var pct=Math.round((_gApIdx+1)/_gApQueue.length*100);el.querySelector('.ap-progress-bar').style.width=pct+'%';el.querySelector('.ap-counter').textContent=(_gApIdx+1)+'/'+_gApQueue.length;gApSyncMarks(gr);speak(gr.ex_jp||gr.pattern);var totalSpeechTime=1500;if(_gApBoth&&gr.ex_jp){(function(exJp){setTimeout(function(){if(!exJp||!('speechSynthesis' in window))return;var u=new SpeechSynthesisUtterance(exJp);u.lang='ja-JP';u.rate=0.9;var vs=speechSynthesis.getVoices();if(!_jaVoice){for(var i=0;i<vs.length;i++){if(vs[i].lang&&vs[i].lang.indexOf('ja')===0){_jaVoice=vs[i];break}}}if(_jaVoice)u.voice=_jaVoice;setTimeout(function(){speechSynthesis.speak(u)},80)},300)})(gr.ex_jp);totalSpeechTime=4500}_gApIdx++;clearTimeout(_gApTimer);_gApTimer=setTimeout(gApShowCard,totalSpeechTime+_gApInterval)}
function gApTogglePause(){_gApPaused=!_gApPaused;var btn=document.querySelector('#gApScreen .ap-controls .btn:first-child');if(btn)btn.textContent=_gApPaused?'▶ 继续':'⏸ 暂停';if(!_gApPaused&&_gApTimer===null)_gApTimer=setTimeout(gApShowCard,200)}
function gApStop(){_gApStop=true;clearTimeout(_gApTimer);_gApTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('gApScreen').classList.remove('show')}
function gApDone(){clearTimeout(_gApTimer);_gApTimer=null;document.onmousemove=null;document.onmouseup=null;document.ontouchmove=null;document.ontouchend=null;document.getElementById('gApScreen').classList.remove('show');showT('🎉 语法自动播放完成！共 '+_gApQueue.length+' 条');go('grammar')}
function gApPrev(){if(!_gApQueue||_gApQueue.length===0)return;speechSynthesis.cancel();clearTimeout(_gApTimer);_gApTimer=null;var cur=_gApIdx-(_gApPaused?0:1);if(cur<=0)return;_gApIdx=cur-1;_gApPaused=false;gApShowCard()}
function gApNext(){if(!_gApQueue||_gApQueue.length===0)return;speechSynthesis.cancel();clearTimeout(_gApTimer);_gApTimer=null;var cur=_gApIdx-(_gApPaused?0:1);if(cur>=_gApQueue.length-1)return;_gApIdx=cur+1;_gApPaused=false;gApShowCard()}
function gApToggleBook(){var gr=_gApQueue[_gApIdx-(_gApPaused?0:1)];if(!gr)return;toggleGBook(gr.id);gApSyncMarks(gr)}
function gApToggleMark(c){var gr=_gApQueue[_gApIdx-(_gApPaused?0:1)];if(!gr)return;toggleGMark(gr.id,c);gApSyncMarks(gr)}
function gApSyncMarks(gr){if(!gr)return;var b=(JSON.parse(localStorage.getItem('gb')||'[]')||[]).indexOf(gr.id)>=0;document.getElementById('gApBmk').textContent=b?'⭐':'☆';var m=JSON.parse(localStorage.getItem('gm')||'{}')[gr.id];document.querySelectorAll('#gApScreen .ap-marks .vm-btn').forEach(function(x){var c=x.getAttribute('data-color');var a=m===c;x.classList.remove('vm-btn-red','vm-btn-yellow','vm-btn-green','vm-btn-active');if(a){x.classList.add('vm-btn-'+c,'vm-btn-active');x.style.borderColor='';x.style.background='';x.style.opacity=''}else{x.style.borderColor='transparent';x.style.background='transparent';x.style.opacity='0.4'}})}

// Init
upH();renderV();renderG();
