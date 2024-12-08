document.addEventListener("DOMContentLoaded", async function () {
    const originDropdown = document.getElementById("origin-dropdown");
    const destinationDropdown = document.getElementById("destination-dropdown");

    // Function to attach dropdown to input field
    function attachDropdown(inputField) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('custom-dropdown');
        dropdownContainer.style.position = 'absolute';
        dropdownContainer.style.zIndex = '1000';
        dropdownContainer.style.backgroundColor = 'white';
        dropdownContainer.style.border = '1px solid #ccc';
        dropdownContainer.style.width = `${inputField.offsetWidth}px`;
        dropdownContainer.style.maxHeight = '150px';
        dropdownContainer.style.overflowY = 'auto';
        dropdownContainer.style.display = 'none'; // Ensure dropdown is hidden initially
        document.body.appendChild(dropdownContainer);

        // Event listener to show dropdown on input focus
        inputField.addEventListener('focus', function () {
            const rect = inputField.getBoundingClientRect();
            dropdownContainer.style.top = `${window.scrollY + rect.bottom}px`;
            dropdownContainer.style.left = `${window.scrollX + rect.left}px`;
            dropdownContainer.style.display = 'block'; // Show dropdown on focus
        });

        // Event listener to hide dropdown on blur
        inputField.addEventListener('blur', function () {
            setTimeout(() => {
                dropdownContainer.style.display = 'none'; // Hide dropdown after blur
            }, 200); // Slight delay to allow selection
        });

        // Populate dropdown logic here (e.g., with airports)
        // ...
    }

    // Attach dropdowns to both input fields
    attachDropdown(originDropdown);
    attachDropdown(destinationDropdown);
});
