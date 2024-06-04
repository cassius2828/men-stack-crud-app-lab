const hamburger = document.querySelector(".hamburger-container");
const bar = document.querySelector(".bar");
const sidebar = document.querySelector('.sidebar')
console.log(hamburger)
hamburger.addEventListener('click', (e) => {
    bar.classList.toggle('close');
    sidebar.classList.toggle('hide')
    console.log('closed')
    console.log(e.target)
})
