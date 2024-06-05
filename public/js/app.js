const hamburger = document.querySelector(".hamburger-container");
const bar = document.querySelector(".bar");
const sidebar = document.querySelector('.sidebar')
const canvasContainer = document.querySelector('.canvas-container')
const galleriesTitle = document.querySelector('.galleries-title')

console.log(hamburger)
hamburger.addEventListener('click', (e) => {
    bar.classList.toggle('close');
    sidebar.classList.toggle('hide')
    canvasContainer.classList.toggle('full')
    galleriesTitle.classList.toggle('full')
    console.log('closed')
    console.log(e.target)
})
