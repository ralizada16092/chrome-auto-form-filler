document.addEventListener("DOMContentLoaded", function () {
    // Customizable Data Fields
    const fieldNameInput = document.getElementById("fieldName");
    const fieldValueInput = document.getElementById("fieldValue");
    const addFieldButton = document.getElementById("addField");
    const fieldList = document.getElementById("fieldList");

    // Profile Switching
    const profileNameInput = document.getElementById("profileName");
    const saveProfileButton = document.getElementById("saveProfile");
    const profileSelector = document.getElementById("profileSelector");
    const loadProfileButton = document.getElementById("loadProfile");

    // Job Application Tracking
    const companyInput = document.getElementById("company");
    const jobTitleInput = document.getElementById("jobTitle");
    const applicationDateInput = document.getElementById("applicationDate");
    const statusInput = document.getElementById("status");
    const addApplicationButton = document.getElementById("addApplication");
    const applicationList = document.getElementById("applicationList");

    const jobTitleInputCoverLetter = document.getElementById("jobTitle");
    const companyNameInputCoverLetter = document.getElementById("companyName");
    const generateCoverLetterButton = document.getElementById("generateCoverLetter");
    const coverLetterTextarea = document.getElementById("coverLetter");
    const saveCoverLetterButton = document.getElementById("saveCoverLetter");
    const savedCoverLettersList = document.getElementById("savedCoverLetters");
    const exportDataButton = document.getElementById("exportData");
    const importDataButton = document.getElementById("importData");
  
    function renderFields() {
        const fields = JSON.parse(localStorage.getItem("customFields")) || [];
        fieldList.innerHTML = ""; // Clear the list

        fields.forEach((field, index) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";

            listItem.innerHTML = `
                <span>${field.name}: ${field.value}</span>
                <button data-index="${index}" class="deleteField">Delete</button>
            `;

            fieldList.appendChild(listItem);
        });

        document.querySelectorAll(".deleteField").forEach((button) => {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                deleteField(index);
            });
        });
    }

    function linkedinLogin() {
        console.log("LinkedIn login clicked");

        IN.User.authorize(function() {
            loadLinkedInProfile();
        });
    }

    // Function to load LinkedIn profile data
    function loadLinkedInProfile() {
        IN.API.Raw("/people/~:(id,first-name,last-name,headline,location,picture-url)").result(function(profile) {
            console.log("LinkedIn Profile:", profile);

            alert(`Welcome, ${profile.firstName} ${profile.lastName}!`);

            localStorage.setItem("linkedinProfile", JSON.stringify(profile));

            fieldNameInput.value = profile.firstName;
            fieldValueInput.value = profile.lastName;

            
        }).error(function(error) {
            console.error("Error fetching LinkedIn profile:", error);
        });
    } //"OpenAI", (Nov22, 2024 version), https://chatgpt.com/share/674c9390-4980-8003-82a6-c30b4dd05bd5
    

    
    function addField() {
        const fieldName = fieldNameInput.value.trim();
        const fieldValue = fieldValueInput.value.trim();

        if (!fieldName || !fieldValue) {
            alert("Both field name and value are required!");
            return;
        }

        const fields = JSON.parse(localStorage.getItem("customFields")) || [];
        fields.push({ name: fieldName, value: fieldValue });

        localStorage.setItem("customFields", JSON.stringify(fields));

        fieldNameInput.value = "";
        fieldValueInput.value = "";
        renderFields();
    }

    function deleteField(index) {
        const fields = JSON.parse(localStorage.getItem("customFields")) || [];
        fields.splice(index, 1);

        localStorage.setItem("customFields", JSON.stringify(fields));
        renderFields();
    }

    function saveProfile() {
        const profileName = profileNameInput.value.trim();
        if (!profileName) {
            alert("Profile name is required!");
            return;
        }

        const profiles = JSON.parse(localStorage.getItem("profiles")) || {};
        profiles[profileName] = { fields: JSON.parse(localStorage.getItem("customFields")) || [] };

        localStorage.setItem("profiles", JSON.stringify(profiles));
        profileNameInput.value = "";
        renderProfiles();
    }

    
    function renderProfiles() {
        const profiles = JSON.parse(localStorage.getItem("profiles")) || {};
        profileSelector.innerHTML = "<option value='' disabled selected>Select a profile...</option>";

        Object.keys(profiles).forEach((profileName) => {
            const option = document.createElement("option");
            option.value = profileName;
            option.textContent = profileName;
            profileSelector.appendChild(option);
        });
    }

    function loadProfile() {
        const profileName = profileSelector.value;
        if (!profileName) {
            alert("Please select a profile!");
            return;
        }

        const profiles = JSON.parse(localStorage.getItem("profiles")) || {};
        const profile = profiles[profileName];
        if (profile) {
            localStorage.setItem("customFields", JSON.stringify(profile.fields));
            renderFields();
        }
    }


    async function generateCoverLetter() {
        const jobTitle = jobTitleInputCoverLetter.value.trim();
        const companyName = companyNameInputCoverLetter.value.trim();

        if (!jobTitle || !companyName) {
            coverLetterTextarea.value = "Please provide both the job title and company name.";
            return;
        }

        coverLetterTextarea.value = "Generating cover letter...";

        const apiKey = "AIzaSyCCpR8haZaNlG5Tx3rUzMzzWuyDcrFkULI"; 
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

        const prompt = `Write a professional cover letter for the job title "${jobTitle}" at the company "${companyName}". Include details like passion for the industry, skills, and enthusiasm for joining the company.`;

        const payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        };

        try {
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API";
            coverLetterTextarea.value = generatedText;
        } catch (error) {
            coverLetterTextarea.value = "Error generating cover letter. Please try again later.";
            console.error(error);
        }
    }

    
    function saveCoverLetter() {
        const coverLetter = coverLetterTextarea.value.trim();
        if (!coverLetter) {
            alert("Please generate a cover letter first.");
            return;
        }

        const savedCoverLetters = JSON.parse(localStorage.getItem("savedCoverLetters")) || [];
        savedCoverLetters.push(coverLetter);
        localStorage.setItem("savedCoverLetters", JSON.stringify(savedCoverLetters));
        renderSavedCoverLetters();
    }

    
    function renderSavedCoverLetters() {
        const savedCoverLetters = JSON.parse(localStorage.getItem("savedCoverLetters")) || [];
        savedCoverLettersList.innerHTML = "";

        savedCoverLetters.forEach((coverLetter, index) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.textContent = coverLetter;

            listItem.contentEditable = true;

            listItem.addEventListener("input", () => {
                savedCoverLetters[index] = listItem.textContent;
                localStorage.setItem("savedCoverLetters", JSON.stringify(savedCoverLetters));
            });

            savedCoverLettersList.appendChild(listItem);
        });
    }

    // Job application tracking
    function addApplication() {
        const company = companyInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const applicationDate = applicationDateInput.value;
        const status = statusInput.value;

        if (!company || !jobTitle || !applicationDate) {
            alert("All fields are required for the application!");
            return;
        }

        const applications = JSON.parse(localStorage.getItem("applications")) || [];
        applications.push({ company, jobTitle, applicationDate, status });
        localStorage.setItem("applications", JSON.stringify(applications));
        companyInput.value = "";
        jobTitleInput.value = "";
        applicationDateInput.value = "";
        renderApplications();
    }

    
    function renderApplications() {
        const applications = JSON.parse(localStorage.getItem("applications")) || [];
        applicationList.innerHTML = "";

        applications.forEach((application) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.textContent = `${application.company} - ${application.jobTitle} - ${application.applicationDate} - ${application.status}`;
            applicationList.appendChild(listItem);
        });
    }
    function exportData() {
        const data = {
            fields: JSON.parse(localStorage.getItem("customFields")) || [],
            profiles: JSON.parse(localStorage.getItem("profiles")) || [],
            applications: JSON.parse(localStorage.getItem("applications")) || [],
            coverLetters: JSON.parse(localStorage.getItem("savedCoverLetters")) || []
        };

        const dataBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(dataBlob);
        link.download = "auto_form_data.json";
        link.click();
    }

    function importData() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = JSON.parse(event.target.result);

                localStorage.setItem("customFields", JSON.stringify(data.fields));
                localStorage.setItem("profiles", JSON.stringify(data.profiles));
                localStorage.setItem("applications", JSON.stringify(data.applications));
                localStorage.setItem("savedCoverLetters", JSON.stringify(data.coverLetters));

                renderFields();
                loadProfiles();
                renderApplications();
                renderSavedCoverLetters();
            };
            reader.readAsText(file);
        });
        input.click();
    }


    // Event listeners for actions
    addFieldButton.addEventListener("click", addField);
    saveProfileButton.addEventListener("click", saveProfile);
    loadProfileButton.addEventListener("click", loadProfile);
    generateCoverLetterButton.addEventListener("click", generateCoverLetter);
    saveCoverLetterButton.addEventListener("click", saveCoverLetter);
    addApplicationButton.addEventListener("click", addApplication);
    loginButton.addEventListener("click",linkedinLogin)
    exportDataButton.addEventListener("click", exportData);
    importDataButton.addEventListener("click", importData);

   
    renderFields();
    renderProfiles();
    renderApplications();
    renderSavedCoverLetters();
});
