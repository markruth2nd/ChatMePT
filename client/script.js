import bot from './assets/bot.svg'
import user from './assets/user.svg'

//the below is const in connecting to the form element I added in the html
const form = document.querySelector('form');
//the below is const in connecting to the div I added in the html with the ID of chat_container
const chatContainer = document.querySelector('#chat_container');

//This variable has been created outside of the function loader but will be used within the loader function. This is so that it can be called outside of the function.
let loadInterval;

//The below loader function will be the 3 dots which appear while the ChatGPT App is loading the answers to my questions or queries as you would see on most messaging apps while someone or something is loading txt. the function will load a dot every 300 milliseconds and if the function gets to 4 dots, it will reset to 0 dots and start again.
function loader(element) {
    element.textContent = ""

    loadInterval = setInterval(() => {
        element.textContent += ".";

        if(element.textContent === "....") {
        element.textContent = "";
        }
    }, 300);
}

//The below function will add the received text from the chatGPT API and place it within me element. To help make the receipt of the text feel more human like or more interactive towards the human using it, I have added a function within the typeText function which will add a character of the received API text every 20 milliseconds, this is the setInterval function in the interval variable.
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

//I have learned that when we use chatGPT, we will need to give each response an ID so to do this I will create a function which will generate a unique ID for each response given by chatGPT. The below function will use 2 parameters to create each unique ID, a date and time stamp as well as a random number generated within javascript. 
function generateUniqueId() {
  //The below const will use Date.now function built within Javascript
    const timeStamp = Date.now();

    //Then I will need to create a random number using Math.random function which is built within Javascript and the secondly I will create another const to turn that random number into a 16 digit bumber using the .toString function built within Javascript.
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    //The below will then use the generated numbers above and return the generated unique number as my generatedUniqueId.
    return `id-${timeStamp}-${hexadecimalString}`;
}


//To create a clearer user interface so we can easily identify whether the text displayed is the AI(ChatGPT response) or the users text, I will create a function which will identify if it is the AI which is the source and if it is not, then it will be identified as the users text. This function will also create the div which will be returned in the html and displayed in the chat with a uniqueID. At first I had issues getting this function to work due to missing out the backticks at the beginning and end of the div's sections
function chatStripe (isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
            <img 
            src="${isAi ? bot : user}" 
            alt="${isAi ? 'bot' : 'user'}" 
            />
            </div>
            <div class="message" id=${uniqueId}> ${value} </div>
        </div>
        </div>
        `
    )
}


//the below function will be used to submit the user's text from the form element within the html code using the 'async' event function within javascript. I called the form element earlier using the document.querySelector at the top of this file. We will need to ensure that the submit does not refresh the page so will use the preventDefult() to prevent this.
const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    //Users chatstripe
    //the below will add the users input message to the chatContainer div I added in the index.html as a chatstripe, this is done in the data.get('prompt'). It also identifies it is the users input as it says 'false'.
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    //the below will clear the users input area once they submit their last inserted text
    form.reset();

  //Bot's chatstripe
  //The below will add the AI's response to the chatContainer div I created in the index.html file, this is identified as the AI's response as it says 'true'.
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    //To ensure the latest message or response is always auto in users view I use the below scroll control. EI this will put the new message in view
    chatContainer.scrollTop = chatContainer.scrollHeight;

    //Next I will need to fetch the new created element to be displayed in the html code and therefore displayed on the page.
    const messageDiv = document.getElementById(uniqueId)

    //The below is the loader function I created earlier which will turn on the loader
    loader(messageDiv)

  /* NOW I HAVE CREATED THE SERVER FOLDER AND SERVER.JS FILE I WILL ADD FURTHER CODE TO FETCH DATA FROM THE SERVER WHICH WILL BE THE BOTS RESPONSES */

//The below is the AI API response function which uses the await function in Javascript as well as the fetch function which will fetch the response from my localhost server
    const response = await fetch('http://localhost:5374', {
        //The below is the bject which contains all of the options from my server response
        method: 'POST',
        //The below is the second object for my contect-type
        headers: {
        'Content-Type': 'application/json'
    },
    //The below will pass the servers (AI API) response to the body of my webpage using JavaScripts JSON.stringify method
    body: JSON.stringify({
        prompt: data.get('prompt')
        })
    })
  //Once I have the above response I will clear the interval function I created earlier using the below:
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log({ parsedData })

    typeText(messageDiv, parsedData);
    }
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong..?";

    alert(err)
}

/* ALL BELOW CODE WAS ADDED BEFORE COMLETING THE SERVER FOLDER & CODE */


//The below is calling the handleSubmit function when the user selects submit
form.addEventListener('submit', handleSubmit)

//I also want the form to be able to submit if the user presses the Enter key 
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
