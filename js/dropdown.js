// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Select all dropdown buttons
  const dropBtns = document.querySelectorAll(".dropbtn");

  // Function to toggle dropdown content
  function toggleDropdown(event) {
    // Prevent default action
    event.preventDefault();
    // Find the next sibling element which is the dropdown-content
    const dropdownContent = this.nextElementSibling;
    // Toggle the display CSS property
    if (dropdownContent.style.display === "flex") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "flex";
    }
  }

  // Add click event listener to each dropdown button
  dropBtns.forEach((btn) => btn.addEventListener("click", toggleDropdown));
});
