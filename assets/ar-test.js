(function(){
  var Q = [
    {t:'هل تعرف حروف الأبجدية العربية؟', o:[['لا، لا أعرفها بعد',0],['أتعرّف على بعضها',1],['أقرأ الحروف لكن ببطء',2],['أقرأ جميع الحروف بثقة',3]]},
    {t:'كيف تقرأ الكلمات المشكولة (الفتحة والكسرة والضمة)؟', o:[['لا أقرأ',0],['بصعوبة',1],['أقرأ معظم الكلمات',2],['أقرأ بطلاقة، حتى الكلمات الطويلة',3]]},
    {t:'كم كلمة عربية تعرف؟', o:[['لا واحدة',0],['حتى 50',1],['من 50 إلى 300',2],['أكثر من 300',3]]},
    {t:'هل تستطيع تكوين جملة بسيطة، مثل «أنا طالب»؟', o:[['لا',0],['بصعوبة، كلمة كلمة',1],['نعم، جمل بسيطة',2],['نعم، وحتى الجمل المركبة',3]]},
    {t:'ماذا تعرف عن نحو اللغة العربية؟', o:[['القليل جدًا',0],['أعرف المصطلحات لكنني أخلط بينها',1],['أفهم الإعراب والأزمنة الأساسية',2],['أطبّق القواعد بثقة',3]]},
    {t:'هل تستطيع قراءة نص غير مشكول وفهم معناه؟', o:[['لا',0],['كلمات متفرقة فقط',1],['أفهم المعنى العام لنص بسيط',2],['أقرأ وأفهم بطلاقة',3]]},
    {t:'هل سبق لك تعلّم العربية؟', o:[['أبدًا',0],['قليلًا، بالدراسة الذاتية',1],['دورات أو مدرسة حتى سنة',2],['أكثر من سنة',3]]}
  ];
  var R = [
    {max:4,  name:'التحضير', text:'نوصي بمرحلة التحضير: الحروف والقراءة المشكولة والتجويد. يبدأ بها معظم من جاؤوا من الصفر.'},
    {max:9,  name:'المرحلة 1', text:'نوصي بالمرحلة الأولى: «بين يديك»، الكتاب الأول. المفردات الأساسية والجمل البسيطة لديك أو قريبة منك.'},
    {max:13, name:'المرحلة 2', text:'نوصي بالمرحلة الثانية: «بين يديك»، الكتاب الثاني، و«الآجرومية». النحو والقراءة الواعية هي خطوتك التالية.'},
    {max:17, name:'المرحلة 3', text:'نوصي بالمرحلة الثالثة: «بين يديك»، الكتاب الثالث. أنت تقرأ وتفهم النحو بثقة.'},
    {max:99, name:'المرحلة النهائية', text:'نوصي بالمرحلة النهائية: «بين يديك»، الكتاب الرابع. أنت تقرأ النصوص وتفهمها بثقة.'}
  ];
  var ans = [], i = 0;
  var qbar=document.getElementById('qbar'), qcount=document.getElementById('qcount'),
      qtext=document.getElementById('qtext'), qopts=document.getElementById('qopts'),
      qback=document.getElementById('qback'), qres=document.getElementById('qres');
  function render(){
    if (i >= Q.length) return finish();
    qres.hidden = true; qopts.hidden = false;
    qbar.style.width = (i / Q.length * 100) + '%';
    qcount.textContent = 'السؤال ' + (i+1) + ' من ' + Q.length;
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
    qbar.style.width = '100%'; qcount.textContent = 'النتيجة'; qtext.textContent = '';
    qopts.hidden = true; qres.hidden = false; qres.innerHTML = '';
    var eb = document.createElement('div'); eb.className='eyebrow'; eb.textContent = 'مرحلتك الأولية';
    var h = document.createElement('h3'); h.textContent = r.name;
    var p = document.createElement('p'); p.textContent = r.text;
    var p2 = document.createElement('p'); p2.className='small';
    p2.textContent = 'المسؤول هو من يؤكد المرحلة النهائية. راسله وسيرشدك إلى الأنسب لبدايتك.';
    var a = document.createElement('a'); a.className='btn btn-gold'; a.href='contacts.html'; a.textContent='جهات التواصل';
    var again = document.createElement('button'); again.type='button'; again.className='btn btn-dark'; again.style.margin='0 0 0 12px'; again.textContent='أعد الاختبار';
    again.addEventListener('click', function(){ ans=[]; i=0; render(); });
    qres.appendChild(eb); qres.appendChild(h); qres.appendChild(p); qres.appendChild(p2); qres.appendChild(a); qres.appendChild(again);
  }
  qback.addEventListener('click', function(){ if (i > 0){ i--; render(); } });
  render();
})();
