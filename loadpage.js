 // When the user clicks on div, open the popup
 function popFunction1() {
    var popup = document.getElementById("myPopup1");
    popup.classList.toggle("show");
}
function popFunction2() {
    var popup = document.getElementById("myPopup2");
    popup.classList.toggle("show");
}

//check if character has been created
function charExist(herosprite) {
    let qCheck = herosprite.includes("questionmark");
    if(qCheck == true){
        window.location.href = "charCreate.html";
    }
    else{
        window.location.href = "uigp.html"
    }
}

document.getElementById("submit1").onclick = function(){
    let herosprite = document.getElementById("herosprite1").src;
    charExist(herosprite);
}
document.getElementById("submit2").onclick = function(){
    let herosprite = document.getElementById("herosprite2").src;
    charExist(herosprite);
}
document.getElementById("submit3").onclick = function(){
    let herosprite = document.getElementById("herosprite3").src;
    charExist(herosprite);
}