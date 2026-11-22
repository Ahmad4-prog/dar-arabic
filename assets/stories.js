(function(){
  var box = document.getElementById('stories'), empty = document.getElementById('storiesEmpty');
  fetch('assets/stories.json').then(function(r){ return r.json(); }).then(function(list){
    if (!list || !list.length) return;
    if (empty) empty.hidden = true;
    list.forEach(function(s){
      var c = document.createElement('article'); c.className = 'story';
      var m = document.createElement('div'); m.className = 'meta'; m.textContent = (s.stage || '') + (s.name ? ' · ' + s.name : '');
      var p = document.createElement('p'); p.textContent = s.text || '';
      c.appendChild(m); c.appendChild(p);
      if (s.photo) { var im = document.createElement('img'); im.src = s.photo; im.alt = 'Фото ученика'; im.loading = 'lazy'; c.appendChild(im); }
      box.appendChild(c);
    });
  }).catch(function(){ /* список не загрузился — остаётся текст-заглушка */ });

  var form = document.getElementById('sform'), res = document.getElementById('sres');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var d = new FormData(form);
    var payload = { name: d.get('name'), group: d.get('group'), stage: d.get('stage'), text: d.get('text') };
    res.textContent = '';
    if (window.DAR_STORIES_ENDPOINT) {
      fetch(window.DAR_STORIES_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(function(r){ if(!r.ok) throw new Error(); res.textContent = 'Спасибо! История отправлена на проверку.'; form.reset(); })
        .catch(function(){ res.textContent = 'Не удалось отправить. Попробуйте позже или напишите менеджеру.'; });
      return;
    }
    var text = 'Моя история (' + payload.stage + ', ' + payload.name + '):\n\n' + payload.text;
    var to = payload.group === 'sisters' ? 'https://t.me/Salima_zayed' : 'https://t.me/ahmad_huna';
    var done = function(){
      res.innerHTML = '';
      res.appendChild(document.createTextNode('Текст скопирован. Откройте Telegram и отправьте его менеджеру: '));
      var a = document.createElement('a'); a.href = to; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'написать менеджеру';
      res.appendChild(a);
      form.reset();
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  });
})();
