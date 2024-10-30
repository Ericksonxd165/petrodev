const d =document;

export default function toggler(element1,element2,buton){

d.addEventListener("click",e=>{

if(e.target.matches(buton)){

d.getElementById(element1).classList.toggle('invisible')
d.getElementById(element2).classList.toggle('invisible')



}


})
 }