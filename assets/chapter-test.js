/* DAR ARABIC — тест по главам учебника.
   Вопросы берутся из JSON (data-src) без изменений. Ответ сравнивается
   по индексу выбранного варианта / точному совпадению строки; огласовки
   не нормализуются. */
(function(){
  var root = document.getElementById('ct'); if (!root) return;
  var SRC = root.getAttribute('data-src'), TID = root.getAttribute('data-id') || 'test';
  var TITLE = root.getAttribute('data-title') || 'Тест';
  var KEY = 'dar_ct_' + TID, MAX_ATT = 1, LIMIT = 40 * 60, PASS = 70;
  var ARC = '؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿';
  var reAr = new RegExp('[' + ARC + ']'), reLat = /[A-Za-zА-Яа-яЁё]/;
  var reRun = new RegExp('[_' + ARC + ']+(?:[\\s_+=]+[_' + ARC + ']+)*', 'g');
  var LET = ['А','Б','В','Г','Д','Е'];

  var data = null, SECS = [], Q = [], ans = [], cur = 0, phase = 'intro', started = 0, timer = null, name = '', last = null;

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function isAr(s){ s = String(s); return reAr.test(s) && !reLat.test(s); }
  function arAttr(s){ return isAr(s) ? ' dir="rtl" lang="ar"' : ''; }
  // Текст с изолированными арабскими фрагментами (для смешанных строк)
  function txt(s){
    s = String(s);
    if (!reAr.test(s) || isAr(s)) return esc(s);
    var out = '', pos = 0;
    s.replace(reRun, function(m, off){
      out += esc(s.slice(pos, off));
      out += reAr.test(m) ? '<bdi class="ct-arin" lang="ar" dir="rtl">' + esc(m) + '</bdi>' : esc(m);
      pos = off + m.length; return m;
    });
    return out + esc(s.slice(pos));
  }
  function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function range(n){ var r = []; for (var i = 0; i < n; i++) r.push(i); return r; }
  function fmt(sec){ sec = Math.max(0, sec); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function plural(n, a, b, c){ var m = n % 100, k = n % 10; return (m > 10 && m < 20) ? c : k === 1 ? a : (k > 1 && k < 5) ? b : c; }
  function num(x){ return Math.round(x * 10) / 10; }
  function load(){ try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.attempts) return s; } catch(e){} return { name: '', attempts: [] }; }
  function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
  function bestOf(st){ var b = null; st.attempts.forEach(function(a){ if (!b || a.pct > b.pct) b = a; }); return b; }
  function grade(p){ return p >= 90 ? 'Отлично' : (p >= PASS ? 'Хорошо' : 'Нужно повторить'); }
  function totalPoints(){ var t = 0; data.questions.forEach(function(q){ t += q.points; }); return t; }

  function prepare(){
    var by = {}; SECS = [];
    data.questions.forEach(function(q){ if (!by[q.section]) { by[q.section] = []; SECS.push(q.section); } by[q.section].push(q); });
    Q = [];
    SECS.forEach(function(s){
      shuffle(by[s]).forEach(function(q){
        var it = { q: q };
        if (q.type === 'single_choice') it.ord = shuffle(range(q.options.length));
        if (q.type === 'matching') it.rord = shuffle(range(q.pairs.length));
        Q.push(it);
      });
    });
    ans = Q.map(function(it){ return it.q.type === 'matching' ? it.q.pairs.map(function(){ return -1; }) : null; });
  }
  function isAnswered(i){
    var a = ans[i];
    if (Q[i].q.type === 'matching') { for (var k = 0; k < a.length; k++) if (a[k] < 0) return false; return true; }
    return a !== null;
  }
  function answeredCount(){ var n = 0; for (var i = 0; i < Q.length; i++) if (isAnswered(i)) n++; return n; }
  function scoreOf(i){
    var q = Q[i].q, a = ans[i];
    if (q.type === 'single_choice') return (a !== null && q.options[a] === q.answer) ? q.points : 0;
    if (q.type === 'matching') { var per = q.points / q.pairs.length, s = 0; for (var k = 0; k < q.pairs.length; k++) if (a[k] === k) s += per; return s; }
    return 0;
  }

  /* ---------------- screens ---------------- */
  function render(focus){
    var h = phase === 'intro' ? intro() : phase === 'q' ? question() : phase === 'sum' ? summary() : result();
    root.innerHTML = h;
    if (phase === 'q') tick();
    var f = root.querySelector('[data-focus]');
    if (focus !== false && f) { f.focus({ preventScroll: true }); }
    var top = root.getBoundingClientRect().top + window.pageYOffset - 96;
    if (focus !== false && Math.abs(window.pageYOffset - top) > 40) window.scrollTo(0, top);
  }

  function intro(){
    var st = load(), n = st.attempts.length, best = bestOf(st), tp = totalPoints();
    var h = '<div class="ct-card ct-intro">';
    h += '<div class="ct-facts"><div><b>' + data.questions.length + '</b><span>' + plural(data.questions.length, 'вопрос', 'вопроса', 'вопросов') + '</span></div><div><b>' + tp + '</b><span>' + plural(tp, 'балл', 'балла', 'баллов') + '</span></div><div><b>40</b><span>минут</span></div><div><b>' + PASS + ' %</b><span>проходной балл</span></div></div>';
    h += '<h2 class="ct-h" tabindex="-1" data-focus>Перед началом</h2>';
    h += '<ul class="ticks"><li>Один вопрос на экране, можно возвращаться назад.</li><li>Порядок вопросов и вариантов перемешивается при каждой попытке.</li><li>В сопоставлении балл даётся за каждую верную пару.</li><li>Рекомендуемое время — 40 минут, таймер завершит тест автоматически.</li><li><b>Тест проходится один раз.</b> Правильные ответы и разбор ошибок появятся после завершения.</li></ul>';
    h += '<div class="ct-blocks">' + SECS.map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('') + '</div>';
    if (best) h += '<div class="ct-best">Ваш результат: <b>' + best.pct + ' %</b> (' + best.score + ' из ' + best.max + ') — ' + grade(best.pct) + '</div>';
    if (n >= MAX_ATT) {
      h += '<div class="ct-note">Вы уже прошли этот тест. Если нужна ещё попытка, напишите преподавателю.</div>';
    } else {
      h += '<form class="ct-start" id="ctStart" novalidate><label for="ctName">Имя и группа</label><input id="ctName" maxlength="80" autocomplete="name" placeholder="Например: Ахмад, группа «Этап 1»" value="' + esc(st.name || '') + '"><p class="ct-err" id="ctErr" role="alert"></p>';
      h += '<button class="btn btn-gold" type="submit">Начать тест</button></form>';
    }
    return h + '</div>';
  }

  function reading(t){
    var lines = String(t).split('\n').map(function(l){
      var i = l.indexOf(':');
      return i > 0 ? '<p><b>' + esc(l.slice(0, i + 1)) + '</b>' + esc(l.slice(i + 1)) + '</p>' : '<p>' + esc(l) + '</p>';
    }).join('');
    return '<details class="ct-read" open><summary>Текст для чтения — к вопросам блока «Чтение»</summary><div class="ct-readtx" dir="rtl" lang="ar">' + lines + '</div></details>';
  }

  function question(){
    var it = Q[cur], q = it.q, a = ans[cur], h = '<div class="ct-card ct-qcard">';
    h += '<div class="ct-top"><span class="ct-sec">' + esc(q.section) + '</span><span class="ct-count">' + (cur + 1) + ' / ' + Q.length + '</span><span class="ct-timer" id="ctTimer" aria-label="Осталось времени"></span></div>';
    h += '<div class="ct-bar" aria-hidden="true"><i style="width:' + ((cur + 1) / Q.length * 100).toFixed(1) + '%"></i></div>';
    if (q.reading_text) h += reading(q.reading_text);
    h += '<h2 class="ct-q" id="ctQ" tabindex="-1" data-focus' + arAttr(q.question) + '>' + txt(q.question) + '</h2>';
    if (q.arabic) h += '<div class="ct-word" dir="rtl" lang="ar">' + esc(q.arabic) + '</div>';
    if (q.type === 'single_choice') {
      h += '<div class="ct-opts" role="radiogroup" aria-labelledby="ctQ">';
      it.ord.forEach(function(oi, k){
        var o = q.options[oi], ar = isAr(o);
        h += '<button type="button" role="radio" class="ct-opt' + (ar ? ' is-ar' : '') + '" aria-checked="' + (a === oi) + '" data-o="' + oi + '"><span class="ct-let" aria-hidden="true">' + LET[k] + '</span><span class="ct-ot"' + arAttr(o) + '>' + txt(o) + '</span></button>';
      });
      h += '</div>';
    } else if (q.type === 'matching') {
      var rAr = q.pairs.every(function(p){ return isAr(p.right); });
      h += '<p class="ct-hint">Для каждого слова слева выберите пару. Балл — за каждую верную пару.</p><div class="ct-match">';
      q.pairs.forEach(function(p, li){
        h += '<div class="ct-mrow"><div class="ct-ml' + (isAr(p.left) ? ' is-ar' : '') + '"' + arAttr(p.left) + '>' + txt(p.left) + '</div><span class="ct-ma" aria-hidden="true">→</span>';
        h += '<select class="ct-ms' + (rAr ? ' is-ar' : '') + '" data-l="' + li + '"' + (rAr ? ' dir="rtl" lang="ar"' : '') + ' aria-label="Пара для: ' + esc(p.left) + '"><option value="-1">Выберите…</option>';
        it.rord.forEach(function(ri){ h += '<option value="' + ri + '"' + (a[li] === ri ? ' selected' : '') + '>' + esc(q.pairs[ri].right) + '</option>'; });
        h += '</select></div>';
      });
      h += '</div>';
    }
    h += '<div class="ct-nav"><button type="button" class="btn btn-dark" id="ctPrev"' + (cur === 0 ? ' disabled' : '') + '>← Назад</button><button type="button" class="ct-link" id="ctAll">Все вопросы · ' + answeredCount() + '/' + Q.length + '</button><button type="button" class="btn btn-gold" id="ctNext">' + (cur === Q.length - 1 ? 'К завершению →' : 'Далее →') + '</button></div>';
    return h + '</div>';
  }

  function summary(){
    var n = answeredCount(), h = '<div class="ct-card ct-sum"><div class="ct-top"><span class="ct-sec">Проверка перед отправкой</span><span class="ct-timer" id="ctTimer"></span></div>';
    h += '<h2 class="ct-h" tabindex="-1" data-focus>Вы ответили на ' + n + ' из ' + Q.length + '</h2>';
    h += '<p class="ct-muted">Нажмите на номер, чтобы перейти к вопросу. Зелёные — с ответом, пустые — без ответа.</p><div class="ct-grid">';
    Q.forEach(function(_, i){ h += '<button type="button" class="' + (isAnswered(i) ? 'ok' : '') + '" data-j="' + i + '" aria-label="Вопрос ' + (i + 1) + (isAnswered(i) ? ', есть ответ' : ', без ответа') + '">' + (i + 1) + '</button>'; });
    h += '</div>';
    if (n < Q.length) h += '<div class="ct-note">Без ответа: ' + (Q.length - n) + '. Неотвеченные вопросы засчитываются как 0 баллов.</div>';
    h += '<div class="ct-nav"><button type="button" class="btn btn-dark" id="ctBack">← К вопросам</button><span></span><button type="button" class="btn btn-gold" id="ctFinish">Завершить тест</button></div>';
    return h + '</div>';
  }

  function compute(){
    var tot = 0, max = 0, sec = {};
    SECS.forEach(function(s){ sec[s] = { s: 0, m: 0 }; });
    Q.forEach(function(it, i){ var s = scoreOf(i); tot += s; max += it.q.points; sec[it.q.section].s += s; sec[it.q.section].m += it.q.points; });
    var pct = Math.round(tot / max * 100);
    return { score: num(tot), max: max, pct: pct, sec: sec, used: Math.min(LIMIT, Math.round((Date.now() - started) / 1000)) };
  }
  function report(r){
    var d = new Date(), st = load();
    var lines = ['DAR ARABIC — ' + TITLE, 'Студент: ' + name,
      'Дата: ' + d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      'Результат: ' + r.score + ' из ' + r.max + ' (' + r.pct + ' %) — ' + grade(r.pct) + (r.pct >= PASS ? ', зачёт' : ', не зачтено'),
      'По блокам: ' + SECS.map(function(s){ return s + ' ' + Math.round(r.sec[s].s / r.sec[s].m * 100) + ' %'; }).join('; '),
      'Время: ' + fmt(r.used) + (r.timeout ? ' (время вышло)' : '')];
    return lines.join('\n');
  }

  function result(){
    var r = last, ok = r.pct >= PASS, st = load(), n = st.attempts.length, best = bestOf(st);
    var h = '<div class="ct-card ct-res">';
    h += '<div class="ct-score"><div class="ct-ring ' + (ok ? 'pass' : 'fail') + '" style="--p:' + r.pct + '"><b>' + r.pct + '<small> %</small></b></div><div>';
    h += '<span class="ct-badge ' + (ok ? 'pass' : 'fail') + '">' + (ok ? 'Тест сдан' : 'Тест не сдан') + '</span>';
    h += '<h2 class="ct-h" tabindex="-1" data-focus>' + grade(r.pct) + '</h2><p class="ct-big">' + r.score + ' из ' + r.max + ' баллов</p>';
    h += '<p class="ct-muted">Проходной балл — ' + PASS + ' %. Время: ' + fmt(r.used) + (r.timeout ? ' (время вышло)' : '') + '.</p></div></div>';
    h += '<h3 class="ct-sh">Результат по блокам</h3><div class="ct-secs">';
    SECS.forEach(function(s){
      var p = Math.round(r.sec[s].s / r.sec[s].m * 100);
      h += '<div class="ct-srow"><span>' + esc(s) + '</span><div class="ct-sbar"><i class="' + (p >= PASS ? 'pass' : 'fail') + '" style="width:' + p + '%"></i></div><b>' + p + ' %</b><small>' + num(r.sec[s].s) + '/' + r.sec[s].m + '</small></div>';
    });
    h += '</div>';
    var rep = report(r);
    h += '<div class="ct-send"><h3 class="ct-sh">Отправьте результат преподавателю</h3><p class="ct-muted">Скопируйте отчёт и отправьте его в чат группы или своему преподавателю.</p><textarea readonly rows="8" id="ctRep" aria-label="Отчёт для преподавателя">' + esc(rep) + '</textarea>';
    h += '<div class="ct-btns"><button type="button" class="btn btn-gold" id="ctCopy">Скопировать отчёт</button><a class="btn btn-dark" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodeURIComponent(location.href.split('#')[0]) + '&text=' + encodeURIComponent(rep) + '">Отправить в Telegram</a>';
    if (n < MAX_ATT) h += '<button type="button" class="btn btn-dark" id="ctAgain">Пройти ещё раз</button>';
    h += '</div></div>';
    // разбор ошибок
    var items = '', cnt = 0;
    Q.forEach(function(it, i){
      var q = it.q, s = scoreOf(i); if (s >= q.points) return; cnt++;
      items += '<article class="ct-rv"><div class="ct-rvh"><span>Вопрос ' + (i + 1) + ' · ' + esc(q.section) + '</span><b>' + num(s) + '/' + q.points + '</b></div>';
      items += '<p class="ct-rq"' + arAttr(q.question) + '>' + txt(q.question) + '</p>';
      if (q.arabic) items += '<div class="ct-rword" dir="rtl" lang="ar">' + esc(q.arabic) + '</div>';
      if (q.type === 'single_choice') {
        var a = ans[i], mine = a === null ? null : q.options[a];
        items += '<div class="ct-ans bad"><small>Ваш ответ</small>' + (mine === null ? '<span>нет ответа</span>' : '<span' + arAttr(mine) + '>' + txt(mine) + '</span>') + '</div>';
        items += '<div class="ct-ans good"><small>Правильный ответ</small><span' + arAttr(q.answer) + '>' + txt(q.answer) + '</span></div>';
      } else {
        items += '<div class="ct-pairs">';
        q.pairs.forEach(function(p, k){
          var a2 = ans[i][k]; if (a2 === k) return;
          items += '<div class="ct-pr"><span class="ct-pl"' + arAttr(p.left) + '>' + txt(p.left) + '</span><span class="ct-px bad"' + (a2 >= 0 ? arAttr(q.pairs[a2].right) : '') + '>' + (a2 >= 0 ? txt(q.pairs[a2].right) : 'нет ответа') + '</span><span class="ct-px good"' + arAttr(p.right) + '>' + txt(p.right) + '</span></div>';
        });
        items += '</div><p class="ct-muted ct-plegend"><i class="bad"></i>ваш ответ <i class="good"></i>правильно</p>';
      }
      if (q.explanation) items += '<p class="ct-exp">' + txt(q.explanation) + '</p>';
      items += '</article>';
    });
    h += '<h3 class="ct-sh">Разбор ошибок' + (cnt ? ' · ' + cnt : '') + '</h3>';
    h += cnt ? '<div class="ct-review">' + items + '</div>' : '<div class="ct-note ok">Ошибок нет — все ответы верные. ما شاء الله</div>';
    return h + '</div>';
  }

  /* ---------------- flow ---------------- */
  function tick(){
    if (phase !== 'q' && phase !== 'sum') return;
    var left = LIMIT - Math.floor((Date.now() - started) / 1000);
    if (left <= 0) { finish(true); return; }
    var el = document.getElementById('ctTimer');
    if (el) { el.textContent = '⏱ ' + fmt(left); el.classList.toggle('low', left < 300); }
  }
  function guard(e){ e.preventDefault(); e.returnValue = ''; return ''; }
  function start(){
    var inp = document.getElementById('ctName'), v = inp.value.trim();
    if (v.length < 2) { document.getElementById('ctErr').textContent = 'Напишите имя и группу — они попадут в отчёт для преподавателя.'; inp.focus(); return; }
    name = v; var st = load(); st.name = v; save(st);
    prepare(); cur = 0; phase = 'q'; started = Date.now();
    clearInterval(timer); timer = setInterval(tick, 1000);
    window.addEventListener('beforeunload', guard);
    render();
  }
  function finish(timeout){
    clearInterval(timer); window.removeEventListener('beforeunload', guard);
    var r = compute(); r.timeout = !!timeout;
    var st = load();
    st.attempts.push({ date: new Date().toISOString(), name: name, score: r.score, max: r.max, pct: r.pct,
      sections: SECS.map(function(s){ return [s, Math.round(r.sec[s].s / r.sec[s].m * 100)]; }) });
    save(st); last = r; phase = 'res'; render();
  }
  function copy(text, btn){
    function ok(){ btn.textContent = 'Скопировано ✓'; setTimeout(function(){ btn.textContent = 'Скопировать отчёт'; }, 2500); }
    function fb(){ var ta = document.getElementById('ctRep'); ta.focus(); ta.select(); try { if (document.execCommand('copy')) { ok(); return; } } catch(e){} btn.textContent = 'Выделите текст и скопируйте'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fb); else fb();
  }

  root.addEventListener('submit', function(e){ if (e.target.id === 'ctStart') { e.preventDefault(); start(); } });
  root.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('button') : null; if (!t) return;
    if (t.classList.contains('ct-opt')) {
      ans[cur] = +t.getAttribute('data-o');
      root.querySelectorAll('.ct-opt').forEach(function(b){ b.setAttribute('aria-checked', String(b === t)); });
      var all = document.getElementById('ctAll'); if (all) all.textContent = 'Все вопросы · ' + answeredCount() + '/' + Q.length;
      return;
    }
    if (t.id === 'ctPrev' && cur > 0) { cur--; render(); }
    else if (t.id === 'ctNext') { if (cur < Q.length - 1) { cur++; render(); } else { phase = 'sum'; render(); } }
    else if (t.id === 'ctAll') { phase = 'sum'; render(); }
    else if (t.hasAttribute('data-j')) { cur = +t.getAttribute('data-j'); phase = 'q'; render(); }
    else if (t.id === 'ctBack') { phase = 'q'; render(); }
    else if (t.id === 'ctFinish') { finish(false); }
    else if (t.id === 'ctCopy') { copy(document.getElementById('ctRep').value, t); }
    else if (t.id === 'ctAgain') { phase = 'intro'; render(); }
  });
  root.addEventListener('change', function(e){
    var s = e.target; if (!s.classList || !s.classList.contains('ct-ms')) return;
    ans[cur][+s.getAttribute('data-l')] = +s.value;
    var all = document.getElementById('ctAll'); if (all) all.textContent = 'Все вопросы · ' + answeredCount() + '/' + Q.length;
  });

  fetch(SRC).then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(j){ data = j; var by = {}; SECS = []; j.questions.forEach(function(q){ if (!by[q.section]) { by[q.section] = 1; SECS.push(q.section); } }); render(false); })
    .catch(function(){ root.innerHTML = '<div class="ct-card"><div class="ct-note">Не удалось загрузить вопросы теста. Обновите страницу или напишите преподавателю.</div></div>'; });

  window.DAR_CT = { _state: function(){ return { Q: Q, ans: ans, phase: phase }; }, _finish: finish, _score: scoreOf };
})();
