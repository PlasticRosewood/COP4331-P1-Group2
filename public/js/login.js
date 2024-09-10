let userId = 0;

function doLogin()
{
    userId = 0;
    let login = document.getElementById("username_field").value;
    let password = document.getElementById("password_field").value;
    
    let tmp = {login:login, password:password};
    let jsonPayload = JSON.stringify( tmp );

    let url = urlBase + '/Login.php';
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse( xhr.responseText );
                userId = jsonObject.id;

                if( userId < 1)
                {
                    // Username or password is incorrect
                    // TODO, inform user
                    return;
                }

                window.location.href = "index.html";

            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        // Do something
    }
}