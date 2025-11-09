/* =========================================================
   PROJECT 3: Ticket Purchasing – event_registration.js
   -----------------------------------------------------
   - Do NOT modify your HTML/CSS. Only use this JS file.
   - This file implements:
     1) A 10-minute countdown timer (global code, not inside a function)
     2) calculateTotal() – validates ticket count (1–3) and shows total
     3) completePurchase() – validates name/email, thanks the user, stops timer
     4) Visual error cues + messages; show/hide contact section based on validity
   - Every line is commented to explain its purpose, per assignment requirement.
   ========================================================= */

/* ------------------------------
   CONFIGURATION / SELECT HELPERS
   ------------------------------ */

// Helper function that tries multiple selector options and returns the first element found.
function pick(/* ...selectors */) {                       // Define a function named pick that accepts any number of arguments (selectors).
  for (let i = 0; i < arguments.length; i++) {            // Loop through each provided selector argument.
    const el = document.querySelector(arguments[i]);      // Use querySelector to try to find an element that matches the current selector.
    if (el) return el;                                    // If an element is found, return it immediately.
  }
  return null;                                            // If none of the selectors matched, return null.
}

// Define commonly used DOM elements using tolerant selectors (so you don't have to edit HTML).
// These try a few id/name/class combinations that are typical in starter HTML files.
const el = {                                              // Create an object 'el' to store references to elements we need.
  timer:        pick('#timer', '#countdown', '.timer'),   // Display area for the mm:ss countdown.
  tickets:      pick('#tickets', '#numTickets', '[name="tickets"]', '#ticketQty'), // Input where user enters ticket count.
  ticketsErr:   pick('#ticketsError', '.tickets-error', '[data-error="tickets"]'), // Span/div to show ticket validation errors.
  total:        pick('#total', '#totalCost', '.total', '[data-total]'),            // Element to display formatted total cost.
  contactWrap:  pick('#contactInfo', '#contact', '.contact-info', '[data-section="contact"]'), // Wrapper for contact fields that is hidden until valid ticket count.
  name:         pick('#name', '#custName', '[name="name"]', '#fullName'),         // Input for customer name.
  nameErr:      pick('#nameError', '.name-error', '[data-error="name"]'),         // Error message holder for name.
  email:        pick('#email', '#custEmail', '[name="email"]', '#buyerEmail'),    // Input for email address.
  emailErr:     pick('#emailError', '.email-error', '[data-error="email"]'),      // Error message holder for email.
  calcBtn:      pick('#calcBtn', '#btnCalc', '.btn-calc', '[data-action="calc"]'),// Button that triggers calculateTotal (if present).
  buyBtn:       pick('#buyBtn', '#purchaseBtn', '.btn-purchase', '[data-action="buy"]') // Button that triggers completePurchase.
};

// Ticket price in dollars – adjust if your assignment specifies another price.
const TICKET_PRICE = 25;                                  // Constant price per ticket used for calculation.

// Minimum and maximum tickets allowed, based on the spec (1–3 tickets).
const MIN_TICKETS = 1;                                    // Lowest allowed ticket quantity.
const MAX_TICKETS = 3;                                    // Highest allowed ticket quantity.

// Create variables for the countdown timer logic.
let remainingSeconds = 10 * 60;                           // Start with 10 minutes converted to seconds (10 * 60 = 600).
let timerId = null;                                       // Will store the interval ID returned by setInterval so we can stop it later.

/* ------------------------------
   STYLING HELPERS FOR FEEDBACK
   ------------------------------ */

// Apply or clear an error style on a given input element and set its accompanying message text.
function setFieldState(inputEl, errorEl, hasError, message) { // Define a function to style an input and set its error message.
  if (!inputEl) return;                                  // If the input element is missing, safely exit (prevents runtime errors).
  inputEl.style.backgroundColor = hasError ? '#ffe4e6' : ''; // Change background to light red if error, otherwise reset.
  inputEl.setAttribute('aria-invalid', hasError ? 'true' : 'false'); // Set ARIA invalid state for accessibility tools.
  if (errorEl) errorEl.textContent = hasError ? message : ''; // If there is a dedicated error element, set its text or clear it.
}

