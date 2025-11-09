document.addEventListener('DOMContentLoaded', () => {
    
    // ============================
    // PART 1: INTRO TEXT
    // ============================

    // Declare 3 constant variables for name, age and isStudent
    const name = "Lauren";
    const age = 41;
    const isStudent = true;

    const introduction = (name, age, isStudent) => {
        // Check if isStudent is true or false and set text output
        let studentStatus;
        if (isStudent) {
            studentStatus = "I am currently a student.";
        } else {
