function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function() {
  let index = 0;
  const items = document.querySelectorAll('.carousel-item');
  const totalItems = items.length;

  function showNextItem() {
      items[index].classList.remove('active');
      index = (index + 1) % totalItems;
      items[index].classList.add('active');
  }

  function startCarousel() {
      setInterval(showNextItem, 3000); // Change slide every 3 seconds
  }

  startCarousel();
});
