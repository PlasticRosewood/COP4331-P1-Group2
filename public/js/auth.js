let sessionToken;

//TODO: maybe don't fetch this twice? Idk I don't care enough rn to fix it
// attempt to retreive session token from cookie
// return user to login page on failure
function getSessionToken() {
    let name = 'token=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        sessionToken = c.substring(name.length, c.length);
        return;
      }
    }
    
    //cookie not found; redirect to login page
    window.location.href = '/login.html';
}


