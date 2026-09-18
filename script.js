const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const screens=$$('.screen');const total=screens.length;let step=1;const session=(crypto.randomUUID?.()||String(Date.now()));
let cfg={instagram_url:'https://instagram.com/',after_music:'Bunu təsadüfən seçmədim.'};
async function loadConfig(){try{const r=await fetch('/api/config');if(r.ok)cfg={...cfg,...await r.json()};$('#instagramLink').href=cfg.instagram_url||cfg.instagramUrl||'https://instagram.com/'}catch(e){}}
async function save(key,value){try{await fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({session,key,value})})}catch(e){}}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)}
function show(n){step=Math.max(1,Math.min(total,n));screens.forEach(s=>s.classList.toggle('active',+s.dataset.step===step));$('#stepText').textContent=String(step).padStart(2,'0')+' / '+String(total).padStart(2,'0');$('#progress').style.width=(step/total*100)+'%';scrollTo({top:0,behavior:'smooth'});save('progress',step);window.onStepChange?.(step)}
$$('[data-next]').forEach(b=>b.addEventListener('click',()=>show(step+1)));
$$('.choices').forEach(group=>{$$('button',group).forEach(btn=>btn.addEventListener('click',()=>{$$('button',group).forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');const next=group.parentElement.querySelector('.next');if(next)next.disabled=false;save(group.dataset.question,btn.textContent.trim());if(group.dataset.question==='love'){$('#loveReaction').textContent=btn.textContent.trim()==='yox'?'hmm... bunu admin görəcək 😭':btn.textContent.trim()==='hə'?'tamam. bunu unutmayacağım.':'peki, kabul :)'}if(group.dataset.question==='final'){$('#saveFinal').disabled=false;if(btn.textContent.includes('öz cavab'))$('#customFinal').classList.remove('hidden')}}))});
// mixer
['cold','talk','annoy'].forEach(id=>{$('#'+id)?.addEventListener('input',e=>{$('#'+id+'Val') && ($('#'+id+'Val').textContent=e.target.value)})});
$('#saveMixer')?.addEventListener('click',()=>{save('mixer',{cold:+$('#cold').value,talk:+$('#talk').value,annoy:+$('#annoy').value});show(4)});
// cassette
let drag=0,lastX=null;$('#cassette').addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch'){if(lastX!==null)drag+=Math.abs(e.clientX-lastX);lastX=e.clientX;$('#cassette').classList.add('dragging');if(drag>180){$('#rewindText').textContent='Bəzi şeylər rewind olmur. Amma düzəlir.';$('#cassetteNext').disabled=false;save('cassette_rewound',true)}}});$('#cassette').addEventListener('pointerup',()=>{lastX=null;$('#cassette').classList.remove('dragging')});
// music
const audio=$('#audio'),play=$('#play'),mn=$('#musicNext'),music=$('.music');let listened=0,listenTimer=null;function fmt(s){return Number.isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'--:--'}
const wave=$('#wave');for(let i=0;i<52;i++){const x=document.createElement('i');x.style.setProperty('--h',(7+Math.random()*45)+'px');x.style.animationDelay=(Math.random()*.6)+'s';wave.appendChild(x)}
audio.addEventListener('loadedmetadata',()=>$('#dur').textContent=fmt(audio.duration));audio.addEventListener('timeupdate',()=>{$('#cur').textContent=fmt(audio.currentTime);if(audio.duration){$('#seekFill').style.width=(audio.currentTime/audio.duration*100)+'%';const pct=Math.min(100,Math.round(listened/audio.duration*100));if(pct>=70){mn.disabled=false;mn.textContent='AÇILDI →'}else mn.textContent=`KİLİTLİ · ${pct}%`;if(audio.currentTime>35)$('#musicSecret').classList.add('show')}});async function toggleMusic(){if(audio.paused){try{await audio.play();music.classList.add('playing');play.textContent='Ⅱ';clearInterval(listenTimer);listenTimer=setInterval(()=>{if(!audio.paused){listened++;if(listened%10===0)save('music_seconds',listened)}},1000)}catch(e){toast('Musiqi açıla bilmədi')}}else{audio.pause();music.classList.remove('playing');play.textContent='▶';clearInterval(listenTimer)}}play.addEventListener('click',toggleMusic);$('#back10').addEventListener('click',()=>audio.currentTime=Math.max(0,audio.currentTime-10));$('#fwd10').addEventListener('click',()=>audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10));$('#cover').addEventListener('click',()=>{toast('yaxşı, gizli yeri tapdın.');save('cover_secret',true)});$('#heartToggle').addEventListener('click',e=>{e.target.textContent=e.target.textContent==='♡'?'♥':'♡';save('liked_song',e.target.textContent==='♥')});audio.addEventListener('ended',()=>{mn.disabled=false;mn.textContent='AÇILDI →';save('music_completed',true)});
// flashlight
const fa=$('#flashArea'),torch=$('#torch');const seen=new Set();function flashMove(e){const r=fa.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;torch.style.left=x+'px';torch.style.top=y+'px';$$('span',fa).forEach((s,i)=>{const sr=s.getBoundingClientRect(),cx=sr.left-r.left+sr.width/2,cy=sr.top-r.top+sr.height/2;if(Math.hypot(cx-x,cy-y)<85){s.classList.add('seen');seen.add(i)}});$('#foundCount').textContent=seen.size;if(seen.size===4){$('#flashNext').disabled=false;save('hidden_words',true)}}fa.addEventListener('pointermove',flashMove);fa.addEventListener('pointerdown',flashMove);
// scratch
const canvas=$('#scratch'),ctx=canvas.getContext('2d');let scratches=0;function setupScratch(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.scale(d,d);ctx.fillStyle='#8f2639';ctx.fillRect(0,0,r.width,r.height);ctx.fillStyle='#f2b2bd';ctx.font='600 18px sans-serif';ctx.textAlign='center';ctx.fillText('KAZI',r.width/2,r.height/2)}setTimeout(setupScratch,100);function scratchAt(e){const r=canvas.getBoundingClientRect();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(e.clientX-r.left,e.clientY-r.top,30,0,Math.PI*2);ctx.fill();scratches++;if(scratches>45){$('#scratchNext').disabled=false;save('scratch_opened',true)}}canvas.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')scratchAt(e)});canvas.addEventListener('pointerdown',scratchAt);
// photos
let photosSeen=0;$$('.photo').reverse().forEach(card=>{let sx=0;card.addEventListener('pointerdown',e=>{sx=e.clientX;card.setPointerCapture?.(e.pointerId)});card.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-sx)>45){card.classList.add('gone');photosSeen++;save('photo_seen',photosSeen);if(photosSeen>=3)$('#photosNext').disabled=false}})});
// doors
const opened=new Set(),doorMsgs={1:'Bir mahnı: Lovers Rock. obvious.',2:'Bir cümlə: “bəzən danışmaq düzəltməyin yarısıdır.”',3:'Bir bonus: sən bura qədər gəlibsənsə, artıq qalib sayılırsan.'};$$('#doors button').forEach(b=>b.addEventListener('click',()=>{opened.add(b.dataset.door);b.classList.add('open');b.querySelector('span').textContent='✓';$('#doorResult').textContent=doorMsgs[b.dataset.door];save('door_'+b.dataset.door,true);if(opened.size===3)$('#doorsNext').disabled=false}));
// hold
let holdStart=0,holdRAF;const hb=$('#holdBtn');function holdLoop(){const p=Math.min(1,(performance.now()-holdStart)/3000);hb.style.setProperty('--hold',(p*100)+'%');$('#holdText').textContent=Math.ceil((1-p)*3)||'✓';if(p>=1){$('#holdReveal').classList.add('show');$('#holdNext').disabled=false;save('hold_complete',true);return}holdRAF=requestAnimationFrame(holdLoop)}hb.addEventListener('pointerdown',()=>{holdStart=performance.now();cancelAnimationFrame(holdRAF);holdLoop()});['pointerup','pointerleave','pointercancel'].forEach(ev=>hb.addEventListener(ev,()=>{if(!$('#holdNext').disabled)return;cancelAnimationFrame(holdRAF);hb.style.setProperty('--hold','0%');$('#holdText').textContent='HOLD'}));
// maze simplified drag
const maze=$('#maze'),dot=$('#dot');let dragging=false;dot.addEventListener('pointerdown',e=>{dragging=true;dot.setPointerCapture?.(e.pointerId)});maze.addEventListener('pointermove',e=>{if(!dragging)return;const r=maze.getBoundingClientRect();let x=Math.max(0,Math.min(r.width-30,e.clientX-r.left-15)),y=Math.max(0,Math.min(r.height-30,e.clientY-r.top-15));dot.style.left=x+'px';dot.style.top=y+'px';if(x>r.width-75&&y>r.height-75){$('#mazeNext').disabled=false;save('maze_complete',true);toast('ÇIKIŞ bulundu')}});dot.addEventListener('pointerup',()=>dragging=false);
// chaos
let dodges=0;$('#chaosBtn').addEventListener('pointerenter',()=>{if(dodges>=4)return;const a=$('#chaosArea'),b=$('#chaosBtn');b.style.left=Math.random()*Math.max(20,a.clientWidth-b.offsetWidth-20)+'px';b.style.top=Math.random()*Math.max(20,a.clientHeight-b.offsetHeight-20)+'px';dodges++});$('#chaosBtn').addEventListener('click',()=>{$('#chaosReaction').textContent='tamam, bunun ekran görüntüsünü alıyorum.';$('#chaosNext').disabled=false;save('annoying','heç deyil')});$('#chaosTruth').addEventListener('click',()=>{$('#chaosReaction').textContent='ədalətli cavabdır 😭';$('#chaosNext').disabled=false;save('annoying','çox')});
// code = LoversRock letters 10 + doors 3 => 13
const codeInputs=$$('.code-inputs input');codeInputs.forEach((i,n)=>i.addEventListener('input',()=>{if(i.value&&codeInputs[n+1])codeInputs[n+1].focus()}));$('#codeCheck').addEventListener('click',()=>{const v=codeInputs.map(i=>i.value).join('');if(v==='13'){$('#codeMsg').textContent='ERİŞİM AÇILDI';$('#codeNext').disabled=false;save('vault_unlocked',true)}else $('#codeMsg').textContent='olmadı. tekrar düşün :)'});
// vault
$$('#envelopes button').forEach(b=>b.addEventListener('click',()=>{$('#vaultMsg').textContent=b.dataset.msg;save('vault_open',b.textContent.trim())}));
// fake final
$('#fakeExit').addEventListener('click',()=>{document.body.animate([{filter:'brightness(1)'},{filter:'brightness(0)'},{filter:'brightness(1)'}],{duration:1000});setTimeout(()=>show(20),650)});
// message
$('#message').addEventListener('input',e=>$('#charCount').textContent=e.target.value.length);$('#sendMessage').addEventListener('click',()=>{const v=$('#message').value.trim();if(!v)return toast('Bir şey yaz :)');save('message',v);$('#messageNext').disabled=false;$('#sendMessage').textContent='Göndərildi ✓';toast('qeyd edildi')});
// final
$('#saveFinal').addEventListener('click',()=>{const selected=$('.final-choice .selected')?.textContent.trim();const custom=$('#customFinal').value.trim();save('final_detail',{selected,custom});$('#finalThanks').classList.add('show');$('#saveFinal').textContent='SESSION CLOSED';$('#saveFinal').disabled=true});
loadConfig();show(1);
// ============================================================================
// 3D REALISTIC ANATOMICAL HEART & HEART MONITOR (THREE.JS / WEBGL)
// ============================================================================
(function init3DHeart() {
  const heartCanvas = $('#heart3dCanvas');
  const heartWrap = $('#heartCanvasWrap');
  const heartLoader = $('#heartLoader');
  const heartHint = $('#heartHint');
  const heartAura = $('#heartAura');
  const heartBpm = $('#heartBpm');
  const heartMood = $('#heartMood');
  const bpmIcon = $('.bpm-icon');

  if (!heartCanvas || !heartWrap) return;

  // BPM State
  let currentBpm = 78;
  let targetBpm = 78;

  function calculateTargetBpm() {
    const cold = +($('#cold')?.value || 58);
    const talk = +($('#talk')?.value || 44);
    const annoy = +($('#annoy')?.value || 73);
    // Düşük: 55-70, Orta: 70-95, Yüksək: 95-130
    const raw = 55 + (talk * 0.44) + (annoy * 0.36) - (cold * 0.16);
    return Math.max(55, Math.min(130, Math.round(raw)));
  }

  function updateMixerValues() {
    ['cold', 'talk', 'annoy'].forEach(id => {
      const el = $('#' + id);
      const val = $('#' + id + 'Val');
      if (el && val) val.textContent = el.value;
    });
    targetBpm = calculateTargetBpm();
  }

  ['cold', 'talk', 'annoy'].forEach(id => {
    $('#' + id)?.addEventListener('input', updateMixerValues);
  });
  updateMixerValues();

  // If Three.js is not loaded, fallback gracefully
  if (typeof THREE === 'undefined') {
    if (heartLoader) {
      heartLoader.innerHTML = '<small style="color:var(--red)">WebGL 3D modulu yüklənmədi</small>';
    }
    return;
  }

  // Three.js Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: heartCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.error('WebGL initialization error:', err);
    if (heartLoader) {
      heartLoader.innerHTML = '<small style="color:var(--red)">WebGL dəstəklənmir</small>';
    }
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding || 3001;
  renderer.toneMapping = THREE.ACESFilmicToneMapping || 4;
  renderer.toneMappingExposure = 1.25;

  // Cinematic Lighting (Lovers Rock / Deep Burgundy & Neon Pink aesthetic)
  const ambientLight = new THREE.AmbientLight(0x2b060e, 1.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xff5578, 2.6);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xaa1c38, 2.2);
  rimLight.position.set(-3.5, -2, -3);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x44111e, 1.1);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  const coreLight = new THREE.PointLight(0xff224a, 1.8, 8);
  coreLight.position.set(0, 0, 0.4);
  scene.add(coreLight);

  // Group that holds heart mesh
  const heartGroup = new THREE.Group();
  scene.add(heartGroup);

  let heartMeshRoot = null;

  // Procedural anatomical heart generator (immediate render & fallback)
  function buildProceduralHeart() {
    const group = new THREE.Group();

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x820e24,
      roughness: 0.32,
      metalness: 0.08,
      emissive: 0x220208,
      emissiveIntensity: 0.35
    });

    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0xb51c3a,
      roughness: 0.28,
      metalness: 0.05,
      emissive: 0x2f040d,
      emissiveIntensity: 0.4
    });

    const veinMat = new THREE.MeshStandardMaterial({
      color: 0x480b1e,
      roughness: 0.36,
      metalness: 0.06,
      emissive: 0x140208
    });

    // Ventricles geometry sculpted
    const vGeom = new THREE.SphereGeometry(1.0, 36, 32);
    const pos = vGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      if (y < 0) {
        const taper = 1.0 + y * 0.46;
        x *= Math.max(0.22, taper);
        z *= Math.max(0.22, taper);
        x += y * 0.13;
      }
      if (y > 0) {
        y *= 1.06;
        if (x < 0) x *= 1.14;
      }
      z *= 0.84;
      pos.setXYZ(i, x, y, z);
    }
    vGeom.computeVertexNormals();
    const ventricles = new THREE.Mesh(vGeom, heartMat);
    group.add(ventricles);

    // Aortic Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.6, 0.1),
      new THREE.Vector3(0.06, 1.35, 0.0),
      new THREE.Vector3(-0.25, 1.55, -0.1),
      new THREE.Vector3(-0.55, 1.25, -0.3),
      new THREE.Vector3(-0.58, 0.45, -0.4)
    ]);
    const aortaGeom = new THREE.TubeGeometry(aortaCurve, 28, 0.22, 16, false);
    group.add(new THREE.Mesh(aortaGeom, vesselMat));

    // Aortic branches
    const branches = [
      { pt: new THREE.Vector3(-0.02, 1.48, 0.0), dir: new THREE.Vector3(0.12, 0.42, 0.05), r: 0.07 },
      { pt: new THREE.Vector3(-0.22, 1.57, -0.1), dir: new THREE.Vector3(-0.04, 0.44, -0.02), r: 0.065 },
      { pt: new THREE.Vector3(-0.42, 1.45, -0.2), dir: new THREE.Vector3(-0.16, 0.40, -0.08), r: 0.06 }
    ];
    branches.forEach(b => {
      const c = new THREE.CatmullRomCurve3([b.pt, b.pt.clone().add(b.dir)]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(c, 10, b.r, 12, false), vesselMat));
    });

    // Pulmonary trunk
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.5, 0.24),
      new THREE.Vector3(-0.04, 0.98, 0.2),
      new THREE.Vector3(-0.2, 1.18, 0.05)
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(pulmCurve, 20, 0.2, 16, false), vesselMat));

    // Superior vena cava
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.52, 0.5, -0.15),
      new THREE.Vector3(0.52, 1.35, -0.15)
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 14, 0.17, 14, false), veinMat));

    // Coronary artery
    const coronaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.72, 0.78),
      new THREE.Vector3(-0.02, 0.25, 0.85),
      new THREE.Vector3(0.08, -0.25, 0.72),
      new THREE.Vector3(0.15, -0.65, 0.42)
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(coronaryCurve, 20, 0.038, 10, false), vesselMat));

    group.position.set(0, -0.18, 0);
    return group;
  }

  // Set initial procedural heart
  heartMeshRoot = buildProceduralHeart();
  heartGroup.add(heartMeshRoot);

  // Load realistic GLB model from assets/models/heart.glb
  if (THREE.GLTFLoader) {
    const loader = new THREE.GLTFLoader();
    loader.load(
      '/assets/models/heart.glb',
      (gltf) => {
        heartLoader?.classList.add('hidden');
        if (heartMeshRoot) heartGroup.remove(heartMeshRoot);

        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            if (child.material.map) {
              child.material.color = new THREE.Color(0xd94462);
              child.material.roughness = 0.34;
              child.material.metalness = 0.06;
              child.material.emissive = new THREE.Color(0x28040d);
              child.material.emissiveIntensity = 0.35;
            } else {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x7e0d24,
                roughness: 0.32,
                metalness: 0.08,
                emissive: 0x220208,
                emissiveIntensity: 0.35
              });
            }
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 2.45 / (maxDim || 1);
        model.position.sub(center.multiplyScalar(s));
        model.scale.set(s, s, s);

        heartMeshRoot = model;
        heartGroup.add(heartMeshRoot);
      },
      undefined,
      (err) => {
        console.warn('GLB load fallback to procedural 3D heart model:', err);
        heartLoader?.classList.add('hidden');
      }
    );
  } else {
    heartLoader?.classList.add('hidden');
  }

  // 3D Interaction: Mouse & Touch Drag + Momentum / Inertia
  let isDragging = false;
  let autoRotate = true;
  const previousPointer = { x: 0, y: 0 };
  const velocity = { x: 0, y: 0 };
  const currentRotation = { x: 0.12, y: 0 };
  const targetRotation = { x: 0.12, y: 0 };

  function onPointerDown(e) {
    isDragging = true;
    autoRotate = false;
    heartHint?.classList.add('hidden');
    previousPointer.x = e.clientX;
    previousPointer.y = e.clientY;
    velocity.x = 0;
    velocity.y = 0;
    try {
      heartWrap.setPointerCapture(e.pointerId);
    } catch (_) {}
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - previousPointer.x;
    const dy = e.clientY - previousPointer.y;
    previousPointer.x = e.clientX;
    previousPointer.y = e.clientY;

    const sens = 0.0075;
    velocity.y = dx * sens;
    velocity.x = dy * sens;

    targetRotation.y += velocity.y;
    targetRotation.x += velocity.x;
    targetRotation.x = Math.max(-0.75, Math.min(0.75, targetRotation.x));
  }

  function onPointerUp() {
    isDragging = false;
  }

  heartWrap.addEventListener('pointerdown', onPointerDown);
  heartWrap.addEventListener('pointermove', onPointerMove);
  heartWrap.addEventListener('pointerup', onPointerUp);
  heartWrap.addEventListener('pointercancel', onPointerUp);
  heartWrap.addEventListener('pointerleave', onPointerUp);

  // Resize Handler
  function resizeRenderer() {
    const width = heartWrap.clientWidth || 300;
    const height = heartWrap.clientHeight || 350;
    if (width && height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
  }

  window.addEventListener('resize', resizeRenderer);
  setTimeout(resizeRenderer, 150);

  // Animation Loop with Multi-phase Heartbeat & BPM
  const clock = new THREE.Clock();
  let animId = null;

  function renderLoop() {
    animId = requestAnimationFrame(renderLoop);

    const elapsedTime = clock.getElapsedTime();

    // 1. Rotation with inertia or auto-rotation
    if (!isDragging) {
      targetRotation.y += velocity.y;
      targetRotation.x += velocity.x;
      targetRotation.x = Math.max(-0.75, Math.min(0.75, targetRotation.x));
      velocity.x *= 0.92;
      velocity.y *= 0.92;

      if (autoRotate) {
        targetRotation.y += 0.004;
      }
    }

    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.12;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.12;
    heartGroup.rotation.x = currentRotation.x;
    heartGroup.rotation.y = currentRotation.y;

    // 2. Smooth BPM Lerp & Status Display
    currentBpm += (targetBpm - currentBpm) * 0.08;
    const roundedBpm = Math.round(currentBpm);
    if (heartBpm) heartBpm.textContent = roundedBpm;

    if (heartMood) {
      if (currentBpm < 70) {
        heartMood.textContent = 'Sakin, yavaş ritm.';
      } else if (currentBpm < 95) {
        heartMood.textContent = 'Stabil və canlı.';
      } else {
        heartMood.textContent = 'Həyəcanlı və sürətli!';
      }
    }

    // 3. Realistic Multi-Phase Cardiac Beat ("Lub-Dub")
    const cycleTime = 60 / currentBpm;
    const phase = (elapsedTime % cycleTime) / cycleTime;

    let pulse = 0;
    // Phase 1: Ventricular Systole (Primary contraction kick)
    if (phase < 0.14) {
      const p = phase / 0.14;
      pulse = Math.sin(p * Math.PI) * 0.11;
    }
    // Phase 2: Dicrotic notch recoil (Secondary aortic closure kick)
    else if (phase >= 0.18 && phase < 0.30) {
      const p = (phase - 0.18) / 0.12;
      pulse = Math.sin(p * Math.PI) * 0.045;
    }
    // Phase 3 & 4: Diastolic relaxation & resting filling pause
    else {
      pulse = 0;
    }

    // 4. Non-uniform anatomical deformation
    if (heartMeshRoot) {
      heartMeshRoot.scale.x = 1.0 + pulse * 0.9;
      heartMeshRoot.scale.y = 1.0 - pulse * 0.45;
      heartMeshRoot.scale.z = 1.0 + pulse * 0.8;
    }

    // 5. Lighting and Ambient Sync
    if (coreLight) {
      coreLight.intensity = 1.6 + pulse * 6.0 + (currentBpm - 55) * 0.012;
    }

    if (heartAura) {
      const auraOpacity = 0.35 + pulse * 2.0 + (currentBpm - 55) * 0.0025;
      heartAura.style.opacity = Math.min(0.85, auraOpacity).toFixed(3);
      heartAura.style.transform = `translate(-50%, -50%) scale(${(1 + pulse * 1.25).toFixed(3)})`;
    }

    if (bpmIcon) {
      bpmIcon.style.transform = `scale(${(1 + pulse * 2.2).toFixed(2)})`;
    }

    renderer.render(scene, camera);
  }

  // Hook into step transitions to start/stop loop and resize
  window.onStepChange = function(currentStep) {
    if (currentStep === 3) {
      resizeRenderer();
      if (!animId) {
        clock.start();
        renderLoop();
      }
    } else {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  };

  // Start initially if on step 3
  if (step === 3) {
    resizeRenderer();
    renderLoop();
  }
})();

