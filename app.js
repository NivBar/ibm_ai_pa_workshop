(()=>{
  "use strict";
  const outputInstruction=`\n\nLOCAL HTML OUTPUT — COMPLETE THIS IN THE SAME RESPONSE:\nDirectly create or update ./NewRetail_Planning_Performance_Dashboard.html in the current workspace. Preserve all previously verified results and integrate this step into the appropriate interactive view. Keep business planning and performance in the foreground: Actual versus Plan, variance drivers, trends, forecast context, scenarios, risks, decisions, and recommendations. Add or refine the visualization best suited to the evidence—not only prose cards. Keep dimensions, hierarchies, rules, feeders, TurboIntegrator processes, dependencies, logs, metrics, outliers, impact analysis, exact coordinates, and fact/inference/unknown labels as expandable technical traceability rather than the headline. Keep all CSS, JavaScript, evidence, and visualizations in this one HTML file. Do not ask me to paste results, click another control, or maintain a separate working note. Do not invent unavailable values. Do not create a Word, PDF, slide, Markdown, or separate report.`;
  const wxoInstruction=`\n\nWATSONX ORCHESTRATE OUTPUT REQUIREMENT:\nThis is a standalone optional activity. Do not assume access to Bob history, prior responses, local files, or the participant workspace. Perform the complete read-only investigation from this prompt and the connected Planning Analytics tools. Return the complete self-contained interactive HTML/CSS/JavaScript dashboard in your response or supported artifact output. Include all evidence needed to understand the result. Do not instruct the user to open, read, or update a local file.`;
  document.querySelector("#architecture h2").textContent="Planning decisions stay at the center";
  document.querySelectorAll("pre,.contribution,code").forEach(element=>{
    element.textContent=element.textContent
      .replaceAll("NewRetail_Model_Health_Dashboard.html","NewRetail_Planning_Performance_Dashboard.html")
      .replaceAll("Planning Analytics Model Health Dashboard","Planning & Performance Dashboard");
  });
  const toast=message=>{const element=document.querySelector("#toast");element.textContent=message;element.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove("show"),1500)};
  const chapterIds=["connect","environment","dependencies","analysis","rootcause","operations","change","documentation","report"];
  const chapterNames=["Connect","Understand","Trace","Analyze","Explain","Operate","Assess change","Document","Assemble"];
  const flow=document.createElement("div");
  flow.className="principle";
  flow.innerHTML=`<strong>Chapter flow</strong><p>${chapterNames.map((name,index)=>`${index+1}. ${name}`).join(" → ")} → Optional wxO</p><p>Within each chapter, choose one or more activities. Activities address different questions but produce compatible evidence for the same next stage.</p>`;
  document.querySelector("#architecture .principle").before(flow);
  chapterIds.forEach((id,index)=>{
    const section=document.querySelector(`#${id}`);
    const activities=section.querySelectorAll(".activity").length;
    const badge=section.querySelector(".section-head>b");
    if(badge)badge.textContent=`Choose 1+ of ${activities}`;
    const note=document.createElement("p");
    note.className="context";
    note.innerHTML=`<strong>Stage ${index+1} of ${chapterIds.length} · ${chapterNames[index]}:</strong> choose any activity that fits your role or question. Run several for broader evidence. Carry verified outputs forward to ${index===chapterIds.length-1?"the final dashboard":"the next chapter"}.`;
    section.querySelector(".section-head").after(note);
  });
  document.querySelectorAll(".activity .prompt pre").forEach(prompt=>{
    const instruction=prompt.closest("#wxo")?wxoInstruction:outputInstruction;
    if(!prompt.textContent.includes("OUTPUT REQUIREMENT:"))prompt.textContent+=instruction;
  });
  document.querySelectorAll(".copy").forEach(button=>button.addEventListener("click",async()=>{
    const prompt=button.parentElement.querySelector("pre");
    try{await navigator.clipboard.writeText(prompt.innerText);toast("Copied")}
    catch{const range=document.createRange();range.selectNodeContents(prompt);getSelection().removeAllRanges();getSelection().addRange(range);toast("Selected—copy manually")}
  }));
})();
