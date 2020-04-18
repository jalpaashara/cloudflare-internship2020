addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
});
/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function handleRequest(request) {
    let arrVariantsURL, randomVariant, response, index;

    //Fetch Variants URL from variants
    await fetchVariantsURL('https://cfw-takehome.developers.workers.dev/api/variants')
        .then(data => { arrVariantsURL=data; });

    //Get cookie
    const cookieStr = request.headers.get('cookie');
    const indexCookie = getCookie(cookieStr,'index');

    /*
        Check if cookie is present then use the cookie index else get Variant index
        fetch from array of Varaints URL based on index we got in the step above
        create a response and if cookie is not present then set header for 'Set-Cookie'
     */
    if (indexCookie != null) {
        index = parseInt(indexCookie);
        randomVariant = await fetch(arrVariantsURL[index]);
        response =  new Response(randomVariant.body, randomVariant);
    } else {
        index = getRandomVariantIndex(arrVariantsURL);
        randomVariant = await fetch(arrVariantsURL[index]);
        response =  new Response(randomVariant.body, randomVariant);

        //Setting Expiry Date(1 hour) on the cookie
        const d = new Date();
        d.setTime(d.getTime() + (60 * 60 * 1000));
        const expires = "Expires=" + d;

        //Value for 'Set-Cookie'
        const cookieValue =  'index=' + index.toString() + '; ' + expires + '; Path=/; SameSite=Lax';

        response.headers.set('Set-Cookie', cookieValue);
    }


    //Transforming the response for each Variant URL
    if(index==0)
        return new HTMLRewriter().on('*', new Variant1Handler()).transform(response);

    else
        return new HTMLRewriter().on('*', new Variant2Handler()).transform(response);
}

async function fetchVariantsURL(url){
    return await fetch(url)
        .then((response) => {
            return response.json();
        }).then(data => { return data.variants; });
}

function getRandomVariantIndex(arrVariants){
    return Math.floor(Math.random() * arrVariants.length);
}

class Variant1Handler {
    element(element) {
        // An incoming element, such as `div`
        //console.log(`Incoming element: ${element.tagName}`);

        // title
        if (element.tagName == "title") {
            element.setInnerContent("Portfolio");
        }

        // h1.title
        if (element.tagName == "h1" && element.hasAttribute("id", "title")) {
            element.setInnerContent("Portfolio");
        }

        // p.description
        if (element.tagName == "p" && element.hasAttribute("id", "description")) {
            element.setInnerContent("My Portfolio");
        }

        // a.url
        if (element.tagName == "a" && element.hasAttribute("id", "url")) {
            element.setInnerContent("Click to check out my portfolio");
            element.setAttribute("href", "https://webpage.pace.edu/ja57884n/CS641_Assignment_Week3/portfolio.html");
            element.setAttribute("target", "_blank");
        }
    }
}

class Variant2Handler{
    element(element) {

        // title
        if (element.tagName == "title") {
            element.setInnerContent("Shopbud");
        }

        // h1#title
        if (element.tagName == "h1" && element.hasAttribute("id", "title")) {
            element.setInnerContent("Shopbud");
        }

        // p#description
        if (element.tagName == "p" && element.hasAttribute("id", "description")) {
            element.setInnerContent("Shopbud is a mobile web application that compares prices accross ecommerce websites such as best buy and ebay");
        }

        // a#url
        if (element.tagName == "a" && element.hasAttribute("id", "url")) {
            element.setInnerContent("Click to go to Shopbud");
            element.setAttribute("href", "https://webpage.pace.edu/ja57884n/shopbud/www/");
            element.setAttribute("target", "_blank");
        }
    }
}

function getCookie(str, key) {
    if (str) {
        let cookies = str.split('; ');
        for(let c of cookies){
            let cookieName = c.split('=');
            if(cookieName[0] === key){
                return cookieName[1];
            }
        }
    }
    return null;
}