// Arada bir köşeden çıkan kedi; ekranı kaplamaz ve tıklamayı engellemez
const catVisitor = $('#catVisitor');
const catBubble = $('#catBubble');
const catLines = [
  "Tahirə Ali'yi seviyor mu acaba?",
  'Bence bu çocuk bu siteye fazla uğraştı.',
  'Müziği açtın mı? Ben olsam açardım.',
  'Buraya kadar geldiysen merak etmişsin demektir.',
  'Ben hiçbir şey görmedim. Devam et :)',
  'Instagram engeli hâlâ duruyor mu acaba?'
];
function visitCat(){
  if(!catVisitor) return;
  catVisitor.classList.toggle('lefty', Math.random() > .5);
  catBubble.textContent = catLines[Math.floor(Math.random()*catLines.length)];
  catVisitor.classList.add('show');
  setTimeout(()=>catVisitor.classList.remove('show'), 4300);
}
setTimeout(visitCat, 9000);
setInterval(()=>{ if(Math.random()>.38) visitCat(); }, 24000);

// Final bitince yeni bölüm açılır
$('#saveFinal')?.addEventListener('click',()=>{
  setTimeout(()=>show(23), 1500);
});
$$('.after-card').forEach(btn=>btn.addEventListener('click',()=>{
  const type=btn.dataset.after;
  save('final_sonrasi_secim',type);
  if(type==='müzik'){
    show(6);
    setTimeout(()=>toggleMusic(),450);
  }else if(type==='instagram'){
    const url=cfg.instagram_url||cfg.instagramUrl||'https://instagram.com/';
    window.open(url,'_blank','noopener');
  }else{
    show(21);
    setTimeout(()=>$('#message')?.focus(),400);
  }
}));
