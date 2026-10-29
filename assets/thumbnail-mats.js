/* Neutral portrait frames. Trim only near-identical aspect ratios to remove pixel-wide seams. */
(() => {
  const prepare=img=>{
    const frame=img.parentElement;if(!frame)return;
    frame.classList.add('thumbnail-mat');
    if(img.dataset.framePrepared)return;img.dataset.framePrepared='yes';
    const size=()=>{if(img.naturalWidth&&img.naturalHeight)frame.classList.toggle('thumbnail-close-fit',Math.abs(img.naturalWidth/img.naturalHeight/(3/4)-1)<=.025)};
    img.addEventListener('load',size);if(img.complete)size();
  };
  for(const id of ['gallery-cards-grid','catalog-grid','board-highlights-grid']){const grid=document.getElementById(id);if(!grid)continue;const decorate=()=>grid.querySelectorAll('img').forEach(prepare);decorate();new MutationObserver(decorate).observe(grid,{childList:true});}
})();
