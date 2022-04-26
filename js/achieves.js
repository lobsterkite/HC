(function () {
let parentCategories = achieveData.categories.filter(x=>x[2]==-1);
function getChildrenCategories(parent){
  return achieveData.categories.filter(x=>x[2]==parent).filter(onlyUnique);
}
function onlyUnique(value, index, self) {
  return self.findIndex(x=>x[0]==value[0])==index;
}
function editDistance(s1, s2) {
  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
function similarity(s1, s2) {
  var longer = s1.toLowerCase().replace(/ \(([0-9]{2} player\))/,'');
  var shorter = s2.toLowerCase().replace(/ \(([0-9]{2} player\))/,'');
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
function buildCategoryAchievements(cat,subcat){
  if(cat=="Rewards Only"){
    if(subcat=="Titles"){
      return Object.values(achieveData.achievements).filter(x=>x.reward.indexOf('Title')>-1);
    }
    else{
      return Object.values(achieveData.achievements).filter(x=>(x.reward!='' && !x.reward.startsWith('Title')));
    }
  }
  return Object.values(achieveData.achievements).filter(x=>x.category==cat && (x.subCategory==subcat || (subcat=='' && !x.subCategory)));
}

function init(){
  let parentCat = document.getElementById("parentCat");
  let childCats = document.getElementById("childCats");
  let achieves = document.getElementById("achievements");
  let i =0;
  parentCategories.push(["Rewards Only","Rewards Only"]);
  for (let parent of parentCategories){
    let button = document.createElement('button');
    button.classList.add('nav-link');
    let linkTarget = "category" + parent[0].replace(/[^A-Z0-9]+/ig, "");
    button.setAttribute("aria-controls",linkTarget);
    button.setAttribute("data-bs-target","#"+linkTarget);
    button.setAttribute("data-bs-toggle", "pill");
    button.setAttribute("type", "button");
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", "false");
    if(i==0){
      button.classList.add('active');
      button.setAttribute("aria-selected", "true");
    }
    button.innerText=parent[0];
    parentCat.appendChild(button);
    
  
    let childrenCats = getChildrenCategories(parent[1]);
    if(parent[1]=="Rewards Only"){
      childrenCats.push(['Titles','Titles']);
      childrenCats.push(['Other','Other']);
    }
    else{
      childrenCats.unshift(['','','','']);
    }
    let childCatDiv = document.createElement("div");
    let childCatContent = document.createElement("div");
    let childCatPane = document.createElement("div");
    childCatPane.classList.add("tab-pane","fade");
    childCatPane.setAttribute("role","tabpanel");
    childCatPane.id = linkTarget;
    childCatContent.classList.add("tab-content");
    childCatDiv.id="sub"+parent[0];
    childCatDiv.classList.add("nav","flex-column","nav-pills","me-3");
    childCatDiv.setAttribute("role", "tablist");
    if(i==0){
      childCatPane.classList.add('show','active');
    }
    for (let child of childrenCats){
      let button = document.createElement('button');
      button.classList.add('nav-link');
      //button.setAttribute("aria-controls","linkTarget");
      //button.setAttribute("data-bs-target","#"+linkTarget);
      //button.setAttribute("data-bs-toggle", "pill");
      let categoryTarget = (parent[0]+child[0]).replace(/[^A-Z0-9]+/ig, "");
      button.setAttribute("type", "button");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("aria-controls",categoryTarget);
      button.setAttribute("data-bs-target","#"+categoryTarget);
      button.setAttribute("data-bs-toggle", "pill");
      button.innerText = child[0] == '' ? 'General' : child[0];
      childCatDiv.appendChild(button);

      //build out each individual achievement for this category
      let categoryAchievesPane = document.createElement("div");
      categoryAchievesPane.id = categoryTarget;
      categoryAchievesPane.classList.add("tab-pane","fade");
      categoryAchievesPane.setAttribute("role","tabpanel");
      categoryAchievesPane.id = categoryTarget;
      let categoryAchieves = buildCategoryAchievements(parent[1], child[1]);
      let achieveList = document.createElement("ul");
      achieveList.classList.add("list-group");
        for (let achieve of categoryAchieves){
          let achieveBadge = document.createElement("span");
          let achieveCard = document.createElement("card");
          let achieveHeader = document.createElement("div");
          let achieveTitle = document.createElement("a");
          let achieveBody = document.createElement("div");
          let achieveText = document.createElement("p");

          achieveBadge.classList.add("badge", "rounded-pill", "me-2");
          if(achieve.points<=5){
            achieveBadge.classList.add("bg-secondary");
          }
          else if(achieve.points<=10){
            achieveBadge.classList.add("bg-success");
          }
          else if(achieve.points<=15){
            achieveBadge.classList.add("bg-primary");
          }
          else{
            achieveBadge.classList.add("bg-warning");
          }
          achieveBadge.innerText=achieve.points;
          
          achieveText.innerText = achieve.desc;
          achieveText.classList.add("card-text");

          achieveTitle.innerText=achieve.title;
          achieveTitle.href = 'https://www.wowhead.com/achievement=' + achieve.id;
          achieveTitle.target = '_blank';
          achieveTitleContainer = document.createElement("h5");
          achieveTitleContainer.appendChild(achieveTitle);
          achieveHeader.classList.add("card-header", "d-flex");

          achieveHeader.appendChild(achieveBadge);
          achieveHeader.appendChild(achieveTitleContainer);

          achieveCard.appendChild(achieveHeader);
          achieveBody.appendChild(achieveText);

          if(!!achieve.criteria & achieve.criteria!=achieve.desc){
            //make list of critera in 2 columns
            let critContainer = document.createElement("div");
            critContainer.classList.add("d-flex","flex-wrap","justify-content-start");
            if(achieve.reward!=''){
              critContainer.classList.add("mb-5");
            }
            let added = false;
            for (let crit of achieve.criteria){
              let criteriaItem = document.createElement("div");
              criteriaItem.classList.add("p-2","border","border-secondary","rounded");
              let parentAchieve = achieveData.achievements[crit[0]];
              if(!!parentAchieve){
                if(similarity(parentAchieve.title, crit[1])>=.9){
                criteriaItem.innerText=parentAchieve.desc;
                added = true;
                }
              }
              /*else{
              criteriaItem.innerText=crit[1];
              }*/
              critContainer.appendChild(criteriaItem);
            }
            if(added){
            achieveBody.appendChild(critContainer);
            }
          }


          if(achieve.reward!=''){
            let achieveReward = document.createElement("footer");
            achieveReward.classList.add("blockquote-footer");
            achieveReward.innerText=achieve.reward;
            achieveBody.appendChild(achieveReward);
          }
          achieveCard.appendChild(achieveBody);
          achieveListItem = document.createElement("li");
          achieveListItem.classList.add("list-group-item");
          achieveListItem.appendChild(achieveCard);
          achieveList.appendChild(achieveListItem);
        }
      categoryAchievesPane.appendChild(achieveList);
      achieves.appendChild(categoryAchievesPane);


    }
    childCatPane.appendChild(childCatDiv);
    //childCatContent.appendChild(childCatPane);
    childCats.appendChild(childCatPane);
    i++;
  }

  parentCat.childNodes.forEach((a,b)=>{a.addEventListener("click",function(){
    setTimeout(function() {
      childCats.querySelector('.active.show button').click();
    }, 250);
  })})
  //show first
  setTimeout(function() {
    childCats.querySelector('.active.show button').click();
  }, 250);
}
init();
})();