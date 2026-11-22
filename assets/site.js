(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // menu
  var b = document.querySelector('.burger'), m = document.getElementById('nav');
  if (b && m) {
    b.addEventListener('click', function(){ var o = m.classList.toggle('open'); b.setAttribute('aria-expanded', String(o)); });
    m.addEventListener('click', function(e){ if (e.target.tagName === 'A') { m.classList.remove('open'); b.setAttribute('aria-expanded','false'); } });
  }

  // reveal on scroll
  var els = document.querySelectorAll('.rv-in');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // lightbox for [data-zoom]
  var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
  lb.innerHTML = '<button type="button" aria-label="Закрыть">×</button><img alt=""><p></p>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p'), lbBtn = lb.querySelector('button'), lastFocus = null;
  function openLb(src, alt, cap){ lastFocus = document.activeElement; lbImg.src = src; lbImg.alt = alt || ''; lbCap.textContent = cap || ''; lb.classList.add('open'); lbBtn.focus(); }
  function closeLb(){ lb.classList.remove('open'); lbImg.src = ''; if (lastFocus) lastFocus.focus(); }
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-zoom]') : null;
    if (!t) return;
    e.preventDefault();
    openLb(t.getAttribute('data-zoom'), t.getAttribute('data-alt'), t.getAttribute('data-cap'));
  });
  if (document.documentElement.dir === 'rtl') lbBtn.setAttribute('aria-label','إغلاق');

  // expandable review text
  document.querySelectorAll('[data-more]').forEach(function(btn){
    var txt = document.getElementById(btn.getAttribute('data-more'));
    if (!txt) return;
    if (txt.scrollHeight <= txt.clientHeight + 4) { btn.hidden = true; return; }
    btn.addEventListener('click', function(){
      var open = txt.classList.toggle('clamp') === false;
      btn.textContent = open ? btn.getAttribute('data-less') : btn.getAttribute('data-label');
    });
  });
})();
