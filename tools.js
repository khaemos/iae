const toolsBody=document.body;
const toolsNavToggle=document.querySelector("[data-nav-toggle]");
toolsNavToggle?.addEventListener("click",()=>{
  toolsBody.classList.toggle("nav-open");
  toolsNavToggle.setAttribute("aria-label",toolsBody.classList.contains("nav-open")?"Close navigation":"Open navigation");
});
document.querySelectorAll(".nav a").forEach(link=>link.addEventListener("click",()=>toolsBody.classList.remove("nav-open")));
// IAE engineering tools
const siteColpittsForm=document.querySelector("[data-site-colpitts-form]");
let siteColpittsMode="analyze";
let siteColpittsSummary="";
function siteMetric(value,kind){
  if(!Number.isFinite(value))return "-";
  const sets={frequency:[[1e6,"MHz"],[1e3,"kHz"],[1,"Hz"]],capacitance:[[1e-6,"uF"],[1e-9,"nF"],[1e-12,"pF"]],inductance:[[1,"H"],[1e-3,"mH"],[1e-6,"uH"]],time:[[1,"s"],[1e-3,"ms"],[1e-6,"us"],[1e-9,"ns"]],impedance:[[1e6,"Mohm"],[1e3,"kohm"],[1,"ohm"]]};
  const set=sets[kind],unit=set.find(item=>Math.abs(value)>=item[0])||set[set.length-1];
  return (value/unit[0]).toLocaleString(undefined,{maximumSignificantDigits:5})+" "+unit[1];
}
function calculateSiteColpitts(){
  if(!siteColpittsForm)return;
  const d=new FormData(siteColpittsForm),c1=+d.get("c1")*+d.get("c1Unit"),c2=+d.get("c2")*+d.get("c2Unit");
  const third=siteColpittsMode==="analyze"?+d.get("inductance")*+d.get("inductanceUnit"):+d.get("targetFrequency")*+d.get("frequencyUnit");
  const vplus=+d.get("vplus")*+d.get("vplusUnit"),r1=+d.get("r1")*+d.get("r1Unit"),r2=+d.get("r2")*+d.get("r2Unit");
  const valid=[c1,c2,third,vplus,r1,r2].every(value=>Number.isFinite(value)&&value>0);
  document.querySelector("[data-site-colpitts-warning]").hidden=valid;
  if(!valid){document.querySelectorAll("[data-site-result]").forEach(node=>node.textContent="-");document.querySelector("[data-site-primary-value]").textContent="-";siteColpittsSummary="";return}
  const ct=c1*c2/(c1+c2),frequency=siteColpittsMode==="analyze"?1/(2*Math.PI*Math.sqrt(third*ct)):third;
  const inductance=siteColpittsMode==="analyze"?third:1/(Math.pow(2*Math.PI*frequency,2)*ct),beta=c1/c2,gain=1/beta,period=1/frequency;
  const xc1=1/(2*Math.PI*frequency*c1),xc2=1/(2*Math.PI*frequency*c2),xl=2*Math.PI*frequency*inductance,vr2=vplus*r2/(r1+r2);
  document.querySelector("[data-site-primary-label]").textContent=siteColpittsMode==="analyze"?"Resonant frequency":"Required inductance";
  document.querySelector("[data-site-primary-value]").textContent=siteColpittsMode==="analyze"?siteMetric(frequency,"frequency"):siteMetric(inductance,"inductance");
  document.querySelector("[data-site-primary-note]").textContent=siteColpittsMode==="analyze"?"Ideal unloaded tank":"For "+siteMetric(frequency,"frequency")+" target";
  const put=(key,value)=>document.querySelector('[data-site-result="'+key+'"]').textContent=value;
  put("ct",siteMetric(ct,"capacitance"));put("beta",beta.toPrecision(5)+" ("+(beta*100).toPrecision(4)+"%)");put("gain",gain.toPrecision(5)+" V/V");put("period",siteMetric(period,"time"));put("xc1",siteMetric(xc1,"impedance"));put("xc2",siteMetric(xc2,"impedance"));put("vr2",vr2.toPrecision(5)+" V");put("xl",siteMetric(xl,"impedance")+" = "+siteMetric(xc1+xc2,"impedance"));
  siteColpittsSummary=["IAE / Colpitts Oscillator Calculation","Mode: "+(siteColpittsMode==="analyze"?"Analyze existing tank":"Design for target frequency"),"C1: "+siteMetric(c1,"capacitance"),"C2: "+siteMetric(c2,"capacitance"),"Equivalent capacitance: "+siteMetric(ct,"capacitance"),"Resonant frequency: "+siteMetric(frequency,"frequency"),"Inductance: "+siteMetric(inductance,"inductance"),"Feedback fraction: "+beta.toPrecision(5),"Estimated minimum gain: "+gain.toPrecision(5)+" V/V","Oscillation period: "+siteMetric(period,"time"),"XC1: "+siteMetric(xc1,"impedance"),"XC2: "+siteMetric(xc2,"impedance"),"XL: "+siteMetric(xl,"impedance"),"Resonance check (XC1 + XC2): "+siteMetric(xc1+xc2,"impedance"),"Supply V+: "+vplus.toPrecision(5)+" V","R1: "+siteMetric(r1,"impedance"),"R2: "+siteMetric(r2,"impedance"),"DC bias VR2: "+vr2.toPrecision(5)+" V"].join("\n");
}
function setSiteColpittsMode(mode){
  siteColpittsMode=mode;
  document.querySelectorAll("[data-site-colpitts-mode]").forEach(button=>{const active=button.dataset.siteColpittsMode===mode;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});
  document.querySelectorAll(".iae-analyze-field").forEach(field=>field.hidden=mode!=="analyze");
  document.querySelectorAll(".iae-design-field").forEach(field=>field.hidden=mode!=="design");
  calculateSiteColpitts();
}
siteColpittsForm?.addEventListener("input",calculateSiteColpitts);
siteColpittsForm?.addEventListener("change",calculateSiteColpitts);
document.addEventListener("click",event=>{
  const button=event.target.closest("button");if(!button)return;
  if(button.matches("[data-open-colpitts]")){document.querySelector("[data-iae-tool-catalog]").hidden=true;document.querySelector("[data-colpitts-workspace]").hidden=false;calculateSiteColpitts();document.querySelector("#tools").scrollIntoView({behavior:"smooth"})}
  if(button.matches("[data-close-colpitts]")){document.querySelector("[data-colpitts-workspace]").hidden=true;document.querySelector("[data-iae-tool-catalog]").hidden=false;document.querySelector("#tools").scrollIntoView({behavior:"smooth"})}
  if(button.matches("[data-site-colpitts-mode]"))setSiteColpittsMode(button.dataset.siteColpittsMode);
  if(button.matches("[data-site-colpitts-reset]")){siteColpittsForm.reset();setSiteColpittsMode("analyze")}
  if(button.matches("[data-site-swap-capacitors]")){const value=siteColpittsForm.elements.c1.value,unit=siteColpittsForm.elements.c1Unit.value;siteColpittsForm.elements.c1.value=siteColpittsForm.elements.c2.value;siteColpittsForm.elements.c1Unit.value=siteColpittsForm.elements.c2Unit.value;siteColpittsForm.elements.c2.value=value;siteColpittsForm.elements.c2Unit.value=unit;calculateSiteColpitts()}
  if(button.matches("[data-site-copy-colpitts]")&&siteColpittsSummary){navigator.clipboard.writeText(siteColpittsSummary).then(()=>{const original=button.textContent;button.textContent="Calculation copied";setTimeout(()=>button.textContent=original,1600)})}
});
calculateSiteColpitts();