// Show or hide an element (e.g., the contact info section) by toggling the hidden attribute and inline display.
function setVisible(elRef, show) {                       // Define a function to show/hide a given element.
  if (!elRef) return;                                    // If the element doesn't exist, exit early.
  elRef.style.display = show ? '' : 'none';              // Set display to '' (default) when showing, 'none' when hiding.
  elRef.hidden = !show;                                  // Also toggle the HTML hidden attribute for good measure and accessibility.
}

/* ------------------------------
   CORE FUNCTIONS (SPEC ITEMS)
   ------------------------------ */

// Item #1: Calculate Total – validate tickets, compute total, control contact section visibility.
function calculateTotal() {                               // Define the function that computes total and handles ticket validation.
  const raw = el.tickets ? el.tickets.value.trim() : '';  // Read the raw input value from the tickets field, trimming whitespace.
  const qty = Number(raw);                                // Convert the raw value to a Number for numeric checks.

  const notNumber = raw === '' || isNaN(qty);             // Determine if the entry is blank or not a number using isNaN per spec.
  const outOfRange = !notNumber && (qty < MIN_TICKETS || qty > MAX_TICKETS); // Check if the numeric value is outside the 1–3 range.

  if (notNumber || outOfRange) {                          // If the value is invalid in any way...
    setFieldState(el.tickets, el.ticketsErr, true,        // Apply error styling/message to the tickets field.
      `Enter a number between ${MIN_TICKETS} and ${MAX_TICKETS}.`); // Message shown next to the tickets input.
    if (el.total) el.total.textContent = '$0.00';         // Reset the total display to $0.00.
    setVisible(el.contactWrap, false);                    // Hide the contact info section until a valid number is entered.
    return;                                               // Exit the function since there is nothing more to do.
  }

  setFieldState(el.tickets, el.ticketsErr, false, '');    // Clear any previous error state on the tickets field.
  const total = qty * TICKET_PRICE;                       // Compute the total cost as quantity times the fixed price.
  const formatted = `$${total.toFixed(2)}`;               // Format with a leading $ and exactly two decimals per requirement.
  if (el.total) el.total.textContent = formatted;         // Show the formatted total in the total display element.
  setVisible(el.contactWrap, true);                       // Reveal the contact info section now that ticket quantity is valid.
}

// Item #2: Complete Purchase – validate name/email; if valid, thank the user and stop timer.
function completePurchase() {                              // Define the function that finalizes the purchase when user clicks Buy.
  const nameVal = el.name ? el.name.value.trim() : '';     // Read and trim the user's name input.
  const emailVal = el.email ? el.email.value.trim() : '';  // Read and trim the user's email input.
  let hasError = false;                                    // Track whether any validation error has occurred.

  if (nameVal === '') {                                    // If the name is blank...
    setFieldState(el.name, el.nameErr, true, 'Please enter your name.'); // Set error state and message for the name field.
    hasError = true;                                       // Record that an error exists.
  } else {                                                 // Otherwise (name present)...
    setFieldState(el.name, el.nameErr, false, '');         // Clear error state and message for the name field.
  }

  // Simple email pattern: at least one non-space char, an @, then at least one dot segment.
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal); // Test the email against a basic conventional pattern.
  if (!emailVal || !emailOk) {                             // If email is blank or doesn't match the pattern...
    setFieldState(el.email, el.emailErr, true, 'Please enter a valid email address.'); // Set error state and message for email field.
    hasError = true;                                       // Record that an error exists.
  } else {                                                 // Otherwise (email looks valid)...
    setFieldState(el.email, el.emailErr, false, '');       // Clear error state and message for the email field.
  }

  // Also ensure tickets are still valid (in case user changed them after calculation).
  const qty = el.tickets ? Number(el.tickets.value.trim()) : 0; // Convert ticket count to a number again for safety.
  if (isNaN(qty) || qty < MIN_TICKETS || qty > MAX_TICKETS) { // Validate quantity once more according to the rules.
    calculateTotal();                                      // Re-use calculateTotal to show appropriate error and hide contact section.
    hasError = true;                                       // Record that an error exists.
  }

  if (hasError) return;                                    // If any errors were found, exit and let user correct inputs.

  const total = qty * TICKET_PRICE;                        // Compute the final total to show in the thank-you alert.
  const formatted = `$${total.toFixed(2)}`;                // Format total with two decimals and a dollar sign.

  if (timerId) {                                           // If the countdown timer is currently running...
    clearInterval(timerId);                                // Stop the timer since the purchase is being completed.
    timerId = null;                                        // Clear the ID reference to indicate it is no longer active.
  }

  alert(`Thank you for your purchase of ${qty} ticket(s) totaling ${formatted}!`); // Alert a friendly confirmation per the spec.
}

