let rows = 6;
let cols = 10;
const grid = document.getElementById("grid");
const studentCount = document.getElementById("studentCount");

// 격자 생성
function createGrid() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 50px)`;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell = document.createElement("div");
      cell.className="cell";
      cell.dataset.active="false";
      cell.onclick=()=>toggleCell(cell);
      grid.appendChild(cell);
    }
  }
  updateStudentCount();
}
createGrid();

function updateStudentCount(){
  const count=document.querySelectorAll(".cell[data-active='true']").length;
  studentCount.innerText=`학생 수: ${count}`;
}

function toggleCell(cell){
  if(cell.dataset.active==="false"){
    cell.dataset.active="true";
    cell.classList.add("active");
    cell.classList.remove("assigned");
  } else {
    cell.dataset.active="false";
    cell.classList.remove("active","assigned");
    cell.innerText="";
  }
  updateStudentCount();
}

// 드래그/터치 관련
let isDragging=false, dragMode=null, dragStartCell=null, lastTouchedCell=null, touchStartCell=null;
grid.addEventListener('mousedown',e=>{
  if(e.target.classList.contains('cell')){
    isDragging=true;
    dragStartCell=e.target;
    dragMode=e.target.dataset.active==="true"?"off":"on";
    toggleCellByDrag(e.target);
  }
});
grid.addEventListener('mouseover',e=>{ if(isDragging && e.target.classList.contains('cell')) toggleCellByDrag(e.target); });
window.addEventListener('mouseup',e=>{ if(isDragging && dragStartCell && e.target===dragStartCell) toggleCell(dragStartCell); isDragging=false; dragMode=null; dragStartCell=null; });

grid.addEventListener('touchstart',e=>{
  const touch=e.touches[0];
  const target=document.elementFromPoint(touch.clientX,touch.clientY);
  if(target && target.classList.contains('cell')){
    isDragging=true;
    dragMode=target.dataset.active==="true"?"off":"on";
    lastTouchedCell=target;
    touchStartCell=target;
    toggleCellByDrag(target);
  }
});
grid.addEventListener('touchmove',e=>{
  if(!isDragging) return;
  const touch=e.touches[0];
  const target=document.elementFromPoint(touch.clientX,touch.clientY);
  if(target && target.classList.contains('cell') && target!==lastTouchedCell){
    toggleCellByDrag(target);
    lastTouchedCell=target;
  }
});
window.addEventListener('touchend',e=>{
  if(isDragging && touchStartCell && lastTouchedCell===touchStartCell) toggleCell(touchStartCell);
  isDragging=false; dragMode=null; lastTouchedCell=null; touchStartCell=null;
});

function toggleCellByDrag(cell){
  if(dragMode==="on" && cell.dataset.active==="false"){
    cell.dataset.active="true";
    cell.classList.add("active");
    cell.classList.remove("assigned");
    updateStudentCount();
  } else if(dragMode==="off" && cell.dataset.active==="true"){
    cell.dataset.active="false";
    cell.classList.remove("active","assigned");
    cell.innerText="";
    updateStudentCount();
  }
}

// 자리 배정
function assignSeats(){
  const activeCells=Array.from(document.querySelectorAll(".cell[data-active='true']"));
  const total=activeCells.length;
  if(total===0){ alert("활성화된 자리가 없습니다!"); return; }

  const dramatic=document.getElementById('dramaticMode').checked;
  const numbers=Array.from({length:total},(_,i)=>i+1);
  shuffle(numbers);

  document.querySelectorAll(".cell.assigned").forEach(cell=>cell.classList.remove("assigned"));

  if(!dramatic){
    activeCells.forEach((cell,i)=>{
      cell.innerText=numbers[i];
      cell.classList.add("assigned");
    });
    return;
  }

  const minDelay=1.2, maxDelay=1.6, baseSteps=24;
  const cellSteps=activeCells.map(()=>Math.floor(baseSteps*(minDelay+Math.random()*(maxDelay-minDelay))));
  let currentStep=0, interval=8;

  activeCells.forEach(cell=>cell.classList.add('shaking'));

  function rollingStep(){
    activeCells.forEach((cell,i)=>{
      if(currentStep<cellSteps[i]){
        cell.innerText=Math.floor(Math.random()*total)+1;
        cell.classList.remove('fade-slide'); void cell.offsetWidth; cell.classList.add('fade-slide');
      } else if(!cell.classList.contains('assigned')){
        cell.innerText=numbers[i];
        cell.classList.remove('shaking');
        cell.classList.add("assigned");
        cell.classList.remove('fade-slide'); void cell.offsetWidth; cell.classList.add('fade-slide');
        cell.style.transition="box-shadow 0.4s, background 0.4s";
        cell.style.boxShadow="0 0 24px 6px #43e97b88";
        setTimeout(()=>{cell.style.boxShadow=""; cell.style.transition="";},700);
        cell.onclick=()=>toggleCell(cell);
      }
    });
    currentStep++;
    if(activeCells.every((cell,i)=>cell.classList.contains('assigned'))) return;
    const progress=currentStep/(baseSteps*maxDelay);
    interval=8+Math.pow(progress,2.5)*120;
    setTimeout(rollingStep,interval);
  }
  rollingStep();
}

function resetAllCells(){
  document.querySelectorAll('.cell').forEach(cell=>{
    cell.dataset.active="false";
    cell.classList.remove("active","assigned");
    cell.innerText="";
  });
  updateStudentCount();
}

// Fisher-Yates shuffle
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
}

// 시계
function updateClock(){
  const now=new Date();
  const options={timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'};
  const kor=now.toLocaleString('ko-KR',options);
  document.getElementById('clock').innerText=`현재 시각: ${kor}`;
}
setInterval(updateClock,1000);
updateClock();
updateStudentCount();
