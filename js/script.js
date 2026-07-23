/* =========================================================
   Grace Tam Khuat — Portfolio Script
========================================================= */
document.addEventListener('DOMContentLoaded',function(){
  /* 1. Sticky navbar */
  const navbar=document.getElementById('mainNav');
  function handleNavbarScroll(){
    if(navbar)navbar.classList.toggle('scrolled',window.scrollY>20);
  }
  handleNavbarScroll();
  window.addEventListener('scroll',handleNavbarScroll,{passive:true});

  /* 2. Mobile navbar */
  const navLinks=document.querySelectorAll('#navContent .nav-link');
  const navCollapseElement=document.getElementById('navContent');
  navLinks.forEach(function(link){
    link.addEventListener('click',function(){
      if(navCollapseElement&&navCollapseElement.classList.contains('show')&&typeof bootstrap!=='undefined'){
        const bootstrapCollapse=bootstrap.Collapse.getOrCreateInstance(navCollapseElement);
        bootstrapCollapse.hide();
      }
    });
  });

  /* 3. Active navbar link */
  const sections=document.querySelectorAll('section[id],header[id]');
  function highlightActiveLink(){
    let currentSectionId='home';
    const scrollPosition=window.scrollY+150;
    sections.forEach(function(section){
      const sectionTop=section.offsetTop;
      const sectionBottom=sectionTop+section.offsetHeight;
      if(scrollPosition>=sectionTop&&scrollPosition<sectionBottom){
        currentSectionId=section.id;
      }
    });
    const nearPageBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-60;
    if(nearPageBottom)currentSectionId='contact';
    navLinks.forEach(function(link){
      link.classList.toggle('active',link.getAttribute('href')===`#${currentSectionId}`);
    });
  }
  highlightActiveLink();
  window.addEventListener('scroll',highlightActiveLink,{passive:true});

  /* 4. Fade-in animation */
  const fadeElements=document.querySelectorAll('.fade-in');
  const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReducedMotion||!('IntersectionObserver' in window)){
    fadeElements.forEach(function(element){
      element.classList.add('show');
    });
  }else{
    const fadeObserver=new IntersectionObserver(function(entries,observer){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:0.12,rootMargin:'0px 0px -30px 0px'});
    fadeElements.forEach(function(element){
      fadeObserver.observe(element);
    });
  }

  /* 5. Back to top */
  const backToTopButton=document.getElementById('backToTop');
  if(backToTopButton){
    function toggleBackToTop(){
      backToTopButton.classList.toggle('show',window.scrollY>400);
    }
    toggleBackToTop();
    window.addEventListener('scroll',toggleBackToTop,{passive:true});
    backToTopButton.addEventListener('click',function(){
      window.scrollTo({top:0,behavior:prefersReducedMotion?'auto':'smooth'});
    });
  }
    /* 6. Contact form */
    const contactForm=document.getElementById('contactForm');
    console.log('Contact form found:',contactForm);

    const messageField=document.getElementById('message');
    const characterCount=document.getElementById('charCount');
    const formSuccess=document.getElementById('formSuccess');

  if(contactForm&&messageField&&characterCount&&formSuccess){
    const fullName=document.getElementById('fullName');
    const emailAddress=document.getElementById('emailAddress');
    const subject=document.getElementById('subject');
    const formFields=contactForm.querySelectorAll('input,textarea');
    const submitButton=contactForm.querySelector('button[type="submit"]');

    function updateCharacterCount(){
      const currentLength=messageField.value.length;
      characterCount.textContent=currentLength;
      const counterContainer=characterCount.closest('.char-counter');
      if(counterContainer){
        counterContainer.classList.toggle('near-limit',currentLength>=450);
      }
    }

    function isValidEmail(value){
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function clearFieldError(field){
      field.classList.remove('is-invalid');
      field.classList.remove('is-valid');
      formSuccess.classList.remove('show','error');
    }

    function validateField(field){
      let valid=true;
      const value=field.value.trim();

      if(field===fullName||field===subject){
        valid=value.length>=2;
      }else if(field===emailAddress){
        valid=isValidEmail(value);
      }else if(field===messageField){
        valid=value.length>=20&&value.length<=500;
      }

      field.classList.toggle('is-invalid',!valid);
      field.classList.toggle('is-valid',valid&&value!=='');
      return valid;
    }

    updateCharacterCount();
    messageField.addEventListener('input',updateCharacterCount);

    formFields.forEach(function(field){
      field.addEventListener('input',function(){
        clearFieldError(field);
        if(field.value.trim()!=='')validateField(field);
      });

      field.addEventListener('blur',function(){
        if(field.value.trim()!=='')validateField(field);
      });
    });

    contactForm.addEventListener('submit',async function(event){
      event.preventDefault();
      event.stopPropagation();

      const nameValid=validateField(fullName);
      const emailValid=validateField(emailAddress);
      const subjectValid=validateField(subject);
      const messageValid=validateField(messageField);
      const isFormValid=nameValid&&emailValid&&subjectValid&&messageValid;

      if(!isFormValid){
        formSuccess.classList.remove('show','error');
        const firstInvalidField=contactForm.querySelector('.is-invalid');
        if(firstInvalidField)firstInvalidField.focus();
        return;
      }

      if(!submitButton)return;

      const originalButtonText=submitButton.innerHTML;
      submitButton.disabled=true;
      submitButton.innerHTML='<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

      try{
        const response=await fetch(contactForm.action,{
          method:'POST',
          body:new FormData(contactForm),
          headers:{Accept:'application/json'}
        });

        if(!response.ok)throw new Error('Form submission failed');

        formSuccess.innerHTML='<i class="bi bi-check-circle-fill"></i> Thank you! Your message has been sent successfully.';
        formSuccess.classList.remove('error');
        formSuccess.classList.add('show');

        contactForm.reset();

        formFields.forEach(function(field){
          field.classList.remove('is-valid','is-invalid');
        });

        updateCharacterCount();

        window.setTimeout(function(){
          formSuccess.classList.remove('show');
        },5000);
      }catch(error){
        console.error('Contact form error:',error);
        formSuccess.innerHTML='<i class="bi bi-exclamation-circle-fill"></i> Sorry, your message could not be sent. Please try again.';
        formSuccess.classList.add('error','show');
      }finally{
        submitButton.disabled=false;
        submitButton.innerHTML=originalButtonText;
      }
    });
  }
});