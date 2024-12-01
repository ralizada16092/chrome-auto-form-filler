chrome.storage.local.get('userProfile', (data) => {
    if (data.userProfile) {
      const userProfile = data.userProfile;
  
      
      const nameField = document.querySelector('input[name="name"], input#name');
      const emailField = document.querySelector('input[name="email"], input#email');
  
      if (nameField) nameField.value = userProfile.name;
      if (emailField) emailField.value = userProfile.email;
  
      console.log('Form auto-filled with LinkedIn data');
    }
  });
  