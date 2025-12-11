/* app.js — validation, ARIA announcements, small mock backend */
(function(){
  const $ = sel => document.querySelector(sel);
  const formatINR = v => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(v);

  const emiEl = $('#emi'), totalEl = $('#total'), eligEl = $('#eligibility');
  const estimateBtn = $('#estimateBtn'), submitBtn = $('#submitBtn'), msg = $('#msg');
  const form = document.getElementById('apply');
  const inputs = ['#courseValue','#loanAmount','#tenure','#interest'];

  function calcEMI(P, annualRate, years){
    const r = annualRate/100/12; const n = years*12;
    if(r===0) return P/n;
    return P * r * Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  }

  function announce(text){
    // SR announcement
    msg.textContent = text;
  }

  function updatePreview(){
    const P = Math.max(0,Number($('#loanAmount').value)||0);
    const rate = Math.max(0,Number($('#interest').value)||0);
    const years = Math.max(1,Number($('#tenure').value)||1);
    const emi = calcEMI(P,rate,years);
    const total = emi*years*12;
    emiEl.textContent = formatINR(Math.round(emi));
    totalEl.textContent = formatINR(Math.round(total));
    const eligible = (P <= Number($('#courseValue').value) && P <= 2000000);
    eligEl.textContent = eligible? 'Pre-eligible' : 'Contact advisor';
    submitBtn.disabled = !eligible;
  }

  // client-side validation helper
  function validateForm(){
    const errors = [];
    const name = $('#fullname').value.trim();
    const email = $('#email').value.trim();
    const course = Number($('#courseValue').value) || 0;
    const loan = Number($('#loanAmount').value) || 0;
    if(!name) errors.push('Full name is required.');
    if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('A valid email is required.');
    if(course <= 0) errors.push('Course fee must be greater than zero.');
    if(loan <= 0) errors.push('Loan amount must be greater than zero.');
    if(loan > course*1.2) errors.push('Loan seems higher than typical course cost (over 120%).');
    return errors;
  }

  // initialize
  updatePreview();

  // throttled inputs
  let t; inputs.forEach(sel=>{
    const el = document.querySelector(sel);
    if(!el) return;
    el.addEventListener('input', ()=>{ clearTimeout(t); t = setTimeout(updatePreview, 220); });
  });

  estimateBtn.addEventListener('click', ()=>{
    updatePreview();
    announce('Estimation updated.');
  });

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const errs = validateForm();
    if(errs.length){
      announce('Form has errors: ' + errs.join(' '));
      // show toast
      showToast('Error: ' + errs[0]);
      return;
    }
    submitBtn.disabled = true; announce('Submitting application...'); showToast('Submitting...');
    // simulate a small mock API call
    setTimeout(()=>{
      announce('Application submitted successfully. Our team will contact you within 3 business days.');
      showToast('Application submitted successfully.');
      form.reset(); updatePreview(); submitBtn.disabled = true;
    }, 900);
  });

  // tiny toast util using template
  function showToast(text, timeout = 3000){
    const tpl = document.getElementById('toast-template');
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.textContent = text;
    document.body.appendChild(node);
    setTimeout(()=> node.remove(), timeout);
  }

  // keyboard helper
  window.addEventListener('keydown', e=>{ if(e.altKey && e.key.toLowerCase()==='l'){ e.preventDefault(); $('#fullname').focus(); } });
})();