(()=>{
  "use strict";
  const outputInstruction=`\n\nLOCAL HTML OUTPUT — COMPLETE THIS IN THE SAME RESPONSE:\nDirectly create or update ./NewRetail_Planning_Performance_Dashboard.html in the current workspace. Preserve all previously verified results and integrate this step into the appropriate interactive view. Keep business planning and performance in the foreground: Actual versus Plan, variance drivers, trends, forecast context, scenarios, risks, decisions, and recommendations. Add or refine the visualization best suited to the evidence—not only prose cards. Keep dimensions, hierarchies, rules, feeders, TurboIntegrator processes, dependencies, logs, metrics, outliers, impact analysis, exact coordinates, and fact/inference/unknown labels as expandable technical traceability rather than the headline. Keep all CSS, JavaScript, evidence, and visualizations in this one HTML file. Do not ask me to paste results, click another control, or maintain a separate working note. Do not invent unavailable values. Do not create a Word, PDF, slide, Markdown, or separate report.`;
  document.querySelector("#architecture h2").textContent="Planning decisions stay at the center";
  document.querySelectorAll("pre,.contribution,code").forEach(element=>{
    element.textContent=element.textContent
      .replaceAll("NewRetail_Model_Health_Dashboard.html","NewRetail_Planning_Performance_Dashboard.html")
      .replaceAll("Planning Analytics Model Health Dashboard","Planning & Performance Dashboard");
  });
  const toast=message=>{const element=document.querySelector("#toast");element.textContent=message;element.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove("show"),1500)};
  document.querySelectorAll(".activity .prompt pre").forEach(prompt=>{
    if(!prompt.textContent.includes("OUTPUT REQUIREMENT:"))prompt.textContent+=outputInstruction;
  });
  document.querySelectorAll(".copy").forEach(button=>button.addEventListener("click",async()=>{
    const prompt=button.parentElement.querySelector("pre");
    try{await navigator.clipboard.writeText(prompt.innerText);toast("Copied")}
    catch{const range=document.createRange();range.selectNodeContents(prompt);getSelection().removeAllRanges();getSelection().addRange(range);toast("Selected—copy manually")}
  }));
})();
