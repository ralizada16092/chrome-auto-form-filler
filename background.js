chrome.runtime.onInstalled.addListener(() => {
    console.log('Auto Form Filler extension installed');
});

chrome.identity.launchWebAuthFlow(
    {
        url: "https://www.linkedin.com/oauth/v2/authorization" +
             "?response_type=token" +
             "&client_id=770qkcsawx0mvv" +
             "&redirect_uri=https://mmffdodkcbgfhdomdehaoohjlfohlbck.chromiumapp.org" +
             "&scope=r_liteprofile%20r_emailaddress",
        interactive: true
    },
    (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
            console.error('OAuth flow failed');
            return;
        }

       
        const accessToken = new URL(redirectUrl).hash.split('&')[0].split('=')[1];

        fetch('https://api.linkedin.com/v2/me', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => response.json())
        .then(data => {
            const userProfile = {
                name: data.firstName.localized.en_US + " " + data.lastName.localized.en_US,
                email: '', 
            };

            chrome.storage.local.set({ 'userProfile': userProfile }, () => {
                console.log('User profile saved:', userProfile);
            });

            // Fetch the email
            fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
            .then(response => response.json())
            .then(emailData => {
                const email = emailData.elements[0]['handle~'].emailAddress;
                chrome.storage.local.set({ 'userEmail': email }, () => {
                    console.log('User email saved:', email);
                });
            });
        })
        .catch(err => {
            console.error('Error fetching LinkedIn profile:', err);
        });
    }
);