/* -------------------------------------
   EVENT LISTENERS / WIRING / SHORTCUTS
   ------------------------------------- */

// If the tickets input exists, validate and compute on blur and on input changes for responsiveness.
if (el.tickets) {                                         // Check that the tickets input element exists before adding listeners.
  el.tickets.addEventListener('input', calculateTotal);   // As the user types, attempt to validate and update the total.
  el.tickets.addEventListener('blur', calculateTotal);    // Also validate when the field loses focus for accessibility/screen readers.
}

// If there is an explicit calculate button, wire it to the calculateTotal function.
if (el.calcBtn) {                                         // If a button for calculation exists...
  el.calcBtn.addEventListener('click', function (e) {     // Add a click handler to the button.
    e.preventDefault();                                   // Prevent default form submission behavior if inside a form.
    calculateTotal();                                     // Call the calculateTotal function to process the quantity.
  });
}

// Wire the purchase button to completePurchase.
if (el.buyBtn) {                                          // If a purchase button exists...
  el.buyBtn.addEventListener('click', function (e) {      // Add a click handler to that button.
    e.preventDefault();                                   // Prevent default form submission so our JS runs first.
    completePurchase();                                   // Call the completePurchase function to validate and finish.
  });
}

/* -------------------------------
   COUNTDOWN TIMER (GLOBAL CODE)
   ------------------------------- */

// Function to render the MM:SS display into the timer element each second.
function renderTime() {                                   // Define a function that updates the visible countdown clock.
  if (!el.timer) return;                                  // If there is no timer element in the HTML, do nothing gracefully.
  const minutes = Math.floor(remainingSeconds / 60);      // Compute remaining full minutes by dividing seconds by 60.
  const seconds = remainingSeconds % 60;                  // Compute remaining seconds by using the modulo operator.
  const pad = seconds < 10 ? '0' : '';                    // If seconds are less than 10, we need a leading zero per spec.
  el.timer.textContent = `${minutes}:${pad}${seconds}`;   // Update the text inside the timer element in MM:SS format.
}

// Start the countdown timer immediately when this script loads.
renderTime();                                             // Render the initial time so the user sees 10:00 immediately.
timerId = setInterval(function () {                       // Create a repeating 1-second interval and store its ID.
  remainingSeconds--;                                     // Decrease the number of remaining seconds by one each tick.
  renderTime();                                           // Update the timer display after the decrement.
  if (remainingSeconds <= 0) {                            // If the time has reached zero or below...
    clearInterval(timerId);                               // Stop the interval so it no longer runs.
    timerId = null;                                       // Clear the reference to indicate it is stopped.
    alert('Your session timer has expired.');             // Alert the user that their timer has expired per the spec.
    location.href = location.href;                        // Reload/redirect the user back to the same page using location.href.
  }
}, 1000);                                                 // Run the interval every 1000 milliseconds (1 second).

/* -------------------------------
   INITIAL UI STATE
   ------------------------------- */

// Hide the contact section by default until the user enters a valid ticket quantity.
setVisible(el.contactWrap, false);                        // Ensure the contact information section starts hidden.
