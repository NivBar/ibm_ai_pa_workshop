(()=>{
  "use strict";
  const storageKey="pa-workshop-dashboard-v1";
  const labels={executive:"Executive",model:"Model",analysis:"Analysis",operations:"Operations",change:"Change",evidence:"Connection & evidence"};
  const categoryBySection={connect:"evidence",environment:"model",dependencies:"model",analysis:"analysis",rootcause:"analysis",operations:"operations",change:"change",documentation:"executive",report:"executive",wxo:"executive"};
  const $=selector=>document.querySelector(selector);
  const toast=message=>{const element=$("#toast");element.textContent=message;element.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove("show"),1800)};
  const readEntries=()=>{try{const value=JSON.parse(localStorage.getItem(storageKey)||"[]");return Array.isArray(value)?value:[]}catch{return []}};
  let entries=readEntries();
  const save=()=>localStorage.setItem(storageKey,JSON.stringify(entries));
  const dialog=$("#captureDialog");
  const form=$("#captureForm");

  document.querySelectorAll(".copy").forEach(button=>button.addEventListener("click",async()=>{
    const prompt=button.parentElement.querySelector("pre");
    try{await navigator.clipboard.writeText(prompt.innerText);toast("Copied")}
    catch{const range=document.createRange();range.selectNodeContents(prompt);getSelection().removeAllRanges();getSelection().addRange(range);toast("Selected—copy manually")}
  }));

  document.querySelectorAll(".activity").forEach(activity=>{
    const section=activity.closest("section[id]");
    if(!section)return;
    const button=document.createElement("button");
    button.type="button";
    button.className="append-result";
    button.textContent="Append Bob result to dashboard";
    button.addEventListener("click",()=>openCapture({
      module:section.id,
      moduleTitle:section.querySelector(".section-head h2")?.textContent||section.querySelector("h2")?.textContent||"Optional session",
      activityTitle:activity.querySelector("h3")?.textContent||"Workshop activity",
      category:categoryBySection[section.id]||"evidence"
    }));
    activity.append(button);
  });

  function openCapture(data){
    $("#entryId").value=data.id||"";
    $("#entryModule").value=data.module;
    $("#entryModuleTitle").value=data.moduleTitle;
    $("#captureHeading").textContent=data.activityTitle;
    $("#captureHeading").dataset.activityTitle=data.activityTitle;
    $("#entryCategory").value=data.category;
    $("#entryClassification").value=data.classification||"fact";
    $("#entrySource").value=data.source||"";
    $("#entryContent").value=data.content||"";
    dialog.showModal();
    $("#entryContent").focus();
  }

  document.querySelectorAll(".dialog-close").forEach(button=>button.addEventListener("click",()=>dialog.close()));
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const id=$("#entryId").value;
    const item={
      id:id||crypto.randomUUID(),
      module:$("#entryModule").value,
      moduleTitle:$("#entryModuleTitle").value,
      activityTitle:$("#captureHeading").dataset.activityTitle,
      category:$("#entryCategory").value,
      classification:$("#entryClassification").value,
      source:$("#entrySource").value.trim(),
      content:$("#entryContent").value.trim()
    };
    if(id)entries=entries.map(entry=>entry.id===id?item:entry);else entries.push(item);
    save();render();dialog.close();toast(id?"Evidence updated":"Result appended to dashboard");
    location.hash="workspace";
  });

  function render(){
    const search=$("#dashboardSearch").value.trim().toLowerCase();
    const category=$("#dashboardCategory").value;
    const filtered=entries.filter(entry=>(category==="all"||entry.category===category)&&[entry.moduleTitle,entry.activityTitle,entry.source,entry.content,entry.classification].join(" ").toLowerCase().includes(search));
    $("#kpiTotal").textContent=entries.length;
    $("#kpiFacts").textContent=entries.filter(entry=>entry.classification==="fact").length;
    $("#kpiModules").textContent=new Set(entries.map(entry=>entry.module)).size;
    $("#kpiUnknowns").textContent=entries.filter(entry=>entry.classification==="unknown").length;
    const strip=$("#categoryStrip");strip.replaceChildren();
    Object.entries(labels).forEach(([key,label])=>{const button=document.createElement("button");button.type="button";button.dataset.active=category===key;button.innerHTML=`<span>${label}</span><strong>${entries.filter(entry=>entry.category===key).length}</strong>`;button.addEventListener("click",()=>{$("#dashboardCategory").value=category===key?"all":key;render()});strip.append(button)});
    const container=$("#dashboardEntries");container.replaceChildren();
    if(!filtered.length){const empty=document.createElement("div");empty.className="dashboard-empty";empty.innerHTML=entries.length?"<strong>No evidence matches these filters.</strong><p>Change the search or dashboard view.</p>":"<strong>Your dashboard is ready to build.</strong><p>Run the first prompt in Bob, then use <em>Append Bob result to dashboard</em> beneath that activity.</p>";container.append(empty);return}
    filtered.forEach(entry=>{
      const card=document.createElement("article");card.className=`evidence-card ${entry.classification}`;
      const top=document.createElement("div");top.className="evidence-top";
      const meta=document.createElement("div");
      const categoryBadge=document.createElement("span");categoryBadge.className="category-badge";categoryBadge.textContent=labels[entry.category];
      const classBadge=document.createElement("span");classBadge.className="class-badge";classBadge.textContent=entry.classification==="fact"?"Verified fact":entry.classification==="inference"?"Inference":"Unknown";
      meta.append(categoryBadge,classBadge);
      const actions=document.createElement("div");actions.className="entry-actions";
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";edit.addEventListener("click",()=>openCapture(entry));
      const remove=document.createElement("button");remove.type="button";remove.textContent="Remove";remove.addEventListener("click",()=>{if(confirm("Remove this evidence item from the dashboard?")){entries=entries.filter(item=>item.id!==entry.id);save();render();toast("Evidence removed")}});
      actions.append(edit,remove);top.append(meta,actions);
      const title=document.createElement("h3");title.textContent=entry.activityTitle;
      const module=document.createElement("p");module.className="entry-module";module.textContent=entry.moduleTitle;
      const content=document.createElement("div");content.className="entry-content";content.textContent=entry.content;
      card.append(top,title,module,content);
      if(entry.source){const source=document.createElement("p");source.className="entry-source";source.textContent=`Source: ${entry.source}`;card.append(source)}
      container.append(card);
    });
  }

  $("#dashboardSearch").addEventListener("input",render);
  $("#dashboardCategory").addEventListener("change",render);
  $("#clearDashboard").addEventListener("click",()=>{if(entries.length&&confirm("Clear every saved dashboard item from this browser?")){entries=[];save();render();toast("Dashboard cleared")}});
  $("#exportDashboard").addEventListener("click",()=>{
    if(!entries.length){toast("Append at least one Bob result first");return}
    const escape=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const cards=entries.map(entry=>`<article data-category="${escape(entry.category)}"><div class="badges"><span>${escape(labels[entry.category])}</span><b class="${escape(entry.classification)}">${escape(entry.classification)}</b></div><h2>${escape(entry.activityTitle)}</h2><small>${escape(entry.moduleTitle)}</small><pre>${escape(entry.content)}</pre>${entry.source?`<p>Source: ${escape(entry.source)}</p>`:""}</article>`).join("");
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NewRetail Model Health Dashboard</title><style>body{margin:0;background:#f4f7fb;color:#101828;font:15px/1.5 system-ui}header{padding:42px max(24px,calc((100vw - 1100px)/2));background:linear-gradient(135deg,#07172d,#174a84);color:white}header h1{font-size:42px;margin:0}nav,main{max-width:1100px;margin:auto;padding:20px}button{margin:4px;padding:9px 13px;border:1px solid #a6c8ff;border-radius:20px;background:white;cursor:pointer}button.active{background:#0f62fe;color:white}main{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}article{padding:22px;border:1px solid #d8e1ec;border-radius:12px;background:white;box-shadow:0 10px 30px #0f172a10}article h2{margin:12px 0 2px}.badges{display:flex;gap:8px}.badges span,.badges b{padding:4px 8px;border-radius:20px;background:#edf5ff;color:#0043ce;font-size:11px;text-transform:uppercase}.badges .inference{background:#fff8e1;color:#8e5a00}.badges .unknown{background:#fff1f1;color:#a2191f}pre{white-space:pre-wrap;font:14px/1.55 system-ui}small,article p{color:#526176}@media(max-width:700px){main{grid-template-columns:1fr}header h1{font-size:32px}}</style></head><body><header><p>Planning Analytics · NewRetail</p><h1>Model Health Dashboard</h1><p>${entries.length} evidence items · evidence, inference, and unknowns remain explicit</p></header><nav><button class="active" data-filter="all">All</button>${Object.entries(labels).map(([key,label])=>`<button data-filter="${key}">${label}</button>`).join("")}</nav><main>${cards}</main><script>document.querySelectorAll("button").forEach(b=>b.onclick=()=>{document.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll("article").forEach(c=>c.hidden=b.dataset.filter!=="all"&&c.dataset.category!==b.dataset.filter)})<\/script></body></html>`;
    const blob=new Blob([html],{type:"text/html"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="newretail-model-health-dashboard.html";link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);toast("Interactive dashboard downloaded");
  });
  render();
})();
