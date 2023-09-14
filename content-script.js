window.addEventListener("load",()=>{
    let head =document.querySelector("head");    
let meta=document.createElement("meta");
meta.name="viewport";
meta.setAttribute("content",`width=device-width, initial-scale=1.0`);
head.appendChild(meta);
    let loginInp=document.querySelector("#loginB1");

    if( loginInp === null){
    console.log("auth")
let parser  = new DOMParser();
let select=document.querySelector(".search .select2-selection");
let searchInp=document.querySelector("#search");
let searchInpBtn=document.querySelector(".search input[type='button']");
let div=Array.from(document.querySelectorAll("div"))||[0];
let btnsWraper=document.querySelector(".buttons");
let selectButtons=Array.from(document.querySelectorAll('.buttons input[type="button"]'))||[0];
let buttonsToggler=document.createElement("button");
let tableWraper=document.querySelector("#mainDiv");
buttonsToggler.textContent="Опції";
buttonsToggler.className="buttons-toggler";
btnsWraper.prepend(buttonsToggler);


// set select width
select.style.width="100%";
// set styles for search input
searchInp.style.padding="10px";
searchInp.style.fontsize="18px";
searchInp.style.fontWeight="600";
// set styles search input button
searchInpBtn.style.width="20%";
searchInpBtn.style.padding="10px";
// remove padding and set width 100%
btnsWraper.parentNode.style.paddingLeft="0px";
btnsWraper.parentNode.style.width="100%";
// set top margin for buttons wraper
btnsWraper.style.marginTop="70px";
btnsWraper.classList.add("hide-buttons");

// remove blue div
div.forEach((el)=>{
if(el.textContent.includes("Склад (Василенка)")&& el.style.borderRadius=="5px"){
el.style.display="none";
}
})
buttonsToggler.addEventListener('click',()=>{
btnsWraper.classList.toggle("hide-buttons");
});   }
});
fetch().then((responce)=>{
 return responce;
}).then((responce)=>{
    console.log(responce);
}).catch((err)=>{
console.log(err)
})
let parseGetedHTML=(data)=>{
    let getedText;
    fetch(data.url,{
        method: data.method
    }).then((responce)=>{
return responce;
    }).then((responce)=>{
getedText=responce.text();
    });

    let doc = parser.parseFromString(getedText, 'text/html');
    return doc;
}

function search(search_sel,search,page){
    if(typeof search=='undefined') 
    var search = $('#search').val();
    if(typeof search_sel=='undefined'){
        var search_sel = $('#search_sel').val();
        var test = '0';   
    }
    else var test = 1;
    
    if(page=='undefined') var page = 0;
    
    if(search.length>1 || test==1){
        $('#loader').show();
        $.post("https://baza.m-p.in.ua/ajax/search.php",{ search: search, search_sel: search_sel, page: page },function(data){
            $('#mainDiv').html(data);
            $('#loader').hide();
            if(page>0) $(window).scrollTop( 200 );
        }); 
    }
    else alert('Для пошуку потрібно мінімум 2 символи');
}