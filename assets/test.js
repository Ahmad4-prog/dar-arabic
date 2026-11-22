(function(){
  var Q = [
    {t:'Знаете ли вы буквы арабского алфавита?', o:[['Нет, пока не знаю их',0],['Узнаю некоторые буквы',1],['Читаю буквы, но медленно',2],['Читаю все буквы уверенно',3]]},
    {t:'Как вы читаете слова с огласовкой (фатха, касра, damma)?', o:[['Не читаю',0],['С трудом',1],['Читаю большинство слов',2],['Читаю свободно, в том числе длинные слова',3]]},
    {t:'Сколько арабских слов вы знаете?', o:[['Ни одного',0],['До 50',1],['От 50 до 300',2],['Больше 300',3]]},
    {t:'Можете ли вы составить простое предложение, например «Я ученик»?', o:[['Нет',0],['С трудом, по отдельным словам',1],['Да, простые предложения',2],['Да, в том числе сложные',3]]},
    {t:'Что вы знаете о грамматике арабского языка?', o:[['Почти ничего',0],['Знаю термины, но путаюсь',1],['Понимаю основные падежи и времена',2],['Уверенно применяю правила',3]]},
    {t:'Можете ли вы читать текст без огласовки и понимать смысл?', o:[['Нет',0],['Только отдельные слова',1],['Понимаю общий смысл простого текста',2],['Читаю и понимаю свободно',3]]},
    {t:'Был ли у вас опыт обучения арабскому?', o:[['Никогда',0],['Немного, самостоятельно',1],['Курсы или школа до года',2],['Больше года',3]]}
  ];
  var R = [
    {max:4,  name:'Подготовка', text:'Рекомендуем подготовительный этап: буквы, чтение с огласовкой и таджвид. С этого начинают почти все, кто пришёл с нуля.'},
    {max:9,  name:'Этап 1', text:'Рекомендуем первый этап: «Байна ядайк», книга 1. Базовая лексика и простые предложения у вас уже есть или совсем близко.'},
    {max:13, name:'Этап 2', text:'Рекомендуем второй этап: «Байна ядайк», книга 2, и «Аль-Аджурумия». Грамматика и осознанное чтение — ваш следующий шаг.'},
    {max:17, name:'Этап 3', text:'Рекомендуем третий этап: «Байна ядайк», книга 3. Вы уверенно читаете и понимаете грамматику.'},
    {max:99, name:'Финал', text:'Рекомендуем финальный этап: «Байна ядайк», книга 4. Вы читаете и понимаете тексты уверенно.'}
  ];
  var ans = [], i = 0;
  var qbar=document.getElementById('qbar'), qcount=document.getElementById('qcount'),
      qtext=document.getElementById('qtext'), qopts=document.getElementById('qopts'),
      qback=document.getElementById('qback'), qres=document.getElementById('qres');
  function render(){
    if (i >= Q.length) return finish();
    qres.hidden = true; qopts.hidden = false;
    qbar.style.width = (i / Q.length * 100) + '%';
    qcount.textContent = 'Вопрос ' + (i+1) + ' из ' + Q.length;
    qtext.textContent = Q[i].t;
    qopts.innerHTML = '';
    Q[i].o.forEach(function(opt){
      var b = document.createElement('button'); b.type='button'; b.textContent = opt[0];
      b.addEventListener('click', function(){ ans[i] = opt[1]; i++; render(); });
      qopts.appendChild(b);
    });
    qback.disabled = (i === 0);
  }
  function finish(){
    var sum = ans.reduce(function(a,b){return a+b;}, 0), r = R[R.length-1];
    for (var k=0;k<R.length;k++){ if (sum <= R[k].max){ r = R[k]; break; } }
    qbar.style.width = '100%'; qcount.textContent = 'Результат'; qtext.textContent = '';
    qopts.hidden = true; qres.hidden = false; qres.innerHTML = '';
    var eb = document.createElement('div'); eb.className='eyebrow'; eb.textContent = 'Ваш предварительный этап';
    var h = document.createElement('h3'); h.textContent = r.name;
    var p = document.createElement('p'); p.textContent = r.text;
    var p2 = document.createElement('p'); p2.className='small';
    p2.textContent = 'Окончательный этап подтверждает менеджер. Напишите ему, и он подскажет, с чего удобнее начать.';
    var a = document.createElement('a'); a.className='btn btn-gold'; a.href='contacts.html'; a.textContent='Контакты менеджеров';
    var again = document.createElement('button'); again.type='button'; again.className='btn btn-dark'; again.style.margin='0 0 0 12px'; again.textContent='Пройти заново';
    again.addEventListener('click', function(){ ans=[]; i=0; render(); });
    qres.appendChild(eb); qres.appendChild(h); qres.appendChild(p); qres.appendChild(p2); qres.appendChild(a); qres.appendChild(again);
  }
  qback.addEventListener('click', function(){ if (i > 0){ i--; render(); } });
  render();
})();
